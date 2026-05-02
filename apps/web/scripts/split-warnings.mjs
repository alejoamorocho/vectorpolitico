#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IN = resolve(__dirname, 'warnings-list.json');

const data = JSON.parse(readFileSync(IN, 'utf-8'));
const keys = Object.keys(data).sort();
console.log('Total entities with warnings:', keys.length);

const BATCHES = 4;
const batchSize = Math.ceil(keys.length / BATCHES);

for (let i = 0; i < BATCHES; i++) {
  const batchKeys = keys.slice(i * batchSize, (i + 1) * batchSize);
  const batch = {};
  let warningCount = 0;
  for (const k of batchKeys) {
    batch[k] = data[k];
    warningCount += data[k].warnings.length;
  }
  const file = resolve(__dirname, `warnings-batch-${i + 1}.json`);
  writeFileSync(file, JSON.stringify(batch, null, 2));
  console.log(`Batch ${i + 1}: ${batchKeys.length} entities, ${warningCount} warnings → ${file}`);
}
