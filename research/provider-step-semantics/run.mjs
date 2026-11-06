/** Source-aware review: test simplified synthetic representations, never vendor payloads. */
import {readFile} from 'node:fs/promises';
import {inspectEventContext} from '../activity-events/inspect.mjs';
const matrix=JSON.parse(await readFile(new URL('./matrix.json',import.meta.url),'utf8'));
const fixtures=JSON.parse(await readFile(new URL('./fixtures.json',import.meta.url),'utf8'));
const outputs=fixtures.cases.map(c=>({
 id:c.id, providerRef:c.providerRef,
 inspection:inspectEventContext(c.record)
}));
console.log(JSON.stringify({
 schemaVersion:'1.0.0',kind:'synthetic-documentation-compatibility',
 researchStatus:matrix.researchDecision.status,
 conclusion:matrix.verdict,
 productionModelChanged:matrix.productionModelChanged,
 results:outputs
},null,2));
