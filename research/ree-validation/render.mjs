/** A one-screen, reproducible executive report of aggregate RMR evaluation. */
const kcal = n => n == null ? 'Not available' : n.toFixed(1) + ' kcal/day';
const percent = n => n == null ? 'Not available' : n.toFixed(1) + '%';
const interval = (pair, pct=false) => !pair ? 'Not available' :
  '[' + (pct ? percent(pair.lower) : kcal(pair.lower)) + ', ' +
  (pct ? percent(pair.upper) : kcal(pair.upper)) + ']';
export function renderExecutive(report){
  if(!report || report.studyId!=='RMR-EXT-001')throw new TypeError('Unexpected report identity');
  const synthetic=report.evidenceType==='synthetic-engineering-only';
  const lines=[
    '# Metron · RMR benchmark · '+(synthetic?'SYNTHETIC TEST ONLY':'Measured cohort analysis'),
    '',
    '## In 20 seconds',
    '',
    synthetic ?
      '**This is a software test using fictional people, not a result about human metabolism.**' :
      '**This analysis describes one measured resting-energy cohort, not universal TDEE accuracy.**',
    '',
    'Eligible observations: **'+report.cohortFlow.eligible+'** of '+report.cohortFlow.rawRows+
      '; paired Cunningham comparison: **'+report.cohortFlow.pairedEligible+'**.',
    'Frozen study: '+report.protocolId+' · Model: '+report.frozenModelVersion+
      ' · Source: '+report.sourceSha256,
    '',
    '## Resting-energy errors',
    '',
    '| Metric | Primary Mifflin estimate | 95% cohort-level bootstrap interval |',
    '| --- | ---: | --- |',
  ];
  for(const [name,key,pct] of [
    ['MAE','mae',false],['Mean signed bias','bias',false],
    ['RMSE','rmse',false],['Median absolute error','medianAbsError',false],
    ['Within ±10%','within10Percent',true]
  ]){
    const n=report.primary?.summary?.[key];
    lines.push('| '+name+' | '+(pct?percent(n):kcal(n))+' | '+interval(report.primary?.ci95?.[key],pct)+' |');
  }
  lines.push('', '### Paired comparison',
    report.paired ?
      'On identical '+report.paired.n+' participants, Cunningham minus Mifflin MAE = '+
      kcal(report.paired.cunninghamMinusMifflinMae)+'. 95% paired bootstrap interval: '+
      interval(report.paired.ci95?.pairedMaeDelta)+'.' :
      'No eligible, matched Cunningham comparison could be calculated.',
    '',
    '### Integrity and limits',
    '- First-failed exclusion counts: '+Object.entries(report.cohortFlow.excludedByFirstReason).map(([k,v])=>k+': '+v).join('; ')+'.',
    '- Raw participant records and individual predictions are not part of this output.',
    '- Intervals reflect site-stratified sampling of the represented cohort, not individual physiological uncertainty.',
    '- Estimates do not validate Metron TDEE, activity expenditure, training readiness, or calorie allowance.',
    '- A later policy decision must separately consider replication, population transfer and counterevidence.',
    ''
  );
  return lines.join('\n');
}
