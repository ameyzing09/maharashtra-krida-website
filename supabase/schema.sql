-- Maharashtra Krida — Supabase schema
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query).
--
-- Content tables use quoted camelCase columns intentionally: they mirror the
-- exact field names the app already uses (migrated from Firestore documents),
-- so the service layer needs no field mapping.
-- Security model:
--   * content tables: public read (anon SELECT), writes only for admins —
--     membership in admin_users, checked via is_admin(). Being merely
--     authenticated is NOT enough (see migrations/20260726192917).
--   * badminton_registrations: NO anon access at all; inserts happen only via
--     the service role (Edge Functions); admins can read/update, never delete.

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
-- Admin allowlist (see migrations/20260726192917_admin_authorization.sql for
-- the authoritative, already-applied version — including the one-time seed
-- that grandfathered existing users in).
-- ---------------------------------------------------------------------------

create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  note text,
  added_at timestamptz not null default now()
);

-- RLS on with no policies at all, deliberately: service role only. Admins can
-- edit everything else through the app, but not the list of who is an admin.
alter table admin_users enable row level security;

-- security definer is what prevents infinite recursion: this reads admin_users
-- without re-triggering that table's own RLS.
create or replace function public.is_admin() returns boolean
  language sql
  security definer
  stable
  set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;

-- Adding an admin is one call: select public.grant_admin('a@b.com');
create or replace function public.grant_admin(p_email text) returns uuid
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  v_id uuid;
begin
  select id into v_id from auth.users where lower(email) = lower(p_email);
  if v_id is null then
    raise exception 'no such user: %', p_email;
  end if;
  insert into public.admin_users (user_id, note) values (v_id, lower(p_email))
    on conflict (user_id) do nothing;
  return v_id;
end;
$$;

revoke all on function public.grant_admin(text) from public, anon, authenticated;
grant execute on function public.grant_admin(text) to service_role;

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

-- Content: anyone may read, only admins may write.
do $$
declare t text;
begin
  foreach t in array array['events','teams','event_teams','matches','gallery','news','homepage_content']
  loop
    execute format('create policy "public read"  on %I for select using (true)', t);
    execute format('create policy "admin insert" on %I for insert to authenticated with check (public.is_admin())', t);
    execute format('create policy "admin update" on %I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "admin delete" on %I for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;

-- Registrations: NO anon policies whatsoever (deny-by-default).
-- Inserts come only from the service role (bypasses RLS).
-- Admin may read and update, but never delete (audit trail).
create policy "admin read registrations"
  on badminton_registrations for select to authenticated using (public.is_admin());
create policy "admin update registrations"
  on badminton_registrations for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

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
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy "admin update media"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy "admin delete media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Invoices (see migrations/20260725160613_invoices.sql for the authoritative,
-- already-applied version; kept here for a single-file reference of the
-- full schema).
-- ---------------------------------------------------------------------------

alter table badminton_registrations
  add column if not exists invoice_number text unique,
  add column if not exists invoice_path text,
  add column if not exists invoice_generated_at timestamptz;

create sequence if not exists invoice_seq;

-- search_path pinned empty (and invoice_seq schema-qualified) so a caller
-- controlling search_path can't point this security-definer function at a
-- sequence of their choosing.
create or replace function next_invoice_number()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  n bigint;
begin
  n := nextval('public.invoice_seq');
  return 'MK-BADM-' || to_char(now(), 'YYYY') || '-' || lpad(n::text, 6, '0');
end;
$$;

insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

create policy "admin read invoices"
  on storage.objects for select to authenticated
  using (bucket_id = 'invoices' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Invoice compliance settings (see migrations/20260725192610_invoice_settings.sql
-- for the authoritative, already-applied version).
-- ---------------------------------------------------------------------------

create table if not exists invoice_settings (
  id boolean primary key default true,
  gst_enabled boolean not null default false,
  gstin text,
  hsn_sac_code text,
  gst_rate_percent numeric,
  organizer_legal_name text,
  organizer_pan text,
  organizer_state text,
  organizer_address text,
  updated_at timestamptz not null default now(),
  constraint invoice_settings_single_row check (id)
);

alter table invoice_settings enable row level security;

create policy "admin read invoice settings"
  on invoice_settings for select to authenticated using (public.is_admin());
create policy "admin write invoice settings"
  on invoice_settings for insert to authenticated with check (public.is_admin());
create policy "admin update invoice settings"
  on invoice_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table badminton_registrations
  add column if not exists state text;

-- ---------------------------------------------------------------------------
-- Offline payment settings (see migrations/20260725215527_payment_settings.sql).
-- Publicly readable (bank details for receiving payment are not secret and must
-- show on the public offline confirmation/status page); admin write only.
-- ---------------------------------------------------------------------------

create table if not exists payment_settings (
  id boolean primary key default true,
  offline_enabled boolean not null default false,
  bank_account_name text,
  bank_account_number text,
  bank_ifsc text,
  upi_id text,
  instructions_note text,
  updated_at timestamptz not null default now(),
  constraint payment_settings_single_row check (id)
);

alter table payment_settings enable row level security;

create policy "public read payment settings"
  on payment_settings for select using (true);
create policy "admin write payment settings"
  on payment_settings for insert to authenticated with check (public.is_admin());
create policy "admin update payment settings"
  on payment_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
