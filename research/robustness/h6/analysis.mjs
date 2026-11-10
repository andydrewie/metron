/** Planning/aggregate arithmetic only. This module cannot certify human evidence. */
const Z=1.959963984540054;
function counts(x,n) {
  if(!Number.isSafeInteger(n)||n<1||!Number.isSafeInteger(x)||x<0||x>n)throw new TypeError('Invalid aggregate counts');
}
export function wilson(x,n) {
  counts(x,n);const p=x/n,d=1+Z*Z/n,c=(p+Z*Z/(2*n))/d,h=Z*Math.sqrt(p*(1-p)/n+Z*Z/(4*n*n))/d;
  return {estimate:p,lower:Math.max(0,c-h),upper:Math.min(1,c+h)};
}
/** Independent groups, first minus second; NIST Agresti–Caffo formula. */
export function difference(x1,n1,x2,n2) {
  counts(x1,n1);counts(x2,n2);
  const p1=(x1+1)/(n1+2),p2=(x2+1)/(n2+2),c=p1-p2,h=Z*Math.sqrt(p1*(1-p1)/(n1+2)+p2*(1-p2)/(n2+2));
  return {estimate:x1/n1-x2/n2,adjustedCenter:c,lower:Math.max(-1,c-h),upper:Math.min(1,c+h),method:'Agresti-Caffo; raw point estimate, adjusted-centered interval'};
}
export function planningCalculations(perArm=20) {
  counts(0,perArm);
  return {kind:'planning-calculation-not-observations',perArm,zeroEventsUpper95:wilson(0,perArm).upper,
    halfEvents95:wilson(Math.floor(perArm/2),perArm),detectAtLeastOneAtHypothetical10Percent:1-0.9**perArm,
    meaning:'Binomial independence assumptions; not a power calculation, population representativeness or physiological validity.'};
}
function arm(a) {
  if(!a||Object.keys(a).some(k=>!['assigned','critical','unknownCritical','decisionSuccess','unknownDecision','criticalByTask','boundaryCorrect'].includes(k)))throw new TypeError('Invalid arm aggregate');
  if(!Number.isSafeInteger(a.assigned)||a.assigned<0)throw new TypeError('Invalid assigned count');
  const validCount=n=>{if(!Number.isSafeInteger(n)||n<0||n>a.assigned)throw new TypeError('Invalid aggregate count');};
  for(const k of ['critical','unknownCritical','decisionSuccess','unknownDecision'])validCount(a[k]);
  if(a.critical+a.unknownCritical>a.assigned||a.decisionSuccess+a.unknownDecision>a.assigned)throw new TypeError('Inconsistent aggregate counts');
  for(const k of ['criticalByTask','boundaryCorrect']) {
    if(!a[k]||Object.keys(a[k]).sort().join(',')!=='T1,T2,T5')throw new TypeError('Missing task aggregates');
    Object.values(a[k]).forEach(validCount);
  }
  if(Object.values(a.criticalByTask).some(n=>n>a.critical)||Object.values(a.criticalByTask).reduce((a,b)=>a+b,0)<a.critical)throw new TypeError('Inconsistent critical task counts');
  if(a.decisionSuccess+a.critical+a.unknownCritical>a.assigned||a.unknownDecision+a.critical>a.assigned||Object.keys(a.boundaryCorrect).some(k=>a.boundaryCorrect[k]+a.criticalByTask[k]>a.assigned))throw new TypeError('Success or missingness overlaps critical interpretation');
}
export function compareAggregates(data,rules) {
  if(!data||Object.keys(data).some(k=>!['dataKind','quotasMet','codingComplete','H','R'].includes(k))||!['synthetic','human-observations'].includes(data.dataKind)||typeof data.quotasMet!=='boolean'||typeof data.codingComplete!=='boolean')throw new TypeError('Aggregate kind and completeness must be explicit');
  arm(data.H);arm(data.R);const H=data.H,R=data.R;
  const comparable=H.assigned>0&&R.assigned>0;
  const critical=comparable?difference(H.critical,H.assigned,R.critical,R.assigned):null;
  const decision=comparable?difference(R.decisionSuccess,R.assigned,H.decisionSuccess,H.assigned):null;
  // Missing outcomes are assigned against the desired R improvement, never dropped.
  const criticalWorst=comparable?difference(H.critical,H.assigned,R.critical+R.unknownCritical,R.assigned):null;
  const decisionWorst=comparable?difference(R.decisionSuccess,R.assigned,H.decisionSuccess+H.unknownDecision,H.assigned):null;
  const recurring=Object.values(R.criticalByTask).some(n=>n>=rules.criticalRecurrenceParticipants);
  const complete=H.assigned===20&&R.assigned===20&&data.quotasMet&&data.codingComplete&&[H,R].every(a=>a.unknownCritical/a.assigned<=rules.maximumUnknownFraction&&a.unknownDecision/a.assigned<=rules.maximumUnknownFraction);
  const boundary=Object.values(R.boundaryCorrect).every(n=>n/R.assigned>=rules.currentArmBoundaryTarget);
  const signal=comparable&&criticalWorst.estimate+1e-12>=rules.criticalReductionMargin&&criticalWorst.lower>0&&decisionWorst.estimate+1e-12>=rules.decisionSuccessImprovementMargin&&decisionWorst.lower>0&&boundary;
  const interpretation=recurring?'revise':!complete?'inconclusive':signal?'promising-pilot-signal':'improvement-not-demonstrated';
  return {dataKind:data.dataKind,interpretation:data.dataKind==='synthetic'?'synthetic-only':interpretation,ruleEvaluation:interpretation,criticalReduction:critical,decisionImprovement:decision,leastFavorableMissingness:{criticalReduction:criticalWorst,decisionImprovement:decisionWorst},
    counts:{H,R},automaticGateClosure:false,humanEvidenceVerified:false,meaning:'Descriptive pilot arithmetic. The input label does not authenticate participants. No physiological or long-term benefit claim.'};
}
