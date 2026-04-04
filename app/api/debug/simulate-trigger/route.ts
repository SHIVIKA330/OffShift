import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-service";
import { executeSettlement } from "@/lib/settlement-engine";

export async function POST(req: Request) {
  try {
    const { worker_id, policy_id } = await req.json();
    const supabase = createServiceRoleClient();

    // 0. Get the worker's zone + settlement channel
    const { data: worker } = await supabase
      .from("workers")
      .select("zone, settlement_channel")
      .eq("id", worker_id)
      .single();

    const zone = worker?.zone || "unknown";

    // 1. Create a triggered claim (status = TRIGGERED first, settlement engine will update)
    const payoutAmount = 500;
    const { data: claim, error: claimErr } = await supabase
      .from("claims")
      .insert({
        worker_id,
        policy_id,
        zone,
        trigger_type: "RAIN",
        trigger_severity: "HEAVY",
        payout_amount: payoutAmount,
        status: "TRIGGERED",
      })
      .select()
      .single();

    if (claimErr) throw claimErr;

    // 2. Execute settlement through the multi-channel engine
    const settlement = await executeSettlement(claim.id, payoutAmount);

    // 3. Update the policy total
    const { data: policy } = await supabase
      .from("policies")
      .select("payout_total")
      .eq("id", policy_id)
      .single();

    const currentTotal = policy?.payout_total || 0;
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
