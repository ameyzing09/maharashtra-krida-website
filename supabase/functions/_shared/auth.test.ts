import { assertEquals } from "@std/assert";
import { isAuthorizedAdmin } from "./auth.ts";

const USER = "6b1f0b6e-0f1a-4f0b-9b6e-0f1a4f0b9b6e";
const OTHER = "11111111-2222-3333-4444-555555555555";

Deno.test("a user on the allowlist is authorized", () => {
  assertEquals(isAuthorizedAdmin(USER, [USER, OTHER]), true);
});

// The bug this whole change exists to fix: before the allowlist, any validly
// authenticated user passed the admin check.
Deno.test("an authenticated user not on the allowlist is refused", () => {
  assertEquals(isAuthorizedAdmin(OTHER, [USER]), false);
});

// Fail closed, never open — an empty or unavailable allowlist must not be
// read as "no restrictions".
Deno.test("an empty allowlist authorizes nobody", () => {
  assertEquals(isAuthorizedAdmin(USER, []), false);
});

Deno.test("a missing user id is refused", () => {
  assertEquals(isAuthorizedAdmin(null, [USER]), false);
  assertEquals(isAuthorizedAdmin("", [USER]), false);
});

Deno.test("matching is exact, not by prefix", () => {
  assertEquals(isAuthorizedAdmin(USER.slice(0, 8), [USER]), false);
  assertEquals(isAuthorizedAdmin(USER + "x", [USER]), false);
});
