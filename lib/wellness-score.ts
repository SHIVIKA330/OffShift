import { createClient } from '@/lib/supabase/server';

export interface WellnessInput {
  hasActivePolicy: boolean;
  zoneRiskScore: number;       // 0-1
  hasSuspiciousActivity: boolean;
  accountAgeDays: number;
  isUPIVerified: boolean;
  lastClaimWasApproved?: boolean;
}

export interface WellnessOutput {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  gradeLabel: string;
  breakdown: Record<string, number>;
  recommendations: string[];
  gradeColor: string;
}

export function calculateWellnessScore(input: WellnessInput): WellnessOutput {
  let score = 0;
  const breakdown: Record<string, number> = {};
  const recommendations: string[] = [];

  // Active policy: +30
  if (input.hasActivePolicy) {
    breakdown.activePolicy = 30;
    score += 30;
  } else {
    recommendations.push('Activate a plan to get +30 points and full income protection.');
  }

  // Zone risk: +0 to +20
  const zonePoints = Math.round((1 - input.zoneRiskScore) * 20);
  breakdown.zoneRisk = zonePoints;
  score += zonePoints;
  if (input.zoneRiskScore > 0.6) {
    recommendations.push('You are in a high-risk zone. Consider upgrading to Weekly or Monthly plan.');
  }

  // No suspicious activity: +20
  if (!input.hasSuspiciousActivity) {
    breakdown.cleanRecord = 20;
    score += 20;
  } else {
    recommendations.push('Your account has flagged activity. Contact support to resolve.');
  }

  // Account age > 30 days: +15
  if (input.accountAgeDays >= 30) {
    breakdown.accountAge = 15;
    score += 15;
  } else {
    breakdown.accountAge = Math.round((input.accountAgeDays / 30) * 15);
    score += breakdown.accountAge;
    recommendations.push(`Account verified for ${input.accountAgeDays} days. Full trust score in ${30 - input.accountAgeDays} days.`);
  }

  // UPI verified: +15
  if (input.isUPIVerified) {
    breakdown.upiVerified = 15;
    score += 15;
  } else {
    recommendations.push('Verify your UPI ID to unlock faster payouts and +15 wellness points.');
  }

  const grade: WellnessOutput['grade'] =
    score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D';

  const gradeLabels = { A: 'Fully Protected', B: 'Well Protected', C: 'Partial Cover', D: 'At Risk' };
  const gradeColors = { A: '#3B6D11', B: '#185FA5', C: '#854F0B', D: '#A32D2D' };

  return {
    score,
    grade,
    gradeLabel: gradeLabels[grade],
    breakdown,
    recommendations,
    gradeColor: gradeColors[grade],
  };
}
