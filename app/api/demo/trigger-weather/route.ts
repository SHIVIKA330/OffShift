import { createClient } from '@supabase/supabase-js';

export async function POST() {
  if (process.env.DEMO_MODE !== 'true') return Response.json({ error: 'Not in demo mode' }, { status: 403 });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  await supabase.from('demo_events').insert({
    event_type: 'trigger_weather',
    payload: { disruption: 'weather:RedAlert:DelhiNCR', simulated_at: new Date().toISOString() }
  });

  return Response.json({
    simulated: true,
    message: 'IMD Red Alert triggered dynamically.',
    payout_rules: { shift_pass: '₹500', weekly_pass: '₹500', monthly_pro: '₹500' }
  });
}
