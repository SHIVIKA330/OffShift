/**
 * OffShift — Weather Oracle Service
 * Mock IMD API integration for weather alerts and forecasts
 */

import { AlertLevel } from '../models/types';

export interface WeatherAlert {
  alert_level: AlertLevel;
  rainfall_mm: number;
  temperature_c: number;
  humidity: number;
  wind_speed_kmh: number;
  pincode: string;
  location_name: string;
  source: string;
  cross_verified: boolean;
  timestamp: string;
}

export interface ForecastEntry {
  hour: number;
  rainfall_mm: number;
  temperature_c: number;
  storm_probability: number;
  alert_level: AlertLevel;
}

export interface RainRadarResponse {
  pincode: string;
  location_name: string;
  forecast_48hr: ForecastEntry[];
  max_storm_probability: number;
  expected_peak_rainfall_mm: number;
  alert_level: AlertLevel;
}

// Location name lookup
const PINCODE_NAMES: Record<string, string> = {
  '110020': 'Okhla', '110025': 'Kalkaji', '110001': 'Connaught Place',
  '110045': 'Dwarka', '110017': 'Hauz Khas', '110019': 'Saket',
  '110048': 'Nehru Place', '110070': 'Vasant Kunj', '122001': 'Gurgaon',
  '122002': 'Gurgaon Sec 14', '122018': 'Cyber City', '201301': 'Noida',
  '201303': 'Noida Sec 62', '201304': 'Greater Noida',
  '110085': 'Laxmi Nagar', '110092': 'Shahdara',
};

// Simulated weather state (can be mutated for demo)
let simulatedAlerts: Record<string, { level: AlertLevel; rainfall: number; temp: number }> = {};

/**
 * Get current weather alert for a pincode
 * Mock IMD API response
 */
export function getCurrentWeatherAlert(pincode: string): WeatherAlert {
  const name = PINCODE_NAMES[pincode] || 'Delhi NCR';
  
  // Check for simulated alerts first
  if (simulatedAlerts[pincode]) {
    const sim = simulatedAlerts[pincode];
    console.log(`🌧️ Weather Oracle: Returning SIMULATED alert for ${name} (${pincode}) — ${sim.level.toUpperCase()}`);
    return {
      alert_level: sim.level,
      rainfall_mm: sim.rainfall,
      temperature_c: sim.temp,
      humidity: 85 + Math.random() * 10,
      wind_speed_kmh: 30 + Math.random() * 40,
      pincode,
      location_name: name,
      source: 'IMD (Simulated)',
      cross_verified: true,
      timestamp: new Date().toISOString(),
    };
  }

  // Default: return green/safe weather
  const baseRainfall = Math.random() * 15;
  const baseTemp = 28 + Math.random() * 10;
  let alertLevel: AlertLevel = 'green';
  if (baseRainfall > 12) alertLevel = 'yellow';

  return {
    alert_level: alertLevel,
    rainfall_mm: Math.round(baseRainfall * 10) / 10,
    temperature_c: Math.round(baseTemp * 10) / 10,
    humidity: 60 + Math.random() * 25,
    wind_speed_kmh: 5 + Math.random() * 20,
    pincode,
    location_name: name,
    source: 'IMD',
    cross_verified: true,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 48-hour rain radar forecast
 */
export function checkRainRadar(pincode: string): RainRadarResponse {
  const name = PINCODE_NAMES[pincode] || 'Delhi NCR';
  const forecast: ForecastEntry[] = [];

  // Check if there's a simulated storm
  const hasSim = !!simulatedAlerts[pincode];
  const simPeak = hasSim ? simulatedAlerts[pincode].rainfall : 0;

  for (let h = 0; h < 48; h++) {
    let rainfall = Math.random() * 10;
    let stormProb = 0.1 + Math.random() * 0.2;
    let temp = 28 + Math.random() * 8;

    // If simulated, create a realistic storm curve peaking around hour 6-12
    if (hasSim) {
      const peakHour = 8;
      const distance = Math.abs(h - peakHour);
      const stormFactor = Math.max(0, 1 - distance / 12);
      rainfall = simPeak * stormFactor * (0.7 + Math.random() * 0.3);
      stormProb = Math.min(0.95, stormFactor * 0.9 + 0.1);
      temp = 22 + Math.random() * 6; // Cooler during rain
    }

    let alertLevel: AlertLevel = 'green';
    if (rainfall > 65) alertLevel = 'red';
    else if (rainfall > 35) alertLevel = 'orange';
    else if (rainfall > 15) alertLevel = 'yellow';

    forecast.push({
      hour: h,
      rainfall_mm: Math.round(rainfall * 10) / 10,
      temperature_c: Math.round(temp * 10) / 10,
      storm_probability: Math.round(stormProb * 100) / 100,
      alert_level: alertLevel,
    });
  }

  const maxProb = Math.max(...forecast.map(f => f.storm_probability));
  const maxRainfall = Math.max(...forecast.map(f => f.rainfall_mm));
  let overallAlert: AlertLevel = 'green';
  if (maxRainfall > 65) overallAlert = 'red';
  else if (maxRainfall > 35) overallAlert = 'orange';
  else if (maxRainfall > 15) overallAlert = 'yellow';

  return {
    pincode,
    location_name: name,
    forecast_48hr: forecast,
    max_storm_probability: maxProb,
    expected_peak_rainfall_mm: Math.round(maxRainfall * 10) / 10,
    alert_level: overallAlert,
  };
}

/**
 * Simulate a storm (used by admin dashboard "Simulate Storm" button)
 */
export function simulateStorm(pincodes: string[], rainfallMm: number = 75): void {
  console.log(`⛈️ STORM SIMULATION: Triggering Red Alert for pincodes: ${pincodes.join(', ')}`);
  pincodes.forEach(pc => {
    simulatedAlerts[pc] = {
      level: rainfallMm >= 65 ? 'red' : rainfallMm >= 35 ? 'orange' : 'yellow',
      rainfall: rainfallMm,
      temp: 24 + Math.random() * 4,
    };
  });
}

/**
 * Simulate a heatwave
 */
export function simulateHeatwave(pincodes: string[], tempC: number = 47.5): void {
  console.log(`🔥 HEATWAVE SIMULATION: Triggering Severe Heat Alert (Red) for pincodes: ${pincodes.join(', ')}`);
  pincodes.forEach(pc => {
    simulatedAlerts[pc] = {
      level: 'red',
      rainfall: 0,
      temp: tempC, 
    };
  });
}

/**
 * Clear simulated alerts
 */
export function clearSimulation(): void {
  simulatedAlerts = {};
  console.log('☀️ Weather simulation cleared — back to normal conditions');
}

/**
 * Get all current alerts across all pincodes
 */
export function getAllAlerts(): WeatherAlert[] {
  return Object.keys(PINCODE_NAMES).map(pc => getCurrentWeatherAlert(pc));
}

export { PINCODE_NAMES };
