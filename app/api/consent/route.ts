import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { rider_id: providedRiderId, phone, consent_type } = await req.json();

  if (!providedRiderId && !phone) {
    return NextResponse.json({ error: 'rider_id or phone required' }, { status: 400 });
  }

  if (!['gps', 'bank_upi', 'platform_activity'].includes(consent_type)) {
    return NextResponse.json({ error: 'Invalid consent_type' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let rider_id = providedRiderId;

  if (!rider_id && phone) {
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`;
    const { data: riderData, error: riderErr } = await supabase
      .from('riders')
      .select('id')
      .eq('phone', formattedPhone)
      .single();
      
    if (riderErr || !riderData) {
      return NextResponse.json({ error: 'Rider not found for consent' }, { status: 404 });
    }
    rider_id = riderData.id;
  }

  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  // Hash IP before storing (DPDP compliance — never store raw IP)
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const ip_hash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const { error } = await supabase.from('consent_log').insert({
    rider_id,
    consent_type,
    ip_hash,
    consent_version: '1.0',
  });

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
