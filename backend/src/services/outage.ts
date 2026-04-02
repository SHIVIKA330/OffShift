/**
 * OffShift — Outage Detection Service
 * Mock Downdetector scraper + GPS cluster validation
 */

export interface OutageStatus {
  is_down: boolean;
  platform: 'zomato' | 'swiggy';
  affected_pincodes: string[];
  reports_30min: number;
  confidence: number;
  outage_score: number;
  anomaly_detected: boolean;
  source: string;
  timestamp: string;
}

export interface ClusterValidation {
  pincode: string;
  platform: string;
  riders_inactive: number;
  total_riders: number;
  inactivity_ratio: number;
  validated: boolean;
  geo_radius_km: number;
}

// Simulated outage state
let simulatedOutages: Record<string, {
  is_down: boolean;
  pincodes: string[];
  confidence: number;
}> = {};

/**
 * Check for platform outage (mock Downdetector + crowdsourced GPS)
 */
export function checkPlatformOutage(platform: 'zomato' | 'swiggy'): OutageStatus {
  // Check for simulated outage
  if (simulatedOutages[platform]) {
    const sim = simulatedOutages[platform];
    console.log(`📱 Outage Oracle: SIMULATED ${platform.toUpperCase()} outage detected! Confidence: ${sim.confidence}`);
    return {
      is_down: sim.is_down,
      platform,
      affected_pincodes: sim.pincodes,
      reports_30min: 800 + Math.floor(Math.random() * 600),
      confidence: sim.confidence,
      outage_score: sim.confidence * 100,
      anomaly_detected: true,
      source: 'Downdetector (Simulated)',
      timestamp: new Date().toISOString(),
    };
  }

  // Default: no outage
  const reports = Math.floor(Math.random() * 30);
  return {
    is_down: false,
    platform,
    affected_pincodes: [],
    reports_30min: reports,
    confidence: 0.05 + Math.random() * 0.1,
    outage_score: reports * 0.3,
    anomaly_detected: false,
    source: 'Downdetector',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate outage cluster using GPS inactivity analysis
 * Anti-fraud: Only validate if 50+ riders in same 5km cluster show simultaneous GPS inactivity
 */
export function validateOutageCluster(pincode: string, platform: string): ClusterValidation {
  const isSimulated = !!simulatedOutages[platform];
  
  // Simulate rider counts and inactivity
  const totalRiders = 40 + Math.floor(Math.random() * 80);
  let inactiveRiders: number;

  if (isSimulated && simulatedOutages[platform].pincodes.includes(pincode)) {
    // During simulated outage: high inactivity
    inactiveRiders = Math.floor(totalRiders * (0.65 + Math.random() * 0.25));
  } else {
    // Normal conditions: low inactivity
    inactiveRiders = Math.floor(totalRiders * (0.05 + Math.random() * 0.10));
  }

  const ratio = inactiveRiders / totalRiders;
  const validated = inactiveRiders >= 50 && ratio > 0.5;

  if (validated) {
    console.log(`✅ Outage Cluster VALIDATED: ${inactiveRiders}/${totalRiders} riders inactive in ${pincode} for ${platform}`);
  }

  return {
    pincode,
    platform,
    riders_inactive: inactiveRiders,
    total_riders: totalRiders,
    inactivity_ratio: Math.round(ratio * 100) / 100,
    validated,
    geo_radius_km: 5,
  };
}

/**
 * Simulate a platform outage (used by admin dashboard)
 */
export function simulateOutage(platform: 'zomato' | 'swiggy', pincodes?: string[]): void {
  const defaultPincodes = platform === 'zomato' 
    ? ['110020', '110025', '110048', '110017']
    : ['122001', '122002', '122018', '201301'];

  simulatedOutages[platform] = {
    is_down: true,
    pincodes: pincodes || defaultPincodes,
    confidence: 0.85 + Math.random() * 0.1,
  };

  console.log(`🔴 OUTAGE SIMULATION: ${platform.toUpperCase()} is DOWN in pincodes: ${(pincodes || defaultPincodes).join(', ')}`);
}

/**
 * Clear simulated outage
 */
export function clearOutageSimulation(platform?: string): void {
  if (platform) {
    delete simulatedOutages[platform];
  } else {
    simulatedOutages = {};
  }
  console.log('🟢 Outage simulation cleared — all platforms operational');
}

/**
 * Get status of all platforms
 */
export function getAllPlatformStatus(): Record<string, OutageStatus> {
  return {
    zomato: checkPlatformOutage('zomato'),
    swiggy: checkPlatformOutage('swiggy'),
  };
}
