import { assert, assertEquals, assertFalse } from "@std/assert";
import { hexToBytes, hmacVerify } from "./index.ts";

async function sign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.test("hmacVerify accepts a correctly signed payload", async () => {
  const body = JSON.stringify({ event: "payment.captured" });
  const sig = await sign("secret", body);
  assert(await hmacVerify("secret", body, sig));
});

Deno.test("hmacVerify rejects a tampered payload", async () => {
  const body = JSON.stringify({ event: "payment.captured" });
  const sig = await sign("secret", body);
  assertFalse(await hmacVerify("secret", body + "x", sig));
});

Deno.test("hmacVerify rejects a wrong secret", async () => {
  const body = JSON.stringify({ event: "payment.captured" });
  const sig = await sign("other-secret", body);
  assertFalse(await hmacVerify("secret", body, sig));
});

Deno.test("hmacVerify rejects a garbage signature without throwing", async () => {
  assertFalse(await hmacVerify("secret", "data", "not-hex!!"));
  assertFalse(await hmacVerify("secret", "data", ""));
});

Deno.test("hexToBytes round-trips valid hex", () => {
  const bytes = hexToBytes("deadbeef");
  assertEquals(bytes && Array.from(bytes), [0xde, 0xad, 0xbe, 0xef]);
});

Deno.test("hexToBytes rejects odd-length or non-hex", () => {
  assertEquals(hexToBytes("abc"), null);
  assertEquals(hexToBytes("zz"), null);
});
