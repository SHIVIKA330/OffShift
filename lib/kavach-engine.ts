/**
 * OffShift — Kavach Risk Score & Pricing Engine
 * Expanded to support Storm, Flood, Curfew, Heat, and AQI triggers.
 */

import { type ZoneSlug, ZONE_COORDS } from "@/lib/zones";

// ─── Types ─────────────────────────────────────────────────────────────────

export type CoverageType = "24hr" | "7day";
export type ShiftType = "morning" | "evening" | "night" | "flexible";
export type Platform = 
  | "zomato" | "swiggy" | "zepto" | "blinkit" | "dunzo" | "bigbasket"
  | "ola" | "uber" | "rapido" | "namma_yatri"
  | "porter" | "delhivery" | "ecom_express" | "shadowfax"
  | "construction" | "plumber" | "electrician" | "painter" | "carpenter"
  | "urban_company" | "housejoy" | "maid" | "cook" | "driver"
  | "pharmeasy" | "1mg" | "practo"
  | "freelance" | "tutor" | "photographer" | "other";

export interface KavachEngineResult {
  base_premium: number;
  zone_multiplier: number;
  shift_multiplier: number;
  weather_surge: number;
  civic_surge: number;
  activity_adjustment: number;
  final_premium: number;
  kavach_score: number;
  max_payout: number;
  risk_breakdown: {
    rain: number;
    storm: number;
    flood: number;
    heat: number;
    curfew: number;
    aqi: number;
  };
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
  storm_level?: number;
  flood_active?: boolean;
  curfew_active?: boolean;
  heat_level?: number;
}

// ─── Core Kavach Score Calculator ───────────────────────────────────────────

/**
 * Calculate Kavach Score (1–100) from zone, shift, and activity.
 * Incorporates multi-risk indicators.
 */
export const calculateKavachScore = (
  zone: string,
  shift: string,
  days: number,
  additionalRisks?: { curfew: boolean; flood: boolean; aqi: number }
): number => {
  let score = 40; // Base score

  // Zone Risk (Top Tier hotspots)
  const zoneWeights: Record<string, number> = {
    okhla: 25,
    gurugram: 20,
    noida: 15,
    mumbai: 12,
    kolkata: 10,
    patna: 18,
    jaipur: 15,
  };
  score += zoneWeights[zone] || 5;

  // Shift Risk
  if (shift === "night") score += 15;
  if (shift === "evening") score += 6;
  if (shift === "morning") score -= 5;

  // Real-time environmental/social risk boosts
  if (additionalRisks?.curfew) score += 20;
  if (additionalRisks?.flood) score += 25;
  if (additionalRisks?.aqi && additionalRisks.aqi > 300) score += 12;

  // Activity Adjustment
  if (days >= 7) score -= 10; // Loyalty discount
  if (days < 3) score += 10; // Volatility penalty

  return Math.min(Math.max(score, 1), 100);
};

// ─── Price from Score ───────────────────────────────────────────────────────

export const getPriceFromScore = (
  score: number,
  type: "24hr" | "7day"
): number => {
  if (type === "24hr") {
    if (score <= 40) return 19;
    if (score <= 70) return 39;
    return 69;
  }
  if (score <= 40) return 89;
  if (score <= 70) return 129;
  return 199;
};

// ─── Risk Band ─────────────────────────────────────────────────────────────

export function riskBand(score: number): {
  label: "LOW" | "MEDIUM" | "HIGH";
  dayRef: number;
  weekRef: number;
  color: "green" | "yellow" | "orange";
} {
  if (score <= 40)
    return { label: "LOW", dayRef: 19, weekRef: 89, color: "green" };
  if (score <= 70)
    return { label: "MEDIUM", dayRef: 39, weekRef: 129, color: "yellow" };
  return { label: "HIGH", dayRef: 69, weekRef: 199, color: "orange" };
}

// ─── Backward-compatible Helper ───────────────────────────────────────────

export function computeKavachScore(input: {
  zone: ZoneSlug;
  shift_type: ShiftType;
  active_days: number;
  aqi_forecast_peak?: number;
  curfew?: boolean;
  flood?: boolean;
}): number {
  return calculateKavachScore(input.zone, input.shift_type, input.active_days, {
    curfew: !!input.curfew,
    flood: !!input.flood,
    aqi: input.aqi_forecast_peak ?? 150
  });
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

// ─── Weather Multipliers & Surge Engine ────────────────────────────────────

const ZONE_MULT: Record<string, number> = {
  okhla: 1.3,
  patna: 1.25,
  jaipur: 1.2,
  mumbai: 1.15,
  kolkata: 1.1,
  gurugram: 1.2,
};

const SHIFT_MULT: Record<string, number> = {
  night: 1.25,
  morning: 0.85,
  evening: 1.0,
  flexible: 1.0,
};

export function runKavachEngine(input: KavachEngineInput): KavachEngineResult {
  const base = input.coverage_type === "24hr" ? 39 : 129;
  const zm = ZONE_MULT[input.zone] ?? 1.0;
  const sm = SHIFT_MULT[input.shift_type] ?? 1.0;

  // Weather triggers
  let wSurge = 0;
  const rb = {
    rain: 0,
    storm: 0,
    flood: 0,
    heat: 0,
    curfew: 0,
    aqi: 0
  };

  if (input.openMeteo.maxHourlyRainNext48h > 30) {
    wSurge += 15;
    rb.rain = 15;
  }
  if (input.storm_level && input.storm_level > 50) {
    wSurge += 20;
    rb.storm = 20;
  }
  if (input.flood_active) {
    wSurge += 40;
    rb.flood = 40;
  }
  if (input.heat_level && input.heat_level > 42) {
    wSurge += 12;
    rb.heat = 12;
  }
  if (input.aqi_forecast_peak > 350) {
    wSurge += 10;
    rb.aqi = 10;
  }

  // Civic/Social triggers
  let cSurge = 0;
  if (input.curfew_active) {
    cSurge += 30;
    rb.curfew = 30;
  }

  // Activity adjustment
  let activityAdj = 0;
  if (input.active_days >= 7) activityAdj -= 10;
  if (input.active_days < 3) activityAdj += 15;

  let raw = base * zm * sm + wSurge + cSurge + activityAdj;
  raw = Math.max(29, raw); // Global minimum
  const finalPremium = Math.round(raw);

  const kavach_score = calculateKavachScore(input.zone, input.shift_type, input.active_days, {
    curfew: !!input.curfew_active,
    flood: !!input.flood_active,
    aqi: input.aqi_forecast_peak
  });

  return {
    base_premium: base,
    zone_multiplier: zm,
    shift_multiplier: sm,
    weather_surge: wSurge,
    civic_surge: cSurge,
    activity_adjustment: activityAdj,
    final_premium: finalPremium,
    kavach_score,
    max_payout: input.coverage_type === "24hr" ? 800 : 2500,
    risk_breakdown: rb
  };
}
