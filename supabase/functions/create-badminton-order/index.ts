// deno-lint-ignore-file no-explicit-any
import { corsHeaders, isAllowedOrigin } from "../_shared/cors.ts";
import { CATEGORY_LABEL, FEE_MAP, PLAYER_BOUNDS } from "../_shared/badminton.ts";

// Abuse guards
const MAX_BODY_BYTES = 50 * 1024;
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

  // Team Event is exclusive: a registration is either one team entry, or any
  // mix of individual entries — never both, and never more than one team.
  const teamEntries = entries.filter((e) => e && e.category === "team_event");
  if (teamEntries.length > 0) {
    if (entries.length > 1) {
      return "Corporate Team Event cannot be combined with other categories";
    }
    const team = teamEntries[0];
    if (!str(team.teamName || "", MAX_SHORT) || String(team.teamName).trim().length < 2) {
      return "Team name is required for the Corporate Team Event";
    }
    return null;
  }

  for (const e of entries) {
    if (!e || !FEE_MAP[e.category]) return `Invalid category: ${e && e.category}`;
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

async function createRazorpayOrder(amount: number, organization: any) {
  const keyId = Deno.env.get("RAZORPAY_KEY_ID")!;
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
  const auth = btoa(`${keyId}:${keySecret}`);
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt: `bad-${Date.now()}`,
      payment_capture: 1,
      // Razorpay notes are size-limited; the full roster is stored in
      // Supabase, not here.
      notes: {
        regType: "badminton",
        company: organization.companyName,
        email: organization.officialEmail,
      },
    }),
  });
  if (!res.ok) throw new Error(`Razorpay order create failed (${res.status}): ${await res.text()}`);
  return await res.json();
}

async function insertPendingRow(orderId: string, organization: any, entries: any[], amount: number) {
  const url = `${Deno.env.get("SUPABASE_URL")}/rest/v1/badminton_registrations`;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const res = await fetch(url, {
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
      payment_method: "razorpay",
      company: organization.companyName,
      contact_person: organization.contactPersonName ?? null,
      official_email: organization.officialEmail,
      phone: String(organization.phone),
      personal_email: organization.personalEmail ?? null,
      categories_summary: summarizeCategories(entries),
      total_paise: amount,
      entries,
    }),
  });
  if (!res.ok) throw new Error(`Supabase insert failed (${res.status}): ${await res.text()}`);
}

export async function handleRequest(req: Request): Promise<Response> {
  const origin = req.headers.get("origin");
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers });
  }
  if (!isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return new Response(JSON.stringify({ error: "Payload too large" }), { status: 413, headers });
  }

  try {
    const { organization, entries } = JSON.parse(raw || "{}");

    const invalid = validate(organization, entries);
    if (invalid) return new Response(JSON.stringify({ error: invalid }), { status: 400, headers });

    // Server is the source of truth for the amount.
    const amount = computeAmount(entries);
    const order = await createRazorpayOrder(amount, organization);

    // Persist the full registration as a PENDING row. The webhook flips it to
    // PAID on payment.captured. This is the durable record of the roster.
    try {
      await insertPendingRow(order.id, organization, entries, amount);
    } catch (dbErr) {
      // Do not fail the payment if the insert hiccups; the webhook has an
      // upsert fallback keyed on order_id.
      console.error("Failed to write pending badminton row:", (dbErr as Error).message);
    }

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount,
        currency: "INR",
        keyId: Deno.env.get("RAZORPAY_KEY_ID"),
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error creating badminton order:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers });
  }
}

if (import.meta.main) {
  Deno.serve(handleRequest);
}
