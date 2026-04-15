import { createClient } from '@/lib/supabase/server';

export interface RingDetectionResult {
  isRingDetected: boolean;
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  signals: string[];
  affectedWorkerIds: string[];
  recommendedAction: 'proceed' | 'delay_zone' | 'freeze_zone' | 'block_all';
}

export async function detectCoordinatedRing(
  pincode: string,
  windowMinutes: number = 15
): Promise<RingDetectionResult> {
  const supabase = await createClient();
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const signals: string[] = [];

  // Signal 1: Claim spike — more than 50 new claims in window
  const { count: recentClaimCount } = await supabase
    .from('claims')
    .select('*', { count: 'exact' })
    .eq('pincode', pincode)
    .gte('created_at', windowStart);

  if ((recentClaimCount || 0) > 50) {
    signals.push(`claim_spike: ${recentClaimCount} claims in ${windowMinutes}min`);
  }

  // Signal 2: Historical baseline comparison
  // Fetch last 4 weeks same-day claim average for this zone
  const { data: historicalClaims } = await supabase
    .from('claims')
    .select('id')
    .eq('pincode', pincode)
    .gte('created_at', new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString());

  const weeklyAvg = (historicalClaims?.length || 0) / 4;
  if ((recentClaimCount || 0) > weeklyAvg * 2.5) {
    signals.push(`volume_anomaly: ${recentClaimCount} vs ${weeklyAvg.toFixed(0)} weekly avg`);
  }

  // Signal 3: Device fingerprint clustering
  const { data: recentClaims } = await supabase
    .from('claims')
    .select('worker_id, device_fingerprint')
    .eq('pincode', pincode)
    .gte('created_at', windowStart);

  const fingerprintGroups = new Map<string, string[]>();
  (recentClaims || []).forEach((c: any) => {
    if (c.device_fingerprint) {
      const group = fingerprintGroups.get(c.device_fingerprint) || [];
      group.push(c.worker_id);
      fingerprintGroups.set(c.device_fingerprint, group);
    }
  });
  const largestCluster = Math.max(...Array.from(fingerprintGroups.values() as any).map((g: any) => g.length) as any, 0);
  if (largestCluster >= 15) {
    signals.push(`device_cluster: ${largestCluster} workers share fingerprint`);
  }

  // Signal 4: Registration cohort (workers who registered within same hour and all claiming now)
  const { data: cohortWorkers } = await supabase
    .from('workers')
    .select('id, created_at')
    .in('id', (recentClaims || []).map((c: any) => c.worker_id));

  const registrationTimes = (cohortWorkers || []).map((w: any) => new Date(w.created_at).getTime());
  if (registrationTimes.length > 10) {
    const minTime = Math.min(...registrationTimes);
    const maxTime = Math.max(...registrationTimes);
    const spreadHours = (maxTime - minTime) / (1000 * 60 * 60);
    if (spreadHours < 2) {
      signals.push(`cohort_registration: ${registrationTimes.length} workers registered in ${spreadHours.toFixed(1)}hrs`);
    }
  }

  const isRingDetected = signals.length >= 2;
  const riskLevel = signals.length === 0 ? 'none' :
    signals.length === 1 ? 'low' :
    signals.length === 2 ? 'medium' :
    signals.length === 3 ? 'high' : 'critical';

  const recommendedAction = riskLevel === 'none' ? 'proceed' :
    riskLevel === 'low' ? 'delay_zone' :
    riskLevel === 'medium' ? 'delay_zone' :
    'freeze_zone';

  return {
    isRingDetected,
    riskLevel,
    signals,
    affectedWorkerIds: (recentClaims || []).map((c: any) => c.worker_id),
    recommendedAction,
  };
}
