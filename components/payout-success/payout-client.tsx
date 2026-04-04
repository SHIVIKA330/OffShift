"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatRupees } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

type ClaimRow = {
  id: string;
  policy_id: string;
  trigger_type: string;
  payout_amount: number;
  status: string;
  created_at: string;
  payout_txn_id: string | null;
  trigger_severity?: string;
  zone?: string;
};

export function PayoutSuccessClient() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [claim, setClaim] = useState<ClaimRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClaim() {
      try {
        const claimId = searchParams.get("claim_id");
        
        if (claimId) {
          const { data, error } = await supabase
            .from("claims")
            .select("*")
            .eq("id", claimId)
            .single();
            
          if (error) throw error;
          setClaim(data as ClaimRow);
        } else {
          // Fallback to the latest settled/triggered claim for this worker
          const workerId = localStorage.getItem("offshift_worker_id");
          if (!workerId) {
            throw new Error("No worker context found. Please log in.");
          }
          
          const { data, error } = await supabase
            .from("claims")
            .select("*")
            .eq("worker_id", workerId)
            .in("status", ["TRIGGERED", "SETTLED"])
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
            
          if (error) {
            if (error.code === 'PGRST116') {
               throw new Error("No recent claims found.");
            }
            throw error;
          }
          setClaim(data as ClaimRow);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load claim details.");
      } finally {
        setLoading(false);
      }
    }

    fetchClaim();
  }, [searchParams, supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest animate-pulse">Verifying Transaction...</p>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
        <span className="material-symbols-outlined text-error text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
        <h2 className="font-headline text-2xl mb-2">Claim Not Found</h2>
        <p className="text-on-surface-variant text-sm">{error}</p>
        <div className="flex gap-4">
          <Link href="/dashboard">
            <button className="bg-surface-container-highest text-on-surface px-6 py-3 rounded-full font-label text-xs font-bold uppercase tracking-widest editorial-shadow hover:scale-105 transition-all">
              Back
            </button>
          </Link>
          <button 
            onClick={async () => {
              const workerId = localStorage.getItem("offshift_worker_id");
              const { data: pol } = await supabase.from("policies").select("id").eq("worker_id", workerId).eq("status", "ACTIVE").order("created_at", { ascending: false }).limit(1).single();
              if (pol) {
                await fetch("/api/debug/simulate-trigger", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ worker_id: workerId, policy_id: pol.id }),
                });
                toast.success("⛈️ Triggering demo payout...");
                setTimeout(() => window.location.reload(), 1500);
              } else {
                toast.error("Buy a policy first!");
              }
            }}
            className="bg-primary text-on-primary px-6 py-3 rounded-full font-label text-xs font-bold uppercase tracking-widest editorial-shadow flex items-center gap-2 hover:scale-105 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">thunderstorm</span>
            Trigger Demo Claim
          </button>
        </div>
      </div>
    );
  }

  const isRain = claim.trigger_type === "RAIN";
  const isAqi = claim.trigger_type === "AQI";
  const isOutage = claim.trigger_type === "OUTAGE";

  let eventTitle = "Coverage Event";
  let eventIcon = "bolt";
  
  if (isRain) {
    eventTitle = "Severe Weather (Rain)";
    eventIcon = "water_drop";
  } else if (isAqi) {
    eventTitle = "Poor Air Quality (AQI)";
    eventIcon = "air";
  } else if (isOutage) {
    eventTitle = "App Outage";
    eventIcon = "app_blocking";
  }

  return (
    <>
      {/* Payout Success Header */}
      <section className="text-center max-w-lg mx-auto pt-8 pb-12">
        <div className="mx-auto w-20 h-20 bg-primary-container rounded-full flex items-center justify-center mb-6 editorial-shadow">
          <span className="material-symbols-outlined text-4xl text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
        </div>
        <p className="font-label text-[11px] uppercase tracking-[0.2em] text-secondary mb-4">Coverage Triggered</p>
        <h2 className="font-headline text-5xl font-medium tracking-tight leading-[1.1] text-on-surface mb-6">
            {formatRupees(claim.payout_amount)} Payout Successful.
        </h2>
        <p className="font-body text-lg text-on-surface-variant leading-relaxed mb-4">
            {isRain ? "Heavy rain was " : isAqi ? "Extreme heat/AQI was " : "A major app outage was "} 
            detected in your grid {claim.zone ? `(${claim.zone})` : ""}. No claim form required—the funds {claim.status === "SETTLED" ? "have been automatically transferred" : "are being transferred"} to your wallet.
        </p>
      </section>

      {/* Transaction Details Card */}
      <section className="max-w-md mx-auto">
        <div className="bg-surface-container-lowest p-8 rounded-[32px] editorial-shadow border border-outline-variant/10">
          <h3 className="font-headline text-2xl font-medium mb-6">Transaction Details</h3>
          
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{eventIcon}</span>
                </div>
                <div>
                  <p className="font-body text-sm font-semibold">Event Type</p>
                  <p className="font-body text-xs text-on-surface-variant">{eventTitle} {claim.trigger_severity ? `• ${claim.trigger_severity}` : ""}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                </div>
                <div>
                  <p className="font-body text-sm font-semibold">Destination</p>
                  <p className="font-body text-xs text-on-surface-variant">
                    {claim.payout_txn_id ? `Txn: ${claim.payout_txn_id.slice(0, 10)}...` : "Default IMPS Wallet (•••• 4521)"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                </div>
                <div>
                  <p className="font-body text-sm font-semibold">Time Triggered</p>
                  <p className="font-body text-xs text-on-surface-variant">{new Date(claim.created_at).toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>
          </div>
          
          <Link href="/dashboard">
            <button className="mt-10 w-full py-4 rounded-full border border-primary text-primary font-label text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all duration-300">
              Return to Dashboard
            </button>
          </Link>
        </div>
      </section>
    </>
  );
}
