#!/usr/bin/env python3
"""Native portrait evidence for the real SettlementScreen rendered from a deterministic test-only save."""
from __future__ import annotations
import argparse, base64, json, re, subprocess, time, uuid
import xml.etree.ElementTree as ET
from pathlib import Path

PACKAGE='com.elroybenjamins.cartcrown'
PROBE=PACKAGE+'.uiprobe/'+PACKAGE+'.uiprobe.HierarchyProbe'
ACTIONS=[]

def adb(*args:str, check:bool=True, timeout:int=30)->str:
    r=subprocess.run(['adb',*args],capture_output=True,text=True,timeout=timeout)
    if check and r.returncode:
        raise RuntimeError(f"adb {args!r}: {r.stdout}\n{r.stderr}")
    return r.stdout.strip()

def hierarchy():
    last=''
    for _ in range(4):
        request=uuid.uuid4().hex
        out=adb('shell','am','instrument','-w','-r','-e','request',request,PROBE,timeout=60)
        m=re.search(r'INSTRUMENTATION_RESULT: hierarchy_b64=([A-Za-z0-9+/=]+)',out)
        if m:
            xml=base64.b64decode(m.group(1),validate=True).decode()
            root=ET.fromstring(xml)
            if root.get('request')!=request: raise RuntimeError('stale native hierarchy')
            return root,xml
        last=out[-1200:]; time.sleep(.25)
    raise RuntimeError('hierarchy probe failed: '+last)

def copy(root):
    return '\n'.join(' '.join(n.get(k,'') for k in ('text','content-desc')) for n in root.iter('node'))

def wait(expected:str, timeout:int=30):
    end=time.monotonic()+timeout; last=''
    while time.monotonic()<end:
        root,_=hierarchy(); last=copy(root)
        if expected.casefold() in last.casefold(): return root
        time.sleep(.25)
    raise RuntimeError('UI did not show '+expected+'\n'+last[-1800:])

def clickable_bounds(root,label:str):
    parents={c:p for p in root.iter() for c in p}
    hits=[]
    needle=label.casefold()
    for node in root.iter('node'):
        vals=[node.get(k,'').strip().casefold() for k in ('text','content-desc')]
        if not any(needle in v for v in vals): continue
        target=node
        while target.get('clickable')!='true' and target in parents: target=parents[target]
        if target.get('clickable')!='true' or target.get('enabled')=='false': continue
        m=re.fullmatch(r'\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\]',target.get('bounds',''))
        if m:
            x1,y1,x2,y2=map(int,m.groups())
            if x2>x1>=0 and y2>y1>=0: hits.append((x1,y1,x2,y2,target))
    if not hits: raise RuntimeError('No enabled native control labelled '+label)
    return min(hits,key=lambda h:(h[2]-h[0])*(h[3]-h[1]))

def tap(root,label:str):
    x1,y1,x2,y2,_=clickable_bounds(root,label)
    ACTIONS.append({'label':label,'bounds':[x1,y1,x2,y2],'snapshot':root.get('request')})
    adb('shell','input','tap',str((x1+x2)//2),str((y1+y2)//2))
    time.sleep(.25)

def reach(label:str, scroll:bool=False):
    for _ in range(12 if scroll else 5):
        root,_=hierarchy()
        try:
            clickable_bounds(root,label)
            return root
        except RuntimeError:
            if scroll:
                size=adb('shell','wm','size').splitlines()[-1]
                w,h=map(int,re.search(r'(\d+)x(\d+)',size).groups())
                adb('shell','input','swipe',str(w//2),str(int(h*.72)),str(w//2),str(int(h*.42)),'260')
            time.sleep(.2)
    raise RuntimeError('Could not reach '+label)

def find_tap(label:str, scroll:bool=False):
    root=reach(label,scroll=scroll)
    tap(root,label)

def capture(out:Path,name:str):
    png=subprocess.run(['adb','exec-out','screencap','-p'],capture_output=True,check=True,timeout=20).stdout
    if not png.startswith(b'\x89PNG\r\n\x1a\n'): raise RuntimeError('no screenshot')
    (out/(name+'.png')).write_bytes(png)
    root,xml=hierarchy()
    (out/(name+'.xml')).write_text(xml)
    (out/(name+'.txt')).write_text(copy(root))
    return root

def assert_inside(root,label,w,h):
    x1,y1,x2,y2,_=clickable_bounds(root,label)
    assert 0<=x1<x2<=w and 0<=y1<y2<=h, (label,[x1,y1,x2,y2],[w,h])

def assert_min_touch(root,label,density):
    x1,y1,x2,y2,_=clickable_bounds(root,label)
    min_px=48*density/160
    assert x2-x1>=min_px*.86 and y2-y1>=min_px*.86, (label,[x1,y1,x2,y2],min_px)

def launch():
    comp=adb('shell','cmd','package','resolve-activity','--brief',PACKAGE).splitlines()[-1]
    if not comp.startswith(PACKAGE+'/'): raise RuntimeError('launcher unresolved '+comp)
    out=adb('shell','am','start','-W','-n',comp)
    if 'Error:' in out: raise RuntimeError(out)
    time.sleep(1)

def scenario(out:Path,name:str,size:str,density:int,font_scale:float):
    # Resize only while the game owns the foreground. Resizing Pixel Launcher directly can
    # trigger a launcher ANR on cold Android emulators and would invalidate window evidence.
    w,h=map(int,size.split('x'))
    adb('shell','wm','size',size)
    adb('shell','wm','density',str(density))
    adb('shell','settings','put','system','font_scale',str(font_scale),check=False)
    time.sleep(.8)
    root=wait('CART & CROWN')
    capture(out,name+'-overview')

    # Building action card and real 48dp touch targets.
    tap(root,'Barracks')
    root=wait('Inspect Barracks')
    capture(out,name+'-building-actions')
    for label in ('Inspect Barracks','Move Barracks','Review upgrade for Barracks','Close building actions'):
        assert_inside(root,label,w,h); assert_min_touch(root,label,density)

    tap(root,'Inspect Barracks')
    wait('Current · Level 2')
    capture(out,name+'-inspect')
    root=reach('Close details',scroll=True)
    capture(out,name+'-inspect-scrolled')
    assert_inside(root,'Close details',w,h)
    tap(root,'Close details')
    root=wait('Review upgrade for Barracks')

    tap(root,'Review upgrade for Barracks')
    wait('Upgrade review')
    capture(out,name+'-upgrade-review')
    root=reach('Confirm upgrade to Level 3',scroll=True)
    capture(out,name+'-upgrade-review-scrolled')
    assert_inside(root,'Confirm upgrade to Level 3',w,h)
    find_tap('Cancel upgrade',scroll=True)
    root=wait('Move Barracks')

    tap(root,'Move Barracks')
    root=wait('Tap an open plot')
    tap(root,'Plot nw')
    wait('Move to Northwest')
    capture(out,name+'-move-review')
    root=reach('Confirm free move',scroll=True)
    capture(out,name+'-move-review-scrolled')
    assert_inside(root,'Confirm free move',w,h)
    find_tap('Cancel move',scroll=True)
    root=wait('Close building actions')
    tap(root,'Close building actions')

    # Construction picker/review and preview ghost.
    root=wait('CART & CROWN')
    tap(root,'Plot nw')
    root=wait('Choose a blueprint')
    capture(out,name+'-blueprint-picker')
    assert 'PREVIEW' in copy(root)
    find_tap('Review Field Forge',scroll=True)
    wait('Review construction')
    capture(out,name+'-construction-review')
    root=reach('Build Field Forge',scroll=True)
    capture(out,name+'-construction-review-scrolled')
    assert 'Preview only' in copy(root)
    assert_inside(root,'Build Field Forge',w,h)
    tap(root,'Build Field Forge')
    root=wait('constructed')
    capture(out,name+'-constructed')
    assert 'Inspect Field Forge' in copy(root)
    assert 'Move Field Forge' in copy(root)
    assert 'Review upgrade for Field Forge' in copy(root)

    return {'name':name,'size':size,'density':density,'font_scale':font_scale,'status':'passed'}

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--apk',required=True,type=Path); p.add_argument('--probe',required=True,type=Path); p.add_argument('--out',required=True,type=Path)
    a=p.parse_args(); a.out.mkdir(parents=True,exist_ok=True)
    report={'fixture':'deterministic Fort settlement','native_emulator':True,'scenarios':[],'status':'failed'}
    try:
        assert adb('shell','getprop','ro.kernel.qemu')=='1' or adb('shell','getprop','ro.boot.qemu')=='1'
        adb('install','-r',str(a.apk.resolve()),timeout=120); adb('install','-r',str(a.probe.resolve()),timeout=120)
        # Bring the game to foreground at the emulator's default configuration first.
        launch(); wait('CART & CROWN')
        specs=[('compact-360x640','720x1280',320,1.0),('regular-large-text','1080x2400',420,1.35)]
        for index,spec in enumerate(specs):
            if index:
                # Restore while the game is foregrounded, then reinstall to reset the in-memory
                # deterministic fixture without touching production persistence code.
                adb('shell','wm','size','reset',check=False)
                adb('shell','wm','density','reset',check=False)
                adb('shell','settings','delete','system','font_scale',check=False)
                time.sleep(.8)
                adb('install','-r',str(a.apk.resolve()),timeout=120)
                launch(); wait('CART & CROWN')
            report['scenarios'].append(scenario(a.out,*spec))
        report['status']='passed'
    except Exception as e:
        report['error']=str(e)
        try: capture(a.out,'failure')
        except Exception as ce: report['capture_error']=str(ce)
        raise
    finally:
        (a.out/'settlement-smoke-report.json').write_text(json.dumps(report,indent=2))
        (a.out/'actions.json').write_text(json.dumps(ACTIONS,indent=2))
        (a.out/'logcat.txt').write_text(adb('logcat','-d','-v','threadtime',check=False))
        (a.out/'crash-buffer.txt').write_text(adb('logcat','-b','crash','-d',check=False))
        adb('shell','wm','size','reset',check=False); adb('shell','wm','density','reset',check=False)
        adb('shell','settings','delete','system','font_scale',check=False)
        print(json.dumps(report,indent=2))

if __name__=='__main__': main()
