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
      const expectedAnchors = shape.rows.front.length + shape.rows.middle.length + shape.rows.rear.length;
      check(full.length === expectedAnchors, shape.name + ' must retain every authored slot anchor');
      check(
        ['forward_line_411', 'iron_wall_501', 'layered_core_231'].includes(shape.id)
          ? expectedAnchors === 6
          : expectedAnchors === 9,
        shape.name + ' has an unexpected authored position count'
      );
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
      const rowOrder: model.Rank[] = side === 'enemy'
        ? ['rear', 'middle', 'front']
        : ['front', 'middle', 'rear'];
      const rowYs = rowOrder.flatMap(row => {
        const point = full.find(candidate => candidate.row === row);
        return point ? [point.y] : [];
      });
      check(
        rowYs.every((value, index) => index === 0 || rowYs[index - 1]! < value),
        'Both fronts must face the centre, including shapes with an intentionally empty rank'
      );
    }
  }
}
assert.equal(JSON.stringify(formationShapes), snapshot);

for (const state of ['stable', 'pressured', 'breaking', 'breached'] as const) {
  const copy = model.stageIntegrityReadout(53.8, state);
  check(copy.percent === 54, 'Integrity should use real, bounded army percent');
  check(copy.label.toLowerCase() === state, 'Integrity label must match the combat engine');
  check(copy.fractured === (state === 'breaking' || state === 'breached'),
    'Ground fractures must appear only when formation integrity is genuinely breaking');
}
check(model.stageIntegrityReadout(-10, 'breached').percent === 0, 'Never show negative integrity');
check(model.stageIntegrityReadout(120, 'stable').percent === 100, 'Never exceed full integrity');
check(model.stageIntegrityReadout(NaN, 'stable').percent === 100, 'Invalid integrity values must be safe');
for (const shape of formationShapes) for (const width of [240, 320, 412]) {
  const friendly = model.stageTokens(shape, [0,1,2,3,4,5,6,7,8], 'ally', width, 320);
  const hostile = model.stageTokens(shape, [0,1,2,3,4,5,6,7,8], 'enemy', width, 320);
  const start = friendly[0]!, end = hostile[0]!;
  for (const role of ['ranged', 'cavalry'] as const) {
    const trail = model.stageAttackTrail(friendly, hostile, start.slot, end.slot, role, 9);
    check(trail !== null && trail.kind === (role === 'ranged' ? 'arrow' : 'charge'),
      'Role-specific trajectories must derive from real source and enemy slots');
    check(Boolean(trail) && Math.abs((trail!.x + trail!.dx) - end.x) < 0.001 && trail!.dy < 0,
      'Ranged and mounted trails must travel toward the actual enemy, never away');
  }
  for (const damage of [0, -3, NaN, Infinity]) {
    check(model.stageAttackTrail(friendly, hostile, start.slot, end.slot, 'ranged', damage) === null,
      'No projectile should claim a successful strike without real damage');
  }
  check(model.stageAttackTrail(friendly, hostile, null, end.slot, 'ranged', 5) === null,
    'Missing ally slot cannot fabricate a projectile');
  check(model.stageAttackTrail(friendly, hostile, start.slot, null, 'cavalry', 5) === null,
    'Missing enemy target cannot fabricate a charge');
  check(model.stageAttackTrail(friendly, hostile, start.slot, end.slot, 'support', 5) === null,
    'Support must not masquerade as mounted or ranged');
}
// Cracking ground lines must follow the actual formation, not fixed % offsets.
for (const shape of formationShapes) for (const width of [240, 320, 412]) for (const height of [264, 400]) {
  for (const side of ['ally', 'enemy'] as const) {
    const tokens = model.stageTokens(shape, [0,1,2,3,4,5,6,7,8], side, width, height);
    const line = model.stageFractureLine(tokens, side, width, height);
    check(Boolean(line), 'Populated army always has an anchored fracture line');
    check(line!.left >= 4 && line!.top >= 4 && line!.left + line!.width <= width - 4,
      'Line fracture must stay inside the visible stage at compact widths');
    const rank = tokens.some(unit => unit.row === 'front')
      ? tokens.filter(unit => unit.row === 'front') : tokens;
    const frontY = rank[0]!.y;
    check(side === 'enemy' ? line!.top > frontY : line!.top < frontY,
      'Fracture should appear on the contact-facing side of the occupied frontline');
  }
}
const oneShape = formationShapes.find(shape => shape.id === 'iron_wall_501')!;
const deepShape = formationShapes.find(shape => shape.id === 'layered_core_231')!;
const ironFracture = model.stageFractureLine(model.stageTokens(oneShape,
  [0,1,2,3,4,5,6,7,8], 'ally', 340, 400), 'ally', 340, 400)!;
const deepFracture = model.stageFractureLine(model.stageTokens(deepShape,
  [0,1,2,3,4,5,6,7,8], 'ally', 340, 400), 'ally', 340, 400)!;
check(ironFracture.width > deepFracture.width * 1.3,
  'Iron Wall cracks must read substantially wider than Layered Core');
check(model.stageFractureLine([], 'ally', 340, 400) === null,
  'No squads means no fabricated line-break indicator');
check(model.stageFractureLine([], 'enemy', 340, 400) === null,
  'No enemy actors means no fabricated enemy line-break indicator');

// Active orders must have truthful positions using actually occupied actors.
for (const shape of formationShapes) for (const width of [240, 320, 412]) for (const height of [264, 400]) {
  const ally = model.stageTokens(shape, [0,1,2,3,4,5,6,7,8], 'ally', width, height);
  const enemy = model.stageTokens(shape, [0,1,2,3,4,5,6,7,8], 'enemy', width, height);
  const source = JSON.stringify([ally, enemy]);
  for (const id of ['hold', 'focus', 'push', 'reinforce'] as const) {
    const band = model.stageOrderBand(id, ally, enemy, enemy[0]!.slot, width, height);
    check(Boolean(band) && band!.id === id, 'Genuine active orders must project an appropriate battlefield signal');
    check(Boolean(band) && band!.left >= 4 && band!.width >= 40 && band!.left + band!.width <= width - 4,
      'Order signal must stay inside the actual stage width even at compact sizes');
    check(Boolean(band) && band!.top >= 4 && band!.top <= height - 18,
      'Order signal must stay inside the stage height');
    check(band!.label.length > 0, 'On-stage signal needs a legible distinct order label');
  }
  check(model.stageOrderBand(null, ally, enemy, enemy[0]!.slot, width, height) === null,
    'No selected order may imply a defensive or offensive stance');
  check(model.stageOrderBand('unknown', ally, enemy, enemy[0]!.slot, width, height) === null,
    'Unknown orders must never invent a tactical effect');
  check(model.stageOrderBand('focus', ally, enemy, null, width, height) === null,
    'Focus must not invent an enemy target when no target is known');
  check(model.stageOrderBand('hold', [], enemy, enemy[0]!.slot, width, height) === null,
    'Hold cannot create a shield wall without active squads');
  check(JSON.stringify([ally, enemy]) === source,
    'Drawing an order signal cannot rearrange authored formation positions');
}
for (const shape of formationShapes) {
  const before = JSON.stringify(shape);
  const readout = model.stageFormationReadout(shape);
  check(readout.ranks === shape.rows.front.length + ' front · ' + shape.rows.middle.length +
    ' mid · ' + shape.rows.rear.length + ' rear',
    'Battle formation count must describe authored rank positions');
  check(readout.label.includes(shape.name) && readout.posture.length > 0,
    'Formation identity must be legible without opening a detail modal');
  check(JSON.stringify(shape) === before, 'Battle readout cannot mutate formation rules');
}
check(model.stageFormationReadout(compactShapePlaceholder('iron_wall_501')).posture === 'No middle rank',
  'Iron Wall must warn that its middle rank is intentionally absent');
check(model.stageFormationReadout(compactShapePlaceholder('layered_core_231')).posture === 'Protected center',
  'Layered Core must visually communicate its deep reserve');
check(model.stageRoleLetters.frontline !== model.stageRoleLetters.ranged &&
  model.stageRoleLetters.support !== model.stageRoleLetters.cavalry,
  'Distinct battlefield roles need distinct compact markers');
function compactShapePlaceholder(id: string) {
  return formationShapes.find(shape => shape.id === id)!;
}

const wide = formationShapes.find(s => s.id === 'wide_vanguard_522')!;
const positions = model.stageTokens(wide, [0,1,2,3,4,5,6,7,8], 'ally', 340, 400);
const span = (row: model.Rank) => { const xs = positions.filter(p => p.row === row).map(p => p.x); return Math.max(...xs) - Math.min(...xs); };
check(span('front') > span('middle') * 3, 'Five-wide rank must look wider than two-wide ranks');

const compactShape = (id: string) => formationShapes.find(candidate => candidate.id === id)!;
const ironStage = model.stageTokens(compactShape('iron_wall_501'), [0,1,2,3,4,5], 'enemy', 340, 400);
const layeredStage = model.stageTokens(compactShape('layered_core_231'), [0,1,2,3,4,5], 'enemy', 340, 400);
const balancedStage = model.stageTokens(compactShape('balanced_333'), [0,1,2,3,4,5,6,7,8], 'enemy', 340, 400);
const rowSpan = (tokens: model.StageToken[], row: model.Rank) => {
  const xs = tokens.filter(token => token.row === row).map(token => token.x);
  return xs.length > 1 ? Math.max(...xs) - Math.min(...xs) : 0;
};
const rowY = (tokens: model.StageToken[], row: model.Rank) => tokens.find(token => token.row === row)!.y;
const rowSize = (tokens: model.StageToken[], row: model.Rank) => tokens.find(token => token.row === row)!.size;
const frontDepth = model.stageDepthVisual('front');
const middleDepth = model.stageDepthVisual('middle');
const rearDepth = model.stageDepthVisual('rear');
check(frontDepth.scale > middleDepth.scale && middleDepth.scale > rearDepth.scale, 'Ranks must recede in perspective from front to rear');
check(frontDepth.shadowScale > middleDepth.shadowScale && middleDepth.shadowScale > rearDepth.shadowScale, 'Ground shadows must narrow with reserve depth');
check(frontDepth.shadowOpacity > middleDepth.shadowOpacity && middleDepth.shadowOpacity > rearDepth.shadowOpacity, 'Ground shadows must soften with reserve depth');
check(frontDepth.zIndex > middleDepth.zIndex && middleDepth.zIndex > rearDepth.zIndex, 'Contact ranks must draw above supporting ranks');
check(rowSize(balancedStage, 'front') > rowSize(balancedStage, 'middle'), 'Balanced frontline must carry more visual presence than its middle rank');
check(rowSize(balancedStage, 'middle') > rowSize(balancedStage, 'rear'), 'Balanced rear reserve must visibly recede behind the middle rank');
check(rowSpan(ironStage, 'front') > rowSpan(layeredStage, 'front') * 5, 'Iron Wall must read as a much broader packed line than Layered Core');
check(rowY(ironStage, 'front') > rowY(balancedStage, 'front') + 5, 'Iron Wall frontline should visibly press toward first contact');
check(rowY(layeredStage, 'front') < rowY(balancedStage, 'front') - 2, 'Layered Core screen should sit more cautiously behind first contact');
check(rowY(layeredStage, 'middle') < rowY(balancedStage, 'middle') - 8, 'Layered Core middle rank should visibly read as a deeper reserve');
check(rowY(layeredStage, 'rear') < rowY(balancedStage, 'rear') - 5, 'Layered Core rear rank should visibly read as protected depth');
check(rowSize(ironStage, 'front') > rowSize(balancedStage, 'front'), 'Iron Wall frontline should carry the strongest silhouette weight');
check(rowSize(layeredStage, 'rear') < rowSize(balancedStage, 'rear'), 'Layered Core reserve should recede visually rather than reading like another frontline');

const forwardMotion = model.stageExchangeMotion(compactShape('forward_line_411'), 'front');
const layeredMiddleMotion = model.stageExchangeMotion(compactShape('layered_core_231'), 'middle');
const ironMotion = model.stageExchangeMotion(compactShape('iron_wall_501'), 'front');
const neutralMotion = model.stageExchangeMotion(compactShape('balanced_333'), 'front');
check(forwardMotion.advance >= 1.5 && forwardMotion.reinforce === 0 && forwardMotion.brace === 0,
  'Forward Line must surge as one front rank without borrowing reserve/brace motion');
check(layeredMiddleMotion.reinforce >= 1.5 && layeredMiddleMotion.advance === 0,
  'Layered Core middle rank must visibly feed forward after contact');
check(ironMotion.brace > 0 && ironMotion.impactScaleY < 1,
  'Iron Wall must visibly absorb impact as a braced compressed line');
assert.deepEqual(neutralMotion, { advance: 0, reinforce: 0, brace: 0, impactScaleY: 1 });
for (const shape of formationShapes) for (const row of model.ranks) {
  const motion = model.stageExchangeMotion(shape, row);
  check(motion.advance <= 2 && motion.reinforce <= 2 && motion.brace <= 1,
    'Formation personality motion must stay subtle and inside contact-clearance budgets');
  check(motion.impactScaleY >= .94 && motion.impactScaleY <= 1,
    'Impact compression must stay readable without collapsing the sprite');
}

const mirror = model.stageTokens(wide, [0,1,2,3,4,5,6,7,8], 'enemy', 340, 400);
for (const p of positions) {
  const enemy = mirror.find(e => e.slot === p.slot)!;
  check(Math.abs(enemy.x + p.x - 340) < 1e-8 && Math.abs(enemy.y + p.y - 400) < 1e-8, 'Enemy perspective must mirror both axes');
}
assert.deepEqual(model.stageTokens(wide, [0,0,99,-1], 'ally', 340, 400).map(p => p.slot), [0]);
for (const width of [NaN, Infinity, -10]) check(Number.isFinite(model.battleLayout(width, NaN).stageWidth), 'Invalid dimension leaked into Yoga');

const unit: UnitDefinition = { id: 'test', name: 'Test', className: 'Archer', faction: 'human', role: 'ranged', tier: 1, level: 2, hp: 40, attack: 12, armor: 2, speed: 7 };
assert.equal(model.allyPortrait(unit), 'human_ranger_portrait');
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
  if(name==='./IllustratedBattlefieldBackdrop')return {IllustratedBattlefieldBackdrop:'IllustratedBattlefieldBackdrop'};
  if(name==='../bossPresentation')return { getBossPresentation:()=>null };
  if(name==='../BossStageSilhouette')return { BossStageSilhouette:'BossStageSilhouette' };
  if(name==='./Art')return {ReferenceArt:'ReferenceArt'};
  if(name.endsWith('ThemeProvider'))return {useGameTheme:()=>appearance};
  if(name.endsWith('gameArt'))return {UnitSprite:'UnitSprite',UnitPortraitSprite:'UnitPortraitSprite',EnemySprite:'EnemySprite'};
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

for (const difficulty of ['Normal', 'Elite', 'Boss'] as const) {
  const cue = model.battleSpectacleCue(difficulty);
  check(cue.prominence === (difficulty === 'Boss' ? 3 : difficulty === 'Elite' ? 2 : 1),
    'Encounter threat prominence must match the actual mission difficulty');
  check(cue.label.includes(difficulty === 'Normal' ? 'FIELD' : difficulty.toUpperCase()),
    'Threat labels must be authored and legible rather than inferred from enemy names');
}
for (const theme of Object.values(themes)) for (const difficulty of ['Normal', 'Elite', 'Boss'] as const) {
  appearance.theme = theme;
  states=[];
  const enemies = [{ ...props.enemies[0], boss: difficulty === 'Boss' }];
  const battlefield = render({ difficulty, enemies });
  const all = nodes(battlefield);
  const header = all.find(node => node.props.testID === 'battle-threat-cue');
  check(Boolean(header), 'All encounters must show a difficulty cue.');
  check(nodes(header).some(node => node.type === 'Text' && String(node.props.children).includes(
    difficulty === 'Boss' ? 'BOSS' : difficulty === 'Elite' ? 'ELITE' : 'FIELD')),
    'Encounter difficulty must be visible in light and dark themes.');
  check(all.filter(node => String(node.props.testID ?? '').startsWith('boss-actor-identity-')).length === (difficulty === 'Boss' ? 1 : 0),
    'Only a real boss token receives the boss insignia.');
  check(all.filter(node => String(node.props.testID ?? '').startsWith('boss-stage-ground-')).length === (difficulty === 'Boss' ? 1 : 0),
    'Only living bosses receive the enhanced static ground silhouette.');
  check(all.filter(node => String(node.props.testID ?? '').startsWith('enemy-stage-role-')).length === (difficulty === 'Boss' ? 0 : 1),
    'Normal and Elite enemies need role labels; named bosses keep their own insignia.');
  check(all.filter(node => String(node.props.testID ?? '').startsWith('ally-stage-role-')).length === 1,
    'The existing Human squad role is readable directly on the stage.');
  check(all.some(node => node.props.testID === 'battle-target-lock-0'),
    'The current target must have a static anchor even before motion preference resolves.');
  for (const id of ['ally-formation-posture', 'enemy-formation-posture']) {
    check(all.some(node => node.props.testID === id),
      'Both factions require an in-place formation posture readout: ' + id);
  }
  check(all.filter(node => String(node.props.testID ?? '').startsWith('battle-target-spark-')).length === 0,
    'No decorative hit sparks before reduced motion preference resolves.');
}
check(!file.includes('Animated.loop(') && !file.includes('setInterval('),
  'Battle spectacle must reuse the exchange pulse, not add a new animation clock.');
states=[];appearance.theme=themes.dark;
const pausedTree = nodes(render({ paused: true, difficulty: 'Boss', enemies: [{ ...props.enemies[0], boss: true }] }));
check(pausedTree.some(node => node.props.testID === 'battle-target-lock-0'),
  'Paused and reduced-motion combat still needs a legible locked target');
check(pausedTree.some(node => node.props.testID === 'boss-stage-ground-0'),
  'Boss stage identity remains visible while animation is paused');
const routedTree = nodes(render({ enemies: [{ ...props.enemies[0], down: true, boss: true }] }));
check(!routedTree.some(node => String(node.props.testID ?? '').startsWith('boss-stage-ground-')) &&
  !routedTree.some(node => String(node.props.testID ?? '').startsWith('battle-target-lock-')),
  'Routed bosses must not retain misleading active threat and target indicators');

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
check(controller.includes('partyIntegrity={partyIntegrity}') && controller.includes('enemyIntegrity={enemyIntegrity}') &&
  controller.includes('partyIntegrityState={partyIntegrityState}') && controller.includes('enemyIntegrityState={enemyIntegrityState}'),
  'Combat engine must pass genuine integrity values and states to the renderer');
check(controller.includes('outgoingDamage={exchangeFeedback?.outgoing ?? 0}') &&
  controller.includes('incomingDamage={exchangeFeedback?.incoming ?? 0}'),
  'Visible hits must use finalized real damage, not role or animation guesses');
check(file.includes('stageAttackTrail(allyPositions, enemyPositions') &&
  file.includes("testID={'battle-' + trail.kind + '-trajectory'}") &&
  file.includes('p.outgoingDamage > 0 ? p.activeRole : null'),
  'Projectile and contact VFX must be gated to actual damage and existing pulses');
check(file.includes("stageFractureLine(allyPositions, 'ally'") &&
  file.includes("stageFractureLine(enemyPositions, 'enemy'") &&
  file.includes('backgroundColor: theme.colors.surface1 + \'E0\''),
  'Break indicators must follow the occupied line and active field order must remain legible in light themes');
check(file.includes('ally-facing-') && file.includes('enemy-facing-') &&
  file.includes('ally-line-fracture') && file.includes('enemy-line-fracture'),
  'Both armies must visibly show engagement direction and actual formation damage');
check(file.includes("testID={'battle-field-order-' + onFieldOrder.id}") &&
  file.includes('stageOrderBand(activeOrder?.id ?? null') &&
  file.includes('color: factionAccent') &&
  file.includes('borderColor: factionAccent'),
  'Battlefield posture must reflect real order selection and current faction, not a Human-only marker');
check(file.includes("zIndex: 4, alignItems: 'center'"),
  'Range/charge trails must sit behind fighters rather than crossing their bodies');
check(file.includes('ongoing && activeOrder ? <Text testID="active-battle-order-cue"'),
  'A finished battle must never advertise a commander order as still active');
check(file.includes('active-battle-order-cue') && file.includes('order.selected'),
  'Only genuinely active commander orders may appear as battle-state cues');

check(controller.includes('fantasyThreat={encounter.fantasyThreat}')&&file.includes('fantasyThreat={p.fantasyThreat} role={item.role}'),'Fantasy/role forwarding must survive integration');
check(file.includes('EnemyFantasyStrikeVfx')&&file.includes('progress={p.impactPulse}'),'Retain fantasy strike effects');
check(file.includes('stageDepthVisual(position.row)'),'Battlefield actors must consume their rank-depth presentation');
check(file.includes('UnitPortraitSprite'),'Portrait rails must use cropped production unit art when dedicated portrait art is unavailable');
check(file.includes('presentationScale={1.08}'),'Battlefield figures must receive the subtle larger presentation scale');
check(file.includes('zIndex: depth.zIndex'),'Rank depth must control battlefield draw order');
check(file.includes('shadowScale')&&file.includes('shadowOpacity'),'Rank depth must alter shadow footprint and opacity');
check(file.includes('stageExchangeMotion(p.shape, position.row)')&&file.includes('stageExchangeMotion(p.enemyShape, position.row)'),
  'Both armies must consume formation-specific contact motion');
check(file.includes('impactRing')&&file.includes('opacity: moving ? p.impactPulse : 0'),
  'Targeted hits need one restrained pulse-driven impact marker');
check(file.includes('Math.min(.95, motion.impactScaleY)'),
  'Targeted enemies need a stronger but bounded impact squash');
check(!file.includes('Animated.loop(')&&!file.includes('setInterval('),
  'Contact personality must reuse existing exchange pulses instead of adding animation clocks');
console.log(`PASS: ${checks} stable-slot, formation-rank, depth, contact-motion, geometry, portrait-selection, control and real-TSX checks.`);
