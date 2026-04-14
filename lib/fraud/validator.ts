import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface GpsPing {
  lat: number; lon: number; pinged_at: string;
}

interface ClaimEvent {
  claim_id: string;
  date: string;
  disruption_type: string;
  zone: string;
  amount: number;
}

export interface FraudResult {
  fraud_score: number;
  decision: 'AUTO_APPROVE' | 'FLAG_REVIEW' | 'BLOCK';
  failed_layers: string[];
  ai_reason: string;
}

export async function runFraudValidation(
  riderId: string,
  claimZone: string,
  recentPings: GpsPing[],
  claimHistory: ClaimEvent[]
): Promise<FraudResult> {
  let fraud_score = 0;
  const failed_layers: string[] = [];

  // ─── LAYER 1: GPS Crowdsource Threshold ───────────────────────
  // Check if 50+ riders in same zone cluster are simultaneously inactive
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('rider_gps_pings')
    .select('*', { count: 'exact', head: true })
    .eq('zone_cluster', claimZone)
    .eq('is_active', false)
    .gte('pinged_at', windowStart);

  if ((count ?? 0) < 50) {
    fraud_score += 40;
    failed_layers.push('Layer 1: GPS crowdsource threshold not met (<50 inactive riders in zone)');
  }

  // ─── LAYER 2: GPS Velocity / Spoof Detection ──────────────────
  if (recentPings.length >= 2) {
    for (let i = 1; i < recentPings.length; i++) {
      const prev = recentPings[i - 1];
      const curr = recentPings[i];
      const dt = (new Date(curr.pinged_at).getTime() - new Date(prev.pinged_at).getTime()) / 1000 / 60; // minutes
      const dlat = curr.lat - prev.lat;
      const dlon = curr.lon - prev.lon;
      const distKm = Math.sqrt(dlat * dlat + dlon * dlon) * 111;
      if (dt > 0 && distKm / dt > 0.83) { // > 50 km/h = impossible on delivery bike in Delhi
        fraud_score += 25;
        failed_layers.push(`Layer 2: Impossible GPS velocity detected (${(distKm / dt * 60).toFixed(0)} km/h)`);
        break;
      }
    }
    // Check for perfectly stationary pings (spoofed static location)
    const uniqueCoords = new Set(recentPings.map(p => `${p.lat.toFixed(4)},${p.lon.toFixed(4)}`));
    // Usually need at least a few pings to say it's too static
    if (uniqueCoords.size === 1 && recentPings.length >= 6) {
      fraud_score += 20;
      failed_layers.push('Layer 2: GPS location perfectly static — possible spoofing');
    }
  }

  // ─── LAYER 3: Platform Cross-Reference ───────────────────────
  // If rider's platform shows 0 deliveries on claim day, flag it
  // (In production: call Zomato/Swiggy partner API. For demo: check rider_engagement.active_days)
  const { data: engagement } = await supabase
    .from('rider_engagement')
    .select('active_days_current_fy, last_updated')
    .eq('rider_id', riderId)
    .single();

  const daysSinceUpdate = engagement?.last_updated
    ? (Date.now() - new Date(engagement.last_updated).getTime()) / (1000 * 60 * 60 * 24)
    : 999;

  if (daysSinceUpdate > 3) {
    fraud_score += 15;
    failed_layers.push('Layer 3: Platform activity data stale (>3 days) — cannot cross-verify');
  }

  // ─── LAYER 4: AI Temporal Pattern Anomaly ────────────────────
  if (claimHistory.length >= 3) {
    const patternPrompt = `Analyze this gig worker's insurance claim history for fraud patterns:
${JSON.stringify(claimHistory, null, 2)}
Return ONLY valid JSON (no markdown): { "fraud_risk": "low" | "medium" | "high", "reason": "one sentence", "score_addition": 0-20 }`;

    try {
      const aiResponse = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 150,
        messages: [{ role: 'user', content: patternPrompt }]
      });

      const text = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : '{}';
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      if (parsed.fraud_risk === 'medium' || parsed.fraud_risk === 'high') {
        fraud_score += parsed.score_addition ?? 10;
        failed_layers.push(`Layer 4: AI anomaly — ${parsed.reason}`);
      }
    } catch { /* non-critical */ }
  }

  // ─── Final Decision ──────────────────────────────────────────
  let decision: FraudResult['decision'];
  if (fraud_score <= 30) decision = 'AUTO_APPROVE';
  else if (fraud_score <= 60) decision = 'FLAG_REVIEW';
  else decision = 'BLOCK';

  const ai_reason = failed_layers.length === 0
    ? 'All fraud checks passed. Payout authorised.'
    : failed_layers.join(' | ');

  return { fraud_score, decision, failed_layers, ai_reason };
}
