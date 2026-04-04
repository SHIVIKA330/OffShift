import { runFraudDetection } from "@/lib/claude";
import { executeMockPayout } from "@/lib/payout-mock";
import { createServiceRoleClient } from "@/lib/supabase-service";

export async function processClaimPipeline(claimId: string): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data: claim, error: cErr } = await supabase
    .from("claims")
    .select(
      `
      id,
      policy_id,
      worker_id,
      payout_amount,
      trigger_type,
      trigger_severity,
      trigger_timestamp,
      workers ( zone, shift_type, kavach_score ),
      policies ( created_at )
    `
    )
    .eq("id", claimId)
    .single();

  if (cErr || !claim) return;

  const workerAny = (claim as any).workers;
  const worker = Array.isArray(workerAny) ? workerAny[0] : workerAny;

  const policyAny = (claim as any).policies;
  const policy = Array.isArray(policyAny) ? policyAny[0] : policyAny;

  await supabase.from("claims").update({ status: "FRAUD_CHECK" }).eq("id", claimId);

  const policyAgeDays = Math.max(
    0,
    Math.floor(
      (Date.now() -
        new Date(policy?.created_at ? String(policy.created_at) : Date.now()).getTime()) /
        (86400 * 1000)
    )
  );

  const fraudPayload = {
    worker: {
      zone: String(worker?.zone ?? "okhla"),
      shift: String(worker?.shift_type ?? "evening"),
      kavach_score:
        typeof worker?.kavach_score === "number" ? worker.kavach_score : 50,
      policy_age_days: policyAgeDays,
    },
    trigger: {
      type: claim.trigger_type,
      severity: claim.trigger_severity,
      timestamp: claim.trigger_timestamp,
    },
    behavioral: {
      last_gps_ping_minutes_ago: 12 + Math.floor(Math.random() * 20),
      avg_daily_earnings_last_30_days: 800 + Math.floor(Math.random() * 400),
      num_claims_last_30_days: 0,
      zone_peers_affected_count: 14,
      policy_age_days: policyAgeDays,
    },
  };

  let assessment;
  try {
    assessment = await runFraudDetection(fraudPayload);
  } catch {
    assessment = {
      fraud_score: 40,
      risk_level: "MEDIUM" as const,
      red_flags: ["Fraud engine unavailable — manual review"],
      recommendation: "MANUAL_REVIEW" as const,
      reasoning: "Fallback.",
    };
  }

  await supabase
    .from("claims")
    .update({
      fraud_score: assessment.fraud_score,
      fraud_flags: assessment.red_flags,
      fraud_recommendation: assessment.recommendation,
      fraud_reasoning: assessment.reasoning,
    })
    .eq("id", claimId);

  if (assessment.fraud_score > 60) {
    await supabase
      .from("claims")
      .update({ status: "REJECTED" })
      .eq("id", claimId);
    return;
  }

  if (assessment.fraud_score >= 30 && assessment.fraud_score <= 60) {
    await supabase
      .from("claims")
      .update({ status: "MANUAL_REVIEW" })
      .eq("id", claimId);
    return;
  }

  await supabase.from("claims").update({ status: "APPROVED" }).eq("id", claimId);

  const payoutResult = await executeMockPayout(
    claimId,
    Number(claim.payout_amount)
  );

  if (payoutResult.success) {
    await supabase
      .from("claims")
      .update({
        status: "SETTLED",
        payout_txn_id: payoutResult.txnId,
        settled_at: new Date().toISOString(),
      })
      .eq("id", claimId);

    const { data: pol } = await supabase
      .from("policies")
      .select("payout_total")
      .eq("id", claim.policy_id)
      .single();

    const prev = Number(pol?.payout_total ?? 0);
    await supabase
      .from("policies")
      .update({ payout_total: prev + Number(claim.payout_amount) })
      .eq("id", claim.policy_id);
  }
}
