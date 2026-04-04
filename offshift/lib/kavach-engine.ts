/**
 * OffShift — Kavach Risk Score & Pricing Engine
 * Simplified, explainable scoring for parametric insurance pricing
 */

import { type ZoneSlug, ZONE_COORDS } from "@/lib/zones";

// ─── Types ─────────────────────────────────────────────────────────────────

export type CoverageType = "24hr" | "7day";
export type ShiftType = "morning" | "evening" | "night" | "flexible";
export type Platform = "zomato" | "swiggy";

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

export interface OpenMeteoHourlySlice {
  maxHourlyRainNext48h: number;
  sumRainNext48h: number;
}

export interface KavachEngineInput {
  zone: ZoneSlug;
  shift_type: ShiftType;
  active_days: number;
  platform: Platform;
  coverage_type: CoverageType;
  aqi_forecast_peak: number;
  openMeteo: OpenMeteoHourlySlice;
}

// ─── Core Kavach Score Calculator ───────────────────────────────────────────

/**
 * Calculate Kavach Score (1–100) from zone, shift, and activity.
 * Higher score = higher risk = higher premium.
 */
export const calculateKavachScore = (
  zone: string,
  shift: string,
  days: number
): number => {
  let score = 40; // Base score

  // Zone Risk (based on real Delhi flood/AQI history)
  const zoneWeights: Record<string, number> = {
    okhla: 25,
    gurugram: 20,
    noida: 10,
    lajpat_nagar: 8,
    rohini: 5,
    dwarka: 3,
    // Also support display names
    Okhla: 25,
    Gurugram: 20,
    Noida: 10,
    "Lajpat Nagar": 8,
    Rohini: 5,
    Dwarka: 3,
  };
  score += zoneWeights[zone] || 5;

  // Shift Risk
  if (shift === "night" || shift === "Night 10pm-6am") score += 15;
  if (shift === "evening" || shift === "Evening 2pm-10pm") score += 6;
  if (shift === "morning" || shift === "Morning 6am-2pm") score -= 5;
  // flexible = no adjustment

  // Activity Adjustment
  if (days >= 7) score -= 10; // Loyal rider discount
  if (days < 3) score += 10; // Irregular = harder to validate

  return Math.min(Math.max(score, 1), 100);
};

// ─── Price from Score ───────────────────────────────────────────────────────

/**
 * Map Kavach Score to premium price (₹).
 * 1-40 = LOW, 41-70 = MEDIUM, 71-100 = HIGH
 */
export const getPriceFromScore = (
  score: number,
  type: "24hr" | "7day"
): number => {
  if (type === "24hr") {
    if (score <= 40) return 19;
    if (score <= 70) return 29;
    return 49;
  }
  // Weekly pricing
  if (score <= 40) return 79;
  if (score <= 70) return 99;
  return 149;
};

// ─── Risk Band (for UI badges) ──────────────────────────────────────────────

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

// ─── Backward-compatible aliases ────────────────────────────────────────────

/** Alias for calculateKavachScore — used by register route */
export function computeKavachScore(input: {
  zone: ZoneSlug;
  shift_type: ShiftType;
  active_days: number;
  aqi_forecast_peak?: number;
}): number {
  let score = calculateKavachScore(input.zone, input.shift_type, input.active_days);
  // AQI boost (if available)
  if (input.aqi_forecast_peak && input.aqi_forecast_peak > 300) score += 15;
  else if (input.aqi_forecast_peak && input.aqi_forecast_peak > 200) score += 8;
  return Math.min(Math.max(score, 1), 100);
}

// ─── Open-Meteo Weather Fetch ───────────────────────────────────────────────

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
    hourly?: { precipitation?: number[] };
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

// ─── Full Engine (with weather + multipliers) ───────────────────────────────

const ZONE_MULT: Record<string, number> = {
  okhla: 1.3,
  gurugram: 1.2,
  noida: 1.1,
  lajpat_nagar: 1.0,
  rohini: 1.0,
  dwarka: 1.0,
};

const SHIFT_MULT: Record<string, number> = {
  night: 1.2,
  morning: 0.9,
  evening: 1.0,
  flexible: 1.0,
};

export function runKavachEngine(input: KavachEngineInput): KavachEngineResult {
  const base = input.coverage_type === "24hr" ? 29 : 99;
  const zm = ZONE_MULT[input.zone] ?? 1;
  const sm = SHIFT_MULT[input.shift_type] ?? 1;

  // Weather surge
  let weatherSurge = 0;
  if (input.openMeteo.maxHourlyRainNext48h > 30) weatherSurge += 10;
  if (input.aqi_forecast_peak > 200) weatherSurge += 8;

  // Activity adjustment
  let activityAdj = 0;
  if (input.active_days >= 7) activityAdj -= 5;
  if (input.active_days < 3) activityAdj += 10;

  let raw = base * zm * sm + weatherSurge + activityAdj;
  raw = Math.max(9, raw);
  const finalPremium = Math.round(raw);

  const kavach_score = calculateKavachScore(
    input.zone,
    input.shift_type,
    input.active_days
  );

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
