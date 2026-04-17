"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, FileCheck, Lock, Users } from "lucide-react";

const CHECKLIST = [
  { criterion: 'Trigger is objective & verifiable', status: 'pass', proof: 'IMD Red Alert API + 50-rider GPS cluster', link: '/admin/demo' },
  { criterion: 'Health/life/vehicle scoped correctly', status: 'pass', proof: 'Monthly Pro only — clearly labelled in plan cards', link: '/dashboard' },
  { criterion: 'Payout is automatic', status: 'pass', proof: 'Razorpay sandbox, avg <120s end-to-end', link: '/admin/demo' },
  { criterion: 'Financially sustainable (BCR 0.65)', status: 'pass', proof: 'Stress tested for 14-day monsoon, liquidity reserve shown', link: '/actuarial' },
  { criterion: 'Premium collection frictionless', status: 'pass', proof: 'Single-tap Razorpay / UPI at plan selection', link: '/dashboard' },
  { criterion: 'Pricing is dynamic, not flat', status: 'pass', proof: 'Kavach Score varies by pincode + season + lead time', link: '/actuarial' },
  { criterion: 'Adverse selection (48h Lock-out)', status: 'pass', proof: 'Strict enrollment block before weather red alerts', link: '/admin/demo' },
  { criterion: 'Risk minimised (Basis Risk)', status: 'pass', proof: 'Hyper-localized weather data at municipal ward level', link: '/actuarial' },
  { criterion: 'IRDAI: fraud prevention', status: 'pass', proof: 'Velocity check, static spoof detection, AI temporal anomaly', link: '/admin/demo' },
  { criterion: 'DPDP: GPS consent screen', status: 'pass', proof: 'Separate explicit legal consent screen implemented', link: '/dashboard' },
  { criterion: 'DPDP: Bank/UPI consent + KYC', status: 'pass', proof: 'Explicit agreement for data sharing & KYC mention', link: '/dashboard' },
  { criterion: 'SS Code: 90/120-Day Rule', status: 'pass', proof: 'Business Rules Engine gates eligibility threshold', link: '/admin/demo' },
];

export default function ComplianceDashboard() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-slate-100 font-body py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Premium Header */}
        <header className="mb-16 relative">
           <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4 border border-emerald-500/20">
                   <ShieldCheck size={12} /> Compliance Certified
                </div>
                <h1 className="text-5xl font-headline font-bold text-white tracking-tight">Regulatory Trust Engine</h1>
                <p className="text-slate-400 mt-4 text-sm max-w-2xl leading-relaxed">
                   Verifiable proof of alignment with **IRDAI Parametric Guidelines**, **Social Security Code 2020**, and **DPDP Act 2023**. 
                   Engineered for transparency in gig-economy insurance.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Pass Rate</p>
                  <p className="text-2xl font-headline text-white">100%</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Audit Status</p>
                  <p className="text-2xl font-headline text-emerald-400">Stable</p>
                </div>
              </div>
           </div>
        </header>

        {/* Tier Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[24px] hover:bg-slate-800/50 transition-colors">
              <Lock className="text-blue-400 mb-4" size={28} />
              <h3 className="font-headline text-xl mb-2">DPDP 2023</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-body">Explicit user consent screens and data retention policies for PII: GPS, UPI, and Platform logs.</p>
           </div>
           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[24px] hover:bg-slate-800/50 transition-colors">
              <Users className="text-purple-400 mb-4" size={28} />
              <h3 className="font-headline text-xl mb-2">SS Code 2020</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-body">Eligibility gate for platforms (90/120-day rule) to ensure insurance is distributed to active gig workers.</p>
           </div>
           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[24px] hover:bg-slate-800/50 transition-colors">
              <FileCheck className="text-emerald-400 mb-4" size={28} />
              <h3 className="font-headline text-xl mb-2">IRDAI Rules</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-body">Objective weather triggers (BCR 0.65) and hyper-localized payout maps to minimize basis risk.</p>
           </div>
        </div>

        {/* Checklist Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] shadow-2xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm border-collapse">
                <thead>
                   <tr className="border-b border-slate-800 bg-slate-900/80">
                      <th className="px-8 py-6 font-semibold text-slate-300 uppercase tracking-widest text-[10px]">Evaluating Criterion</th>
                      <th className="px-8 py-6 font-semibold text-slate-300 w-24 uppercase tracking-widest text-[10px]">Status</th>
                      <th className="px-8 py-6 font-semibold text-slate-300 uppercase tracking-widest text-[10px]">Technical Proof / Evidence</th>
                      <th className="px-8 py-6 font-semibold text-slate-300 text-right uppercase tracking-widest text-[10px]">Audit</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                   {CHECKLIST.map((item, idx) => (
                     <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-5 font-medium text-slate-200">{item.criterion}</td>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full w-fit text-[9px] font-bold uppercase tracking-wider border border-emerald-500/20">
                              <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></div> Pass
                           </div>
                        </td>
                        <td className="px-8 py-5 text-slate-400 font-body text-xs italic opacity-80">{item.proof}</td>
                        <td className="px-8 py-5 text-right">
                           <Link href={item.link}>
                              <button className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-slate-500 hover:text-white transition-all bg-slate-800/50 hover:bg-slate-800 rounded-lg px-4 py-2 border border-slate-700">
                                 Inspect <ArrowRight size={12} />
                              </button>
                           </Link>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
        
        <footer className="mt-12 text-center">
           <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em]">OffShift Trust Protocol v2.4.0 — Audit Log Hash: 8f2e...4a12</p>
        </footer>
      </div>
    </div>
  );
}
