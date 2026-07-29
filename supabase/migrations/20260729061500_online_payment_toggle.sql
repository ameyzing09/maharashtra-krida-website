-- A kill switch for online (Razorpay) payments.
--
-- Needed immediately because Razorpay is verifying the website for live-mode
-- activation and online payments must stay off until that completes. Putting it
-- in the database rather than in code means re-enabling afterwards is one click
-- in /menu/invoice-settings — no PR, no Netlify build, no functions deploy.
--
-- Defaults to true so applying this migration changes nothing on its own; the
-- switch is then thrown from the admin UI.
--
-- Note this table is publicly readable by design (see the payment_settings
-- migration): the registration form has to know which methods to offer before
-- anyone signs in. Only admins can write it, and — as of this change — the
-- create-badminton-order Edge Function reads it server-side and refuses a
-- disabled method, so turning the switch off actually stops orders rather than
-- just hiding a button.

alter table payment_settings
  add column if not exists online_enabled boolean not null default true;

comment on column payment_settings.online_enabled is
  'When false, create-badminton-order refuses paymentMode "razorpay" and the '
  'registration form hides the online option. Used to suspend card payments '
  'during payment-gateway verification or an outage.';
