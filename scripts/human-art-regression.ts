import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import { humanArtIds, humanClassArt, humanArtFrames, humanPortraitForClass, humanFigureForClass } from '../src/ui/portraitBattle/humanArt';
import { allyPortrait, figureForPortrait, enemyPortrait } from '../src/ui/portraitBattle/model';
import type { UnitDefinition, UnitRole } from '../src/game/types';

const roles: Record<string, UnitRole> = {
  Swordsman:'melee', Archer:'ranged', Ranger:'ranged', Scout:'skirmish',
  'Field Chaplain':'support', 'Shield Infantry':'frontline', 'Man-at-Arms':'frontline',
  Spearman:'frontline', Lancer:'cavalry', Crossbowman:'ranged', 'Field Medic':'support',
  Halberdier:'frontline', 'Banner Captain':'support', 'Heavy Cavalry':'cavalry', 'Royal Guard':'frontline'
};
const unit: UnitDefinition = {id:'test',name:'Test',className:'Swordsman',faction:'human',role:'melee',tier:1,level:1,hp:50,attack:10,armor:2,speed:8};
let checks=0;
for (const [className,role] of Object.entries(roles)) {
  const actual=allyPortrait({...unit,className,role});
  assert.equal(actual,`human_${humanClassArt[className]}_portrait`); checks++;
  assert.ok(actual); assert.ok(humanArtFrames[actual as keyof typeof humanArtFrames]);
  assert.ok(humanArtFrames[figureForPortrait(actual) as keyof typeof humanArtFrames]); checks+=2;
  for (const faction of ['elf','orc'] as const) {
    assert.equal(allyPortrait({...unit,className,role,faction}),null); checks++;
  }
  for (const tag of ['magic','flying','large','construct','beast'] as const) {
    assert.equal(allyPortrait({...unit,className,role,battleTags:[tag]}),null); checks++;
  }
}
for (const className of Object.keys(roles)) {
  assert.equal(humanFigureForClass('human', className), `human_${humanClassArt[className]}_unit`);
  assert.equal(humanFigureForClass('elf', className), null);
  assert.equal(humanFigureForClass('orc', className), null);
}
assert.equal(humanFigureForClass('human', 'Mounted Archer'), null);
assert.equal(humanFigureForClass('human', '__proto__'), null);
const gameArtSource=readFileSync('src/ui/gameArt.tsx','utf8');
assert.ok(gameArtSource.includes('humanFigureForClass(faction, className)'));
assert.ok(gameArtSource.includes('fallback={fallback} /> : fallback'));
assert.ok(readFileSync('src/ui/portraitBattle/PortraitBattleView.tsx','utf8').includes('<UnitSprite preferHumanArt={false}'), 'Image-error fallback must not request the same failed asset again');
assert.equal(Object.keys(roles).length,Object.keys(humanClassArt).length);
assert.equal(humanArtIds.length,12);
assert.equal(new Set(Object.values(humanClassArt)).size,12,'Every new pair must be reachable');
for(const className of ['Recruit','Militia','Greatswordsman','Champion','Mounted Archer','Siege Engineer','Griffin Rider','Unknown','constructor','__proto__']) {
  assert.equal(allyPortrait({...unit,className}),null,'Unsupported classes keep their own art'); checks++;
}
assert.equal(humanPortraitForClass('human','Lancer','melee'),null);
assert.equal(humanPortraitForClass('human','Crossbowman','support'),null);
assert.equal(enemyPortrait('melee','raider_pack','Raider',false),'raider_portrait');
assert.equal(enemyPortrait('ranged','missile_company','Bow Raider',false),'missile_portrait');
assert.equal(enemyPortrait('melee','raider_pack','Hollow Warden',true),null);
for(const threat of ['magic','flying','large','hybrid'] as const) assert.equal(enemyPortrait('melee','raider_pack','Threat',false,threat),null);

const manifest=JSON.parse(readFileSync('assets/game/battle_portraits/human/manifest.json','utf8'));
assert.equal(manifest.assets.length,24);
const registry=readFileSync('src/ui/productionAssets.ts','utf8');
const allKeys=[...registry.matchAll(/^\s*'([^']+)':\s*require\(/gm)].map(m=>m[1]);
assert.equal(new Set(allKeys).size,allKeys.length,'Duplicate registry declarations');
for(const id of humanArtIds) for(const kind of ['portrait','unit']) {
  const key=`human_${id}_${kind}`;
  const asset=manifest.assets.find((a:any)=>a.key===key);assert.ok(asset,key);
  assert.ok(existsSync(asset.path));
  const bytes=readFileSync(asset.path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,'Transfer changed approved pixels: '+key);
  assert.equal(bytes.readUInt32BE(16),256);assert.equal(bytes.readUInt32BE(20),256);
  assert.equal(bytes[25],6,'RGBA transparency required');
  assert.ok(bytes.length<200000,'Combat asset size budget');
  assert.ok(registry.includes(`'battle_portrait.${key}': require('../../${asset.path}')`));
  const [x1,y1,x2,y2]=asset.contentBounds;
  assert.ok(x1>=8&&y1>=8&&x2<=248&&y2<=248,'Safe transparent border missing');
  if(kind==='unit')assert.ok(y2<=244,'Feet/weapon anchor below stage bounds');
  checks+=9;
}

// Exercise the actual ReferenceArt component through a tiny native renderer stub.
// Ensures the human keys work, promotion changes clear the image-error fallback,
// and a missing image uses the existing class sprite rather than another Human.
let state:any=null;let sourcePresent=true;
const react:any={__esModule:true,memo:(fn:any)=>fn,createElement:(type:any,props:any,...children:any[])=>({type,props:{...props,children}}),
  useState:()=>[state,(value:any)=>{state=value;} ]};react.default=react;
const source=readFileSync('src/ui/portraitBattle/Art.tsx','utf8');
const output=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
const mod={exports:{} as any};
new Function('require','module','exports',output)((name:string)=>{
 if(name==='react')return react;
 if(name==='react-native')return {Image:'Image',View:'View'};
 if(name.endsWith('productionAssets'))return {getProductionAssetSource:(id:string)=>sourcePresent?{uri:id}:null};
 if(name==='./humanArt')return {humanArtFrames};
 throw new Error(name);
},mod,mod.exports);
for(const id of humanArtIds)for(const suffix of ['portrait','unit'])for(const size of [28,32,48,56,128]) {
 state=null;const art=`human_${id}_${suffix}`;
 const tree=mod.exports.ReferenceArt({art,width:size,fallback:'EXISTING_CLASS_ART'});
 const image=tree.props.children[0];assert.equal(image.type,'Image');assert.equal(image.props.fadeDuration,0);
 assert.ok(Number.isFinite(image.props.style.width)&&Number.isFinite(image.props.style.left));
 image.props.onError();
 assert.equal(mod.exports.ReferenceArt({art,width:size,fallback:'EXISTING_CLASS_ART'}).props.children[0],'EXISTING_CLASS_ART');
 const other=art==='human_captain_unit'?'human_lancer_unit':'human_captain_unit';
 assert.equal(mod.exports.ReferenceArt({art:other,width:size}).props.children[0].type,'Image'); checks+=5;
}
sourcePresent=false;
assert.equal(mod.exports.ReferenceArt({art:'human_captain_unit',width:48,fallback:'MISSING_FALLBACK'}).props.children[0],'MISSING_FALLBACK');
console.log(`PASS: ${checks} Human-art checks: 12 portrait/figure pairs, 15 class mappings, faction/fantasy exclusions, source hashes, safe framing and real component fallback.`);
