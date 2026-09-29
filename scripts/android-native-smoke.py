#!/usr/bin/env python3
"""Emulator-only smoke test of an installed self-contained Android APK."""
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
            raise RuntimeError('Native app process exited while waiting for ' + expected)
        root, _ = hierarchy()
        if expected.casefold() in visible_copy(root).casefold():
            return root
        time.sleep(1)
    raise RuntimeError('Native UI did not show ' + expected)


def tap_label(root: ET.Element, label: str) -> None:
    parents = {child: parent for parent in root.iter() for child in parent}
    exact, grouped = [], []
    for node in root.iter('node'):
        values = [node.get(key, '').strip().casefold() for key in ('text', 'content-desc')]
        if label.casefold() in values:
            exact.append(node)
        elif node.get('clickable') == 'true' and any(label.casefold() in value for value in values):
            grouped.append(node)
    for node in exact + grouped:
        target = node
        while target.get('clickable') != 'true' and target in parents:
            target = parents[target]
        if target.get('clickable') != 'true':
            target = node
        match = re.fullmatch(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', target.get('bounds', ''))
        if match and target.get('enabled') != 'false':
            x1, y1, x2, y2 = map(int, match.groups())
            if x2 > x1 and y2 > y1:
                adb('shell', 'input', 'tap', str((x1 + x2) // 2), str((y1 + y2) // 2))
                return
    raise RuntimeError('No visible native control labelled ' + label)


def find_and_tap(label: str, scroll: bool = False) -> None:
    for attempt in range(8 if scroll else 3):
        root, _ = hierarchy()
        try:
            tap_label(root, label)
            return
        except RuntimeError:
            if scroll:
                size = adb('shell', 'wm', 'size').splitlines()[-1]
                width, height = map(int, re.search(r'(\d+)x(\d+)', size).groups())
                adb('shell', 'input', 'swipe', str(width // 2), str(int(height * .73)),
                    str(width // 2), str(int(height * .36)), '350')
            time.sleep(.5)
    raise RuntimeError('Could not reach native control ' + label)


def launch() -> None:
    component = adb('shell', 'cmd', 'package', 'resolve-activity', '--brief', PACKAGE).splitlines()[-1]
    if not component.startswith(PACKAGE + '/'):
        raise RuntimeError('Cannot resolve application launcher: ' + component)
    output = adb('shell', 'am', 'start', '-W', '-n', component)
    if 'Error:' in output:
        raise RuntimeError(output)
    time.sleep(2)


def screenshot(out: Path, name: str) -> None:
    image = subprocess.run(['adb', 'exec-out', 'screencap', '-p'], capture_output=True, check=True).stdout
    if not image.startswith(b'\x89PNG\r\n\x1a\n'):
        raise RuntimeError('Emulator did not return a PNG screenshot')
    (out / (name + '.png')).write_bytes(image)


def capture(out: Path, name: str) -> str:
    screenshot(out, name)
    root, xml = hierarchy()
    (out / (name + '.xml')).write_text(xml)
    text = visible_copy(root)
    (out / (name + '.txt')).write_text(text)
    return text


def first_battle(out: Path, name: str, requested_speed: int) -> dict:
    result = {'encounter': 'hold_the_road', 'requested_speed': requested_speed,
              'speed_verified': '1x default', 'victory': False, 'results': False}
    tap_label(wait_for_copy('Show me where to go'), 'Show me where to go')
    find_and_tap('Campaign')
    tap_label(wait_for_copy('Show the first objective'), 'Show the first objective')
    find_and_tap('Hold the Road', scroll=True)
    tap_label(wait_for_copy('Show Begin Battle'), 'Show Begin Battle')
    capture(out, name + '-battle-prep')
    find_and_tap('Begin Battle', scroll=True)
    root = wait_for_copy('Begin Battle')
    capture(out, name + '-battle-tutorial')
    remote = '/sdcard/cart-crown-' + name + '.mp4'
    recorder = subprocess.Popen(['adb', 'shell', 'screenrecord', '--time-limit', '25',
                                 '--bit-rate', '2000000', remote], stdout=subprocess.DEVNULL,
                                stderr=subprocess.DEVNULL)
    try:
        tap_label(root, 'Begin Battle')
        time.sleep(.2)
        screenshot(out, name + '-battle-start')
        if requested_speed == 2:
            root, _ = hierarchy()
            # A very short fight may already have ended. Never report 2x in that case.
            if 'View Results' not in visible_copy(root):
                try:
                    tap_label(root, 'Battle speed 1 times')
                    updated, _ = hierarchy()
                    if 'Battle speed 2 times' in visible_copy(updated):
                        result['speed_verified'] = '2x control confirmed'
                except RuntimeError:
                    result['speed_verified'] = '2x not reached; 1x default only'
        root = wait_for_copy('View Results', timeout=35)
        text = capture(out, name + '-victory')
        assert 'victory' in text.casefold(), 'Battle ended without a visible victory state'
        result['victory'] = True
        tap_label(root, 'View Results')
        root = wait_for_copy('Show Continue')
        capture(out, name + '-results')
        tap_label(root, 'Show Continue')
        result['results'] = True
        return result
    finally:
        adb('shell', 'pkill', '-2', 'screenrecord', check=False)
        try:
            recorder.wait(timeout=8)
        except subprocess.TimeoutExpired:
            recorder.terminate()
        adb('pull', remote, str(out / (name + '-battle.mp4')), check=False)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--apk', required=True, type=Path)
    parser.add_argument('--out', required=True, type=Path)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    report: dict = {'package': PACKAGE, 'native_emulator': True, 'passed': [], 'battles': [],
                    'combat_verified': False, 'bosses_verified': False,
                    'physical_device_verified': False, 'performance_profiled': False}
    emulator_verified = False
    try:
        emulator_verified = (adb('shell', 'getprop', 'ro.kernel.qemu') == '1'
                             or adb('shell', 'getprop', 'ro.boot.qemu') == '1')
        if not emulator_verified:
            raise RuntimeError('Refusing destructive save tests on a non-emulator device')
        adb('install', '-r', str(args.apk.resolve()), timeout=120)
        report['passed'].append('apk_installed')
        adb('logcat', '-c')
        adb('shell', 'svc', 'wifi', 'disable', check=False)
        adb('shell', 'svc', 'data', 'disable', check=False)
        for name, size, density, speed in [('compact-360x640', '720x1280', '320', 1),
                                           ('regular-412x915', '1080x2400', '420', 2)]:
            adb('shell', 'wm', 'size', size)
            adb('shell', 'wm', 'density', density)
            adb('shell', 'am', 'force-stop', PACKAGE)
            adb('shell', 'pm', 'clear', PACKAGE)
            launch()
            root = wait_for_copy('Choose a Save')
            capture(args.out, name + '-save-select')
            report['passed'].append(name + ':offline_native_boot')
            tap_label(root, 'Start Human Campaign')
            wait_for_copy('Show me where to go')
            capture(args.out, name + '-new-campaign')
            report['passed'].append(name + ':new_campaign_rendered')
            adb('shell', 'input', 'keyevent', 'KEYCODE_HOME')
            time.sleep(2)
            launch()
            capture(args.out, name + '-resumed')
            report['passed'].append(name + ':background_resume')
            battle = first_battle(args.out, name, speed)
            report['battles'].append({'viewport': name, **battle})
            report['combat_verified'] = True
            report['passed'].append(name + ':tutorial_battle_victory_results')
            adb('shell', 'am', 'force-stop', PACKAGE)
            launch()
            root = wait_for_copy('Choose a Save')
            assert 'Continue' in visible_copy(root), 'Save did not persist across process death'
            capture(args.out, name + '-persisted-save')
            report['passed'].append(name + ':save_survived_cold_restart')
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = str(error)
        if emulator_verified:
            try:
                capture(args.out, 'failure')
            except Exception:
                pass
        raise
    finally:
        (args.out / 'smoke-report.json').write_text(json.dumps(report, indent=2))
        if emulator_verified:
            (args.out / 'logcat.txt').write_text(adb('logcat', '-d', '-v', 'threadtime', check=False))
            (args.out / 'crash-buffer.txt').write_text(adb('logcat', '-b', 'crash', '-d', check=False))
            adb('shell', 'wm', 'size', 'reset', check=False)
            adb('shell', 'wm', 'density', 'reset', check=False)
        print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
