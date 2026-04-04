"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { riskBand, type ShiftType } from "@/lib/kavach-engine";
import { formatRupees } from "@/lib/format";
import { ZONE_STATES, type ZoneSlug } from "@/lib/zones";

type PremiumRes = {
  final_premium: number;
  kavach_score: number;
  max_payout: number;
  explanation_hindi: string;
};

const SHIFTS: { value: ShiftType; label: string; hi: string }[] = [
  { value: "morning", label: "Morning 6am–2pm", hi: "सुबह 6–2" },
  { value: "evening", label: "Evening 2pm–10pm", hi: "शाम 2–10" },
  { value: "night", label: "Night 10pm–6am", hi: "रात 10–6" },
  { value: "flexible", label: "Flexible", hi: "लचीला" },
];

type PaymentPhase =
  | "idle"
  | "upi_checkout"
  | "processing"
  | "verifying"
  | "done";
type AuthMode = "choose" | "login" | "signup";

export function OnboardingWizard() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>("choose");
  const [screen, setScreen] = useState(0); // 0 = auth chooser/login, 1-4 = signup flow
  const [loading, setLoading] = useState(false);

  // Check if already logged in to skip auth screens
  useEffect(() => {
    const id = localStorage.getItem("offshift_worker_id");
    const uname = localStorage.getItem("offshift_worker_name");
    if (id && screen === 0) {
      if (uname) setName(uname);
      setScreen(2); // Skip directly to Work Zone selection for renewals
    }
  }, [screen]);

  // Login fields
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign-up fields — Screen 1
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [platform, setPlatform] = useState<"zomato" | "swiggy" | "zepto">("zomato");
  const [riderId, setRiderId] = useState("");

  // Screen 2 — Work Zone
  const [zone, setZone] = useState<ZoneSlug>("mumbai");
  const [shift, setShift] = useState<ShiftType>("evening");
  const [days, setDays] = useState([5]);

  // Screen 3 — Kavach Score
  const [calcLoading, setCalcLoading] = useState(false);
  const [premium, setPremium] = useState<PremiumRes | null>(null);

  // Screen 4 — Plan & Payment
  const [selectedPlan, setSelectedPlan] = useState<"24hr" | "7day">("24hr");
  const [payPhase, setPayPhase] = useState<PaymentPhase>("idle");
  const [mockTxnId, setMockTxnId] = useState("");
  const [policyCard, setPolicyCard] = useState<{
    id: string;
    coverage_start: string;
    coverage_end: string;
    plan_type: string;
    max_payout: number;
  } | null>(null);

  // ── Login handler ──
  const handleLogin = async () => {
    const n = loginPhone.replace(/\D/g, "");
    if (n.length < 10) {
      toast.error("10-digit mobile number चाहिए");
      return;
    }
    if (!loginPassword) {
      toast.error("Password ज़रूरी है");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: n, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Login failed");
        return;
      }
      localStorage.setItem("offshift_worker_id", data.worker.id);
      localStorage.setItem("offshift_worker_name", data.worker.name);
      toast.success(`स्वागत है, ${data.worker.name}! Welcome back!`);
      router.push("/dashboard");
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  };

  // ── Screen 1: Sign Up handler ──
  const handleSignup = () => {
    const n = phone.replace(/\D/g, "");
    if (n.length < 10) {
      toast.error("Valid 10-digit mobile number चाहिए");
      return;
    }
    if (name.trim().length < 2) {
      toast.error("Name is required / नाम ज़रूरी है");
      return;
    }
    if (password.length < 4) {
      toast.error("Password at least 4 characters / पासवर्ड कम से कम 4 अक्षर");
      return;
    }
    const prefix =
      platform === "zomato" ? "ZO" : platform === "swiggy" ? "SG" : "ZP";
    if (!/^(ZO|SG|ZP)-[A-Z0-9]{4,}$/i.test(riderId)) {
      toast.error(`Rider ID format: ${prefix}-XXXXX`);
      return;
    }
    toast.success("✅ आगे बढ़ रहे हैं!");
    setScreen(2);
  };

  // ── Screen 3: Kavach Score calc ──
  useEffect(() => {
    if (screen !== 3) return;
    let cancelled = false;
    (async () => {
      setCalcLoading(true);
      setPremium(null);
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const res = await fetch("/api/calculate-premium", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            zone,
            shift_type: shift,
            active_days: days[0],
            platform,
            coverage_type: "7day",
          }),
        });
        const data = (await res.json()) as PremiumRes & { error?: string };
        if (!res.ok) throw new Error(data.error ?? "calc failed");
        if (!cancelled) setPremium(data);
      } catch (e) {
        if (!cancelled) toast.error(String(e));
      } finally {
        if (!cancelled) setCalcLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [screen, zone, shift, days, platform]);

  // ── Load Razorpay script ──
  useEffect(() => {
    if (document.getElementById("razorpay-script")) return;
    const s = document.createElement("script");
    s.id = "razorpay-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  // ── Screen 4: Razorpay Checkout + Policy Creation ──
  const handlePayment = async (plan: "24hr" | "7day") => {
    if (!premium) return;

    const amount = plan === "24hr"
      ? Math.round(premium.final_premium * 0.6)
      : premium.final_premium;
    const amountPaise = amount * 100;

    setPayPhase("processing");
    let workerId = localStorage.getItem("offshift_worker_id");
    
    if (!workerId) {
      try {
        const regRes = await fetch("/api/workers/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            platform,
            rider_id: riderId.toUpperCase(),
            zone,
            shift_type: shift,
            active_days_per_week: days[0],
            kavach_score: premium.kavach_score,
            phone: `+91${phone.replace(/\D/g, "").slice(-10)}`,
            password,
          }),
        });
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(regData.error ?? "Registration failed");
        workerId = regData.worker_id;
        localStorage.setItem("offshift_worker_id", workerId!);
        localStorage.setItem("offshift_worker_name", name);
      } catch (e) {
        toast.error(String(e));
        setPayPhase("idle");
        return;
      }
    }

    setPayPhase("idle");

    const Razorpay = (window as unknown as { Razorpay?: new (opts: Record<string, unknown>) => { open: () => void } }).Razorpay;
    if (!Razorpay) {
      toast.error("Razorpay not loaded — please refresh");
      return;
    }

    const rzp = new Razorpay({
      key: "rzp_test_SZ6NW9Iw3MPiaL",
      amount: amountPaise,
      currency: "INR",
      name: "OffShift — Kavach",
      description: plan === "24hr" ? "Aaj Ka Kavach (24hr)" : "Hafte Ka Kavach (7 days)",
      image: "https://api.dicebear.com/9.x/shapes/svg?seed=offshift",
      prefill: {
        name: name || localStorage.getItem("offshift_worker_name") || "Rider",
        contact: phone ? `+91${phone.replace(/\D/g, "").slice(-10)}` : "",
      },
      theme: { color: "#273528" },
      handler: async (response: { razorpay_payment_id: string }) => {
        setPayPhase("verifying");
        setMockTxnId(response.razorpay_payment_id);
        try {
          const polRes = await fetch("/api/payments/activate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              worker_id: workerId,
              plan_type: plan,
              zone,
              shift_type: shift,
              active_days: days[0],
              platform,
              razorpay_payment_id: response.razorpay_payment_id,
            }),
          });
          const polData = await polRes.json();
          if (!polRes.ok) throw new Error(polData.error ?? "Policy creation failed");

          setPayPhase("done");
          setPolicyCard(polData.policy);
          toast.success("🛡️ Payment successful! Policy activated!");
        } catch (e) {
          toast.error(String(e));
          setPayPhase("idle");
        }
      },
      modal: {
        ondismiss: () => {
          toast.error("Payment cancelled / भुगतान रद्द");
          setPayPhase("idle");
        },
      },
    });

    rzp.open();
  };

  const band = premium ? riskBand(premium.kavach_score) : null;
  const prefix = platform === "zomato" ? "ZO" : platform === "swiggy" ? "SG" : "ZP";

  // Reusable Input style
  const inputStyle = "w-full h-14 bg-surface-container-low rounded-xl px-4 text-on-surface font-body text-sm focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/15 transition-all outline-none border-none";
  const btnPrimaryStyle = "w-full py-4 rounded-full bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-widest editorial-shadow hover:scale-[1.02] transition-transform duration-300 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2";
  const btnSecondaryStyle = "w-full py-4 rounded-full bg-surface-container-highest text-on-surface font-label text-xs font-bold uppercase tracking-widest hover:bg-surface-container transition-colors duration-300";

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed min-h-screen">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#f9f9f7] dark:bg-stone-950 backdrop-blur-md opacity-90 flex justify-between items-center px-6 py-4 border-b border-outline-variant/10">
        <Link href="/">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary hover:opacity-70 transition-opacity duration-300 ease-in-out cursor-pointer" data-icon="menu">arrow_back</span>
            <h1 className="text-2xl font-semibold tracking-tighter text-primary font-['Newsreader']">OffShift</h1>
          </div>
        </Link>
        {screen > 0 && screen < 4 && (
          <div className="flex items-center justify-center font-label text-[10px] uppercase tracking-widest bg-surface-container-low px-4 py-2 rounded-full text-secondary">
            Step {Math.min(screen, 4)} of 4
          </div>
        )}
      </header>

      <main className="pt-28 pb-12 px-6">
        <div className="mx-auto max-w-md">

          {/* ═══════════════ AUTH CHOOSER (SCREEN 0) ═══════════════ */}
          {screen === 0 && authMode === "choose" && (
            <div className="bg-surface-container-lowest p-8 rounded-[40px] editorial-shadow border border-outline-variant/10 relative overflow-hidden">
              <div className="mb-10 text-center relative z-10">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-container editorial-shadow">
                  <span className="material-symbols-outlined text-4xl text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>gpp_good</span>
                </div>
                <h2 className="font-headline text-4xl font-medium mb-3 text-on-surface">Kavach</h2>
                <p className="font-body text-sm text-on-surface-variant max-w-[200px] mx-auto">
                  Smart Income Shield for Delivery Riders
                </p>
                <p className="font-label text-[10px] mt-3 uppercase tracking-widest text-secondary">
                  डिलीवरी राइडर्स के लिए आय सुरक्षा
                </p>
              </div>
              <div className="space-y-4 relative z-10">
                <button
                  className={btnPrimaryStyle}
                  onClick={() => {
                    setAuthMode("signup");
                    setScreen(1);
                  }}
                >
                  नया खाता / Sign Up
                </button>
                <button
                  className={btnSecondaryStyle}
                  onClick={() => setAuthMode("login")}
                >
                  लॉगिन / Login
                </button>
                <p className="text-center text-[10px] font-label uppercase tracking-widest text-on-surface-variant/70 mt-6">
                  No claim forms · Auto payouts · Zero paperwork
                </p>
              </div>
            </div>
          )}

          {/* ═══════════════ LOGIN (SCREEN 0) ═══════════════ */}
          {screen === 0 && authMode === "login" && (
            <div className="bg-surface-container-lowest p-8 rounded-[40px] editorial-shadow border border-outline-variant/10">
              <div className="mb-10 text-center">
                <h2 className="font-headline text-4xl font-medium mb-3">Welcome Back</h2>
                <p className="font-body text-sm text-on-surface-variant">अपने नंबर और पासवर्ड से लॉगिन करें</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Mobile number / मोबाइल नंबर</label>
                  <div className="flex gap-2 w-full">
                    <span className="flex h-14 w-16 items-center justify-center rounded-xl bg-surface-container-low text-sm font-semibold">
                      +91
                    </span>
                    <input
                      className={inputStyle}
                      inputMode="numeric"
                      placeholder="9876543210"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Password / पासवर्ड</label>
                  <input
                    className={inputStyle}
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void handleLogin()}
                  />
                </div>
                
                <div className="pt-4 space-y-6">
                  <button
                    className={btnPrimaryStyle}
                    onClick={() => void handleLogin()}
                    disabled={loading}
                  >
                    {loading ? "Logging in…" : "लॉगिन करें / Login"}
                  </button>
                  <p className="text-center text-xs font-body text-on-surface-variant">
                    खाता नहीं है?{" "}
                    <button
                      type="button"
                      className="font-bold underline text-primary underline-offset-4"
                      onClick={() => {
                        setAuthMode("signup");
                        setScreen(1);
                      }}
                    >
                      Sign Up करें
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ SCREEN 1: Identity (Sign Up) ═══════════════ */}
          {screen === 1 && (
            <div className="bg-surface-container-lowest p-8 rounded-[40px] editorial-shadow border border-outline-variant/10">
              <div className="mb-10 text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-2xl">electric_moped</span>
                </div>
                <h2 className="font-headline text-4xl font-medium mb-3">Identity</h2>
                <p className="font-body text-sm text-on-surface-variant">WhatsApp जैसा सरल फॉर्म — बैंक नहीं</p>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Full name / पूरा नाम</label>
                  <input
                    className={inputStyle}
                    placeholder="Rahul Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Mobile number / मोबाइल नंबर</label>
                  <div className="flex gap-2 w-full">
                    <span className="flex h-14 w-16 items-center justify-center rounded-xl bg-surface-container-low text-sm font-semibold">
                      +91
                    </span>
                    <input
                      className={inputStyle}
                      inputMode="numeric"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Create Password / पासवर्ड बनाएं</label>
                  <input
                    className={inputStyle}
                    type="password"
                    placeholder="कम से कम 4 अक्षर"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-col gap-3">
                  <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Platform / प्लेटफ़ॉर्म</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["zomato", "swiggy", "zepto"].map((plat) => (
                      <button
                        key={plat}
                        type="button"
                        onClick={() => setPlatform(plat as "zomato" | "swiggy" | "zepto")}
                        className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-4 transition-all ${
                          platform === plat
                            ? "bg-primary text-on-primary shadow-lg scale-[1.02]"
                            : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                        }`}
                      >
                        <span className="text-2xl">{plat === "zomato" ? "🍽️" : plat === "swiggy" ? "🛵" : "⚡"}</span>
                        <span className="font-label text-xs font-bold uppercase tracking-wider">
                          {plat}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Rider ID</label>
                  <input
                    className={inputStyle + " font-mono uppercase"}
                    placeholder={`${prefix}-12345`}
                    value={riderId}
                    onChange={(e) => setRiderId(e.target.value)}
                  />
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest pl-2">जैसे {prefix}-12345</p>
                </div>

                <div className="pt-6 space-y-6">
                  <button
                    className={btnPrimaryStyle}
                    disabled={loading}
                    onClick={handleSignup}
                  >
                    आगे बढ़ें / Continue <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                  <p className="text-center text-xs font-body text-on-surface-variant">
                    पहले से खाता है?{" "}
                    <button
                      type="button"
                      className="font-bold underline text-primary underline-offset-4"
                      onClick={() => {
                        setAuthMode("login");
                        setScreen(0);
                      }}
                    >
                      Login करें
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ SCREEN 2: Work Zone ═══════════════ */}
          {screen === 2 && (
             <div className="bg-surface-container-lowest p-8 rounded-[40px] editorial-shadow border border-outline-variant/10">
                <div className="mb-10 text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
                  </div>
                  <h2 className="font-headline text-4xl font-medium mb-3">Work Zone</h2>
                  <p className="font-body text-sm text-on-surface-variant">All-India Coverage — Localized IMD data</p>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <div>
                      <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant block">Location (State & City)</label>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">स्थान (राज्य और शहर)</span>
                    </div>
                    <select
                      className={inputStyle + " appearance-none cursor-pointer text-base"}
                      value={zone}
                      onChange={(e) => setZone(e.target.value as ZoneSlug)}
                    >
                      {ZONE_STATES.map((st) => (
                        <optgroup key={st.state} label={st.state} className="font-bold text-on-surface-variant">
                          {st.cities.map((z) => (
                            <option key={z.value} value={z.value} className="font-normal text-on-surface">
                              {z.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant block">Typical shift / आम शिफ्ट</label>
                    <select
                      className={inputStyle + " appearance-none cursor-pointer"}
                      value={shift}
                      onChange={(e) => setShift(e.target.value as ShiftType)}
                    >
                      {SHIFTS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label} — {s.hi}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 pb-4">
                    <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant block text-center mb-6">Days active per week</label>
                    <div className="px-4">
                      <Slider
                        value={days}
                        onValueChange={setDays}
                        min={1}
                        max={7}
                        step={1}
                        className="mb-8"
                      />
                      <div className="flex justify-center items-end gap-1">
                        <span className="font-headline text-5xl font-medium text-primary">{days[0]}</span>
                        <span className="font-body text-lg text-on-surface-variant pb-1">दिन</span>
                      </div>
                    </div>
                    {days[0] < 5 && (
                      <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs font-body text-center flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        {"<"} 5 days active → higher premium bracket
                      </div>
                    )}
                  </div>

                  <button
                    className={btnPrimaryStyle}
                    onClick={() => setScreen(3)}
                  >
                    Calculate Kavach Score <span className="material-symbols-outlined text-[16px]">analytics</span>
                  </button>
                </div>
             </div>
          )}

          {/* ═══════════════ SCREEN 3: Kavach Score ═══════════════ */}
          {screen === 3 && (
            <div className="bg-surface-container-lowest p-8 rounded-[40px] editorial-shadow border border-outline-variant/10 text-center min-h-[500px] flex flex-col justify-center relative overflow-hidden">
              {calcLoading ? (
                <div className="space-y-6 flex flex-col items-center z-10 w-full animate-fade-in">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <h2 className="font-headline text-3xl font-medium">Analyzing Risk...</h2>
                  <p className="font-body text-sm text-on-surface-variant max-w-[200px] mx-auto">
                    Zone risk + shift pattern + weather forecast + AQI
                  </p>
                </div>
              ) : premium && band ? (
                <div className="space-y-8 relative z-10 animate-fade-in flex flex-col h-full">
                  <div>
                    <p className="font-label text-[10px] tracking-[0.2em] uppercase text-secondary mb-2">Actuarial Assessment</p>
                    <h2 className="font-headline text-[80px] font-medium text-primary leading-none tracking-tighter">
                      {premium.kavach_score}
                    </h2>
                    <p className="font-label text-xs tracking-widest uppercase text-on-surface-variant mt-2">Kavach Score</p>
                  </div>

                  <div className="flex justify-center">
                    <span className={`px-4 py-2 rounded-full font-label text-xs font-bold uppercase tracking-widest ${
                      band.color === "green"
                        ? "bg-[#cbebc8] text-[#07200b]"
                        : band.color === "yellow"
                          ? "bg-[#fde293] text-[#221b00]"
                          : "bg-error-container text-on-error-container"
                    }`}>
                      {band.label} RISK
                    </span>
                  </div>

                  <p className="font-body text-lg text-on-surface-variant italic leading-relaxed px-2">
                    "{premium.explanation_hindi}"
                  </p>

                  <div className="mt-auto bg-surface-container-low rounded-2xl p-5 text-left border border-outline-variant/20">
                     <p className="font-label text-[10px] uppercase tracking-widest text-secondary mb-2">Parameters</p>
                     <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2 mb-2">
                        <span className="font-body text-sm text-on-surface-variant">Base Daily Ref</span>
                        <span className="font-body text-sm font-bold text-on-surface">{formatRupees(band.dayRef)}/day</span>
                     </div>
                     <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2 mb-2">
                        <span className="font-body text-sm text-on-surface-variant">Base Weekly Ref</span>
                        <span className="font-body text-sm font-bold text-on-surface">{formatRupees(band.weekRef)}/week</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="font-body text-sm text-on-surface-variant">Coverage Max</span>
                        <span className="font-label text-xs font-bold bg-primary-container text-on-primary-container px-2 py-1 rounded-md">{formatRupees(premium.max_payout)}</span>
                     </div>
                  </div>

                  <button
                    className={btnPrimaryStyle + " mt-4"}
                    onClick={() => setScreen(4)}
                  >
                    View Pricing Plans <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* ═══════════════ SCREEN 4: Plan + Payment ═══════════════ */}
          {screen === 4 && (premium || policyCard) && (
            <div className="animate-fade-in relative">
              {/* Payment Processing Modal Overlay */}
              {payPhase !== "idle" && payPhase !== "done" && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface/80 backdrop-blur-md px-6">
                  <div className="w-full max-w-sm rounded-[32px] bg-surface-container-lowest p-8 editorial-shadow border border-outline-variant/10 flex flex-col items-center text-center">
                    {payPhase === "processing" ? (
                      <>
                        <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-6"></div>
                        <h3 className="font-headline text-2xl font-medium mb-2">Registering Data...</h3>
                        <p className="font-body text-sm text-on-surface-variant">
                          खाता बना रहे हैं / Creating your account…
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-[#cbebc8] rounded-full flex items-center justify-center mb-6">
                          <span className="material-symbols-outlined text-[#07200b] text-3xl">lock</span>
                        </div>
                        <h3 className="font-headline text-2xl font-medium mb-2">Activating Policy</h3>
                        <p className="font-body text-sm text-on-surface-variant mb-4">
                          पॉलिसी जनरेट की जा रही है
                        </p>
                        <div className="bg-surface-container-low px-4 py-2 rounded-lg font-mono text-xs text-on-surface-variant">
                          Txn: {mockTxnId.slice(0, 12)}...
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {policyCard ? (
                /* Post-Payment Policy Confirmation */
                <div className="bg-primary p-8 rounded-[32px] editorial-shadow text-on-primary relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      <span className="bg-[#cbebc8] text-[#07200b] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">verified</span> Active
                      </span>
                    </div>
                    <div className="mb-8">
                       <h3 className="font-headline text-3xl font-medium mt-4 mb-2">Policy Activated!</h3>
                       <p className="font-body text-sm text-on-primary/70">
                         Zero-touch auto-pay enabled.
                       </p>
                    </div>
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center border-b border-on-primary/10 pb-3">
                         <span className="font-label text-xs uppercase tracking-widest text-on-primary/70">Plan Type</span>
                         <span className="font-body font-semibold text-sm">
                            {policyCard.plan_type === "24hr" ? "Aaj Ka Kavach" : "Weekly Pass"}
                         </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-on-primary/10 pb-3">
                         <span className="font-label text-xs uppercase tracking-widest text-on-primary/70">Coverage</span>
                         <span className="font-body text-xs text-right max-w-[150px]">
                            {new Date(policyCard.coverage_start).toLocaleString("en-IN", {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})} <br/>to<br/> {new Date(policyCard.coverage_end).toLocaleString("en-IN", {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                         </span>
                      </div>
                      <div className="flex justify-between items-center pb-2">
                         <span className="font-label text-xs uppercase tracking-widest text-on-primary/70">Max Payout</span>
                         <span className="font-headline text-xl text-[#cbebc8]">{formatRupees(policyCard.max_payout)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-surface-container-lowest/10 p-5 rounded-2xl mb-8 border border-surface-container-lowest/20">
                       <p className="font-label text-xs font-bold uppercase tracking-widest text-[#cbebc8] mb-3">How it works</p>
                       <ul className="space-y-2 font-body text-sm text-on-primary/90">
                         <li className="flex items-start gap-2"><span className="opacity-50">1.</span> Auto-detects AQI, Rain, or App Outage.</li>
                         <li className="flex items-start gap-2"><span className="opacity-50">2.</span> Validates Zone + Shift.</li>
                         <li className="flex items-start gap-2"><span className="opacity-50">3.</span> Cash sent instantly to wallet.</li>
                       </ul>
                    </div>

                    <Link href="/dashboard">
                      <button className="w-full py-4 rounded-full bg-surface-container-lowest text-primary font-label text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform duration-300">
                        Go to Dashboard
                      </button>
                    </Link>
                </div>
              ) : (
                /* Plan Selection (Styled like the Homepage) */
                <div className="space-y-8">
                  <div className="text-center mb-6">
                    <h2 className="font-headline text-4xl mb-2">Choose your rhythm</h2>
                    <p className="font-body text-sm text-on-surface-variant">Plans adapted to your Kavach Risk Score.</p>
                  </div>

                  <div className="flex flex-col gap-6">
                    {/* Shift Pass (24hr) */}
                    <div className="bg-surface-container-lowest p-8 rounded-[32px] editorial-shadow border border-outline-variant/10 relative">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="font-headline text-2xl font-medium">Aaj Ka Kavach</h3>
                          <p className="font-body text-sm text-on-surface-variant mt-1">24-hour Shift Pass</p>
                        </div>
                        <div className="text-right">
                          <span className="font-headline text-3xl">
                            {premium ? formatRupees(Math.round(premium.final_premium * 0.6)) : "—"}
                          </span>
                          <p className="text-[10px] uppercase tracking-tighter text-on-surface-variant block">/shift</p>
                        </div>
                      </div>
                      <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-sm font-body">
                          <span className="material-symbols-outlined text-secondary text-lg" data-icon="check_circle">check_circle</span>
                          Rain & AQI protection
                        </li>
                        <li className="flex items-center gap-3 text-sm font-body">
                          <span className="material-symbols-outlined text-secondary text-lg" data-icon="check_circle">check_circle</span>
                          Platform outage cover
                        </li>
                      </ul>
                      <button 
                        onClick={() => handlePayment("24hr")}
                        disabled={payPhase !== "idle"}
                        className="w-full py-4 rounded-full border border-primary text-primary font-label text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all duration-300 disabled:opacity-50"
                      >
                        Activate for 24 hours
                      </button>
                    </div>

                    {/* Weekly Pass (7day) */}
                    <div className="bg-primary p-8 rounded-[32px] editorial-shadow relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4">
                        <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Popular</span>
                      </div>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="font-headline text-2xl font-medium text-on-primary">Weekly Pass</h3>
                          <p className="font-body text-sm text-on-primary/70 mt-1">Hafte Ka Kavach (7 days)</p>
                        </div>
                        <div className="text-right">
                          <span className="font-headline text-3xl text-on-primary">
                             {premium ? formatRupees(premium.final_premium) : "—"}
                          </span>
                          <p className="text-[10px] uppercase tracking-tighter text-on-primary/70 block">/week</p>
                        </div>
                      </div>
                      <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-sm font-body text-on-primary">
                          <span className="material-symbols-outlined text-[#cbebc8] text-lg" data-icon="check_circle">check_circle</span>
                          Full 7-day unified coverage
                        </li>
                        <li className="flex items-center gap-3 text-sm font-body text-on-primary">
                          <span className="material-symbols-outlined text-[#cbebc8] text-lg" data-icon="check_circle">check_circle</span>
                          Priority settlement status
                        </li>
                      </ul>
                      <button 
                        onClick={() => handlePayment("7day")}
                        disabled={payPhase !== "idle"}
                        className="w-full py-4 rounded-full bg-surface-container-lowest text-primary font-label text-xs font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform duration-300 disabled:opacity-50"
                      >
                        Select Weekly Plan
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-center text-on-surface-variant opacity-60">
                     <span className="material-symbols-outlined text-4xl">lock</span>
                  </div>
                  <p className="text-center font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-2">
                    Secured by Razorpay • Meridian Assurance
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
