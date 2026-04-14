"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, MonitorPlay, Activity } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 px-6 sm:px-12 py-3 flex gap-2 sm:gap-6 overflow-x-auto whitespace-nowrap shadow-sm z-40 sticky top-0">
        <Link href="/admin">
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${pathname === '/admin' ? 'bg-[#0F4C5C] text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Activity size={18} /> Insurer Console
          </button>
        </Link>
        <Link href="/admin/demo">
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${pathname === '/admin/demo' ? 'bg-amber-500 text-stone-900 shadow' : 'text-slate-600 hover:bg-slate-100'}`}>
            <MonitorPlay size={18} /> Demo Simulator
          </button>
        </Link>
        <Link href="/admin/compliance">
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${pathname === '/admin/compliance' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>
            <ShieldCheck size={18} /> Compliance Checklist
          </button>
        </Link>
      </nav>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
