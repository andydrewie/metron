import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
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

test('decision index covers every numbered ADR and preserves statuses',()=>{
  const data=JSON.parse(content('docs/adr/index.json'));
  const actual=readdirSync(root+'docs/adr').filter(n=>/^\\d{4}-[a-z0-9-]+\\.md$/.test(n)).map(n=>'docs/adr/'+n).sort();
  const indexed=data.entries.map(e=>e.path).sort();
  assert.deepEqual(indexed,actual,'numbered ADR files must match machine index');
  const ids=new Set();
  for(const d of data.entries){
    assert.ok(!ids.has(d.id));ids.add(d.id);
    assert.ok(data.statusVocabulary.includes(d.status));
    assert.ok(data.decisionConfidenceVocabulary.includes(d.decisionConfidence));
    assert.equal(d.confidenceKind,'qualitative-judgment');
    assert.ok(['not-tested','tests-passed','not-applicable'].includes(d.softwareVerification));
    assert.ok(['none','external-retrospective','prospective-held-out','not-applicable'].includes(d.empiricalValidation));
    assert.match(content(d.path),new RegExp('\\\\*\\\\*Status:\\\\*\\\\* '+d.status));
    if(d.status==='Superseded')assert.ok(d.supersededBy,'Superseded ADR needs successor');
    if(d.supersededBy)assert.ok(data.entries.some(other=>other.id===d.supersededBy),'Missing ADR successor');
  }
});

test('machine navigation routes are unique and every target exists',()=>{
  const doc=JSON.parse(content('docs/navigation.json'));
  assert.equal(doc.schemaVersion,'1.0.0');
  assert.ok(doc.routes.some(r=>r.id==='resume-work'&&r.entry==='AGENTS.md'));
  const seen=new Set();
  for(const route of doc.routes){
    assert.match(route.id,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!seen.has(route.id),'duplicate intent route '+route.id);seen.add(route.id);
    assert.ok(Array.isArray(route.audience)&&route.audience.length>0);
    assert.ok(['implemented','documented','research-question'].includes(route.status));
    for(const file of [route.entry,...route.next])assert.ok(existsSync(root+file),route.id+' points to missing '+file);
  }
  for(const p of Object.values(doc.sourceOfTruth))assert.ok(existsSync(root+p),'missing source-of-truth file '+p);
});

test('agent-specific pointers defer to the canonical policy and remain loadable',()=>{
  for(const path of ['CLAUDE.md','.github/copilot-instructions.md']){
    assert.ok(existsSync(root+path),'missing agent instructions '+path);
    assert.ok(content(path).includes('AGENTS.md'),'agent adapter not referring to canonical policy: '+path);
  }
  const agents=content('AGENTS.md');
  const collaboration=content('docs/COLLABORATION.md');
  assert.ok(agents.includes('Before every repository task'));
  assert.ok(collaboration.includes('Continuity without reminders'));
  assert.ok(collaboration.includes('no requirement')||collaboration.includes('No compulsory paperwork')||collaboration.includes('No compulsory'));
  const manifest=JSON.parse(content('metron.manifest.json'));
  for(const key of ['claudeAgentInstructions','copilotAgentInstructions'])
    assert.ok(existsSync(root+manifest.entrypoints[key]),'missing manifest agent entry '+key);
});
