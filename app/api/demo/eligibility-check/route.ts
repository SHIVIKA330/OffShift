import { createClient } from '@supabase/supabase-js';

export async function POST() {
  if (process.env.DEMO_MODE !== 'true') return Response.json({ error: 'Not in demo mode' }, { status: 403 });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  await supabase.from('demo_events').insert({
    event_type: 'eligibility_check',
    payload: {
      rider_platform_activity_days: 95,
      simulated_at: new Date().toISOString()
    }
  });

  return Response.json({
    simulated: true,
    message: 'Eligibility evaluation simulated based on SS Code 2020.',
    decision: 'Allowed to unlock Haftaa Ka Kavach (Weekly Pass)',
    is_eligible: true
  });
}
