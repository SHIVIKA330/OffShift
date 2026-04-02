/**
 * OffShift — Cron Job Simulation Service
 * Scheduled jobs for weather monitoring, outage detection, and auto-claim processing
 */

import { v4 as uuid } from 'uuid';
import { db } from '../data/store';
import { getCurrentWeatherAlert, getAllAlerts, PINCODE_NAMES } from './weather';
import { checkPlatformOutage, validateOutageCluster } from './outage';
import { checkCurfew } from './curfew';
import { checkHazardousAQI, getSimulatedAQIZones } from './aqi';
import { disburseClaim } from './payments';
import { getKavachScoreForRider } from './kavach-score';
import { Claim, WeatherEvent, OutageEvent } from '../models/types';

// ─── SSE clients for real-time updates ─────────────────────────────────────

type SSEClient = {
  id: string;
  res: any;
};

let sseClients: SSEClient[] = [];

export function addSSEClient(client: SSEClient) {
  sseClients.push(client);
}

export function removeSSEClient(clientId: string) {
  sseClients = sseClients.filter(c => c.id !== clientId);
}

function broadcastSSE(event: string, data: any) {
  sseClients.forEach(client => {
    try {
      client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      // Client disconnected
    }
  });
}

// ─── Rain Radar Cron (every 6 hours in production, on-demand here) ─────────

export async function rainRadarCron(): Promise<{
  alerts_found: number;
  claims_triggered: number;
  results: any[];
}> {
  console.log('\n⏰ ═══════════════════════════════════════════════════');
  console.log('⏰ RAIN RADAR CRON: Checking IMD forecast across all pincodes...');
  console.log('⏰ ═══════════════════════════════════════════════════\n');

  const alerts = getAllAlerts();
  const redAlerts = alerts.filter(a => a.alert_level === 'red');
  const results: any[] = [];

  console.log(`🌤️ Weather check complete: ${alerts.length} pincodes scanned, ${redAlerts.length} RED alerts found`);

  if (redAlerts.length === 0) {
    broadcastSSE('cron_update', { type: 'rain_radar', message: 'No Red Alerts detected', alerts_found: 0 });
    return { alerts_found: 0, claims_triggered: 0, results: [] };
  }

  let claimsTriggered = 0;

  for (const alert of redAlerts) {
    console.log(`\n🌧️ IMD RED ALERT in ${alert.location_name} (${alert.pincode}) — Rainfall: ${alert.rainfall_mm}mm/hr`);

    // Log weather event
    const weatherEvent: WeatherEvent = {
      id: `w-${uuid().substring(0, 8)}`,
      pincode: alert.pincode,
      alert_level: 'red',
      rainfall_mm: alert.rainfall_mm,
      temperature_c: alert.temperature_c,
      source: alert.source,
      created_at: new Date(),
    };
    db.addWeatherEvent(weatherEvent);

    // Find eligible policies
    const eligiblePolicies = db.getActivePoliciesForPincode(alert.pincode)
      .filter(p => p.covers_weather);

    console.log(`🔍 Found ${eligiblePolicies.length} eligible active policies in ${alert.pincode}`);

    broadcastSSE('weather_alert', {
      ...weatherEvent,
      eligible_policies: eligiblePolicies.length,
      location_name: alert.location_name,
    });

    for (const policy of eligiblePolicies) {
      const rider = db.getRider(policy.rider_id);
      if (!rider) continue;

      // Check if already claimed on this policy
      const existingClaim = db.claims.find(c => c.policy_id === policy.id && c.status !== 'rejected');
      if (existingClaim) {
        console.log(`⏭️ Skipping ${rider.name} — already has claim on policy ${policy.id}`);
        continue;
      }

      // Create claim
      const claim: Claim = {
        id: `c-${uuid().substring(0, 8)}`,
        policy_id: policy.id,
        rider_id: rider.id,
        trigger_type: alert.rainfall_mm === 0 && alert.temperature_c >= 45 ? 'heatwave' : 'weather',
        trigger_evidence: alert.rainfall_mm === 0 && alert.temperature_c >= 45 ? 
          `Severe Heatwave — Temperature reached ${alert.temperature_c}°C in ${alert.location_name} (${alert.pincode})` :
          `IMD Red Alert — rainfall ${alert.rainfall_mm}mm/hr in ${alert.location_name} (${alert.pincode})`,
        amount_paid: policy.max_payout,
        upi_txn_id: '',
        status: 'processing',
        created_at: new Date(),
        paid_at: null,
      };

      db.addClaim(claim);
      claimsTriggered++;

      broadcastSSE('claim_created', {
        claim,
        rider_name: rider.name,
        rider_upi: rider.upi_id,
        location: alert.location_name,
      });

      console.log(`💸 Claim ${claim.id} created for ${rider.name} — ₹${policy.max_payout} → ${rider.upi_id}`);

      // Process payout asynchronously (simulating 120-second window)
      processClaimPayout(claim, rider.upi_id, rider.name);

      results.push({
        rider: rider.name,
        pincode: rider.pincode,
        claim_id: claim.id,
        amount: policy.max_payout,
        upi_id: rider.upi_id,
      });
    }
  }

  console.log(`\n✅ Rain Radar Cron complete: ${claimsTriggered} claims triggered`);
  return { alerts_found: redAlerts.length, claims_triggered: claimsTriggered, results };
}

// ─── Outage Watcher Cron (every 5 minutes in production) ───────────────────

export async function outageWatcherCron(): Promise<{
  outages_found: number;
  claims_triggered: number;
  results: any[];
}> {
  console.log('\n⏰ ═══════════════════════════════════════════════════');
  console.log('⏰ OUTAGE WATCHER CRON: Polling Downdetector for platform outages...');
  console.log('⏰ ═══════════════════════════════════════════════════\n');

  const platforms: Array<'zomato' | 'swiggy'> = ['zomato', 'swiggy'];
  const results: any[] = [];
  let outageCounts = 0;
  let claimsTriggered = 0;

  for (const platform of platforms) {
    const status = checkPlatformOutage(platform);
    console.log(`📱 ${platform.toUpperCase()}: ${status.is_down ? '🔴 DOWN' : '🟢 OK'} (confidence: ${status.confidence})`);

    if (!status.is_down) continue;
    outageCounts++;

    // Log outage event
    const outageEvent: OutageEvent = {
      id: `o-${uuid().substring(0, 8)}`,
      platform,
      affected_pincodes: status.affected_pincodes,
      rider_count: 0,
      confidence_score: status.confidence,
      validated: false,
      created_at: new Date(),
    };

    // Validate cluster for each affected pincode
    let totalInactive = 0;
    let validated = false;

    for (const pincode of status.affected_pincodes) {
      const cluster = validateOutageCluster(pincode, platform);
      totalInactive += cluster.riders_inactive;
      if (cluster.validated) validated = true;
    }

    outageEvent.rider_count = totalInactive;
    outageEvent.validated = validated;
    db.addOutageEvent(outageEvent);

    broadcastSSE('outage_alert', {
      ...outageEvent,
      platform_status: status,
    });

    if (!validated) {
      console.log(`❌ Outage cluster NOT validated for ${platform} — insufficient rider count`);
      continue;
    }

    // Find eligible policies covering outage
    for (const pincode of status.affected_pincodes) {
      const eligiblePolicies = db.getActivePoliciesForPincode(pincode)
        .filter(p => p.covers_outage);

      console.log(`🔍 ${pincode}: ${eligiblePolicies.length} policies cover outage for ${platform}`);

      for (const policy of eligiblePolicies) {
        const rider = db.getRider(policy.rider_id);
        if (!rider) continue;
        if (rider.platform !== platform && rider.platform !== 'both') continue;

        const existingClaim = db.claims.find(c => c.policy_id === policy.id && c.status !== 'rejected');
        if (existingClaim) continue;

        const claim: Claim = {
          id: `c-${uuid().substring(0, 8)}`,
          policy_id: policy.id,
          rider_id: rider.id,
          trigger_type: 'outage',
          trigger_evidence: `${platform.charAt(0).toUpperCase() + platform.slice(1)} platform outage — ${totalInactive} riders inactive in affected zone`,
          amount_paid: policy.max_payout,
          upi_txn_id: '',
          status: 'processing',
          created_at: new Date(),
          paid_at: null,
        };

        db.addClaim(claim);
        claimsTriggered++;

        broadcastSSE('claim_created', {
          claim,
          rider_name: rider.name,
          rider_upi: rider.upi_id,
          platform,
        });

        processClaimPayout(claim, rider.upi_id, rider.name);

        results.push({
          rider: rider.name,
          platform,
          claim_id: claim.id,
          amount: policy.max_payout,
        });
      }
    }
  }

  console.log(`\n✅ Outage Watcher Cron complete: ${outageCounts} outages, ${claimsTriggered} claims`);
  return { outages_found: outageCounts, claims_triggered: claimsTriggered, results };
}

// ─── Curfew Watcher Cron ───────────────────────────────────────────────────

export async function curfewWatcherCron(): Promise<{
  curfews_found: number;
  claims_triggered: number;
  results: any[];
}> {
  console.log('\n⏰ ═══════════════════════════════════════════════════');
  console.log('⏰ CURFEW WATCHER CRON: Polling Mock Govt API for Section 144...');
  console.log('⏰ ═══════════════════════════════════════════════════\n');

  const pincodes = Object.keys(PINCODE_NAMES);
  const curfews = pincodes.map(pc => checkCurfew(pc)).filter(c => c.is_curfew);
  const results: any[] = [];
  let claimsTriggered = 0;

  if (curfews.length === 0) return { curfews_found: 0, claims_triggered: 0, results: [] };

  for (const curfew of curfews) {
    const eligiblePolicies = db.getActivePoliciesForPincode(curfew.pincode); // Monthly pro covers it

    for (const policy of eligiblePolicies) {
      if (policy.plan_type !== 'monthly_pro') continue; // Only highest tier covers curfews
      const rider = db.getRider(policy.rider_id);
      if (!rider) continue;

      const existingClaim = db.claims.find(c => c.policy_id === policy.id && c.status !== 'rejected');
      if (existingClaim) continue;

      const claim: Claim = {
        id: `c-${uuid().substring(0, 8)}`,
        policy_id: policy.id,
        rider_id: rider.id,
        trigger_type: 'curfew',
        trigger_evidence: `Section 144 Curfew imposed in ${curfew.location_name} (${curfew.pincode})`,
        amount_paid: policy.max_payout,
        upi_txn_id: '',
        status: 'processing',
        created_at: new Date(),
        paid_at: null,
      };

      db.addClaim(claim);
      claimsTriggered++;

      broadcastSSE('claim_created', {
        claim,
        rider_name: rider.name,
        rider_upi: rider.upi_id,
        location: curfew.location_name,
      });

      processClaimPayout(claim, rider.upi_id, rider.name);
      results.push({ rider: rider.name, pincode: rider.pincode, claim_id: claim.id, amount: claim.amount_paid });
    }
  }

  return { curfews_found: curfews.length, claims_triggered: claimsTriggered, results };
}

// ─── AQI Watcher Cron ──────────────────────────────────────────────────────

export async function aqiWatcherCron(): Promise<{
  aqi_alerts_found: number;
  claims_triggered: number;
  results: any[];
}> {
  console.log('\n⏰ ═══════════════════════════════════════════════════');
  console.log('⏰ AQI WATCHER CRON: Polling AQICN API for Hazardous Air Quality...');
  console.log('⏰ ═══════════════════════════════════════════════════\n');

  const pincodes = Object.keys(PINCODE_NAMES);
  const hazardousZones = pincodes.map(pc => ({ pincode: pc, ...checkHazardousAQI(pc) })).filter(z => z.hazardous);
  const results: any[] = [];
  let claimsTriggered = 0;

  if (hazardousZones.length === 0) return { aqi_alerts_found: 0, claims_triggered: 0, results: [] };

  for (const zone of hazardousZones) {
    const eligiblePolicies = db.getActivePoliciesForPincode(zone.pincode).filter(p => p.covers_weather);

    for (const policy of eligiblePolicies) {
      const rider = db.getRider(policy.rider_id);
      if (!rider) continue;

      const existingClaim = db.claims.find(c => c.policy_id === policy.id && c.status !== 'rejected');
      if (existingClaim) continue;

      const claim: Claim = {
        id: `c-${uuid().substring(0, 8)}`,
        policy_id: policy.id,
        rider_id: rider.id,
        trigger_type: 'aqi',
        trigger_evidence: `Hazardous AQI (${zone.aqi}) detected in ${PINCODE_NAMES[zone.pincode] || zone.pincode} (${zone.pincode})`,
        amount_paid: policy.max_payout,
        upi_txn_id: '',
        status: 'processing',
        created_at: new Date(),
        paid_at: null,
      };

      db.addClaim(claim);
      claimsTriggered++;

      broadcastSSE('claim_created', {
        claim,
        rider_name: rider.name,
        rider_upi: rider.upi_id,
        location: PINCODE_NAMES[zone.pincode] || zone.pincode,
      });

      processClaimPayout(claim, rider.upi_id, rider.name);
      results.push({ rider: rider.name, pincode: rider.pincode, claim_id: claim.id, amount: claim.amount_paid });
    }
  }

  return { aqi_alerts_found: hazardousZones.length, claims_triggered: claimsTriggered, results };
}

// ─── Auto Claim Processor ──────────────────────────────────────────────────

async function processClaimPayout(claim: Claim, upiId: string, riderName: string): Promise<void> {
  console.log(`\n⏳ Processing payout for ${riderName} — Claim ${claim.id} (₹${claim.amount_paid})`);
  console.log(`   ⏱️ Payout target: <120 seconds`);

  broadcastSSE('claim_processing', {
    claim_id: claim.id,
    rider_name: riderName,
    amount: claim.amount_paid,
    upi_id: upiId,
    status: 'processing',
  });

  try {
    const payoutResult = await disburseClaim(upiId, claim.amount_paid, claim.id);

    if (payoutResult.success) {
      db.updateClaimStatus(claim.id, 'paid', payoutResult.txn_id);
      
      // Update policy status
      const policy = db.getPolicy(claim.policy_id);
      if (policy) policy.status = 'claimed';

      console.log(`\n🎉 ════════════════════════════════════════════════`);
      console.log(`🎉 PAYOUT COMPLETE: ₹${claim.amount_paid} → ${upiId}`);
      console.log(`🎉 Rider: ${riderName}`);
      console.log(`🎉 Txn ID: ${payoutResult.txn_id}`);
      console.log(`🎉 Processing time: ${payoutResult.processing_time_ms}ms`);
      console.log(`🎉 ════════════════════════════════════════════════\n`);

      broadcastSSE('claim_paid', {
        claim_id: claim.id,
        rider_name: riderName,
        amount: claim.amount_paid,
        upi_id: upiId,
        txn_id: payoutResult.txn_id,
        processing_time_ms: payoutResult.processing_time_ms,
      });
    }
  } catch (error) {
    console.error(`❌ Payout failed for ${riderName}:`, error);
    db.updateClaimStatus(claim.id, 'rejected');

    broadcastSSE('claim_failed', {
      claim_id: claim.id,
      rider_name: riderName,
      error: 'Payment processing failed',
    });
  }
}

/**
 * Manual auto-claim processor — processes all pending claims
 */
export async function autoClaimProcessor(): Promise<{
  processed: number;
  paid: number;
  failed: number;
}> {
  const pendingClaims = db.claims.filter(c => c.status === 'pending' || c.status === 'processing');
  let paid = 0;
  let failed = 0;

  for (const claim of pendingClaims) {
    const rider = db.getRider(claim.rider_id);
    if (!rider) { failed++; continue; }

    await processClaimPayout(claim, rider.upi_id, rider.name);
    if (claim.status === 'paid') paid++;
    else failed++;
  }

  return { processed: pendingClaims.length, paid, failed };
}

export { broadcastSSE };
