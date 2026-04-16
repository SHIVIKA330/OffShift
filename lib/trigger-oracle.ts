// OffShift Trigger Oracle — 5 parametric triggers

export type TriggerType = 'flood_rain' | 'platform_outage' | 'curfew' | 'air_quality' | 'festival' | 'storm' | 'flood';

export interface TriggerEvent {
  type: TriggerType;
  severity: 'low' | 'medium' | 'high' | 'extreme';
  payoutMultiplier: number;   // % of tier payout
  pincode: string;
  city: string;
  triggeredAt: Date;
  dataSource: string;
  confidence: number;         // 0-1
  isPredictive: boolean;      // true = pre-trigger (50% advance payout)
  rawData: Record<string, unknown>;
}

// ── TRIGGER 1: FLOOD / HEAVY RAIN ─────────────────────────
export async function checkRainTrigger(lat: number, lng: number): Promise<TriggerEvent | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=precipitation&forecast_days=1&timezone=Asia/Kolkata`;
    const res = await fetch(url);
    const data = await res.json();
    const maxHourlyRain = Math.max(...(data.hourly?.precipitation || [0]));
    
    if (maxHourlyRain >= 15) { // IMD "Heavy Rain" threshold
      return {
        type: 'flood_rain',
        severity: maxHourlyRain >= 64.4 ? 'extreme' : maxHourlyRain >= 35 ? 'high' : 'medium',
        payoutMultiplier: 1.0,
        pincode: '110001', // resolve from lat/lng in production
        city: 'Delhi',
        triggeredAt: new Date(),
        dataSource: 'open-meteo',
        confidence: 0.9,
        isPredictive: false,
        rawData: { maxHourlyRainMm: maxHourlyRain },
      };
    }
    // Predictive pre-trigger: 48-hour forecast
    const url48 = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum&forecast_days=3&timezone=Asia/Kolkata`;
    const res48 = await fetch(url48);
    const data48 = await res48.json();
    const day2Rain = data48.daily?.precipitation_sum?.[1] || 0;
    
    if (day2Rain >= 25) { // Predicted heavy rain
      return {
        type: 'flood_rain',
        severity: 'high',
        payoutMultiplier: 0.5, // 50% advance payout
        pincode: '110001',
        city: 'Delhi',
        triggeredAt: new Date(),
        dataSource: 'open-meteo-forecast',
        confidence: 0.75,
        isPredictive: true,
        rawData: { forecastRainMm: day2Rain, forecastDate: data48.daily?.time?.[1] },
      };
    }
    return null;
  } catch { return null; }
}

// ── TRIGGER 2: PLATFORM OUTAGE ────────────────────────────
export async function checkOutageTrigger(): Promise<TriggerEvent | null> {
  // Check Downdetector API or internal monitoring
  // In production: scrape Downdetector for Zomato/Swiggy + check your own pings
  // For demo: simulate based on a configurable flag
  const OUTAGE_THRESHOLD_MINUTES = 30;
  // TODO: integrate with actual Downdetector scraper
  return null; // Replace with real implementation
}

// ── TRIGGER 3: CURFEW / SECTION 144 ──────────────────────
export async function checkCurfewTrigger(city: string): Promise<TriggerEvent | null> {
  // Check government RSS feeds and news APIs for curfew keywords
  try {
    // NewsAPI check for curfew keywords in the city
    const keywords = ['curfew', 'section 144', 'bandh', 'hartal', 'shutdown', 'lockdown', city.toLowerCase()];
    // In production: call NewsAPI with these keywords
    // const newsApiUrl = `https://newsapi.org/v2/everything?q=${keywords.join('+')}&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`;
    // For demo, return null — replace with real NewsAPI integration
    return null;
  } catch { return null; }
}

// ── TRIGGER 4: AIR QUALITY / HEATWAVE ────────────────────
export async function checkAQITrigger(lat: number, lng: number): Promise<TriggerEvent | null> {
  try {
    // Open-Meteo has AQI data
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&hourly=pm2_5&forecast_days=1&timezone=Asia/Kolkata`;
    const res = await fetch(url);
    const data = await res.json();
    const maxPm25 = Math.max(...(data.hourly?.pm2_5 || [0]));
    
    // WHO Hazardous: PM2.5 > 250 μg/m³ (AQI ~300)
    if (maxPm25 > 250) {
      return {
        type: 'air_quality',
        severity: 'extreme',
        payoutMultiplier: 0.5, // 50% of tier payout
        pincode: '110001',
        city: 'Delhi',
        triggeredAt: new Date(),
        dataSource: 'open-meteo-aqi',
        confidence: 0.95,
        isPredictive: false,
        rawData: { pm25: maxPm25 },
      };
    }
    
    // Check heatwave: > 43°C
    const tempUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max&forecast_days=1&timezone=Asia/Kolkata`;
    const tempRes = await fetch(tempUrl);
    const tempData = await tempRes.json();
    const maxTemp = tempData.daily?.temperature_2m_max?.[0] || 0;
    
    if (maxTemp >= 43) {
      return {
        type: 'air_quality',
        severity: 'high',
        payoutMultiplier: 0.5,
        pincode: '110001',
        city: 'Delhi',
        triggeredAt: new Date(),
        dataSource: 'open-meteo-temp',
        confidence: 0.9,
        isPredictive: false,
        rawData: { maxTempC: maxTemp },
      };
    }
    return null;
  } catch { return null; }
}

// ── TRIGGER 5: FESTIVAL DISRUPTION ───────────────────────
export async function checkFestivalTrigger(
  city: string,
  currentOrderCount: number,
  baselineOrderCount: number
): Promise<TriggerEvent | null> {
  const dropPercent = baselineOrderCount > 0
    ? (1 - currentOrderCount / baselineOrderCount) * 100
    : 0;
  
  if (dropPercent >= 70) {
    return {
      type: 'festival',
      severity: 'medium',
      payoutMultiplier: 0.4, // 40% of tier payout
      pincode: '110001',
      city,
      triggeredAt: new Date(),
      dataSource: 'order_volume_monitor',
      confidence: 0.8,
      isPredictive: false,
      rawData: { dropPercent, currentOrders: currentOrderCount, baseline: baselineOrderCount },
    };
  }
  return null;
}
