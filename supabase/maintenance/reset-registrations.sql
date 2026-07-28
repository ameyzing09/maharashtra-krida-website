-- ONE-TIME production cutover cleanup. Run by hand, exactly once.
--
-- NOT a migration, and deliberately not in supabase/migrations/ — if it were,
-- `supabase db push` would replay it against real, paid registrations.
--
-- Context: this project started as the dev/test environment and is being
-- promoted to production in place (there is no second project). It therefore
-- carries registrations created against the old test Razorpay account, whose
-- order ids and payment ids mean nothing to the production account. This
-- clears them and resets the invoice counter so the first genuine invoice is
-- MK-BADM-<year>-000001 rather than continuing a test sequence.
--
-- What this does NOT do:
--   * delete the invoice PDFs — those are storage objects in the private
--     `invoices` bucket and outlive the rows. Remove them separately:
--       supabase --experimental storage rm -r ss:///invoices/
--   * touch CMS content, auth users, admin_users, or the `media` bucket.
--
-- See docs/production-runbook.md.

begin;

  -- No foreign keys point at this table, so truncate is safe and also resets
  -- nothing else. (Registrations have no delete policy by design — this runs
  -- as the table owner via the SQL editor / a direct connection, not through
  -- PostgREST, so RLS does not apply.)
  truncate table public.badminton_registrations;

  -- next_invoice_number() reads this; restarting it is what makes the first
  -- real invoice 000001. Safe only because the table above is now empty —
  -- invoice_number is UNIQUE, so reusing numbers against surviving rows would
  -- fail on insert.
  alter sequence public.invoice_seq restart with 1;

commit;

-- Verify:
--   select count(*) from public.badminton_registrations;   -- expect 0
--   select last_value, is_called from public.invoice_seq;  -- expect 1, false
