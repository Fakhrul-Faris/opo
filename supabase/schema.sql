-- Supabase schema for Opo Marketing Portal
-- Enable pgvector extension
create extension if not exists vector;

-- Auth tables are managed by Supabase Auth (users, profiles)

-- Module: Campaigns
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  objective text not null,
  channel text not null,
  status text not null,
  start_date date not null,
  end_date date,
  budget numeric,
  compliance_dependent boolean default false,
  ai_indexed boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Vector embedding for AI search
alter table campaigns add column embedding vector(1536);

-- Module: Content Bank
create table content_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null,
  platform text not null,
  theme text not null,
  body text not null,
  campaign_id uuid references campaigns(id),
  status text not null,
  source text not null,
  published_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table content_assets add column embedding vector(1536);

-- Module: Referral Tracker
create table referrals (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  clicks integer default 0,
  conversions integer default 0,
  created_at timestamp with time zone default now()
);

-- Module: Ketua Arisan
create table ketua_arisan (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  community_size integer,
  platform_presence text,
  status text not null,
  circles_created integer default 0,
  members_referred integer default 0,
  activation_rate numeric,
  retention_rate numeric,
  last_contact date,
  notes text,
  created_at timestamp with time zone default now()
);

-- Additional tables for experiments, notifications, etc. can be added later.

-- Module: Settings
create table app_settings (
  id integer primary key,
  ai_provider text not null default 'claude',
  ai_api_key text,
  updated_at timestamp with time zone default now()
);
