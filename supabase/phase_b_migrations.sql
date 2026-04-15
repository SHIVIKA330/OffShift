-- Migration 001: Add payout tier system
ALTER TABLE workers ADD COLUMN IF NOT EXISTS avg_daily_orders INTEGER DEFAULT 0;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS payout_tier TEXT DEFAULT 'bronze' 
  CHECK (payout_tier IN ('bronze', 'silver', 'gold'));
ALTER TABLE workers ADD COLUMN IF NOT EXISTS zone_risk_score FLOAT DEFAULT 0.5;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS pincode TEXT DEFAULT '110001';
ALTER TABLE workers ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Delhi';

-- Migration 002: Update policies table for new plans
ALTER TABLE policies ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'weekly'
  CHECK (plan_type IN ('daily', 'weekly', 'monthly'));
ALTER TABLE policies ADD COLUMN IF NOT EXISTS payout_amount INTEGER DEFAULT 400;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'bronze'
  CHECK (tier IN ('bronze', 'silver', 'gold'));
ALTER TABLE policies ADD COLUMN IF NOT EXISTS actuarial_premium FLOAT DEFAULT 49;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS ml_premium FLOAT DEFAULT 49;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS final_premium FLOAT DEFAULT 49;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS seasonal_multiplier FLOAT DEFAULT 1.0;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS feature_breakdown JSONB DEFAULT '{}';

-- Migration 003: Actuarial metrics table (for Phase 4 dashboard)
CREATE TABLE IF NOT EXISTS actuarial_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  total_premiums_collected BIGINT DEFAULT 0,
  total_claims_paid BIGINT DEFAULT 0,
  total_operating_costs BIGINT DEFAULT 0,
  active_policies INTEGER DEFAULT 0,
  loss_ratio FLOAT DEFAULT 0,
  expense_ratio FLOAT DEFAULT 0.30,
  combined_ratio FLOAT DEFAULT 0,
  policyholder_surplus BIGINT DEFAULT 0,
  claims_frequency FLOAT DEFAULT 0,
  avg_severity FLOAT DEFAULT 0
);

-- Migration 004: Claim audit trail (hash-chained — Phase 2 uses this)
CREATE TABLE IF NOT EXISTS claim_audit_trail (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID REFERENCES claims(id),
  event_type TEXT NOT NULL,
  event_timestamp TIMESTAMPTZ DEFAULT NOW(),
  actor TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  hash TEXT NOT NULL,
  previous_hash TEXT DEFAULT 'GENESIS'
);
CREATE INDEX IF NOT EXISTS idx_audit_claim_id ON claim_audit_trail(claim_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON claim_audit_trail(event_timestamp);

-- Migration 005: Fraud detection tables
CREATE TABLE IF NOT EXISTS fraud_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID REFERENCES claims(id),
  worker_id UUID REFERENCES workers(id),
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Standard signals (1-5)
  gps_zone_valid BOOLEAN DEFAULT true,
  activity_recency_hours FLOAT DEFAULT 0,
  claim_frequency_30d INTEGER DEFAULT 0,
  zone_correlation_rate FLOAT DEFAULT 0,
  account_age_days INTEGER DEFAULT 0,
  
  -- Advanced signals (6-9) — GPS spoofing
  impossible_speed_detected BOOLEAN DEFAULT false,
  static_ping_detected BOOLEAN DEFAULT false,       -- GPS not moved 30+ min
  cluster_spoof_detected BOOLEAN DEFAULT false,     -- 5+ workers same coords
  weather_validation_failed BOOLEAN DEFAULT false,  -- OWM vs claimed trigger mismatch
  
  -- Composite score
  fraud_score FLOAT DEFAULT 0,
  decision TEXT DEFAULT 'pending' CHECK (decision IN ('auto_approve', 'manual_review', 'blocked')),
  flagged_signals TEXT[] DEFAULT '{}',
  
  raw_data JSONB DEFAULT '{}'
);

-- Migration 006: Zone activity tracking (for correlation scoring)
CREATE TABLE IF NOT EXISTS zone_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pincode TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  worker_id UUID REFERENCES workers(id),
  gps_lat FLOAT,
  gps_lng FLOAT,
  is_online BOOLEAN DEFAULT true,
  last_order_time TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_zone_activity_pincode ON zone_activity(pincode, recorded_at);

-- DEMO CREDENTIALS FOR JUDGING
INSERT INTO workers (name, phone, avg_daily_orders, payout_tier, pincode, city, zone_risk_score, is_upi_verified) VALUES
  ('Rajesh Kumar (Bronze)', '+919876500001', 5,  'bronze', '110013', 'Delhi', 0.45, true),
  ('Amit Singh (Silver)',   '+919876500002', 11, 'silver', '110020', 'Delhi', 0.62, true),
  ('Priya Sharma (Gold)',   '+919876500003', 18, 'gold',   '110025', 'Delhi', 0.55, true);
