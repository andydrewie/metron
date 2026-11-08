import {auditReview} from '../review-audit.mjs';
/** Validate the dated H2-A slice independently of later review overlays. */
export const auditH2A=(corpus,matrix,plan,records,asOf)=>auditReview(corpus,matrix,plan,records,asOf,'H2-A');
