// Shared registration validation + persistence, used by both the online
// (Razorpay) and offline ("company will pay separately") create paths.
import {
  CATEGORY_LABEL,
  CategoryEntry,
  FEE_MAP,
  isCategory,
  Organization,
  PLAYER_BOUNDS,
} from "./badminton.ts";

// Abuse guards
export const MAX_BODY_BYTES = 50 * 1024;
const MAX_ENTRIES = 10;
const MAX_SHORT = 120; // names, company, emails
const MAX_LONG = 200; // notes, designation
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9]{10}$/;

function str(v: unknown, max: number): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max;
}

/** Untrusted JSON → an indexable record, or null for anything that isn't one.
 *  The assertion is sound because the typeof check in front of it is what
 *  proves the shape; nothing here trusts the caller. */
function record(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === "object" ? v as Record<string, unknown> : null;
}

/** Pure — no Deno.* calls — so it's directly unit-testable with `deno test`.
 *  Takes `unknown` because this IS the trust boundary: everything it receives
 *  came straight off the wire. */
export function validate(organization: unknown, entries: unknown): string | null {
  const org = record(organization);
  if (!org) return "Missing organisation details";
  if (!str(org.companyName, MAX_SHORT)) return "Invalid company name";
  if (!str(org.officialEmail, MAX_SHORT) || !EMAIL_RE.test(org.officialEmail))
    return "Invalid official email";
  if (!PHONE_RE.test(String(org.phone || ""))) return "Invalid phone number";
  if (org.contactPersonName && !str(org.contactPersonName, MAX_SHORT))
    return "Invalid contact person name";
  if (!Array.isArray(entries) || entries.length === 0) return "No entries provided";
  if (entries.length > MAX_ENTRIES) return "Too many entries";

  // A registration may freely mix corporate team entries with individual
  // categories, and may contain more than one team — MAX_ENTRIES is the only
  // cap. Every entry is checked on its own terms below.
  for (const raw of entries) {
    const e = record(raw);
    if (!e || !isCategory(e.category)) return `Invalid category: ${e && e.category}`;

    // Team entries carry a name instead of a roster — the players are
    // collected before the Captains' Meeting, so PLAYER_BOUNDS has no entry
    // for them and the per-player checks below don't apply.
    if (e.category === "team_event") {
      if (!str(e.teamName || "", MAX_SHORT) || String(e.teamName).trim().length < 2) {
        return "Team name is required for the Corporate Team Event";
      }
      continue;
    }

    const [min, max] = PLAYER_BOUNDS[e.category];
    if (!Array.isArray(e.players) || e.players.length < min || e.players.length > max) {
      return `${CATEGORY_LABEL[e.category]} requires ${min}${min === max ? "" : `-${max}`} player(s)`;
    }
    for (const rawPlayer of e.players) {
      const p = record(rawPlayer);
      if (!p || !str(p.name, MAX_SHORT) || !PHONE_RE.test(String(p.phone || "")))
        return `Incomplete player details in ${CATEGORY_LABEL[e.category]}`;
      if (!str(p.officialEmail, MAX_SHORT) || !EMAIL_RE.test(p.officialEmail))
        return `Invalid player email in ${CATEGORY_LABEL[e.category]}`;
      if (p.designation && String(p.designation).length > MAX_LONG) return "Designation too long";
    }
  }
  return null;
}

type RawPayload = { organization: unknown; entries: unknown };

/** validate() returning null is exactly the condition under which the payload
 *  has this shape, so the predicate delegates rather than re-checking anything. */
function isValidPayload(
  body: RawPayload
): body is RawPayload & { organization: Organization; entries: CategoryEntry[] } {
  return validate(body.organization, body.entries) === null;
}

export type ParsedRequest =
  | { ok: false; error: string }
  | {
    ok: true;
    organization: Organization;
    entries: CategoryEntry[];
    paymentMode: string | null;
  };

/** The single entry point for turning a parsed request body into trusted data.
 *  Callers get either an error message to return verbatim, or fully typed
 *  values — so no handler has to narrow untrusted input itself. */
export function parseRequestBody(body: unknown): ParsedRequest {
  const b = record(body) ?? {};
  const payload: RawPayload = { organization: b.organization, entries: b.entries };

  const error = validate(payload.organization, payload.entries);
  if (error) return { ok: false, error };
  // Unreachable in practice — validate() just returned null. Present so the
  // narrowing is the compiler's conclusion rather than our assertion.
  if (!isValidPayload(payload)) return { ok: false, error: "Invalid registration payload" };

  return {
    ok: true,
    organization: payload.organization,
    entries: payload.entries,
    paymentMode: typeof b.paymentMode === "string" ? b.paymentMode : null,
  };
}

export function computeAmount(entries: CategoryEntry[]): number {
  return entries.reduce((sum, e) => sum + FEE_MAP[e.category], 0);
}

export function summarizeCategories(entries: CategoryEntry[]): string {
  return entries
    .map((e) => CATEGORY_LABEL[e.category] + (e.teamName ? ` (${e.teamName})` : ""))
    .join(", ");
}

// Human-friendly reference code for offline registrations. Excludes
// ambiguous chars (0/O, 1/I/L) so it's easy to read/quote over phone/email.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function generateReferenceCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let s = "";
  for (const b of bytes) s += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return `MKB-${s}`;
}

const SB = () => ({
  url: Deno.env.get("SUPABASE_URL")!,
  key: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
});

/** Inserts a PENDING registration row (service role). `paymentMethod` is
 * "razorpay" for online orders or "offline" for the reserve-and-pay-later
 * flow; `orderId` is the Razorpay order id or the generated MKB- code. */
export async function insertPendingRow(
  orderId: string,
  organization: Organization,
  entries: CategoryEntry[],
  amount: number,
  paymentMethod: "razorpay" | "offline"
): Promise<Response> {
  const { url, key } = SB();
  return await fetch(`${url}/rest/v1/badminton_registrations`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      order_id: orderId,
      status: "PENDING",
      payment_method: paymentMethod,
      company: organization.companyName,
      contact_person: organization.contactPersonName ?? null,
      official_email: organization.officialEmail,
      phone: String(organization.phone),
      personal_email: organization.personalEmail ?? null,
      state: organization.state ?? null,
      categories_summary: summarizeCategories(entries),
      total_paise: amount,
      entries,
    }),
  });
}
