/**
 * METRON — deterministic, dependency-free physiology estimates.
 * All outputs are estimates, not clinical decisions. Numerical model: 0.1.0.
 * @module metron/core
 */
export const MODEL_VERSION = '0.1.0';
export const DEFAULTS = Object.freeze({
  profile: Object.freeze({ weightKg: 80, heightCm: 175, ageYears: 30, equationSex: 'male', bodyFatPercent: null, skeletalMuscleKg: null }),
  activity: Object.freeze({ steps: 10000, workoutMinutes: 60, intensity: 'typical', restingModel: 'mifflin' }),
  recovery: Object.freeze({ sleepHours: 7.5, energy: 'good', weekly: 'mixed', musculoskeletal: 'fine', usualMuscleSets: 14, focus: 'legs', usualSteps: 10000 })
});
const MET = Object.freeze({ light: 2.5, typical: 3.5, hard: 5 });
const RANGES = Object.freeze({
  weightKg: [25, 350], heightCm: [100, 250], ageYears: [18, 105],
  bodyFatPercent: [2, 75], skeletalMuscleKg: [5, 150], steps: [0, 100000],
  workoutMinutes: [0, 360], sleepHours: [0, 24], usualMuscleSets: [1, 60], usualSteps: [500, 100000]
});
const enums = { equationSex: ['male', 'female'], restingModel: ['mifflin', 'cunningham'], intensity: Object.keys(MET), energy: ['low', 'okay', 'good'], weekly: ['fresh', 'mixed', 'fatigued'], musculoskeletal: ['fine', 'sore', 'pain'], focus: ['chest', 'back', 'legs', 'other'] };
function bounded(name, n, nullable=false) {
  if (nullable && n == null) return null;
  const [min,max] = RANGES[name];
  if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max) throw new RangeError(`${name} must be a finite number between ${min} and ${max}`);
  return n;
}
function enumeration(name, value) {
  if (!enums[name]?.includes(value)) throw new TypeError(`${name} must be one of: ${enums[name]?.join(', ')}`);
  return value;
}
function dataRecord(value, label) {
  if (value === null || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype,null].includes(Object.getPrototypeOf(value))) throw new TypeError(label+' must be a plain data object');
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string' || (!Object.hasOwn(Object.getOwnPropertyDescriptor(value,key),'value')||!Object.getOwnPropertyDescriptor(value,key).enumerable)) throw new TypeError(label+' must contain data properties only');
  }
}
/** Validate and normalize a complete or partial input object without mutating it. */
export function normalizeInput(input = {}) {
  dataRecord(input,'Input');
  const allowedTop = ['profile','activity','recovery'];
  for (const k of Reflect.ownKeys(input)) if (!allowedTop.includes(k)) throw new TypeError('Unknown top-level field');
  for (const [section,allowed] of Object.entries(DEFAULTS)) {
    const supplied=input[section];
    if (supplied === null) throw new TypeError(`${section} must not be null`);
    if (supplied !== undefined) dataRecord(supplied,section);
    for (const k of Reflect.ownKeys(supplied ?? {})) if (!Object.hasOwn(allowed,k)) throw new TypeError(`Unknown ${section} field`);
  }
  const profile = { ...DEFAULTS.profile, ...(input.profile ?? {}) };
  const activity = { ...DEFAULTS.activity, ...(input.activity ?? {}) };
  const recovery = { ...DEFAULTS.recovery, ...(input.recovery ?? {}) };
  for (const field of ['weightKg','heightCm','ageYears']) profile[field] = bounded(field,profile[field]);
  for (const field of ['bodyFatPercent','skeletalMuscleKg']) profile[field] = bounded(field,profile[field],true);
  profile.equationSex = enumeration('equationSex',profile.equationSex);
  for (const field of ['steps','workoutMinutes']) activity[field] = bounded(field,activity[field]);
  for (const field of ['restingModel','intensity']) activity[field] = enumeration(field,activity[field]);
  for (const field of ['sleepHours','usualMuscleSets','usualSteps']) recovery[field] = bounded(field,recovery[field]);
  for (const field of ['energy','weekly','musculoskeletal','focus']) recovery[field] = enumeration(field,recovery[field]);
  if(profile.skeletalMuscleKg != null && profile.skeletalMuscleKg>profile.weightKg) throw new RangeError('skeletalMuscleKg cannot exceed body weight');
  if (profile.bodyFatPercent != null && profile.skeletalMuscleKg != null) {
    const ffm = profile.weightKg * (1-profile.bodyFatPercent/100);
    if (profile.skeletalMuscleKg > ffm) throw new RangeError('skeletalMuscleKg cannot exceed estimated fat-free mass');
  }
  if (activity.restingModel === 'cunningham' && profile.bodyFatPercent == null) {
    throw new RangeError('Cunningham requires bodyFatPercent; use mifflin when it is unknown');
  }
  return { profile,activity,recovery };
}
export function mifflinStJeor(profile) {
  dataRecord(profile,'Profile');
  const weightKg=bounded('weightKg',profile.weightKg),heightCm=bounded('heightCm',profile.heightCm),ageYears=bounded('ageYears',profile.ageYears),equationSex=enumeration('equationSex',profile.equationSex);
  return 10 * weightKg + 6.25 * heightCm - 5 * ageYears + (equationSex === 'male' ? 5 : -161);
}
export function fatFreeMassKg(profile) {
  dataRecord(profile,'Profile');
  const weightKg=bounded('weightKg',profile.weightKg),bodyFatPercent=bounded('bodyFatPercent',profile.bodyFatPercent,true);
  if (bodyFatPercent == null) return null;
  return weightKg * (1 - bodyFatPercent / 100);
}
export function cunninghamRmr(ffmKg) {
  if(typeof ffmKg!=='number'||!Number.isFinite(ffmKg)||ffmKg<=0||ffmKg>350) throw new RangeError('ffmKg must be a finite number greater than zero and at most 350');
  return 500 + 22 * ffmKg;
}
/** Calculate an illustrative energy expenditure breakdown. Calorie units are kcal/day. */
export function estimateEnergy(input = {}) {
  const { profile, activity } = normalizeInput(input);
  const ffm = fatFreeMassKg(profile);
  const mifflin = mifflinStJeor(profile);
  const cunningham = ffm == null ? null : cunninghamRmr(ffm);
  const rmr = activity.restingModel === 'cunningham' ? cunningham : mifflin;
  const baselineKcal = 1.2 * rmr;
  const strideMeters = profile.heightCm / 100 * 0.415;
  const incrementalSteps = Math.max(0,activity.steps - 2000);
  const incrementalWalkingKm = incrementalSteps * strideMeters / 1000;
  const walkingKcal = 0.5 * profile.weightKg * incrementalWalkingKm;
  const sessionMet = MET[activity.intensity];
  const gymGrossKcal = sessionMet * profile.weightKg * (activity.workoutMinutes/60);
  const gymBaselineKcal = baselineKcal / 24 * (activity.workoutMinutes/60);
  const workoutKcal = Math.max(0, gymGrossKcal - gymBaselineKcal);
  const warnings = [
    'This is an illustrative population-based estimate, not a measured calorie burn.',
    'Step estimates assume level-ground walking, a height-derived stride and 2,000 steps within the sedentary baseline.',
    'Avoid double counting workout steps (such as treadmill walking) in both activity fields.',
    'Workout MET is a whole-session average that includes rest periods; presets are not individualized.',
  ];
  if (activity.steps < 2000) warnings.push('The sedentary baseline is not reduced when fewer than 2,000 steps are entered.');
  return {
    modelVersion: MODEL_VERSION, units: 'kcal/day',
    restingModel: activity.restingModel,
    components: { baselineKcal, walkingKcal, workoutKcal },
    estimatedTdeeKcal: baselineKcal + walkingKcal + workoutKcal,
    derived: { restingKcal: rmr, mifflinKcal: mifflin, cunninghamKcal: cunningham,
      fatFreeMassKg: ffm, strideMeters, incrementalSteps, incrementalWalkingKm, sessionMet },
    assumptions: { sedentaryMultiplier: 1.2, includedBaselineSteps: 2000, walkingNetKcalPerKgKm: 0.5,
      strideHeightRatio: 0.415, metPreset: activity.intensity }, warnings
  };
}
/** Training readiness is explicitly a coaching heuristic, not a clinical algorithm. */
export function evaluateRecovery(input = {}) {
  const { activity, recovery } = normalizeInput(input);
  const daily = recovery.sleepHours < 5 || recovery.energy === 'low' || recovery.musculoskeletal === 'pain' ? 0 :
    recovery.sleepHours < 7 || recovery.energy === 'okay' || recovery.musculoskeletal === 'sore' ? 1 : 2;
  const weekly = recovery.weekly === 'fresh' ? 0 : recovery.weekly === 'mixed' ? 1 : 2;
  const ratios = [ [[0.3,0.5],[0.15,0.35],[0,0]], [[0.65,0.85],[0.5,0.75],[0.3,0.5]], [[0.9,1],[0.7,0.9],[0.5,0.7]] ];
  const caution = recovery.sleepHours < 5 || recovery.musculoskeletal === 'pain' || (daily === 0 && weekly === 2);
  const ratio = ratios[daily][weekly];
  const range = caution ? [0,0] : ratio.map(x => Math.round(recovery.usualMuscleSets*x));
  const status = caution ? 'recovery-first' : daily===2 && weekly===0 ? 'full-session' : daily===2 || weekly===0 ? 'train-adjust' : 'reduce-volume';
  const stepRatio = activity.steps/recovery.usualSteps;
  const notes = [];
  if (recovery.sleepHours < 5) notes.push('Sleep below five hours: consider prioritizing recovery over demanding training.');
  if (recovery.musculoskeletal === 'pain') notes.push('Painful joints or muscles: avoid painful movements; seek evaluation for unusual or persistent pain.');
  if (stepRatio >= 1.5 && recovery.focus === 'legs') notes.push('Planned steps are at least 1.5× normal; monitor leg fatigue before adding volume.');
  if (!notes.length) notes.push('Prioritize performance, alertness, and technique over hitting a rigid set quota.');
  return { modelVersion: MODEL_VERSION, classification: { daily: ['low','mixed','good'][daily], weekly: recovery.weekly }, status,
    recommendation: { minSets: range[0], maxSets: range[1], unit: 'working sets for one target muscle in this session', restRecommended: caution },
    notes, disclaimer: 'Illustrative coaching heuristics only; not validated to predict injury, readiness, or safe set counts.' };
}
export function evaluate(input = {}) {
  const normalized = normalizeInput(input);
  return { energy: estimateEnergy(normalized), recovery: evaluateRecovery(normalized) };
}
