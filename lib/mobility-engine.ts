import { createServiceRoleClient } from "./supabase-service";
import { ZONE_COORDS, type ZoneSlug } from "./zones";

export interface MobilityAnalysis {
  confidence: number; // 0.0 - 1.0
  is_present: boolean;
  distance_from_center_km: number;
  last_ping_zone?: ZoneSlug;
  teleportation_detected: boolean;
}

/**
 * Validates if the worker was actually present in the disruption zone
 * based on the last 4 hours of GPS telemetry.
 */
export async function validateWorkerPresence(
  workerId: string,
  targetZone: ZoneSlug,
  triggerTime: Date
): Promise<MobilityAnalysis> {
  const supabase = createServiceRoleClient();
  const startTime = new Date(triggerTime.getTime() - 4 * 60 * 60 * 1000).toISOString();
  const endTime = triggerTime.toISOString();

  // Fetch pings in the 4h window surrounding the trigger
  const { data: pings } = await supabase
    .from("rider_gps_pings")
    .select("lat, lon, pinged_at")
    .eq("rider_id", workerId)
    .gte("pinged_at", startTime)
    .lte("pinged_at", endTime)
    .order("pinged_at", { ascending: true });

  if (!pings || pings.length === 0) {
    return {
      confidence: 0,
      is_present: false,
      distance_from_center_km: 999,
      teleportation_detected: false
    };
  }

  const target = ZONE_COORDS[targetZone];
  if (!target) {
    return { confidence: 0.5, is_present: true, distance_from_center_km: 0, teleportation_detected: false };
  }

  let pingsInZone = 0;
  let totalDist = 0;
  let teleportation_detected = false;

  for (let i = 0; i < pings.length; i++) {
    const p = pings[i];
    const dist = calculateDistance(p.lat, p.lon, target.lat, target.lng);
    totalDist += dist;
    if (dist <= 5) pingsInZone++; // Within 5km radius

    // Velocity check (Teleportation)
    if (i > 0) {
      const prev = pings[i - 1];
      const dt_sec = (new Date(p.pinged_at).getTime() - new Date(prev.pinged_at).getTime()) / 1000;
      const d_km = calculateDistance(p.lat, p.lon, prev.lat, prev.lon);
      if (dt_sec > 0 && (d_km / dt_sec) * 3600 > 150) { // > 150km/h = impossible for gig worker
        teleportation_detected = true;
      }
    }
  }

  const avgDist = totalDist / pings.length;
  const presenceRatio = pingsInZone / pings.length;

  return {
    confidence: presenceRatio,
    is_present: presenceRatio >= 0.6 || avgDist < 5,
    distance_from_center_km: avgDist,
    teleportation_detected
  };
}

/** Haversine formula for distance calculation */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
