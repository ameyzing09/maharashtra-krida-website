-- Real admin authorization.
--
-- Until now every write policy in this schema authorized on *authentication*
-- rather than *identity* — the pattern was `to authenticated ... using (true)`,
-- which grants writes to anyone holding any valid session. There was no admin
-- table, no role claim, and no check of which user was asking. That was safe
-- only because the app has no signup screen and public sign-ups are switched
-- off in the dashboard, i.e. the entire authorization model rested on a
-- dashboard toggle.
--
-- This migration replaces that with an explicit allowlist: admin_users plus an
-- is_admin() helper, referenced by every write policy.
--
-- Chosen over a JWT role claim because it needs no auth hook, is inspectable
-- with a plain select, and lets admins be granted or revoked without the user
-- re-authenticating. Note the shortcut NOT taken: a role in
-- `auth.jwt() ->> 'user_metadata'` would be user-editable — anyone could
-- promote themselves. Only app_metadata or a table is safe.

-- ---------------------------------------------------------------------------
-- Allowlist + helpers
-- ---------------------------------------------------------------------------

create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  note text,
  added_at timestamptz not null default now()
);

alter table admin_users enable row level security;
-- No policies, deliberately: service role only. Admins can edit everything
-- else through the app, but not the list of who is an admin.

-- security definer is what prevents infinite recursion here: the function
-- reads admin_users without re-triggering that table's own RLS. search_path is
-- pinned empty so every reference below has to be schema-qualified.
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

-- Convenience for the runbook: adding an admin is one call instead of copying
-- uuids around. Service role only — this is the privilege-granting path.
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
-- Seed: grandfather in everyone who already had admin rights.
--
-- Every existing user was already an effective admin under the old policies,
-- so copying them across preserves current behaviour exactly and — more
-- importantly — guarantees nobody is locked out the moment the policies below
-- are swapped. On a brand-new project auth.users is empty and this is a no-op;
-- there, create the admin user and then run: select public.grant_admin('...');
--
-- REVIEW `select * from admin_users;` AFTER APPLYING and delete anyone who
-- should not have write access.
-- ---------------------------------------------------------------------------

insert into admin_users (user_id, note)
select id, coalesce(email, '(no email)') from auth.users
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------------
-- Repoint every write policy at is_admin()
--
-- Public read policies are intentionally left alone: public read of content
-- and of payment_settings is by design, and badminton_registrations correctly
-- has no anon policy at all.
-- ---------------------------------------------------------------------------

-- Content tables: same loop shape as the original schema migration.
do $$
declare t text;
begin
  foreach t in array array['events','teams','event_teams','matches','gallery','news','homepage_content']
  loop
    execute format('drop policy if exists "admin insert" on %I', t);
    execute format('drop policy if exists "admin update" on %I', t);
    execute format('drop policy if exists "admin delete" on %I', t);

    execute format('create policy "admin insert" on %I for insert to authenticated with check (public.is_admin())', t);
    execute format('create policy "admin update" on %I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "admin delete" on %I for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;

-- Registrations: admin may read and update, never delete (audit trail).
drop policy if exists "admin read registrations" on badminton_registrations;
drop policy if exists "admin update registrations" on badminton_registrations;

create policy "admin read registrations"
  on badminton_registrations for select to authenticated using (public.is_admin());
create policy "admin update registrations"
  on badminton_registrations for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Storage: `media` writes and `invoices` reads.
drop policy if exists "admin write media" on storage.objects;
drop policy if exists "admin update media" on storage.objects;
drop policy if exists "admin delete media" on storage.objects;
drop policy if exists "admin read invoices" on storage.objects;

create policy "admin write media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy "admin update media"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy "admin delete media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy "admin read invoices"
  on storage.objects for select to authenticated
  using (bucket_id = 'invoices' and public.is_admin());

-- Invoice settings (admin-only read as well as write).
drop policy if exists "admin read invoice settings" on invoice_settings;
drop policy if exists "admin write invoice settings" on invoice_settings;
drop policy if exists "admin update invoice settings" on invoice_settings;

create policy "admin read invoice settings"
  on invoice_settings for select to authenticated using (public.is_admin());
create policy "admin write invoice settings"
  on invoice_settings for insert to authenticated with check (public.is_admin());
create policy "admin update invoice settings"
  on invoice_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Payment settings: public read stays, writes become admin-only.
drop policy if exists "admin write payment settings" on payment_settings;
drop policy if exists "admin update payment settings" on payment_settings;

create policy "admin write payment settings"
  on payment_settings for insert to authenticated with check (public.is_admin());
create policy "admin update payment settings"
  on payment_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Unrelated but same class of bug: next_invoice_number() is security definer
-- with an unpinned search_path, so a caller controlling search_path could
-- resolve the unqualified `invoice_seq` to a sequence of their choosing.
-- ---------------------------------------------------------------------------

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
