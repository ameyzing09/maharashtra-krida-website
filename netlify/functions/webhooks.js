/* eslint-disable no-undef */
import crypto from "node:crypto";

const SB_HEADERS = () => ({
  apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
});

// Flip the PENDING row (written at order creation) to PAID. If the row is
// missing (insert hiccup), upsert a PAID fallback keyed on order_id so webhook
// replays can never duplicate rows.
async function markPaid(p) {
  const base = `${process.env.SUPABASE_URL}/rest/v1/badminton_registrations`;
  const paidAt = new Date().toISOString();

  const patch = await fetch(`${base}?order_id=eq.${encodeURIComponent(p.order_id)}`, {
    method: "PATCH",
    headers: { ...SB_HEADERS(), Prefer: "return=representation" },
    body: JSON.stringify({ status: "PAID", payment_id: p.id, paid_at: paidAt }),
  });
  if (!patch.ok) throw new Error(`Supabase PATCH failed (${patch.status}): ${await patch.text()}`);
  const rows = await patch.json();
  if (rows.length > 0) return;

  // Fallback: pending row never landed — upsert a PAID marker.
  const upsert = await fetch(`${base}?on_conflict=order_id`, {
    method: "POST",
    headers: { ...SB_HEADERS(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      order_id: p.order_id || `missing-${p.id}`,
      status: "PAID",
      payment_id: p.id,
      paid_at: paidAt,
      payment_method: "razorpay",
      company: (p.notes && p.notes.company) || "(unknown)",
      official_email: (p.notes && p.notes.email) || p.email || "",
      phone: p.contact || "",
      categories_summary: "",
      total_paise: p.amount || 0,
      entries: [],
    }),
  });
  if (!upsert.ok) throw new Error(`Supabase upsert failed (${upsert.status}): ${await upsert.text()}`);
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const sig = event.headers["x-razorpay-signature"];
  const secret = process.env.RZP_WEBHOOK_SECRET;
  const raw = event.body || "";

  // verify signature before touching anything
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  if (
    !sig ||
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  ) {
    return { statusCode: 400, body: "Invalid signature" };
  }

  const payload = JSON.parse(raw);
  if (payload.event !== "payment.captured") {
    return { statusCode: 200, body: "Ignored" };
  }

  try {
    const p = payload.payload.payment.entity;
    if (!p.notes || p.notes.regType !== "badminton") {
      return { statusCode: 200, body: "Ignored" };
    }
    await markPaid(p);
    return { statusCode: 200, body: "Logged" };
  } catch (e) {
    console.error("Webhook processing failed:", e.message);
    return { statusCode: 500, body: "Processing failed" };
  }
};
