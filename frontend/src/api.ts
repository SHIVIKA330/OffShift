const API = 'http://localhost:3001/api';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Rider {
  id: string; name: string; phone: string; pincode: string; platform: string;
  upi_id: string; kavach_score: number; trust_score: number; days_active: number;
  shift_pattern: string; created_at: string;
  active_policy?: any; total_claims?: number; last_payout?: any;
}

interface Policy {
  id: string; rider_id: string; plan_type: string; premium_paid: number;
  max_payout: number; start_date: string; end_date: string; status: string;
  rider_name?: string;
}

interface Claim {
  id: string; policy_id: string; rider_id: string; trigger_type: string;
  trigger_evidence: string; amount_paid: number; upi_txn_id: string;
  status: string; created_at: string; paid_at: string | null;
  rider_name?: string; rider_upi?: string; plan_type?: string;
}

interface DashboardStats {
  total_riders: number; active_policies: number; claims_paid_today: number;
  total_payout_amount: number; total_premium_collected: number;
  rider_distribution: Record<string, number>;
  plan_distribution: Record<string, number>;
  recent_claims: Claim[];
}

interface WeatherAlert {
  alert_level: string; rainfall_mm: number; temperature_c: number;
  pincode: string; location_name: string; source: string; timestamp: string;
}

interface Toast { id: number; type: string; message: string; emoji: string; }

// ─── API Calls ──────────────────────────────────────────────────────────────

async function fetchJSON(url: string, options?: RequestInit) {
  try {
    const r = await fetch(url, options);
    return await r.json();
  } catch { return { success: false, error: 'Network error' }; }
}

export { API, fetchJSON };
export type { Rider, Policy, Claim, DashboardStats, WeatherAlert, Toast };
