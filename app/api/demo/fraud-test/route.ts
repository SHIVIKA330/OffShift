import { createClient } from '@supabase/supabase-js';

export async function POST() {
  if (process.env.DEMO_MODE !== 'true') return Response.json({ error: 'Not in demo mode' }, { status: 403 });
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  await supabase.from('demo_events').insert({
    event_type: 'fraud_test',
    payload: { score: 85, ai_inference: 'Anomaly match: High frequency temporal claim pattern' }
  });

  return Response.json({
    simulated: true,
    message: 'Fraud test executed. High score computed via multi-layer ML.',
    decision: 'BLOCK',
    fraud_score: 85,
    failed_layers: ["Layer 2: Velocity Impossible", "Layer 4: AI anomaly"],
  });
}
