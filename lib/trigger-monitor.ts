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
