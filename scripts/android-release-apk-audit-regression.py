#!/usr/bin/env python3
"""Fixtures for APK metadata review without Android SDK / CI APK."""
from __future__ import annotations
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location(
    "apk_audit", Path(__file__).with_name("android-release-apk-audit.py")
)
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

GOOD = "\n".join([
    "package: name='com.elroybenjamins.cartcrown' versionCode='12' versionName='0.2.0'",
    "sdkVersion:'24'",
    "targetSdkVersion:'36'",
    "application-label:'Cart & Crown'",
    "native-code: 'arm64-v8a' 'x86_64'",
])


class ReleaseMetadataTests(unittest.TestCase):
    def test_valid_android_release_manifest(self):
        result = module.audit_badging(GOOD)
        self.assertTrue(result["passed"], result["issues"])
        self.assertEqual(result["targetSdk"], 36)
        self.assertEqual(result["versionCode"], 12)

    def test_wrong_package_fails(self):
        report = module.audit_badging(GOOD.replace("cartcrown", "othergame"))
        self.assertFalse(report["passed"])
        self.assertTrue(any("package mismatch" in s for s in report["issues"]))

    def test_target_sdk_35_fails(self):
        report = module.audit_badging(GOOD.replace("targetSdkVersion:'36'", "targetSdkVersion:'35'"))
        self.assertFalse(report["passed"])
        self.assertTrue(any("below 36" in s for s in report["issues"]))

    def test_missing_target_is_not_assumed(self):
        report = module.audit_badging(GOOD.replace("targetSdkVersion:'36'\n", ""))
        self.assertFalse(report["passed"])
        self.assertTrue(any("Missing Android target" in s for s in report["issues"]))

    def test_invalid_version_code_fails(self):
        report = module.audit_badging(GOOD.replace("versionCode='12'", "versionCode='0'"))
        self.assertFalse(report["passed"])
        self.assertTrue(any("versionCode" in s for s in report["issues"]))

    def test_missing_64_bit_arch_fails(self):
        report = module.audit_badging(GOOD.replace("'arm64-v8a' ", ""))
        self.assertFalse(report["passed"])
        self.assertTrue(any("64-bit ARM" in s for s in report["issues"]))


if __name__ == "__main__":
    unittest.main()
