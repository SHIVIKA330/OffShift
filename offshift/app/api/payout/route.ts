import { NextResponse } from "next/server";

import { executeMockPayout } from "@/lib/payout-mock";

/** Manual / cron helper — protect with CRON_SECRET */
export async function POST(req: Request) {
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

  const { createServiceRoleClient } = await import("@/lib/supabase-service");
  const supabase = createServiceRoleClient();
  const { data: claim } = await supabase
    .from("claims")
    .select("payout_amount")
    .eq("id", body.claim_id)
    .single();

  if (!claim) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }

  const result = await executeMockPayout(body.claim_id, Number(claim.payout_amount));
  return NextResponse.json(result);
}
