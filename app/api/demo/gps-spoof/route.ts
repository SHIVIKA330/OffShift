import { createClient } from '@supabase/supabase-js';

export async function POST() {
  if (process.env.DEMO_MODE !== 'true') return Response.json({ error: 'Not in demo mode' }, { status: 403 });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  await supabase.from('demo_events').insert({
    event_type: 'gps_spoof',
    payload: { lat: 0, lon: 0, simulated_at: new Date().toISOString(), reason: 'static coordinate spoofing' }
  });

  return Response.json({
    simulated: true,
    message: 'GPS Spoofing simulated on identical coordinate cluster.',
    action: 'Flagged for syndicate review by Isolation Forest model.',
  });
}
