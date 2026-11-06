/**
 * Research-only diagnostic. Not part of the shipped model or public API.
 * Demonstrates conditional arithmetic under explicit step/workout overlap assumptions.
 * Does NOT estimate physiological truth or a calibrated prediction interval.
 */
import { estimateEnergy } from '../../core/model.js';

const finiteNonnegativeInteger = (n, label) => {
  if (!Number.isSafeInteger(n) || n < 0) throw new RangeError(label + ' must be a nonnegative integer');
  return n;
};

/**
 * @param {object} scenario
 * @param {object} scenario.profile - A synthetic Metron profile.
 * @param {object} scenario.activity - Existing Metron activity input.
 * @param {{kind:'known',stepsAssignedToWorkoutBeyondBaseline:number}|{kind:'bounded-unknown',maximumStepsAssignedToWorkoutBeyondBaseline:number}} scenario.overlap
 * @returns {object} research diagnostic, NOT a corrected Metron estimate.
 */
export function auditOverlap(scenario) {
  if (!scenario || typeof scenario !== 'object' || Array.isArray(scenario)) throw new TypeError('Scenario must be an object');
  const { profile={}, activity={}, overlap }=scenario;
  if (!overlap || typeof overlap !== 'object' || Array.isArray(overlap)) throw new TypeError('Explicit overlap assumption required');
  const calculated=estimateEnergy({ profile,activity });
  const steps=calculated.derived.incrementalSteps;
  const kind=overlap.kind;
  if (!['known','bounded-unknown'].includes(kind)) throw new TypeError('Unknown overlap kind');

  // Overlap is assigned ONLY to steps beyond the assumed baseline. This
  // allocation is an explicit scenario assumption, not an observed fact.
  const count=kind==='known'?
    finiteNonnegativeInteger(overlap.stepsAssignedToWorkoutBeyondBaseline,'stepsAssignedToWorkoutBeyondBaseline'):
    finiteNonnegativeInteger(overlap.maximumStepsAssignedToWorkoutBeyondBaseline,'maximumStepsAssignedToWorkoutBeyondBaseline');
  if (count > steps) throw new RangeError('Assigned workout steps exceed steps beyond the baseline');
  if (count>0 && activity.workoutMinutes===0) throw new RangeError('Step/workout overlap requires a nonzero workout duration');

  // Derive marginal step cost FROM the current model, without copying its
  // coefficient into a competing physiological implementation.
  const incrementalWalkingKcalPerStep=steps===0?0:calculated.components.walkingKcal/steps;
  const maximumRemovedWalkingKcal=count*incrementalWalkingKcalPerStep;
  const published=calculated.estimatedTdeeKcal;
  const lower=published-maximumRemovedWalkingKcal;
  const upper=kind==='known'?lower:published;

  return {
    schemaVersion:'1.0.0',
    researchStatus:'synthetic-arithmetic-demonstration',
    modelVersion:calculated.modelVersion,
    overlapAssumption:{
      kind,
      stepsAssignedToWorkoutBeyondBaseline:kind==='known'?count:null,
      maximumStepsAssignedToWorkoutBeyondBaseline:kind==='bounded-unknown'?count:null,
      stepsAvailableBeyondBaseline:steps
    },
    publishedModel:{
      estimatedTdeeKcal:published,
      components:calculated.components,
      baselineIncludedSteps:calculated.assumptions.includedBaselineSteps
    },
    conditionalScenario:{
      minimumKcal:lower,maximumKcal:upper,
      maximumRemovedWalkingKcal,
      kcalPerAdditionalStep:incrementalWalkingKcalPerStep,
      isCalibratedInterval:false,
      isValidatedCorrection:false,
      units:'kcal/day'
    },
    limitation:'Only a conditional subtraction of the walking term already counted within a modelled workout. Assumes baseline steps and workout steps are disjoint and the existing workout MET term includes those workout steps. It does not identify actual overlap or validate the MET estimate.'
  };
}
