// deno-lint-ignore-file no-explicit-any
import { corsHeaders, isAllowedOrigin } from "../_shared/cors.ts";
import {
  computeAmount,
  generateReferenceCode,
  insertPendingRow,
  MAX_BODY_BYTES,
  summarizeCategories,
  validate,
} from "../_shared/registration.ts";

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

// Offline ("company will pay separately"): reserve a PENDING row with a
// generated reference code, no Razorpay order. Retries on the (astronomically
// unlikely) code collision against the unique order_id.
async function createOfflineReservation(organization: any, entries: any[], amount: number) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferenceCode();
    const res = await insertPendingRow(code, organization, entries, amount, "offline");
    if (res.ok) return code;
    const body = await res.text();
    // 409 = unique violation on order_id → regenerate and retry.
    if (res.status === 409 || /duplicate key|unique/i.test(body)) continue;
    throw new Error(`Supabase insert failed (${res.status}): ${body}`);
  }
  throw new Error("Could not allocate a unique reference code");
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
    const { organization, entries, paymentMode } = JSON.parse(raw || "{}");

    const invalid = validate(organization, entries);
    if (invalid) return new Response(JSON.stringify({ error: invalid }), { status: 400, headers });

    // Server is the source of truth for the amount.
    const amount = computeAmount(entries);

    // ── Offline path: reserve now, pay later, admin confirms. ──
    if (paymentMode === "offline") {
      const referenceCode = await createOfflineReservation(organization, entries, amount);
      return new Response(
        JSON.stringify({ offline: true, referenceCode, amount }),
        { status: 200, headers }
      );
    }

    // ── Online path (default): Razorpay checkout. ──
    const order = await createRazorpayOrder(amount, organization);

    // Persist the full registration as a PENDING row. The webhook flips it to
    // PAID on payment.captured. This is the durable record of the roster.
    try {
      const res = await insertPendingRow(order.id, organization, entries, amount, "razorpay");
      if (!res.ok) throw new Error(`Supabase insert failed (${res.status}): ${await res.text()}`);
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
