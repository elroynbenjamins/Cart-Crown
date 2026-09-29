#!/usr/bin/env python3
"""Exercise the actual app, not a web recreation or mocked battle.

Destructive setup is restricted to this app's QA package on an emulator.
Capture screenshots, UI hierarchy, logs and device provenance on failures too.
The artifact is x86_64-only and test-signed; it is not a Play Store release.
"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import time
import traceback
import xml.etree.ElementTree as ET

class AndroidSmoke:
    def __init__(self, package: str, output: Path):
        self.package = package
        self.output = output
        self.output.mkdir(parents=True, exist_ok=True)
        self.events = []
        self.scenario = 'setup'
        self.serial = os.environ.get('ANDROID_SERIAL', 'emulator-5554')

    def adb(self, *args: str, binary=False, timeout=25, check=True):
        result = subprocess.run(['adb', '-s', self.serial, *args], capture_output=True, timeout=timeout)
        if check and result.returncode:
            raise RuntimeError(f'adb {args}: {result.stderr.decode(errors="replace")} {result.stdout.decode(errors="replace")}')
        return result.stdout if binary else result.stdout.decode(errors='replace').strip()

    def note(self, message: str):
        event = {'scenario': self.scenario, 'time': time.time(), 'message': message}
        self.events.append(event)
        print(json.dumps(event), flush=True)
        (self.output / 'events.json').write_text(json.dumps(self.events, indent=2))

    def capture(self, label: str):
        name = re.sub(r'[^a-zA-Z0-9_-]', '_', self.scenario + '-' + label)
        data = self.adb('exec-out', 'screencap', '-p', binary=True)
        if not data.startswith(b'\x89PNG\r\n\x1a\n'):
            raise AssertionError('Android screenshot did not return a PNG')
        (self.output / (name + '.png')).write_bytes(data)
        return name

    def hierarchy(self):
        self.adb('shell', 'rm', '-f', '/sdcard/cartcrown-qa.xml')
        self.adb('shell', 'uiautomator', 'dump', '--compressed', '/sdcard/cartcrown-qa.xml', timeout=18, check=False)
        xml = self.adb('exec-out', 'cat', '/sdcard/cartcrown-qa.xml')
        root = ET.fromstring(xml)
        (self.output / (self.scenario + '-latest.xml')).write_text(xml)
        return root

    @staticmethod
    def labels(root):
        return list(dict.fromkeys(value for node in root.iter('node') for value in
            [node.get('text', ''), node.get('content-desc', '')] if value))

    def find(self, aliases, root, contains=False):
        for alias in aliases:
            for node in root.iter('node'):
                if node.get('enabled') == 'false':
                    continue
                values = [node.get('text', ''), node.get('content-desc', '')]
                if any(alias == v or (contains and alias in v) for v in values):
                    coords = [int(v) for v in re.findall(r'-?\d+', node.get('bounds', ''))]
                    if len(coords) == 4 and coords[2] > coords[0] and coords[3] > coords[1]:
                        return node, coords
        return None

    def wait(self, aliases, timeout=30, scroll=False, contains=False):
        deadline = time.monotonic() + timeout
        last = []
        while time.monotonic() < deadline:
            try:
                root = self.hierarchy()
                last = self.labels(root)
                found = self.find(aliases, root, contains)
                if found:
                    return found
            except (ET.ParseError, RuntimeError, subprocess.TimeoutExpired) as error:
                self.note('UI snapshot retry: ' + str(error)[:180])
            if scroll:
                self.adb('shell', 'input', 'swipe', '540', '1400', '540', '520', '300')
            time.sleep(.3)
        self.capture('missing-control')
        raise AssertionError(f'Could not find {aliases}; last visible labels: {last}')

    def tap(self, *aliases, scroll=False, contains=False):
        node, b = self.wait(aliases, scroll=scroll, contains=contains)
        self.note('Tap: ' + (node.get('content-desc') or node.get('text') or str(aliases)))
        self.adb('shell', 'input', 'tap', str((b[0]+b[2])//2), str((b[1]+b[3])//2))
        time.sleep(.35)

    def boot(self, height: int, font: float):
        self.adb('shell', 'am', 'force-stop', self.package)
        assert self.adb('shell', 'pm', 'clear', self.package) == 'Success'
        self.adb('shell', 'wm', 'size', f'1080x{height}')
        self.adb('shell', 'wm', 'density', '480')
        self.adb('shell', 'settings', 'put', 'system', 'font_scale', str(font))
        self.adb('shell', 'input', 'keyevent', 'KEYCODE_WAKEUP')
        self.adb('shell', 'wm', 'dismiss-keyguard', check=False)
        self.adb('logcat', '-c')
        self.launch()
        self.wait(['Choose a Save'])
        self.capture('save-select')

    def launch(self):
        output = self.adb('shell', 'monkey', '-p', self.package, '-c', 'android.intent.category.LAUNCHER', '1')
        if 'No activities found' in output:
            raise AssertionError(output)

    def first_battle(self, speed: int):
        self.tap('Start Human Campaign')
        self.wait(['This camp is your command center'])
        self.capture('kingdom-tutorial')
        self.tap('Show me where to go')
        self.tap('Campaign')
        self.tap('Show the first objective')
        self.tap('Hold the Road', scroll=True, contains=True)
        self.tap('Show Begin Battle')
        self.capture('battle-prep')
        self.tap('Begin Battle', scroll=True)
        self.wait(['Your preparation decides the fight'])
        self.capture('battle-tutorial-paused')
        self.tap('Begin Battle')
        if speed == 2:
            # Change the actual in-game setting, never the simulation clock.
            self.tap('Battle speed 1 times', '1×')
            self.wait(['Battle speed 2 times', '2×'])
            self.note('Confirmed actual 2x battle control')
        for index in range(4):
            self.capture('combat-' + str(index))
            time.sleep(.35)
        self.tap('View Results', scroll=True)
        self.tap('Show Continue')
        self.capture('results')
        self.note('Opening battle completed and real Results screen reached')
        self.adb('shell', 'input', 'keyevent', 'KEYCODE_HOME')
        time.sleep(1)
        self.launch()
        time.sleep(1)
        self.capture('background-resume')
        if not self.adb('shell', 'pidof', self.package):
            raise AssertionError('App did not remain alive after background/resume')
        self.adb('shell', 'am', 'force-stop', self.package)
        self.launch()
        self.wait(['Choose a Save'])
        self.wait(['Continue'])
        self.capture('saved-campaign-after-relaunch')
        self.note('Native process relaunch retained a saved campaign')

    def logs(self):
        for name, args in {
            'logcat.txt': ('logcat', '-d', '-v', 'threadtime'),
            'gfxinfo.txt': ('shell', 'dumpsys', 'gfxinfo', self.package),
            'meminfo.txt': ('shell', 'dumpsys', 'meminfo', self.package),
            'activity.txt': ('shell', 'dumpsys', 'activity', 'activities'),
            'display.txt': ('shell', 'dumpsys', 'display'),
        }.items():
            try:
                (self.output / (self.scenario + '-' + name)).write_text(self.adb(*args, timeout=20, check=False))
            except Exception as error:
                self.note('Capture warning: ' + str(error))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--apk', type=Path, required=True)
    parser.add_argument('--package', required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    if args.package != 'com.elroybenjamins.cartcrown.qa':
        raise SystemExit('Refusing to clear or test non-QA application data')
    runner = AndroidSmoke(args.package, args.output)
    if runner.adb('shell', 'getprop', 'ro.kernel.qemu') != '1':
        raise SystemExit('This automated runner only targets an Android emulator')
    device = {key: runner.adb('shell', 'getprop', key) for key in
        ['ro.build.version.release', 'ro.build.version.sdk', 'ro.product.cpu.abi', 'ro.product.model', 'ro.build.fingerprint']}
    device.update({'package': args.package, 'apk': args.apk.name, 'serial': runner.serial,
                   'physical_device': False, 'production_entrypoint': True})
    (args.output / 'device.json').write_text(json.dumps(device, indent=2))
    runner.adb('install', '-r', str(args.apk), timeout=120)
    results = []
    try:
        for name, height, font, speed in [('compact-1x', 1920, 1.0, 1), ('tall-2x', 2400, 1.0, 2)]:
            runner.scenario = name
            try:
                runner.boot(height, font)
                runner.first_battle(speed)
                results.append({'scenario': name, 'passed': True, 'speed': speed})
            except Exception as error:
                runner.capture('failure')
                results.append({'scenario': name, 'passed': False, 'error': str(error)})
                traceback.print_exc()
            finally:
                runner.logs()
                (args.output / 'native-results.json').write_text(json.dumps(results, indent=2))
    finally:
        runner.adb('shell', 'wm', 'size', 'reset', check=False)
        runner.adb('shell', 'wm', 'density', 'reset', check=False)
        runner.adb('shell', 'settings', 'put', 'system', 'font_scale', '1.0', check=False)
    if not results or not all(case['passed'] for case in results):
        raise SystemExit('Native gameplay checkpoint failed; inspect screenshots, XML and logs')
    print('PASS: actual Android APK installed; opening tutorial, battles, Results and save relaunch verified.')

if __name__ == '__main__':
    main()
