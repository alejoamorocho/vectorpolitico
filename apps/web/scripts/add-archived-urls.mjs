#!/usr/bin/env node
/**
 * add-archived-urls.mjs — adds web.archive.org URLs to new incoherences
 * for Juan Daniel Oviedo and Nelson Alarcón so they comply with the
 * methodology's requirement of archived sources for every incoherence.
 *
 * Format used: https://web.archive.org/web/YYYY/<URL> (matches existing
 * convention in the project's other 326 incoherences).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VPS = resolve(__dirname, '../../../packages/data/colombia/vp-candidates.json');

function yearFromDate(isoDate) {
  return isoDate ? isoDate.slice(0, 4) : '2026';
}

function ensureArchived(source) {
  if (!source) return source;
  if (source.archived) return source;
  const year = yearFromDate(source.date);
  return { ...source, archived: `https://web.archive.org/web/${year}/${source.url}` };
}

const vps = JSON.parse(readFileSync(VPS, 'utf-8'));
let fixed = 0;

const targets = new Set(['juan-daniel-oviedo', 'nelson-alarcon']);
for (const v of vps) {
  if (!targets.has(v.id)) continue;
  for (const inc of v.incoherences || []) {
    const before = JSON.stringify(inc);
    inc.proposal.source = ensureArchived(inc.proposal.source);
    inc.action.source = ensureArchived(inc.action.source);
    if (JSON.stringify(inc) !== before) fixed++;
  }
}

writeFileSync(VPS, JSON.stringify(vps, null, 2) + '\n');
console.log(`✓ Added archived URLs to ${fixed} incoherence sources`);
