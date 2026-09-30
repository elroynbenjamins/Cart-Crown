import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { formationShapes } from '../src/game/formation';
import { themes } from '../src/theme/themes';
import type { UnitDefinition } from '../src/game/types';
import * as model from '../src/ui/portraitBattle/model';

let checks = 0;
function check(condition: unknown, message: string) { assert.ok(condition, message); checks++; }
const snapshot = JSON.stringify(formationShapes);
for (const width of [240, 320, 360, 412, 480, 768]) for (const height of [480, 568, 640, 800, 915]) {
  for (const fontScale of [1, 1.3, 2]) {
    const layout = model.battleLayout(width, height, fontScale);
    check(layout.stageWidth <= width - 20, 'The full-width field must fit its container');
    check(layout.stageHeight >= 264, 'Six ranks need a minimum readable field height');
    for (const shape of formationShapes) for (const side of ['ally', 'enemy'] as const) {
      const full = model.stageTokens(shape, [0,1,2,3,4,5,6,7,8], side, layout.stageWidth, layout.stageHeight);
      check(full.length === 9, 'Every shape must retain nine actual slot anchors');
      for (let mask = 0; mask < 512; mask++) {
        const occupied = full.filter(p => mask & 1 << p.slot).map(p => p.slot);
        const sparse = model.stageTokens(shape, occupied, side, layout.stageWidth, layout.stageHeight);
        check(sparse.length === occupied.length, 'Do not invent or lose combatants');
        for (const point of sparse) {
          assert.deepEqual(point, full.find(p => p.slot === point.slot), 'Survivors moved after a removal'); checks++;
        }
      }
      for (const point of full) {
        const half = point.size * (point.size <= 32 ? 1.12 : 1) / 2;
        check(point.x - half >= 0 && point.x + half <= layout.stageWidth, 'Sprite/mount clips horizontally');
        check(point.y - half - 4 >= 0 && point.y + half + 4 <= layout.stageHeight, 'Animated sprite clips vertically');
        check(point.row === model.rankForSlot(shape, point.slot), 'Lost actual rank');
        check(side === 'enemy' ? point.y < layout.stageHeight / 2 : point.y > layout.stageHeight / 2, 'Crossed sides');
        for (const other of full.filter(p => p.slot > point.slot)) {
          const otherHalf = other.size * (other.size <= 32 ? 1.12 : 1) / 2;
          check(Math.abs(point.x - other.x) >= half + otherHalf || Math.abs(point.y - other.y) >= half + otherHalf + 4,
            'Squads overlap, including mount overscale and one active strike');
        }
      }
      const y = (row: model.Rank) => full.find(p => p.row === row)!.y;
      check(side === 'enemy' ? y('rear') < y('middle') && y('middle') < y('front') : y('front') < y('middle') && y('middle') < y('rear'), 'Both fronts must face the centre');
    }
  }
}
assert.equal(JSON.stringify(formationShapes), snapshot);
const wide = formationShapes.find(s => s.id === 'wide_vanguard_522')!;
const positions = model.stageTokens(wide, [0,1,2,3,4,5,6,7,8], 'ally', 340, 400);
const span = (row: model.Rank) => { const xs = positions.filter(p => p.row === row).map(p => p.x); return Math.max(...xs) - Math.min(...xs); };
check(span('front') > span('middle') * 3, 'Five-wide rank must look wider than two-wide ranks');
const mirror = model.stageTokens(wide, [0,1,2,3,4,5,6,7,8], 'enemy', 340, 400);
for (const p of positions) {
  const enemy = mirror.find(e => e.slot === p.slot)!;
  check(Math.abs(enemy.x + p.x - 340) < 1e-8 && Math.abs(enemy.y + p.y - 400) < 1e-8, 'Enemy perspective must mirror both axes');
}
assert.deepEqual(model.stageTokens(wide, [0,0,99,-1], 'ally', 340, 400).map(p => p.slot), [0]);
for (const width of [NaN, Infinity, -10]) check(Number.isFinite(model.battleLayout(width, NaN).stageWidth), 'Invalid dimension leaked into Yoga');

const unit: UnitDefinition = { id: 'test', name: 'Test', className: 'Archer', faction: 'human', role: 'ranged', tier: 1, level: 2, hp: 40, attack: 12, armor: 2, speed: 7 };
assert.equal(model.allyPortrait(unit), 'ranger_portrait');
for (const faction of ['elf','orc'] as const) assert.equal(model.allyPortrait({ ...unit, faction }), null);
for (const battleTags of [['magic'],['flying'],['large'],['construct'],['beast']] as UnitDefinition['battleTags'][]) assert.equal(model.allyPortrait({ ...unit, role: 'support', battleTags }), null);
for (const family of ['magic','flying','large','hybrid'] as const) assert.equal(model.enemyPortrait('melee','raider_pack','Raider',false,family), null);
assert.equal(model.enemyPortrait('melee','raider_pack','Hollow Warden',true), null);
assert.equal(model.healthFraction(NaN,20),0); assert.equal(model.healthFraction(100,0),0);
assert.equal(model.healthFraction(200,100),1); assert.equal(model.healthFraction(-20,100),0);
let history: model.ExchangeRecord[] = [];
for (let exchange=1;exchange<=30;exchange++) history=model.appendExchange(history,{exchange,dealt:2,taken:1,healed:0,skill:null});
assert.equal(history.length,5); assert.equal(history[0]!.exchange,26);
assert.deepEqual(model.appendExchange(history,history[4]!),history);

// Render the real TSX with small host stubs. Geometry/interaction checks are not native screenshots.
const appearance = { theme: themes.dark };
let dimensions = { width: 360, height: 640, fontScale: 1 }, states: any[] = [], index=0;
const react: any = { __esModule:true, Fragment:'Fragment', memo:(fn:any)=>fn,
  createElement:(type:any,props:any,...children:any[])=>({type,props:{...props,children}}),
  useEffect:()=>{}, useState:(initial:any)=>{
    const key=index++; if (!(key in states)) states[key]=typeof initial==='function'?initial():initial;
    return [states[key],(next:any)=>{states[key]=typeof next==='function'?next(states[key]):next;}];
  }
}; react.default=react;
const file=readFileSync('src/ui/portraitBattle/PortraitBattleView.tsx','utf8');
const output=ts.transpileModule(file,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
const loaded={exports:{} as any};
new Function('require','module','exports',output)((name:string)=>{
  if(name==='react')return react;
  if(name==='react-native')return {Platform:{OS:'android'},View:'View',Text:'Text',Pressable:'Pressable',ScrollView:'ScrollView',Modal:'Modal',Animated:{View:'AnimatedView'},StyleSheet:{create:(s:any)=>s},useWindowDimensions:()=>dimensions};
  if(name==='./model')return model;
  if(name==='./Art')return {ReferenceArt:'ReferenceArt'};
  if(name.endsWith('ThemeProvider'))return {useGameTheme:()=>appearance};
  if(name.endsWith('gameArt'))return {UnitSprite:'UnitSprite',EnemySprite:'EnemySprite'};
  if(name.endsWith('battleVisuals'))return Object.fromEntries(['BattlefieldBackdrop','BattleStatusMarker','BattleVfxStrip','EnemyFantasyStrikeVfx','EnemyFantasyThreatAura'].map(n=>[n,n]));
  throw new Error(name);
},loaded,loaded.exports);
function expand(t:any):any { if(Array.isArray(t))return t.map(expand);if(!t?.props)return t;
  if(typeof t.type==='function')return expand(t.type(t.props));if(t.type==='Modal'&&!t.props.visible)return null;
  return {...t,props:{...t.props,children:expand(t.props.children)}};
}
function nodes(t:any):any[]{return Array.isArray(t)?t.flatMap(nodes):t?.props?[t,...nodes(t.props.children)]:[];}
let speed=0,pause=0,complete=0;
const props:any={encounterId:'hold_the_road',encounterName:'Hold the Road',enemyName:'Raiders',difficulty:'Normal',faction:'human',enemyProfile:'raider_pack',
  formation:[unit.id,null,null,null,null,null,null,null,null],units:[unit],shape:formationShapes[0],enemyShape:formationShapes[0],
  enemies:[{slot:0,row:'front',role:'melee',label:'Raider',down:false,boss:false}],partyHp:35,partyMaxHp:40,enemyHp:12,enemyMaxHp:50,
  turn:2,speed:1,paused:false,controlsLocked:false,outcome:null,activeSlot:0,enemySlot:0,supportSlots:[],activeRole:'ranged',healed:0,
  attackPulse:{interpolate:()=>0},impactPulse:{interpolate:()=>0},records:[{exchange:2,dealt:12,taken:4,healed:0,skill:null}],initialLog:'Ready',
  matchup:'Neutral',effects:[],status:null,onToggleSpeed:()=>speed++,onTogglePause:()=>pause++,onComplete:()=>complete++};
function render(overrides:any={}){index=0;return expand(loaded.exports.PortraitBattleView({...props,...overrides}));}
for(const theme of Object.values(themes))for(const w of [320,360,412])for(const outcome of [null,'victory','defeat']){
  states=[];appearance.theme=theme;dimensions={width:w,height:800,fontScale:1};const tree=render({outcome}),flat=nodes(tree);
  const scroll=flat.find(n=>n.type==='ScrollView'),content=nodes(scroll);
  const footer=flat.find(n=>n.props.testID==='battle-outcome-actions');
  check(footer&&!content.includes(footer),'Outcome footer must stay outside the scrolling field');
  const position=(id:string)=>content.findIndex(n=>n.props.testID===id);
  check(position('enemy-portrait-rail')<position('portrait-battle-stage')&&position('portrait-battle-stage')<position('ally-portrait-rail'),'Enemy top / battlefield middle / ally bottom order');
  for(const id of ['enemy-portrait-rail','ally-portrait-rail'])check(content[position(id)].props.horizontal===true,'Both rails must be horizontal');
  check(flat.filter(n=>n.props.accessibilityLabel?.includes('shared army HP')).length===2,'Exactly two shared army health bars');
  if(outcome){flat.find(n=>n.props.accessibilityLabel===(outcome==='victory'?'View Results':'View Defeat Report')).props.onPress();}
  else {flat.find(n=>n.props.accessibilityLabel==='Battle speed 1 times').props.onPress();flat.find(n=>n.props.accessibilityLabel==='Pause battle').props.onPress();}
}
assert.equal(speed,9);assert.equal(pause,9);assert.equal(complete,18);
states=[];let tree=render();
let rail=nodes(tree).find(n=>n.props.testID==='ally-portrait-rail');
nodes(rail).find(n=>n.type==='Pressable').props.onPress();
tree=render();rail=nodes(tree).find(n=>n.props.testID==='ally-portrait-rail');
check(nodes(rail).some(n=>n.props.accessibilityState?.selected),'Tapping portrait selects its stable slot');
check(nodes(tree).some(n=>n.props.testID==='ally-stage-slot-0'),'Selection must not remove its battlefield unit');
nodes(rail).find(n=>n.type==='Pressable').props.onLongPress();
check(nodes(render()).some(n=>n.type==='Modal'&&n.props.visible),'Long press opens actual squad details');
states=[];tree=render({controlsLocked:true});
for(const label of ['Battle speed 1 times','Pause battle','Combat log'])check(nodes(tree).find(n=>n.props.accessibilityLabel===label).props.disabled,'Tutorial must lock controls');
const controller=readFileSync('src/screens/BattleScreen.tsx','utf8');
check(controller.includes('manualPaused ||\n      pausedForTutorial'),'Manual pause must stop real combat timer');
check(controller.includes('!battleEnded || !outcomeCommitGateRef.current()'),'Outcome settlement must be one-shot');
check(controller.includes('else onDefeated(summary)'),'Preserve defeat report callback');
check(controller.includes('setExchangeHistory(previous => appendExchange'),'Log must use live exchange telemetry');
check(controller.includes('fantasyThreat={encounter.fantasyThreat}')&&file.includes('fantasyThreat={p.fantasyThreat} role={item.role}'),'Fantasy/role forwarding must survive integration');
check(file.includes('EnemyFantasyStrikeVfx')&&file.includes('progress={p.impactPulse}'),'Retain fantasy strike effects');
console.log(`PASS: ${checks} stable-slot, formation-rank, geometry, portrait-selection, control and real-TSX checks.`);

// Class-art integration is part of the existing CI portrait gate.
import './human-battle-art-regression';
