#!/usr/bin/env python3
"""Inspect a compiled Android App Bundle structurally, without Play credentials.

This verifies bundle architecture and embedded app code, but DOES NOT verify
Google Play signing, Play upload acceptance, a particular versionCode,
runtime behaviour or emulator save restoration.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import zipfile


def inspect_aab(path: Path) -> dict[str, object]:
    problems: list[str] = []
    entries: list[str] = []
    size = path.stat().st_size if path.is_file() else 0
    if not path.is_file() or not zipfile.is_zipfile(path):
        return {
            "passed": False, "issues": ["Not a valid Android App Bundle ZIP"],
            "file_bytes": size, "sha256": None,
        }

    with zipfile.ZipFile(path) as bundle:
        entries = bundle.namelist()
        names = set(entries)
        broken = bundle.testzip()
        if broken:
            problems.append("Corrupted AAB ZIP member: " + broken)
        for required in ("BundleConfig.pb", "base/manifest/AndroidManifest.xml"):
            if required not in names:
                problems.append("Missing mandatory bundle entry: " + required)
        if not any(x.startswith("base/dex/") and x.endswith(".dex") for x in entries):
            problems.append("Base module has no compiled DEX application code")
        if not any(x.startswith("base/assets/") and x.endswith(".bundle") for x in entries):
            problems.append("Base module is missing the embedded React Native JS bundle")
        for abi in ("arm64-v8a", "x86_64"):
            if not any(x.startswith("base/lib/" + abi + "/") and x.endswith(".so") for x in entries):
                problems.append("Missing " + abi + " runtime libraries")
        if any(x.endswith((".jks", ".keystore", ".pem", ".p12", ".key")) for x in entries):
            problems.append("AAB must not contain private signing-key files")
    return {
        "passed": not problems,
        "issues": problems,
        "file_bytes": size,
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "bundle_config": "BundleConfig.pb" in names,
        "base_manifest": "base/manifest/AndroidManifest.xml" in names,
        "arm64": any(x.startswith("base/lib/arm64-v8a/") for x in entries),
        "x86_64": any(x.startswith("base/lib/x86_64/") for x in entries),
        "qa_only": True,
        "production_signing_verified": False,
        "description": "Structural QA bundle only; not approved for Play upload",
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--aab", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    opts = ap.parse_args()
    result = inspect_aab(opts.aab)
    opts.out.parent.mkdir(parents=True, exist_ok=True)
    opts.out.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))
    if not result["passed"]:
        raise SystemExit("Invalid Cart & Crown AAB: " + "; ".join(result["issues"]))


if __name__ == "__main__":
    main()
