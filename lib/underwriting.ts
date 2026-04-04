/**
 * OffShift — Underwriting Engine
 * Eligibility gates + Activity Tiers + City-based Risk Pools
 * 
 * Per DEVTrails spec:
 *  - Active gig worker on Zomato/Swiggy/Zepto
 *  - Minimum 7 active delivery days before cover starts (soft-gated)
 *  - Workers with <5 active days in 30 → lower tier
 *  - City-based pools: Delhi AQI pool ≠ Mumbai rain pool
 */

import { type ZoneSlug } from "@/lib/zones";

// ─── Activity Tiers ─────────────────────────────────────────────────────────

export type WorkerTier = "BASIC" | "STANDARD" | "PREMIUM";

export function computeWorkerTier(activeDaysPerWeek: number): WorkerTier {
  // Per spec: <5 active days (in 30) → lower tier
  // We proxy via active_days_per_week: <3 → BASIC, 3-6 → STANDARD, 7 → PREMIUM
  if (activeDaysPerWeek >= 7) return "PREMIUM";
  if (activeDaysPerWeek >= 4) return "STANDARD";
  return "BASIC";
}

/** Tier multiplier on max_payout — lower tier = lower coverage */
export function tierPayoutMultiplier(tier: WorkerTier): number {
  switch (tier) {
    case "PREMIUM": return 1.0;    // Full ₹500 / ₹1500
    case "STANDARD": return 0.7;   // ₹350 / ₹1050
    case "BASIC": return 0.4;      // ₹200 / ₹600
  }
}

/** Tier discount on premium — loyal riders pay less */
export function tierPremiumDiscount(tier: WorkerTier): number {
  switch (tier) {
    case "PREMIUM": return 0.85;   // 15% discount
    case "STANDARD": return 1.0;   // Base price
    case "BASIC": return 1.15;     // 15% surcharge (higher risk)
  }
}

// ─── City-based Risk Pools ──────────────────────────────────────────────────

export type RiskPool =
  | "DELHI_NCR_AQI"
  | "DELHI_NCR_RAIN"
  | "MUMBAI_RAIN"
  | "MUMBAI_HEAT"
  | "BENGALURU_RAIN"
  | "CHENNAI_RAIN"
  | "KOLKATA_RAIN"
  | "HYDERABAD_RAIN"
  | "NORTH_INDIA_AQI"
  | "WEST_INDIA_RAIN"
  | "SOUTH_INDIA_RAIN"
  | "GENERAL";

/** Map a zone to its primary risk pool(s) */
export function getZoneRiskPools(zone: ZoneSlug): RiskPool[] {
  const poolMap: Record<string, RiskPool[]> = {
    // Delhi NCR — AQI is primary peril (AQI > 300 frequent Nov-Feb)
    delhi_new: ["DELHI_NCR_AQI", "DELHI_NCR_RAIN"],
    okhla: ["DELHI_NCR_AQI", "DELHI_NCR_RAIN"],
    gurugram: ["DELHI_NCR_AQI", "DELHI_NCR_RAIN"],
    noida: ["DELHI_NCR_AQI", "DELHI_NCR_RAIN"],
    // Mumbai — Rain is primary peril (monsoon Jun-Sep)
    mumbai: ["MUMBAI_RAIN", "MUMBAI_HEAT"],
    pune: ["WEST_INDIA_RAIN"],
    nagpur: ["NORTH_INDIA_AQI"],
    // Karnataka
    bengaluru: ["BENGALURU_RAIN", "SOUTH_INDIA_RAIN"],
    mysuru: ["SOUTH_INDIA_RAIN"],
    mangalore: ["SOUTH_INDIA_RAIN"],
    // Tamil Nadu
    chennai: ["CHENNAI_RAIN", "SOUTH_INDIA_RAIN"],
    coimbatore: ["SOUTH_INDIA_RAIN"],
    madurai: ["SOUTH_INDIA_RAIN"],
    // West Bengal
    kolkata: ["KOLKATA_RAIN"],
    howrah: ["KOLKATA_RAIN"],
    // Telangana
    hyderabad: ["HYDERABAD_RAIN"],
    visakhapatnam: ["SOUTH_INDIA_RAIN"],
    // Gujarat
    ahmedabad: ["WEST_INDIA_RAIN"],
    surat: ["WEST_INDIA_RAIN"],
    vadodara: ["WEST_INDIA_RAIN"],
    // Rajasthan — Heat primary
    jaipur: ["NORTH_INDIA_AQI"],
    jodhpur: ["NORTH_INDIA_AQI"],
    // UP
    lucknow: ["NORTH_INDIA_AQI"],
    kanpur: ["NORTH_INDIA_AQI"],
    // Kerala
    kochi: ["SOUTH_INDIA_RAIN"],
    thiruvananthapuram: ["SOUTH_INDIA_RAIN"],
    // Punjab/Haryana
    chandigarh: ["NORTH_INDIA_AQI"],
    ludhiana: ["NORTH_INDIA_AQI"],
  };
  return poolMap[zone] ?? ["GENERAL"];
}

// ─── Underwriting Eligibility Check ─────────────────────────────────────────

export interface UnderwritingResult {
  eligible: boolean;
  tier: WorkerTier;
  riskPools: RiskPool[];
  warnings: string[];
  rejectionReason?: string;
}

export function checkEligibility(input: {
  platform: string;
  activeDaysPerWeek: number;
  zone: ZoneSlug;
}): UnderwritingResult {
  const warnings: string[] = [];
  const tier = computeWorkerTier(input.activeDaysPerWeek);
  const riskPools = getZoneRiskPools(input.zone);

  // Platform check
  const validPlatforms = ["zomato", "swiggy", "zepto"];
  if (!validPlatforms.includes(input.platform.toLowerCase())) {
    return {
      eligible: false,
      tier,
      riskPools,
      warnings,
      rejectionReason: "Platform not supported — only Zomato, Swiggy, Zepto",
    };
  }

  // Min 7 active days — SOFT gate per decision (warn but allow for demo)
  if (input.activeDaysPerWeek < 7) {
    warnings.push(
      `Recommended: 7+ active days/week for full coverage. You have ${input.activeDaysPerWeek} — assigned to ${tier} tier.`
    );
  }

  // Activity tier warning
  if (tier === "BASIC") {
    warnings.push(
      "BASIC tier: max payout is reduced to 40%. Increase active days for better coverage."
    );
  }

  return {
    eligible: true,
    tier,
    riskPools,
    warnings,
  };
}
