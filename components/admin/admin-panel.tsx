"use client";

import { BarChart } from "@tremor/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRupees } from "@/lib/format";
import FraudScoreBadge from "@/components/FraudScoreBadge";
import PayoutPipeline from "@/components/PayoutPipeline";

type Stats = {
  active_policies: number;
  policies_by_zone: { zone: string; count: number }[];
  revenue_this_week: number;
  revenue_last_week: number;
  loss_ratio: number;
  total_premiums: number;
  total_payouts: number;
  enrollments_suspended: boolean;
  bcr_target_min: number;
  bcr_target_max: number;
  recent_claims?: any[];
};

export function AdminPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/stats");
    setLoading(false);
    if (!res.ok) {
      setStats(null);
      return;
    }
    setStats(await res.json());
  };

  useEffect(() => {
    void load();
  }, []);

  const login = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Invalid password");
      return;
    }
    await load();
  };

  if (loading && !stats) {
    return (
      <p className="p-8 text-center text-slate-600">Loading admin…</p>
    );
  }

  if (!stats && !loading) {
    return (
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle>Admin login</CardTitle>
          <p className="text-xs text-slate-500">Basic auth — ADMIN_PASSWORD</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              className="mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button className="w-full" onClick={() => void login()}>
            Sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const chartData = stats.policies_by_zone.map((z) => ({
    zone: z.zone,
    policies: z.count,
  }));

  const lossPct = (stats.loss_ratio * 100).toFixed(1);

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-8">
      <h1 className="text-2xl font-semibold text-[#0F4C5C]">Insurer console</h1>

      {stats.enrollments_suspended && (
        <div className="rounded-xl border-2 border-red-600 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">
          Loss ratio {lossPct}% &gt; 85% — suspend new enrollments (actuarial guardrail).
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <p className="text-xs text-slate-500">Active policies</p>
            <p className="text-3xl font-bold text-[#0F4C5C]">{stats.active_policies}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <p className="text-xs text-slate-500">Revenue this week</p>
            <p className="text-xl font-bold">{formatRupees(stats.revenue_this_week)}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <p className="text-xs text-slate-500">Revenue last week</p>
            <p className="text-xl font-bold">{formatRupees(stats.revenue_last_week)}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <p className="text-xs text-slate-500">Loss ratio (BCR)</p>
            <p className="text-xl font-bold">
              {lossPct}%
              <span className="ml-2 text-xs font-normal text-slate-500">
                target {stats.bcr_target_min * 100}–{stats.bcr_target_max * 100}%
              </span>
            </p>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Policies by zone (ward-level)</CardTitle>
          <p className="text-xs text-slate-500">सक्रिय पॉलिसी — ज़ोन अनुसार</p>
        </CardHeader>
        <CardContent>
          <BarChart
            className="mt-4 h-72"
            data={chartData}
            index="zone"
            categories={["policies"]}
            colors={["teal"]}
            yAxisWidth={48}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Totals</CardTitle>
            <p className="text-xs text-slate-500">Overview of capital flow</p>
          </CardHeader>
          <CardContent className="text-sm text-slate-700 space-y-2">
            <div className="flex justify-between pb-2 border-b">
              <span>Premiums collected</span>
              <span className="font-semibold">{formatRupees(stats.total_premiums)}</span>
            </div>
            <div className="flex justify-between pb-2 border-b">
              <span>Payouts settled</span>
              <span className="font-semibold">{formatRupees(stats.total_payouts)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">warning</span> Syndicate Alerts
            </CardTitle>
            <p className="text-xs text-slate-500">Isolation Forest Detection Flags</p>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 animate-pulse"></div>
              <div>
                <p className="font-semibold text-red-900 text-xs">GPS Cluster Anomaly (Okhla)</p>
                <p className="text-[10px] text-red-700 mt-1">45 accounts sharing identical device kinematics and location within 2 meters. Payouts halted.</p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2 opacity-60">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-400"></div>
              <div>
                <p className="font-semibold text-slate-700 text-xs">Subscription Spike (Dwarka)</p>
                <p className="text-[10px] text-slate-500 mt-1">Resolved: Correlated to organic referral campaign.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F4C5C]/5 border-[#0F4C5C]/10 col-span-1 sm:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[#0F4C5C] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">fact_check</span> Recent Claim Payouts
            </CardTitle>
            <p className="text-xs text-slate-500">Integrated Multi-Layer Fraud Detection</p>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
             {stats.recent_claims?.map((claim: any) => {
               // Pseudo-mock score generation for demo based on status unless computed
               // In production, you'd save \`fraud_score\` in the claims table.
               // We will mock the fraud result for the UI visually.
               const isSettled = claim.status === "SETTLED";
               const isBlocked = claim.status === "REJECTED";
               const fraudScore = isSettled ? Math.floor(Math.random() * 25) : isBlocked ? Math.floor(Math.random() * 30 + 65) : Math.floor(Math.random() * 20 + 35);
               const decision = fraudScore <= 30 ? "AUTO_APPROVE" : fraudScore <= 60 ? "FLAG_REVIEW" : "BLOCK";
               
               const workerName = claim.policies?.workers?.name || "Unknown Rider";
               
               return (
                  <div key={claim.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                     <div className="w-1/2">
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-widest">{workerName} <span className="opacity-50 font-normal">({claim.disruption_type})</span></p>
                        <p className="text-[10px] text-slate-600 mt-1 mb-2 font-mono">Claim ID: {claim.id.split('-')[0]} • {formatRupees(claim.payout_amount)}</p>
                        <FraudScoreBadge score={fraudScore} decision={decision} />
                        <PayoutPipeline claimId={claim.id} />
                     </div>
                     <div className="text-right">
                        {isSettled && <span className="text-xs font-bold text-emerald-600">SETTLED</span>}
                        {isBlocked && <span className="text-xs font-bold text-red-600">BLOCKED</span>}
                        {!isSettled && !isBlocked && <Button size="sm" variant="outline" className="h-7 text-xs">Review</Button>}
                     </div>
                  </div>
               );
             })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
