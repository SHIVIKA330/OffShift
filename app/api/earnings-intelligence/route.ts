import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPayoutAmount } from '@/lib/tiers';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const workerId = searchParams.get('workerId');

  if (!workerId) return NextResponse.json({ error: 'Missing workerId' }, { status: 400 });

  const { data: worker } = await supabase
    .from('workers')
    .select('*, policies(*), claims(*)')
    .eq('id', workerId)
    .single();

  if (!worker) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const tier = worker.payout_tier || 'bronze';
  const payoutPerEvent = getPayoutAmount(tier);
  const planType = worker.policies?.[0]?.plan_type || 'weekly';
  
  const premiumCost = planType === 'daily' ? 12 * 365 :
    planType === 'weekly' ? 49 * 52 : 349 * 12;
  
  // Estimate 2 flood events per year in Delhi NCR (historical average)
  const estimatedEventsPerYear = worker.zone_risk_score > 0.6 ? 4 : 
    worker.zone_risk_score > 0.3 ? 2 : 1;
  
  const estimatedAnnualPayout = estimatedEventsPerYear * payoutPerEvent;
  const netBenefit = estimatedAnnualPayout - premiumCost;

  const totalClaims = worker.claims?.length || 0;
  const totalReceived = worker.claims?.reduce((sum: number, c: any) => sum + (c.payout_amount || 0), 0) || 0;

  return NextResponse.json({
    tier,
    payoutPerEvent,
    estimatedEventsPerYear,
    estimatedAnnualPayout,
    annualPremiumCost: premiumCost,
    netBenefit,
    roi: premiumCost > 0 ? ((estimatedAnnualPayout / premiumCost - 1) * 100).toFixed(0) : '0',
    totalClaimsMade: totalClaims,
    totalReceived,
    roiMessage: netBenefit > 0
      ? `If ${estimatedEventsPerYear} events hit this year, OffShift pays ₹${estimatedAnnualPayout}. Your annual premium: ₹${premiumCost}. Net benefit: ₹${netBenefit}.`
      : `Your annual premium is ₹${premiumCost} for up to ₹${estimatedAnnualPayout} protection.`,
  });
}
