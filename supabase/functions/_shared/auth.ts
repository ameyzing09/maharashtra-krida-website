// Admin authorization for the admin-only Edge Functions.
//
// Two separate questions, and the old code only asked the first:
//   1. Is this a real logged-in user?  (resolve the token against GoTrue)
//   2. Is that user an admin?          (membership in admin_users)
//
// `verify_jwt = true` in config.toml only proves the bearer token was signed
// by this project — the anon key itself is a validly-signed JWT — so step 1
// still needs the GoTrue round-trip. But step 1 alone authorizes every account
// in the project, which is exactly the hole the admin_users allowlist closes
// (see the 20260726192917_admin_authorization migration).

/** Pure — no Deno.*, no network — so the decision is directly unit-testable. */
export function isAuthorizedAdmin(userId: string | null, adminIds: string[]): boolean {
  if (!userId) return false;
  return adminIds.includes(userId);
}

/** Resolves the bearer token to a user id, or null if it isn't a real session. */
async function resolveUserId(req: Request): Promise<string | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
    headers: {
      apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return null;
  const user = await res.json();
  return typeof user?.id === "string" ? user.id : null;
}

/** Reads the allowlist with the service role (admin_users has no RLS policies
 * at all, so nothing else can see it). */
async function fetchAdminIds(): Promise<string[]> {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const res = await fetch(
    `${Deno.env.get("SUPABASE_URL")}/rest/v1/admin_users?select=user_id`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  if (!res.ok) throw new Error(`admin_users lookup failed (${res.status})`);
  const rows = await res.json();
  return Array.isArray(rows) ? rows.map((r: { user_id: string }) => r.user_id) : [];
}

export async function requireAdmin(req: Request): Promise<boolean> {
  try {
    const userId = await resolveUserId(req);
    if (!userId) return false;
    return isAuthorizedAdmin(userId, await fetchAdminIds());
  } catch (e) {
    // Fail closed: if the allowlist can't be read, refuse rather than fall
    // back to "any authenticated user".
    console.error("Admin check failed:", (e as Error).message);
    return false;
  }
}
