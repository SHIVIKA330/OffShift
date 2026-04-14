import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  let rider_id = req.nextUrl.searchParams.get('rider_id');
  const phone = req.nextUrl.searchParams.get('phone');

  if (!rider_id && !phone) {
    return NextResponse.json({ error: 'rider_id or phone required' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (!rider_id && phone) {
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`;
    const { data: riderData, error: riderErr } = await supabase
      .from('riders')
      .select('id')
      .eq('phone', formattedPhone)
      .single();
    if (riderData) {
      rider_id = riderData.id;
    } else {
      // If we can't find a matching rider, it means 0 consent given.
      return NextResponse.json({ is_complete: false, completed: [], rider_id: null });
    }
  }

  const { data, error } = await supabase
    .from('consent_log')
    .select('consent_type')
    .eq('rider_id', rider_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const required = ['gps', 'bank_upi', 'platform_activity'];
  const completed = data.map(d => d.consent_type);
  const is_complete = required.every(type => completed.includes(type));

  return NextResponse.json({ is_complete, completed });
}
