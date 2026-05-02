#!/usr/bin/env node
/**
 * integrate-fixes.mjs
 *
 * Integra los resultados de los 4 agentes que investigaron fuentes primarias.
 * Lee fixes-batch-{1,2,3,4}.json, aplica los `fixed` a los archivos de datos,
 * y genera un reporte agregado.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../../packages/data/colombia');

// Merge all fixes from the 4 batches
const allFixes = {};
const allUnfindable = [];
for (let i = 1; i <= 4; i++) {
  const path = resolve(__dirname, `fixes-batch-${i}.json`);
  if (!existsSync(path)) {
    console.warn(`⚠ Missing: ${path}`);
    continue;
  }
  const batch = JSON.parse(readFileSync(path, 'utf-8'));
  Object.entries(batch.fixed || {}).forEach(([id, source]) => {
    allFixes[id] = { ...source, batchNum: i };
  });
  (batch.unfindable || []).forEach((u) => allUnfindable.push({ ...u, batchNum: i }));
}

console.log(`Loaded fixes:  ${Object.keys(allFixes).length}`);
console.log(`Loaded unfindable: ${allUnfindable.length}`);

// Apply fixes to data files
const files = ['presidents', 'vice-presidents', 'senators', 'candidates', 'vp-candidates', 'mayors', 'representatives', 'governors'];
let appliedCount = 0;
const appliedIds = new Set();

for (const f of files) {
  const path = resolve(DATA_DIR, `${f}.json`);
  const arr = JSON.parse(readFileSync(path, 'utf-8'));
  let modified = false;
  for (const e of arr) {
    for (const inc of e.incoherences || []) {
      const fix = allFixes[inc.id];
      if (!fix) continue;
      // Replace action.source with the primary source
      inc.action.source = {
        url: fix.url,
        title: fix.title || inc.action.source.title,
        outlet: fix.outlet,
        date: fix.date,
        archived: fix.archived,
      };
      modified = true;
      appliedCount++;
      appliedIds.add(inc.id);
    }
  }
  if (modified) {
    writeFileSync(path, JSON.stringify(arr, null, 2) + '\n');
    console.log(`  ✓ Updated ${f}.json`);
  }
}

const missedFixes = Object.keys(allFixes).filter((id) => !appliedIds.has(id));
if (missedFixes.length > 0) {
  console.log(`\n⚠ Fixes for unknown incoherence IDs:`);
  missedFixes.forEach((id) => console.log(`  - ${id}`));
}

console.log(`\n✓ Applied ${appliedCount} primary-source fixes to data files`);
console.log(`  ${allUnfindable.length} incoherencias marked as unfindable — see below`);
