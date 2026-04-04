import type { ZoneSlug } from "@/lib/zones";

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

export function getMockAqiForZone(zone: ZoneSlug): {
  zone: ZoneSlug;
  aqi_current: number;
  aqi_forecast_peak: number;
  pm25: number;
  category: string;
} {
  // Deterministic mock CPCB-style AQI (150–400 range)
  const isPolluted = ["delhi_new", "okhla", "gurugram", "noida"].includes(zone);
  const cur = isPolluted ? 320 + (hash(zone) % 80) : 120 + (hash(zone) % 150);
  
  return {
    zone,
    aqi_current: cur,
    aqi_forecast_peak: cur + 40,
    pm25: Math.round(cur * 0.45),
    category: cur > 300 ? "Very Poor" : cur > 200 ? "Poor" : "Moderate",
  };
}

export function getMockDowndetector(platform: "zomato" | "swiggy" | "zepto" | string): {
  platform: string;
  report_count: number;
  outage_hours_estimate: number;
  status: "operational" | "degraded" | "major_outage";
} {
  const z = platform === "zomato" ? 720 : 120;
  return {
    platform,
    report_count: z,
    outage_hours_estimate: z > 500 ? 2 : 0,
    status: z > 500 ? "major_outage" : "operational",
  };
}

export function getMockHeat(zone: ZoneSlug) {
  const isHot = ["jaipur", "jodhpur", "delhi_new", "okhla", "gurugram", "ahmedabad", "surat"].includes(zone);
  const temp = isHot ? 45 + (hash(zone) % 4) : 32 + (hash(zone) % 8);
  return {
    zone,
    temperature_celsius: temp,
    is_heatwave: temp >= 45,
  };
}

export function getMockCurfew(zone: ZoneSlug) {
  const hasStrike = zone === "mumbai" || zone === "howrah";
  return {
    zone,
    has_curfew: hasStrike,
    reason: hasStrike ? "Local Union Strike & Section 144" : "Normal",
  };
}
