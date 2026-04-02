/**
 * OffShift — Kavach Risk Score & Pricing Engine
 * XGBoost-style scoring function for parametric insurance pricing
 * 
 * Inputs: rider profile + environmental signals
 * Outputs: risk score, dynamic premiums across 3 plan tiers
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RiderInput {
  pincode: string;
  shift_history: ShiftRecord[];
  weather_forecast_score: number;  // 0-1, higher = more severe weather predicted
  platform: 'zomato' | 'swiggy' | 'both';
  days_active: number;
  claim_history?: ClaimRecord[];
  shift_pattern?: 'morning' | 'evening' | 'night' | 'mixed';
}

export interface ShiftRecord {
  date: string;
  hours_worked: number;
  earnings: number;
  pincode: string;
}

export interface ClaimRecord {
  date: string;
  amount: number;
  trigger_type: 'weather' | 'outage' | 'curfew';
  approved: boolean;
}

export interface KavachScoreResult {
  riskScore: number;           // 0-100, higher = riskier
  premium_24hr: number;        // ₹19-₹49
  premium_7day: number;        // ₹79-₹149
  premium_30day: number;       // ₹249-₹449
  max_payout_24hr: number;     // ₹500
  max_payout_7day: number;     // ₹1500
  max_payout_30day: number;    // ₹4000
  risk_factors: RiskFactor[];
  confidence: number;          // 0-1
  trust_score: number;         // 0-1
  bonus_hours: number;         // 0-8
}

export interface RiskFactor {
  factor: string;
  weight: number;
  contribution: number;
  description: string;
}

// ─── Pincode Risk Database (Delhi NCR) ──────────────────────────────────────

const PINCODE_RISK_MAP: Record<string, {
  base_risk: number;
  waterlogging: boolean;
  flood_zone: boolean;
  historical_rainfall_mm: number;
  outage_frequency: number;
  name: string;
}> = {
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

// ─── Feature Engineering ────────────────────────────────────────────────────

function extractFeatures(rider: RiderInput): Record<string, number> {
  const pincodeData = PINCODE_RISK_MAP[rider.pincode] || {
    base_risk: 0.50, waterlogging: false, flood_zone: false,
    historical_rainfall_mm: 600, outage_frequency: 0.20, name: 'Unknown'
  };

  // Calculate shift consistency score (0-1, higher = more consistent)
  const avgHours = rider.shift_history.length > 0
    ? rider.shift_history.reduce((sum, s) => sum + s.hours_worked, 0) / rider.shift_history.length
    : 8;
  const shiftConsistency = Math.min(avgHours / 12, 1);

  // Calculate claim frequency (0-1, higher = more claims)
  const totalClaims = rider.claim_history?.length || 0;
  const approvedClaims = rider.claim_history?.filter(c => c.approved).length || 0;
  const claimFrequency = rider.days_active > 0 ? Math.min(totalClaims / (rider.days_active / 30), 1) : 0;

  // Shift pattern risk multiplier
  const shiftPatternRisk: Record<string, number> = {
    'morning': 0.7,   // Lower risk (less rain exposure)
    'evening': 0.9,   // Higher risk (monsoon timing)
    'night': 0.85,    // Moderate-high risk
    'mixed': 0.8,     // Moderate risk
  };
  const patternRisk = shiftPatternRisk[rider.shift_pattern || 'mixed'] || 0.8;

  // Platform risk (Zomato has slightly higher outage history)
  const platformRisk = rider.platform === 'zomato' ? 0.55 : rider.platform === 'swiggy' ? 0.50 : 0.52;

  // Loyalty score (more days = more loyal = lower risk premium)
  const loyaltyScore = Math.min(rider.days_active / 365, 1);

  return {
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
    days_active_normalized: Math.min(rider.days_active / 365, 1),
  };
}

// ─── XGBoost-Style Scoring (Gradient Boosted Trees Simulation) ──────────────

function xgboostScore(features: Record<string, number>): number {
  // Simulate XGBoost ensemble with weighted decision stumps
  // Each "tree" contributes a partial score

  const trees: Array<{ feature: string; threshold: number; left: number; right: number; weight: number }> = [
    // Tree 1: Pincode base risk (strongest signal)
    { feature: 'pincode_base_risk', threshold: 0.65, left: -0.15, right: 0.20, weight: 0.25 },
    // Tree 2: Weather forecast severity
    { feature: 'weather_forecast', threshold: 0.60, left: -0.10, right: 0.25, weight: 0.20 },
    // Tree 3: Waterlogging zone
    { feature: 'waterlogging_flag', threshold: 0.5, left: -0.05, right: 0.15, weight: 0.12 },
    // Tree 4: Flood zone
    { feature: 'flood_zone_flag', threshold: 0.5, left: -0.03, right: 0.18, weight: 0.10 },
    // Tree 5: Historical rainfall
    { feature: 'historical_rainfall', threshold: 0.70, left: -0.08, right: 0.12, weight: 0.08 },
    // Tree 6: Outage frequency
    { feature: 'outage_frequency', threshold: 0.25, left: -0.05, right: 0.10, weight: 0.07 },
    // Tree 7: Shift pattern risk
    { feature: 'shift_pattern_risk', threshold: 0.80, left: -0.06, right: 0.08, weight: 0.06 },
    // Tree 8: Platform risk
    { feature: 'platform_risk', threshold: 0.52, left: -0.03, right: 0.05, weight: 0.04 },
    // Tree 9: Claim frequency (higher claims = higher risk)
    { feature: 'claim_frequency', threshold: 0.30, left: -0.08, right: 0.12, weight: 0.05 },
    // Tree 10: Loyalty discount (more loyal = lower risk)
    { feature: 'loyalty_score', threshold: 0.50, left: 0.05, right: -0.08, weight: 0.03 },
  ];

  let score = 0.5; // Base score (logistic center)
  
  for (const tree of trees) {
    const featureValue = features[tree.feature] || 0;
    const leafValue = featureValue <= tree.threshold ? tree.left : tree.right;
    score += leafValue * tree.weight;
  }

  // Sigmoid activation to bound output
  const sigmoid = 1 / (1 + Math.exp(-10 * (score - 0.5)));
  
  return Math.round(sigmoid * 100);
}

// ─── Dynamic Premium Calculator ────────────────────────────────────────────

function calculatePremium(riskScore: number, planType: '24hr' | '7day' | '30day'): number {
  const premiumRanges = {
    '24hr':  { min: 19, max: 49, base: 29 },
    '7day':  { min: 79, max: 149, base: 99 },
    '30day': { min: 249, max: 449, base: 349 },
  };

  const range = premiumRanges[planType];
  const riskFraction = riskScore / 100;
  
  // Non-linear pricing curve (slightly exponential for high-risk)
  const adjustedRisk = Math.pow(riskFraction, 1.3);
  const premium = range.min + (range.max - range.min) * adjustedRisk;
  
  return Math.round(premium);
}

// ─── Trust Score Calculator ────────────────────────────────────────────────

function calculateTrustScore(rider: RiderInput): number {
  let trustSignals: number[] = [];

  // Signal 1: Account age (longer = more trusted)
  const ageScore = Math.min(rider.days_active / 180, 1);
  trustSignals.push(ageScore * 0.20);

  // Signal 2: Shift consistency
  const avgHours = rider.shift_history.length > 0
    ? rider.shift_history.reduce((sum, s) => sum + s.hours_worked, 0) / rider.shift_history.length
    : 0;
  const consistencyScore = Math.min(avgHours / 10, 1);
  trustSignals.push(consistencyScore * 0.25);

  // Signal 3: Claim legitimacy ratio
  const totalClaims = rider.claim_history?.length || 0;
  const approvedClaims = rider.claim_history?.filter(c => c.approved).length || 0;
  const claimScore = totalClaims > 0 ? approvedClaims / totalClaims : 0.7;
  trustSignals.push(claimScore * 0.20);

  // Signal 4: Pincode consistency (works in same area)
  const uniquePincodes = new Set(rider.shift_history.map(s => s.pincode)).size;
  const pincodeConsistency = uniquePincodes > 0 ? Math.min(1 / uniquePincodes * 2, 1) : 0.5;
  trustSignals.push(pincodeConsistency * 0.15);

  // Signal 5: Platform activity signal (simulated)
  const platformActivityScore = rider.days_active > 30 ? 0.85 : rider.days_active > 7 ? 0.6 : 0.3;
  trustSignals.push(platformActivityScore * 0.10);

  // Signal 6: Device fingerprint uniqueness (simulated as always valid for mock)
  trustSignals.push(0.9 * 0.10);

  const totalTrust = trustSignals.reduce((sum, s) => sum + s, 0);
  return Math.round(totalTrust * 100) / 100;
}

// ─── Main Export: calculateKavachScore ──────────────────────────────────────

export function calculateKavachScore(rider: RiderInput): KavachScoreResult {
  console.log(`🛡️ Kavach Engine: Calculating risk score for rider in ${rider.pincode} (${rider.platform})`);

  // Extract features
  const features = extractFeatures(rider);
  
  // Run XGBoost-style scoring
  const riskScore = xgboostScore(features);
  
  // Calculate dynamic premiums for each tier
  const premium_24hr = calculatePremium(riskScore, '24hr');
  const premium_7day = calculatePremium(riskScore, '7day');
  const premium_30day = calculatePremium(riskScore, '30day');

  // Calculate trust score
  const trust_score = calculateTrustScore(rider);

  // Build risk factors explanation
  const risk_factors: RiskFactor[] = [];
  const pincodeData = PINCODE_RISK_MAP[rider.pincode];
  
  if (pincodeData) {
    if (pincodeData.waterlogging) {
      risk_factors.push({
        factor: 'waterlogging_zone',
        weight: 0.12,
        contribution: features.waterlogging_flag * 0.15 * 0.12,
        description: `${pincodeData.name} is a known waterlogging area (+₹${Math.round(premium_7day * 0.05)} risk adjustment)`
      });
    }
    if (pincodeData.flood_zone) {
      risk_factors.push({
        factor: 'flood_zone',
        weight: 0.10,
        contribution: features.flood_zone_flag * 0.18 * 0.10,
        description: `${pincodeData.name} is in a historically flood-prone zone`
      });
    }
    if (pincodeData.base_risk > 0.65) {
      risk_factors.push({
        factor: 'high_risk_pincode',
        weight: 0.25,
        contribution: (pincodeData.base_risk - 0.5) * 0.25,
        description: `${pincodeData.name} (${rider.pincode}) has high historical disruption frequency`
      });
    }
  }

  if (rider.weather_forecast_score > 0.6) {
    risk_factors.push({
      factor: 'severe_weather_forecast',
      weight: 0.20,
      contribution: rider.weather_forecast_score * 0.25 * 0.20,
      description: `Severe weather predicted (confidence: ${Math.round(rider.weather_forecast_score * 100)}%)`
    });
  }

  if (rider.shift_pattern === 'evening') {
    risk_factors.push({
      factor: 'evening_shift_risk',
      weight: 0.06,
      contribution: 0.08 * 0.06,
      description: 'Evening shift has higher monsoon exposure window (6PM-10PM)'
    });
  }

  if (rider.days_active > 90) {
    risk_factors.push({
      factor: 'loyalty_discount',
      weight: 0.03,
      contribution: -0.08 * 0.03,
      description: `${rider.days_active} days active — loyalty discount applied`
    });
  }

  // Calculate confidence based on data availability
  const confidence = Math.min(
    0.5 + 
    (rider.shift_history.length > 10 ? 0.15 : rider.shift_history.length * 0.015) +
    (rider.days_active > 30 ? 0.15 : rider.days_active * 0.005) +
    (pincodeData ? 0.15 : 0) +
    (rider.claim_history && rider.claim_history.length > 0 ? 0.05 : 0),
    0.98
  );

  // Dynamic coverage bonus
  let bonus_hours = 0;
  if (rider.weather_forecast_score > 0.7) bonus_hours = 6;
  else if (rider.weather_forecast_score > 0.4) bonus_hours = 4;
  else if (pincodeData && pincodeData.historical_rainfall_mm > 700 && rider.weather_forecast_score > 0.3) bonus_hours = 2;

  const result: KavachScoreResult = {
    riskScore,
    premium_24hr,
    premium_7day,
    premium_30day,
    max_payout_24hr: 500,
    max_payout_7day: 1500,
    max_payout_30day: 4000,
    risk_factors,
    confidence: Math.round(confidence * 100) / 100,
    trust_score,
    bonus_hours,
  };

  console.log(`📊 Kavach Result: Risk=${riskScore}/100, 24hr=₹${premium_24hr}, 7day=₹${premium_7day}, 30day=₹${premium_30day}, Trust=${trust_score}`);

  return result;
}

// ─── Convenience: Quick quote for a pincode ─────────────────────────────────

export function getQuickQuote(pincode: string, platform: 'zomato' | 'swiggy' | 'both' = 'zomato'): KavachScoreResult {
  return calculateKavachScore({
    pincode,
    shift_history: [],
    weather_forecast_score: 0.5,
    platform,
    days_active: 30,
    shift_pattern: 'mixed',
  });
}

// ─── Export pincode data for dashboard ──────────────────────────────────────

export function getPincodeRiskData() {
  return PINCODE_RISK_MAP;
}

export { PINCODE_RISK_MAP };
