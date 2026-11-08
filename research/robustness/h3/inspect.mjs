/** Research admission diagnostic only. It does not ingest provider data or adjust TDEE. */
export function compareObservations(left, right) {
  const keys=['quantity','unit','method','reference','windowStart','windowEnd','algorithmVersion'];
  const missing=keys.filter(k=>left?.[k]==null||right?.[k]==null);
  const mismatched=keys.filter(k=>!missing.includes(k)&&left[k]!==right[k]);
  const unobserved=[left,right].some(x=>!['observed','self-reported'].includes(x?.origin));
  return {state:missing.length||mismatched.length||unobserved?'not-comparable':'metadata-compatible-only',missing,mismatched,unobserved,accuracyEstablished:false};
}
export function inspectCoverage({start,end,sampleStart,sampleEnd,capped=false,historyComplete=null,readAccessKnown=null,membership=null}) {
  const explicit=s=>{
    if(typeof s!=='string')return false;
    const m=/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:\.\d{1,3})?(Z|[+-]\d\d:\d\d)$/.exec(s);
    if(!m)return false;
    const [y,mo,d,h,mi,se]=m.slice(1,7).map(Number),date=new Date(Date.UTC(y,mo-1,d));
    const offset=m[7],oh=offset==='Z'?0:Number(offset.slice(1,3)),om=offset==='Z'?0:Number(offset.slice(4,6));
    return date.getUTCFullYear()===y&&date.getUTCMonth()===mo-1&&date.getUTCDate()===d&&h<24&&mi<60&&se<60&&oh<=14&&om<60&&!(oh===14&&om!==0)&&Number.isFinite(Date.parse(s));
  };
  if(![start,end,sampleStart,sampleEnd].every(explicit)||Date.parse(end)<=Date.parse(start)||Date.parse(sampleEnd)<=Date.parse(sampleStart)) throw new TypeError('Explicit valid increasing intervals required');
  const overlap=Math.max(0,Math.min(Date.parse(end),Date.parse(sampleEnd))-Math.max(Date.parse(start),Date.parse(sampleStart)));
  const coversWindow=Date.parse(sampleStart)<=Date.parse(start)&&Date.parse(sampleEnd)>=Date.parse(end);
  return {windowHours:(Date.parse(end)-Date.parse(start))/3600000,overlapMinutes:overlap/60000,coversWindow,completeObservation:coversWindow&&!capped&&historyComplete===true&&readAccessKnown===true,coverageMeaning:'Declared interval/history/access only; not continuous sensor measurement or validated accuracy.',membership:membership??'unknown',automaticSubtractionPermitted:false};
}
