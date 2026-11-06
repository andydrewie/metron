/**
 * Device-free arithmetic stress test of Metron's implemented model.
 * Changes one model assumption by an arbitrary factor while holding all
 * observed/synthetic inputs fixed. NOT parameter uncertainty or validation.
 */
import { estimateEnergy, normalizeInput } from '../../core/model.js';

export const STRESS_FACTORS = Object.freeze([0.9, 1.1]);
export const KNOBS = Object.freeze([
  'sedentaryMultiplier',
  'walkingNetKcalPerKgKm',
  'strideHeightRatio',
  'wholeSessionMET'
]);

function recompute({ energy, input }, knob, factor) {
  if (!KNOBS.includes(knob)) throw new TypeError('Unknown research parameter: ' + knob);
  if (!Number.isFinite(factor) || factor <= 0) throw new RangeError('factor must be finite and positive');

  const durationHours = input.activity.workoutMinutes / 60;
  const baseline = energy.components.baselineKcal *
    (knob === 'sedentaryMultiplier' ? factor : 1);
  const walking = energy.components.walkingKcal *
    (knob === 'walkingNetKcalPerKgKm' || knob === 'strideHeightRatio' ? factor : 1);
  const workoutGross = energy.derived.sessionMet * input.profile.weightKg * durationHours *
    (knob === 'wholeSessionMET' ? factor : 1);
  const workout = Math.max(0, workoutGross - (baseline / 24) * durationHours);
  return { total: baseline + walking + workout, components: {
    baselineKcal: baseline, walkingKcal: walking, workoutKcal: workout
  } };
}

/** One-factor-at-a-time model sensitivity—not a probability distribution. */
export function inspectSensitivity(syntheticInput) {
  const input = normalizeInput(syntheticInput);
  const energy = estimateEnergy(input);
  const reference = energy.estimatedTdeeKcal;
  return {
    schemaVersion: '1.0.0',
    kind: 'synthetic-arithmetic-sensitivity',
    modelVersion: energy.modelVersion,
    units: 'kcal/day',
    referenceKcal: reference,
    referenceComponents: energy.components,
    methods: {
      design: 'one-factor-at-a-time',
      perturbations: 'arbitrary +-10% coefficient stress tests',
      notEmpiricalUncertainty: true,
      notPhysiologicallyValidated: true,
      purpose: 'reveal model-output sensitivity, not plausible human error'
    },
    cases: KNOBS.map(parameter => ({
      parameter,
      parameterUnit: parameter === 'wholeSessionMET' ? 'mean session MET' : 'model coefficient',
      perturbations: STRESS_FACTORS.map(factor => {
        const r = recompute({ energy, input }, parameter, factor);
        return { factor, estimatedTdeeKcal: r.total, changeFromReferenceKcal: r.total - reference, components: r.components };
      })
    })),
    warnings: [
      'The +/-10% stress factors are chosen for comparison, not measured parameter uncertainty.',
      'Sensitivity is not the same as importance to real-world prediction error.',
      'One-factor experiments exclude parameter interactions and cannot validate physiological accuracy.',
      'The 2,000-step baseline cutoff and walking/workout overlap ambiguity remain separate model limitations.'
    ]
  };
}
