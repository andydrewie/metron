/** Dated review policy only. Never promotes clinical support or refreshes source dates. */
const DAY=86400000;
export function dateValue(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
  const ms=Date.parse(value+'T00:00:00Z');
  return Number.isFinite(ms)&&new Date(ms).toISOString().slice(0,10)===value?ms:null;
}
function date(value,label) {
  const result=dateValue(value);if(result===null)throw new TypeError(label+' must be a real YYYY-MM-DD date');return result;
}
export function assessSourceFreshness(source,policy,asOf) {
  const at=date(asOf,'asOf'),window=policy?.sourceReviewWindowsDays?.[source.freshnessClass];
  if(!Number.isInteger(window)||window<1)throw new TypeError(source.id+' lacks review window');
  if(source.sourceContentReviewedAt===null)return {id:source.id,state:'unreviewed',reviewedAt:null,nextReviewBy:null,ageDays:null};
  const reviewed=date(source.sourceContentReviewedAt,source.id+' review date');
  if(reviewed>at)throw new TypeError(source.id+' has invalid/future review date');
  if(!source.reviewScope)throw new TypeError(source.id+' review date lacks inspection scope');
  const ageDays=(at-reviewed)/DAY;
  return {id:source.id,state:ageDays>=window?'due':'within-policy-window',reviewedAt:source.sourceContentReviewedAt,nextReviewBy:new Date(reviewed+window*DAY).toISOString().slice(0,10),ageDays};
}
export function assessReviewFreshness(record,asOf) {
  const at=date(asOf,'asOf'),reviewed=date(record.reviewedAt,record.id+' review date'),due=date(record.nextReviewBy,record.id+' next review date');
  if(reviewed>at||due<=reviewed)throw new TypeError(record.id+' has invalid/future review dates');
  return {...record,state:at>=due?'due':'within-policy-window'};
}
export function assessFreshness({sources=[],reviews=[],policy,asOf,requireReview=false,missingReviews=[],unreviewedContexts=[]}={}) {
  if(asOf===undefined)return {asOf:null,state:'not-assessed',nextAction:'Supply --as-of YYYY-MM-DD to assess review age; recorded completion is historical.'};
  date(asOf,'asOf');
  const sourceAssessments=sources.map(s=>assessSourceFreshness(s,policy,asOf));
  const reviewAssessments=reviews.map(r=>assessReviewFreshness(r,asOf));
  const dueSources=sourceAssessments.filter(s=>s.state==='due').map(s=>s.id);
  const unreviewedSources=sourceAssessments.filter(s=>s.state==='unreviewed').map(s=>s.id);
  const dueReviews=reviewAssessments.filter(r=>r.state==='due').map(r=>r.id);
  const missingBoundedReview=requireReview&&!reviews.length;
  const missingEvidence=!sources.length&&!reviews.length;
  const state=dueSources.length||dueReviews.length?'review-due':unreviewedSources.length||missingReviews.length||unreviewedContexts.length||missingBoundedReview||missingEvidence?'unreviewed':'within-policy-window';
  return {asOf,state,sourceAssessments,reviewAssessments,reasons:{dueSources,dueReviews,unreviewedSources,missingReviews,unreviewedContexts,missingBoundedReview,missingEvidence},
    nextAction:state==='within-policy-window'?'Retain recorded scope; reassess before consequential reuse or on new evidence.':'Inspect the listed due, unreviewed or missing records before consequential reuse; record actual review, not a date-only refresh.',
    meaning:'Review-age policy for listed sources and bounded reviews only. Does not establish scientific validity, clinical applicability, absence of new evidence or live source monitoring.'};
}
