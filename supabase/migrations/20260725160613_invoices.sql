-- Invoice generation for badminton registrations.
--
-- Invoices are generated server-side by the Edge Functions using the service
-- role (bypasses RLS entirely), so no new anon policies are needed on
-- badminton_registrations itself. A separate `invoices` storage bucket holds
-- the PDFs; it is private (unlike the public `media` bucket) since the files
-- contain a company's contact details.

alter table badminton_registrations
  add column if not exists invoice_number text unique,
  add column if not exists invoice_path text,
  add column if not exists invoice_generated_at timestamptz;

create sequence if not exists invoice_seq;

-- Returns e.g. "MK-BADM-2026-000123". security definer so it can be called
-- via PostgREST RPC by the service role without extra grants fuss; the
-- sequence itself has no sensitive data, only a running counter.
create or replace function next_invoice_number()
returns text
language plpgsql
security definer
as $$
declare
  n bigint;
begin
  n := nextval('invoice_seq');
  return 'MK-BADM-' || to_char(now(), 'YYYY') || '-' || lpad(n::text, 6, '0');
end;
$$;

insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

-- Authenticated (admin) may read invoices directly (dashboard download).
-- No anon policies at all — the public get-invoice function reaches the
-- bucket via the service role and hands back a short-lived signed URL
-- instead of relying on a bucket-level anon policy.
create policy "admin read invoices"
  on storage.objects for select to authenticated using (bucket_id = 'invoices');
