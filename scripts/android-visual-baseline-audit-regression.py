#!/usr/bin/env python3
"""Regression tests for missing, mis-sized and fraudulent native baseline evidence."""
from __future__ import annotations

import importlib.util
import json
import struct
import tempfile
import zlib
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location(
    'android_visual_baseline_audit', HERE / 'android-visual-baseline-audit.py')
assert spec and spec.loader
audit_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit_module)


def chunk(name: bytes, payload: bytes) -> bytes:
    return (struct.pack('>I', len(payload)) + name + payload +
            struct.pack('>I', zlib.crc32(name + payload) & 0xFFFFFFFF))


def test_png(width: int, height: int, nonce: str) -> bytes:
    # Real valid RGB PNG: each row begins with filter 0, then 3 color bytes
    # per pixel. Test-only metadata keeps files above minimum size threshold.
    rows = ((b'\x00' + b'\x00' * (3 * width)) * height)
    header = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    return (
        audit_module.PNG_SIG + chunk(b'IHDR', header) +
        chunk(b'tEXt', b'QA\x00' + nonce.encode() + b'A' * 1500) +
        chunk(b'IDAT', zlib.compress(rows)) + chunk(b'IEND', b'')
    )


def must_fail(func, phrase: str) -> None:
    try:
        func()
    except ValueError as error:
        assert phrase.lower() in str(error).lower(), (phrase, str(error))
        return
    raise AssertionError('Expected evidence failure containing ' + phrase)


def main() -> None:
    # Tiny image profiles allow exercising the same complete manifest without
    # creating 46 full-resolution 1080x2400 pixel arrays in CI.
    audit_module.SIZES = {
        'compact-360x640': (20, 30),
        'regular-412x915': (25, 40),
    }
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        smoke = root / 'smoke'
        smoke.mkdir()
        source = root / 'source-commit.txt'
        source.write_text('a' * 40 + '\n', encoding='utf-8')
        report = {
            'status': 'passed', 'native_emulator': True,
            'combat_verified': True, 'physical_device_verified': False,
            'battles': []
        }
        for profile, (width, height) in audit_module.SIZES.items():
            report['battles'].append({
                'viewport': profile,
                'encounter': 'hold_the_road',
                'victory': True, 'results': True,
                'theme_captures': [
                    {'expected_theme_id': theme,
                     'screenshot': profile + '-' + name + '.png'}
                    for theme, name in audit_module.THEME_SCREENS
                ],
                'supplemental_captures': [
                    profile + '-' + name + '.png'
                    for name in audit_module.SUPPLEMENTAL
                ],
                'supplemental_capture_errors': [],
            })
            for name in (*audit_module.BASE_CAPTURES, *audit_module.SUPPLEMENTAL):
                (smoke / (profile + '-' + name + '.png')).write_bytes(
                    test_png(width, height, profile + name)
                )

        report_path = smoke / 'smoke-report.json'
        report_path.write_text(json.dumps(report), encoding='utf-8')
        assert audit_module.audit(smoke, source)['screenshots_verified'] == 46

        profile = 'compact-360x640'
        missing = smoke / (profile + '-army-dark.png')
        previous = missing.read_bytes()
        missing.unlink()
        must_fail(lambda: audit_module.audit(smoke, source), 'Screenshot missing')
        missing.write_bytes(previous)

        wrong_resolution = smoke / (profile + '-wagon-dark.png')
        previous = wrong_resolution.read_bytes()
        wrong_resolution.write_bytes(test_png(11, 22, 'wrong'))
        must_fail(lambda: audit_module.audit(smoke, source), 'resolution')
        wrong_resolution.write_bytes(previous)

        theme_dark = smoke / (profile + '-kingdom-dark.png')
        previous = theme_dark.read_bytes()
        theme_dark.write_bytes((smoke / (profile + '-kingdom-light.png')).read_bytes())
        must_fail(lambda: audit_module.audit(smoke, source), 'Identical theme')
        theme_dark.write_bytes(previous)

        report['battles'][0]['supplemental_capture_errors'] = ['settlement missing']
        report_path.write_text(json.dumps(report), encoding='utf-8')
        must_fail(lambda: audit_module.audit(smoke, source), 'Supplemental native captures')
        report['battles'][0]['supplemental_capture_errors'] = []
        report_path.write_text(json.dumps(report), encoding='utf-8')

        source.write_text('unverified-commit', encoding='utf-8')
        must_fail(lambda: audit_module.audit(smoke, source), '40-character SHA')
        source.write_text('a' * 40, encoding='utf-8')
        assert audit_module.audit(smoke, source)['status'] == 'passed'

    print('PASS: native screenshot baseline evidence requires all 46 genuine PNGs, exact profile resolutions, distinct theme captures, zero navigation errors and a source SHA.')


if __name__ == '__main__':
    main()
