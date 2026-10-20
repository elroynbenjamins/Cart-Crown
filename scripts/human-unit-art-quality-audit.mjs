import assert from 'node:assert/strict';
import fs from 'node:fs';
import { inspectTransparentUnitIconPng } from './png-integrity.mjs';

/**
 * Human unit icon QA triage. A silhouette/coverage flag is a reason to LOOK
 * at an asset, not authority to replace a professionally drawn illustration.
 * The preferred high-quality Recruit/Militia, Spearman and Ranger remain safe.
 */
const registry = fs.readFileSync('src/ui/productionAssets.ts', 'utf8');
const entries = [...registry.matchAll(
  /^\s*'unit\.human\.([a-z_]+)': require\('\.\.\/\.\.\/(assets\/units\/[^']+\.png)'\)/gm
)].map(([, id, filepath]) => ({ id, filepath }));
assert.ok(entries.length >= 28, 'Every Human roster class should have a registered production icon.');
assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length,
  'Human icon keys must be unique.');

const protectedIcons = new Set(['recruit', 'militia', 'spearman', 'ranger']);
const table = [];
for (const { id, filepath } of entries) {
  const bytes = fs.readFileSync(filepath);
  const decoded = inspectTransparentUnitIconPng(bytes);
  const channels = decoded.colorType === 6 ? 4 : 2;
  let minX = decoded.width, minY = decoded.height, maxX = -1, maxY = -1;
  let substantial = 0;
  for (let y = 0; y < decoded.height; y++) for (let x = 0; x < decoded.width; x++) {
    const a = decoded.pixels[(y * decoded.width + x) * channels + channels - 1];
    if (a <= 32) continue;
    substantial++;
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const width = Math.max(0, maxX - minX + 1);
  const height = Math.max(0, maxY - minY + 1);
  const coverage = substantial / (decoded.width * decoded.height);
  const tinySilhouette = width < decoded.width * 0.40 || height < decoded.height * 0.40 || coverage < 0.07;
  table.push({
    id, filepath, bytes: bytes.length, width, height,
    coverage: Number((coverage * 100).toFixed(1)),
    review: tinySilhouette && !protectedIcons.has(id)
  });
}
const siege = table.find(entry => entry.id === 'siege_engineer');
assert.ok(siege, 'Siege Engineer must be represented in the audit.');
assert.ok(!siege.review && siege.coverage >= 16,
  'Siege Engineer must remain a readable character-first silhouette at compact roster sizes.');
assert.ok(siege.width >= 140 && siege.height >= 170,
  'Siege Engineer icon must use most of the square canvas rather than a tiny device.');
console.log('Human roster artwork audit: ' + table.length + ' production icons evaluated.');
for (const item of table) {
  console.log((item.review ? 'REVIEW ' : '       ') +
    item.id.padEnd(19) +
    String(item.width).padStart(3) + '×' + String(item.height).padEnd(3) +
    '  ' + String(item.coverage).padStart(5) + '% nontransparent' +
    '  ' + Math.round(item.bytes / 1024) + ' KiB');
}
console.log('Visual QA review candidates: ' + table.filter(item => item.review).map(item => item.id).join(', '));
console.log('These are silhouette metrics, NOT automatic judgements of drawing style, weapon accuracy, or class identity.');
