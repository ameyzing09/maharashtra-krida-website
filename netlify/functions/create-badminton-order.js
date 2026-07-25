/* eslint-disable no-undef */
import Razorpay from "razorpay";

// Fees in paise. MUST stay in sync with src/constants/badminton.ts.
const FEE_MAP = {
  mens_singles: 150000,
  womens_singles: 150000,
  mens_doubles: 300000,
  womens_doubles: 300000,
  mixed_doubles: 300000,
  team_event: 500000,
};

// Allowed player counts per category: [min, max]. The team event collects no
// player details — only a team name — and is exclusive: it cannot be combined
// with any other entry in the same registration.
const PLAYER_BOUNDS = {
  mens_singles: [1, 1],
  womens_singles: [1, 1],
  mens_doubles: [2, 2],
  womens_doubles: [2, 2],
  mixed_doubles: [2, 2],
};

const CATEGORY_LABEL = {
  mens_singles: "Men's Singles",
  womens_singles: "Women's Singles",
  mens_doubles: "Men's Doubles",
  womens_doubles: "Women's Doubles",
  mixed_doubles: "Mixed Doubles",
  team_event: "Corporate Team Event",
};

// Abuse guards
const MAX_BODY_BYTES = 50 * 1024;
const MAX_ENTRIES = 10;
const MAX_SHORT = 120; // names, company, emails
const MAX_LONG = 200; // notes, designation
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9]{10}$/;

function allowedOrigin(origin) {
  if (!origin) return true; // non-browser callers (no Origin header) — e.g. server-to-server
  try {
    const { hostname } = new URL(origin);
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    if (hostname.endsWith(".netlify.app")) return true;
    if (process.env.URL && origin === process.env.URL) return true; // Netlify primary URL
    if (process.env.SITE_ORIGIN && origin === process.env.SITE_ORIGIN) return true; // custom domain
    return false;
  } catch {
    return false;
  }
}

function bad(msg) {
  return { statusCode: 400, body: JSON.stringify({ error: msg }) };
}

function str(v, max) {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max;
}

function validate(organization, entries) {
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

function summarizeCategories(entries) {
  return entries
    .map((e) => CATEGORY_LABEL[e.category] + (e.teamName ? ` (${e.teamName})` : ""))
    .join(", ");
}

async function insertPendingRow(order, organization, entries, amount) {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/badminton_registrations`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      order_id: order.id,
      status: "PENDING",
      payment_method: "razorpay",
      company: organization.companyName,
      contact_person: organization.contactPersonName || null,
      official_email: organization.officialEmail,
      phone: String(organization.phone),
      personal_email: organization.personalEmail || null,
      categories_summary: summarizeCategories(entries),
      total_paise: amount,
      entries,
    }),
  });
  if (!res.ok) {
    throw new Error(`Supabase insert failed (${res.status}): ${await res.text()}`);
  }
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }
  if (!allowedOrigin(event.headers && (event.headers.origin || event.headers.Origin))) {
    return { statusCode: 403, body: JSON.stringify({ error: "Forbidden" }) };
  }
  if ((event.body || "").length > MAX_BODY_BYTES) {
    return { statusCode: 413, body: JSON.stringify({ error: "Payload too large" }) };
  }

  try {
    const { organization, entries } = JSON.parse(event.body || "{}");

    const invalid = validate(organization, entries);
    if (invalid) return bad(invalid);

    // Server is the source of truth for the amount.
    const amount = entries.reduce((sum, e) => sum + FEE_MAP[e.category], 0);

    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await new Promise((resolve, reject) => {
      rzp.orders.create(
        {
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
        },
        (error, orderResponse) => (error ? reject(error) : resolve(orderResponse))
      );
    });

    // Persist the full registration as a PENDING row. The webhook flips it to
    // PAID on payment.captured. This is the durable record of the roster.
    try {
      await insertPendingRow(order, organization, entries, amount);
    } catch (dbErr) {
      // Do not fail the payment if the insert hiccups; the webhook has an
      // upsert fallback keyed on order_id.
      console.error("Failed to write pending badminton row:", dbErr.message);
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.id,
        amount,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
      }),
    };
  } catch (error) {
    console.error("Error creating badminton order:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
};
