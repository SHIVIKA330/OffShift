'use client';
import { useEffect, useState } from 'react';

interface EligibilityData {
  eligible: boolean;
  active_days: number;
  threshold: number;
  progress_pct: number;
  plan_access: 'full' | 'shift_pass_only';
  platform: string;
  is_multi_apping: boolean;
}

export default function EligibilityProgress({ riderId, phone }: { riderId?: string, phone?: string }) {
  const [data, setData] = useState<EligibilityData | null>(null);

  useEffect(() => {
    if (!riderId && !phone) return;
    const query = riderId ? `rider_id=${riderId}` : `phone=${phone}`;
    fetch(`/api/eligibility/check?${query}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [riderId, phone]);

  if (!data) {
    return (
      <div className="animate-pulse h-28 bg-surface-container-low rounded-[24px]" />
    );
  }

  const circumference = 2 * Math.PI * 40;
  const strokeDash = (data.progress_pct / 100) * circumference;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-[24px] p-5 flex items-center gap-5 editorial-shadow">
      {/* Circular progress ring */}
      <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0">
        <circle
          cx="48" cy="48" r="40"
          fill="none"
          stroke="currentColor"
          className="text-surface-container"
          strokeWidth="6"
        />
        <circle
          cx="48" cy="48" r="40"
          fill="none"
          stroke={data.eligible ? '#4a654a' : '#b45309'}
          strokeWidth="6"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        <text
          x="48" y="44"
          textAnchor="middle"
          fill="currentColor"
          className="text-on-surface"
          fontSize="20"
          fontWeight="bold"
          fontFamily="Newsreader, serif"
        >
          {data.progress_pct}%
        </text>
        <text
          x="48" y="58"
          textAnchor="middle"
          fill="currentColor"
          className="text-on-surface-variant"
          fontSize="8"
          fontFamily="Manrope, sans-serif"
          style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
        >
          ELIGIBILITY
        </text>
      </svg>

      <div className="flex-1 min-w-0">
        <p className="font-label text-[10px] uppercase tracking-widest text-secondary mb-1">
          आपकी eligibility / Your Eligibility
        </p>
        <p className="font-headline text-lg font-medium text-on-surface">
          {data.active_days} / {data.threshold} days
        </p>
        <p className="font-body text-xs text-on-surface-variant mt-1">
          {data.eligible
            ? '✅ Full access unlocked — all plans available'
            : `⏳ ${data.threshold - data.active_days} more days to unlock Monthly Pro`}
        </p>
        {!data.eligible && (
          <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/60 mt-2">
            {data.is_multi_apping
              ? 'Multi-apping threshold: 120 days (SS Code 2020)'
              : 'Single-platform threshold: 90 days (SS Code 2020)'}
          </p>
        )}
      </div>
    </div>
  );
}
