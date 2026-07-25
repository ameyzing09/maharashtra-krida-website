-- Maharashtra Krida — Supabase schema
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query).
--
-- Content tables use quoted camelCase columns intentionally: they mirror the
-- exact field names the app already uses (migrated from Firestore documents),
-- so the service layer needs no field mapping.
-- Security model:
--   * content tables: public read (anon SELECT), writes only for authenticated
--   * badminton_registrations: NO anon access at all; inserts happen only via
--     the service role (Netlify functions); authenticated admin can read/update.

-- ---------------------------------------------------------------------------
-- Content tables
-- ---------------------------------------------------------------------------

create table if not exists events (
  id text primary key default gen_random_uuid()::text,
  "name" text not null,
  sport text not null default '',
  "date" text not null default '',
  "location" text not null default '',
  "imageUrl" text not null default '',
  "flyerUrl" text not null default '',
  "registrationUrl" text not null default '',
  description text not null default ''
);

create table if not exists teams (
  id text primary key default gen_random_uuid()::text,
  "name" text not null,
  short text,
  "logoUrl" text,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);

create table if not exists event_teams (
  id text primary key, -- `${eventId}__${teamId}`
  "eventId" text not null,
  "teamId" text not null,
  short text,
  "logoOverride" text,
  seed integer,
  "group" text
);
create index if not exists event_teams_event_idx on event_teams ("eventId");

create table if not exists matches (
  id text primary key default gen_random_uuid()::text,
  "eventId" text not null,
  "teamAId" text not null,
  "teamBId" text not null,
  "scheduledAt" bigint not null default 0, -- epoch ms, matches existing type
  venue text,
  status text not null default 'upcoming'
    check (status in ('upcoming','live','completed','cancelled')),
  score jsonb
);
create index if not exists matches_event_sched_idx on matches ("eventId", "scheduledAt" desc);
create index if not exists matches_status_sched_idx on matches (status, "scheduledAt" desc);

create table if not exists gallery (
  id text primary key default gen_random_uuid()::text,
  "imageUrl" text not null,
  alt text,
  title text,
  description text,
  "createdAt" timestamptz default now()
);

create table if not exists news (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  summary text,
  content text,
  "imageUrl" text,
  "eventId" text,
  "createdAt" timestamptz default now()
);

create table if not exists homepage_content (
  id text primary key default gen_random_uuid()::text,
  "imageUrl" text not null,
  alt text not null default '',
  title text not null default '',
  description text not null default ''
);

-- ---------------------------------------------------------------------------
-- Badminton registrations (confidential)
-- ---------------------------------------------------------------------------

create table if not exists badminton_registrations (
  id text primary key default gen_random_uuid()::text,
  created_at timestamptz not null default now(),
  order_id text not null unique,
  payment_id text,
  paid_at timestamptz,
  status text not null default 'PENDING'
    check (status in ('PENDING','PAID','CANCELLED')),
  payment_method text not null default 'razorpay'
    check (payment_method in ('razorpay','offline')),
  payment_note text,
  company text not null,
  contact_person text,
  official_email text not null,
  phone text not null,
  personal_email text,
  categories_summary text not null default '',
  total_paise integer not null,
  entries jsonb not null default '[]'::jsonb
);
create index if not exists badminton_reg_status_idx on badminton_registrations (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table events enable row level security;
alter table teams enable row level security;
alter table event_teams enable row level security;
alter table matches enable row level security;
alter table gallery enable row level security;
alter table news enable row level security;
alter table homepage_content enable row level security;
alter table badminton_registrations enable row level security;

-- Content: anyone may read, only authenticated (admin) may write.
do $$
declare t text;
begin
  foreach t in array array['events','teams','event_teams','matches','gallery','news','homepage_content']
  loop
    execute format('create policy "public read"  on %I for select using (true)', t);
    execute format('create policy "admin insert" on %I for insert to authenticated with check (true)', t);
    execute format('create policy "admin update" on %I for update to authenticated using (true) with check (true)', t);
    execute format('create policy "admin delete" on %I for delete to authenticated using (true)', t);
  end loop;
end $$;

-- Registrations: NO anon policies whatsoever (deny-by-default).
-- Inserts come only from the service role (bypasses RLS).
-- Admin may read and update, but never delete (audit trail).
create policy "admin read registrations"
  on badminton_registrations for select to authenticated using (true);
create policy "admin update registrations"
  on badminton_registrations for update to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Storage: public `media` bucket (event images/flyers, gallery, news, homepage)
-- Public read; only authenticated admin can write.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public read media"
  on storage.objects for select using (bucket_id = 'media');
create policy "admin write media"
  on storage.objects for insert to authenticated with check (bucket_id = 'media');
create policy "admin update media"
  on storage.objects for update to authenticated using (bucket_id = 'media');
create policy "admin delete media"
  on storage.objects for delete to authenticated using (bucket_id = 'media');
