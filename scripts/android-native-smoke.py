#!/usr/bin/env python3
"""Exercise the real APK using fresh native accessibility snapshots, not stale dumps."""
from __future__ import annotations
import argparse
import base64
import json
import re
import subprocess
import time
import uuid
import xml.etree.ElementTree as ET
from pathlib import Path

PACKAGE = 'com.elroybenjamins.cartcrown'
PROBE = PACKAGE + '.uiprobe/' + PACKAGE + '.uiprobe.HierarchyProbe'
ACTIONS: list[dict] = []


def adb(*args: str, check: bool = True, timeout: int = 30) -> str:
    result = subprocess.run(['adb', *args], capture_output=True, text=True, timeout=timeout)
    if check and result.returncode:
        raise RuntimeError(f'adb {args!r}: {result.stdout}\n{result.stderr}')
    return result.stdout.strip()


def hierarchy() -> tuple[ET.Element, str]:
    last_error = ''
    for _ in range(4):
        request = uuid.uuid4().hex
        result = adb('shell', 'am', 'instrument', '-w', '-r', '-e', 'request', request, PROBE)
        match = re.search(r'INSTRUMENTATION_RESULT: hierarchy_b64=([A-Za-z0-9+/=]+)', result)
        if match:
            xml = base64.b64decode(match.group(1), validate=True).decode('utf-8')
            root = ET.fromstring(xml)
            if root.get('request') != request:
                raise RuntimeError('Rejected stale native UI snapshot')
            return root, xml
        last_error = result[-1400:]
        time.sleep(.3)
    raise RuntimeError('Fresh native UI probe failed: ' + last_error)


def visible_copy(root: ET.Element) -> str:
    return '\n'.join(' '.join(node.get(key, '') for key in ('text', 'content-desc'))
                     for node in root.iter('node'))


def wait_for_copy(expected: str, timeout: int = 35) -> ET.Element:
    deadline = time.monotonic() + timeout
    last_copy = ''
    while time.monotonic() < deadline:
        if not adb('shell', 'pidof', PACKAGE, check=False):
            raise RuntimeError('Native app exited while waiting for ' + expected)
        root, _ = hierarchy()
        last_copy = visible_copy(root)
        if expected.casefold() in last_copy.casefold():
            return root
        time.sleep(.3)
    raise RuntimeError('UI did not show ' + expected + '\nVisible: ' + last_copy[-1600:])


def tap_label(root: ET.Element, label: str) -> None:
    parents = {child: parent for parent in root.iter() for child in parent}
    candidates = []
    for node in root.iter('node'):
        values = [node.get(key, '').strip().casefold() for key in ('text', 'content-desc')]
        exact = label.casefold() in values
        if not exact and not any(label.casefold() in value for value in values):
            continue
        target = node
        while target.get('clickable') != 'true' and target in parents:
            target = parents[target]
        if target.get('clickable') != 'true' or target.get('enabled') == 'false':
            continue
        match = re.fullmatch(r'\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\]', target.get('bounds', ''))
        if match:
            x1, y1, x2, y2 = map(int, match.groups())
            if x2 > x1 >= 0 and y2 > y1 >= 0:
                candidates.append((not exact, (x2-x1)*(y2-y1), x1, y1, x2, y2))
    if not candidates:
        raise RuntimeError('No enabled native control labelled ' + label)
    _, _, x1, y1, x2, y2 = min(candidates)
    ACTIONS.append({'label': label, 'bounds': [x1, y1, x2, y2], 'snapshot': root.get('request')})
    print('TAP', label, [x1, y1, x2, y2], flush=True)
    adb('shell', 'input', 'tap', str((x1+x2)//2), str((y1+y2)//2))


def find_and_tap(label: str, scroll: bool = False) -> None:
    for _ in range(10 if scroll else 5):
        root, _ = hierarchy()
        try:
            tap_label(root, label)
            return
        except RuntimeError:
            if scroll:
                size = adb('shell', 'wm', 'size').splitlines()[-1]
                width, height = map(int, re.search(r'(\d+)x(\d+)', size).groups())
                adb('shell', 'input', 'swipe', str(width//2), str(int(height*.73)),
                    str(width//2), str(int(height*.36)), '300')
            time.sleep(.3)
    raise RuntimeError('Could not reach native control ' + label)


def launch() -> None:
    component = adb('shell', 'cmd', 'package', 'resolve-activity', '--brief', PACKAGE).splitlines()[-1]
    if not component.startswith(PACKAGE + '/'):
        raise RuntimeError('Cannot resolve game launcher: ' + component)
    output = adb('shell', 'am', 'start', '-W', '-n', component)
    if 'Error:' in output:
        raise RuntimeError(output)
    time.sleep(1)


def screenshot(out: Path, name: str) -> None:
    image = subprocess.run(['adb', 'exec-out', 'screencap', '-p'], capture_output=True,
                           check=True, timeout=20).stdout
    if not image.startswith(b'\x89PNG\r\n\x1a\n'):
        raise RuntimeError('Emulator returned no PNG screenshot')
    (out / (name + '.png')).write_bytes(image)


def capture(out: Path, name: str) -> str:
    screenshot(out, name)
    root, xml = hierarchy()
    (out / (name + '.xml')).write_text(xml)
    text = visible_copy(root)
    (out / (name + '.txt')).write_text(text)
    return text


def first_battle(out: Path, name: str, result: dict) -> None:
    tap_label(wait_for_copy('Show me where to go'), 'Show me where to go')
    capture(out, name + '-kingdom-guidance')
    find_and_tap('Campaign')
    tap_label(wait_for_copy('Show the first objective'), 'Show the first objective')
    capture(out, name + '-campaign')
    find_and_tap('Hold the Crossing', scroll=True)
    tap_label(wait_for_copy('Show Begin Battle'), 'Show Begin Battle')
    capture(out, name + '-battle-prep')
    find_and_tap('Begin Battle', scroll=True)
    root = wait_for_copy('Begin Battle')
    capture(out, name + '-battle-tutorial')
    remote = '/sdcard/cart-crown-' + name + '.mp4'
    recorder = subprocess.Popen(['adb', 'shell', 'screenrecord', '--time-limit', '30',
        '--bit-rate', '2000000', remote], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        tap_label(root, 'Begin Battle')
        if result['requested_speed'] == 2:
            updated, _ = hierarchy()
            if 'View Results' not in visible_copy(updated):
                try:
                    tap_label(updated, 'Battle speed 1 times')
                    updated, _ = hierarchy()
                    if 'Battle speed 2 times' in visible_copy(updated):
                        result['speed_verified'] = '2x control confirmed'
                except RuntimeError:
                    pass
        screenshot(out, name + '-battle-active')
        root = wait_for_copy('View Results', timeout=35)
        text = capture(out, name + '-victory')
        assert 'victory' in text.casefold(), 'Missing visible victory state'
        result['victory'] = True
        tap_label(root, 'View Results')
        root = wait_for_copy('Show Continue')
        capture(out, name + '-results')
        tap_label(root, 'Show Continue')
        wait_for_copy('Rewards secured')
        time.sleep(.4)  # Let the dismissed coach's fade finish before visual review.
        capture(out, name + '-results-unobscured')
        result['results'] = True
        # Fresh launch starts dark. The expected IDs follow ThemeProvider's cycle;
        # the constant button label cannot verify appearance, so retain screenshots.
        result['theme_captures'] = []
        for theme_id, suffix in [('light', 'light'), ('original', 'charcoal'),
                                 ('dark', 'dark-restored')]:
            find_and_tap('Change theme')
            time.sleep(.4)
            wait_for_copy('Rewards secured')
            capture_name = name + '-results-' + suffix
            capture(out, capture_name)
            result['theme_captures'].append({
                'expected_theme_id': theme_id, 'screenshot': capture_name + '.png'
            })
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
    parser.add_argument('--probe', required=True, type=Path)
    parser.add_argument('--out', required=True, type=Path)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    report: dict = {'package': PACKAGE, 'native_emulator': True, 'passed': [], 'battles': [],
        'combat_verified': False, 'bosses_verified': False, 'physical_device_verified': False,
        'performance_profiled': False, 'source': 'installed release APK, fresh public-API native hierarchy'}
    emulator_verified = False
    try:
        emulator_verified = (adb('shell', 'getprop', 'ro.kernel.qemu') == '1'
                             or adb('shell', 'getprop', 'ro.boot.qemu') == '1')
        if not emulator_verified:
            raise RuntimeError('Refusing save-reset tests on a physical device')
        adb('install', '-r', str(args.apk.resolve()), timeout=120)
        adb('install', '-r', str(args.probe.resolve()), timeout=120)
        report['passed'].append('release_apk_installed')
        adb('logcat', '-c')
        adb('shell', 'svc', 'wifi', 'disable', check=False)
        adb('shell', 'svc', 'data', 'disable', check=False)
        scenarios = [('compact-360x640', '720x1280', '320', 1),
                     ('regular-412x915', '1080x2400', '420', 2)]
        for name, size, density, speed in scenarios:
            battle = {'viewport': name, 'encounter': 'hold_the_road', 'requested_speed': speed,
                'speed_verified': '1x default', 'victory': False, 'results': False}
            report['battles'].append(battle)
            try:
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
                wait_for_copy('Show me where to go')
                capture(args.out, name + '-resumed')
                report['passed'].append(name + ':background_resume')
                first_battle(args.out, name, battle)
                report['passed'].append(name + ':tutorial_battle_victory_results')
                report['passed'].append(name + ':results_theme_cycle_captured')
                adb('shell', 'am', 'force-stop', PACKAGE)
                launch()
                root = wait_for_copy('Choose a Save')
                assert 'Continue' in visible_copy(root), 'Save missing after process death'
                capture(args.out, name + '-persisted-save')
                report['passed'].append(name + ':save_survived_cold_restart')
            except Exception as error:
                battle['error'] = str(error)
                try:
                    capture(args.out, name + '-failure')
                except Exception as capture_error:
                    battle['capture_error'] = str(capture_error)
        report['combat_verified'] = all(b['victory'] and b['results'] for b in report['battles'])
        if any('error' in b for b in report['battles']):
            raise RuntimeError('One or more native scenarios failed; see per-viewport evidence')
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['error'] = str(error)
        raise
    finally:
        (args.out / 'smoke-report.json').write_text(json.dumps(report, indent=2))
        (args.out / 'actions.json').write_text(json.dumps(ACTIONS, indent=2))
        if emulator_verified:
            (args.out / 'logcat.txt').write_text(adb('logcat', '-d', '-v', 'threadtime', check=False))
            (args.out / 'crash-buffer.txt').write_text(adb('logcat', '-b', 'crash', '-d', check=False))
            adb('shell', 'wm', 'size', 'reset', check=False)
            adb('shell', 'wm', 'density', 'reset', check=False)
        print(json.dumps(report, indent=2), flush=True)


if __name__ == '__main__':
    main()
