import { createClient } from '@supabase/supabase-js';

export async function POST() {
  if (process.env.DEMO_MODE !== 'true') return Response.json({ error: 'Not in demo mode' }, { status: 403 });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  // Insert two simultaneous disruptions for Okhla
  await supabase.from('demo_events').insert({
    event_type: 'concurrent_disruption',
    payload: {
      disruptions: ['weather:RedAlert:Okhla', 'platform_outage:Zomato:Okhla'],
      simulated_at: new Date().toISOString(),
      expected_payout_shift_pass: 500,
      expected_payout_monthly_pro: 800
    }
  });

  return Response.json({
    simulated: true,
    message: 'Rain + Zomato outage triggered simultaneously in Okhla',
    payout_rules: {
      shift_pass: '₹500 (max of two)',
      weekly_pass: '₹500 (max of two)',
      monthly_pro: '₹800 (combined — product differentiator)'
    }
  });
}
