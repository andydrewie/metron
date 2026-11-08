import {auditReview} from '../review-audit.mjs';
/** Check recorded provenance and preservation, never infer physiological validity. */
export function auditH2B(corpus,matrix,plan,records,asOf,fileDigest) {
  const errors=auditReview(corpus,matrix,plan,records,asOf,'H2-B');
  const fail=m=>errors.push('H2-B: '+m);
  for(const cr of records?.review?.claimReviews ?? []) if(!cr.sourceIds?.length) fail('missing primary source '+cr.claimId);
  const crosswalk=records?.crosswalk;
  if(!crosswalk || !Array.isArray(crosswalk.variants) || !Array.isArray(crosswalk.sourceMappings) || !Array.isArray(crosswalk.discrepancies)) return [...errors,'H2-B: missing equation crosswalk'];
  const variants=new Map(crosswalk.variants.map(v=>[v.id,v]));
  const sources=new Set(records?.registry?.sources?.map(s=>s.id) ?? []);
  if(variants.size!==crosswalk.variants.length) fail('duplicate equation variant');
  if(!crosswalk.transferRule || crosswalk.asOf!==records.review.asOf) fail('missing transfer rule or mismatched provenance date');
  for(const v of crosswalk.variants) if(!v.outcome || !v.family || !v.coefficients || !Object.keys(v.coefficients).length || Object.values(v.coefficients).some(x=>!Number.isFinite(x))) fail('invalid equation fingerprint '+v.id);
  const seen=new Set();
  for(const m of crosswalk.sourceMappings){
    if(seen.has(m.sourceId) || !sources.has(m.sourceId) || !m.label || !m.qualification || !['verified','verified-arithmetic-only','label-coefficient-disagreement','unresolved'].includes(m.identityState)) fail('invalid source mapping '+m.sourceId);
    seen.add(m.sourceId);
    if(!Array.isArray(m.variantIds) || m.variantIds.some(id=>!variants.has(id)) || (m.identityState==='unresolved' ? m.variantIds.length!==0 : m.variantIds.length===0)) fail('unknown or unsupported equation attribution '+m.sourceId);
  }
  const requiredMappings={'h2b-cai-2026':['cai-table-501.6-21.6'],'sordi-2024':['metron-cunningham-500-22'],'ten-haaf-2014':['metron-cunningham-500-22','mifflin-original']};
  for(const [sourceId,expected] of Object.entries(requiredMappings)) {
    const actual=crosswalk.sourceMappings.find(m=>m.sourceId===sourceId)?.variantIds;
    if(JSON.stringify(actual)!==JSON.stringify(expected)) fail('inspected equation identity changed without adjudication '+sourceId);
  }
  for(const id of ['weijs-us-denominator','kfir-cunningham-mean','kfir-subgroup-counts']) {
    const d=crosswalk.discrepancies.find(x=>x.id===id);
    if(!d || !sources.has(d.sourceId) || d.state!=='unresolved') fail('unresolved source discrepancy silently removed/promoted '+id);
  }
  const counts=crosswalk.discrepancies.find(x=>x.id==='weijs-us-denominator')?.observations?.map(x=>x.n);
  if(JSON.stringify(counts)!=='[338,239]') fail('Weijs conflicting denominators must remain explicit');
  const protectedFiles=crosswalk.frozenStudy?.files;
  if(!Array.isArray(protectedFiles) || !protectedFiles.length) fail('missing frozen-study preservation record');
  const paths=new Set();
  for(const f of protectedFiles ?? []) {
    if(typeof f.path!=='string'||!f.path.startsWith('research/ree-validation/')||f.path.includes('..')||f.path.includes('\\')||paths.has(f.path)||!/^[a-f0-9]{64}$/.test(f.sha256)) {fail('invalid protected path/digest');continue;}
    paths.add(f.path);
    if(fileDigest) {
      try {if(fileDigest(f.path)!==f.sha256) fail('frozen study changed '+f.path);}
      catch {fail('frozen study unavailable '+f.path);}
    }
  }
  for(const p of ['G0_FILE_VERIFICATION.json','G1_FROZEN_PROTOCOL.md','G2_BENCHMARK.md','G3_RESULTS.md','G4_DECISION.md','protocol.v1.json','results/g3-enable-v1.json']) if(!paths.has('research/ree-validation/'+p)) fail('missing frozen-study evidence '+p);
  return errors;
}
