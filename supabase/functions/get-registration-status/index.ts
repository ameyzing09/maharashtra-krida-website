// deno-lint-ignore-file no-explicit-any
import { corsHeaders, isAllowedOrigin } from "../_shared/cors.ts";

const MAX_BODY_BYTES = 2 * 1024;

// Public status lookup for a registration by its reference code (the MKB-
// code for offline, or the Razorpay order id for online). Returns only a
// minimal, non-sensitive subset — never the full row — so the zero-anon RLS
// on badminton_registrations is preserved. Access model = "you know your own
// unguessable code" (same disclosed trade-off as get-invoice).
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
    const { code } = JSON.parse(raw || "{}");
    if (typeof code !== "string" || code.length < 5 || code.length > 64) {
      return new Response(JSON.stringify({ found: false }), { status: 200, headers });
    }

    const base = `${Deno.env.get("SUPABASE_URL")}/rest/v1`;
    const sbHeaders = {
      apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    };

    const res = await fetch(
      `${base}/badminton_registrations?order_id=eq.${encodeURIComponent(code)}` +
        `&select=status,company,total_paise,payment_method,paid_at,categories_summary,invoice_path`,
      { headers: sbHeaders }
    );
    if (!res.ok) throw new Error(`lookup failed (${res.status})`);
    const rows = await res.json();
    const row = rows[0];
    if (!row) return new Response(JSON.stringify({ found: false }), { status: 200, headers });

    return new Response(
      JSON.stringify({
        found: true,
        status: row.status,
        company: row.company,
        totalPaise: row.total_paise,
        categoriesSummary: row.categories_summary,
        paymentMethod: row.payment_method,
        paidAt: row.paid_at,
        invoiceReady: row.status === "PAID" && !!row.invoice_path,
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("get-registration-status failed:", error);
    return new Response(JSON.stringify({ found: false }), { status: 200, headers });
  }
}

if (import.meta.main) {
  Deno.serve(handleRequest);
}
