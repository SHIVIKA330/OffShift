import type { ZoneSlug } from "@/lib/zones";

/** Deterministic mock CPCB-style AQI + forecast (Delhi winters 300–400) */
export function getMockAqiForZone(zone: ZoneSlug): {
  zone: ZoneSlug;
  aqi_current: number;
  aqi_forecast_peak: number;
  pm25: number;
  category: string;
} {
  const seeds: Record<ZoneSlug, { cur: number; peak: number }> = {
    okhla: { cur: 340, peak: 380 },
    gurugram: { cur: 310, peak: 350 },
    noida: { cur: 290, peak: 320 },
    lajpat_nagar: { cur: 260, peak: 300 },
    rohini: { cur: 240, peak: 280 },
    dwarka: { cur: 220, peak: 260 },
  };
  const s = seeds[zone];
  return {
    zone,
    aqi_current: s.cur,
    aqi_forecast_peak: s.peak,
    pm25: Math.round(s.cur * 0.45),
    category: s.cur > 300 ? "Very Poor" : s.cur > 200 ? "Poor" : "Moderate",
  };
}

export function getMockDowndetector(platform: "zomato" | "swiggy"): {
  platform: string;
  report_count: number;
  outage_hours_estimate: number;
  status: "operational" | "degraded" | "major_outage";
} {
  const z = platform === "zomato" ? 720 : 410;
  return {
    platform,
    report_count: z,
    outage_hours_estimate: z > 500 ? 2 : 0,
    status: z > 500 ? "major_outage" : "operational",
  };
}
