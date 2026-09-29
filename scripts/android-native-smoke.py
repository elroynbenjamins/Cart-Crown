#!/usr/bin/env python3
"""Exercise the installed release APK, not Expo Go or a JS simulation.

Only runs on an Android emulator. Captures real screenshots and UI hierarchies.
Does not silently count unvisited combat/boss screens as tested.
"""
from __future__ import annotations
import argparse
import json
import re
import subprocess
import time
import xml.etree.ElementTree as ET
from pathlib import Path

PACKAGE = 'com.elroybenjamins.cartcrown'


def adb(*args: str, check: bool = True, timeout: int = 30) -> str:
    result = subprocess.run(['adb', *args], capture_output=True, text=True, timeout=timeout)
    if check and result.returncode:
        raise RuntimeError(f'adb {args!r}: {result.stdout}\n{result.stderr}')
    return result.stdout.strip()


def hierarchy() -> tuple[ET.Element, str]:
    last_error: Exception | None = None
    for _ in range(4):
        try:
            adb('shell', 'uiautomator', 'dump', '/sdcard/cart-crown-window.xml')
            xml = adb('shell', 'cat', '/sdcard/cart-crown-window.xml')
            root = ET.fromstring(xml[xml.index('<?xml'):])
            return root, xml
        except (ValueError, ET.ParseError, RuntimeError) as error:
            last_error = error
            time.sleep(1)
    raise RuntimeError(f'Cannot read native UI hierarchy: {last_error}')


def visible_copy(root: ET.Element) -> str:
    return '\n'.join(' '.join(node.get(key, '') for key in ('text', 'content-desc'))
                     for node in root.iter('node'))


def wait_for_copy(expected: str, timeout: int = 35) -> ET.Element:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if not adb('shell', 'pidof', PACKAGE, check=False):
            raise RuntimeError('The native app process exited while waiting for ' + expected)
        root, _ = hierarchy()
        text = visible_copy(root)
        if expected.casefold() in text.casefold():
            return root
        time.sleep(1)
    raise RuntimeError('Native UI did not show ' + expected)


def tap_label(root: ET.Element, label: str) -> None:
    candidates = [node for node in root.iter('node')
                  if any(label.casefold() == node.get(key, '').strip().casefold()
                         for key in ('text', 'content-desc'))]
    for node in candidates:
        match = re.fullmatch(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', node.get('bounds', ''))
        if match and node.get('enabled') != 'false':
            x1, y1, x2, y2 = map(int, match.groups())
            if x2 > x1 and y2 > y1:
                adb('shell', 'input', 'tap', str((x1 + x2) // 2), str((y1 + y2) // 2))
                return
    raise RuntimeError('No visible native control labelled ' + label)


def launch() -> None:
    component = adb('shell', 'cmd', 'package', 'resolve-activity', '--brief', PACKAGE).splitlines()[-1]
    if not component.startswith(PACKAGE + '/'):
        raise RuntimeError('Cannot resolve the application launcher: ' + component)
    output = adb('shell', 'am', 'start', '-W', '-n', component)
    if 'Error:' in output:
        raise RuntimeError(output)
    time.sleep(2)


def capture(out: Path, name: str) -> str:
    root, xml = hierarchy()
    (out / (name + '.xml')).write_text(xml)
    text = visible_copy(root)
    (out / (name + '.txt')).write_text(text)
    image = subprocess.run(['adb', 'exec-out', 'screencap', '-p'], capture_output=True, check=True).stdout
    if not image.startswith(b'\x89PNG\r\n\x1a\n'):
        raise RuntimeError('Emulator did not return a PNG screenshot')
    (out / (name + '.png')).write_bytes(image)
    return text


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--apk', required=True, type=Path)
    parser.add_argument('--out', required=True, type=Path)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    report: dict = {'package': PACKAGE, 'native_emulator': True, 'passed': [],
                    'combat_verified': False, 'bosses_verified': False,
                    'physical_device_verified': False, 'performance_profiled': False}
    try:
        if adb('shell', 'getprop', 'ro.kernel.qemu') != '1' and adb('shell', 'getprop', 'ro.boot.qemu') != '1':
            raise RuntimeError('Refusing to run destructive save tests on a non-emulator device')
        adb('install', '-r', str(args.apk.resolve()), timeout=120)
        report['passed'].append('apk_installed')
        adb('logcat', '-c')
        # The release APK must boot with its own JS bundle, not a development server.
        adb('shell', 'svc', 'wifi', 'disable', check=False)
        adb('shell', 'svc', 'data', 'disable', check=False)
        for name, size, density in [('compact-360x640', '720x1280', '320'),
                                     ('regular-412x915', '1080x2400', '420')]:
            adb('shell', 'wm', 'size', size)
            adb('shell', 'wm', 'density', density)
            adb('shell', 'am', 'force-stop', PACKAGE)
            adb('shell', 'pm', 'clear', PACKAGE)
            launch()
            root = wait_for_copy('Choose a Save')
            capture(args.out, name + '-save-select')
            report['passed'].append(name + ':offline_native_boot')
            tap_label(root, 'Start Human Campaign')
            deadline = time.monotonic() + 30
            while time.monotonic() < deadline:
                root, _ = hierarchy()
                text = visible_copy(root)
                if 'Choose a Save' not in text and len(text.strip()) > 50:
                    break
                time.sleep(1)
            else:
                raise RuntimeError('Creating a new campaign did not leave save selection')
            capture(args.out, name + '-new-campaign')
            report['passed'].append(name + ':new_campaign_rendered')
            adb('shell', 'input', 'keyevent', 'KEYCODE_HOME')
            time.sleep(2)
            launch()
            capture(args.out, name + '-resumed')
            report['passed'].append(name + ':background_resume')
            # A force-stop is a cold restart, not merely switching activities.
            adb('shell', 'am', 'force-stop', PACKAGE)
            launch()
            root = wait_for_copy('Choose a Save')
            assert 'Continue' in visible_copy(root), 'Created save did not persist across process death'
            capture(args.out, name + '-persisted-save')
            report['passed'].append(name + ':save_survived_cold_restart')
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = str(error)
        try:
            capture(args.out, 'failure')
        except Exception:
            pass
        raise
    finally:
        (args.out / 'smoke-report.json').write_text(json.dumps(report, indent=2))
        (args.out / 'logcat.txt').write_text(adb('logcat', '-d', '-v', 'threadtime', check=False))
        (args.out / 'crash-buffer.txt').write_text(adb('logcat', '-b', 'crash', '-d', check=False))
        adb('shell', 'wm', 'size', 'reset', check=False)
        adb('shell', 'wm', 'density', 'reset', check=False)
        print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
