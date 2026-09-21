import { VitalityStatus } from '@prisma/client';

export interface LanguageVitalityData {
  vitalityStatus?: VitalityStatus | string | null;
  estimatedSpeakers?: number | null;
  averageSpeakerAge?: number | null;
}

export interface VitalityCalculationInput {
  languages: LanguageVitalityData[];
  recordCount: number;
}

export interface VitalityCalculationResult {
  score: number;
  status: VitalityStatus;
  breakdown: {
    statusScore: number;
    speakerScore: number;
    ageScore: number;
    recordBuffer: number;
    rawScore: number;
  };
}

/**
 * Maps linked language VitalityStatus enum to numerical base score.
 */
export function getStatusWeight(status?: VitalityStatus | string | null): number {
  switch (status) {
    case 'CRITICAL':
      return 9.5;
    case 'ENDANGERED':
      return 7.0;
    case 'VULNERABLE':
      return 5.0;
    case 'SAFE':
      return 2.0;
    default:
      return 5.0;
  }
}

/**
 * Computes speaker scarcity factor (1.0 to 10.0) informed by UNESCO language vitality factors:
 * - <= 100 speakers: 10.0 (Immediate collapse)
 * - <= 1,000 speakers: 8.5 (Severely endangered)
 * - <= 10,000 speakers: 7.0 (Endangered)
 * - <= 50,000 speakers: 5.0 (Vulnerable)
 * - <= 200,000 speakers: 3.0 (At Risk)
 * - > 200,000 speakers: 1.0 (Safe / Institutionalized)
 */
export function getSpeakerScarcityScore(speakers?: number | null): number {
  if (speakers === undefined || speakers === null) return 5.0;
  if (speakers <= 100) return 10.0;
  if (speakers <= 1000) return 8.5;
  if (speakers <= 10000) return 7.0;
  if (speakers <= 50000) return 5.0;
  if (speakers <= 200000) return 3.0;
  return 1.0;
}

/**
 * Computes intergenerational transmission score from average speaker age:
 * (AvgAge - 20) / 5, clamped between 1.0 and 10.0.
 * - Age 68+: 9.6 - 10.0 (Moribund; transmission to youth has ceased)
 * - Age 55-60: 7.0 - 8.0 (Elders only)
 * - Age 45: 5.0 (Middle-aged; partial transmission)
 * - Age 25-30: 1.0 - 2.0 (Active multi-generational youth transmission)
 */
export function getSpeakerAgeScore(age?: number | null): number {
  if (age === undefined || age === null) return 5.0;
  const score = (age - 20) / 5;
  return Math.min(10.0, Math.max(1.0, score));
}

/**
 * Maps calculated numeric score (1.0 - 10.0) to VitalityStatus enum:
 * - >= 7.5: CRITICAL
 * - >= 5.5: ENDANGERED
 * - >= 3.5: VULNERABLE
 * - < 3.5: SAFE
 */
export function scoreToStatus(score: number): VitalityStatus {
  if (score >= 7.5) return 'CRITICAL';
  if (score >= 5.5) return 'ENDANGERED';
  if (score >= 3.5) return 'VULNERABLE';
  return 'SAFE';
}

/**
 * Core Vitality Score calculation informed by UNESCO language vitality factors:
 * VitalityScore = (0.35 * StatusWeight + 0.35 * SpeakerScarcity + 0.30 * SpeakerAge) - RecordBuffer
 * Clamped strictly between 1.0 (Safe) and 9.9 (Critical).
 */
export function calculateVitalityScore(input: VitalityCalculationInput): VitalityCalculationResult {
  const { languages, recordCount } = input;

  // Fallback if no languages linked to region yet
  if (!languages || languages.length === 0) {
    const buffer = Math.min(1.0, Math.max(0, recordCount * 0.05));
    const rawScore = 5.0 - buffer;
    const clampedScore = Math.min(9.9, Math.max(1.0, rawScore));
    const finalScore = Math.round(clampedScore * 10) / 10;
    return {
      score: finalScore,
      status: scoreToStatus(finalScore),
      breakdown: {
        statusScore: 5.0,
        speakerScore: 5.0,
        ageScore: 5.0,
        recordBuffer: buffer,
        rawScore,
      },
    };
  }

  // 1. Language Status Weight (35%)
  const totalStatus = languages.reduce((acc, l) => acc + getStatusWeight(l.vitalityStatus), 0);
  const avgStatus = totalStatus / languages.length;

  // 2. Speaker Scarcity Factor (35%)
  const totalSpeakers = languages.reduce((acc, l) => acc + getSpeakerScarcityScore(l.estimatedSpeakers), 0);
  const avgSpeakers = totalSpeakers / languages.length;

  // 3. Intergenerational Age Factor (30%)
  const totalAge = languages.reduce((acc, l) => acc + getSpeakerAgeScore(l.averageSpeakerAge), 0);
  const avgAge = totalAge / languages.length;

  // 4. Documentation Relief Buffer (rewarding verified records, max -1.0)
  const buffer = Math.min(1.0, Math.max(0, recordCount * 0.05));

  // Weighted Combination
  const rawScore = (0.35 * avgStatus) + (0.35 * avgSpeakers) + (0.30 * avgAge) - buffer;

  // Clamped strictly between 1.0 and 9.9, rounded to 1 decimal place
  const clampedScore = Math.min(9.9, Math.max(1.0, rawScore));
  const finalScore = Math.round(clampedScore * 10) / 10;

  return {
    score: finalScore,
    status: scoreToStatus(finalScore),
    breakdown: {
      statusScore: Math.round(avgStatus * 10) / 10,
      speakerScore: Math.round(avgSpeakers * 10) / 10,
      ageScore: Math.round(avgAge * 10) / 10,
      recordBuffer: Math.round(buffer * 100) / 100,
      rawScore: Math.round(rawScore * 1000) / 1000,
    },
  };
}
