import {auditReview} from '../review-audit.mjs';

/** Check evidence-record meaning and boundaries, never physiological validity. */
export function auditH2C(corpus,matrix,plan,records,asOf) {
  const errors=auditReview(corpus,matrix,plan,records,asOf,'H2-C');
  const fail=m=>errors.push('H2-C: '+m);
  const x=records?.crosswalk;
  if(!x || !Array.isArray(x.mappings) || !Array.isArray(x.guardrails) || !Array.isArray(x.providerMembership)) return [...errors,'H2-C: missing measurement crosswalk'];
  if(x.asOf!==records.review.asOf || x.productionIntegration!==false || x.status!=='research-contract-not-production-adapter' || !x.comparisonRule) fail('invalid research contract scope');
  const sourceIds=new Set(records.registry.sources.map(s=>s.id));
  const claims=new Set(records.review.claimReviews.map(c=>c.claimId)),covered=new Set(),seen=new Set();
  for(const m of x.mappings){
    if(!m.id || seen.has(m.id)) fail('missing/duplicate mapping ID');
    seen.add(m.id);
    for(const key of ['quantity','units','reference','window','permittedInterpretation','unresolved','nextTest']) if(typeof m[key]!=='string'||!m[key].trim()) fail('missing '+key+' in '+m.id);
    if(!Array.isArray(m.requiredMetadata)||!m.requiredMetadata.length||m.requiredMetadata.some(v=>typeof v!=='string'||!v.trim())) fail('missing metadata contract '+m.id);
    if(!Array.isArray(m.claimIds)||!m.claimIds.length||m.claimIds.some(id=>!claims.has(id))) fail('unknown or missing claim '+m.id);
    for(const id of m.claimIds??[]) covered.add(id);
    if(!Array.isArray(m.sourceIds)||!m.sourceIds.length||m.sourceIds.some(id=>!sourceIds.has(id))) fail('unknown or missing source '+m.id);
    if(m.nextGate!=='H3') fail('measurement handoff must retain H3 '+m.id);
  }
  if([...claims].some(id=>!covered.has(id))) fail('crosswalk omits a reviewed claim');
  const guardStates={'metric-identity':'distinct-until-method-reviewed','aggregate-membership':'unknown-without-contribution-evidence',missingness:'unknown-preserved',defaults:'origin-required',uncertainty:'sensitivity-only',authorization:'not-inferred','device-transfer':'device-method-specific'};
  if(new Set(x.guardrails.map(g=>g.id)).size!==x.guardrails.length) fail('duplicate guardrail');
  for(const [id,state] of Object.entries(guardStates)) {
    const g=x.guardrails.find(g=>g.id===id);
    if(!g?.forbiddenInference||g.requiredState!==state) fail('missing or promoted boundary '+id);
  }
  const providers=['whoop-v2','garmin-connect','apple-healthkit'];
  if(x.providerMembership.length!==providers.length) fail('provider denominator changed');
  for(const provider of providers){
    const matches=x.providerMembership.filter(p=>p.provider===provider);
    if(matches.length!==1||matches[0].state!=='unknown'||matches[0].automaticReconciliationPermitted!==false||!matches[0].evidence) fail('unsupported provider membership '+provider);
  }
  const p=x.pilotPredicateContract;
  if(JSON.stringify(p?.rawDayOptions)!=='["strictStartDate"]'||JSON.stringify(p?.statisticsPredicateOptions)!=='[]'||JSON.stringify(p?.statisticsOptions)!=='["cumulativeSum","separateBySource"]') fail('pilot predicates disagree with inspected implementation');
  if(!p?.sampleRepresentationRule||!['merged statistical contribution','complete history','read authorization','real-device execution'].every(v=>p?.doesNotProve?.includes(v))) fail('pilot scope boundary missing');
  for(const cr of records.review.claimReviews) if(!cr.sourceIds?.length) fail('missing source '+cr.claimId);
  return errors;
}
