# Production runbook

There is **one** Supabase project, `admofuvpawimmotbubls` (ap-south-1), and it is
production. It started life as the dev project and was promoted in place rather than
replaced. Deploy previews on `*.netlify.app` share it — a preview writes real data and
charges through whichever Razorpay account is currently live.

Frontend deploys to Netlify from `master` (`netlify.toml`). The backend is Supabase
Edge Functions, deployed separately with the CLI.

---

## Switching the Razorpay account

The three Razorpay secrets exist only as Edge Function secrets. The publishable key id
is **not** in the frontend bundle — `create-badminton-order` returns it per order — so
switching accounts needs no rebuild and no Netlify deploy.

Credentials live in gitignored profile files. Create one per account:

```
.razorpay/live.env
.razorpay/test.env
```

each containing exactly:

```
RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
RZP_WEBHOOK_SECRET=xxxxxxxx
```

Then:

```sh
npm run rzp:status      # which account is live right now?
npm run rzp:use live    # push .razorpay/live.env (asks you to type "live")
npm run rzp:use test    # switch back
```

`rzp:use` writes the values to a 0600 temp file and pushes them with
`supabase secrets set --env-file` (never on a command line, which would leak into argv
and shell history), redeploys `create-badminton-order` and `webhooks` so no warm
instance keeps serving the old key, then verifies.

`rzp:status` works because `supabase secrets list` returns SHA-256 digests of the
values. It hashes each local profile and matches. Three outcomes:

| Output | Meaning |
| --- | --- |
| `active profile: live` | all three secrets came from `.razorpay/live.env` |
| `MIXED` | the three secrets are from different profiles — a switch half-completed. Re-run `rzp:use`. |
| `unknown` | nothing matches; secrets were set outside this script, or a profile file is stale |

### Register the webhook (dashboard, once per Razorpay account)

Settings → Webhooks → Add:

- URL: `https://admofuvpawimmotbubls.supabase.co/functions/v1/webhooks`
- Active events: **`payment.captured` only** — the only event
  `supabase/functions/webhooks/index.ts` handles.
- Secret: the same value as `RZP_WEBHOOK_SECRET` in that account's profile file.

Without this, payments succeed at Razorpay but registrations stay `PENDING` forever and
no invoice is generated.

---

## One-time cutover cleanup

Run once, when promoting the project to production. Both steps are destructive.

**1. Clear test registrations and reset the invoice counter.** Paste
`supabase/maintenance/reset-registrations.sql` into Dashboard → SQL Editor and run it.
It truncates `badminton_registrations` and restarts `invoice_seq`, so the first real
invoice is `MK-BADM-<year>-000001`.

**2. Delete the orphaned invoice PDFs.** Truncating the rows does not remove the storage
objects:

```sh
# Note the three slashes: the URL form is ss:///<bucket>/<prefix>
supabase --experimental storage ls ss:///invoices/       # look first
supabase --experimental storage rm -r ss:///invoices/    # then remove
```

Do **not** touch the `media` bucket — the invoice generator reads the header logo from
`media/branding/badminton-logo.jpg` (`supabase/functions/_shared/invoice.ts`).

CMS content (events, teams, matches, gallery, news, homepage), auth users, and
`admin_users` are intentionally left alone.

---

## Admins

Write access to every table, plus the admin-only Edge Functions, is gated on membership
in `admin_users` — being merely signed in is not enough
(`supabase/migrations/20260726192917_admin_authorization.sql`,
`supabase/functions/_shared/auth.ts`).

That migration grandfathered every user who existed when it ran. Review it:

```sql
select u.email, a.note, a.added_at
from admin_users a join auth.users u on u.id = a.user_id
order by a.added_at;
```

Grant / revoke:

```sql
select public.grant_admin('person@example.com');   -- user must already exist in auth.users
delete from admin_users where user_id = '<uuid>';
```

There is no signup screen; create users in Dashboard → Authentication → Users. Keep
public sign-ups **off** in the dashboard.

---

## Deploying

```sh
# Frontend — Netlify builds from master automatically
npm run build && npm run lint

# Edge Functions
supabase functions deploy <name>          # or omit <name> for all

# Edge Function tests — must run from supabase/functions/, that's where the
# deno.json import map lives; from the repo root the imports don't resolve.
(cd supabase/functions && deno test --allow-all .)

# Migrations
supabase migration list --linked          # compare local vs remote
supabase db push
```

`supabase/maintenance/*.sql` is never applied by `db push` — that is the point of
keeping it out of `migrations/`.

---

## Go-live smoke test

With the live profile pushed and the webhook registered:

1. Complete a real registration at `/badminton` (a single low-value category keeps the
   test cheap; refund it afterwards from the Razorpay dashboard).
2. The order appears in the **production** Razorpay dashboard.
3. The browser lands on `/payment/success`.
4. Within a few seconds the row flips `PENDING → PAID` — that is the webhook and its
   HMAC check working. If it stays `PENDING`, the webhook URL or secret is wrong.
5. The invoice downloads, and its number is `MK-BADM-<year>-000001`.
6. Sign in as an admin: `/registrations` lists the row and a status update saves.

---

## Known gaps

- `create-badminton-order` runs with `verify_jwt = false` and is gated only by the
  origin allowlist in `supabase/functions/_shared/cors.ts`, which allows a null Origin
  for non-browser callers. A script can therefore create Razorpay orders and `PENDING`
  rows without a session. Deliberate (browsers alone can't be the boundary), but on a
  live account it is a nuisance surface worth rate limiting.
- Deploy previews share the production database and the live Razorpay account. Test
  payment changes against the `test` profile.
