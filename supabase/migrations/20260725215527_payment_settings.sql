-- Offline ("company will pay separately") payment configuration.
--
-- Bank details for RECEIVING money are not secret — they appear on any
-- invoice and must be shown to the public registrant on the offline
-- confirmation / status page — so this table is publicly readable (unlike
-- invoice_settings, which is admin-only). Only admins can write it.

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
  on payment_settings for insert to authenticated with check (true);
create policy "admin update payment settings"
  on payment_settings for update to authenticated using (true) with check (true);
