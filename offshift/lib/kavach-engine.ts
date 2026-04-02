import { type ZoneSlug, ZONE_COORDS } from "@/lib/zones";

export type CoverageType = "24hr" | "7day";

export type ShiftType = "morning" | "evening" | "night" | "flexible";

export type Platform = "zomato" | "swiggy";

const ZONE_MULT: Record<ZoneSlug, number> = {
  okhla: 1.3,
  gurugram: 1.2,
  noida: 1.1,
  lajpat_nagar: 1.0,
  rohini: 1.0,
  dwarka: 1.0,
};

const SHIFT_MULT: Record<ShiftType, number> = {
  night: 1.2,
  morning: 0.9,
  evening: 1.0,
  flexible: 1.0,
};

export interface OpenMeteoHourlySlice {
  /** Max hourly precipitation (mm) in next 48h */
  maxHourlyRainNext48h: number;
  /** Sum of hourly precip in next 48h (mm) — informational */
  sumRainNext48h: number;
}

export interface KavachEngineInput {
  zone: ZoneSlug;
  shift_type: ShiftType;
  active_days: number;
  platform: Platform;
  coverage_type: CoverageType;
  /** From mock AQI API — forecast peak for surge rule */
  aqi_forecast_peak: number;
  openMeteo: OpenMeteoHourlySlice;
}

export interface KavachEngineResult {
  base_premium: number;
  zone_multiplier: number;
  shift_multiplier: number;
  weather_surge: number;
  activity_adjustment: number;
  final_premium: number;
  kavach_score: number;
  max_payout: number;
}

function clampScore(n: number): number {
  return Math.min(100, Math.max(1, Math.round(n)));
}

/** Heuristic 1–100 score from zone, shift, activity, AQI — explainable tiers */
export function computeKavachScore(input: {
  zone: ZoneSlug;
  shift_type: ShiftType;
  active_days: number;
  aqi_forecast_peak: number;
}): number {
  const zoneRisk =
    { okhla: 38, gurugram: 32, noida: 28, lajpat_nagar: 22, rohini: 20, dwarka: 18 }[
      input.zone
    ] ?? 22;
  const shiftAdj =
    input.shift_type === "night"
      ? 18
      : input.shift_type === "morning"
        ? -4
        : input.shift_type === "evening"
          ? 6
          : 2;
  const daysAdj = (7 - input.active_days) * 2;
  const aqiAdj =
    input.aqi_forecast_peak > 300
      ? 22
      : input.aqi_forecast_peak > 200
        ? 12
        : input.aqi_forecast_peak > 150
          ? 6
          : 0;
  return clampScore(zoneRisk + shiftAdj + daysAdj + aqiAdj);
}

export function riskBand(score: number): {
  label: "LOW" | "MEDIUM" | "HIGH";
  dayRef: number;
  weekRef: number;
  color: "green" | "yellow" | "orange";
} {
  if (score <= 40)
    return { label: "LOW", dayRef: 19, weekRef: 79, color: "green" };
  if (score <= 70)
    return { label: "MEDIUM", dayRef: 29, weekRef: 99, color: "yellow" };
  return { label: "HIGH", dayRef: 49, weekRef: 149, color: "orange" };
}

export async function fetchOpenMeteoRain(
  zone: ZoneSlug
): Promise<OpenMeteoHourlySlice> {
  const { lat, lng } = ZONE_COORDS[zone];
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("hourly", "precipitation");
  url.searchParams.set("forecast_days", "3");
  url.searchParams.set("timezone", "Asia/Kolkata");

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) {
    return { maxHourlyRainNext48h: 0, sumRainNext48h: 0 };
  }
  const data = (await res.json()) as {
    hourly?: { precipitation?: number[]; time?: string[] };
  };
  const arr = data.hourly?.precipitation ?? [];
  const hours48 = Math.min(48, arr.length);
  let max = 0;
  let sum = 0;
  for (let i = 0; i < hours48; i++) {
    const v = arr[i] ?? 0;
    if (v > max) max = v;
    sum += v;
  }
  return { maxHourlyRainNext48h: max, sumRainNext48h: sum };
}

export function runKavachEngine(input: KavachEngineInput): KavachEngineResult {
  const base =
    input.coverage_type === "24hr" ? 29 : input.coverage_type === "7day" ? 99 : 29;
  const zm = ZONE_MULT[input.zone] ?? 1;
  const sm = SHIFT_MULT[input.shift_type] ?? 1;

  let weatherSurge = 0;
  if (input.openMeteo.maxHourlyRainNext48h > 30) weatherSurge += 10;
  if (input.aqi_forecast_peak > 200) weatherSurge += 8;

  let activityAdj = 0;
  if (input.active_days >= 7) activityAdj -= 5;
  if (input.active_days < 3) activityAdj += 10;

  let raw = base * zm * sm + weatherSurge + activityAdj;
  raw = Math.max(9, raw);
  const finalPremium = Math.round(raw);

  const kavach_score = computeKavachScore({
    zone: input.zone,
    shift_type: input.shift_type,
    active_days: input.active_days,
    aqi_forecast_peak: input.aqi_forecast_peak,
  });

  const max_payout = input.coverage_type === "24hr" ? 500 : 1500;

  return {
    base_premium: base,
    zone_multiplier: zm,
    shift_multiplier: sm,
    weather_surge: weatherSurge,
    activity_adjustment: activityAdj,
    final_premium: finalPremium,
    kavach_score,
    max_payout,
  };
}
