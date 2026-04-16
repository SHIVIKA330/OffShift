import type { ZoneSlug } from "@/lib/zones";

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

/** 
 * Mock Environmental Risk (AQI & Heat)
 * Deterministic based on zone slug
 */
export function getMockEnvironmentalRisk(zone: ZoneSlug) {
  const h = hash(zone);
  
  // AQI Logic
  const isNorth = ["delhi", "gurugram", "noida", "ghaziabad", "patna", "kanpur", "lucknow"].some(c => zone.includes(c));
  const baseAqi = isNorth ? 280 : 80;
  const aqi = baseAqi + (h % 120);

  // Heatwave Logic
  const isDesert = ["jaipur", "jodhpur", "ahmedabad", "raipur", "nagpur"].some(c => zone.includes(c));
  const temp = isDesert ? 42 + (h % 6) : 32 + (h % 8);

  return {
    aqi,
    aqi_category: aqi > 300 ? "Very Poor" : aqi > 200 ? "Poor" : aqi > 100 ? "Moderate" : "Good",
    category: aqi > 300 ? "Very Poor" : aqi > 200 ? "Poor" : aqi > 100 ? "Moderate" : "Good",
    pm25: Math.round(aqi * 0.45),
    temperature_celsius: temp,
    is_heatwave: temp >= 45
  };
}

/**
 * Mock Weather Risk (Storms & Floods)
 * Based on coastal/himalayan geography
 */
export function getMockWeatherRisk(zone: ZoneSlug) {
  const h = hash(zone);
  
  const isCoastal = ["mumbai", "chennai", "visakhapatnam", "kochi", "bhubaneswar", "kolkata", "panaji"].some(c => zone.includes(c));
  const isHimalayan = ["shimla", "manali", "dharamshala", "dehradun", "srinagar", "leh"].some(c => zone.includes(c));
  
  const storm_level = isCoastal ? 60 + (h % 35) : isHimalayan ? 40 + (h % 20) : (h % 15);
  const flood_active = isCoastal && (h % 10 > 7); // 30% chance for coastal cities

  return {
    storm_level,
    flood_active,
    wind_speed_kmh: Math.round(storm_level * 1.2)
  };
}

/**
 * Mock Civic Risk (Curfews & Disruption)
 */
export function getMockCivicRisk(zone: ZoneSlug) {
  const h = hash(zone);
  
  const hotspots = ["srinagar", "imphal", "mumbai", "delhi_new"].some(c => zone.includes(c));
  const curfew_active = hotspots && (h % 10 > 8); // 10% chance in hotspots

  return {
    curfew_active,
    has_curfew: curfew_active, // backward compatibility
    reason: curfew_active ? "Admin Restriction / Section 144" : "Normal"
  };
}

/** Platform Downdetector Mock */
export function getMockDowndetector(platform: string): {
  platform: string;
  report_count: number;
  outage_hours_estimate: number;
  status: "operational" | "degraded" | "major_outage";
} {
  const h = hash(platform);
  const z = h % 1000;
  return {
    platform,
    report_count: z,
    outage_hours_estimate: z > 800 ? 2 : 0,
    status: z > 800 ? "major_outage" : z > 500 ? "degraded" : "operational",
  };
}

// Backward Compatibility Aliases
export const getMockAqiForZone = (z: ZoneSlug) => {
  const r = getMockEnvironmentalRisk(z);
  return { ...r, aqi_current: r.aqi, aqi_forecast_peak: r.aqi + 20 };
};
export const getMockHeat = (z: ZoneSlug) => getMockEnvironmentalRisk(z);
export const getMockCurfew = (z: ZoneSlug) => getMockCivicRisk(z);
