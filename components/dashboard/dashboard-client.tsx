"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatRupees } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

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
  policy_id: string;
  trigger_type: string;
  payout_amount: number;
  status: string;
  created_at: string;
  payout_txn_id: string | null;
};

export function DashboardClient() {
  const supabase = createClient();
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [workerName, setWorkerName] = useState<string>("");
  const [policies, setPolicies] = useState<PolicyRow[]>([]);
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [sortKey, setSortKey] = useState<"created_at" | "premium_amount">("created_at");
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const doLogout = useCallback(() => {
    localStorage.removeItem("offshift_worker_id");
    localStorage.removeItem("offshift_worker_name");
    window.location.href = "/";
  }, []);

  // Get worker_id from localStorage
  useEffect(() => {
    const id = localStorage.getItem("offshift_worker_id");
    const name = localStorage.getItem("offshift_worker_name");
    setWorkerId(id);
    setWorkerName(name ?? "Rider");
  }, []);

  const load = useCallback(async () => {
    if (!workerId) return;

    const { data: pol } = await supabase
      .from("policies")
      .select("*")
      .eq("worker_id", workerId)
      .order("created_at", { ascending: false });

    setPolicies((pol ?? []) as PolicyRow[]);

    const { data: cl } = await supabase
      .from("claims")
      .select("*")
      .eq("worker_id", workerId)
      .order("created_at", { ascending: false });

    setClaims((cl ?? []) as ClaimRow[]);
  }, [supabase, workerId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Real-time claim updates
  useEffect(() => {
    if (!workerId) return;

    const ch = supabase
      .channel("claims-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "claims",
          filter: `worker_id=eq.${workerId}`,
        },
        (payload) => {
          toast.message("Claim update / दावा अपडेट", {
            description: `Status: ${(payload.new as ClaimRow)?.status ?? "updated"}`,
          });
          void load();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(ch);
    };
  }, [supabase, workerId, load]);

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
        ((Date.now() - new Date(active.coverage_start).getTime()) /
          (new Date(active.coverage_end).getTime() - new Date(active.coverage_start).getTime())) *
          100
      )
    : 0;

  const triggersDuring = claims.filter(
    (c) =>
      active &&
      new Date(c.created_at) >= new Date(active.coverage_start) &&
      new Date(c.created_at) <= new Date(active.coverage_end)
  );

  const btnPrimaryStyle = "w-full py-4 rounded-full bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-widest editorial-shadow hover:scale-[1.02] transition-transform duration-300 disabled:opacity-50 disabled:scale-100 block text-center";
  const btnSecondaryStyle = "w-full py-2.5 rounded-full bg-surface-container-highest text-on-surface font-label text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container transition-colors duration-300 pointer-events-auto cursor-pointer block text-center w-full"; // Explicit flex to avoid Link inline bugs

  const simulateTrigger = async () => {
    if (!active) return;
    setLoading(true);
    try {
      const res = await fetch("/api/debug/simulate-trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worker_id: workerId, policy_id: active.id }),
      });
      if (res.ok) {
        toast.success("⛈️ Heavy Rain detected! Claim settled instantly.");
        void load();
      }
    } catch (e) {
      toast.error("Trigger failed");
    } finally {
      setLoading(false);
    }
  };

  if (!workerId) {
    return (
      <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-primary">person_off</span>
        </div>
        <h2 className="font-headline text-3xl mb-2">No login found</h2>
        <p className="font-body text-sm text-on-surface-variant mb-8">
          कोई लॉगिन नहीं मिला
        </p>
        <Link href="/onboard" className={btnPrimaryStyle + " max-w-xs"}>
           साइन अप करें / Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#f9f9f7] dark:bg-stone-950 backdrop-blur-md opacity-90 flex justify-between items-center px-6 py-4 border-b border-outline-variant/10">
        <Link href="/">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary hover:opacity-70 transition-opacity duration-300 ease-in-out cursor-pointer" data-icon="menu">menu</span>
            <h1 className="text-2xl font-semibold tracking-tighter text-primary font-['Newsreader']">OffShift</h1>
          </div>
        </Link>
        <div className="relative">
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/15 flex items-center justify-center overflow-hidden hover:opacity-70 transition-opacity duration-300 ease-in-out cursor-pointer">
            <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC95G_7XgTmO5BqUuzbpLEgXc7-4kMwgCwl1NZw8mlK-DYoiUVWMcs8CASgIcEn4bniG4AFJQPWeNnEaea2aFik8TwfLAgBfIYYlBRzLUQ4o6KSF_NIedBXY5gsc2wPRlxD5468OoFmFIWauikoZ8utGhQ5RzulaTjDTz3wVw6E3yv4VoWMS77huuVwTAm0tIBzuqrglIPdMrl_rd4e6eHeCTOGkh98SQ9tAlSWlW5zVJnwhw3GinFy5WantT8l860hX3GbCv0Owww"/>
          </div>
          {isProfileOpen && (
            <div className="absolute right-0 top-12 mt-2 w-48 bg-surface-container-lowest rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-outline-variant/10 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-outline-variant/10">
                <p className="text-sm font-semibold">{workerName}</p>
                <p className="text-xs text-on-surface-variant font-mono truncate">{workerId}</p>
              </div>
              <button 
                onClick={doLogout}
                className="w-full px-4 py-3 text-left text-sm text-error hover:bg-error-container/10 transition-colors flex items-center gap-2 font-medium"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                लॉग आउट / Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="pt-28 px-4 sm:px-6 max-w-lg mx-auto space-y-6">
        
        {/* User Greeting Header */}
        <div className="mb-2 pl-2">
          <h1 className="font-headline text-4xl mb-1 text-primary">Dashboard</h1>
          <p className="font-body text-sm text-on-surface-variant flex items-center gap-2">
            नमस्ते, <strong className="text-on-surface">{workerName}</strong>
          </p>
        </div>

        {/* ── Active Policy Card ── */}
        {active ? (
          <div className="bg-primary text-on-primary p-7 rounded-[32px] editorial-shadow relative overflow-hidden">
            {/* Soft decorative background element */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-surface/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-headline text-2xl font-medium">Active Policy</h3>
                <p className="font-body text-xs text-on-primary/70 mt-1">सक्रिय पॉलिसी</p>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[#cbebc8] text-[#07200b] rounded-full font-label text-[10px] uppercase font-bold tracking-widest shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
                </span>
                LIVE
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between border-b border-on-primary/10 pb-2">
                <span className="font-label text-xs uppercase tracking-widest text-on-primary/70">Plan</span>
                <span className="font-body font-semibold text-sm">{active.plan_type === "24hr" ? "Aaj Ka Kavach" : "Hafte Ka Kavach"}</span>
              </div>
              <div className="flex justify-between border-b border-on-primary/10 pb-2">
                <span className="font-label text-xs uppercase tracking-widest text-on-primary/70">Coverage</span>
                <span className="font-body text-xs text-right opacity-90">
                  {new Date(active.coverage_start).toLocaleString("en-IN", {month: 'short', day: 'numeric', hour: '2-digit'})} → {new Date(active.coverage_end).toLocaleString("en-IN", {month: 'short', day: 'numeric', hour: '2-digit'})}
                </span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="font-label text-xs uppercase tracking-widest text-on-primary/70">Max Payout</span>
                <span className="font-headline text-lg text-[#cbebc8]">{formatRupees(Number(active.max_payout))}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <div className={`px-3 py-1 rounded-full font-label text-[10px] uppercase tracking-widest flex items-center gap-1 border ${active.trigger_weather ? 'bg-on-primary/10 border-transparent text-[#cbebc8]' : 'border-on-primary/20 text-on-primary/40'}`}>
                {active.trigger_weather ? <span className="material-symbols-outlined text-[14px]">check</span> : null} Weather (Heat, Rain, AQI)
              </div>
              <div className={`px-3 py-1 rounded-full font-label text-[10px] uppercase tracking-widest flex items-center gap-1 border ${active.trigger_outage ? 'bg-on-primary/10 border-transparent text-[#cbebc8]' : 'border-on-primary/20 text-on-primary/40'}`}>
                {active.trigger_outage ? <span className="material-symbols-outlined text-[14px]">check</span> : null} Outage
              </div>
              <div className="px-3 py-1 rounded-full font-label text-[10px] uppercase tracking-widest flex items-center gap-1 border bg-on-primary/10 border-transparent text-[#cbebc8]">
                <span className="material-symbols-outlined text-[14px]">check</span> Social (Curfews)
              </div>
            </div>

            {active.next_premium_due_at && (
              <p className="font-label text-[10px] uppercase tracking-widest text-on-primary/60 mb-4 text-center">
                Next premium: {new Date(active.next_premium_due_at).toLocaleDateString("en-IN")}
              </p>
            )}

            <Link href="/onboard" className="block text-center w-full py-4 rounded-full bg-surface-container-lowest text-primary font-label text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform duration-300">
               Renew / नवीनीकरण
            </Link>
            <button 
              onClick={simulateTrigger}
              className="mt-3 w-full py-2.5 rounded-xl border border-primary/20 bg-primary/10 text-[#cbebc8] font-label text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px] animate-bounce">thunderstorm</span>
              Demo: Simulate Rain Trigger
            </button>
            <p className="font-mono text-[8px] text-on-primary/30 mt-4 text-center">ID: {active.id}</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest p-8 rounded-[32px] editorial-shadow border border-outline-variant/10 text-center">
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4 text-secondary">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>gpp_maybe</span>
            </div>
            <h3 className="font-headline text-2xl font-medium mb-1">No Active Policy</h3>
            <p className="font-body text-sm text-on-surface-variant mb-6">कोई सक्रिय पॉलिसी नहीं</p>
            <Link href="/onboard" className={btnPrimaryStyle}>
              Buy Kavach Now
            </Link>
          </div>
        )}

        {/* ── Coverage Timeline Card ── */}
        {active && (
          <div className="bg-surface-container-lowest p-6 rounded-[32px] editorial-shadow border border-outline-variant/10">
            <h3 className="font-headline text-xl font-medium mb-1">Coverage Timeline</h3>
            <p className="font-label text-[10px] uppercase tracking-widest text-secondary mb-5">कवरेज टाइमलाइन</p>
            
            <div className="h-3 w-full rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-in-out relative rounded-full"
                style={{ width: `${Math.max(2, coveragePct)}%` }} // Minimum 2% visibility
              >
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/20 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="mt-4 flex items-start gap-2 text-xs font-body text-on-surface-variant bg-surface-container-low p-3 rounded-xl border border-outline-variant/5">
              <span className="material-symbols-outlined text-[16px] text-secondary">history</span>
              <p>
                Triggers detected this window:{" "}
                <strong className="text-on-surface">{triggersDuring.length > 0 ? triggersDuring.map((c) => c.trigger_type).join(", ") : "None yet"}</strong>
              </p>
            </div>
          </div>
        )}

        {/* ── Policy History List ── */}
        <div className="pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 pl-2 pr-1">
            <div>
              <h3 className="font-headline text-2xl font-medium">Policy History</h3>
              <p className="font-label text-[10px] uppercase tracking-widest text-secondary">पुरानी पॉलिसियाँ</p>
            </div>
            <div className="relative">
              <select
                className="appearance-none bg-surface-container-lowest border border-outline-variant/20 font-label text-[10px] uppercase tracking-widest font-bold px-4 py-2 pr-8 rounded-full outline-none focus:ring-1 focus:ring-primary shadow-sm cursor-pointer"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as "created_at" | "premium_amount")}
              >
                <option value="created_at">Sort by Date</option>
                <option value="premium_amount">Sort by Premium</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
          </div>

          <div className="space-y-3">
            {slice.length === 0 && (
              <div className="bg-surface-container-lowest p-6 rounded-[24px] text-center border border-outline-variant/10 border-dashed">
                <span className="font-body text-sm text-on-surface-variant italic">No previous policies found.</span>
              </div>
            )}
            
            {slice.map((p) => {
              const paidClaims = claims.filter(
                (c) => c.policy_id === p.id && c.status === "SETTLED" && new Date(c.created_at) >= new Date(p.created_at)
              );
              return (
                <div key={p.id} className="bg-surface-container-lowest p-5 rounded-[24px] editorial-shadow border border-outline-variant/10 flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                    <span className="font-headline text-lg font-medium">{p.plan_type === "24hr" ? "Aaj Ka Kavach" : "Hafte Ka Kavach"}</span>
                    <span className={`px-2 py-0.5 rounded-md font-label text-[9px] uppercase font-bold tracking-widest ${p.status === "ACTIVE" ? 'bg-[#cbebc8] text-[#07200b]' : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/20'}`}>
                      {p.status}
                    </span>
                  </div>
                  
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                       <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Coverage Window</p>
                       <p className="font-body text-xs text-on-surface">
                         {new Date(p.coverage_start).toLocaleDateString("en-IN")} → {new Date(p.coverage_end).toLocaleDateString("en-IN")}
                       </p>
                    </div>
                    <div className="text-right">
                       <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Premium</p>
                       <p className="font-body text-sm font-semibold">{formatRupees(Number(p.premium_amount))}</p>
                    </div>
                  </div>

                  <div className="bg-surface-container/30 px-3 py-2 rounded-lg flex justify-between items-center text-xs font-body mt-1">
                    <span className="text-on-surface-variant"><span className="font-semibold text-on-surface">{paidClaims.length}</span> claims settled</span>
                    <span className="text-secondary font-semibold border-l border-outline-variant/20 pl-3">Total paid out: {formatRupees(Number(p.payout_total))}</span>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {sortedHistory.length > pageSize && (
              <div className="flex gap-2 pt-2">
                <button
                  className="flex-1 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/10 font-label text-[10px] uppercase font-bold tracking-widest text-on-surface-variant disabled:opacity-30 disabled:bg-surface hover:bg-surface-container-low transition-colors"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Prev
                </button>
                <button
                  className="flex-1 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/10 font-label text-[10px] uppercase font-bold tracking-widest text-on-surface-variant disabled:opacity-30 disabled:bg-surface hover:bg-surface-container-low transition-colors"
                  disabled={(page + 1) * pageSize >= sortedHistory.length}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Live Claims Card ── */}
        <div className="pt-4">
          <div className="mb-4 pl-2">
            <h3 className="font-headline text-2xl font-medium flex items-center gap-2">
              Live Claims <span className="relative flex h-2 w-2 ml-1"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span></span>
            </h3>
            <p className="font-label text-[10px] uppercase tracking-widest text-secondary">दावे — Real-Time</p>
          </div>

          <div className="space-y-3">
            {claims.length === 0 && (
              <div className="bg-surface-container-lowest p-6 rounded-[24px] text-center border border-outline-variant/10 border-dashed">
                <span className="font-body text-sm text-on-surface-variant italic">No claims triggered yet.</span>
              </div>
            )}
            
            {claims.map((c) => {
               // Determine icon based on trigger_type
               let icon = "bolt";
               if (c.trigger_type === "RAIN") icon = "water_drop";
               if (c.trigger_type === "AQI") icon = "air";
               if (c.trigger_type === "OUTAGE") icon = "app_blocking";

               return (
                <div key={c.id} className="bg-surface-container-lowest p-5 rounded-[24px] editorial-shadow border border-outline-variant/10 relative overflow-hidden group hover:border-primary/20 transition-colors cursor-pointer">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                  
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                      </div>
                      <div>
                        <p className="font-headline text-lg font-medium">{c.trigger_type}</p>
                        <p className="font-body text-[11px] text-on-surface-variant">
                          {new Date(c.created_at).toLocaleString("en-IN", {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className={`px-2 py-1 rounded-md font-label text-[9px] uppercase font-bold tracking-widest block mb-1 w-max ml-auto ${
                         c.status === "SETTLED" ? 'bg-primary-container text-on-primary-container' 
                         : c.status === "TRIGGERED" ? 'bg-amber-100 text-amber-800 animate-pulse' 
                         : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/20'
                       }`}>
                         {c.status}
                       </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-outline-variant/10 flex justify-between items-end">
                    <div>
                      {c.payout_txn_id && (
                        <p className="font-mono text-[9px] text-on-surface-variant/80 uppercase">TXN: {c.payout_txn_id.slice(0,10)}...</p>
                      )}
                    </div>
                    <p className="font-headline text-xl text-primary font-medium">{formatRupees(Number(c.payout_amount))}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-3 pb-8 bg-[#f9f9f7]/80 dark:bg-stone-900/80 backdrop-blur-xl shadow-[0_-4px_30px_rgba(0,0,0,0.06)] rounded-t-[32px] border-t border-outline-variant/10">
        <Link href="/">
          <div className="flex flex-col items-center justify-center text-stone-500 p-2 hover:text-primary transition-colors duration-200 cursor-pointer">
            <span className="material-symbols-outlined mb-1" data-icon="home_app_logo">home_app_logo</span>
            <span className="font-['Manrope'] text-[11px] font-medium uppercase tracking-wider">Home</span>
          </div>
        </Link>
        <Link href="/dashboard">
          <div className="flex flex-col items-center justify-center bg-primary text-on-primary rounded-full px-5 py-2 scale-95 duration-200 cursor-pointer editorial-shadow">
            <span className="material-symbols-outlined mb-1 text-[18px]" data-icon="verified_user">dashboard</span>
            <span className="font-['Manrope'] text-[11px] font-medium uppercase tracking-wider">Dash</span>
          </div>
        </Link>
        <Link href="/payout-success">
          <div className="flex flex-col items-center justify-center text-stone-500 p-2 hover:text-primary transition-colors duration-200 cursor-pointer">
            <span className="material-symbols-outlined mb-1" data-icon="request_quote">request_quote</span>
            <span className="font-['Manrope'] text-[11px] font-medium uppercase tracking-wider">Claims</span>
          </div>
        </Link>
        <Link href="/dashboard">
          <div className="flex flex-col items-center justify-center text-stone-500 p-2 hover:text-primary transition-colors duration-200 cursor-pointer">
            <span className="material-symbols-outlined mb-1" data-icon="account_circle">account_circle</span>
            <span className="font-['Manrope'] text-[11px] font-medium uppercase tracking-wider">Profile</span>
          </div>
        </Link>
      </nav>
    </div>
  );
}
