import { createServiceRoleClient } from "../supabase-service";
import { runFraudDetection } from "../claude";

interface GpsPing {
  lat: number; lon: number; pinged_at: string;
}

interface ClaimEvent {
  claim_id: string;
  date: string;
  disruption_type: string;
  zone: string;
  amount: number;
}

export interface FraudResult {
  fraud_score: number;
  decision: 'AUTO_APPROVE' | 'FLAG_REVIEW' | 'BLOCK';
  failed_layers: string[];
  ai_reason: string;
}

/**
 * Advanced Fraud Validation Engine (Offline/Async)
 * Analyzes behavioral signals and calculates a weighted risk score.
 */
export async function runEnhancedFraudValidation(
  workerId: string,
  claimZone: string,
  recentPings: GpsPing[],
  claimHistory: ClaimEvent[],
  policyAgeDays: number = 30
): Promise<FraudResult> {
  let fraud_score = 0;
  const failed_layers: string[] = [];
  const supabase = createServiceRoleClient();

  // ─── TRUST FACTOR: Account Maturity ───────────────────────
  // A brand new account (<3 days) claiming is higher risk.
  // An established account (>30 days) gets a "Trust Buffer".
  if (policyAgeDays < 3) {
    fraud_score += 20;
    failed_layers.push("Trust: Policy is extremely new (<3 days old)");
  } else if (policyAgeDays > 60) {
    fraud_score -= 15; // Reward for long-term consistency
  }

  // ─── LAYER 1: Dynamic Quorum ────────────────────────────────
  // Check if peers in the same zone cluster are seeing disruptions.
  const windowStart = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("rider_gps_pings")
    .select("*", { count: "exact", head: true })
    .eq("zone_cluster", claimZone)
    .eq("is_active", false)
    .gte("pinged_at", windowStart);

  if ((count ?? 0) < 30) {
    fraud_score += 35;
    failed_layers.push(`Quorum: Only ${count} inactive peers found (Threshold: 30)`);
  }

  // ─── LAYER 2: Session Continuity & Velocity ─────────────────
  if (recentPings.length >= 2) {
    // Velocity check (already in mobility but reinforcing here)
    for (let i = 1; i < recentPings.length; i++) {
      const prev = recentPings[i - 1];
      const curr = recentPings[i];
      const dt_min = (new Date(curr.pinged_at).getTime() - new Date(prev.pinged_at).getTime()) / 1000 / 60;
      const dist = calculateKm(prev.lat, prev.lon, curr.lat, curr.lon);
      
      if (dt_min > 0 && (dist / dt_min) > 0.83) { // > 50km/h
        fraud_score += 40;
        failed_layers.push(`Continuity: Impossible movement detected (${(dist/dt_min*60).toFixed(0)} km/h)`);
        break;
      }
    }
  }

  // ─── LAYER 4: AI Contextual Anomaly (via NVIDIA NIM) ──────────
  const aiPayload = {
    worker_id: workerId,
    claim_zone: claimZone,
    policy_age: policyAgeDays,
    pings: recentPings,
    history: claimHistory,
    failed_behavioral: failed_layers
  };

  try {
    const assessment = await runFraudDetection(aiPayload);
    // Combine AI score (0-100) with behavioral score
    // We treat the AI's score as the "opinion weight"
    fraud_score = (fraud_score * 0.6) + (assessment.fraud_score * 0.4);
    if (assessment.recommendation === "REJECT") {
      fraud_score = Math.max(fraud_score, 85);
      failed_layers.push(`AI: ${assessment.reasoning}`);
    }
  } catch {
    fraud_score += 10; // Penalty for logic unavailability
  }

  // ─── Final Decision ──────────────────────────────────────────
  fraud_score = Math.min(100, Math.max(0, fraud_score));
  let decision: FraudResult['decision'] = 'AUTO_APPROVE';
  if (fraud_score > 70) decision = 'BLOCK';
  else if (fraud_score > 35) decision = 'FLAG_REVIEW';

  return {
    fraud_score,
    decision,
    failed_layers,
    ai_reason: failed_layers.join(" | ")
  };
}

/** Backward compatibility for legacy routes */
export const runFraudValidation = runEnhancedFraudValidation;

function calculateKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dlat = lat2 - lat1;
  const dlon = lon2 - lon1;
  return Math.sqrt(dlat * dlat + dlon * dlon) * 111;
}
