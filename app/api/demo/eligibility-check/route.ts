import { createClient } from '@supabase/supabase-js';

export async function POST() {
  if (process.env.DEMO_MODE !== 'true') return Response.json({ error: 'Not in demo mode' }, { status: 403 });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const days = Math.floor(Math.random() * 60) + 70; // Simulate 70-130 days
  const isMultiApping = Math.random() > 0.5;
  const threshold = isMultiApping ? 120 : 90;
  const isEligible = days >= threshold;

  await supabase.from('demo_events').insert({
    event_type: 'eligibility_check',
    payload: {
      rider_platform_activity_days: days,
      is_multi_apping: isMultiApping,
      threshold_days: threshold,
      simulated_at: new Date().toISOString()
    }
  });

  return Response.json({
    simulated: true,
    message: `Eligibility evaluation performed under SS Code 2020 (Threshold: ${threshold} days).`,
    rider_activity: `${days} days in current FY`,
    threshold_type: isMultiApping ? 'Multi-apping' : 'Single-platform',
    decision: isEligible 
      ? '✅ ELIGIBLE: Unlocked Haftaa Ka Kavach (Weekly Pass)' 
      : `❌ INELIGIBLE: Needs ${threshold - days} more days to unlock full coverage.`,
    is_eligible: isEligible
  });
}
