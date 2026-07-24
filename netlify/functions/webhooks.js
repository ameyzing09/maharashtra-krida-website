/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const crypto = require("crypto");
const { google } = require("googleapis");

function sheets() {
  const creds = JSON.parse(process.env.GOOGLE_SA_CREDENTIALS_JSON);
  const jwt = new google.auth.JWT(
    creds.client_email,
    null,
    creds.private_key,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
  return google.sheets({ version: "v4", auth: jwt });
}

const BADMINTON_TAB = process.env.BADMINTON_SHEET_TAB || "Badminton";

// Marks a badminton registration PAID by locating its PENDING row (created by
// create-badminton-order) via the order_id in column B. Columns:
// A=timestamp, B=order_id, C=status, D=payment_id, E=paid_at, ...
async function markBadmintonPaid(p) {
  const api = sheets();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const paidAt = new Date().toISOString();

  const read = await api.spreadsheets.values.get({
    spreadsheetId,
    range: `${BADMINTON_TAB}!B:B`,
  });
  const orderIds = (read.data.values || []).map((r) => r[0]);
  // rowNumber is 1-based; index 0 is the header row.
  const idx = orderIds.findIndex((id) => id === p.order_id);

  if (idx > 0) {
    const rowNumber = idx + 1;
    await api.spreadsheets.values.update({
      spreadsheetId,
      range: `${BADMINTON_TAB}!C${rowNumber}:E${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: { values: [["PAID", p.id, paidAt]] },
    });
    return;
  }

  // Fallback: no pending row found — append a PAID marker so the payment is not lost.
  await api.spreadsheets.values.append({
    spreadsheetId,
    range: `${BADMINTON_TAB}!A1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        paidAt,
        p.order_id || "",
        "PAID",
        p.id,
        paidAt,
        (p.notes && p.notes.company) || "",
        "",
        (p.notes && p.notes.email) || p.email || "",
        p.contact || "",
        "",
        "",
        p.amount ? (p.amount / 100).toFixed(2) : "",
        "",
      ]],
    },
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const sig = event.headers["x-razorpay-signature"];
  const secret = process.env.RZP_WEBHOOK_SECRET;
  const raw = event.body || "";

  // verify signature
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  if (!sig || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) {
    return { statusCode: 400, body: "Invalid signature" };
  }

  const payload = JSON.parse(raw);
  if (payload.event !== "payment.captured") {
    return { statusCode: 200, body: "Ignored" };
  }

  try {
    const p = payload.payload.payment.entity;

    // Badminton registrations are persisted at order-creation time; here we
    // just flip the pending row to PAID. Keeps the chess flow untouched.
    if (p.notes && p.notes.regType === "badminton") {
      await markBadmintonPaid(p);
      return { statusCode: 200, body: "Logged (badminton)" };
    }

    // Append row to Sheet1 (make sure it exists + has headers)
    const values = [[
      new Date().toISOString(),
      p.id,                   // payment_id
      p.order_id || "",
      p.method || "",
      p.amount || "",         // paise
      p.currency || "",
      p.email || "",
      p.contact || "",
      (p.notes && p.notes.eventCode) || "",
      (p.notes && p.notes.name) || "",
      (p.notes && p.notes.phone) || "",
      (p.notes && p.notes.email) || "",
      (p.notes && p.notes.other) || "",
    ]];

    await sheets().spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: { values },
    });

    return { statusCode: 200, body: "Logged" };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  }
};
