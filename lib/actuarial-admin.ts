import { createClient } from '@/lib/supabase/server';

export interface ActuarialMetrics {
  totalPremiumsCollected: number;
  totalClaimsPaid: number;
  totalOperatingCosts: number;
  activePolicies: number;
  lossRatio: number;           // Claims ÷ Premiums (target: <65%)
  expenseRatio: number;        // Costs ÷ Premiums (target: <35%)
  combinedRatio: number;       // Loss + Expense (target: <100%)
  policyholderSurplus: number; // Premiums - Claims - Costs
  claimsFrequency: number;     // Claims ÷ Active policies
  avgSeverity: number;         // Total payouts ÷ Claim count
  autoApprovalRate: number;    // % claims auto-approved
  avgPayoutTimeMinutes: number;
}

export async function calculateActuarialMetrics(): Promise<ActuarialMetrics> {
  const supabase = createClient();
  
  const [premiumsRes, claimsRes, policiesRes] = await Promise.all([
    supabase.from('policies').select('final_premium, plan_type, is_active'),
    supabase.from('claims').select('payout_amount, fraud_decision, created_at, paid_at'),
    supabase.from('policies').select('id', { count: 'exact' }).eq('is_active', true),
  ]);

  const totalPremiums = (premiumsRes.data || []).reduce(
    (sum, p) => sum + (p.final_premium || 0), 0
  );
  const paidClaims = (claimsRes.data || []).filter(c => c.fraud_decision === 'auto_approve' || c.payout_amount > 0);
  const totalClaims = paidClaims.reduce((sum, c) => sum + (c.payout_amount || 0), 0);
  const activePolicies = policiesRes.count || 0;
  const operatingCosts = totalPremiums * 0.30; // 30% expense ratio assumption

  const lossRatio = totalPremiums > 0 ? totalClaims / totalPremiums : 0;
  const expenseRatio = totalPremiums > 0 ? operatingCosts / totalPremiums : 0.30;
  const combinedRatio = lossRatio + expenseRatio;
  const surplus = totalPremiums - totalClaims - operatingCosts;

  const autoApproved = (claimsRes.data || []).filter(c => c.fraud_decision === 'auto_approve').length;
  const totalClaimsCount = (claimsRes.data || []).length;
  const autoApprovalRate = totalClaimsCount > 0 ? autoApproved / totalClaimsCount : 0;

  const avgSeverity = paidClaims.length > 0
    ? paidClaims.reduce((sum, c) => sum + (c.payout_amount || 0), 0) / paidClaims.length
    : 0;

  const payoutTimes = paidClaims
    .filter(c => c.paid_at && c.created_at)
    .map(c => (new Date(c.paid_at).getTime() - new Date(c.created_at).getTime()) / (1000 * 60));
  const avgPayoutTime = payoutTimes.length > 0
    ? payoutTimes.reduce((a, b) => a + b, 0) / payoutTimes.length
    : 120;

  // Persist to actuarial_metrics table
  await supabase.from('actuarial_metrics').insert({
    total_premiums_collected: Math.round(totalPremiums),
    total_claims_paid: Math.round(totalClaims),
    total_operating_costs: Math.round(operatingCosts),
    active_policies: activePolicies,
    loss_ratio: lossRatio,
    expense_ratio: expenseRatio,
    combined_ratio: combinedRatio,
    policyholder_surplus: Math.round(surplus),
    claims_frequency: activePolicies > 0 ? totalClaimsCount / activePolicies : 0,
    avg_severity: avgSeverity,
  });

  return {
    totalPremiumsCollected: Math.round(totalPremiums),
    totalClaimsPaid: Math.round(totalClaims),
    totalOperatingCosts: Math.round(operatingCosts),
    activePolicies,
    lossRatio,
    expenseRatio,
    combinedRatio,
    policyholderSurplus: Math.round(surplus),
    claimsFrequency: activePolicies > 0 ? totalClaimsCount / activePolicies : 0,
    avgSeverity,
    autoApprovalRate,
    avgPayoutTimeMinutes: Math.round(avgPayoutTime),
  };
}
