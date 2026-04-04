/**
 * OffShift — Actuarial Monitoring Engine
 * BCR, Loss Ratio, Stress Testing, Pool Health
 *
 * Per DEVTrails spec:
 *  - BCR (Burning Cost Rate) = total claims ÷ total premium collected
 *  - Target BCR: 0.55–0.70 → 65 paise per ₹1 goes to payouts
 *  - Loss Ratio > 85%: suspend new enrolments
 *  - Model at least one stress scenario — e.g. 14-day monsoon
 */

import { createServiceRoleClient } from "@/lib/supabase-service";
import { type RiskPool, getZoneRiskPools } from "@/lib/underwriting";
import { type ZoneSlug } from "@/lib/zones";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PoolHealth {
  pool: RiskPool | "ALL";
  totalPremiumCollected: number;
  totalClaimsPaid: number;
  bcr: number;                    // Burning Cost Rate (claims/premiums)
  lossRatio: number;              // Same as BCR in pure parametric
  activePolicies: number;
  totalClaims: number;
  avgPremium: number;
  avgPayout: number;
  status: "HEALTHY" | "WARNING" | "CRITICAL" | "SUSPENDED";
  enrollmentOpen: boolean;
}

export interface StressScenario {
  name: string;
  description: string;
  durationDays: number;
  affectedZones: ZoneSlug[];
  triggerType: string;
  estimatedTriggeredWorkers: number;
  estimatedTotalLiability: number;
  estimatedBCRUnderStress: number;
  survivalAssessment: "SURVIVES" | "AT_RISK" | "INSOLVENT";
}

export interface ActuarialReport {
  generatedAt: string;
  overallHealth: PoolHealth;
  poolHealth: PoolHealth[];
  stressTests: StressScenario[];
  assumptions: string[];
}

// ─── BCR Calculator ─────────────────────────────────────────────────────────

function computePoolStatus(bcr: number): { status: PoolHealth["status"]; enrollmentOpen: boolean } {
  if (bcr > 0.85) return { status: "SUSPENDED", enrollmentOpen: false };  // Per spec: >85% → suspend
  if (bcr > 0.70) return { status: "CRITICAL", enrollmentOpen: true };
  if (bcr > 0.55) return { status: "WARNING", enrollmentOpen: true };
  return { status: "HEALTHY", enrollmentOpen: true };
}

// ─── Trigger Probability Data (10-year historical averages) ─────────────────
// Simulated from IMD/CPCB historical data for pricing formula

export const TRIGGER_PROBABILITY: Record<string, {
  rain_weekly: number;    // Probability of rain trigger per week
  aqi_weekly: number;     // Probability of AQI trigger per week
  heat_weekly: number;    // Probability of heat trigger per week
  combined_weekly: number; // Combined trigger probability
}> = {
  // Delhi NCR — High AQI risk (Oct-Feb), moderate rain (Jul-Sep)
  delhi_new: { rain_weekly: 0.08, aqi_weekly: 0.18, heat_weekly: 0.06, combined_weekly: 0.28 },
  okhla:     { rain_weekly: 0.10, aqi_weekly: 0.22, heat_weekly: 0.06, combined_weekly: 0.32 },
  gurugram:  { rain_weekly: 0.09, aqi_weekly: 0.20, heat_weekly: 0.05, combined_weekly: 0.30 },
  noida:     { rain_weekly: 0.08, aqi_weekly: 0.16, heat_weekly: 0.05, combined_weekly: 0.25 },
  // Mumbai — High rain risk (Jun-Sep), low AQI
  mumbai:    { rain_weekly: 0.22, aqi_weekly: 0.03, heat_weekly: 0.04, combined_weekly: 0.26 },
  pune:      { rain_weekly: 0.15, aqi_weekly: 0.02, heat_weekly: 0.03, combined_weekly: 0.18 },
  nagpur:    { rain_weekly: 0.10, aqi_weekly: 0.08, heat_weekly: 0.10, combined_weekly: 0.24 },
  // Karnataka
  bengaluru: { rain_weekly: 0.18, aqi_weekly: 0.02, heat_weekly: 0.02, combined_weekly: 0.20 },
  mysuru:    { rain_weekly: 0.12, aqi_weekly: 0.01, heat_weekly: 0.02, combined_weekly: 0.14 },
  mangalore: { rain_weekly: 0.25, aqi_weekly: 0.01, heat_weekly: 0.01, combined_weekly: 0.26 },
  // Tamil Nadu
  chennai:   { rain_weekly: 0.15, aqi_weekly: 0.03, heat_weekly: 0.08, combined_weekly: 0.22 },
  coimbatore:{ rain_weekly: 0.10, aqi_weekly: 0.01, heat_weekly: 0.04, combined_weekly: 0.14 },
  madurai:   { rain_weekly: 0.08, aqi_weekly: 0.01, heat_weekly: 0.10, combined_weekly: 0.17 },
  // Others (lower risk = lower premiums)
  kolkata:   { rain_weekly: 0.18, aqi_weekly: 0.05, heat_weekly: 0.05, combined_weekly: 0.24 },
  howrah:    { rain_weekly: 0.18, aqi_weekly: 0.05, heat_weekly: 0.05, combined_weekly: 0.24 },
  hyderabad: { rain_weekly: 0.12, aqi_weekly: 0.03, heat_weekly: 0.06, combined_weekly: 0.18 },
  visakhapatnam: { rain_weekly: 0.14, aqi_weekly: 0.01, heat_weekly: 0.04, combined_weekly: 0.17 },
  ahmedabad: { rain_weekly: 0.10, aqi_weekly: 0.06, heat_weekly: 0.12, combined_weekly: 0.24 },
  surat:     { rain_weekly: 0.16, aqi_weekly: 0.03, heat_weekly: 0.06, combined_weekly: 0.22 },
  vadodara:  { rain_weekly: 0.12, aqi_weekly: 0.04, heat_weekly: 0.08, combined_weekly: 0.20 },
  jaipur:    { rain_weekly: 0.06, aqi_weekly: 0.10, heat_weekly: 0.15, combined_weekly: 0.26 },
  jodhpur:   { rain_weekly: 0.04, aqi_weekly: 0.08, heat_weekly: 0.18, combined_weekly: 0.26 },
  lucknow:   { rain_weekly: 0.10, aqi_weekly: 0.14, heat_weekly: 0.08, combined_weekly: 0.28 },
  kanpur:    { rain_weekly: 0.10, aqi_weekly: 0.12, heat_weekly: 0.08, combined_weekly: 0.26 },
  kochi:     { rain_weekly: 0.22, aqi_weekly: 0.01, heat_weekly: 0.02, combined_weekly: 0.24 },
  thiruvananthapuram: { rain_weekly: 0.20, aqi_weekly: 0.01, heat_weekly: 0.02, combined_weekly: 0.22 },
  chandigarh:{ rain_weekly: 0.08, aqi_weekly: 0.12, heat_weekly: 0.06, combined_weekly: 0.22 },
  ludhiana:  { rain_weekly: 0.08, aqi_weekly: 0.14, heat_weekly: 0.06, combined_weekly: 0.24 },
};

// Default for unknown zones
const DEFAULT_TRIGGER_PROB = { rain_weekly: 0.10, aqi_weekly: 0.05, heat_weekly: 0.05, combined_weekly: 0.18 };

export function getTriggerProbability(zone: string) {
  return TRIGGER_PROBABILITY[zone] ?? DEFAULT_TRIGGER_PROB;
}

// ─── Actuarial Report Generator ─────────────────────────────────────────────

export async function generateActuarialReport(): Promise<ActuarialReport> {
  const supabase = createServiceRoleClient();

  // Fetch all policies with premium data
  const { data: policies } = await supabase
    .from("policies")
    .select("id, worker_id, premium_amount, payout_total, status, plan_type, workers!inner(zone, active_days_per_week)")
    .order("created_at", { ascending: false });

  // Fetch all settled claims
  const { data: claims } = await supabase
    .from("claims")
    .select("id, payout_amount, status, zone, trigger_type")
    .in("status", ["SETTLED", "APPROVED", "PAYOUT_INITIATED"]);

  const allPolicies = policies ?? [];
  const allClaims = claims ?? [];

  // Overall metrics
  const totalPremium = allPolicies.reduce((s, p) => s + Number(p.premium_amount || 0), 0);
  const totalClaims = allClaims.reduce((s, c) => s + Number(c.payout_amount || 0), 0);
  const bcr = totalPremium > 0 ? totalClaims / totalPremium : 0;
  const activePols = allPolicies.filter(p => p.status === "ACTIVE").length;
  const { status, enrollmentOpen } = computePoolStatus(bcr);

  const overallHealth: PoolHealth = {
    pool: "ALL",
    totalPremiumCollected: Math.round(totalPremium),
    totalClaimsPaid: Math.round(totalClaims),
    bcr: Math.round(bcr * 1000) / 1000,
    lossRatio: Math.round(bcr * 100),
    activePolicies: activePols,
    totalClaims: allClaims.length,
    avgPremium: allPolicies.length > 0 ? Math.round(totalPremium / allPolicies.length) : 0,
    avgPayout: allClaims.length > 0 ? Math.round(totalClaims / allClaims.length) : 0,
    status,
    enrollmentOpen,
  };

  // Per-pool breakdown
  const poolMap = new Map<RiskPool, { premiums: number; claims: number; policyCount: number; claimCount: number }>();

  for (const pol of allPolicies) {
    const workerAny = (pol as Record<string, unknown>).workers;
    const w = Array.isArray(workerAny) ? workerAny[0] : workerAny;
    const zone = (w as Record<string, string>)?.zone;
    if (!zone) continue;
    const pools = getZoneRiskPools(zone as ZoneSlug);
    for (const pool of pools) {
      const entry = poolMap.get(pool) ?? { premiums: 0, claims: 0, policyCount: 0, claimCount: 0 };
      entry.premiums += Number(pol.premium_amount || 0);
      entry.policyCount++;
      poolMap.set(pool, entry);
    }
  }

  for (const claim of allClaims) {
    if (!claim.zone) continue;
    const pools = getZoneRiskPools(claim.zone as ZoneSlug);
    for (const pool of pools) {
      const entry = poolMap.get(pool) ?? { premiums: 0, claims: 0, policyCount: 0, claimCount: 0 };
      entry.claims += Number(claim.payout_amount || 0);
      entry.claimCount++;
      poolMap.set(pool, entry);
    }
  }

  const poolHealthList: PoolHealth[] = [];
  const poolEntries = Array.from(poolMap.entries());
  for (let i = 0; i < poolEntries.length; i++) {
    const [pool, data] = poolEntries[i];
    const poolBcr = data.premiums > 0 ? data.claims / data.premiums : 0;
    const { status: pStatus, enrollmentOpen: pEnroll } = computePoolStatus(poolBcr);
    poolHealthList.push({
      pool,
      totalPremiumCollected: Math.round(data.premiums),
      totalClaimsPaid: Math.round(data.claims),
      bcr: Math.round(poolBcr * 1000) / 1000,
      lossRatio: Math.round(poolBcr * 100),
      activePolicies: data.policyCount,
      totalClaims: data.claimCount,
      avgPremium: data.policyCount > 0 ? Math.round(data.premiums / data.policyCount) : 0,
      avgPayout: data.claimCount > 0 ? Math.round(data.claims / data.claimCount) : 0,
      status: pStatus,
      enrollmentOpen: pEnroll,
    });
  }

  // ─── Stress Tests ─────────────────────────────────────────────────────────

  const stressTests = runStressScenarios(activePols, totalPremium);

  return {
    generatedAt: new Date().toISOString(),
    overallHealth,
    poolHealth: poolHealthList.sort((a, b) => b.bcr - a.bcr),
    stressTests,
    assumptions: [
      "Trigger probability derived from 10-year IMD/CPCB historical averages (simulated)",
      "Average daily income loss estimated at ₹800-1200 per gig worker",
      "BCR target range: 0.55–0.70 (65 paise per ₹1 goes to payouts)",
      "Loss ratio >85% triggers automatic enrollment suspension for affected pool",
      "Weekly premium cycle matches gig payout rhythm",
      "Stress scenarios assume no reinsurance or stop-loss coverage",
    ],
  };
}

// ─── Stress Scenarios ───────────────────────────────────────────────────────

function runStressScenarios(activePolicies: number, totalPremium: number): StressScenario[] {
  const avgMaxPayout = 500; // ₹500 per claim average

  return [
    {
      name: "14-Day Mumbai Monsoon",
      description: "Continuous heavy rain (>50mm/hr) for 14 consecutive days in Mumbai metropolitan area. All active workers in Mumbai rain pool triggered daily.",
      durationDays: 14,
      affectedZones: ["mumbai", "pune"] as ZoneSlug[],
      triggerType: "RAIN",
      estimatedTriggeredWorkers: Math.max(10, Math.round(activePolicies * 0.15)),
      estimatedTotalLiability: Math.max(10, Math.round(activePolicies * 0.15)) * avgMaxPayout * 14,
      estimatedBCRUnderStress: totalPremium > 0
        ? (Math.max(10, Math.round(activePolicies * 0.15)) * avgMaxPayout * 14) / totalPremium
        : 3.5,
      survivalAssessment: "AT_RISK",
    },
    {
      name: "Delhi AQI Severe (30 days)",
      description: "Sustained AQI >400 across Delhi NCR for 30 days (typical Nov-Dec worst case). Daily triggers for all active Delhi workers.",
      durationDays: 30,
      affectedZones: ["delhi_new", "okhla", "gurugram", "noida"] as ZoneSlug[],
      triggerType: "AQI",
      estimatedTriggeredWorkers: Math.max(10, Math.round(activePolicies * 0.25)),
      estimatedTotalLiability: Math.max(10, Math.round(activePolicies * 0.25)) * avgMaxPayout * 30,
      estimatedBCRUnderStress: totalPremium > 0
        ? (Math.max(10, Math.round(activePolicies * 0.25)) * avgMaxPayout * 30) / totalPremium
        : 8.0,
      survivalAssessment: "INSOLVENT",
    },
    {
      name: "Pan-India Heatwave (7 days)",
      description: "Extreme heat (>46°C) across North India for 7 days — affects Jaipur, Jodhpur, Delhi, Ahmedabad pools.",
      durationDays: 7,
      affectedZones: ["jaipur", "jodhpur", "delhi_new", "ahmedabad"] as ZoneSlug[],
      triggerType: "HEAT",
      estimatedTriggeredWorkers: Math.max(5, Math.round(activePolicies * 0.10)),
      estimatedTotalLiability: Math.max(5, Math.round(activePolicies * 0.10)) * avgMaxPayout * 7,
      estimatedBCRUnderStress: totalPremium > 0
        ? (Math.max(5, Math.round(activePolicies * 0.10)) * avgMaxPayout * 7) / totalPremium
        : 1.2,
      survivalAssessment: "SURVIVES",
    },
  ];
}
