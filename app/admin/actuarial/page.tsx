import { calculateActuarialMetrics } from '@/lib/actuarial-admin';

function MetricCard({ label, value, target, unit = '', status }: {
  label: string; value: string; target: string; unit?: string; status: 'good' | 'warn' | 'bad';
}) {
  const colors = { good: 'text-green-600', warn: 'text-amber-600', bad: 'text-red-600' };
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${colors[status]}`}>{value}{unit}</p>
      <p className="text-xs text-muted-foreground mt-1">Target: {target}</p>
    </div>
  );
}

export default async function ActuarialDashboard() {
  const metrics = await calculateActuarialMetrics();
  const lrPct = (metrics.lossRatio * 100).toFixed(1);
  const erPct = (metrics.expenseRatio * 100).toFixed(1);
  const crPct = (metrics.combinedRatio * 100).toFixed(1);
  const autoApprPct = (metrics.autoApprovalRate * 100).toFixed(0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1">Actuarial Dashboard</h1>
      <p className="text-muted-foreground text-sm mb-6">Live insurance health metrics · IRDAI-aligned reporting</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <MetricCard label="Loss Ratio" value={lrPct} unit="%" target="< 65%" status={metrics.lossRatio < 0.65 ? 'good' : 'bad'} />
        <MetricCard label="Expense Ratio" value={erPct} unit="%" target="< 35%" status={metrics.expenseRatio < 0.35 ? 'good' : 'warn'} />
        <MetricCard label="Combined Ratio" value={crPct} unit="%" target="< 100%" status={metrics.combinedRatio < 1.0 ? 'good' : 'bad'} />
        <MetricCard
          label="Policyholder Surplus"
          value={`₹${(metrics.policyholderSurplus / 100).toFixed(0)}k`}
          target="Positive"
          status={metrics.policyholderSurplus > 0 ? 'good' : 'bad'}
        />
        <MetricCard label="Auto-Approval Rate" value={autoApprPct} unit="%" target="> 80%" status={metrics.autoApprovalRate > 0.8 ? 'good' : 'warn'} />
        <MetricCard
          label="Avg Payout Time"
          value={`${metrics.avgPayoutTimeMinutes}`}
          unit=" min"
          target="< 120 min"
          status={metrics.avgPayoutTimeMinutes < 120 ? 'good' : 'warn'}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-4">
          <p className="text-sm font-medium mb-3">Financial Summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Premiums Collected</span>
              <span className="font-medium">₹{metrics.totalPremiumsCollected.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Claims Paid</span>
              <span className="font-medium text-red-600">₹{metrics.totalClaimsPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Operating Costs</span>
              <span className="font-medium">₹{metrics.totalOperatingCosts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Net Surplus</span>
              <span className={`font-semibold ${metrics.policyholderSurplus > 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{metrics.policyholderSurplus.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm font-medium mb-3">Portfolio Health</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Policies</span>
              <span className="font-medium">{metrics.activePolicies}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Claims Frequency</span>
              <span className="font-medium">{(metrics.claimsFrequency * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Claim Severity</span>
              <span className="font-medium">₹{Math.round(metrics.avgSeverity).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
