/**
 * Print reproducible, synthetic energy-accounting sensitivity cases as JSON.
 * Usage: node research/energy-accounting/run.mjs
 */
import { readFile } from 'node:fs/promises';
import { auditOverlap } from './audit.mjs';

const fixtures=JSON.parse(await readFile(new URL('./scenarios.json',import.meta.url),'utf8'));
const results=fixtures.cases.map(entry=>{
  const input={
    profile:fixtures.profile,
    activity:{...fixtures.defaultActivity,...entry.activity},
    overlap:entry.overlap
  };
  return {id:entry.id,label:entry.label,diagnostic:auditOverlap(input)};
});
console.log(JSON.stringify({
  schemaVersion:'1.0.0',
  status:'synthetic-only',
  researchQuestion:'Can the current model infer step/workout overlap from aggregate inputs?',
  answer:'No; identical aggregate inputs admit different overlap assumptions.',
  sourceFixture:'research/energy-accounting/scenarios.json',
  results
},null,2));
