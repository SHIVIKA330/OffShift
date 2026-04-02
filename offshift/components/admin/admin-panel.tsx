"use client";

import { BarChart } from "@tremor/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRupees } from "@/lib/format";

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
    return (
      <p className="p-8 text-center text-slate-600">
        {loading ? "Loading…" : "Unauthorized"}
      </p>
    );
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

      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          <p>Premiums collected: {formatRupees(stats.total_premiums)}</p>
          <p>Payouts settled: {formatRupees(stats.total_payouts)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
