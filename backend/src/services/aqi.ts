import { PINCODE_NAMES } from './weather';

let simulatedHazardousZones: string[] = [];

export function checkHazardousAQI(pincode: string): { aqi: number; hazardous: boolean } {
  if (simulatedHazardousZones.includes(pincode)) {
    return { aqi: Math.floor(Math.random() * 100) + 400, hazardous: true };
  }
  const aqiBase = Math.floor(Math.random() * 100) + 150;
  return { aqi: aqiBase, hazardous: aqiBase > 300 };
}

export function simulateHazardousAQI(pincodes?: string[]): void {
  if (pincodes && pincodes.length > 0) {
    simulatedHazardousZones = [...pincodes];
  } else {
    const pincodeList = Object.keys(PINCODE_NAMES);
    const affected1 = pincodeList[Math.floor(Math.random() * pincodeList.length)];
    const affected2 = pincodeList[Math.floor(Math.random() * pincodeList.length)];
    simulatedHazardousZones = [affected1, affected2];
  }
  console.log(`[AQI Oracle] Simulated HAZARDOUS AQI (AQI > 400) in ${simulatedHazardousZones.join(', ')}`);
}

export function clearAQISimulation(): void {
  simulatedHazardousZones = [];
}

export function getSimulatedAQIZones(): string[] {
  return simulatedHazardousZones;
}
