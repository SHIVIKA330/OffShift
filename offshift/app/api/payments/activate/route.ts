import { NextResponse } from "next/server";

import {
  fetchOpenMeteoRain,
  runKavachEngine,
  type CoverageType,
  type ShiftType,
} from "@/lib/kavach-engine";
import { getMockAqiForZone } from "@/lib/mock-data";
import { createServiceRoleClient } from "@/lib/supabase-service";
import { normalizeZone } from "@/lib/zones";

export async function POST(req: Request) {
  let body: {
    worker_id: string;
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

  if (!body.worker_id) {
    return NextResponse.json({ error: "worker_id required" }, { status: 400 });
  }

  const zone = normalizeZone(body.zone);
  if (!zone) {
    return NextResponse.json({ error: "Invalid zone" }, { status: 400 });
  }

  // Calculate premium
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

  // Coverage window
  const start = new Date();
  const end = new Date(start);
  if (body.plan_type === "24hr") {
    end.setHours(end.getHours() + 24);
  } else {
    end.setDate(end.getDate() + 7);
  }

  const max_payout = body.plan_type === "24hr" ? 500 : 1500;

  const supabase = createServiceRoleClient();

  const { data: policy, error } = await supabase
    .from("policies")
    .insert({
      worker_id: body.worker_id,
      plan_type: body.plan_type,
      premium_amount: engine.final_premium,
      max_payout,
      coverage_start: start.toISOString(),
      coverage_end: end.toISOString(),
      status: "ACTIVE",
      next_premium_due_at: end.toISOString(),
    })
    .select("id, coverage_start, coverage_end, plan_type, max_payout, status")
    .single();

  if (error || !policy) {
    return NextResponse.json(
      { error: error?.message ?? "Policy creation failed" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    policy,
    premium_paid: engine.final_premium,
  });
}
