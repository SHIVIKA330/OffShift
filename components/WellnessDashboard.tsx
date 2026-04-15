'use client';
import { useEffect, useState } from 'react';
import { calculateWellnessScore, WellnessOutput } from '@/lib/wellness-score';

interface Props {
  hasActivePolicy: boolean;
  zoneRiskScore: number;
  accountAgeDays: number;
  isUPIVerified: boolean;
}

export default function WellnessDashboard(props: Props) {
  const [wellness, setWellness] = useState<WellnessOutput | null>(null);

  useEffect(() => {
    const result = calculateWellnessScore({
      ...props,
      hasSuspiciousActivity: false,
    });
    setWellness(result);
  }, [props]);

  if (!wellness) return null;

  const circumference = 2 * Math.PI * 40;
  const strokeDasharray = `${(wellness.score / 100) * circumference} ${circumference}`;

  return (
    <div className="rounded-xl border p-5 space-y-4">
      <h3 className="font-medium">Wellness Score</h3>
      
      <div className="flex items-center gap-6">
        {/* Circular progress */}
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="48" cy="48" r="40" fill="none"
            stroke={wellness.gradeColor}
            strokeWidth="8"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            transform="rotate(-90 48 48)"
          />
          <text x="48" y="46" textAnchor="middle" fontSize="20" fontWeight="600" fill="currentColor">
            {wellness.score}
          </text>
          <text x="48" y="62" textAnchor="middle" fontSize="11" fill="#6b7280">
            Grade {wellness.grade}
          </text>
        </svg>
        
        <div>
          <div className="font-semibold text-lg" style={{ color: wellness.gradeColor }}>
            {wellness.gradeLabel}
          </div>
          <div className="space-y-1 mt-2">
            {Object.entries(wellness.breakdown).map(([key, pts]) => (
              <div key={key} className="flex justify-between text-xs text-muted-foreground">
                <span>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                <span className="font-medium">+{pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {wellness.recommendations.length > 0 && (
        <div className="space-y-1">
          {wellness.recommendations.map((rec, i) => (
            <p key={i} className="text-xs text-muted-foreground flex gap-2">
              <span>→</span><span>{rec}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
