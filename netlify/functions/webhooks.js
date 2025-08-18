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
