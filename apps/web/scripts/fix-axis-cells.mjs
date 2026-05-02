#!/usr/bin/env node
/**
 * fix-axis-cells.mjs
 *
 * Reestructura ideologies.json a un grid uniforme de 8 columnas × 14 filas,
 * eliminando las 14 ideologías "exóticas" que no aplican al contexto colombiano
 * y que históricamente estaban centradas en x=0 (partían el eje vertical).
 *
 * Ideologías eliminadas (14):
 *   fascism, authoritarian-capitalism, aristocracy, elective-monarchism,
 *   constitutional-monarchism, senatorialism, buddhist-theocracy,
 *   anarcho-monarchism, liberal-corporatism, transhumanism, right-georgism,
 *   kleptocracy-right, minarchism, individualist-anarchism.
 *
 * Resultado:
 *   - Grid uniforme: 112 celdas, todas de 2.5 × 1.429
 *   - Posiciones X: -8.75, -6.25, -3.75, -1.25, 1.25, 3.75, 6.25, 8.75
 *   - Posiciones Y: conservadas (14 filas de ±0.714 a ±9.286)
 *   - El eje vertical x=0 cae entre columnas (-1.25 y +1.25)
 *
 * Uso: node apps/web/scripts/fix-axis-cells.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT = resolve(__dirname, '../../../packages/data/ideologies.json');
const OUTPUT = INPUT;

const EXOTIC_IDS = new Set([
  'fascism',
  'authoritarian-capitalism',
  'aristocracy',
  'elective-monarchism',
  'constitutional-monarchism',
  'senatorialism',
  'buddhist-theocracy',
  'anarcho-monarchism',
  'liberal-corporatism',
  'transhumanism',
  'right-georgism',
  'kleptocracy-right',
  'minarchism',
  'individualist-anarchism',
]);

// Uniform 8-column positions (each cell 2.5 wide, covering [-10, 10])
// 4 on left, 4 on right of x=0
const NEW_X_LEFT = [-8.75, -6.25, -3.75, -1.25];
const NEW_X_RIGHT = [1.25, 3.75, 6.25, 8.75];
const NEW_WIDTH = 2.5;
const TOLERANCE = 0.01;

const data = JSON.parse(readFileSync(INPUT, 'utf-8'));

// Step 1: remove exotic cells
const filtered = data.filter((ide) => !EXOTIC_IDS.has(ide.id));
const removed = data.length - filtered.length;

// Step 2: group remaining cells by row (y) and restructure x positions
const rowsByY = new Map();
for (const ide of filtered) {
  const yKey = ide.y.toFixed(3);
  if (!rowsByY.has(yKey)) rowsByY.set(yKey, []);
  rowsByY.get(yKey).push(ide);
}

const restructured = [];
for (const [yKey, cells] of rowsByY) {
  // Sort by current x
  cells.sort((a, b) => a.x - b.x);
  // Split into left (x<0) and right (x>0)
  const left = cells.filter((c) => c.x < 0);
  const right = cells.filter((c) => c.x > 0);

  if (left.length !== 4 || right.length !== 4) {
    console.warn(`Row y=${yKey}: expected 4+4 cells, got ${left.length}+${right.length}. Keeping as-is.`);
    restructured.push(...cells);
    continue;
  }

  left.forEach((c, i) => {
    restructured.push({
      ...c,
      x: NEW_X_LEFT[i],
      width: NEW_WIDTH,
    });
  });
  right.forEach((c, i) => {
    restructured.push({
      ...c,
      x: NEW_X_RIGHT[i],
      width: NEW_WIDTH,
    });
  });
}

// Sort output for stable diff: by quadrant, -y (top to bottom), x (left to right)
restructured.sort((a, b) => {
  const qOrder = { auth_left: 0, auth_right: 1, lib_left: 2, lib_right: 3 };
  const qa = qOrder[a.quadrant] ?? 99;
  const qb = qOrder[b.quadrant] ?? 99;
  if (qa !== qb) return qa - qb;
  if (b.y !== a.y) return b.y - a.y;
  return a.x - b.x;
});

// Validation
function validateNoOverlaps(cells) {
  const byQ = {};
  for (const c of cells) (byQ[c.quadrant] ??= []).push(c);
  let issues = 0;
  for (const [q, arr] of Object.entries(byQ)) {
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const a = arr[i], b = arr[j];
        const ax0 = a.x - a.width / 2, ax1 = a.x + a.width / 2;
        const ay0 = a.y - a.height / 2, ay1 = a.y + a.height / 2;
        const bx0 = b.x - b.width / 2, bx1 = b.x + b.width / 2;
        const by0 = b.y - b.height / 2, by1 = b.y + b.height / 2;
        if (
          ax0 < bx1 - TOLERANCE &&
          ax1 > bx0 + TOLERANCE &&
          ay0 < by1 - TOLERANCE &&
          ay1 > by0 + TOLERANCE
        ) {
          console.warn(`Overlap in ${q}: ${a.id} ↔ ${b.id}`);
          issues++;
        }
      }
    }
  }
  return issues;
}

function validateNoAxisCrossings(cells) {
  const crossings = cells.filter((c) => {
    const l = c.x - c.width / 2, r = c.x + c.width / 2;
    return l < -TOLERANCE && r > TOLERANCE;
  });
  if (crossings.length > 0) {
    console.warn('Cells still crossing x=0:', crossings.map((c) => c.id).join(', '));
  }
  return crossings.length;
}

function validateUniformSize(cells) {
  const ws = new Set(cells.map((c) => c.width.toFixed(3)));
  const hs = new Set(cells.map((c) => c.height.toFixed(3)));
  return { widths: [...ws], heights: [...hs] };
}

const overlaps = validateNoOverlaps(restructured);
const crossings = validateNoAxisCrossings(restructured);
const sizes = validateUniformSize(restructured);

writeFileSync(OUTPUT, JSON.stringify(restructured, null, 2) + '\n', 'utf-8');

console.log(`✓ Removed ${removed} exotic cells.`);
console.log(`✓ Restructured ${restructured.length} cells to uniform 8×14 grid.`);
console.log(`  Widths: [${sizes.widths.join(', ')}] | Heights: [${sizes.heights.join(', ')}]`);
console.log(`  Overlaps: ${overlaps} | Axis crossings: ${crossings}`);
console.log(`  Wrote: ${OUTPUT}`);
