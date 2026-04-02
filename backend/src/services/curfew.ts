/**
 * OffShift — Curfew & Section 144 Oracle Service
 * Mock Government API integration for civic disruptions
 */

import { PINCODE_NAMES } from './weather';

let simulatedCurfews: string[] = [];

export interface CurfewStatus {
  pincode: string;
  location_name: string;
  is_curfew: boolean;
  reason?: string;
  source: string;
  timestamp: string;
}

/**
 * Check if there is an active curfew/Section 144 in the given pincode
 */
export function checkCurfew(pincode: string): CurfewStatus {
  const name = PINCODE_NAMES[pincode] || 'Delhi NCR';
  
  if (simulatedCurfews.includes(pincode) || simulatedCurfews.includes('ALL')) {
    console.log(`⛔ Curfew Oracle: SIMULATED Section 144 detected in ${name} (${pincode})`);
    return {
      pincode,
      location_name: name,
      is_curfew: true,
      reason: 'Section 144 imposed due to civil unrest',
      source: 'Local Govt Mock API',
      timestamp: new Date().toISOString(),
    };
  }

  return {
    pincode,
    location_name: name,
    is_curfew: false,
    source: 'Local Govt Mock API',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Simulate a curfew (used by admin dashboard "Simulate Curfew" button)
 */
export function simulateCurfew(pincodes: string[]): void {
  console.log(`⛔ CURFEW SIMULATION: Triggering Section 144 for pincodes: ${pincodes.join(', ')}`);
  simulatedCurfews = pincodes;
}

/**
 * Clear simulated curfew
 */
export function clearCurfewSimulation(): void {
  simulatedCurfews = [];
  console.log('🕊️ Curfew simulation cleared — normal movement restored');
}
