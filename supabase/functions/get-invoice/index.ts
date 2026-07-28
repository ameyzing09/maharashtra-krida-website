import { corsHeaders, isAllowedOrigin } from "../_shared/cors.ts";

const MAX_BODY_BYTES = 2 * 1024;
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

// Access control for this one public function is "you know your own
// unguessable Razorpay order_id" (same trust model as e.g. Stripe hosted
// receipt links), not a login — a deliberate, disclosed trade-off for a
// one-off registration flow. It never returns row data beyond readiness and
// a short-lived signed URL, so it cannot be used to enumerate registrations.
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
    const { order_id } = JSON.parse(raw || "{}");
    if (typeof order_id !== "string" || order_id.length < 5 || order_id.length > 64) {
      return new Response(JSON.stringify({ ready: false }), { status: 200, headers });
    }

    const base = `${Deno.env.get("SUPABASE_URL")}/rest/v1`;
    const sbHeaders = {
      apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    };

    const rowRes = await fetch(
      `${base}/badminton_registrations?order_id=eq.${encodeURIComponent(order_id)}&select=status,invoice_path`,
      { headers: sbHeaders }
    );
    if (!rowRes.ok) throw new Error(`lookup failed (${rowRes.status})`);
    const rows = await rowRes.json();
    const row = rows[0];

    if (!row || row.status !== "PAID" || !row.invoice_path) {
      return new Response(JSON.stringify({ ready: false }), { status: 200, headers });
    }

    const signRes = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/sign/invoices/${row.invoice_path}`,
      {
        method: "POST",
        headers: { ...sbHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ expiresIn: SIGNED_URL_TTL_SECONDS }),
      }
    );
    if (!signRes.ok) throw new Error(`sign failed (${signRes.status})`);
    const signed = await signRes.json();

    return new Response(
      JSON.stringify({ ready: true, url: `${Deno.env.get("SUPABASE_URL")}/storage/v1${signed.signedURL}` }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("get-invoice failed:", error);
    return new Response(JSON.stringify({ ready: false }), { status: 200, headers });
  }
}

if (import.meta.main) {
  Deno.serve(handleRequest);
}
