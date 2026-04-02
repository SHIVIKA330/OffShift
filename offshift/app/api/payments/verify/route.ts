import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

import {
  fetchOpenMeteoRain,
  runKavachEngine,
  type CoverageType,
  type ShiftType,
} from "@/lib/kavach-engine";
import { getMockAqiForZone } from "@/lib/mock-data";
import { fetchOrderRazorpay } from "@/lib/razorpay-rest";
import { createClient } from "@/lib/supabase/server";
import { normalizeZone, type ZoneSlug } from "@/lib/zones";

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

  const keyId = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  let body: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    plan_type: CoverageType;
    zone: string;
    shift_type: ShiftType;
    active_days: number;
    platform: "zomato" | "swiggy";
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

  const zone = normalizeZone(body.zone);
  if (!zone) {
    return NextResponse.json({ error: "Invalid zone" }, { status: 400 });
  }

  const order = await fetchOrderRazorpay(body.razorpay_order_id);
  const paidPaise = Number(order.amount);

  const aqi = getMockAqiForZone(zone);
  const openMeteo = await fetchOpenMeteoRain(zone);
  const engine = runKavachEngine({
    zone,
    shift_type: body.shift_type,
    active_days: body.active_days,
    platform: body.platform,
    coverage_type: body.plan_type,
    aqi_forecast_peak: aqi.aqi_forecast_peak,
    openMeteo,
  });

  const expectedPaise = Math.round(engine.final_premium * 100);
  if (Math.abs(paidPaise - expectedPaise) > 1) {
    return NextResponse.json(
      { error: "Amount mismatch — refresh pricing and try again" },
      { status: 400 }
    );
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
      premium_amount: engine.final_premium,
      max_payout,
      coverage_start: start.toISOString(),
      coverage_end: end.toISOString(),
      status: "ACTIVE",
      razorpay_order_id: body.razorpay_order_id,
      razorpay_payment_id: body.razorpay_payment_id,
      next_premium_due_at: end.toISOString(),
    })
    .select(
      "id, coverage_start, coverage_end, plan_type, max_payout, status, trigger_weather, trigger_outage"
    )
    .single();

  if (error || !policy) {
    return NextResponse.json({ error: error?.message ?? "Policy create failed" }, { status: 400 });
  }

  return NextResponse.json({
    policy,
    kavach_score: worker?.kavach_score ?? null,
    zone: zone as ZoneSlug,
  });
}
