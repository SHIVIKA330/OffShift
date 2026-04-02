import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import {
  fetchOpenMeteoRain,
  runKavachEngine,
  type CoverageType,
  type ShiftType,
} from "@/lib/kavach-engine";
import { getMockAqiForZone } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { normalizeZone, type ZoneSlug } from "@/lib/zones";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
  }

  let body: {
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

  const zone = normalizeZone(body.zone);
  if (!zone) {
    return NextResponse.json({ error: "Invalid zone" }, { status: 400 });
  }

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

  const amountPaise = Math.round(engine.final_premium * 100);
  const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });

  const order = await rzp.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: `off_${user.id.slice(0, 8)}_${Date.now()}`,
    notes: {
      user_id: user.id,
      plan_type: body.plan_type,
      zone: zone as ZoneSlug,
    },
  });

  return NextResponse.json({
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key_id: keyId,
    final_premium: engine.final_premium,
  });
}
