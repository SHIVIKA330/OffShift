/**
 * OffShift — Mock Data Store
 * In-memory database with 20 realistic Delhi NCR riders
 */

import { v4 as uuid } from 'uuid';
import { Rider, Policy, Claim, WeatherEvent, OutageEvent, PlanType } from '../models/types';

// ─── Mock Riders (20 realistic Delhi NCR profiles) ─────────────────────────

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

export const mockRiders: Rider[] = [
  { id: 'r-001', name: 'Rajesh Kumar', phone: '+919876543210', pincode: '110020', platform: 'zomato', upi_id: 'rajesh@ybl', kavach_score: 72, trust_score: 0.88, days_active: 245, shift_pattern: 'evening', created_at: daysAgo(245) },
  { id: 'r-002', name: 'Amit Sharma', phone: '+919876543211', pincode: '122001', platform: 'swiggy', upi_id: 'amit.sharma@paytm', kavach_score: 65, trust_score: 0.82, days_active: 180, shift_pattern: 'morning', created_at: daysAgo(180) },
  { id: 'r-003', name: 'Priya Singh', phone: '+919876543212', pincode: '201301', platform: 'zomato', upi_id: 'priya.s@ybl', kavach_score: 58, trust_score: 0.91, days_active: 320, shift_pattern: 'mixed', created_at: daysAgo(320) },
  { id: 'r-004', name: 'Suresh Yadav', phone: '+919876543213', pincode: '110045', platform: 'swiggy', upi_id: 'suresh.yadav@upi', kavach_score: 45, trust_score: 0.75, days_active: 120, shift_pattern: 'evening', created_at: daysAgo(120) },
  { id: 'r-005', name: 'Deepak Verma', phone: '+919876543214', pincode: '110020', platform: 'zomato', upi_id: 'deepak.v@paytm', kavach_score: 80, trust_score: 0.70, days_active: 60, shift_pattern: 'night', created_at: daysAgo(60) },
  { id: 'r-006', name: 'Meena Kumari', phone: '+919876543215', pincode: '122001', platform: 'both', upi_id: 'meena.k@ybl', kavach_score: 55, trust_score: 0.85, days_active: 200, shift_pattern: 'morning', created_at: daysAgo(200) },
  { id: 'r-007', name: 'Ravi Tiwari', phone: '+919876543216', pincode: '201301', platform: 'swiggy', upi_id: 'ravi.t@phonepe', kavach_score: 68, trust_score: 0.78, days_active: 150, shift_pattern: 'evening', created_at: daysAgo(150) },
  { id: 'r-008', name: 'Sanjay Gupta', phone: '+919876543217', pincode: '110001', platform: 'zomato', upi_id: 'sanjay.g@ybl', kavach_score: 62, trust_score: 0.92, days_active: 365, shift_pattern: 'mixed', created_at: daysAgo(365) },
  { id: 'r-009', name: 'Neha Joshi', phone: '+919876543218', pincode: '110045', platform: 'swiggy', upi_id: 'neha.j@paytm', kavach_score: 48, trust_score: 0.80, days_active: 90, shift_pattern: 'morning', created_at: daysAgo(90) },
  { id: 'r-010', name: 'Vikram Singh', phone: '+919876543219', pincode: '122018', platform: 'zomato', upi_id: 'vikram.s@upi', kavach_score: 75, trust_score: 0.86, days_active: 280, shift_pattern: 'evening', created_at: daysAgo(280) },
  { id: 'r-011', name: 'Pooja Rawat', phone: '+919876543220', pincode: '110085', platform: 'both', upi_id: 'pooja.r@ybl', kavach_score: 70, trust_score: 0.79, days_active: 170, shift_pattern: 'night', created_at: daysAgo(170) },
  { id: 'r-012', name: 'Mohit Chauhan', phone: '+919876543221', pincode: '201303', platform: 'swiggy', upi_id: 'mohit.c@phonepe', kavach_score: 52, trust_score: 0.88, days_active: 210, shift_pattern: 'morning', created_at: daysAgo(210) },
  { id: 'r-013', name: 'Arun Pandey', phone: '+919876543222', pincode: '110017', platform: 'zomato', upi_id: 'arun.p@ybl', kavach_score: 60, trust_score: 0.83, days_active: 140, shift_pattern: 'mixed', created_at: daysAgo(140) },
  { id: 'r-014', name: 'Sunita Devi', phone: '+919876543223', pincode: '110092', platform: 'swiggy', upi_id: 'sunita.d@paytm', kavach_score: 67, trust_score: 0.76, days_active: 100, shift_pattern: 'evening', created_at: daysAgo(100) },
  { id: 'r-015', name: 'Karan Malhotra', phone: '+919876543224', pincode: '122002', platform: 'zomato', upi_id: 'karan.m@upi', kavach_score: 78, trust_score: 0.90, days_active: 300, shift_pattern: 'morning', created_at: daysAgo(300) },
  { id: 'r-016', name: 'Anita Rao', phone: '+919876543225', pincode: '110048', platform: 'both', upi_id: 'anita.r@ybl', kavach_score: 54, trust_score: 0.84, days_active: 160, shift_pattern: 'evening', created_at: daysAgo(160) },
  { id: 'r-017', name: 'Rahul Jha', phone: '+919876543226', pincode: '110019', platform: 'swiggy', upi_id: 'rahul.j@phonepe', kavach_score: 63, trust_score: 0.77, days_active: 85, shift_pattern: 'night', created_at: daysAgo(85) },
  { id: 'r-018', name: 'Geeta Sharma', phone: '+919876543227', pincode: '110070', platform: 'zomato', upi_id: 'geeta.s@paytm', kavach_score: 42, trust_score: 0.93, days_active: 400, shift_pattern: 'mixed', created_at: daysAgo(400) },
  { id: 'r-019', name: 'Manoj Thakur', phone: '+919876543228', pincode: '201304', platform: 'swiggy', upi_id: 'manoj.t@ybl', kavach_score: 71, trust_score: 0.81, days_active: 190, shift_pattern: 'morning', created_at: daysAgo(190) },
  { id: 'r-020', name: 'Kavita Nair', phone: '+919876543229', pincode: '110025', platform: 'zomato', upi_id: 'kavita.n@upi', kavach_score: 56, trust_score: 0.87, days_active: 230, shift_pattern: 'evening', created_at: daysAgo(230) },
];

// ─── Mock Policies ─────────────────────────────────────────────────────────

export const mockPolicies: Policy[] = [
  { id: 'p-001', rider_id: 'r-001', plan_type: 'weekly_pass', premium_paid: 99, max_payout: 1500, start_date: daysAgo(2), end_date: new Date(now.getTime() + 5 * 86400000), status: 'active', covers_weather: true, covers_outage: true, created_at: daysAgo(2) },
  { id: 'p-002', rider_id: 'r-002', plan_type: 'monthly_pro', premium_paid: 349, max_payout: 4000, start_date: daysAgo(10), end_date: new Date(now.getTime() + 20 * 86400000), status: 'active', covers_weather: true, covers_outage: true, created_at: daysAgo(10) },
  { id: 'p-003', rider_id: 'r-003', plan_type: 'shift_pass', premium_paid: 49, max_payout: 500, start_date: daysAgo(0), end_date: new Date(now.getTime() + 1 * 86400000), status: 'active', covers_weather: true, covers_outage: false, created_at: daysAgo(0) },
  { id: 'p-004', rider_id: 'r-005', plan_type: 'weekly_pass', premium_paid: 109, max_payout: 1500, start_date: daysAgo(3), end_date: new Date(now.getTime() + 4 * 86400000), status: 'active', covers_weather: true, covers_outage: true, created_at: daysAgo(3) },
  { id: 'p-005', rider_id: 'r-008', plan_type: 'monthly_pro', premium_paid: 349, max_payout: 4000, start_date: daysAgo(15), end_date: new Date(now.getTime() + 15 * 86400000), status: 'active', covers_weather: true, covers_outage: true, created_at: daysAgo(15) },
  { id: 'p-006', rider_id: 'r-010', plan_type: 'weekly_pass', premium_paid: 114, max_payout: 1500, start_date: daysAgo(1), end_date: new Date(now.getTime() + 6 * 86400000), status: 'active', covers_weather: true, covers_outage: true, created_at: daysAgo(1) },
  { id: 'p-007', rider_id: 'r-011', plan_type: 'shift_pass', premium_paid: 39, max_payout: 500, start_date: daysAgo(0), end_date: new Date(now.getTime() + 1 * 86400000), status: 'active', covers_weather: true, covers_outage: false, created_at: daysAgo(0) },
  { id: 'p-008', rider_id: 'r-015', plan_type: 'monthly_pro', premium_paid: 349, max_payout: 4000, start_date: daysAgo(20), end_date: new Date(now.getTime() + 10 * 86400000), status: 'active', covers_weather: true, covers_outage: true, created_at: daysAgo(20) },
  { id: 'p-009', rider_id: 'r-018', plan_type: 'weekly_pass', premium_paid: 92, max_payout: 1500, start_date: daysAgo(5), end_date: new Date(now.getTime() + 2 * 86400000), status: 'active', covers_weather: true, covers_outage: true, created_at: daysAgo(5) },
  { id: 'p-010', rider_id: 'r-020', plan_type: 'shift_pass', premium_paid: 49, max_payout: 500, start_date: daysAgo(1), end_date: new Date(now.getTime() + 0.5 * 86400000), status: 'active', covers_weather: true, covers_outage: false, created_at: daysAgo(1) },
  // Past policies (expired/claimed)
  { id: 'p-011', rider_id: 'r-001', plan_type: 'shift_pass', premium_paid: 49, max_payout: 500, start_date: daysAgo(15), end_date: daysAgo(14), status: 'claimed', covers_weather: true, covers_outage: false, created_at: daysAgo(15) },
  { id: 'p-012', rider_id: 'r-003', plan_type: 'weekly_pass', premium_paid: 99, max_payout: 1500, start_date: daysAgo(20), end_date: daysAgo(13), status: 'expired', covers_weather: true, covers_outage: true, created_at: daysAgo(20) },
  { id: 'p-013', rider_id: 'r-010', plan_type: 'shift_pass', premium_paid: 45, max_payout: 500, start_date: daysAgo(30), end_date: daysAgo(29), status: 'claimed', covers_weather: true, covers_outage: false, created_at: daysAgo(30) },
];

// ─── Mock Claims ───────────────────────────────────────────────────────────

export const mockClaims: Claim[] = [
  { id: 'c-001', policy_id: 'p-011', rider_id: 'r-001', trigger_type: 'weather', trigger_evidence: 'IMD Red Alert — rainfall 74.2mm/hr in pincode 110020 (Okhla)', amount_paid: 500, upi_txn_id: 'TXN_RZP_20260315_001', status: 'paid', created_at: daysAgo(14), paid_at: daysAgo(14) },
  { id: 'c-002', policy_id: 'p-013', rider_id: 'r-010', trigger_type: 'weather', trigger_evidence: 'IMD Red Alert — rainfall 68.5mm/hr in pincode 122018 (Cyber City)', amount_paid: 500, upi_txn_id: 'TXN_RZP_20260228_002', status: 'paid', created_at: daysAgo(29), paid_at: daysAgo(29) },
  { id: 'c-003', policy_id: 'p-002', rider_id: 'r-002', trigger_type: 'outage', trigger_evidence: 'Swiggy platform outage detected — 63 riders inactive in Gurgaon cluster', amount_paid: 1500, upi_txn_id: 'TXN_RZP_20260325_003', status: 'paid', created_at: daysAgo(5), paid_at: daysAgo(5) },
];

// ─── Mock Weather Events ───────────────────────────────────────────────────

export const mockWeatherEvents: WeatherEvent[] = [
  { id: 'w-001', pincode: '110020', alert_level: 'red', rainfall_mm: 74.2, temperature_c: 28, source: 'IMD', created_at: daysAgo(14) },
  { id: 'w-002', pincode: '122018', alert_level: 'red', rainfall_mm: 68.5, temperature_c: 30, source: 'IMD', created_at: daysAgo(29) },
  { id: 'w-003', pincode: '110020', alert_level: 'orange', rainfall_mm: 45.0, temperature_c: 32, source: 'IMD', created_at: daysAgo(7) },
  { id: 'w-004', pincode: '122001', alert_level: 'yellow', rainfall_mm: 30.0, temperature_c: 34, source: 'IMD', created_at: daysAgo(3) },
  { id: 'w-005', pincode: '201301', alert_level: 'green', rainfall_mm: 5.0, temperature_c: 36, source: 'IMD', created_at: daysAgo(1) },
];

// ─── Mock Outage Events ────────────────────────────────────────────────────

export const mockOutageEvents: OutageEvent[] = [
  { id: 'o-001', platform: 'swiggy', affected_pincodes: ['122001', '122002', '122018'], rider_count: 63, confidence_score: 0.87, validated: true, created_at: daysAgo(5) },
  { id: 'o-002', platform: 'zomato', affected_pincodes: ['110020', '110025'], rider_count: 45, confidence_score: 0.72, validated: false, created_at: daysAgo(12) },
];

// ─── In-Memory Data Store ──────────────────────────────────────────────────

class DataStore {
  riders: Rider[] = [...mockRiders];
  policies: Policy[] = [...mockPolicies];
  claims: Claim[] = [...mockClaims];
  weatherEvents: WeatherEvent[] = [...mockWeatherEvents];
  outageEvents: OutageEvent[] = [...mockOutageEvents];

  // Event subscribers for real-time updates
  private eventListeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(cb => cb(data));
  }

  // Rider operations
  addRider(rider: Rider): Rider {
    this.riders.push(rider);
    this.emit('rider:created', rider);
    return rider;
  }

  getRider(id: string): Rider | undefined {
    return this.riders.find(r => r.id === id);
  }

  getRiderByPhone(phone: string): Rider | undefined {
    return this.riders.find(r => r.phone === phone);
  }

  // Policy operations
  addPolicy(policy: Policy): Policy {
    this.policies.push(policy);
    this.emit('policy:created', policy);
    return policy;
  }

  getPolicy(id: string): Policy | undefined {
    return this.policies.find(p => p.id === id);
  }

  getActivePoliciesForRider(riderId: string): Policy[] {
    return this.policies.filter(p => p.rider_id === riderId && p.status === 'active');
  }

  getActivePoliciesForPincode(pincode: string): Policy[] {
    const riderIds = this.riders.filter(r => r.pincode === pincode).map(r => r.id);
    return this.policies.filter(p => riderIds.includes(p.rider_id) && p.status === 'active');
  }

  // Claim operations
  addClaim(claim: Claim): Claim {
    this.claims.push(claim);
    this.emit('claim:created', claim);
    return claim;
  }

  getClaim(id: string): Claim | undefined {
    return this.claims.find(c => c.id === id);
  }

  updateClaimStatus(id: string, status: Claim['status'], txn_id?: string): Claim | undefined {
    const claim = this.claims.find(c => c.id === id);
    if (claim) {
      claim.status = status;
      if (txn_id) claim.upi_txn_id = txn_id;
      if (status === 'paid') claim.paid_at = new Date();
      this.emit('claim:updated', claim);
    }
    return claim;
  }

  // Weather operations
  addWeatherEvent(event: WeatherEvent): WeatherEvent {
    this.weatherEvents.push(event);
    this.emit('weather:alert', event);
    return event;
  }

  // Outage operations
  addOutageEvent(event: OutageEvent): OutageEvent {
    this.outageEvents.push(event);
    this.emit('outage:detected', event);
    return event;
  }

  // Analytics
  getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const claimsPaidToday = this.claims.filter(c => 
      c.status === 'paid' && c.paid_at && c.paid_at >= today
    );

    const activePolicies = this.policies.filter(p => p.status === 'active');

    const totalPayout = this.claims
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.amount_paid, 0);

    const totalPremium = this.policies
      .reduce((sum, p) => sum + p.premium_paid, 0);

    const riderDistribution: Record<string, number> = {};
    this.riders.forEach(r => {
      riderDistribution[r.pincode] = (riderDistribution[r.pincode] || 0) + 1;
    });

    const planDistribution: Record<string, number> = { shift_pass: 0, weekly_pass: 0, monthly_pro: 0 };
    activePolicies.forEach(p => {
      planDistribution[p.plan_type]++;
    });

    return {
      total_riders: this.riders.length,
      active_policies: activePolicies.length,
      claims_paid_today: claimsPaidToday.length,
      total_payout_amount: totalPayout,
      total_premium_collected: totalPremium,
      active_weather_alerts: this.weatherEvents.filter(w => w.alert_level === 'red' || w.alert_level === 'orange'),
      active_outages: this.outageEvents.filter(o => !o.validated || o.confidence_score > 0.7),
      recent_claims: [...this.claims].sort((a, b) => b.created_at.getTime() - a.created_at.getTime()).slice(0, 10),
      rider_distribution: riderDistribution,
      plan_distribution: planDistribution as Record<any, number>,
    };
  }
}

// Singleton instance
export const db = new DataStore();
