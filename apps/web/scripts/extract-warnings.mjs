#!/usr/bin/env node
/**
 * extract-warnings.mjs — lista todas las incoherencias con acción de
 * fuente no-primaria, agrupadas por entidad. Output: JSON para uso por agentes.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../../packages/data/colombia');
const OUT = resolve(__dirname, 'warnings-list.json');

const PRIMARY_OUTLETS = [
  'congreso visible', 'congresovisible', 'suin-juriscol', 'diario oficial',
  'registraduría', 'registraduria', 'contraloría', 'contraloria',
  'procuraduría', 'procuraduria', 'consejo de estado', 'corte constitucional',
  'corte suprema', 'corte interamericana', 'jep', 'cnmh', 'dane',
  'minhacienda', 'minsalud', 'mineducación', 'mineducacion', 'mintrabajo',
  'minambiente', 'mintic', 'mincomercio', 'cancillería', 'cancilleria',
  'presidencia', 'senado', 'cámara', 'camara', 'secretaría', 'alcaldía',
  'gobernación', 'gobernacion', 'tribunal', 'fiscalía', 'fiscalia',
  'defensoría', 'defensoria', 'congreso', 'fecode', 'onic', 'cric',
];

function isPrimary(outlet) {
  if (!outlet) return false;
  const lower = outlet.toLowerCase();
  return PRIMARY_OUTLETS.some((po) => lower.includes(po));
}

const files = ['presidents', 'vice-presidents', 'senators', 'candidates', 'vp-candidates', 'mayors', 'representatives', 'governors'];
const byEntity = {};

for (const f of files) {
  const arr = JSON.parse(readFileSync(resolve(DATA_DIR, `${f}.json`), 'utf-8'));
  for (const e of arr) {
    for (const inc of e.incoherences || []) {
      if (!isPrimary(inc.action?.source?.outlet)) {
        const key = `${f}/${e.id}`;
        if (!byEntity[key]) byEntity[key] = { entity: e.displayName, file: f, entityId: e.id, warnings: [] };
        byEntity[key].warnings.push({
          id: inc.id,
          category: inc.category,
          severity: inc.severity,
          proposalText: inc.proposal.text.slice(0, 200),
          actionText: inc.action.text.slice(0, 300),
          currentActionUrl: inc.action.source.url,
          currentActionOutlet: inc.action.source.outlet,
          currentActionDate: inc.action.source.date,
        });
      }
    }
  }
}

writeFileSync(OUT, JSON.stringify(byEntity, null, 2));
const total = Object.values(byEntity).reduce((s, e) => s + e.warnings.length, 0);
console.log(`✓ Extracted ${total} warnings across ${Object.keys(byEntity).length} entities`);
console.log(`  Written to: ${OUT}`);
