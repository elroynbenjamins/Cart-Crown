#!/usr/bin/env python3
"""Offline tests for native save-button discovery; no emulator or user data."""
from __future__ import annotations

import importlib.util
import base64
from types import SimpleNamespace
import pathlib
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET

SCRIPT = pathlib.Path(__file__).parent / 'android-native-smoke.py'
spec = importlib.util.spec_from_file_location('cart_crown_native_smoke', SCRIPT)
assert spec and spec.loader
smoke = importlib.util.module_from_spec(spec)
spec.loader.exec_module(smoke)


def tree(with_save: bool) -> ET.Element:
    root = ET.Element('hierarchy')
    ET.SubElement(root, 'node', {'text': 'Choose a Save'})
    ET.SubElement(root, 'node', {'text': 'Start Human Campaign'})
    if with_save:
        ET.SubElement(root, 'node', {'text': 'Continue'})
    return root


class SavedSlotViewportTests(unittest.TestCase):
    def test_compact_viewport_scrolls_before_deciding_save_missing(self) -> None:
        screens = [tree(False), tree(False), tree(True)]
        calls: list[tuple[str, ...]] = []

        def hierarchy():
            return screens.pop(0), ''

        def adb(*args: str, **_kwargs):
            calls.append(args)
            return 'Physical size: 720x1280' if args[-2:] == ('wm', 'size') else ''

        with patch.object(smoke, 'hierarchy', side_effect=hierarchy), \
                patch.object(smoke, 'adb', side_effect=adb), \
                patch.object(smoke.time, 'sleep', return_value=None):
            result = smoke.wait_for_saved_slot_control()
        self.assertTrue(any(node.get('text') == 'Continue' for node in result.iter('node')))
        self.assertEqual(2, sum(1 for call in calls if 'swipe' in call))
        self.assertFalse(any('tap' in call for call in calls),
                         'Restoration check must not inadvertently enter or mutate a save.')

    def test_missing_save_still_fails_after_scrolls(self) -> None:
        with patch.object(smoke, 'hierarchy', return_value=(tree(False), '')), \
                patch.object(smoke, 'adb', return_value='Physical size: 720x1280'), \
                patch.object(smoke.time, 'sleep', return_value=None):
            with self.assertRaisesRegex(RuntimeError, 'Continue control absent'):
                smoke.wait_for_saved_slot_control(max_scrolls=2)

    def test_visible_control_requires_exact_label(self) -> None:
        root = tree(False)
        ET.SubElement(root, 'node', {'text': 'Continue exploring the road'})
        with patch.object(smoke, 'hierarchy', return_value=(root, '')), \
                patch.object(smoke, 'adb', return_value='Physical size: 720x1280'), \
                patch.object(smoke.time, 'sleep', return_value=None):
            with self.assertRaisesRegex(RuntimeError, 'Continue control absent'):
                smoke.wait_for_saved_slot_control(max_scrolls=0)


class FreshProbeForegroundRecoveryTests(unittest.TestCase):
    def test_transient_non_game_window_refocuses_once_with_fresh_snapshot(self) -> None:
        calls: list[tuple[str, ...]] = []
        encoded = base64.b64encode(b'<hierarchy request="fresh"><node text="Battle" /></hierarchy>').decode('ascii')
        probes = iter([
            'INSTRUMENTATION_RESULT: probe_error=java.lang.IllegalStateException: The game is not the active window\\nINSTRUMENTATION_CODE: 0',
            'INSTRUMENTATION_RESULT: hierarchy_b64=' + encoded
        ])

        def adb(*args: str, **_kwargs) -> str:
            calls.append(args)
            return '5188' if 'pidof' in args else next(probes)

        with patch.object(smoke, 'adb', side_effect=adb), \
                patch.object(smoke, 'launch') as launch, \
                patch.object(smoke.uuid, 'uuid4', return_value=SimpleNamespace(hex='fresh')), \
                patch.object(smoke.time, 'sleep', return_value=None):
            root, source = smoke.hierarchy()
        self.assertEqual('fresh', root.get('request'))
        self.assertIn('Battle', source)
        self.assertEqual(1, launch.call_count)
        self.assertEqual(2, sum('instrument' in call for call in calls))

    def test_refocus_never_masks_an_app_crash(self) -> None:
        def adb(*args: str, **_kwargs) -> str:
            if 'pidof' in args:
                return ''
            return 'INSTRUMENTATION_RESULT: probe_error=java.lang.IllegalStateException: The game is not the active window'

        with patch.object(smoke, 'adb', side_effect=adb), \
                patch.object(smoke, 'launch') as launch, \
                patch.object(smoke.time, 'sleep', return_value=None):
            with self.assertRaisesRegex(RuntimeError, 'Native app exited'):
                smoke.hierarchy()
        launch.assert_not_called()

    def test_unrelated_instrumentation_error_does_not_relaunch_game(self) -> None:
        with patch.object(smoke, 'adb', return_value='INSTRUMENTATION_RESULT: probe_error=unexpected failure'), \
                patch.object(smoke, 'launch') as launch, \
                patch.object(smoke.time, 'sleep', return_value=None):
            with self.assertRaisesRegex(RuntimeError, 'Fresh native UI probe failed'):
                smoke.hierarchy()
        launch.assert_not_called()


if __name__ == '__main__':
    unittest.main()
