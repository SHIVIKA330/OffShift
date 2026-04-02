"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { riskBand, type ShiftType } from "@/lib/kavach-engine";
import { formatRupees } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { ZONE_OPTIONS, type ZoneSlug } from "@/lib/zones";
import Link from "next/link";

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

export function OnboardingWizard() {
  const supabase = createClient();

  const [screen, setScreen] = useState(1);
  const [loading, setLoading] = useState(false);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<"zomato" | "swiggy">("zomato");
  const [riderId, setRiderId] = useState("");

  const [zone, setZone] = useState<ZoneSlug>("okhla");
  const [shift, setShift] = useState<ShiftType>("evening");
  const [days, setDays] = useState([5]);

  const [calcLoading, setCalcLoading] = useState(false);
  const [premium, setPremium] = useState<PremiumRes | null>(null);

  const [policyCard, setPolicyCard] = useState<{
    id: string;
    coverage_start: string;
    coverage_end: string;
    plan_type: string;
    max_payout: number;
  } | null>(null);

  const sendOtp = async () => {
    const n = phone.replace(/\D/g, "");
    if (n.length < 10) {
      toast.error("Valid 10-digit mobile number चाहिए");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${n.slice(-10)}`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOtpSent(true);
    toast.success("OTP भेज दिया गया");
  };

  const verifyOtp = async () => {
    const n = phone.replace(/\D/g, "");
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: `+91${n.slice(-10)}`,
      token: otp,
      type: "sms",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("फोन वेरीफ़ाई हो गया");
    setScreen(2);
  };

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

  const persistWorker = async () => {
    if (!premium) return;
    setLoading(true);
    const res = await fetch("/api/workers/register", {
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
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json();
      toast.error(j.error ?? "Save failed");
      return false;
    }
    return true;
  };

  const pay = async (plan: "24hr" | "7day") => {
    const ok = await persistWorker();
    if (!ok) return;
    setLoading(true);
    const orderRes = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan_type: plan,
        zone,
        shift_type: shift,
        active_days: days[0],
        platform,
      }),
    });
    const order = await orderRes.json();
    setLoading(false);
    if (!orderRes.ok) {
      toast.error(order.error ?? "Order failed");
      return;
    }

    const RazorpayCtor = (window as unknown as { Razorpay?: new (o: object) => { open: () => void } })
      .Razorpay;
    if (!RazorpayCtor) {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      s.onload = () => pay(plan);
      document.body.appendChild(s);
      return;
    }

    const rzp = new RazorpayCtor({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      name: "OffShift Kavach",
      description: plan === "24hr" ? "Aaj Ka Kavach" : "Hafte Ka Kavach",
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        setLoading(true);
        const vr = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan_type: plan,
            zone,
            shift_type: shift,
            active_days: days[0],
            platform,
          }),
        });
        const out = await vr.json();
        setLoading(false);
        if (!vr.ok) {
          toast.error(out.error ?? "Verify failed");
          return;
        }
        toast.success("पॉलिसी सक्रिय — Policy activated");
        setPolicyCard(out.policy);
        setScreen(5);
      },
      theme: { color: "#0F4C5C" },
    });
    rzp.open();
  };

  const band = premium ? riskBand(premium.kavach_score) : null;

  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs font-medium text-[#0F4C5C]">OffShift</span>
        <span className="text-xs text-slate-500">
          स्क्रीन {Math.min(screen, 4)}/4
        </span>
      </div>

      {screen === 1 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>पहचान / Identity</CardTitle>
            <p className="text-xs text-slate-500">
              WhatsApp जैसा सरल फॉर्म — बैंक नहीं
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!otpSent ? (
              <>
                <div>
                  <Label>Mobile number</Label>
                  <p className="text-xs text-slate-500">मोबाइल नंबर</p>
                  <div className="mt-1 flex gap-2">
                    <span className="flex h-11 items-center rounded-xl border border-slate-200 px-3 text-sm">
                      +91
                    </span>
                    <Input
                      inputMode="numeric"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => void sendOtp()}
                  disabled={loading}
                >
                  {loading ? "…" : "OTP भेजें"}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <Label>OTP</Label>
                  <p className="text-xs text-slate-500">एसएमएस कोड</p>
                  <Input
                    className="mt-1"
                    inputMode="numeric"
                    placeholder="6-digit"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Full name</Label>
                  <p className="text-xs text-slate-500">पूरा नाम</p>
                  <Input
                    className="mt-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Platform</Label>
                  <p className="text-xs text-slate-500">प्लेटफ़ॉर्म</p>
                  <RadioGroup
                    className="mt-2 grid grid-cols-2 gap-3"
                    value={platform}
                    onValueChange={(v) => setPlatform(v as "zomato" | "swiggy")}
                  >
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 has-[:checked]:border-[#0F4C5C]">
                      <RadioGroupItem value="zomato" id="z" />
                      <span className="text-2xl">🍽️</span>
                      <span className="text-sm font-medium">Zomato</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 has-[:checked]:border-[#0F4C5C]">
                      <RadioGroupItem value="swiggy" id="s" />
                      <span className="text-2xl">🛵</span>
                      <span className="text-sm font-medium">Swiggy</span>
                    </label>
                  </RadioGroup>
                </div>
                <div>
                  <Label>Rider ID</Label>
                  <p className="text-xs text-slate-500">जैसे ZO-12345 या SG-12345</p>
                  <Input
                    className="mt-1 font-mono uppercase"
                    value={riderId}
                    onChange={(e) => setRiderId(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={loading || name.length < 2 || !/^(ZO|SG)-[A-Z0-9]{4,}$/i.test(riderId)}
                  onClick={() => void verifyOtp()}
                >
                  {loading ? "…" : "आगे / Continue"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {screen === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>काम का ज़ोन / Work zone</CardTitle>
            <p className="text-xs text-slate-500">Delhi NCR — Phase 2</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>City</Label>
              <p className="text-xs text-slate-500">शहर</p>
              <Input className="mt-1 bg-slate-50" readOnly value="Delhi NCR" />
            </div>
            <div>
              <Label>Primary zone</Label>
              <p className="text-xs text-slate-500">प्राथमिक ज़ोन (वार्ड स्तर)</p>
              <select
                className="mt-1 flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                value={zone}
                onChange={(e) => setZone(e.target.value as ZoneSlug)}
              >
                {ZONE_OPTIONS.map((z) => (
                  <option key={z.value} value={z.value}>
                    {z.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Typical shift</Label>
              <p className="text-xs text-slate-500">आम शिफ्ट</p>
              <select
                className="mt-1 flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
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
            <div>
              <Label>Days active / week</Label>
              <p className="text-xs text-slate-500">हफ़्ते में कितने दिन</p>
              <div className="mt-3 px-1">
                <Slider
                  value={days}
                  onValueChange={setDays}
                  min={1}
                  max={7}
                  step={1}
                />
                <p className="mt-2 text-center text-sm font-medium text-[#0F4C5C]">
                  {days[0]} दिन
                </p>
              </div>
            </div>
            <Button className="w-full" onClick={() => setScreen(3)}>
              आगे — Kavach score
            </Button>
          </CardContent>
        </Card>
      )}

      {screen === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Kavach risk score</CardTitle>
            <p className="text-xs text-slate-500">AI-powered assessment</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {calcLoading && (
              <div className="space-y-3 py-4 text-center">
                <p className="animate-pulse text-sm text-[#0F4C5C]">
                  Calculating your risk score…
                </p>
                <p className="text-xs text-slate-500">आपका जोखिम स्कोर निकाल रहे हैं…</p>
                <Progress value={66} className="h-2" />
              </div>
            )}
            {!calcLoading && premium && band && (
              <>
                <div className="text-center">
                  <p className="text-5xl font-bold text-[#0F4C5C]">{premium.kavach_score}</p>
                  <p className="text-xs text-slate-500">Kavach Score (1–100)</p>
                </div>
                <div className="flex justify-center">
                  <Badge
                    variant={
                      band.color === "green"
                        ? "success"
                        : band.color === "yellow"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {band.label} RISK — {formatRupees(band.dayRef)}/day |{" "}
                    {formatRupees(band.weekRef)}/week ref
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-slate-700">
                  {premium.explanation_hindi}
                </p>
                <Button className="w-full" onClick={() => setScreen(4)}>
                  प्लान चुनें / Choose plan
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {screen === 4 && premium && (
        <Card>
          <CardHeader>
            <CardTitle>प्लान / Plans</CardTitle>
            <p className="text-xs text-slate-500">Razorpay test checkout</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => void pay("24hr")}
                disabled={loading}
                className="rounded-2xl border-2 border-slate-200 p-4 text-left transition hover:border-[#0F4C5C]"
              >
                <p className="font-semibold text-[#0F4C5C]">Aaj Ka Kavach</p>
                <p className="text-xs text-slate-500">24 घंटे की शील्ड</p>
                <p className="mt-2 text-lg font-bold text-[#F59E0B]">
                  Max {formatRupees(500)} payout
                </p>
              </button>
              <button
                type="button"
                onClick={() => void pay("7day")}
                disabled={loading}
                className="rounded-2xl border-2 border-[#0F4C5C] bg-[#0F4C5C]/5 p-4 text-left"
              >
                <p className="font-semibold text-[#0F4C5C]">Hafte Ka Kavach</p>
                <p className="text-xs text-slate-500">7 दिन</p>
                <p className="mt-2 text-lg font-bold text-[#F59E0B]">
                  Max {formatRupees(1500)} payout
                </p>
              </button>
            </div>
            <p className="text-center text-xs text-slate-500">
              Dynamic premium ~ {formatRupees(premium.final_premium)} (recalculated at checkout)
            </p>
          </CardContent>
        </Card>
      )}

      {screen === 5 && policyCard && (
        <Card className="border-[#0F4C5C]">
          <CardHeader>
            <CardTitle>Policy active</CardTitle>
            <p className="text-xs text-slate-500">पॉलिसी सक्रिय</p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-slate-500">Policy ID:</span>{" "}
              <span className="font-mono">{policyCard.id}</span>
            </p>
            <p>
              <span className="text-slate-500">Plan:</span> {policyCard.plan_type}
            </p>
            <p>
              <span className="text-slate-500">Coverage:</span>{" "}
              {new Date(policyCard.coverage_start).toLocaleString("en-IN")} —{" "}
              {new Date(policyCard.coverage_end).toLocaleString("en-IN")}
            </p>
            <p>
              <span className="text-slate-500">Triggers:</span> Weather ✓ · App outage ✓
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href="/dashboard">डैशबोर्ड पर जाएँ</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
