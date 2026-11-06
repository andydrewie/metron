/** Deterministic synthetic-only JSON exercise. */
import {readFile} from 'node:fs/promises';
import {inspectEventContext} from './inspect.mjs';
const data=JSON.parse(await readFile(new URL('./fixtures.json',import.meta.url),'utf8'));
console.log(JSON.stringify({
 schemaVersion:'0.1.0',status:'synthetic-only',
 question:'Does coincident activity time prove that steps appear in both totals?',
 answer:'No. Explicit membership/source evidence is required.',
 doesNotChangeProductionTdee:true,
 results:data.cases.map(c=>({id:c.id,description:c.description,inspection:inspectEventContext(c.input)}))
},null,2));
