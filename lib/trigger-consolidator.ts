import { type TriggerType } from "./trigger-oracle";

export interface ConsolidatedTrigger {
  primary_trigger: TriggerType;
  secondary_triggers: TriggerType[];
  payout_multiplier: number;
  reasoning: string;
}

/**
 * Priority ranking for overlapping disruptions.
 * More severe/preventative disruptions rank higher.
 */
const TRIGGER_PRIORITY: Record<TriggerType, number> = {
  curfew: 100,
  flood_rain: 90,
  platform_outage: 80,
  air_quality: 70,
  festival: 50
};

/**
 * Resolves multiple simultaneous triggers into a single consolidated payout decision.
 * Prevents "double-dipping" while ensuring fair coverage.
 */
export function resolveConcurrentTriggers(
  activeTriggers: { type: TriggerType; multiplier: number }[]
): ConsolidatedTrigger {
  if (activeTriggers.length === 0) {
    throw new Error("No triggers to resolve");
  }

  // Sort by priority first, then by multiplier intensity
  const sorted = [...activeTriggers].sort((a, b) => {
    const pA = TRIGGER_PRIORITY[a.type] ?? 0;
    const pB = TRIGGER_PRIORITY[b.type] ?? 0;
    if (pA !== pB) return pB - pA;
    return b.multiplier - a.multiplier;
  });

  const primary = sorted[0];
  const secondaries = sorted.slice(1);

  // Business Logic: We cap the total payout at 1.0 (100% of tier) 
  // but we can add small "complexity bonuses" (e.g., +10% if there is an AQI issue during a flood)
  let finalMultiplier = primary.multiplier;
  if (secondaries.length > 0) {
    // Add 10% bonus for each secondary trigger, capped at 1.15x total
    finalMultiplier = Math.min(1.15, finalMultiplier + (secondaries.length * 0.1));
  }

  return {
    primary_trigger: primary.type,
    secondary_triggers: secondaries.map(t => t.type),
    payout_multiplier: finalMultiplier,
    reasoning: `Primary disruption: ${primary.type}. ${secondaries.length > 0 ? `Secondary impacts: ${secondaries.map(s => s.type).join(", ")}.` : "No concurrent issues."} Payout consolidated to ${Math.round(finalMultiplier * 100)}% of tier.`
  };
}

/**
 * Global Check: Ensure total daily benefit remains within insurance caps.
 */
export function enforceDailyCap(
  currentPayoutTotal: number, 
  newAmount: number, 
  maxDailyTierAmount: number
): number {
  const remaining = Math.max(0, maxDailyTierAmount - currentPayoutTotal);
  return Math.min(newAmount, remaining);
}
