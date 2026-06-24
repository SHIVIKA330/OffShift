-- OffShift — Fix Migration
-- Run this in Supabase SQL Editor to fix bugs discovered post-deploy.
-- Safe to run multiple times (uses IF EXISTS / IF NOT EXISTS).

-- ═══════════════════════════════════════════════════════
-- FIX 1: Drop the narrow platform CHECK constraint
-- The original schema only allowed Zomato/Swiggy/Zepto,
-- but the app supports 20+ platforms (Ola, Uber, Porter, 
-- construction workers, domestic workers, etc.)
-- ═══════════════════════════════════════════════════════
ALTER TABLE workers DROP CONSTRAINT IF EXISTS workers_platform_check;

-- ═══════════════════════════════════════════════════════
-- FIX 2: Ensure settlement columns exist
-- (In case schema.sql was run without them)
-- ═══════════════════════════════════════════════════════
ALTER TABLE workers ADD COLUMN IF NOT EXISTS settlement_channel TEXT DEFAULT 'UPI';
ALTER TABLE workers ADD COLUMN IF NOT EXISTS upi_vpa TEXT;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS bank_ifsc TEXT;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS bank_account_name TEXT;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS razorpay_fund_account_id TEXT;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS razorpay_contact_id TEXT;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- ═══════════════════════════════════════════════════════
-- FIX 3: Ensure policies.razorpay_payment_id exists
-- ═══════════════════════════════════════════════════════
ALTER TABLE policies ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

-- ═══════════════════════════════════════════════════════
-- FIX 4: Create settlement_transactions WITHOUT forward
-- reference to claims (avoids FK ordering issue).
-- The claim_id FK is added after claims table exists.
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS settlement_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Add claim_id FK only if claims table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'claims') THEN
    ALTER TABLE settlement_transactions
      ADD COLUMN IF NOT EXISTS claim_id UUID REFERENCES claims(id);
  ELSE
    ALTER TABLE settlement_transactions
      ADD COLUMN IF NOT EXISTS claim_id UUID;
  END IF;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════
-- FIX 5: Enable RLS (Row Level Security) but allow
-- service role to bypass (required for server-side ops)
-- ═══════════════════════════════════════════════════════
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Allow service role (used by the app backend) full access
CREATE POLICY IF NOT EXISTS "Service role bypass workers"
  ON workers FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role bypass policies"
  ON policies FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role bypass claims"
  ON claims FOR ALL TO service_role USING (true) WITH CHECK (true);
