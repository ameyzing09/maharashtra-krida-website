// deno-lint-ignore-file no-explicit-any
import { corsHeaders, isAllowedOrigin } from "../_shared/cors.ts";
import { generateAndStoreInvoice } from "../_shared/invoice.ts";

const MAX_BODY_BYTES = 2 * 1024;

// `verify_jwt = true` (config.toml) only proves the bearer token was signed
// by this project — the anon key itself is a validly-signed JWT too, so that
// alone doesn't prove a real admin session. Resolve the token against GoTrue
// to confirm it's an actual logged-in user, not just any project JWT.
async function requireAdmin(req: Request): Promise<boolean> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;
  const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
    headers: {
      apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      Authorization: `Bearer ${token}`,
    },
  });
  return res.ok;
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
