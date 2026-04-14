import { createClient } from '@supabase/supabase-js';

export async function POST() {
  if (process.env.DEMO_MODE !== 'true') return Response.json({ error: 'Not in demo mode' }, { status: 403 });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  await supabase.from('demo_events').insert({
    event_type: 'zone_crossing',
    payload: {
      previous_zone: 'Okhla',
      current_zone: 'Noida',
      simulated_at: new Date().toISOString()
    }
  });

  return Response.json({
    simulated: true,
    message: 'Rider crossed from Okhla to Noida.',
    decision: 'Verified Weekly or Monthly plan guarantees cross-zone elasticity.',
    covered: true
  });
}
