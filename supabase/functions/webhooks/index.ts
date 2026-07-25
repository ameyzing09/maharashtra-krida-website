// deno-lint-ignore-file no-explicit-any
import { generateAndStoreInvoice } from "../_shared/invoice.ts";

/** Pure, portable — used by both the handler and unit tests. */
export function hexToBytes(hex: string): Uint8Array | null {
  if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Verifies a hex-encoded HMAC-SHA256 signature using Web Crypto.
 * `crypto.subtle.verify` performs a constant-time comparison internally, so
 * this is a direct (and cleaner) replacement for Node's timingSafeEqual.
 */
export async function hmacVerify(secret: string, data: string, hexSignature: string): Promise<boolean> {
  const sigBytes = hexToBytes(hexSignature);
  if (!sigBytes) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  return await crypto.subtle.verify("HMAC", key, sigBytes as BufferSource, new TextEncoder().encode(data));
}

const SB_HEADERS = () => ({
  apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
  "Content-Type": "application/json",
});

// Flip the PENDING row (written at order creation) to PAID. If the row is
// missing (insert hiccup), upsert a PAID fallback keyed on order_id so webhook
// replays can never duplicate rows.
async function markPaid(p: any) {
  const base = `${Deno.env.get("SUPABASE_URL")}/rest/v1/badminton_registrations`;
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

export async function handleRequest(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const sig = req.headers.get("x-razorpay-signature");
  const secret = Deno.env.get("RZP_WEBHOOK_SECRET")!;
  const raw = await req.text();

  // verify signature before touching anything
  if (!sig || !(await hmacVerify(secret, raw, sig))) {
    return new Response("Invalid signature", { status: 400 });
  }

  const payload = JSON.parse(raw);
  if (payload.event !== "payment.captured") {
    return new Response("Ignored", { status: 200 });
  }

  try {
    const p = payload.payload.payment.entity;
    if (!p.notes || p.notes.regType !== "badminton") {
      return new Response("Ignored", { status: 200 });
    }
    await markPaid(p);

    // Best-effort: a PDF failure must never fail the payment webhook itself.
    // The admin dashboard can retry generation for a row if this doesn't land.
    try {
      await generateAndStoreInvoice(p.order_id);
    } catch (invErr) {
      console.error("Invoice generation failed:", (invErr as Error).message);
    }

    return new Response("Logged", { status: 200 });
  } catch (e) {
    console.error("Webhook processing failed:", (e as Error).message);
    return new Response("Processing failed", { status: 500 });
  }
}

if (import.meta.main) {
  Deno.serve(handleRequest);
}
