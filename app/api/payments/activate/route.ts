import { NextResponse } from "next/server";
import {
  fetchOpenMeteoRain,
  runKavachEngine,
  type CoverageType,
  type ShiftType,
} from "@/lib/kavach-engine";
import { getAQIForZone } from "@/lib/cpcb-feed";
import { createServiceRoleClient } from "@/lib/supabase-service";
import { normalizeZone } from "@/lib/zones";
import { checkEligibility, getZoneRiskPools, computeWorkerTier } from "@/lib/underwriting";

export async function POST(req: Request) {
  try {
    let body: {
      worker_id: string;
      plan_type: CoverageType;
      zone: string;
      shift_type: ShiftType;
      active_days: number;
      platform: "zomato" | "swiggy" | "zepto";
      razorpay_payment_id?: string;
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

    // ── Underwriting Gate (DEVTrails Spec) ──
    const underwriting = checkEligibility({
      platform: body.platform,
      activeDaysPerWeek: body.active_days,
      zone,
    });

    if (!underwriting.eligible) {
      return NextResponse.json({ error: underwriting.rejectionReason }, { status: 403 });
    }

    const pools = getZoneRiskPools(zone);
    const tier = computeWorkerTier(body.active_days);

    // Calculate premium with real AQI feed
    const aqi = await getAQIForZone(zone);
    const openMeteo = await fetchOpenMeteoRain(zone);
    const engine = runKavachEngine({
      zone,
      shift_type: body.shift_type,
      active_days: body.active_days,
      platform: body.platform as any,
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

    // Tier-adjusted max payout
    const base_max = body.plan_type === "24hr" ? 500 : 1500;
    const tier_max = Math.round(base_max * (tier === "BASIC" ? 0.4 : tier === "STANDARD" ? 0.7 : 1.0));

    const supabase = createServiceRoleClient();

    const { data: policy, error } = await supabase
      .from("policies")
      .insert({
        worker_id: body.worker_id,
        plan_type: body.plan_type,
        premium_amount: engine.final_premium,
        max_payout: tier_max,
        coverage_start: start.toISOString(),
        coverage_end: end.toISOString(),
        status: "ACTIVE",
        risk_pool: pools[0] || "GENERAL",
        next_premium_due_at: end.toISOString(),
        razorpay_payment_id: body.razorpay_payment_id,
      })
      .select("id, coverage_start, coverage_end, plan_type, max_payout, status, risk_pool")
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
      underwriting_tier: tier,
      warnings: underwriting.warnings,
    });
  } catch (err) {
    console.error("[activate] Unhandled error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
