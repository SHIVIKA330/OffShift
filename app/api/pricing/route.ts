import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateHybridPremium } from '@/lib/pricing-engine';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();
  const { workerId, planType = 'weekly' } = body;

  // Fetch worker data
  const { data: worker, error } = await supabase
    .from('workers')
    .select('*')
    .eq('id', workerId)
    .single();

  if (error || !worker) {
    return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
  }

  const pricing = await calculateHybridPremium({
    workerId: worker.id,
    pincode: worker.pincode || '110001',
    city: worker.city || 'Delhi',
    avgDailyOrders: worker.avg_daily_orders || 5,
    zoneRiskScore: worker.zone_risk_score || 0.4,
    historicalClaimRate: worker.historical_claim_rate || 0,
    accountAgeDays: Math.floor(
      (Date.now() - new Date(worker.created_at).getTime()) / (1000 * 60 * 60 * 24)
    ),
    planType,
  });

  // Update worker tier
  await supabase
    .from('workers')
    .update({ payout_tier: pricing.tier })
    .eq('id', workerId);

  return NextResponse.json({ pricing });
}
