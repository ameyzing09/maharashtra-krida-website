// deno-lint-ignore-file no-explicit-any
// Shared registration validation + persistence, used by both the online
// (Razorpay) and offline ("company will pay separately") create paths.
import { CATEGORY_LABEL, FEE_MAP, PLAYER_BOUNDS } from "./badminton.ts";

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

/** Pure — no Deno.* calls — so it's directly unit-testable with `deno test`. */
export function validate(organization: any, entries: any[]): string | null {
  if (!organization || typeof organization !== "object") return "Missing organisation details";
  if (!str(organization.companyName, MAX_SHORT)) return "Invalid company name";
  if (!str(organization.officialEmail, MAX_SHORT) || !EMAIL_RE.test(organization.officialEmail))
    return "Invalid official email";
  if (!PHONE_RE.test(String(organization.phone || ""))) return "Invalid phone number";
  if (organization.contactPersonName && !str(organization.contactPersonName, MAX_SHORT))
    return "Invalid contact person name";
  if (!Array.isArray(entries) || entries.length === 0) return "No entries provided";
  if (entries.length > MAX_ENTRIES) return "Too many entries";

  // A registration may freely mix corporate team entries with individual
  // categories, and may contain more than one team — MAX_ENTRIES is the only
  // cap. Every entry is checked on its own terms below.
  for (const e of entries) {
    if (!e || !FEE_MAP[e.category]) return `Invalid category: ${e && e.category}`;

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
    for (const p of e.players) {
      if (!p || !str(p.name, MAX_SHORT) || !PHONE_RE.test(String(p.phone || "")))
        return `Incomplete player details in ${CATEGORY_LABEL[e.category]}`;
      if (!str(p.officialEmail, MAX_SHORT) || !EMAIL_RE.test(p.officialEmail))
        return `Invalid player email in ${CATEGORY_LABEL[e.category]}`;
      if (p.designation && String(p.designation).length > MAX_LONG) return "Designation too long";
    }
  }
  return null;
}

export function computeAmount(entries: any[]): number {
  return entries.reduce((sum, e) => sum + FEE_MAP[e.category], 0);
}

export function summarizeCategories(entries: any[]): string {
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
  organization: any,
  entries: any[],
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
