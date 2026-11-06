/** Metron research-only source/time evidence inspector. Never changes TDEE. */
export const EXPERIMENTAL_CONTRACT_VERSION='0.1.0';
const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
function fields(x,required,optional=[],label='object'){
 if(!record(x))throw new TypeError(label+' must be an object');
 const allowed=new Set([...required,...optional]);
 for(const k of required)if(!(k in x))throw new TypeError(label+' missing '+k);
 for(const k of Object.keys(x))if(!allowed.has(k))throw new TypeError(label+' unknown field '+k);
}
function str(x,n){if(typeof x!=='string'||!x.trim())throw new TypeError(n+' must be nonempty string')}
function count(x,n){if(!Number.isSafeInteger(x)||x<0)throw new RangeError(n+' must be a nonnegative integer')}
function stamp(s,n){
 str(s,n);
 const m=/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(?:\.\d{1,3})?(Z|[+-]\d\d:\d\d)$/.exec(s);
 if(!m)throw new TypeError(n+' must have explicit RFC 3339 UTC offset');
 const [y,mo,d,h,mi,se]=m.slice(1,7).map(Number);
 const date=new Date(Date.UTC(y,mo-1,d));
 if(date.getUTCFullYear()!==y||date.getUTCMonth()!==mo-1||date.getUTCDate()!==d||h>23||mi>59||se>59)throw new RangeError(n+' invalid date/time');
 const off=m[7];
 if(off!=='Z'){const hh=Number(off.slice(1,3)),mm=Number(off.slice(4,6));if(hh>14||mm>59||(hh===14&&mm!==0))throw new RangeError(n+' invalid offset')}
 const t=Date.parse(s);
 if(!Number.isFinite(t))throw new RangeError(n+' cannot parse timestamp');
 return t;
}
function window(x,n){
 fields(x,['start','end','basis','timeZone'],[],n);
 if(!['calendar-day','physiological-cycle','activity-session','custom-interval'].includes(x.basis))throw new TypeError(n+' invalid period basis');
 str(x.timeZone,n+'.timeZone');
 const start=stamp(x.start,n+'.start'),end=stamp(x.end,n+'.end');
 if(end<=start)throw new RangeError(n+' end must be later than start');
 return {start,end};
}
function source(x,n){
 fields(x,['provider','recordType','recordId','acquisition'],[],n);
 for(const k of ['provider','recordType','recordId'])str(x[k],n+'.'+k);
 if(!['device-derived','provider-derived','self-reported','synthetic'].includes(x.acquisition))throw new TypeError(n+' invalid acquisition');
}
function evidence(x){
 fields(x,['basis','reference'],[],'evidence');
 if(!['synthetic-hypothesis','user-attestation','provider-explicit-link'].includes(x.basis))throw new TypeError('Invalid evidence basis');
 str(x.reference,'evidence.reference');
}
export function inspectEventContext(x){
 fields(x,['schemaVersion','studyStatus','stepSummary','workout','membership'],[],'record');
 if(x.schemaVersion!==EXPERIMENTAL_CONTRACT_VERSION||x.studyStatus!=='synthetic-only')throw new TypeError('Research fixture version/status only');
 const s=x.stepSummary,w=x.workout,m=x.membership;
 fields(s,['id','steps','unit','window','source'],[],'stepSummary');
 fields(w,['id','activityType','window','source'],['stepsDuringWorkout'],'workout');
 fields(m,['status'],m.status==='unknown'?[]:['includedSteps','evidence'],'membership');
 str(s.id,'stepSummary.id');str(w.id,'workout.id');
 if(s.id===w.id)throw new RangeError('Record IDs must differ');
 count(s.steps,'stepSummary.steps');
 if(s.unit!=='steps')throw new TypeError('Step unit must be steps');
 if(!['walking','resistance-training','running','mixed','unknown'].includes(w.activityType))throw new TypeError('Invalid workout type');
 if(w.stepsDuringWorkout!==undefined&&w.stepsDuringWorkout!==null)count(w.stepsDuringWorkout,'workout.stepsDuringWorkout');
 source(s.source,'stepSummary.source');source(w.source,'workout.source');
 const a=window(s.window,'stepSummary.window'),b=window(w.window,'workout.window');
 if(s.window.basis==='activity-session'||w.window.basis!=='activity-session')throw new TypeError('Window basis mismatch');
 if(!['unknown','included','excluded'].includes(m.status))throw new TypeError('Invalid membership status');
 const overlapMs=Math.max(0,Math.min(a.end,b.end)-Math.max(a.start,b.start));
 const temporalRelation=overlapMs===0?'disjoint':b.start>=a.start&&b.end<=a.end?'workout-contained':'partial';
 if(m.status!=='unknown'){
  count(m.includedSteps,'membership.includedSteps');evidence(m.evidence);
  if(m.status==='included'&&m.includedSteps<1)throw new RangeError('Included must be positive');
  if(m.status==='excluded'&&m.includedSteps!==0)throw new RangeError('Excluded must be zero');
  if(m.includedSteps>s.steps)throw new RangeError('Included exceeds step total');
  if(w.stepsDuringWorkout!=null&&m.includedSteps>w.stepsDuringWorkout)throw new RangeError('Included exceeds workout steps');
  if(m.includedSteps>0&&temporalRelation==='disjoint')throw new RangeError('Included steps cannot belong to disjoint windows');
 }
 const warnings=[];
 if(m.status==='unknown'&&temporalRelation!=='disjoint')warnings.push('Time overlap alone does not prove that workout steps are included.');
 if(temporalRelation==='partial')warnings.push('Partial interval overlap cannot allocate steps proportionally by clock duration.');
 if(s.window.basis==='physiological-cycle')warnings.push('Physiological cycle is not a local calendar day.');
 if(w.stepsDuringWorkout==null)warnings.push('Missing workout step count is unknown, not zero.');
 if(m.status!=='unknown'&&m.evidence.basis==='synthetic-hypothesis')warnings.push('Relationship is a synthetic assumption, not an observed source linkage.');
 return {
  schemaVersion:EXPERIMENTAL_CONTRACT_VERSION,status:'research-only',
  temporalRelation,temporalOverlapMinutes:overlapMs/60000,
  stepMembership:{status:m.status,includedSteps:m.status==='unknown'?null:m.includedSteps,evidenceBasis:m.status==='unknown'?null:m.evidence.basis},
  stepSummary:{steps:s.steps,periodBasis:s.window.basis,sourceProvider:s.source.provider},
  conclusion:m.status==='unknown'?'unresolved-membership':'scenario-specific-membership',
  modifiesTdee:false,calibratedUncertainty:false,warnings
 };
}
