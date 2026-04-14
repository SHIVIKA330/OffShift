import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Pincode → zone cluster mapping (simplified)
const ZONE_MAP: Record<string, string> = {
  '110020': 'Okhla', '122001': 'Gurgaon', '201301': 'Noida',
  '110075': 'Dwarka', '110085': 'Rohini', '110024': 'Lajpat Nagar',
};

function getZoneFromPincode(pincode: string): string {
  return ZONE_MAP[pincode] ?? 'Unknown';
}

export async function POST(req: NextRequest) {
  try {
    const { rider_id, policy_id, current_lat, current_lon, current_pincode } = await req.json();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Log this GPS ping
    if (rider_id && current_lat && current_lon) {
      await supabase.from('rider_gps_pings').insert({
        rider_id, lat: current_lat, lon: current_lon,
        pincode: current_pincode,
        zone_cluster: getZoneFromPincode(current_pincode),
        is_active: true
      });
    }

    // Get policy's purchase zone
    const { data: policy } = await supabase.from('policies').select('zone, plan_type').eq('id', policy_id).single();
    const currentZone = getZoneFromPincode(current_pincode);
    const crossedZone = policy?.zone !== currentZone;

    // Check if current zone has active disruption
    const { data: disruption } = await supabase.from('active_disruptions')
      .select('*')
      .eq('affected_zone', currentZone)
      .is('ended_at', null)
      .limit(1)
      .single();

    const triggerInCurrentZone = !!disruption;

    // Coverage rule:
    // Shift Pass → only original purchase zone is covered
    // Weekly/Monthly → covered in any zone with active disruption
    let covered = false;
    if (!crossedZone) {
      covered = triggerInCurrentZone;
    } else if (policy?.plan_type === 'weekly_pass' || policy?.plan_type === 'monthly_pro') {
      covered = triggerInCurrentZone;
    }

    return NextResponse.json({
      current_zone: currentZone,
      purchase_zone: policy?.zone,
      crossed_zone: crossedZone,
      trigger_active_here: triggerInCurrentZone,
      covered,
      message: crossedZone
        ? covered
          ? `You've entered ${currentZone} — active disruption here. You're covered. ✅`
          : `You've entered ${currentZone} — no active disruption. No payout triggered.`
        : covered
          ? `Active disruption in your zone (${currentZone}). Payout will trigger. ✅`
          : `No active disruption in ${currentZone}. Keep delivering safely.`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
