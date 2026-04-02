import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  let body: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    plan_type: "24hr" | "7day";
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !verifySignature(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature,
      secret
    )
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const start = new Date();
  const end = new Date(start);
  if (body.plan_type === "24hr") {
    end.setHours(end.getHours() + 24);
  } else {
    end.setDate(end.getDate() + 7);
  }

  const max_payout = body.plan_type === "24hr" ? 500 : 1500;

  const { data: worker } = await supabase
    .from("workers")
    .select("kavach_score")
    .eq("id", user.id)
    .single();

  const { data: policy, error } = await supabase
    .from("policies")
    .insert({
      worker_id: user.id,
      plan_type: body.plan_type,
      premium_amount: 0,
      max_payout,
      coverage_start: start.toISOString(),
      coverage_end: end.toISOString(),
      status: "ACTIVE",
      razorpay_order_id: body.razorpay_order_id,
      razorpay_payment_id: body.razorpay_payment_id,
      next_premium_due_at: end.toISOString(),
    })
    .select("id, coverage_start, coverage_end, plan_type, max_payout, status")
    .single();

  if (error || !policy) {
    return NextResponse.json({ error: error?.message ?? "Policy create failed" }, { status: 400 });
  }

  const premiumFromOrder = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/payments/create-order`,
    { method: "POST", body: JSON.stringify({}), headers: { cookie: "" } }
  );
  void premiumFromOrder;

  await supabase
    .from("policies")
    .update({
      premium_amount: body.plan_type === "24hr" ? 29 : 99,
    })
    .eq("id", policy.id);

  return NextResponse.json({
    policy,
    kavach_score: worker?.kavach_score ?? null,
  });
}
