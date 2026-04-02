"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupees } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type PolicyRow = {
  id: string;
  plan_type: string;
  premium_amount: number;
  coverage_start: string;
  coverage_end: string;
  status: string;
  payout_total: number;
  max_payout: number;
  trigger_weather: boolean;
  trigger_outage: boolean;
  next_premium_due_at: string | null;
  created_at: string;
};

type ClaimRow = {
  id: string;
  trigger_type: string;
  payout_amount: number;
  status: string;
  created_at: string;
  payout_txn_id: string | null;
};

export function DashboardClient() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [policies, setPolicies] = useState<PolicyRow[]>([]);
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [sortKey, setSortKey] = useState<"created_at" | "premium_amount">("created_at");
  const [page, setPage] = useState(0);
  const pageSize = 5;

  const load = useCallback(async () => {
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    setUser(u);
    if (!u) return;

    const { data: pol } = await supabase
      .from("policies")
      .select("*")
      .eq("worker_id", u.id)
      .order("created_at", { ascending: false });

    setPolicies((pol ?? []) as PolicyRow[]);

    const { data: cl } = await supabase
      .from("claims")
      .select("*")
      .eq("worker_id", u.id)
      .order("created_at", { ascending: false });

    setClaims((cl ?? []) as ClaimRow[]);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!user) return;

    const ch = supabase
      .channel("claims-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "claims",
          filter: `worker_id=eq.${user.id}`,
        },
        (payload) => {
          toast.message("Claim update", {
            description: `${(payload.new as ClaimRow)?.status ?? "updated"}`,
          });
          void load();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(ch);
    };
  }, [supabase, user, load]);

  const active = policies.find((p) => p.status === "ACTIVE");

  const sortedHistory = useMemo(() => {
    const arr = [...policies];
    arr.sort((a, b) => {
      if (sortKey === "premium_amount") {
        return Number(b.premium_amount) - Number(a.premium_amount);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return arr;
  }, [policies, sortKey]);

  const slice = sortedHistory.slice(page * pageSize, page * pageSize + pageSize);

  const coveragePct = active
    ? Math.min(
        100,
        (Date.now() - new Date(active.coverage_start).getTime()) /
          (new Date(active.coverage_end).getTime() -
            new Date(active.coverage_start).getTime()) *
            100
      )
    : 0;

  const triggersDuring = claims.filter(
    (c) =>
      active &&
      new Date(c.created_at) >= new Date(active.coverage_start) &&
      new Date(c.created_at) <= new Date(active.coverage_end)
  );

  if (!user) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-slate-600">लोड हो रहा है…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#0F4C5C]">Dashboard</h1>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>

      {active && (
        <Card className="border-[#0F4C5C]/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Active policy</CardTitle>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500">सक्रिय पॉलिसी</p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-mono text-xs">{active.id}</p>
            <p>
              Plan: <strong>{active.plan_type}</strong> · Max{" "}
              {formatRupees(Number(active.max_payout))}
            </p>
            <p className="text-xs text-slate-600">
              {new Date(active.coverage_start).toLocaleString("en-IN")} →{" "}
              {new Date(active.coverage_end).toLocaleString("en-IN")}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant={active.trigger_weather ? "success" : "outline"}>
                Weather {active.trigger_weather ? "✓" : "—"}
              </Badge>
              <Badge variant={active.trigger_outage ? "success" : "outline"}>
                App outage {active.trigger_outage ? "✓" : "—"}
              </Badge>
            </div>
            {active.next_premium_due_at && (
              <p className="text-xs">
                Next premium:{" "}
                {new Date(active.next_premium_due_at).toLocaleDateString("en-IN")}
              </p>
            )}
            <Button className="w-full" variant="secondary" asChild>
              <Link href="/onboard">Renew / नवीनीकरण</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!active && policies[0] && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No active policy</CardTitle>
            <p className="text-xs text-slate-500">कोई सक्रिय पॉलिसी नहीं</p>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/onboard">Buy Kavach</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {active && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Coverage timeline</CardTitle>
            <p className="text-xs text-slate-500">कवरेज टाइमलाइन</p>
          </CardHeader>
          <CardContent>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-[#0F4C5C] transition-all"
                style={{ width: `${coveragePct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Triggers this window:{" "}
              {triggersDuring.length > 0
                ? triggersDuring.map((c) => c.trigger_type).join(", ")
                : "None yet"}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Policy history</CardTitle>
              <p className="text-xs text-slate-500">पुरानी पॉलिसियाँ</p>
            </div>
            <select
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
              value={sortKey}
              onChange={(e) =>
                setSortKey(e.target.value as "created_at" | "premium_amount")
              }
            >
              <option value="created_at">Sort by date</option>
              <option value="premium_amount">Sort by premium</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {slice.map((p) => {
            const related = claims.filter((c) => c.id);
            const claimCount = claims.filter(() => true).length;
            void related;
            void claimCount;
            const paidClaims = claims.filter(
              (c) => c.status === "SETTLED" && new Date(c.created_at) >= new Date(p.created_at)
            );
            return (
              <div
                key={p.id}
                className="flex flex-col gap-1 rounded-xl border border-slate-100 p-3 text-sm"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{p.plan_type}</span>
                  <Badge variant={p.status === "ACTIVE" ? "success" : "outline"}>
                    {p.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {new Date(p.coverage_start).toLocaleDateString("en-IN")} —{" "}
                  {new Date(p.coverage_end).toLocaleDateString("en-IN")}
                </p>
                <p>
                  Premium {formatRupees(Number(p.premium_amount))} · Payouts{" "}
                  {formatRupees(Number(p.payout_total))}
                </p>
                <p className="text-xs text-slate-500">
                  Claims (approx. period): {paidClaims.length} settled
                </p>
              </div>
            );
          })}
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={(page + 1) * pageSize >= sortedHistory.length}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Claims</CardTitle>
          <p className="text-xs text-slate-500">दावे — real-time</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {claims.length === 0 && (
            <p className="text-sm text-slate-500">No claims yet.</p>
          )}
          {claims.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-slate-100 p-3 text-sm"
            >
              <div className="flex justify-between">
                <span>{c.trigger_type}</span>
                <Badge variant="outline">{c.status}</Badge>
              </div>
              <p className="text-xs text-slate-500">
                {new Date(c.created_at).toLocaleString("en-IN")}
              </p>
              <p>
                {formatRupees(Number(c.payout_amount))}{" "}
                {c.payout_txn_id && (
                  <span className="font-mono text-xs">· {c.payout_txn_id}</span>
                )}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
