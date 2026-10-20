#!/usr/bin/env python3
"""Offline structural bundle-regression fixtures; no Android SDK required."""
from __future__ import annotations
import importlib.util
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from zipfile import ZipFile, ZIP_STORED

spec = importlib.util.spec_from_file_location(
    "bundle", Path(__file__).with_name("android-play-bundle-audit.py")
)
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

GOOD = {
    "BundleConfig.pb": b"QA config",
    "base/manifest/AndroidManifest.xml": b"QA manifest",
    "base/dex/classes.dex": b"QA bytecode",
    "base/assets/index.android.bundle": b"QA javascript",
    "base/lib/arm64-v8a/libreactnative.so": b"QA elf",
    "base/lib/x86_64/libreactnative.so": b"QA elf",
}


def check_bundle(entries: dict[str, bytes]):
    with TemporaryDirectory() as tmp:
        path = Path(tmp) / "qa.aab"
        with ZipFile(path, "w", ZIP_STORED) as z:
            for name, data in entries.items():
                z.writestr(name, data)
        return module.inspect_aab(path)


class TestPlayBundleStructure(unittest.TestCase):
    def test_complete_bundle_is_structurally_valid(self):
        result = check_bundle(GOOD)
        self.assertTrue(result["passed"], result["issues"])
        self.assertTrue(result["qa_only"])
        self.assertFalse(result["production_signing_verified"])

    def test_missing_manifest_fails(self):
        result = check_bundle({k: v for k, v in GOOD.items() if k != "base/manifest/AndroidManifest.xml"})
        self.assertFalse(result["passed"])

    def test_missing_64bit_arm_runtime_fails(self):
        result = check_bundle({k: v for k, v in GOOD.items() if "arm64-v8a" not in k})
        self.assertFalse(result["passed"])

    def test_missing_embedded_js_fails(self):
        result = check_bundle({k: v for k, v in GOOD.items() if ".bundle" not in k})
        self.assertFalse(result["passed"])

    def test_reject_private_keys_in_bundle(self):
        result = check_bundle({**GOOD, "base/assets/secrets/release.jks": b"key"})
        self.assertFalse(result["passed"])
        self.assertTrue(any("signing-key" in item for item in result["issues"]))

    def test_reject_non_zip(self):
        with TemporaryDirectory() as tmp:
            path = Path(tmp) / "bad.aab"
            path.write_bytes(b"not a zip")
            result = module.inspect_aab(path)
        self.assertFalse(result["passed"])


if __name__ == "__main__":
    unittest.main()
