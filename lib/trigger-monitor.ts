import { type ZoneSlug, ZONE_COORDS } from "@/lib/zones";
import type { ShiftType } from "@/lib/kavach-engine";

/** Current hour 0–23 in Asia/Kolkata */
export function getISTHour(date = new Date()): number {
  const s = date.toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false });
  return parseInt(s, 10);
}

export function shiftMatchesCurrentIST(shift: ShiftType): boolean {
  if (shift === "flexible") return true;
  const h = getISTHour();
  if (shift === "morning") return h >= 6 && h < 14;
  if (shift === "evening") return h >= 14 && h < 22;
  if (shift === "night") return h >= 22 || h < 6;
  return true;
}

export async function fetchHourlyPrecipitationMm(
  zone: ZoneSlug
): Promise<{ currentHourMm: number; maxNext6hMm: number }> {
  const { lat, lng } = ZONE_COORDS[zone];
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("hourly", "precipitation");
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "Asia/Kolkata");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return { currentHourMm: 0, maxNext6hMm: 0 };
  const data = (await res.json()) as {
    hourly?: { precipitation?: number[] };
  };
  const arr = data.hourly?.precipitation ?? [];
  const currentHourMm = arr[0] ?? 0;
  let maxNext6hMm = 0;
  for (let i = 0; i < Math.min(6, arr.length); i++) {
    const v = arr[i] ?? 0;
    if (v > maxNext6hMm) maxNext6hMm = v;
  }
  return { currentHourMm, maxNext6hMm };
}

/** Tier payout fraction for rain (mm/hr) */
export function rainPayoutFraction(mmPerHr: number): number {
  if (mmPerHr < 20) return 0;
  if (mmPerHr < 35) return 0.3;
  if (mmPerHr < 50) return 0.6;
  return 1;
}

export async function fetchHourlyTemperatureC(zone: ZoneSlug): Promise<number> {
  const { lat, lng } = ZONE_COORDS[zone];
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("current", "temperature_2m");
  url.searchParams.set("timezone", "Asia/Kolkata");

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return 30;
    const data = (await res.json()) as {
      current?: { temperature_2m?: number };
    };
    return data.current?.temperature_2m ?? 30;
  } catch {
    return 30;
  }
}

export async function fetchCurrentAqi(zone: ZoneSlug): Promise<{
  aqi_current: number;
  aqi_forecast_peak: number;
}> {
  const { lat, lng } = ZONE_COORDS[zone];
  const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("current", "us_aqi");
  url.searchParams.set("hourly", "us_aqi");
  url.searchParams.set("timezone", "Asia/Kolkata");

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
        // Fallback to european_aqi if us_aqi is somehow removed
        url.searchParams.set("current", "european_aqi");
        url.searchParams.set("hourly", "european_aqi");
        const fallbackRes = await fetch(url.toString(), { cache: "no-store" });
        if (!fallbackRes.ok) return { aqi_current: 80, aqi_forecast_peak: 80 };
        const fbData = (await fallbackRes.json()) as any;
        const eaqi = fbData.current?.european_aqi ?? 20;
        // Approximation mapping for demo: european_aqi 100 ~= us_aqi 300+
        const approxAqi = Math.round(eaqi * 3.5);
        return { aqi_current: approxAqi, aqi_forecast_peak: approxAqi + 20 };
    }
    const data = (await res.json()) as {
      current?: { us_aqi?: number };
      hourly?: { us_aqi?: number[] };
    };

    const aqi_current = data.current?.us_aqi ?? 50;
    let aqi_forecast_peak = aqi_current;
    const arr = data.hourly?.us_aqi ?? [];
    for (let i = 0; i < Math.min(12, arr.length); i++) {
      const v = arr[i] ?? 0;
      if (v > aqi_forecast_peak) aqi_forecast_peak = v;
    }
    return { aqi_current, aqi_forecast_peak };
  } catch {
    return { aqi_current: 50, aqi_forecast_peak: 50 };
  }
}

export async function fetchHourlyWindSpeed(zone: ZoneSlug): Promise<number> {
  const { lat, lng } = ZONE_COORDS[zone];
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("current", "wind_speed_10m");
  url.searchParams.set("timezone", "Asia/Kolkata");

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return 0;
    const data = (await res.json()) as {
      current?: { wind_speed_10m?: number };
    };
    return data.current?.wind_speed_10m ?? 0;
  } catch {
    return 0;
  }
}

export async function fetchAccumulatedRainMm(
  zone: ZoneSlug,
  hours = 72
): Promise<number> {
  const { lat, lng } = ZONE_COORDS[zone];
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("hourly", "precipitation");
  url.searchParams.set("past_days", "3");
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "Asia/Kolkata");

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return 0;
    const data = (await res.json()) as {
      hourly?: { precipitation?: number[] };
    };
    const arr = data.hourly?.precipitation ?? [];
    // Last X hours of data
    const sliceSize = Math.min(hours, arr.length);
    const sum = arr.slice(-sliceSize).reduce((acc, v) => acc + (v ?? 0), 0);
    return Math.round(sum);
  } catch {
    return 0;
  }
}
