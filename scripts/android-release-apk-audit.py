#!/usr/bin/env python3
"""Validate actual release APK metadata emitted by Android aapt.

This is a pre-release guard, not a substitute for device tests, Play signing,
store review, physical-device QA or edge-to-edge visual inspections.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

EXPECTED_PACKAGE = "com.elroybenjamins.cartcrown"
MINIMUM_TARGET_SDK = 36


def _quoted(field: str, text: str) -> str | None:
    match = re.search(r"(?:^|\n)" + re.escape(field) + r":'([^']+)'", text)
    return match.group(1) if match else None


def _package_attribute(name: str, text: str) -> str | None:
    match = re.search(r"^package:\s+.*?\b" + re.escape(name) + r"='([^']*)'", text, re.MULTILINE)
    return match.group(1) if match else None


def audit_badging(text: str) -> dict[str, object]:
    package = _package_attribute("name", text)
    code = _package_attribute("versionCode", text)
    version = _package_attribute("versionName", text)
    sdk = _quoted("sdkVersion", text)
    target = _quoted("targetSdkVersion", text)
    label = _quoted("application-label", text)
    errors: list[str] = []

    if package != EXPECTED_PACKAGE:
        errors.append("APK package mismatch: " + repr(package))
    if not code or not code.isdecimal() or int(code) < 1:
        errors.append("Missing or invalid positive Android versionCode")
    if not version or not version.strip():
        errors.append("Missing Android versionName")
    if not sdk or not sdk.isdecimal():
        errors.append("Missing Android min SDK metadata")
    if not target or not target.isdecimal():
        errors.append("Missing Android target SDK metadata")
    elif int(target) < MINIMUM_TARGET_SDK:
        errors.append("APK target SDK is below 36: " + target)
    elif sdk and sdk.isdecimal() and int(sdk) > int(target):
        errors.append("APK min SDK cannot exceed its target SDK")
    if not label or not label.strip():
        errors.append("Application label missing")
    # A game for release must contain a literal ABI tag for a 64-bit runtime;
    # verified independently from the actual packaged .so files in CI.
    abis = re.search(r"^native-code:(.*)$", text, re.MULTILINE)
    abi_list = re.findall(r"'([^']+)'", abis.group(1)) if abis else []
    if "arm64-v8a" not in abi_list:
        errors.append("64-bit ARM code missing from APK metadata")
    return {
        "package": package,
        "versionCode": int(code) if code and code.isdecimal() else None,
        "versionName": version,
        "minSdk": int(sdk) if sdk and sdk.isdecimal() else None,
        "targetSdk": int(target) if target and target.isdecimal() else None,
        "label": label,
        "abis": abi_list,
        "passed": not errors,
        "issues": errors,
        "scope": "APK manifest metadata only; native launch, save restore and store signing are separate gates",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--badging", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    result = audit_badging(args.badging.read_text(encoding="utf-8"))
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))
    if not result["passed"]:
        raise SystemExit("Release APK metadata audit failed: " + "; ".join(result["issues"]))


if __name__ == "__main__":
    main()
