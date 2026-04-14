export default function FraudScoreBadge({ score, decision }: { score: number; decision: string }) {
  const color = decision === 'AUTO_APPROVE' ? 'bg-green-900 text-green-300 border-green-700'
    : decision === 'FLAG_REVIEW' ? 'bg-yellow-900 text-yellow-300 border-yellow-700'
    : 'bg-red-900 text-red-300 border-red-700';

  return (
    <div className={`inline-flex items-center gap-2 border rounded-full px-3 py-1 text-sm font-mono ${color}`}>
      <span className="font-bold">Fraud Score: {score}/100</span>
      <span>→ {decision}</span>
    </div>
  );
}
