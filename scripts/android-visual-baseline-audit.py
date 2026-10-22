#!/usr/bin/env python3
"""Fail closed when the native Android screenshot baseline is incomplete.

Checks files captured from an installed APK. This does not judge artistic
quality, full campaign progression, or real-device accessibility.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import struct
import zlib
from pathlib import Path

PNG_SIG = b'\x89PNG\r\n\x1a\n'
SIZES = {
    'compact-360x640': (720, 1280),
    'regular-412x915': (1080, 2400),
}
BASE_CAPTURES = (
    'save-select', 'new-campaign', 'resumed', 'kingdom-guidance',
    'campaign', 'battle-prep', 'battle-tutorial', 'battle-active',
    'victory', 'results', 'results-unobscured',
    'results-light', 'results-charcoal', 'results-dark-restored',
    'persisted-save',
)
SUPPLEMENTAL = (
    'kingdom-dark', 'kingdom-light', 'kingdom-charcoal',
    'settlement-dark', 'formation-dark', 'wagon-dark', 'army-dark',
    'campaign-postbattle-dark',
)
THEME_SCREENS = (
    ('light', 'results-light'),
    ('original', 'results-charcoal'),
    ('dark', 'results-dark-restored'),
)


def require(condition: object, message: str) -> None:
    if not condition:
        raise ValueError(message)


def inspect_png(path: Path, expected: tuple[int, int]) -> str:
    """Verify actual PNG bytes, dimensions, chunk CRC and terminal IEND."""
    require(path.is_file(), 'Screenshot missing: ' + str(path))
    raw = path.read_bytes()
    require(len(raw) > 1024 and raw.startswith(PNG_SIG),
            'Missing/invalid PNG signature or suspiciously short image: ' + path.name)
    offset = len(PNG_SIG)
    dims = None
    saw_idat = False
    ended = False

    while offset + 12 <= len(raw):
        length = struct.unpack_from('>I', raw, offset)[0]
        require(length <= len(raw) - offset - 12,
                'Truncated PNG chunk: ' + path.name)
        name = raw[offset + 4:offset + 8]
        payload = raw[offset + 8:offset + 8 + length]
        crc = struct.unpack_from('>I', raw, offset + 8 + length)[0]
        require((zlib.crc32(name + payload) & 0xFFFFFFFF) == crc,
                'PNG CRC failure: ' + path.name)
        if name == b'IHDR':
            require(dims is None and length == 13, 'Invalid PNG header: ' + path.name)
            dims = struct.unpack_from('>II', payload)
        if name == b'IDAT':
            saw_idat = True
        offset += 12 + length
        if name == b'IEND':
            ended = True
            break

    require(ended and offset == len(raw) and dims == expected and saw_idat,
            'Incomplete PNG or incorrect screenshot resolution: ' + path.name +
            ' expected ' + str(expected) + ' got ' + str(dims))
    return hashlib.sha256(raw).hexdigest()


def audit(folder: Path, source: Path) -> dict:
    report_path = folder / 'smoke-report.json'
    require(report_path.is_file(), 'Native smoke report is missing')
    report = json.loads(report_path.read_text(encoding='utf-8'))
    require(report.get('status') == 'passed' and report.get('native_emulator') is True,
            'Native emulator smoke did not pass')
    require(report.get('combat_verified') is True,
            'First real battle was not verified')
    require(report.get('physical_device_verified') is False,
            'Do not mislabel emulator evidence as physical-device acceptance')
    battles = report.get('battles')
    require(isinstance(battles, list) and len(battles) == len(SIZES),
            'Expected two native display-profile reports')

    require(source.is_file(), 'Missing build source SHA evidence')
    sha = source.read_text(encoding='utf-8').strip()
    require(re.fullmatch(r'[a-fA-F0-9]{40}', sha),
            'Source commit must be a 40-character SHA, never an unverified label')

    files: list[str] = []
    for battle, (profile, dimensions) in zip(battles, SIZES.items()):
        require(battle.get('viewport') == profile and
                battle.get('encounter') == 'hold_the_road' and
                battle.get('victory') is True and battle.get('results') is True,
                'Wrong viewport / missing native battle result: ' + profile)
        require(battle.get('supplemental_capture_errors') == [],
                'Supplemental native captures had errors: ' +
                str(battle.get('supplemental_capture_errors')))
        expected_supplemental = [profile + '-' + name + '.png' for name in SUPPLEMENTAL]
        require(battle.get('supplemental_captures') == expected_supplemental,
                'Supplemental screenshots absent, incomplete or out of order: ' + profile)
        expected_themes = [
            {'expected_theme_id': theme, 'screenshot': profile + '-' + name + '.png'}
            for theme, name in THEME_SCREENS
        ]
        require(battle.get('theme_captures') == expected_themes,
                'Results theme cycle not fully recorded: ' + profile)

        hashes: dict[str, str] = {}
        for name in (*BASE_CAPTURES, *SUPPLEMENTAL):
            filename = profile + '-' + name + '.png'
            hashes[name] = inspect_png(folder / filename, dimensions)
            files.append(filename)

        # Identical theme captures indicate a broken theme cycle or copied art.
        for group in (('kingdom-dark', 'kingdom-light', 'kingdom-charcoal'),
                      ('results-light', 'results-charcoal', 'results-dark-restored')):
            require(len({hashes[name] for name in group}) == len(group),
                    'Identical theme screenshots in ' + profile + ': ' + str(group))

    return {
        'status': 'passed',
        'source_commit': sha,
        'android_emulator_only': True,
        'physical_device_accepted': False,
        'battle_smoke_verified': True,
        'screenshots_verified': len(files),
        'profiles': list(SIZES),
        'captures': files,
        'limitations': 'Opening Human only; no boss, mid/late faction or physical device acceptance',
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--out', type=Path, required=True,
                        help='Directory containing native smoke-report.json and screenshots')
    parser.add_argument('--source', type=Path, required=True,
                        help='Git commit SHA file written by Android build workflow')
    args = parser.parse_args()
    evidence = audit(args.out, args.source)
    target = args.out / 'screenshot-baseline-audit.json'
    target.write_text(json.dumps(evidence, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({
        'status': evidence['status'],
        'source_commit': evidence['source_commit'],
        'screenshots_verified': evidence['screenshots_verified'],
        'profiles': evidence['profiles'],
        'physical_device_accepted': False,
    }, indent=2))


if __name__ == '__main__':
    main()
