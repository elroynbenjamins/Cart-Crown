#!/usr/bin/env python3
"""Activate approved static Human combat sprites in the existing Metro registry.

Copy the assets folder from the ZIP into the Cart-Crown repository first;
then run from the repository root. Safe to rerun (no duplicate registrations).
"""
import hashlib
import json
from pathlib import Path

BASE = Path('assets/game/battle_directional/human')
REGISTRY = Path('src/ui/productionAssets.ts')
MANIFEST = BASE / 'manifest.json'
CLASSES = ('shield_infantry','ranger','heavy_cavalry','field_medic',
           'spearman','crossbowman','great_sword','banner_captain')
EXPECTED = tuple(f'{name}_{side}.png' for name in CLASSES
                 for side in ('ally_back','enemy_front'))


def main():
    if not REGISTRY.is_file() or not MANIFEST.is_file():
        raise SystemExit('Run in the Cart-Crown repository root after copying assets/game/battle_directional/human/')
    m = json.loads(MANIFEST.read_text('utf-8'))
    if m.get('version') != 1 or m.get('approvedForRuntime') is not True:
        raise SystemExit('Artwork manifest is not approved for runtime.')
    entries = {entry['file']: entry for entry in m.get('entries', [])}
    if set(entries) != set(EXPECTED):
        raise SystemExit('Expected exactly 16 approved paired directional sprites.')
    for name in EXPECTED:
        p = BASE/name
        if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest() != entries[name]['sha256']:
            raise SystemExit('Missing/corrupted approved sprite: '+str(p))
        b=p.read_bytes()
        if b[:8] != b'\x89PNG\r\n\x1a\n' or int.from_bytes(b[16:20],'big') != 256 or int.from_bytes(b[20:24],'big') != 256:
            raise SystemExit('Sprite dimensions or PNG signature invalid: '+name)
    text = REGISTRY.read_text('utf-8')
    anchor = "  'ui.treasury_atlas': require('../../assets/game/ui/treasury_atlas.png'),"
    if text.count(anchor) != 1:
        raise SystemExit('Could not locate a unique static asset registry insertion point.')
    definitions = [
        f"  'battle_directional.human.{name[:-4]}': require('../../assets/game/battle_directional/human/{name}'),"
        for name in EXPECTED
    ]
    for line in definitions:
        if text.count(line) > 1:
            raise SystemExit('Duplicate asset registration: '+line)
    missing = [line for line in definitions if line not in text]
    if missing:
        text = text.replace(anchor,anchor+'\n\n  // Approved Human battle-stage facing sprites. Army portraits remain unchanged.\n'+'\n'.join(missing))
        REGISTRY.write_text(text,encoding='utf-8')
    print('PASS: 16 reviewed PNGs verified, '+str(len(missing))+' static Metro requires installed.')
    print('Next: npm run directional-art:check && npm run art:check && npm run typecheck')

if __name__ == '__main__':
    main()
