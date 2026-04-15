import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runFraudCheck, writeAuditEvent } from '@/lib/fraud-engine';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();
  const { claimId, workerId } = body;

  const { data: claim } = await supabase
    .from('claims')
    .select('*, workers(*)')
    .eq('id', claimId)
    .single();

  if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 });

  // Count nearby workers claiming (zone correlation)
  const { count: nearbyClaimingCount } = await supabase
    .from('claims')
    .select('*', { count: 'exact' })
    .eq('pincode', claim.workers.pincode)
    .gte('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()); // last 2 hours

  const { count: nearbyOnlineCount } = await supabase
    .from('zone_activity')
    .select('*', { count: 'exact' })
    .eq('pincode', claim.workers.pincode)
    .eq('is_online', true)
    .gte('recorded_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

  // Check cluster spoof (5+ workers at identical GPS coords)
  const { count: clusterCount } = await supabase
    .from('zone_activity')
    .select('*', { count: 'exact' })
    .gte('gps_lat', (claim.gps_lat || 28.6) - 0.0001)
    .lte('gps_lat', (claim.gps_lat || 28.6) + 0.0001)
    .gte('gps_lng', (claim.gps_lng || 77.2) - 0.0001)
    .lte('gps_lng', (claim.gps_lng || 77.2) + 0.0001);

  const result = await runFraudCheck({
    claimId,
    workerId,
    pincode: claim.workers.pincode,
    triggerType: claim.trigger_type,
    reportedGpsLat: claim.gps_lat || claim.workers.home_lat,
    reportedGpsLng: claim.gps_lng || claim.workers.home_lng,
    workerRegisteredLat: claim.workers.home_lat,
    workerRegisteredLng: claim.workers.home_lng,
    lastOrderTimestamp: claim.workers.last_order_at ? new Date(claim.workers.last_order_at) : null,
    claimsLast30Days: claim.workers.claims_last_30d || 0,
    accountAgeDays: Math.floor(
      (Date.now() - new Date(claim.workers.created_at).getTime()) / (1000 * 60 * 60 * 24)
    ),
    nearbyWorkersClaimingCount: nearbyClaimingCount || 0,
    totalNearbyWorkersOnline: nearbyOnlineCount || 1,
    triggeredAt: new Date(claim.created_at),
    workerLoginTime: new Date(claim.workers.last_login_at || claim.created_at),
  });

  // Override cluster spoof signal if detected
  if ((clusterCount || 0) >= 5) {
    result.fraudScore = Math.max(result.fraudScore, 0.75);
    result.flaggedSignals.push('cluster_spoof_detected');
    result.decision = 'blocked';
  }

  // Write initial audit trail event
  const auditHash = await writeAuditEvent(
    claimId,
    'fraud_scored',
    'fraud_engine_v1',
    {
      score: result.fraudScore,
      decision: result.decision,
      signals_flagged: result.flaggedSignals,
      zone_correlation: (nearbyClaimingCount || 0) / Math.max(nearbyOnlineCount || 1, 1),
    },
    claim.genesis_hash || 'GENESIS'
  );

  // Update claim with fraud result
  await supabase.from('claims').update({
    fraud_score: result.fraudScore,
    fraud_decision: result.decision,
    fraud_signals: result.flaggedSignals,
    latest_audit_hash: auditHash,
  }).eq('id', claimId);

  // Store fraud signals detail
  await supabase.from('fraud_signals').insert({
    claim_id: claimId,
    worker_id: workerId,
    fraud_score: result.fraudScore,
    decision: result.decision,
    flagged_signals: result.flaggedSignals,
    zone_correlation_rate: (nearbyClaimingCount || 0) / Math.max(nearbyOnlineCount || 1, 1),
    raw_data: result.signalBreakdown,
  });

  return NextResponse.json({ result, auditHash });
}
