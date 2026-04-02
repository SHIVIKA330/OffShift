-- OffShift — Supabase schema (PostgreSQL)
-- Run in Supabase SQL Editor after creating project.
-- Phase 2: workers, policies, claims, trigger_events, worker pings, optional ML embeddings.

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ---------------------------------------------------------------------------
-- WORKERS (1:1 with auth.users — phone OTP via Supabase Auth)
-- ---------------------------------------------------------------------------
create table public.workers (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text,
  name text not null,
  platform text not null check (platform in ('zomato', 'swiggy')),
  rider_id text not null,
  city text not null default 'Delhi NCR',
  zone text not null,
  shift_type text not null,
  active_days_per_week smallint not null check (active_days_per_week between 1 and 7),
  kavach_score smallint check (kavach_score between 1 and 100),
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rider_id_format check (
    rider_id ~ '^(ZO|SG)-[A-Z0-9]{4,}$'
  )
);

create unique index workers_rider_id_key on public.workers (rider_id);
create index workers_zone_idx on public.workers (zone);
create index workers_created_at_idx on public.workers (created_at desc);

-- ---------------------------------------------------------------------------
-- POLICIES
-- ---------------------------------------------------------------------------
create table public.policies (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.workers (id) on delete cascade,
  plan_type text not null check (plan_type in ('24hr', '7day')),
  premium_amount numeric(12, 2) not null check (premium_amount >= 0),
  max_payout numeric(12, 2) not null check (max_payout >= 0),
  coverage_start timestamptz not null,
  coverage_end timestamptz not null,
  status text not null default 'PENDING' check (
    status in ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED')
  ),
  payout_total numeric(12, 2) not null default 0 check (payout_total >= 0),
  trigger_weather boolean not null default true,
  trigger_outage boolean not null default true,
  next_premium_due_at timestamptz,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  constraint policies_coverage_window check (coverage_end > coverage_start)
);

create index policies_worker_id_idx on public.policies (worker_id);
create index policies_status_idx on public.policies (status);
create index policies_coverage_idx on public.policies (coverage_start, coverage_end);
create index policies_worker_status_idx on public.policies (worker_id, status);

-- ---------------------------------------------------------------------------
-- CLAIMS (parametric triggers + fraud pipeline)
-- ---------------------------------------------------------------------------
create table public.claims (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.policies (id) on delete cascade,
  worker_id uuid not null references public.workers (id) on delete cascade,
  trigger_type text not null,
  trigger_severity text,
  trigger_timestamp timestamptz not null default now(),
  zone text not null,
  payout_amount numeric(12, 2) not null default 0 check (payout_amount >= 0),
  fraud_score smallint check (fraud_score between 0 and 100),
  fraud_flags jsonb not null default '[]'::jsonb,
  fraud_recommendation text,
  fraud_reasoning text,
  status text not null default 'TRIGGERED' check (
    status in (
      'TRIGGERED',
      'FRAUD_CHECK',
      'MANUAL_REVIEW',
      'APPROVED',
      'PAYOUT_INITIATED',
      'SETTLED',
      'REJECTED'
    )
  ),
  payout_txn_id text,
  settled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index claims_policy_id_idx on public.claims (policy_id);
create index claims_worker_id_idx on public.claims (worker_id);
create index claims_status_idx on public.claims (status);
create index claims_created_at_idx on public.claims (created_at desc);
create index claims_worker_created_idx on public.claims (worker_id, created_at desc);

-- ---------------------------------------------------------------------------
-- TRIGGER EVENTS (cron / oracle audit — ward-level detection log)
-- ---------------------------------------------------------------------------
create table public.trigger_events (
  id uuid primary key default gen_random_uuid(),
  zone text not null,
  trigger_type text not null,
  severity text,
  detected_at timestamptz not null default now(),
  hourly_rain_mm numeric(10, 2),
  aqi_value integer,
  platform text,
  metadata jsonb not null default '{}'::jsonb,
  workers_evaluated integer,
  workers_triggered integer,
  created_at timestamptz not null default now()
);

create index trigger_events_zone_detected_idx on public.trigger_events (zone, detected_at desc);
create index trigger_events_type_idx on public.trigger_events (trigger_type, detected_at desc);

-- ---------------------------------------------------------------------------
-- WORKER PINGS (crowdsourced GPS — outage cross-validation; mock + future real)
-- ---------------------------------------------------------------------------
create table public.worker_pings (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.workers (id) on delete cascade,
  zone text not null,
  latitude double precision not null,
  longitude double precision not null,
  pinged_at timestamptz not null default now()
);

create index worker_pings_zone_ping_idx on public.worker_pings (zone, pinged_at desc);
create index worker_pings_worker_ping_idx on public.worker_pings (worker_id, pinged_at desc);

-- ---------------------------------------------------------------------------
-- ML EMBEDDINGS (pgvector — risk / fraud narratives, optional)
-- ---------------------------------------------------------------------------
create table public.ml_embeddings (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid references public.workers (id) on delete set null,
  kind text not null,
  content text,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create index ml_embeddings_worker_kind_idx on public.ml_embeddings (worker_id, kind);

-- ---------------------------------------------------------------------------
-- updated_at trigger for workers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger workers_set_updated_at
  before update on public.workers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.workers enable row level security;
alter table public.policies enable row level security;
alter table public.claims enable row level security;
alter table public.trigger_events enable row level security;
alter table public.worker_pings enable row level security;
alter table public.ml_embeddings enable row level security;

-- Workers: users read/update own row
create policy "workers_select_own"
  on public.workers for select
  using (auth.uid() = id);

create policy "workers_update_own"
  on public.workers for update
  using (auth.uid() = id);

create policy "workers_insert_own"
  on public.workers for insert
  with check (auth.uid() = id);

-- Policies: own policies
create policy "policies_select_own"
  on public.policies for select
  using (auth.uid() = worker_id);

create policy "policies_insert_own"
  on public.policies for insert
  with check (auth.uid() = worker_id);

create policy "policies_update_own"
  on public.policies for update
  using (auth.uid() = worker_id);

-- Claims: own claims (read); mutations via service role only
create policy "claims_select_own"
  on public.claims for select
  using (auth.uid() = worker_id);

-- Trigger events: no direct client access (cron uses service role; bypasses RLS)
create policy "trigger_events_deny_all"
  on public.trigger_events for all
  using (false)
  with check (false);

create policy "worker_pings_select_own"
  on public.worker_pings for select
  using (auth.uid() = worker_id);

create policy "worker_pings_insert_own"
  on public.worker_pings for insert
  with check (auth.uid() = worker_id);

create policy "ml_embeddings_select_own"
  on public.ml_embeddings for select
  using (auth.uid() = worker_id);

-- ---------------------------------------------------------------------------
-- Realtime: worker dashboard subscriptions on claims (and policies)
-- ---------------------------------------------------------------------------
alter table public.claims replica identity full;
alter table public.policies replica identity full;

alter publication supabase_realtime add table public.claims;
alter publication supabase_realtime add table public.policies;

-- ---------------------------------------------------------------------------
-- Grants (authenticated API via PostgREST)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.workers to authenticated;
grant select, insert, update on public.policies to authenticated;
grant select on public.claims to authenticated;
grant select, insert on public.worker_pings to authenticated;
grant select on public.ml_embeddings to authenticated;
