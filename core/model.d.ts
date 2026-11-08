export interface Profile {
  weightKg: number; heightCm: number; ageYears: number;
  equationSex: 'male' | 'female'; bodyFatPercent: number | null; skeletalMuscleKg: number | null;
}
export interface Activity {
  steps: number; workoutMinutes: number; intensity: 'light' | 'typical' | 'hard';
  restingModel: 'mifflin' | 'cunningham';
}
export interface Recovery {
  sleepHours: number; energy: 'low' | 'okay' | 'good'; weekly: 'fresh' | 'mixed' | 'fatigued';
  musculoskeletal: 'fine' | 'sore' | 'pain'; usualMuscleSets: number;
  focus: 'chest' | 'back' | 'legs' | 'other'; usualSteps: number;
}
export interface Input { profile?: Partial<Profile>; activity?: Partial<Activity>; recovery?: Partial<Recovery>; }
export interface EnergyOutput {
  modelVersion: string; units: 'kcal/day'; restingModel: Activity['restingModel'];
  components: { baselineKcal: number; walkingKcal: number; workoutKcal: number };
  estimatedTdeeKcal: number;
  derived: { restingKcal: number; mifflinKcal: number; cunninghamKcal: number | null; fatFreeMassKg: number | null; strideMeters: number; incrementalSteps: number; incrementalWalkingKm: number; sessionMet: number };
  assumptions: { sedentaryMultiplier: number; includedBaselineSteps: number; walkingNetKcalPerKgKm: number; strideHeightRatio: number; metPreset: Activity['intensity'] };
  warnings: string[];
}
export interface RecoveryOutput { modelVersion: string; classification: { daily: string; weekly: string }; status: string;
  recommendation: { minSets: number; maxSets: number; unit: string; restRecommended: boolean }; notes: string[]; disclaimer: string }
export declare const MODEL_VERSION: string;
export declare const DEFAULTS: Readonly<{profile: Readonly<Profile>;activity: Readonly<Activity>;recovery: Readonly<Recovery>}>;
export declare function normalizeInput(input?: Input): {profile:Profile;activity:Activity;recovery:Recovery};
export declare function mifflinStJeor(profile: Pick<Profile,'weightKg'|'heightCm'|'ageYears'|'equationSex'>): number;
export declare function fatFreeMassKg(profile: Pick<Profile,'weightKg'|'bodyFatPercent'>): number | null;
export declare function cunninghamRmr(ffmKg: number): number;
export declare function estimateEnergy(input?: Input): EnergyOutput;
export declare function evaluateRecovery(input?: Input): RecoveryOutput;
export declare function evaluate(input?: Input): {energy:EnergyOutput;recovery:RecoveryOutput};
