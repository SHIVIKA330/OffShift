import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-service";
import { executeSettlement } from "@/lib/settlement-engine";

export async function POST(req: Request) {
  try {
    const { worker_id, policy_id, trigger_type: reqTriggerType } = await req.json();
    const supabase = createServiceRoleClient();

    // 0. Get the worker's zone + settlement channel
    const { data: worker } = await supabase
      .from("workers")
      .select("zone, settlement_channel")
      .eq("id", worker_id)
      .single();

    const zone = worker?.zone || "unknown";

    // 0.5 Fetch policy max_payout
    const { data: policyParams } = await supabase
      .from("policies")
      .select("max_payout, payout_total")
      .eq("id", policy_id)
      .single();

    const maxPayout = policyParams?.max_payout || 500;
    const currentTotal = policyParams?.payout_total || 0;
    
    const trigger_type = reqTriggerType || "RAIN";
    let trigger_severity = "DEMO SIMULATION";
    let payoutAmount = Number(maxPayout);
    if (trigger_type === "RAIN") { payoutAmount = Math.round(Number(maxPayout) * 1); trigger_severity = "65mm/hr"; }
    else if (trigger_type === "AQI") { payoutAmount = Math.round(Number(maxPayout) * 0.5); trigger_severity = "AQI 350"; }
    else if (trigger_type === "HEAT") { payoutAmount = Math.round(Number(maxPayout) * 0.5); trigger_severity = "46°C"; }
    else if (trigger_type === "OUTAGE") { payoutAmount = 800; trigger_severity = "Major Outage"; }
    else if (trigger_type === "CURFEW") { payoutAmount = Number(maxPayout); trigger_severity = "Section 144"; }

    // 1. Create a triggered claim (status = TRIGGERED first, settlement engine will update)
    const { data: claim, error: claimErr } = await supabase
      .from("claims")
      .insert({
        worker_id,
        policy_id,
        zone,
        trigger_type,
        trigger_severity,
        payout_amount: payoutAmount,
        status: "TRIGGERED",
      })
      .select()
      .single();

    if (claimErr) throw claimErr;

    // 2. Execute settlement through the multi-channel engine
    const settlement = await executeSettlement(claim.id, payoutAmount);

    // 3. Update the policy total

    await supabase
      .from("policies")
      .update({ payout_total: currentTotal + payoutAmount })
      .eq("id", policy_id);

    return NextResponse.json({
      success: true,
      claim,
      settlement: {
        channel: settlement.channel,
        txnId: settlement.txnId,
        status: settlement.status,
      },
    });
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json({ error: "Trigger failed" }, { status: 500 });
  }
}
