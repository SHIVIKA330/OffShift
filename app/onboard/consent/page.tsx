"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { MapPin, Building2, Activity, CheckCircle2 } from "lucide-react";

function ConsentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [allowGps, setAllowGps] = useState(true);
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    // Try to get phone from URL or localStorage
    const urlPhone = searchParams.get('phone');
    if (urlPhone) {
      setPhone(urlPhone);
    } else {
      const storedPhone = localStorage.getItem('offshift_onboard_phone');
      if (storedPhone) setPhone(storedPhone);
    }
  }, [searchParams]);

  const handleConsent = async (consent_type: string) => {
    if (!phone) {
      toast.error("Phone number missing. Please restart onboarding.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, consent_type }),
      });
      if (!res.ok) {
        throw new Error("Failed to save consent");
      }
      
      if (step < 3) {
        setStep(step + 1);
      } else {
        toast.success("✅ Consent setup complete");
        router.push("/dashboard"); 
      }
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  };

  const btnPrimaryStyle = "w-full py-4 rounded-full bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-widest editorial-shadow hover:scale-[1.02] transition-transform duration-300 disabled:opacity-50 flex items-center justify-center gap-2";

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col items-center justify-center px-6 selection:bg-primary-fixed selection:text-on-primary-fixed">
      <div className="w-full max-w-md bg-surface-container-lowest p-8 rounded-[40px] editorial-shadow border border-outline-variant/10 relative overflow-hidden">
        
        {step === 1 && (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mb-6 text-on-primary-container">
              <MapPin size={32} />
            </div>
            <h2 className="font-headline text-3xl font-medium mb-4">📍 Location Access</h2>
            <p className="font-body text-sm text-on-surface-variant text-center mb-8 px-2 leading-relaxed">
              We verify you're in the trigger zone when rain or an outage hits. Without this, we can't validate your claim.
            </p>
            
            <div className="w-full bg-surface-container-low p-5 rounded-2xl mb-8 flex items-center justify-between border border-outline-variant/10">
              <div className="flex flex-col gap-1">
                <span className="font-label text-sm font-bold text-on-surface">Share GPS for Coverage Verification</span>
                {!allowGps && (
                  <span className="text-[10px] text-error font-semibold">⚠️ Claims cannot be processed without GPS</span>
                )}
              </div>
              <button 
                onClick={() => setAllowGps(!allowGps)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${allowGps ? "bg-primary" : "bg-outline-variant/50"}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${allowGps ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>

            <button 
              className={btnPrimaryStyle}
              onClick={() => handleConsent("gps")}
              disabled={loading || !allowGps}
            >
              I Agree — Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mb-6 text-on-primary-container">
              <Building2 size={32} />
            </div>
            <h2 className="font-headline text-3xl font-medium mb-4">💳 Payment Account</h2>
            <p className="font-body text-sm text-on-surface-variant text-center mb-8 px-2 leading-relaxed">
              Your payout lands in your UPI wallet within 2 minutes of a trigger. We need this to pay you.
            </p>
            
            <div className="w-full mb-6">
               <input 
                 className="w-full h-14 bg-surface-container-low rounded-xl px-4 text-on-surface font-body text-sm focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/15 transition-all outline-none border border-outline-variant/20"
                 placeholder="name@upi"
                 value={upiId}
                 onChange={(e) => setUpiId(e.target.value)}
               />
            </div>

            <div className="w-full bg-[#fde293]/30 p-4 rounded-xl mb-8 border border-[#fde293]/50 flex items-start gap-3">
              <CheckCircle2 className="text-[#b45309] shrink-0 mt-0.5" size={18} />
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#522504] leading-relaxed">
                Aadhaar-linked KYC required as per RBI guidelines. We verify once; you get paid instantly forever after.
              </p>
            </div>

            <button 
              className={btnPrimaryStyle}
              onClick={() => handleConsent("bank_upi")}
              disabled={loading || upiId.length < 5}
            >
              I Agree — Link UPI
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mb-6 text-on-primary-container">
              <Activity size={32} />
            </div>
            <h2 className="font-headline text-3xl font-medium mb-4">📊 Platform Activity</h2>
            <p className="font-body text-sm text-on-surface-variant text-center mb-8 px-2 leading-relaxed">
              We confirm your active delivery days to calculate your eligibility under the Social Security Code, 2020.
            </p>
            
            <div className="w-full bg-surface-container-low p-4 rounded-xl mb-8 border border-outline-variant/10 text-center">
              <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant leading-relaxed">
                A data-sharing agreement is in place with Zomato and Swiggy. We only read active day counts — never order details.
              </p>
            </div>

            <button 
              className={btnPrimaryStyle}
              onClick={() => handleConsent("platform_activity")}
              disabled={loading}
            >
              I Agree — Connect Platform
            </button>
          </div>
        )}

        {/* Progress indicator */}
        <div className="flex gap-2 justify-center mt-8">
          {[1,2,3].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${step === i ? "w-6 bg-primary" : step > i ? "w-3 bg-primary/40" : "w-3 bg-outline-variant/30"}`} />
          ))}
        </div>
        
      </div>
    </div>
  );
}

export default function ConsentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center p-8 text-primary">Loading...</div>}>
      <ConsentForm />
    </Suspense>
  )
}

