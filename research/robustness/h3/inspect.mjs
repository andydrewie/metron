/** Research admission diagnostic only. It does not ingest provider data or adjust TDEE. */
export function compareObservations(left, right) {
  const keys=['quantity','unit','method','reference','windowStart','windowEnd','algorithmVersion'];
  const missing=keys.filter(k=>left?.[k]==null||right?.[k]==null);
  const mismatched=keys.filter(k=>!missing.includes(k)&&left[k]!==right[k]);
  const unobserved=[left,right].some(x=>!['observed','self-reported'].includes(x?.origin));
  return {state:missing.length||mismatched.length||unobserved?'not-comparable':'metadata-compatible-only',missing,mismatched,unobserved,accuracyEstablished:false};
}
export function inspectCoverage({start,end,sampleStart,sampleEnd,capped=false,historyComplete=null,readAccessKnown=null,membership=null}) {
  const explicit=s=>typeof s==='string'&&/(Z|[+-]\d\d:\d\d)$/.test(s)&&Number.isFinite(Date.parse(s));
  if(![start,end,sampleStart,sampleEnd].every(explicit)||Date.parse(end)<=Date.parse(start)||Date.parse(sampleEnd)<=Date.parse(sampleStart)) throw new TypeError('Explicit valid increasing intervals required');
  const overlap=Math.max(0,Math.min(Date.parse(end),Date.parse(sampleEnd))-Math.max(Date.parse(start),Date.parse(sampleStart)));
  return {windowHours:(Date.parse(end)-Date.parse(start))/3600000,overlapMinutes:overlap/60000,completeObservation:!capped&&historyComplete===true&&readAccessKnown===true,membership:membership??'unknown',automaticSubtractionPermitted:false};
}
