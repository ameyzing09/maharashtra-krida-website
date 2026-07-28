// deno-lint-ignore-file no-explicit-any
import { corsHeaders, isAllowedOrigin } from "../_shared/cors.ts";
import { generateAndStoreInvoice } from "../_shared/invoice.ts";
import { requireAdmin } from "../_shared/auth.ts";

const MAX_BODY_BYTES = 2 * 1024;

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
  if (!(await requireAdmin(req))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return new Response(JSON.stringify({ error: "Payload too large" }), { status: 413, headers });
  }

  try {
    const { order_id } = JSON.parse(raw || "{}");
    if (typeof order_id !== "string" || order_id.length < 5 || order_id.length > 64) {
      return new Response(JSON.stringify({ error: "Invalid order_id" }), { status: 400, headers });
    }
    const result = await generateAndStoreInvoice(order_id);
    return new Response(JSON.stringify(result), { status: 200, headers });
  } catch (error) {
    console.error("regenerate-invoice failed:", error);
    return new Response(JSON.stringify({ error: "Failed to regenerate invoice" }), { status: 500, headers });
  }
}

if (import.meta.main) {
  Deno.serve(handleRequest);
}
