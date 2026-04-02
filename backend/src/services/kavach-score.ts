/**
 * OffShift — Kavach Score Service
 * Bridge between the ML pricing engine and the backend
 */

import { Rider } from '../models/types';

// ─── Inline Kavach engine (to avoid cross-project import issues) ────────────

interface KavachRiderInput {
  pincode: string;
  shift_history: Array<{ date: string; hours_worked: number; earnings: number; pincode: string }>;
  weather_forecast_score: number;
  platform: 'zomato' | 'swiggy' | 'both';
  days_active: number;
  shift_pattern?: 'morning' | 'evening' | 'night' | 'mixed';
  claim_history?: Array<{ date: string; amount: number; trigger_type: string; approved: boolean }>;
}

interface KavachResult {
  riskScore: number;
  premium_24hr: number;
  premium_7day: number;
  premium_30day: number;
  max_payout_24hr: number;
  max_payout_7day: number;
  max_payout_30day: number;
  risk_factors: Array<{ factor: string; weight: number; contribution: number; description: string }>;
  confidence: number;
  trust_score: number;
  bonus_hours: number;
}

const PINCODE_RISK_MAP: Record<string, { base_risk: number; waterlogging: boolean; flood_zone: boolean; historical_rainfall_mm: number; outage_frequency: number; name: string }> = {
  '110020': { base_risk: 0.78, waterlogging: true, flood_zone: true, historical_rainfall_mm: 820, outage_frequency: 0.35, name: 'Okhla' },
  '110025': { base_risk: 0.72, waterlogging: true, flood_zone: false, historical_rainfall_mm: 780, outage_frequency: 0.30, name: 'Kalkaji' },
  '110001': { base_risk: 0.65, waterlogging: true, flood_zone: false, historical_rainfall_mm: 750, outage_frequency: 0.25, name: 'Connaught Place' },
  '110045': { base_risk: 0.55, waterlogging: false, flood_zone: false, historical_rainfall_mm: 620, outage_frequency: 0.20, name: 'Dwarka' },
  '110017': { base_risk: 0.60, waterlogging: false, flood_zone: false, historical_rainfall_mm: 680, outage_frequency: 0.22, name: 'Hauz Khas' },
  '110019': { base_risk: 0.58, waterlogging: false, flood_zone: false, historical_rainfall_mm: 650, outage_frequency: 0.18, name: 'Saket' },
  '110048': { base_risk: 0.62, waterlogging: true, flood_zone: false, historical_rainfall_mm: 700, outage_frequency: 0.28, name: 'Nehru Place' },
  '110070': { base_risk: 0.50, waterlogging: false, flood_zone: false, historical_rainfall_mm: 580, outage_frequency: 0.15, name: 'Vasant Kunj' },
  '122001': { base_risk: 0.68, waterlogging: true, flood_zone: true, historical_rainfall_mm: 790, outage_frequency: 0.32, name: 'Gurgaon' },
  '122002': { base_risk: 0.65, waterlogging: true, flood_zone: false, historical_rainfall_mm: 760, outage_frequency: 0.28, name: 'Gurgaon Sector 14' },
  '122018': { base_risk: 0.70, waterlogging: true, flood_zone: true, historical_rainfall_mm: 800, outage_frequency: 0.30, name: 'Cyber City' },
  '201301': { base_risk: 0.63, waterlogging: true, flood_zone: false, historical_rainfall_mm: 720, outage_frequency: 0.26, name: 'Noida' },
  '201303': { base_risk: 0.58, waterlogging: false, flood_zone: false, historical_rainfall_mm: 660, outage_frequency: 0.20, name: 'Noida Sector 62' },
  '201304': { base_risk: 0.55, waterlogging: false, flood_zone: false, historical_rainfall_mm: 640, outage_frequency: 0.18, name: 'Greater Noida' },
  '110085': { base_risk: 0.75, waterlogging: true, flood_zone: true, historical_rainfall_mm: 810, outage_frequency: 0.33, name: 'Laxmi Nagar' },
  '110092': { base_risk: 0.72, waterlogging: true, flood_zone: false, historical_rainfall_mm: 790, outage_frequency: 0.29, name: 'Shahdara' },
};

function calculateKavachScore(rider: KavachRiderInput): KavachResult {
  const pincodeData = PINCODE_RISK_MAP[rider.pincode] || { base_risk: 0.50, waterlogging: false, flood_zone: false, historical_rainfall_mm: 600, outage_frequency: 0.20, name: 'Unknown' };

  const avgHours = rider.shift_history.length > 0
    ? rider.shift_history.reduce((sum, s) => sum + s.hours_worked, 0) / rider.shift_history.length : 8;
  const shiftConsistency = Math.min(avgHours / 12, 1);
  const totalClaims = rider.claim_history?.length || 0;
  const approvedClaims = rider.claim_history?.filter(c => c.approved).length || 0;
  const claimFrequency = rider.days_active > 0 ? Math.min(totalClaims / (rider.days_active / 30), 1) : 0;
  const shiftPatternRisk: Record<string, number> = { 'morning': 0.7, 'evening': 0.9, 'night': 0.85, 'mixed': 0.8 };
  const patternRisk = shiftPatternRisk[rider.shift_pattern || 'mixed'] || 0.8;
  const platformRisk = rider.platform === 'zomato' ? 0.55 : rider.platform === 'swiggy' ? 0.50 : 0.52;
  const loyaltyScore = Math.min(rider.days_active / 365, 1);

  const features: Record<string, number> = {
    pincode_base_risk: pincodeData.base_risk,
    waterlogging_flag: pincodeData.waterlogging ? 1 : 0,
    flood_zone_flag: pincodeData.flood_zone ? 1 : 0,
    historical_rainfall: pincodeData.historical_rainfall_mm / 1000,
    outage_frequency: pincodeData.outage_frequency,
    weather_forecast: rider.weather_forecast_score,
    shift_consistency: shiftConsistency,
    claim_frequency: claimFrequency,
    approved_claim_ratio: totalClaims > 0 ? approvedClaims / totalClaims : 0.5,
    shift_pattern_risk: patternRisk,
    platform_risk: platformRisk,
    loyalty_score: loyaltyScore,
  };

  // XGBoost-style ensemble
  const trees = [
    { feature: 'pincode_base_risk', threshold: 0.65, left: -0.15, right: 0.20, weight: 0.25 },
    { feature: 'weather_forecast', threshold: 0.60, left: -0.10, right: 0.25, weight: 0.20 },
    { feature: 'waterlogging_flag', threshold: 0.5, left: -0.05, right: 0.15, weight: 0.12 },
    { feature: 'flood_zone_flag', threshold: 0.5, left: -0.03, right: 0.18, weight: 0.10 },
    { feature: 'historical_rainfall', threshold: 0.70, left: -0.08, right: 0.12, weight: 0.08 },
    { feature: 'outage_frequency', threshold: 0.25, left: -0.05, right: 0.10, weight: 0.07 },
    { feature: 'shift_pattern_risk', threshold: 0.80, left: -0.06, right: 0.08, weight: 0.06 },
    { feature: 'platform_risk', threshold: 0.52, left: -0.03, right: 0.05, weight: 0.04 },
    { feature: 'claim_frequency', threshold: 0.30, left: -0.08, right: 0.12, weight: 0.05 },
    { feature: 'loyalty_score', threshold: 0.50, left: 0.05, right: -0.08, weight: 0.03 },
  ];

  let score = 0.5;
  for (const tree of trees) {
    const val = features[tree.feature] || 0;
    score += (val <= tree.threshold ? tree.left : tree.right) * tree.weight;
  }
  const riskScore = Math.round((1 / (1 + Math.exp(-10 * (score - 0.5)))) * 100);

  // Premiums
  const calcPremium = (risk: number, min: number, max: number) => Math.round(min + (max - min) * Math.pow(risk / 100, 1.3));

  // Risk factors
  const risk_factors: Array<{ factor: string; weight: number; contribution: number; description: string }> = [];
  if (pincodeData.waterlogging) risk_factors.push({ factor: 'waterlogging_zone', weight: 0.12, contribution: 0.018, description: `${pincodeData.name} is a known waterlogging area` });
  if (pincodeData.flood_zone) risk_factors.push({ factor: 'flood_zone', weight: 0.10, contribution: 0.018, description: `${pincodeData.name} in flood-prone zone` });
  if (rider.weather_forecast_score > 0.6) risk_factors.push({ factor: 'severe_weather', weight: 0.20, contribution: 0.05, description: `High weather severity predicted` });
  if (rider.days_active > 90) risk_factors.push({ factor: 'loyalty_discount', weight: 0.03, contribution: -0.002, description: `${rider.days_active} days active — loyalty discount` });

  // Trust score
  const ageScore = Math.min(rider.days_active / 180, 1) * 0.20;
  const consScore = Math.min(avgHours / 10, 1) * 0.25;
  const claimScore = (totalClaims > 0 ? approvedClaims / totalClaims : 0.7) * 0.20;
  const activityScore = (rider.days_active > 30 ? 0.85 : 0.3) * 0.10;
  const trust_score = Math.round((ageScore + consScore + claimScore + 0.5 * 0.15 + activityScore + 0.9 * 0.10) * 100) / 100;

  // Dynamic coverage bonus
  let bonus_hours = 0;
  if (rider.weather_forecast_score > 0.7) bonus_hours = 6;
  else if (rider.weather_forecast_score > 0.4) bonus_hours = 4;
  else if (pincodeData.historical_rainfall_mm > 700 && rider.weather_forecast_score > 0.3) bonus_hours = 2;

  return {
    riskScore,
    premium_24hr: calcPremium(riskScore, 19, 49),
    premium_7day: calcPremium(riskScore, 79, 149),
    premium_30day: calcPremium(riskScore, 249, 449),
    max_payout_24hr: 500,
    max_payout_7day: 1500,
    max_payout_30day: 4000,
    risk_factors,
    confidence: Math.min(0.5 + (rider.shift_history.length > 10 ? 0.15 : rider.shift_history.length * 0.015) + (rider.days_active > 30 ? 0.15 : rider.days_active * 0.005) + (PINCODE_RISK_MAP[rider.pincode] ? 0.15 : 0), 0.98),
    trust_score,
    bonus_hours,
  };
}

/**
 * Get Kavach score for a rider from the database
 */
export function getKavachScoreForRider(rider: Rider, weatherForecast: number = 0.5): KavachResult {
  console.log(`🛡️ Kavach Engine: Computing score for ${rider.name} (${rider.pincode})`);

  const result = calculateKavachScore({
    pincode: rider.pincode,
    shift_history: [],
    weather_forecast_score: weatherForecast,
    platform: rider.platform,
    days_active: rider.days_active,
    shift_pattern: rider.shift_pattern,
  });

  console.log(`📊 Kavach Result: ${rider.name} — Risk=${result.riskScore}/100, Trust=${result.trust_score}, 24hr=₹${result.premium_24hr}, 7day=₹${result.premium_7day}`);

  return result;
}

export { calculateKavachScore, PINCODE_RISK_MAP };
export type { KavachResult, KavachRiderInput };
