/** Print synthetic stress-test results for Metron's current energy model. */
import {readFile} from 'node:fs/promises';
import {inspectSensitivity} from './sensitivity.mjs';
const data=JSON.parse(await readFile(new URL('./fixtures.json',import.meta.url),'utf8'));
console.log(JSON.stringify({
 schemaVersion:'1.0.0',status:'synthetic-only',
 centralQuestion:'How sensitive is output to equal percentage changes in chosen model coefficients?',
 answer:'Changes can be computed exactly under fixed assumptions; they are not measured error bounds.',
 modelUpdated:false,
 results:data.cases.map(c=>({id:c.id,description:c.description,analysis:inspectSensitivity({profile:c.profile,activity:c.activity})}))
},null,2));
