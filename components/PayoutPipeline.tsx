'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const STAGES = ['CLAIM_CREATED','FRAUD_CHECK','ELIGIBILITY_CHECK','PAYOUT_AMOUNT_RESOLVED','RAZORPAY_PAYOUT','CLAIM_CLOSED'];

export default function PayoutPipeline({ claimId }: { claimId: string }) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if(!claimId) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Initial fetch
    supabase.from('payout_audit_log').select('*').eq('claim_id', claimId).then(({ data }) => setLogs(data ?? []));
    
    // Realtime subscription
    const channel = supabase.channel('payout-' + claimId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payout_audit_log', filter: `claim_id=eq.${claimId}` },
        payload => setLogs(prev => [...prev, payload.new]))
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [claimId]);

  return (
    <div className="space-y-2 font-mono text-[10px] mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
      <div className="font-bold text-slate-700 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Live Payout Pipeline</div>
      {STAGES.map((stage, i) => {
        const log = logs.find(l => l.stage === stage);
        return (
          <div key={stage} className="flex items-center gap-3">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white
              ${log?.status === 'completed' ? 'bg-emerald-500' : log?.status === 'failed' ? 'bg-red-500' : 'bg-slate-300 text-slate-500'}`}>
              {log?.status === 'completed' ? '✓' : log?.status === 'failed' ? '✗' : i + 1}
            </span>
            <span className={log ? 'text-slate-800 font-semibold' : 'text-slate-400'}>{stage.replace(/_/g,' ')}</span>
            {log && <span className="text-emerald-600 font-bold ml-auto">{log.latency_ms}ms</span>}
          </div>
        );
      })}
    </div>
  );
}
