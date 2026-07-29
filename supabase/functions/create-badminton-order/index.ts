import { corsHeaders, isAllowedOrigin } from "../_shared/cors.ts";
import { CategoryEntry, Organization } from "../_shared/badminton.ts";
import {
  computeAmount,
  fetchPaymentModes,
  generateReferenceCode,
  insertPendingRow,
  MAX_BODY_BYTES,
  parseRequestBody,
} from "../_shared/registration.ts";

/** Only the fields this function reads back off Razorpay's order response. */
type RazorpayOrder = { id: string };

// The declared return type is what narrows res.json() at the boundary — no
// assertion, and no `any` leaking inward from an external API.
async function createRazorpayOrder(
  amount: number,
  organization: Organization
): Promise<RazorpayOrder> {
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
async function createOfflineReservation(
  organization: Organization,
  entries: CategoryEntry[],
  amount: number
) {
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
    const body: unknown = JSON.parse(raw || "{}");

    const parsed = parseRequestBody(body);
    if (!parsed.ok) {
      return new Response(JSON.stringify({ error: parsed.error }), { status: 400, headers });
    }
    const { organization, entries, paymentMode } = parsed;

    // The organiser can suspend either payment method from the admin UI. This
    // has to be enforced here, not just in the form: this function runs with
    // verify_jwt = false behind an origin allowlist that admits non-browser
    // callers, so a hidden button stops nobody. 503 rather than 400 — the
    // request is fine, the method is just unavailable right now.
    const modes = await fetchPaymentModes();
    const wantsOffline = paymentMode === "offline";
    if (wantsOffline && !modes.offlineEnabled) {
      return new Response(
        JSON.stringify({ error: "Offline registration is not available at the moment." }),
        { status: 503, headers }
      );
    }
    if (!wantsOffline && !modes.onlineEnabled) {
      return new Response(
        JSON.stringify({
          error:
            "Online payment is temporarily unavailable. Please try again later or contact us to register.",
        }),
        { status: 503, headers }
      );
    }

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
