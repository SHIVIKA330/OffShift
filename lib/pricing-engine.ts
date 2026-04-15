import Anthropic from '@anthropic-ai/sdk';
import { calculateTier, getPayoutAmount, getSeasonalMultiplier, PayoutTier } from './tiers';

const anthropic = new Anthropic();

export interface PricingInput {
  workerId: string;
  pincode: string;
  city: string;
  avgDailyOrders: number;
  zoneRiskScore: number;       // 0-1, fetched from zone_risk_scores table
  historicalClaimRate: number; // 0-1, worker's claim history ratio
  accountAgeDays: number;
  planType: 'daily' | 'weekly' | 'monthly';
}

export interface PricingOutput {
  tier: PayoutTier;
  payoutAmount: number;
  mlPremium: number;
  actuarialPremium: number;
  finalPremium: number;
  seasonalMultiplier: number;
  featureBreakdown: FeatureBreakdown;
  hindiExplanation: string;
  englishExplanation: string;
}

export interface FeatureBreakdown {
  zoneRiskContribution: number;    // % of premium from zone risk
  historicalClaimContribution: number;
  seasonalContribution: number;
  accountAgeContribution: number;
  orderVolumeContribution: number;
}

// Base plan costs before risk adjustment
const BASE_PREMIUM: Record<string, number> = {
  daily: 12,
  weekly: 49,
  monthly: 349,
};

export async function calculateHybridPremium(input: PricingInput): Promise<PricingOutput> {
  const tier = calculateTier(input.avgDailyOrders);
  const payoutAmount = getPayoutAmount(tier); // S in formula
  const seasonalMultiplier = getSeasonalMultiplier();
  const basePremium = BASE_PREMIUM[input.planType];

  // ── ACTUARIAL COMPONENT ──────────────────────────────────
  // λ = claim frequency (zone risk score used as proxy)
  // S = payout severity (tier-based, NOT flat ₹500 — this was GuidePay's critical fix)
  // Formula: P_actuarial = (λ·S + 0.25·√λ·S) × 1.30 × M_seasonal
  const lambda = input.zoneRiskScore; // zone claim frequency
  const expectedLoss = lambda * payoutAmount;
  const volatilityLoading = 0.25 * Math.sqrt(lambda) * payoutAmount;
  const expenseRatio = 1.30; // 30% for operations + profit
  const actuarialPremium = Math.round(
    (expectedLoss + volatilityLoading) * expenseRatio * seasonalMultiplier
  );

  // ── ML COMPONENT ─────────────────────────────────────────
  // Weighted feature scoring (simplified RandomForest simulation)
  // In production: replace with actual sklearn model via Python API
  const featureWeights = {
    zoneRisk: 0.28,
    historicalClaim: 0.22,
    seasonal: 0.18,
    accountAge: 0.08,
    orderVolume: 0.06,
  };

  // Normalize features to 0-1 and compute weighted risk
  const normalizedAge = Math.min(input.accountAgeDays / 365, 1);
  const normalizedOrders = Math.min(input.avgDailyOrders / 20, 1);

  const riskScore =
    featureWeights.zoneRisk * input.zoneRiskScore +
    featureWeights.historicalClaim * input.historicalClaimRate +
    featureWeights.seasonal * (seasonalMultiplier - 1) / 0.4 +
    featureWeights.accountAge * (1 - normalizedAge) + // newer = higher risk
    featureWeights.orderVolume * normalizedOrders;

  const mlPremium = Math.round(basePremium * (1 + riskScore * 1.5));

  // ── HYBRID BLEND ──────────────────────────────────────────
  // 60% ML + 40% Actuarial (GuidePay's formula)
  const rawFinal = 0.60 * mlPremium + 0.40 * actuarialPremium;
  const finalPremium = Math.max(Math.round(rawFinal), basePremium);

  // ── FEATURE IMPORTANCE BREAKDOWN ──────────────────────────
  const total = finalPremium - basePremium || 1;
  const featureBreakdown: FeatureBreakdown = {
    zoneRiskContribution: Math.round((featureWeights.zoneRisk * input.zoneRiskScore * basePremium) / total * 100),
    historicalClaimContribution: Math.round((featureWeights.historicalClaim * input.historicalClaimRate * basePremium) / total * 100),
    seasonalContribution: Math.round(((seasonalMultiplier - 1) * 0.4 * basePremium) / total * 100),
    accountAgeContribution: Math.round((featureWeights.accountAge * (1 - normalizedAge) * basePremium) / total * 100),
    orderVolumeContribution: Math.round((featureWeights.orderVolume * normalizedOrders * basePremium) / total * 100),
  };

  // ── CLAUDE BILINGUAL EXPLANATION ──────────────────────────
  const explanationPrompt = `
You are OffShift's pricing explainer. A gig delivery worker just got their insurance quote.
Explain it simply in BOTH English and Hindi. Be warm, honest, and use simple language a delivery rider understands.

Worker details:
- City: ${input.city}, Pincode: ${input.pincode}
- Average daily orders: ${input.avgDailyOrders} → ${tier.toUpperCase()} tier
- Payout if claim triggered: ₹${payoutAmount}
- Final premium: ₹${finalPremium} per ${input.planType}
- Zone risk score: ${(input.zoneRiskScore * 100).toFixed(0)}% (${input.zoneRiskScore > 0.6 ? 'high risk area' : input.zoneRiskScore > 0.3 ? 'medium risk area' : 'low risk area'})
- Seasonal factor: ${seasonalMultiplier}x (${seasonalMultiplier > 1 ? 'monsoon/winter premium' : 'normal season'})

Top 2 factors that affected the price:
1. Zone flood risk: ${featureBreakdown.zoneRiskContribution}% of premium adjustment
2. Your order history: ${featureBreakdown.historicalClaimContribution}% of premium adjustment

Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "english": "2-3 sentence explanation in plain English",
  "hindi": "2-3 sentence explanation in simple Hindi (Devanagari script)"
}
`;

  let englishExplanation = `Your ₹${finalPremium} premium covers ₹${payoutAmount} payout if triggered.`;
  let hindiExplanation = `आपका ₹${finalPremium} का प्रीमियम ₹${payoutAmount} का भुगतान कवर करता है।`;

  try {
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: explanationPrompt }],
    });
    const text = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : '';
    const parsed = JSON.parse(text.trim());
    englishExplanation = parsed.english;
    hindiExplanation = parsed.hindi;
  } catch {
    // fallback to defaults above
  }

  return {
    tier,
    payoutAmount,
    mlPremium,
    actuarialPremium,
    finalPremium,
    seasonalMultiplier,
    featureBreakdown,
    hindiExplanation,
    englishExplanation,
  };
}
