import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  let rider_id = req.nextUrl.searchParams.get('rider_id');
  const phone = req.nextUrl.searchParams.get('phone');

  if (!rider_id && !phone) {
    return NextResponse.json({ error: 'rider_id or phone is required' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (!rider_id && phone) {
    // Format phone to match seed format if needed (e.g. +91...)
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`;
    const { data: riderData, error: riderErr } = await supabase
      .from('riders')
      .select('id')
      .eq('phone', formattedPhone)
      .single();
    
    if (riderErr || !riderData) {
      return NextResponse.json({ error: 'Rider not found by phone' }, { status: 404 });
    }
    rider_id = riderData.id;
  }

  const { data, error } = await supabase
    .from('rider_engagement')
    .select('*')
    .eq('rider_id', rider_id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
  }

  return NextResponse.json({
    eligible: data.is_eligible,
    active_days: data.active_days_current_fy,
    threshold: data.threshold_days,
    progress_pct: Math.min(
      100,
      Math.round((data.active_days_current_fy / data.threshold_days) * 100)
    ),
    plan_access: data.is_eligible ? 'full' : 'shift_pass_only',
    is_multi_apping: data.is_multi_apping,
    platform: data.platform,
  });
}
