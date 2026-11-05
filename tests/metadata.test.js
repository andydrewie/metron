import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { MODEL_VERSION } from '../core/model.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=async path=>readFile(resolve(root,path),'utf8');

test('manifest reflects the deployed code interface and differentiates future capabilities',async()=>{
 const manifest=JSON.parse(await read('metron.manifest.json'));
 const pkg=JSON.parse(await read('package.json'));
 assert.equal(manifest.project.name,'Metron');
 assert.equal(manifest.project.packageVersion,pkg.version);
 assert.equal(manifest.project.modelVersion,MODEL_VERSION);
 assert.equal(pkg.bin.metron,'./bin/metron.mjs');
 assert.equal(manifest.implemented.energyEstimate,true);
 assert.equal(manifest.implemented.readinessHeuristic,true);
 for(const feature of ['caloricAllowance','wearableParsers','wearableOAuth','bayesianCalibration','mcpServer','activityOverlapReconciliation','empiricallyValidatedReadiness']) assert.equal(manifest.implemented[feature],false,feature);
});

test('machine pointers resolve to local artifacts and schemas parse',async()=>{
 const manifest=JSON.parse(await read('metron.manifest.json'));
 for(const [name,path] of Object.entries(manifest.entrypoints)) {
  assert.ok(path.startsWith('./'),name);
  assert.ok((await stat(resolve(root,path))).isFile(),name);
 }
 for(const file of ['schemas/input.schema.json','schemas/output.schema.json']){
  const schema=JSON.parse(await read(file));
  assert.match(schema.title,/Metron|METRON/i);
 }
});

test('human and agent documentation stays on the same project identity',async()=>{
 for(const file of ['README.md','AGENTS.md','llms.txt','docs/INDEX.md','docs/API.md','docs/ROADMAP.md']) {
  const source=await read(file);
  assert.match(source,/Metron/i,file);
  assert.ok(!source.toLowerCase().includes(['set','state'].join('')),file);
 }
 const readme=await read('README.md');
 assert.match(readme,/not yet|not shipped|planned/i);
});

test('CLI points to present source and CI does not call a retired executable',async()=>{
 const text=await read('.github/workflows/ci.yml');
 assert.match(text,/bin\/metron\.mjs/);
 assert.ok(!text.toLowerCase().includes(['set','state'].join('')));
 const cli=await read('bin/metron.mjs');
 assert.match(cli,/from '\.\.\/core\/model\.js'/);
});


test('research protocol is explicitly unrun and does not advertise results',async()=>{
 const r=JSON.parse(await read('research/protocol.json'));
 assert.equal(r.status,'proposed-not-run');
 assert.equal(r.resultsAvailable,false);
 assert.equal(r.dataCollected,false);
 assert.equal(r.primaryComparison,'B versus A');
});
