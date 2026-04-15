import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

export interface FraudInput {
  claimId: string;
  workerId: string;
  pincode: string;
  triggerType: string;
  reportedGpsLat: number;
  reportedGpsLng: number;
  workerRegisteredLat: number;
  workerRegisteredLng: number;
  lastOrderTimestamp: Date | null;
  claimsLast30Days: number;
  accountAgeDays: number;
  previousGpsLat?: number;
  previousGpsLng?: number;
  timeBetweenPingsMinutes?: number;
  nearbyWorkersClaimingCount: number;
  totalNearbyWorkersOnline: number;
  triggeredAt: Date;
  workerLoginTime: Date;
}

export interface FraudResult {
  fraudScore: number;
  decision: 'auto_approve' | 'manual_review' | 'blocked';
  flaggedSignals: string[];
  signalBreakdown: Record<string, number>;
  auditHash: string;
}

// Signal weights (sum to 1.0)
const WEIGHTS = {
  gpsZoneMatch: 0.15,
  activityRecency: 0.12,
  claimFrequency: 0.10,
  zoneCorrelation: -0.18,  // NEGATIVE — more zone claims = event is real = LOWER score
  accountAgeGate: 0.08,
  impossibleSpeed: 0.14,
  staticPing: 0.12,
  clusterSpoof: 0.10,
  weatherValidation: 0.11,
};

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function runFraudCheck(input: FraudInput): Promise<FraudResult> {
  const signals: Record<string, number> = {};
  const flaggedSignals: string[] = [];

  // ── SIGNAL 1: GPS zone match ──────────────────────────────
  const distanceFromHome = haversineDistance(
    input.reportedGpsLat, input.reportedGpsLng,
    input.workerRegisteredLat, input.workerRegisteredLng
  );
  signals.gpsZoneMatch = distanceFromHome > 25 ? 1.0 : distanceFromHome > 10 ? 0.5 : 0;
  if (signals.gpsZoneMatch > 0.5) flaggedSignals.push('gps_far_from_home_zone');

  // ── SIGNAL 2: Activity recency ────────────────────────────
  const hoursSinceLastOrder = input.lastOrderTimestamp
    ? (Date.now() - input.lastOrderTimestamp.getTime()) / (1000 * 60 * 60)
    : 24;
  signals.activityRecency = hoursSinceLastOrder > 6 ? 0.8 : hoursSinceLastOrder > 3 ? 0.4 : 0;
  if (signals.activityRecency > 0.6) flaggedSignals.push('no_recent_activity');

  // ── SIGNAL 3: Claim frequency ─────────────────────────────
  signals.claimFrequency = input.claimsLast30Days > 3 ? 1.0 : input.claimsLast30Days > 2 ? 0.5 : 0;
  if (signals.claimFrequency > 0.5) flaggedSignals.push('high_claim_frequency');

  // ── SIGNAL 4: Zone correlation (NEGATIVE — reduces fraud score) ──
  const zoneCorrelationRate =
    input.totalNearbyWorkersOnline > 0
      ? input.nearbyWorkersClaimingCount / input.totalNearbyWorkersOnline
      : 0;
  // If 60%+ of zone workers are claiming = real event = score goes DOWN
  signals.zoneCorrelation = zoneCorrelationRate > 0.6 ? -1.0 : zoneCorrelationRate > 0.3 ? -0.5 : 0;
  // Note: negative weight × negative signal = positive reduction in score

  // ── SIGNAL 5: Account age gate ────────────────────────────
  signals.accountAgeGate = input.accountAgeDays < 7 ? 1.0 : input.accountAgeDays < 30 ? 0.3 : 0;
  if (input.accountAgeDays < 7) flaggedSignals.push('new_account_hard_block');

  // ── SIGNAL 6: Impossible speed (GPS spoofing) ─────────────
  if (input.previousGpsLat && input.previousGpsLng && input.timeBetweenPingsMinutes) {
    const movementKm = haversineDistance(
      input.previousGpsLat, input.previousGpsLng,
      input.reportedGpsLat, input.reportedGpsLng
    );
    const speedKmh = movementKm / (input.timeBetweenPingsMinutes / 60);
    signals.impossibleSpeed = speedKmh > 150 ? 1.0 : 0; // faster than car
    if (signals.impossibleSpeed > 0) flaggedSignals.push('impossible_gps_speed');
  } else {
    signals.impossibleSpeed = 0;
  }

  // ── SIGNAL 7: Static ping ─────────────────────────────────
  if (input.timeBetweenPingsMinutes && input.timeBetweenPingsMinutes > 30) {
    if (input.previousGpsLat && input.previousGpsLng) {
      const movement = haversineDistance(
        input.previousGpsLat, input.previousGpsLng,
        input.reportedGpsLat, input.reportedGpsLng
      );
      signals.staticPing = movement < 0.01 ? 0.8 : 0; // < 10 meters in 30+ min
      if (signals.staticPing > 0) flaggedSignals.push('static_gps_ping');
    }
  } else {
    signals.staticPing = 0;
  }

  // ── SIGNAL 8: Cluster spoof ───────────────────────────────
  // Checked via database query — see fraud check API route
  signals.clusterSpoof = 0; // populated by API route

  // ── SIGNAL 9: Weather validation ─────────────────────────
  // Cross-check claimed trigger type vs actual OWM weather at location
  // Populated by trigger oracle — pass in from caller
  signals.weatherValidation = 0; // set to 1.0 if OWM says no rain but worker claims flood

  // ── COMPOSITE SCORE ───────────────────────────────────────
  let compositeScore = 0;
  compositeScore += WEIGHTS.gpsZoneMatch * signals.gpsZoneMatch;
  compositeScore += WEIGHTS.activityRecency * signals.activityRecency;
  compositeScore += WEIGHTS.claimFrequency * signals.claimFrequency;
  compositeScore += WEIGHTS.zoneCorrelation * signals.zoneCorrelation; // can be negative
  compositeScore += WEIGHTS.accountAgeGate * signals.accountAgeGate;
  compositeScore += WEIGHTS.impossibleSpeed * signals.impossibleSpeed;
  compositeScore += WEIGHTS.staticPing * signals.staticPing;
  compositeScore += WEIGHTS.clusterSpoof * signals.clusterSpoof;
  compositeScore += WEIGHTS.weatherValidation * signals.weatherValidation;

  // Hard blocks
  if (input.accountAgeDays < 7) compositeScore = 0.9; // always manual review
  if (signals.impossibleSpeed > 0) compositeScore = Math.max(compositeScore, 0.85);

  const fraudScore = Math.max(0, Math.min(1, compositeScore));

  const decision: FraudResult['decision'] =
    fraudScore < 0.35 ? 'auto_approve' :
    fraudScore < 0.70 ? 'manual_review' :
    'blocked';

  // ── AUDIT HASH ────────────────────────────────────────────
  const auditHash = crypto
    .createHash('sha256')
    .update(`${input.claimId}:${fraudScore}:${decision}:${Date.now()}`)
    .digest('hex');

  return {
    fraudScore,
    decision,
    flaggedSignals,
    signalBreakdown: signals,
    auditHash,
  };
}

// ── HASH-CHAINED AUDIT WRITER ─────────────────────────────────
export async function writeAuditEvent(
  claimId: string,
  eventType: string,
  actor: string,
  details: Record<string, unknown>,
  previousHash: string
): Promise<string> {
  const supabase = createClient();
  const timestamp = new Date().toISOString();
  
  const hashInput = `${previousHash}:${eventType}:${timestamp}:${JSON.stringify(details)}`;
  const hash = crypto.createHash('sha256').update(hashInput).digest('hex');

  await supabase.from('claim_audit_trail').insert({
    claim_id: claimId,
    event_type: eventType,
    event_timestamp: timestamp,
    actor,
    details,
    hash,
    previous_hash: previousHash,
  });

  return hash;
}
