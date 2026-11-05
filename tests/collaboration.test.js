import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const content=p=>readFileSync(root+p,'utf8');

test('governance index resolves to real accepted ADRs',()=>{
  const data=JSON.parse(content('docs/adr/index.json'));
  assert.equal(data.schemaVersion,'1.0.0');
  assert.ok(data.entries.length>=1);
  const seen=new Set();
  for(const d of data.entries){
    assert.match(d.id,/^ADR-\d{4}$/);
    assert.ok(!seen.has(d.id)); seen.add(d.id);
    assert.ok(data.statusVocabulary.includes(d.status));
    assert.ok(existsSync(root+d.path), 'Missing ADR: '+d.path);
    const md=content(d.path);
    for(const heading of ['## At a glance','## Context','## Decision','## Consequences'])
      assert.ok(md.includes(heading), 'ADR '+d.id+' missing '+heading);
    assert.ok(md.includes('**Status:** '+d.status),'ADR status drift: '+d.id);
  }
});

test('public collaboration policy and agent navigation stay discoverable',()=>{
  const policy=content('docs/COLLABORATION.md');
  assert.ok(policy.includes('Questions → Experiments → Decisions → Code'));
  assert.ok(policy.includes('Provisional publication gate'));
  const index=JSON.parse(content('docs/navigation.json'));
  assert.ok(index.routes.some(r=>r.id==='review-decisions'&&r.entry==='docs/COLLABORATION.md'));
  const manifest=JSON.parse(content('metron.manifest.json'));
  for(const key of ['collaborationPolicy','decisionIndex','vocabulary'])
    assert.ok(existsSync(root+manifest.entrypoints[key]),'Missing manifest entrypoint '+key);
});
