-- OffShift — Supabase Schema (PostgreSQL)
-- Run in Supabase SQL Editor after creating project.
-- Phase 2: workers, policies, claims, trigger_events, worker_pings

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════
-- 1. WORKERS TABLE
-- ═══════════════════════════════════════
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('Zomato', 'Swiggy', 'Zepto', 'zomato', 'swiggy', 'zepto')),
  rider_id TEXT UNIQUE NOT NULL,
  zone TEXT NOT NULL,
  shift_type TEXT NOT NULL,
  active_days_per_week INTEGER DEFAULT 5,
  worker_tier TEXT DEFAULT 'STANDARD' CHECK (worker_tier IN ('BASIC', 'STANDARD', 'PREMIUM')),
  kavach_score INTEGER DEFAULT 50,
  password_hash TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  settlement_channel TEXT DEFAULT 'UPI' CHECK (settlement_channel IN ('UPI', 'IMPS', 'RAZORPAY')),
  upi_vpa TEXT,                      -- e.g. rider@upi
  bank_account_number TEXT,          -- for IMPS
  bank_ifsc TEXT,                    -- for IMPS
  bank_account_name TEXT,            -- for IMPS
  razorpay_fund_account_id TEXT,     -- Razorpay FundAccount ID (auto-created)
  razorpay_contact_id TEXT,          -- Razorpay Contact ID (auto-created)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 1b. SETTLEMENT TRANSACTIONS TABLE
-- ═══════════════════════════════════════
CREATE TABLE settlement_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID REFERENCES claims(id),
  worker_id UUID REFERENCES workers(id),
  amount DECIMAL(10,2) NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('UPI', 'IMPS', 'RAZORPAY')),
  status TEXT DEFAULT 'INITIATED' CHECK (status IN ('INITIATED', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED')),
  razorpay_payout_id TEXT,
  razorpay_fund_account_id TEXT,
  upi_vpa TEXT,
  bank_ifsc TEXT,
  bank_account TEXT,
  reference_id TEXT,
  failure_reason TEXT,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX workers_zone_idx ON workers (zone);
CREATE INDEX workers_created_at_idx ON workers (created_at DESC);

-- ═══════════════════════════════════════
-- 2. POLICIES TABLE
-- ═══════════════════════════════════════
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  plan_type TEXT CHECK (plan_type IN ('24hr', '7day')),
  premium_amount DECIMAL(10,2) NOT NULL,
  max_payout DECIMAL(10,2) NOT NULL,
  coverage_start TIMESTAMPTZ NOT NULL,
  coverage_end TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'PENDING', 'CANCELLED')),
  payout_total DECIMAL(10,2) DEFAULT 0,
  trigger_weather BOOLEAN DEFAULT TRUE,
  trigger_outage BOOLEAN DEFAULT TRUE,
  risk_pool TEXT DEFAULT 'GENERAL',
  next_premium_due_at TIMESTAMPTZ,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX policies_worker_id_idx ON policies (worker_id);
CREATE INDEX policies_status_idx ON policies (status);
CREATE INDEX policies_coverage_idx ON policies (coverage_start, coverage_end);

-- ═══════════════════════════════════════
-- 3. CLAIMS TABLE (The Parametric Ledger)
-- ═══════════════════════════════════════
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id UUID REFERENCES policies(id),
  worker_id UUID REFERENCES workers(id),
  trigger_type TEXT CHECK (trigger_type IN ('RAIN', 'AQI', 'OUTAGE', 'HEAT', 'CURFEW')),
  trigger_severity TEXT,
  trigger_timestamp TIMESTAMPTZ DEFAULT NOW(),
  zone TEXT NOT NULL,
  payout_amount DECIMAL(10,2) NOT NULL,
  fraud_score INTEGER DEFAULT 0,
  fraud_flags JSONB DEFAULT '[]',
  fraud_recommendation TEXT,
  fraud_reasoning TEXT,
  status TEXT DEFAULT 'TRIGGERED' CHECK (
    status IN ('TRIGGERED', 'FRAUD_CHECK', 'MANUAL_REVIEW', 'APPROVED', 'PAYOUT_INITIATED', 'SETTLED', 'REJECTED')
  ),
  payout_txn_id TEXT,
  settled_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX claims_policy_id_idx ON claims (policy_id);
CREATE INDEX claims_worker_id_idx ON claims (worker_id);
CREATE INDEX claims_status_idx ON claims (status);
CREATE INDEX claims_created_at_idx ON claims (created_at DESC);

-- ═══════════════════════════════════════
-- 4. TRIGGER EVENTS (Cron audit log)
-- ═══════════════════════════════════════
CREATE TABLE trigger_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('RAIN', 'AQI', 'OUTAGE', 'HEAT', 'CURFEW')),
  severity TEXT,
  severity_value DECIMAL,
  hourly_rain_mm DECIMAL,
  aqi_value INTEGER,
  platform TEXT,
  metadata JSONB DEFAULT '{}',
  workers_triggered INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX trigger_events_zone_idx ON trigger_events (zone, recorded_at DESC);
CREATE INDEX trigger_events_type_idx ON trigger_events (trigger_type, recorded_at DESC);

-- ═══════════════════════════════════════
-- 5. WORKER PINGS (GPS — outage cross-validation)
-- ═══════════════════════════════════════
CREATE TABLE worker_pings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  zone TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  pinged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX worker_pings_zone_idx ON worker_pings (zone, pinged_at DESC);
CREATE INDEX worker_pings_worker_idx ON worker_pings (worker_id, pinged_at DESC);

-- ═══════════════════════════════════════
-- Enable Realtime for Claims & Policies
-- ═══════════════════════════════════════
ALTER TABLE claims REPLICA IDENTITY FULL;
ALTER TABLE policies REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE claims;
ALTER PUBLICATION supabase_realtime ADD TABLE policies;
