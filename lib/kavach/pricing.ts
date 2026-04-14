import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Historical trigger frequency by zone (computed from IMD 2018–2024 data)
// Days per year with precipitation_sum > 50mm (Red Alert threshold)
const ZONE_TRIGGER_FREQUENCY: Record<string, number> = {
  '110020': 18, // Okhla — low elevation, moderate flood risk
  '122001': 12, // Gurgaon — drainage issues, higher monsoon risk
  '201301': 15, // Noida — Yamuna floodplain
  '110075': 10, // Dwarka — western Delhi, lower rainfall
  '110085': 14, // Rohini — north Delhi
  '110024': 16, // Lajpat Nagar — central Delhi
};

const SEASON_MULTIPLIERS: Record<string, number> = {
  monsoon: 1.8,  // Jun–Sep: highest risk
  summer:  0.7,  // Mar–May: heat alerts, low rain
  winter:  0.6,  // Nov–Feb: lowest risk
  spring:  0.9,  // Oct: post-monsoon
};

function getSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 9) return 'monsoon';
  if (month >= 3 && month <= 5) return 'summer';
  if (month >= 11 || month <= 2) return 'winter';
  return 'spring';
}

export interface KavachInput {
  rider_id: string; // Add rider_id so API can log properly
  pincode: string;
  platform: 'zomato' | 'swiggy' | 'both' | 'zepto';
  coverageType: 'weather' | 'outage' | 'combined' | '24hr' | '7day';
  daysUntilEvent: number;
  claimHistoryCount: number; // rider's past claims in last 12 months
}

export interface KavachOutput {
  basePremium: number;
  multiplier: number;
  finalPremium: number;
  season: string;
  expectedLossRatio: number;
  explanation: string; // Hindi + English via Claude
}

export async function kavachPricing(input: KavachInput): Promise<KavachOutput> {
  const season = getSeason();
  const triggerDays = ZONE_TRIGGER_FREQUENCY[input.pincode] ?? 13;
  const triggerProb = triggerDays / 365;

  // Base premium: expected payout × probability + 40% margin
  const basePayout = (input.coverageType === 'combined' || input.coverageType === '7day') ? 800 : 500;
  const basePremium = Math.round(basePayout * triggerProb * 1.4);

  // Multiplier factors
  let multiplier = SEASON_MULTIPLIERS[season] || 1.0;
  if (input.daysUntilEvent <= 2) multiplier *= 1.2;   // 48hr window urgency
  if (input.claimHistoryCount >= 3) multiplier *= 1.15; // frequent claimant
  if (input.platform === 'both') multiplier *= 0.95;    // multi-apping slight discount

  const finalPremium = Math.max(10, Math.round(basePremium * multiplier)); // ensure min premium
  const expectedLossRatio = parseFloat(((triggerProb * basePayout) / finalPremium).toFixed(2));

  // Claude bilingual explanation
  let explanation = "Zone risk factor + standard margin.";
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      system: 'You are OffShift\'s AI helping gig workers in Delhi NCR. Always reply in simple Hindi first, then English. Be warm, brief, under 3 lines.',
      messages: [{
        role: 'user',
        content: `Explain this insurance price simply for a Delhi delivery rider:
  Premium: ₹${finalPremium}, Coverage: ₹${basePayout}, Season: ${season}, Zone pincode: ${input.pincode}.
  Why is the price this amount? Keep it reassuring.`
      }]
    });
    if (response.content[0].type === 'text') {
      explanation = response.content[0].text;
    }
  } catch (err) {
    console.error("Anthropic API failed:", err);
  }

  return { 
    basePremium, 
    multiplier: parseFloat(multiplier.toFixed(3)), 
    finalPremium, 
    season, 
    expectedLossRatio, 
    explanation 
  };
}
