/** Offline record-integrity audit. No clinical inference or automatic gate closure. */
import {readFileSync, existsSync} from 'node:fs';
import {resolve, relative, isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditH1} from './h1-audit.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const day = 86400000;
function dateValue(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const valueMs = Date.parse(value+'T00:00:00Z');
  return Number.isFinite(valueMs) && new Date(valueMs).toISOString().slice(0,10) === value ? valueMs : null;
}
export function auditProgram(plan, corpus, {asOf, pathExists = () => true, h1} = {}) {
  const errors = [], warnings = [];
  const at = dateValue(asOf);
  if (at === null) errors.push('asOf must be a real YYYY-MM-DD date');
  const collections = {gates:plan.gates, weaknesses:plan.weaknesses, concepts:corpus.concepts, contexts:corpus.contexts, sources:corpus.sources, claims:corpus.claims};
  const ids = {};
  for (const [name, entries] of Object.entries(collections)) {
    ids[name] = new Set();
    if (!Array.isArray(entries)) { errors.push(name+' must be an array'); continue; }
    for (const item of entries) {
      if (!item || typeof item.id !== 'string' || !item.id || ids[name].has(item.id)) errors.push('Missing/duplicate '+name+' ID');
      else ids[name].add(item.id);
    }
  }
  if (errors.length) return {asOf, errors, warnings, valid:false};
  const ref = (set,id,where) => {if (!ids[set].has(id)) errors.push(where+' refers to unknown '+set+' '+id);};
  const path = (value,where) => {
    if (typeof value !== 'string' || !value || isAbsolute(value) || value.split(/[\\/]/).includes('..') || !pathExists(value)) errors.push(where+' has missing/unsafe repository path '+value);
  };
  const dated = (value,where) => {
    const n = dateValue(value);
    if (n === null || (at !== null && n > at)) errors.push(where+' has invalid/future date');
    return n;
  };
  for (const [name,doc] of [['plan',plan],['corpus',corpus]]) {
    if (doc.schemaVersion !== '1.0.0') errors.push(name+' unsupported schemaVersion');
    dated(doc.asOf,name+'.asOf');
  }
  if (dateValue(plan.reuseHorizonThrough) === null || dateValue(plan.reuseHorizonThrough) < dateValue(plan.asOf)) errors.push('Invalid reuse horizon');
  path(plan.corpus,'plan corpus'); path(plan.completedStudy,'completed study');
  ref('gates',plan.currentGate,'currentGate');
  ref('gates',plan.nextTask?.gate,'nextTask');
  const gateMap = new Map(plan.gates.map(g => [g.id,g]));
  if (gateMap.get('H1')?.state === 'complete') errors.push(...auditH1(corpus,h1 ?? {},pathExists));
  for (const gate of plan.gates) {
    if (!['not-started','in-progress','blocked','complete'].includes(gate.state)) errors.push(gate.id+' invalid state');
    if (!gate.ownerRole || !Array.isArray(gate.acceptanceCriteria) || !gate.acceptanceCriteria.length) errors.push(gate.id+' missing owner/acceptance criteria');
    if (!Array.isArray(gate.dependsOn) || !Array.isArray(gate.evidence)) {errors.push(gate.id+' invalid dependency/evidence arrays'); continue;}
    for (const dep of gate.dependsOn) ref('gates',dep,gate.id);
    for (const p of gate.evidence) path(p,gate.id);
    if (gate.state === 'complete') {
      if (!gate.evidence.length || !gate.closure?.scope || !gate.closure?.reviewerRole || !gate.closure?.acceptanceReview) errors.push(gate.id+' closure lacks evidence or scoped review');
      dated(gate.closure?.reviewedAt,gate.id+' closure');
      for (const dep of gate.dependsOn) if (gateMap.get(dep)?.state !== 'complete') errors.push(gate.id+' complete before prerequisite '+dep);
    }
  }
  const visiting = new Set(), visited = new Set();
  function walk(id) {
    if (visiting.has(id)) {errors.push('Gate dependency cycle at '+id); return;}
    if (visited.has(id) || !gateMap.has(id)) return;
    visiting.add(id);
    for (const dep of gateMap.get(id).dependsOn ?? []) walk(dep);
    visiting.delete(id); visited.add(id);
  }
  for (const id of gateMap.keys()) walk(id);
  for (const [gate,tracks] of Object.entries(plan.trackPrerequisites ?? {})) {
    ref('gates',gate,'track');
    for (const [track,deps] of Object.entries(tracks)) for (const dep of deps) {
      ref('gates',dep,gate+' track');
      if (gateMap.get(gate)?.state === 'complete' && gateMap.get(dep)?.state !== 'complete') errors.push(gate+' complete before '+track+' prerequisite '+dep);
    }
  }
  for (const weakness of plan.weaknesses) {
    ref('gates',weakness.gate,weakness.id);
    if (!weakness.ownerRole || !weakness.nextTest || !weakness.finding || !['high','medium','low'].includes(weakness.severity)) errors.push(weakness.id+' missing risk ownership or finding');
    if (!['open','constrained','resolved'].includes(weakness.state)) errors.push(weakness.id+' invalid weakness state');
    for (const p of weakness.evidence ?? []) path(p,weakness.id);
    for (const p of weakness.resolutionEvidence ?? []) path(p,weakness.id+' resolution');
    if (weakness.state !== 'open' && !weakness.resolutionEvidence?.length) errors.push(weakness.id+' closure lacks resolution evidence');
  }
  for (const context of corpus.contexts) {
    ref('gates',context.reviewGate,context.id);
    if (!context.currentProductDisposition || !context.axis) errors.push(context.id+' lacks context/disposition');
    if (!['unreviewed','reviewed'].includes(context.clinicalEvidenceReview)) errors.push(context.id+' invalid clinical review status');
    if (context.clinicalEvidenceReview === 'reviewed' && !context.reviewEvidence?.length) errors.push(context.id+' reviewed without evidence');
  }
  for (const claim of corpus.claims) {
    for (const name of ['concepts','contexts','sources','gates']) {
      if (!Array.isArray(claim[name]) || !claim[name].length) {errors.push(claim.id+' lacks '+name); continue;}
      for (const id of claim[name]) ref(name,id,claim.id);
    }
    if (!claim.limitation || !claim.evidenceDisposition || !claim.applicabilityMatrixStatus) errors.push(claim.id+' missing epistemic scope');
  }
  for (const relation of corpus.relations ?? []) {
    ref('concepts',relation.from,'relation'); ref('concepts',relation.to,'relation'); ref('sources',relation.source,'relation');
    if (!relation.qualification) errors.push('Relation lacks qualification');
  }
  const sourceReviews = [];
  for (const source of corpus.sources) {
    if (!source.path && !source.url) errors.push(source.id+' lacks locator');
    if (source.path) path(source.path,source.id);
    if (source.url && !/^https:\/\//.test(source.url)) errors.push(source.id+' invalid URL');
    const window = plan.freshnessPolicy?.sourceReviewWindowsDays?.[source.freshnessClass];
    if (!Number.isInteger(window) || window < 1) errors.push(source.id+' lacks review window');
    let state='unreviewed', ageDays=null;
    if (source.sourceContentReviewedAt !== null) {
      const n=dated(source.sourceContentReviewedAt,source.id);
      if (!source.reviewScope) errors.push(source.id+' review date lacks inspection scope');
      if (n!==null && at!==null && n<=at) {ageDays=(at-n)/day; state=ageDays>=window?'due':'within-policy-window';}
    }
    sourceReviews.push({id:source.id,state,ageDays});
  }
  if (corpus.comprehensiveClinicalReviewCompleted && corpus.contexts.some(c=>c.clinicalEvidenceReview!=='reviewed')) errors.push('Comprehensive clinical review claimed with unreviewed contexts');
  const unreviewed=sourceReviews.filter(s=>s.state==='unreviewed').length;
  const due=sourceReviews.filter(s=>s.state==='due').length;
  if (unreviewed) warnings.push(unreviewed+' sources have no recorded current content review');
  if (due) warnings.push(due+' source reviews are due');
  if (corpus.coverageStatus==='partial-seed-not-comprehensive') warnings.push('Corpus remains a partial seed, not comprehensive clinical coverage');
  return {asOf,valid:errors.length===0,errors,warnings,sourceReviews,
    gateStates:plan.gates.map(g=>({id:g.id,state:g.state})),
    openWeaknesses:plan.weaknesses.filter(w=>w.state==='open').map(w=>w.id),
    meaning:'Record integrity and review-age policy only; no scientific validity, independent reconstruction or exhaustive coverage established.'};
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2);
  if (args.length!==2 || args[0]!=='--as-of') {console.error('Usage: node research/robustness/audit.mjs --as-of YYYY-MM-DD'); process.exitCode=2;}
  else {
    const read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
    const result=auditProgram(read('research/robustness/plan.json'),read('research/robustness/corpus.json'),{
      asOf:args[1],pathExists:p=>{const absolute=resolve(root,p);return !relative(root,absolute).startsWith('..')&&existsSync(absolute);},
      h1:{inventory:read('research/robustness/inventory.json'),matrix:read('research/robustness/applicability.json'),semantics:read('research/robustness/semantics.json'),inputSchema:read('schemas/input.schema.json'),outputSchema:read('schemas/output.schema.json')}
    });
    console.log(JSON.stringify(result,null,2));
    if(!result.valid) process.exitCode=1;
  }
}
