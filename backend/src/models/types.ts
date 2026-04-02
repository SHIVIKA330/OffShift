/**
 * OffShift Database Models & TypeScript Interfaces
 * Corresponds to Supabase PostgreSQL schema
 */

// ─── Rider (Insured Worker) ────────────────────────────────────────────────

export interface Rider {
  id: string;
  name: string;
  phone: string;
  pincode: string;
  platform: 'zomato' | 'swiggy' | 'both';
  upi_id: string;
  kavach_score: number;
  trust_score: number;
  days_active: number;
  shift_pattern: 'morning' | 'evening' | 'night' | 'mixed';
  created_at: Date;
}

// ─── Policy (Insurance Plan) ───────────────────────────────────────────────

export type PlanType = 'shift_pass' | 'weekly_pass' | 'monthly_pro';
export type PolicyStatus = 'active' | 'expired' | 'claimed' | 'cancelled';

export interface Policy {
  id: string;
  rider_id: string;
  plan_type: PlanType;
  premium_paid: number;
  max_payout: number;
  start_date: Date;
  end_date: Date;
  status: PolicyStatus;
  covers_weather: boolean;
  covers_outage: boolean;
  bonus_hours?: number;
  created_at: Date;
}

// ─── Claim (Insurance Payout) ──────────────────────────────────────────────

export type ClaimStatus = 'pending' | 'processing' | 'paid' | 'rejected';
export type TriggerType = 'weather' | 'outage' | 'curfew' | 'heatwave' | 'aqi';

export interface Claim {
  id: string;
  policy_id: string;
  rider_id: string;
  trigger_type: TriggerType;
  trigger_evidence: string;
  amount_paid: number;
  upi_txn_id: string;
  status: ClaimStatus;
  created_at: Date;
  paid_at: Date | null;
}

// ─── Weather Event ─────────────────────────────────────────────────────────

export type AlertLevel = 'green' | 'yellow' | 'orange' | 'red';

export interface WeatherEvent {
  id: string;
  pincode: string;
  alert_level: AlertLevel;
  rainfall_mm: number;
  temperature_c: number;
  source: string;
  created_at: Date;
}

// ─── Outage Event ──────────────────────────────────────────────────────────

export interface OutageEvent {
  id: string;
  platform: 'zomato' | 'swiggy';
  affected_pincodes: string[];
  rider_count: number;
  confidence_score: number;
  validated: boolean;
  created_at: Date;
}

// ─── Dashboard Analytics ───────────────────────────────────────────────────

export interface DashboardStats {
  total_riders: number;
  active_policies: number;
  claims_paid_today: number;
  total_payout_amount: number;
  total_premium_collected: number;
  active_weather_alerts: WeatherEvent[];
  active_outages: OutageEvent[];
  recent_claims: Claim[];
  rider_distribution: Record<string, number>;
  plan_distribution: Record<PlanType, number>;
}

// ─── API Response Types ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// ─── SQL Schema (for reference) ────────────────────────────────────────────

export const SQL_SCHEMA = `
-- Rider (Insured Workers)
CREATE TABLE riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  pincode TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('zomato', 'swiggy', 'both')),
  upi_id TEXT NOT NULL,
  kavach_score FLOAT DEFAULT 50,
  trust_score FLOAT DEFAULT 0.5,
  days_active INTEGER DEFAULT 0,
  shift_pattern TEXT DEFAULT 'mixed' CHECK (shift_pattern IN ('morning', 'evening', 'night', 'mixed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Policy (Insurance Plans)
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID REFERENCES riders(id),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('shift_pass', 'weekly_pass', 'monthly_pro')),
  premium_paid INTEGER NOT NULL,
  max_payout INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'claimed', 'cancelled')),
  covers_weather BOOLEAN DEFAULT true,
  covers_outage BOOLEAN DEFAULT true,
  bonus_hours INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Claim (Insurance Payouts)
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID REFERENCES policies(id),
  rider_id UUID REFERENCES riders(id),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('weather', 'outage', 'curfew', 'heatwave', 'aqi')),
  trigger_evidence TEXT NOT NULL,
  amount_paid INTEGER NOT NULL,
  upi_txn_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- Weather Events
CREATE TABLE weather_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pincode TEXT NOT NULL,
  alert_level TEXT NOT NULL CHECK (alert_level IN ('green', 'yellow', 'orange', 'red')),
  rainfall_mm FLOAT NOT NULL,
  temperature_c FLOAT DEFAULT 30,
  source TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Outage Events
CREATE TABLE outage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('zomato', 'swiggy')),
  affected_pincodes TEXT[] NOT NULL,
  rider_count INTEGER NOT NULL,
  confidence_score FLOAT NOT NULL,
  validated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
`;
