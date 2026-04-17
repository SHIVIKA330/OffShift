import { NextResponse } from "next/server";

import { generateHindiPremiumExplanation } from "@/lib/claude";
import {
  calculateKavachScore,
  getPriceFromScore,
  fetchOpenMeteoRain,
  runKavachEngine,
  type CoverageType,
  type Platform,
  type ShiftType,
} from "@/lib/kavach-engine";
import { getAQIForZone } from "@/lib/cpcb-feed";
import { computeWorkerTier } from "@/lib/underwriting";
import { getRedis } from "@/lib/redis";
import { normalizeZone, ZONE_COORDS, type ZoneSlug } from "@/lib/zones";
import { getMockWeatherRisk, getMockCivicRisk, getMockEnvironmentalRisk } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

type Body = {
  zone: string;
  shift_type: ShiftType;
  active_days: number;
  platform: Platform;
  coverage_type: CoverageType;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const zone = normalizeZone(body.zone);
  if (!zone) {
    return NextResponse.json({ error: "Invalid zone" }, { status: 400 });
  }
  if (
    !["morning", "evening", "night", "flexible"].includes(body.shift_type) ||
    body.active_days < 1 ||
    body.active_days > 7 ||
    !["24hr", "7day"].includes(body.coverage_type) ||
    !body.platform
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // ── Redis cache check (5-min TTL) ──
  const cacheKey = `premium:v1:${zone}:${body.shift_type}:${body.coverage_type}:${body.active_days}:${body.platform}`;
  const redis = getRedis();
  if (redis) {
    const cached = await redis.get<string>(cacheKey);
    if (cached) {
      try {
        return NextResponse.json(JSON.parse(cached));
      } catch {
        /* continue */
      }
    }
  }

  // ── Smart Triggers (Mocked for now) ──
  const env = getMockEnvironmentalRisk(zone);
  const weather = getMockWeatherRisk(zone);
  const civic = getMockCivicRisk(zone);

  // ── Kavach Score (simplified scoring) ──
  const score = calculateKavachScore(zone, body.shift_type, body.active_days, {
    curfew: civic.curfew_active,
    flood: weather.flood_active,
    aqi: env.aqi
  });
  const premium = getPriceFromScore(score, body.coverage_type);

  // ── Full engine with real AQI feed ──
  const aqi = await getAQIForZone(zone);
  const openMeteo = await fetchOpenMeteoRain(zone);
  const engine = runKavachEngine({
    zone,
    shift_type: body.shift_type,
    active_days: body.active_days,
    platform: body.platform,
    coverage_type: body.coverage_type,
    aqi_forecast_peak: env.aqi,
    openMeteo,
    storm_level: weather.storm_level,
    flood_active: weather.flood_active,
    curfew_active: civic.curfew_active,
    heat_level: env.temperature_celsius
  });

  const tier = computeWorkerTier(body.active_days);

  // ── NVIDIA-powered Hindi explanation ──
  let explanation_hindi: string;
  try {
    const shiftLabel: Record<ShiftType, string> = {
      morning: "सुबह 6–2",
      evening: "शाम 2–10",
      night: "रात 10–6",
      flexible: "फ्लेक्सिबल",
    };
    const zoneLabel = (ZONE_COORDS[zone]?.label ?? zone).replace(/_/g, " ");

    explanation_hindi = await generateHindiPremiumExplanation({
      zoneLabel,
      shiftLabel: shiftLabel[body.shift_type],
      kavachScore: score,
      finalPremium: engine.final_premium,
      coverageLabel: body.coverage_type === "24hr" ? "24 घंटे" : "7 दिन",
    });
  } catch {
    explanation_hindi = `आपका Kavach Score ${score} है। आपका प्रीमियम ₹${engine.final_premium} है।`;
  }

  const payload = {
    kavach_score: score,
    premium,
    tier,
    base_premium: engine.base_premium,
    zone_multiplier: engine.zone_multiplier,
    shift_multiplier: engine.shift_multiplier,
    weather_surge: engine.weather_surge,
    activity_adjustment: engine.activity_adjustment,
    final_premium: engine.final_premium,
    max_payout: engine.max_payout,
    risk_breakdown: engine.risk_breakdown,
    is_locked_out: engine.is_locked_out,
    lock_out_reason: engine.lock_out_reason,
    explanation_hindi,
    valid_for_seconds: 300,
  };

  // ── Cache result with 5-min TTL ──
  if (redis) {
    await redis.set(cacheKey, JSON.stringify(payload), { ex: 300 });
  }

  return NextResponse.json(payload);
}
