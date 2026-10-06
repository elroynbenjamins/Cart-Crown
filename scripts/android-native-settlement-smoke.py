#!/usr/bin/env python3
"""Native portrait visual evidence for the real SettlementScreen from a deterministic showcase save."""
from __future__ import annotations
import argparse, json, re, subprocess, time
from pathlib import Path
from xml.etree import ElementTree

PACKAGE = 'com.elroybenjamins.cartcrown'

def adb(*args: str, check: bool = True, timeout: int = 45) -> str:
    result = subprocess.run(['adb', *args], capture_output=True, text=True, timeout=timeout)
    if check and result.returncode:
        raise RuntimeError(f"adb {args!r}: {result.stdout}\n{result.stderr}")
    return result.stdout.strip()

def launch() -> None:
    component = adb('shell', 'cmd', 'package', 'resolve-activity', '--brief', PACKAGE).splitlines()[-1]
    if not component.startswith(PACKAGE + '/'):
        raise RuntimeError('launcher unresolved: ' + component)
    output = adb('shell', 'am', 'start', '-W', '-n', component)
    if 'Error:' in output:
        raise RuntimeError(output)
    time.sleep(5)

def assert_alive() -> None:
    pid = adb('shell', 'pidof', PACKAGE, check=False)
    if not pid.strip():
        raise RuntimeError('Cart & Crown process is not alive after launch.')

def capture(out: Path, name: str) -> None:
    png = subprocess.run(
        ['adb', 'exec-out', 'screencap', '-p'],
        capture_output=True,
        check=True,
        timeout=25
    ).stdout
    if not png.startswith(b'\x89PNG\r\n\x1a\n'):
        raise RuntimeError('Android did not return a PNG screenshot.')
    (out / (name + '.png')).write_bytes(png)

def tap_accessibility_prefix(prefix: str, fallback: tuple[int, int] | None = None) -> str:
    adb('shell', 'uiautomator', 'dump', '/sdcard/settlement-window.xml', check=False, timeout=25)
    xml = adb('shell', 'cat', '/sdcard/settlement-window.xml', check=False, timeout=25)
    if xml.strip():
        try:
            root = ElementTree.fromstring(xml)
        except ElementTree.ParseError:
            root = None
        if root is not None:
            for node in root.iter('node'):
                description = node.attrib.get('content-desc', '')
                if not description.startswith(prefix):
                    continue
                bounds = node.attrib.get('bounds', '')
                match = re.fullmatch(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', bounds)
                if not match:
                    continue
                x1, y1, x2, y2 = map(int, match.groups())
                adb('shell', 'input', 'tap', str((x1 + x2) // 2), str((y1 + y2) // 2))
                time.sleep(1)
                return description
    if fallback is not None:
        x, y = fallback
        adb('shell', 'input', 'tap', str(x), str(y))
        time.sleep(1)
        return 'deterministic fallback for ' + prefix.rstrip(',')
    raise RuntimeError('No accessibility node starts with ' + repr(prefix))

def scenario(
    out: Path,
    name: str,
    size: str,
    density: int,
    font_scale: float,
    forge_tap: tuple[int, int],
    district_tap: tuple[int, int]
) -> dict:
    adb('shell', 'wm', 'size', size)
    adb('shell', 'wm', 'density', str(density))
    adb('shell', 'settings', 'put', 'system', 'font_scale', str(font_scale), check=False)
    time.sleep(1)
    launch()
    assert_alive()
    capture(out, name + '-overview')
    selected = tap_accessibility_prefix('Field Forge,', forge_tap)
    capture(out, name + '-building-selected')

    adb('shell', 'input', 'keyevent', '4')
    time.sleep(1)
    overlay = tap_accessibility_prefix('District overlay,', district_tap)
    capture(out, name + '-district-tools')

    crash = adb('logcat', '-b', 'crash', '-d', check=False)
    fatal_for_app = re.search(r'FATAL EXCEPTION.*?com\\.elroybenjamins\\.cartcrown', crash, re.S)
    if fatal_for_app:
        raise RuntimeError('Fatal Android exception detected for Cart & Crown.')

    return {
        'name': name,
        'size': size,
        'density': density,
        'font_scale': font_scale,
        'selected_building': selected,
        'selected_capture': name + '-building-selected.png',
        'district_overlay': overlay,
        'district_capture': name + '-district-tools.png',
        'status': 'passed'
    }

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--apk', required=True, type=Path)
    parser.add_argument('--probe', type=Path)
    parser.add_argument('--out', required=True, type=Path)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)

    report = {
        'fixture': 'deterministic Grand Human settlement showcase',
        'native_emulator': True,
        'scenarios': [],
        'status': 'failed'
    }

    try:
        assert adb('shell', 'getprop', 'ro.kernel.qemu') == '1' or adb('shell', 'getprop', 'ro.boot.qemu') == '1'
        adb('install', '-r', str(args.apk.resolve()), timeout=120)
        # Fallback coordinates are centers of deterministic fixture hit targets.
        # Accessibility is always attempted first. The fallback exists because
        # continuous ambient animation can prevent uiautomator from reaching an
        # idle hierarchy on some emulator runs.
        specs = [
            ('compact-360x640', '720x1280', 320, 1.0, (170, 606), (600, 293)),
            ('regular-large-text', '1080x2400', 420, 1.35, (252, 921), (920, 410))
        ]
        for index, spec in enumerate(specs):
            if index:
                adb('shell', 'wm', 'size', 'reset', check=False)
                adb('shell', 'wm', 'density', 'reset', check=False)
                adb('shell', 'settings', 'delete', 'system', 'font_scale', check=False)
                adb('install', '-r', str(args.apk.resolve()), timeout=120)
            report['scenarios'].append(scenario(args.out, *spec))
        report['status'] = 'passed'
    except Exception as error:
        report['error'] = str(error)
        try:
            capture(args.out, 'failure')
        except Exception as capture_error:
            report['capture_error'] = str(capture_error)
        raise
    finally:
        (args.out / 'settlement-smoke-report.json').write_text(json.dumps(report, indent=2))
        (args.out / 'logcat.txt').write_text(adb('logcat', '-d', '-v', 'threadtime', check=False))
        (args.out / 'crash-buffer.txt').write_text(adb('logcat', '-b', 'crash', '-d', check=False))
        adb('shell', 'wm', 'size', 'reset', check=False)
        adb('shell', 'wm', 'density', 'reset', check=False)
        adb('shell', 'settings', 'delete', 'system', 'font_scale', check=False)
        print(json.dumps(report, indent=2))

if __name__ == '__main__':
    main()
