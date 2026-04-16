import { createServiceRoleClient } from "@/lib/supabase-service";
import { executeSettlement } from "@/lib/settlement-engine";
import { runEnhancedFraudValidation } from "@/lib/fraud/validator";
import { validateWorkerPresence } from "@/lib/mobility-engine";
import { resolveConcurrentTriggers, enforceDailyCap } from "@/lib/trigger-consolidator";
import { type ZoneSlug } from "@/lib/zones";

export async function processClaimPipeline(claimId: string): Promise<void> {
  const supabase = createServiceRoleClient();

  // 1. Fetch Claim and associated Policy/Worker data
  const { data: claim, error: cErr } = await supabase
    .from("claims")
    .select(`
      id, policy_id, worker_id, payout_amount, trigger_type, trigger_severity, trigger_timestamp,
      workers ( zone, shift_type, kavach_score ),
      policies ( created_at, payout_total )
    `)
    .eq("id", claimId)
    .single();

  if (cErr || !claim) return;

  const worker: any = Array.isArray(claim.workers) ? claim.workers[0] : claim.workers;
  const policy: any = Array.isArray(claim.policies) ? claim.policies[0] : claim.policies;
  const zone = worker?.zone as ZoneSlug;

  // 2. FETCH REAL TELEMETRY (Last 10 GPS pings)
  const { data: pings } = await supabase
    .from("rider_gps_pings")
    .select("lat, lon, pinged_at")
    .eq("rider_id", claim.worker_id)
    .order("pinged_at", { ascending: false })
    .limit(10);

  // 3. MOBILITY VALIDATION
  const mobility = await validateWorkerPresence(
    String(claim.worker_id),
    zone,
    new Date(claim.trigger_timestamp)
  );

  // 4. CONCURRENT DISRUPTION CONSOLIDATION
  // Mocking concurrent check: In production, query a 'global_events' table for other triggers in same zone/time
  const activeTriggers = [
    { type: claim.trigger_type as any, multiplier: 1.0 }
  ];
  // If mobility confidence is low, we reduce the payout multiplier
  if (!mobility.is_present) activeTriggers[0].multiplier *= 0.5;

  const consolidated = resolveConcurrentTriggers(activeTriggers);

  // 5. ENHANCED FRAUD VALIDATION
  const policyAgeDays = Math.floor(
    (Date.now() - new Date(policy?.created_at).getTime()) / (86400 * 1000)
  );

  const { data: history } = await supabase
    .from("claims")
    .select("id, trigger_timestamp, trigger_type, payout_amount")
    .eq("worker_id", claim.worker_id)
    .eq("status", "SETTLED")
    .limit(5);

  const fraud = await runEnhancedFraudValidation(
    String(claim.worker_id),
    zone,
    (pings || []).map(p => ({ lat: p.lat, lon: p.lon, pinged_at: p.pinged_at })),
    (history || []).map(h => ({ 
      claim_id: h.id, 
      date: h.trigger_timestamp, 
      disruption_type: h.trigger_type, 
      zone, 
      amount: Number(h.payout_amount) 
    })),
    policyAgeDays
  );

  // Update claim with tracking info
  await supabase
    .from("claims")
    .update({
      fraud_score: fraud.fraud_score,
      fraud_flags: fraud.failed_layers,
      fraud_recommendation: fraud.decision,
      fraud_reasoning: `${fraud.ai_reason} | Mobility Confidence: ${(mobility.confidence * 100).toFixed(0)}%`,
    })
    .eq("id", claimId);

  // 6. DECISION ENGINE
  if (fraud.decision === "BLOCK" || !mobility.is_present && mobility.confidence < 0.2) {
    await supabase.from("claims").update({ status: "REJECTED" }).eq("id", claimId);
    return;
  }

  if (fraud.decision === "FLAG_REVIEW" || mobility.teleportation_detected) {
    await supabase.from("claims").update({ status: "MANUAL_REVIEW" }).eq("id", claimId);
    return;
  }

  // 7. PAYOUT CALCULATION & DAILY CAP
  const maxWeeklyTier = 2500; // Assuming Premium Tier for demo
  const dailyCap = maxWeeklyTier / 3; // Rule of thumb
  const rawPayout = Number(claim.payout_amount) * consolidated.payout_multiplier;
  
  const finalPayout = enforceDailyCap(
    Number(policy.payout_total || 0),
    rawPayout,
    dailyCap
  );

  await supabase.from("claims").update({ 
    status: "APPROVED",
    payout_amount: finalPayout
  }).eq("id", claimId);

  // 8. SETTLEMENT
  const payoutResult = await executeSettlement(claimId, finalPayout);

  if (payoutResult.status === "COMPLETED") {
    await supabase
      .from("claims")
      .update({
        status: "SETTLED",
        payout_txn_id: payoutResult.txnId,
        settled_at: new Date().toISOString(),
      })
      .eq("id", claimId);

    const prevTotal = Number(policy.payout_total ?? 0);
    await supabase
      .from("policies")
      .update({ payout_total: prevTotal + finalPayout })
      .eq("id", claim.policy_id);
  }
}
