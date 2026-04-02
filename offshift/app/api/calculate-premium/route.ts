import { NextResponse } from "next/server";

import { generateHindiPremiumExplanation } from "@/lib/claude";
import {
  fetchOpenMeteoRain,
  runKavachEngine,
  type CoverageType,
  type Platform,
  type ShiftType,
} from "@/lib/kavach-engine";
import { getMockAqiForZone } from "@/lib/mock-data";
import { getRedis } from "@/lib/redis";
import { normalizeZone, type ZoneSlug } from "@/lib/zones";

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
    !["zomato", "swiggy"].includes(body.platform) ||
    !["24hr", "7day"].includes(body.coverage_type)
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

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

  const aqi = getMockAqiForZone(zone);
  const openMeteo = await fetchOpenMeteoRain(zone);

  const engine = runKavachEngine({
    zone,
    shift_type: body.shift_type,
    active_days: body.active_days,
    platform: body.platform,
    coverage_type: body.coverage_type,
    aqi_forecast_peak: aqi.aqi_forecast_peak,
    openMeteo,
  });

  let explanation_hindi: string;
  try {
    const zoneLabel = zone.replace(/_/g, " ");
    const shiftLabel: Record<ShiftType, string> = {
      morning: "सुबह 6–2",
      evening: "शाम 2–10",
      night: "रात 10–6",
      flexible: "फ्लेक्सिबल",
    };
    explanation_hindi = await generateHindiPremiumExplanation({
      zoneLabel,
      shiftLabel: shiftLabel[body.shift_type],
      kavachScore: engine.kavach_score,
      finalPremium: engine.final_premium,
      coverageLabel: body.coverage_type === "24hr" ? "24 घंटे" : "7 दिन",
    });
  } catch {
    explanation_hindi = `आपका Kavach Score ${engine.kavach_score} है। आपका प्रीमियम ₹${engine.final_premium} है।`;
  }

  const payload = {
    base_premium: engine.base_premium,
    zone_multiplier: engine.zone_multiplier,
    shift_multiplier: engine.shift_multiplier,
    weather_surge: engine.weather_surge,
    activity_adjustment: engine.activity_adjustment,
    final_premium: engine.final_premium,
    kavach_score: engine.kavach_score,
    max_payout: engine.max_payout,
    explanation_hindi,
    valid_for_seconds: 300,
  };

  if (redis) {
    await redis.set(cacheKey, JSON.stringify(payload), { ex: 300 });
  }

  return NextResponse.json(payload);
}
