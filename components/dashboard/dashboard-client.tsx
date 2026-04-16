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
  reason?: string;
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
  const [riderId, setRiderId] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");

  // DevTrails Enhanced Features State
  const [policyActiveToggle, setPolicyActiveToggle] = useState(true);
  const [simRain, setSimRain] = useState(10);
  const [simWind, setSimWind] = useState(15);
  const [simAccRain, setSimAccRain] = useState(20);
  const [simAqi, setSimAqi] = useState(80);
  const [simTemp, setSimTemp] = useState(32);
  const [simCurfew, setSimCurfew] = useState(false);
  const [simCrime, setSimCrime] = useState(1); // 1-10
  const [mockEarnings] = useState({ zomato: 1250, swiggy: 900, zepto: 2100 });
  const [sosLocating, setSosLocating] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const doLogout = useCallback(() => {
    localStorage.removeItem("offshift_worker_id");
    localStorage.removeItem("offshift_worker_name");
    window.location.href = "/";
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("offshift_worker_id");
    const name = localStorage.getItem("offshift_worker_name");
    setWorkerId(id);
    setWorkerName(name ?? "Rider");
  }, []);

  const load = useCallback(async () => {
    if (!workerId) return;

    const { data: worker } = await supabase.from("workers").select("name, rider_id, platform").eq("id", workerId).single();
    if (worker) {
      setWorkerName(worker.name);
      setRiderId(worker.rider_id);
      setPlatform(worker.platform);
      localStorage.setItem("offshift_worker_name", worker.name);
    }

    const { data: pol } = await supabase.from("policies").select("*").eq("worker_id", workerId).order("created_at", { ascending: false });
    setPolicies((pol ?? []) as PolicyRow[]);

    const { data: cl } = await supabase.from("claims").select("*").eq("worker_id", workerId).order("created_at", { ascending: false });
    setClaims((cl ?? []) as ClaimRow[]);
  }, [supabase, workerId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!workerId) return;
    const ch = supabase.channel("claims-live").on("postgres_changes", { event: "*", schema: "public", table: "claims", filter: `worker_id=eq.${workerId}` }, (payload) => {
          toast.message("Claim update", { description: `Status: ${(payload.new as ClaimRow)?.status ?? "updated"}` });
          void load();
    }).subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [supabase, workerId, load]);

  // ScrollSpy Logic
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: [0.1, 0.5, 0.8] });

    const sections = ["home", "policies", "claims", "profile"];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100; // Header offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const active = useMemo(() => policies.find((p) => p.status.toUpperCase() === "ACTIVE"), [policies]);
  const sortedHistory = useMemo(() => {
    const arr = [...policies];
    arr.sort((a, b) => sortKey === "premium_amount" ? Number(b.premium_amount) - Number(a.premium_amount) : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return arr;
  }, [policies, sortKey]);
  const slice = sortedHistory.slice(page * pageSize, page * pageSize + pageSize);
  const coveragePct = active ? Math.min(100, ((Date.now() - new Date(active.coverage_start).getTime()) / (new Date(active.coverage_end).getTime() - new Date(active.coverage_start).getTime())) * 100) : 0;
  const triggersDuring = claims.filter((c) => active && new Date(c.created_at) >= new Date(active.coverage_start) && new Date(c.created_at) <= new Date(active.coverage_end));

  const btnPrimaryStyle = "w-full py-4 rounded-full bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-widest editorial-shadow hover:scale-[1.02] flex items-center justify-center gap-2 transition-all";
  
  const simulateTrigger = async (type: string = "RAIN") => {
    if (!active) return;
    setLoading(true);
    try {
      const res = await fetch("/api/debug/simulate-trigger", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worker_id: workerId, policy_id: active.id }),
      });
      if (res.ok) {
        toast.success(`💥 ${type} incident verified by Oracle. Claim settled instantly!`);
        void load();
      } else {
        const err = await res.json();
        toast.error(`Trigger failed: ${err.error}`);
      }
    } catch { toast.error("Trigger failed"); } finally { setLoading(false); }
  };

  const handleSosTrigger = () => {
    setSosLocating(true);
    toast.info("Capturing emergency location coordinates...", { duration: 1500 });
    setTimeout(() => {
       setSosLocating(false);
       toast.success("Location locked. Firing Instant Emergency Claim API...");
       simulateTrigger("IMPACT");
    }, 2000);
  };

  if (!workerId) return <div className="text-center pt-32">Please login via /onboard</div>;

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen pb-32">
      <header className="fixed top-0 w-full z-50 bg-[#f9f9f7] dark:bg-stone-950 backdrop-blur-md opacity-90 flex justify-between items-center px-6 py-4 border-b border-outline-variant/10">
        <Link href="/">
          <div className="flex items-center gap-3"><h1 className="text-2xl font-semibold tracking-tighter text-primary font-['Newsreader']">OffShift</h1></div>
        </Link>
        <div className="relative">
          <div onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-10 h-10 rounded-full border border-outline-variant/15 flex items-center justify-center overflow-hidden cursor-pointer bg-surface-container-highest">
             <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC95G_7XgTmO5BqUuzbpLEgXc7-4kMwgCwl1NZw8mlK-DYoiUVWMcs8CASgIcEn4bniG4AFJQPWeNnEaea2aFik8TwfLAgBfIYYlBRzLUQ4o6KSF_NIedBXY5gsc2wPRlxD5468OoFmFIWauikoZ8utGhQ5RzulaTjDTz3wVw6E3yv4VoWMS77huuVwTAm0tIBzuqrglIPdMrl_rd4e6eHeCTOGkh98SQ9tAlSWlW5zVJnwhw3GinFy5WantT8l860hX3GbCv0Owww"/>
          </div>
          {isProfileOpen && (
            <div className="absolute right-0 top-12 mt-2 w-48 bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/10 overflow-hidden z-50">
               <button onClick={doLogout} className="w-full px-4 py-3 text-error flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">logout</span> Log Out</button>
            </div>
          )}
        </div>
      </header>

      <main className="pt-28 px-4 sm:px-6 max-w-lg mx-auto space-y-6">
        
        {/* SECTION: HOME */}
        <section id="home" className="space-y-6 scroll-mt-28">
          <div className="mb-2 pl-2">
            <h1 className="font-headline text-4xl mb-1 text-primary">Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-body text-sm text-on-surface-variant">नमस्ते, <strong className="text-on-surface">{workerName}</strong></span>
              <span className="bg-surface-container-high text-primary px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest">{riderId}</span>
            </div>
          </div>


        {/* FEATURE: INSURANCE ON/OFF TOGGLE */}
        {active ? (
          <div className={`p-7 rounded-[32px] editorial-shadow relative overflow-hidden transition-colors duration-500 ${policyActiveToggle ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant border border-outline-variant/20'}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-headline text-2xl font-medium">{policyActiveToggle ? "Active Policy" : "Policy Suspended"}</h3>
                <p className="font-body text-xs opacity-70 mt-1">Usage-Based Insurance</p>
              </div>
              <div className="flex items-center gap-2">
                 <span className={`px-3 py-1 rounded-full font-label text-[10px] uppercase font-bold tracking-widest ${policyActiveToggle ? 'bg-[#cbebc8] text-[#07200b]' : 'bg-surface-container-highest text-on-surface'}`}>
                   {policyActiveToggle ? "LIVE" : "PAUSED"}
                 </span>
                 <div onClick={() => setPolicyActiveToggle(!policyActiveToggle)} className={`w-12 h-6 rounded-full cursor-pointer flex items-center px-1 transition-all duration-300 ${policyActiveToggle ? 'bg-[#cbebc8]' : 'bg-outline-variant'}`}>
                   <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300 ${policyActiveToggle ? 'translate-x-6' : 'translate-x-0'}`}></div>
                 </div>
              </div>
            </div>

            <p className="text-xs mb-6 opacity-80 leading-relaxed">
              {policyActiveToggle 
                ? "Your gig insurance is actively monitoring risk triggers. You are protected for income loss in your zone." 
                : "Coverage paused. You are not billed per hour while inactive. Turn on to resume protection."}
            </p>

            <div className={`font-headline text-3xl mb-6 ${policyActiveToggle ? 'text-[#cbebc8]' : 'text-on-surface-variant'}`}>
              Max Payout: {formatRupees(Number(active.max_payout))}
            </div>

            {policyActiveToggle && (
              <button onClick={() => simulateTrigger()} disabled={loading} className="w-full py-3 rounded-xl border border-primary/20 bg-primary/10 text-[#cbebc8] font-label text-xs uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px] animate-bounce">thunderstorm</span> Demo Payout
              </button>
            )}
          </div>
        ) : (
          <div className="bg-surface-container-lowest p-8 rounded-[32px] text-center border border-outline-variant/10"><h3 className="font-headline text-xl">No active policies</h3></div>
        )}

        {/* SECTION: POLICIES */}
        <section id="policies" className="space-y-6 scroll-mt-28">
          {/* FEATURE: EMERGENCY SOS BUTTON */}
          <div className="bg-[#fff1f0] dark:bg-[#3b1c1c] border border-error/20 p-6 rounded-[32px] editorial-shadow text-center">
             <h3 className="font-headline text-2xl text-error mb-2 flex items-center justify-center gap-2"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span> Critical Incident SOS</h3>
             <p className="font-body text-xs text-error/80 mb-5 max-w-[250px] mx-auto">Uploads coordinates, alerts contacts, and dispatches automated claim request parameters to the Rule Engine instantly.</p>
             <button onClick={handleSosTrigger} disabled={sosLocating || !active} className="w-full py-4 bg-error text-on-error rounded-full font-label font-bold text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(186,26,26,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-2 disabled:opacity-50">
               {sosLocating ? <span className="material-symbols-outlined animate-spin text-[16px]">sync</span> : <span className="material-symbols-outlined text-[18px]">satellite_alt</span>}
               {sosLocating ? "Locating..." : "Emergency Claim API"}
             </button>
          </div>


        {/* FEATURE: MULTI-GIG AGGREGATOR */}
        <div className="bg-surface-container-lowest p-6 rounded-[32px] editorial-shadow border border-outline-variant/10">
          <h3 className="font-headline text-xl font-medium mb-1">Earning-Linked Coverage</h3>
          <p className="font-label text-[10px] uppercase tracking-widest text-secondary mb-5">Multi-Platform Aggregator</p>
          
          <div className="flex gap-2 mb-4">
            <div className="flex-1 bg-[#E23744]/10 p-3 rounded-2xl flex flex-col items-center">
               <span className="text-xl mb-1">🍽️</span><span className="font-bold text-[#E23744] text-xs">₹{mockEarnings.zomato}</span>
            </div>
            <div className="flex-1 bg-[#FC8019]/10 p-3 rounded-2xl flex flex-col items-center">
               <span className="text-xl mb-1">🛵</span><span className="font-bold text-[#FC8019] text-xs">₹{mockEarnings.swiggy}</span>
            </div>
            <div className="flex-1 bg-[#ff00a5]/10 p-3 rounded-2xl flex flex-col items-center">
               <span className="text-xl mb-1">⚡</span><span className="font-bold text-[#ff00a5] text-xs">₹{mockEarnings.zepto}</span>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant text-center border-t border-outline-variant/10 pt-3">
             Projected 7-day liability dynamically adjusted to current <strong>₹{mockEarnings.zomato + mockEarnings.swiggy + mockEarnings.zepto}</strong> average income volume.
          </p>
        </div>

        {/* FEATURE: DYNAMIC RISK SIMULATOR */}
        <div className="bg-surface text-on-surface border border-outline-variant/20 p-6 rounded-[32px] editorial-shadow">
          <div className="flex items-center gap-2 mb-2">
             <span className="material-symbols-outlined text-secondary">tune</span>
             <h3 className="font-headline text-xl text-primary font-medium">Risk-Based Pricing Engine</h3>
          </div>
          <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-6">Interactive Rule Engine Simulation</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
             <div>
               <div className="flex justify-between text-[10px] mb-2"><span className="font-bold text-on-surface uppercase tracking-tight">Rain (mm/hr)</span><span className="font-mono text-secondary">{simRain} mm</span></div>
               <input type="range" min="0" max="100" value={simRain} onChange={(e)=>setSimRain(Number(e.target.value))} className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" />
             </div>
             <div>
               <div className="flex justify-between text-[10px] mb-2"><span className="font-bold text-on-surface uppercase tracking-tight">Wind (Storm km/h)</span><span className="font-mono text-secondary">{simWind} km/h</span></div>
               <input type="range" min="0" max="120" value={simWind} onChange={(e)=>setSimWind(Number(e.target.value))} className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" />
             </div>
             <div>
               <div className="flex justify-between text-[10px] mb-2"><span className="font-bold text-on-surface uppercase tracking-tight">Flood (Acc. 72h)</span><span className="font-mono text-secondary">{simAccRain} mm</span></div>
               <input type="range" min="0" max="300" value={simAccRain} onChange={(e)=>setSimAccRain(Number(e.target.value))} className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" />
             </div>
             <div>
               <div className="flex justify-between text-[10px] mb-2"><span className="font-bold text-on-surface uppercase tracking-tight">AQI Level</span><span className="font-mono text-secondary">{simAqi} AQI</span></div>
               <input type="range" min="0" max="500" value={simAqi} onChange={(e)=>setSimAqi(Number(e.target.value))} className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" />
             </div>
             <div>
               <div className="flex justify-between text-[10px] mb-2"><span className="font-bold text-on-surface uppercase tracking-tight">Heat (°C)</span><span className="font-mono text-secondary">{simTemp}°C</span></div>
               <input type="range" min="20" max="52" value={simTemp} onChange={(e)=>setSimTemp(Number(e.target.value))} className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" />
             </div>
             <div>
               <div className="flex justify-between text-[10px] mb-2"><span className="font-bold text-on-surface uppercase tracking-tight">Zone Risk</span><span className="font-mono text-secondary">Lvl {simCrime}</span></div>
               <input type="range" min="1" max="10" value={simCrime} onChange={(e)=>setSimCrime(Number(e.target.value))} className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" />
             </div>
          </div>
        </section>

        {/* SECTION: CLAIMS */}
        <section id="claims" className="space-y-6 scroll-mt-28">
          <div className="mt-6 pt-6 border-t border-outline-variant/10 flex justify-between items-center px-2">
            <div>
              <span className="font-bold text-xs text-on-surface">Civic Curfew (Sec 144)</span>
              <p className="text-[10px] text-on-surface-variant italic">Simulate social disruption risk</p>
            </div>
            <div onClick={() => setSimCurfew(!simCurfew)} className={`w-10 h-5 rounded-full cursor-pointer flex items-center px-1 transition-all duration-300 ${simCurfew ? 'bg-error' : 'bg-outline-variant'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-all duration-300 ${simCurfew ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
          </div>


          <div className="mt-8 bg-surface-container-lowest p-4 rounded-2xl flex justify-between items-center text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Simulated Premium</p>
              <p className="font-headline text-3xl font-bold text-on-surface">₹{Math.floor(
                19 + 
                (simRain > 25 ? 15 : 0) + 
                (simWind > 50 ? 20 : 0) + 
                (simAccRain > 150 ? 40 : 0) + 
                (simAqi > 300 ? 12 : 0) + 
                (simTemp > 44 ? 10 : 0) + 
                (simCurfew ? 30 : 0) + 
                (simCrime * 2.5)
              )}</p>
            </div>
            <div className="w-px h-10 bg-outline-variant/20 mx-2"></div>
            <div>
              <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Probability</p>
              <p className="text-secondary font-bold text-lg">{Math.min(99, Math.floor(
                (simRain * 0.4) + 
                (simWind * 0.3) + 
                (simAccRain * 0.2) + 
                (simAqi * 0.1) + 
                (simCurfew ? 25 : 0) + 
                (simCrime * 5)
              ))}% Risk</p>
            </div>

          </div>
        </div>

        {/* FEATURE: LIVE CLAIMS & AI FRAUD DETECTION */}
        <div className="pt-4 pb-20">
          <div className="mb-4 pl-2"><h3 className="font-headline text-2xl font-medium">Claim Analytics Hub</h3></div>
          <div className="space-y-3">
            {claims.map((c) => (
                <div key={c.id} className="bg-surface-container-lowest p-5 rounded-[24px] editorial-shadow border border-outline-variant/10">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary"><span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span></div>
                      <div>
                        <p className="font-headline text-lg font-medium">{c.trigger_type}</p>
                        <p className="font-body text-[11px] text-on-surface-variant">{new Date(c.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className="bg-primary-container text-on-primary-container px-2 py-1 rounded-[6px] font-label text-[9px] uppercase font-bold tracking-widest">{c.status}</span>
                  </div>
                  
                  {/* AI Fraud Badge */}
                  <div className="mt-3 bg-surface-container p-3 rounded-xl border border-outline-variant/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="flex items-center gap-1 font-label text-[10px] text-primary uppercase font-bold tracking-widest"><span className="material-symbols-outlined text-[12px]">auto_awesome</span> AI Assessment Engine</span>
                      <span className="text-[10px] font-mono text-[#E23744]">FRD: ~1.{Math.floor(Math.random() * 9)}%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest rounded-full h-1 mt-1 overflow-hidden">
                       <div className="bg-[#cbebc8] h-1 w-[98%]"></div>
                    </div>
                    <p className="font-body text-[10px] text-on-surface-variant mt-2 italic">Vision/Oracles detected true occurrence. Telemetry verified. Proceeding for auto-settlement.</p>
                  </div>
                </div>
            ))}
          </div>
        </div>
        </section>

        {/* SECTION: PROFILE */}
        <section id="profile" className="pt-10 pb-40 scroll-mt-28">
           <div className="bg-surface-container-low p-8 rounded-[40px] text-center border border-outline-variant/10">
              <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden border-4 border-primary">
                 <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC95G_7XgTmO5BqUuzbpLEgXc7-4kMwgCwl1NZw8mlK-DYoiUVWMcs8CASgIcEn4bniG4AFJQPWeNnEaea2aFik8TwfLAgBfIYYlBRzLUQ4o6KSF_NIedBXY5gsc2wPRlxD5468OoFmFIWauikoZ8utGhQ5RzulaTjDTz3wVw6E3yv4VoWMS77huuVwTAm0tIBzuqrglIPdMrl_rd4e6eHeCTOGkh98SQ9tAlSWlW5zVJnwhw3GinFy5WantT8l860hX3GbCv0Owww"/>
              </div>
              <h3 className="font-headline text-3xl text-primary">{workerName}</h3>
              <p className="text-secondary font-label text-xs uppercase tracking-widest mb-8 mt-2">Verified Professional • {platform}</p>
              
              <div className="grid grid-cols-2 gap-4 text-left">
                 <div className="bg-surface p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase">Rider Identity</p>
                    <p className="font-headline text-lg text-primary">{riderId}</p>
                 </div>
                 <div className="bg-surface p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase">Settlement</p>
                    <p className="font-headline text-lg text-primary">UPI/Razorpay</p>
                 </div>
              </div>
              <button onClick={doLogout} className="mt-8 w-full py-4 rounded-full border border-error/20 text-error font-label text-xs uppercase font-bold tracking-widest hover:bg-error/5 transition-colors">
                Terminate Shield Session
              </button>
           </div>
        </section>


      </main>

      {/* Floating Bot Button */}
      <Link href="/debug/bot" className="fixed bottom-[110px] right-6 z-50 group">
        <div className="bg-primary text-on-primary w-14 h-14 rounded-[18px] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 relative">
          <span className="material-symbols-outlined text-3xl">record_voice_over</span>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full animate-ping"></div>
          <div className="absolute right-full mr-3 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Voice Agent (Hindi)</div>
        </div>
      </Link>

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-4 pt-3 pb-8 bg-surface/90 dark:bg-stone-950/90 backdrop-blur-2xl border-t border-outline-variant/10 rounded-t-[32px] sm:max-w-lg sm:left-1/2 sm:-translate-x-1/2">
        {[
          { id: "home", label: "HOME", icon: "home_app_logo" },
          { id: "policies", label: "POLICIES", icon: "shield_with_heart" },
          { id: "claims", label: "CLAIMS", icon: "request_quote" },
          { id: "profile", label: "PROFILE", icon: "person" }
        ].map((item) => (
          <div 
            key={item.id} 
            onClick={() => scrollTo(item.id)}
            className={`flex flex-col items-center justify-center p-2 cursor-pointer transition-all duration-300 relative ${activeSection === item.id ? 'text-on-primary' : 'text-on-surface-variant'}`}
          >
            {activeSection === item.id && (
              <div className="absolute inset-0 bg-primary rounded-[18px] -z-10 animate-in fade-in zoom-in duration-300 editorial-shadow"></div>
            )}
            <span className={`material-symbols-outlined mb-1 text-[22px] transition-transform duration-300 ${activeSection === item.id ? 'scale-110' : 'scale-100 opacity-60'}`}>
              {item.icon}
            </span>
            <span className={`text-[8px] font-bold tracking-widest transition-opacity duration-300 ${activeSection === item.id ? 'opacity-100' : 'opacity-40'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </nav>
    </div>
  );
}
