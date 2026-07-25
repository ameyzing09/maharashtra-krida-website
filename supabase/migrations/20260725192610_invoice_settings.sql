-- Admin-configurable GST compliance settings for invoices, replacing the
-- CLI-only ORGANIZER_GSTIN secret with a database-backed single-row config
-- editable from /menu/invoice-settings. Read by the invoice generator via
-- the service role (bypasses RLS), same pattern as every other table here.

create table if not exists invoice_settings (
  id boolean primary key default true, -- enforces exactly one row (see check below)
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
  on invoice_settings for select to authenticated using (true);
create policy "admin write invoice settings"
  on invoice_settings for insert to authenticated with check (true);
create policy "admin update invoice settings"
  on invoice_settings for update to authenticated using (true) with check (true);

-- Registrant's state, needed to decide CGST+SGST (same state as the
-- organizer) vs IGST (different state) when GST mode is on. Required going
-- forward; existing rows predate this column and are left null (invoice
-- generation for those falls back gracefully — see _shared/invoice.ts).
alter table badminton_registrations
  add column if not exists state text;
