import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-service";

export async function POST(req: Request) {
  try {
    const { worker_id, policy_id } = await req.json();
    const supabase = createServiceRoleClient();

    // 0. Get the worker's zone first (required by DB)
    const { data: worker } = await supabase
      .from("workers")
      .select("zone")
      .eq("id", worker_id)
      .single();

    const zone = worker?.zone || "unknown";

    // 1. Create a mock claim
    const { data: claim, error: claimErr } = await supabase
      .from("claims")
      .insert({
        worker_id,
        policy_id,
        zone, // Fixed: Added missing zone
        trigger_type: "RAIN",
        payout_amount: 500,
        status: "SETTLED",
        payout_txn_id: `demo_${Math.random().toString(36).slice(2, 10).toUpperCase()}`
      })
      .select()
      .single();

    if (claimErr) throw claimErr;

    // 2. Update the policy total
    const { data: policy } = await supabase
      .from("policies")
      .select("payout_total")
      .eq("id", policy_id)
      .single();

    const currentTotal = policy?.payout_total || 0;

    await supabase
      .from("policies")
      .update({ payout_total: currentTotal + 500 })
      .eq("id", policy_id);

    return NextResponse.json({ success: true, claim });
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json({ error: "Trigger failed" }, { status: 500 });
  }
}
