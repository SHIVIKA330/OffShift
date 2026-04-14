-- ═══════════════════════════════════════════════════════════════
-- OffShift — Phase A Migration
-- Run in Supabase SQL Editor. Does NOT touch existing tables.
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════
-- 0. RIDERS BASE TABLE (new system)
-- ═══════════════════════════════════════
create table if not exists riders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text unique not null,
  zone text not null,
  pincode text,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════
-- 1. DPDP Act 2023 consent tracking
-- ═══════════════════════════════════════
create table if not exists consent_log (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid references riders(id),
  consent_type text check (consent_type in ('gps','bank_upi','platform_activity')),
  consented_at timestamptz default now(),
  consent_version text default '1.0',
  ip_hash text
);

-- ═══════════════════════════════════════
-- 2. SS Code 2020 eligibility engine
-- ═══════════════════════════════════════
create table if not exists rider_engagement (
  rider_id uuid references riders(id) primary key,
  platform text check (platform in ('zomato','swiggy','both')),
  active_days_current_fy int default 0,
  is_multi_apping boolean default false,
  threshold_days int generated always as (case when is_multi_apping then 120 else 90 end) stored,
  is_eligible boolean generated always as (active_days_current_fy >= (case when is_multi_apping then 120 else 90 end)) stored,
  last_updated timestamptz default now()
);

-- ═══════════════════════════════════════
-- 3. GPS pings for crowdsource fraud detection
-- ═══════════════════════════════════════
create table if not exists rider_gps_pings (
  id bigserial primary key,
  rider_id uuid references riders(id),
  lat decimal(9,6),
  lon decimal(9,6),
  pincode text,
  zone_cluster text,
  pinged_at timestamptz default now(),
  is_active boolean default true
);
create index if not exists idx_gps_cluster_time on rider_gps_pings (zone_cluster, pinged_at);

-- ═══════════════════════════════════════
-- 4. Kavach dynamic pricing log
-- ═══════════════════════════════════════
create table if not exists kavach_quotes (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid references riders(id),
  pincode text,
  season text check (season in ('monsoon','summer','winter','spring')),
  days_to_event int,
  base_premium decimal(8,2),
  kavach_multiplier decimal(4,3),
  final_premium decimal(8,2),
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════
-- 5. Active disruption tracker
-- ═══════════════════════════════════════
create table if not exists active_disruptions (
  id uuid primary key default gen_random_uuid(),
  disruption_type text check (disruption_type in ('weather','platform_outage','combined')),
  affected_zone text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  trigger_source text,
  affected_rider_count int default 0,
  total_payout_triggered decimal(12,2) default 0
);

-- ═══════════════════════════════════════
-- 6. Payout audit log (for <120s SLA proof)
-- ═══════════════════════════════════════
create table if not exists payout_audit_log (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid,
  stage text,
  status text check (status in ('pending','completed','failed')),
  latency_ms int,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════
-- 7. Demo events (DEMO_MODE only)
-- ═══════════════════════════════════════
create table if not exists demo_events (
  id uuid primary key default gen_random_uuid(),
  event_type text,
  payload jsonb,
  triggered_at timestamptz default now()
);
