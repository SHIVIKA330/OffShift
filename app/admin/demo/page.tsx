"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CloudRain, Smartphone, MapPin, ShieldAlert, Zap, Compass, CheckCircle2 } from "lucide-react";

export default function DemoAdminPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async (endpoint: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/demo/${endpoint}`, { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-body pb-20">
      {/* Non-removable Banner */}
      <div className="w-full bg-amber-500 text-stone-900 font-bold p-3 text-center text-sm sticky top-0 z-50 flex justify-center items-center gap-2 shadow-md">
        <AlertCircle className="w-5 h-5" />
        ⚠️ DEMO MODE — Simulations Only. No real money moves. Razorpay relies on sandbox execution logs only.
      </div>
      
      <div className="max-w-4xl mx-auto mt-10 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-headline text-slate-800 font-bold tracking-tight">Evaluator Toolkit</h1>
          <p className="text-slate-500 mt-2">Trigger real-time edge cases to test dynamic parametric rules.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => runSimulation('trigger-weather')}>
             <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><CloudRain className="text-blue-500" /> Trigger IMD Red Alert</CardTitle>
                <p className="text-sm text-slate-500">Simulate &gt;50mm rain in Delhi NCR</p>
             </CardHeader>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => runSimulation('trigger-outage')}>
             <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><Smartphone className="text-rose-500" /> Trigger App Outage (Zomato)</CardTitle>
                <p className="text-sm text-slate-500">Simulate platform downtime ping</p>
             </CardHeader>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => runSimulation('concurrent-disruption')}>
             <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><Zap className="text-purple-500" /> Trigger Concurrent Disruption</CardTitle>
                <p className="text-sm text-slate-500">Simulate simultaneous Rain + Outage</p>
             </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => runSimulation('gps-spoof')}>
             <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><MapPin className="text-emerald-500" /> Simulate GPS Spoofing</CardTitle>
                <p className="text-sm text-slate-500">Simulate fraudulent static locations</p>
             </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => runSimulation('fraud-test')}>
             <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><ShieldAlert className="text-amber-500" /> Run Fraud Score Test</CardTitle>
                <p className="text-sm text-slate-500">Evaluate ML-based temporal anomaly</p>
             </CardHeader>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => runSimulation('zone-crossing')}>
             <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><Compass className="text-indigo-500" /> Simulate Zone Crossing</CardTitle>
                <p className="text-sm text-slate-500">Rider drives from Okhla to Noida</p>
             </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-rose-200 bg-rose-50" onClick={() => runSimulation('disruption')}>
             <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><AlertCircle className="text-rose-600" /> Simulate Civic Disruption</CardTitle>
                <p className="text-sm text-slate-500">Blockades, Protests, or Grid Failure</p>
             </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => runSimulation('eligibility-check')}>
             <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="text-teal-500" /> 90-Day Eligibility Check</CardTitle>
                <p className="text-sm text-slate-500">Verify SS Code 2020 gate rules</p>
             </CardHeader>
          </Card>
        </div>

        {/* Live Terminal Output */}
        <div className="mt-8 bg-slate-900 rounded-xl p-6 shadow-2xl relative overflow-hidden border border-slate-800">
           <div className="absolute top-0 right-0 p-4">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
           </div>
           
           <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-mono text-slate-500 border-l border-slate-800 pl-4 ml-2">Fraud_Oracle_v2.0_Active</span>
           </div>

           <p className="font-mono text-emerald-400 text-sm mb-4">root@offshift-sandbox:~# {loading ? "executing..." : (result ? "transaction_complete --status=PASS" : "awaiting simulation trigger")}</p>
           
           <div className="space-y-1 font-mono text-[10px]">
              {result && result.gps_crosscheck && (
                <p className="text-blue-400">[SYSTEM] GPS vs Platform Login: MATCH FOUND (Pincode: {result.gps_crosscheck.pincode})</p>
              )}
              {result && result.anomaly_detected === false && (
                <p className="text-emerald-500">[SYSTEM] Velocity Check: NORMAL. No static spoofing detected.</p>
              )}
              {result && result.risk_score && (
                 <p className="text-amber-400">[SYSTEM] Computed Risk Factor: {result.risk_score.toFixed(2)} [Safe Threshold]</p>
              )}
              {result && result.is_locked_out && (
                 <p className="text-rose-500 bg-rose-500/10 p-2 rounded">![CRITICAL] LOCK-OUT TRIGGERED: {result.lock_out_reason}</p>
              )}
           </div>

           {result && (
             <div className="mt-4 pt-4 border-t border-slate-800">
                <pre className="text-slate-300 text-xs overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
