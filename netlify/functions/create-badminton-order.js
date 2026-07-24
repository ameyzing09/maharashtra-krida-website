/* eslint-disable no-undef */
import Razorpay from "razorpay";
import { google } from "googleapis";

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

const BADMINTON_TAB = process.env.BADMINTON_SHEET_TAB || "Badminton";

function sheets() {
  const creds = JSON.parse(process.env.GOOGLE_SA_CREDENTIALS_JSON);
  const jwt = new google.auth.JWT(creds.client_email, null, creds.private_key, [
    "https://www.googleapis.com/auth/spreadsheets",
  ]);
  return google.sheets({ version: "v4", auth: jwt });
}

function validate(organization, entries) {
  if (!organization || typeof organization !== "object") return "Missing organisation details";
  if (!organization.companyName || !organization.officialEmail || !organization.phone) {
    return "Incomplete organisation details";
  }
  if (!Array.isArray(entries) || entries.length === 0) return "No entries provided";

  // Team Event is exclusive: a registration is either one team entry, or any
  // mix of individual entries — never both, and never more than one team.
  const teamEntries = entries.filter((e) => e && e.category === "team_event");
  if (teamEntries.length > 0) {
    if (entries.length > 1) {
      return "Corporate Team Event cannot be combined with other categories";
    }
    const team = teamEntries[0];
    if (!team.teamName || String(team.teamName).trim().length < 2) {
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
      if (!p || !p.name || !p.phone || !p.officialEmail) {
        return `Incomplete player details in ${CATEGORY_LABEL[e.category]}`;
      }
    }
  }
  return null;
}

function summarizeCategories(entries) {
  return entries
    .map((e) => CATEGORY_LABEL[e.category] + (e.teamName ? ` (${e.teamName})` : ""))
    .join(", ");
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { organization, entries } = JSON.parse(event.body || "{}");

    const invalid = validate(organization, entries);
    if (invalid) return { statusCode: 400, body: JSON.stringify({ error: invalid }) };

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
          // Razorpay notes are size-limited; the full roster is stored in the
          // Sheet below, not here.
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
      const row = [
        new Date().toISOString(), // timestamp
        order.id, // order_id
        "PENDING", // status
        "", // payment_id (filled by webhook)
        "", // paid_at (filled by webhook)
        organization.companyName,
        organization.contactPersonName || "",
        organization.officialEmail,
        organization.phone,
        organization.personalEmail || "",
        summarizeCategories(entries),
        (amount / 100).toFixed(2), // total INR
        JSON.stringify(entries), // full roster
      ];
      await sheets().spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range: `${BADMINTON_TAB}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [row] },
      });
    } catch (sheetErr) {
      // Do not fail the payment if the sheet write hiccups; the webhook has a
      // fallback that appends a PAID row when no pending row is found.
      console.error("Failed to write pending badminton row:", sheetErr.message);
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
    return { statusCode: 500, body: error.message || "Internal Server Error" };
  }
};
