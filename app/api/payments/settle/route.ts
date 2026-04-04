import { NextResponse } from "next/server";
import { executeSettlement } from "@/lib/settlement-engine";
import { createServiceRoleClient } from "@/lib/supabase-service";

/**
 * POST /api/payments/settle
 *
 * Initiates a settlement payout for an approved claim.
 * Uses the worker's preferred settlement channel (UPI / IMPS / RAZORPAY).
 *
 * Body: { claim_id: string }
 * Auth: CRON_SECRET bearer token (for cron/webhook triggers)
 */
export async function POST(req: Request) {
  // Auth check
  const key = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (key && auth !== `Bearer ${key}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { claim_id: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.claim_id) {
    return NextResponse.json({ error: "claim_id required" }, { status: 400 });
  }

  // Fetch claim details
  const supabase = createServiceRoleClient();
  const { data: claim, error: claimErr } = await supabase
    .from("claims")
    .select("id, payout_amount, status, worker_id")
    .eq("id", body.claim_id)
    .single();

  if (claimErr || !claim) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }

  // Don't re-settle already settled claims
  if (claim.status === "SETTLED") {
    return NextResponse.json({
      error: "Claim already settled",
      claim_id: claim.id,
    }, { status: 409 });
  }

  // Execute settlement through the engine
  const result = await executeSettlement(claim.id, Number(claim.payout_amount));

  return NextResponse.json({
    ...result,
    claim_id: claim.id,
    amount: claim.payout_amount,
  });
}
