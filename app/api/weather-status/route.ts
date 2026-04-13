import { NextResponse } from "next/server";
import { fetchHourlyPrecipitationMm, fetchHourlyTemperatureC, fetchCurrentAqi } from "@/lib/trigger-monitor";
import { normalizeZone } from "@/lib/zones";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const zoneRaw = url.searchParams.get("zone");
  if (!zoneRaw) {
    return NextResponse.json({ error: "Zone required" }, { status: 400 });
  }
  
  const zone = normalizeZone(zoneRaw);
  if (!zone) {
    return NextResponse.json({ error: "Invalid zone" }, { status: 400 });
  }

  try {
    const [rain, temp_c, aqi] = await Promise.all([
      fetchHourlyPrecipitationMm(zone),
      fetchHourlyTemperatureC(zone),
      fetchCurrentAqi(zone)
    ]);

    const rain_mm = Math.max(rain.currentHourMm, rain.maxNext6hMm);

    return NextResponse.json({
      zone,
      rain_mm,
      temp_c,
      aqi: aqi.aqi_current,
      is_rain_alert: rain_mm >= 20,
      is_heat_alert: temp_c >= 45,
      is_aqi_alert: aqi.aqi_current > 300,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 });
  }
}
