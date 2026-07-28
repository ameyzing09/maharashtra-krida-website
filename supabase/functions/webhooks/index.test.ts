import { assert, assertEquals, assertFalse } from "@std/assert";
import { stubEnv, stubFetch } from "../_shared/stub.ts";
import { handleRequest, hexToBytes, hmacVerify } from "./index.ts";

stubEnv();

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

// ── handleRequest: what actually reaches the database ──────────────────────
//
// The HMAC tests above prove the door is locked. These prove what happens once
// a genuine Razorpay event gets through — the half `deno check` can't see.

const SECRET = "stub-webhook-secret";

function captured(entity: Record<string, unknown>): string {
  return JSON.stringify({
    event: "payment.captured",
    payload: { payment: { entity } },
  });
}

async function deliver(body: string): Promise<Response> {
  return await handleRequest(
    new Request("https://stub.functions/webhooks", {
      method: "POST",
      headers: { "x-razorpay-signature": await sign(SECRET, body) },
      body,
    })
  );
}

const BADMINTON_ENTITY = {
  id: "pay_TEST1",
  order_id: "order_TEST1",
  amount: 550000,
  contact: "9876543210",
  email: "jane@acme.com",
  notes: { regType: "badminton", company: "Acme Technologies", email: "jane@acme.com" },
};

Deno.test("a captured badminton payment flips the pending row to PAID", async () => {
  // Non-empty representation = the PENDING row was found and updated.
  const fetchStub = stubFetch([{ match: "stub.supabase.co", json: [{ id: "row-1" }] }]);
  try {
    const res = await deliver(captured(BADMINTON_ENTITY));
    assertEquals(res.status, 200);

    const patch = fetchStub.calls.find((c) => c.method === "PATCH");
    assert(patch, "expected a PATCH to the registrations table");
    assert(patch.url.includes("order_id=eq.order_TEST1"), patch.url);
    const body = patch.body as Record<string, unknown>;
    assertEquals(body.status, "PAID");
    assertEquals(body.payment_id, "pay_TEST1");
    assert(typeof body.paid_at === "string");

    // The row existed, so no upsert fallback should have run.
    assertEquals(fetchStub.calls.filter((c) => c.url.includes("on_conflict=order_id")).length, 0);
  } finally {
    fetchStub.restore();
  }
});

Deno.test("a missing pending row falls back to a PAID upsert carrying the notes", async () => {
  // Empty representation = no PENDING row matched.
  const fetchStub = stubFetch([{ match: "stub.supabase.co", json: [] }]);
  try {
    assertEquals((await deliver(captured(BADMINTON_ENTITY))).status, 200);

    const upsert = fetchStub.calls.find((c) => c.url.includes("on_conflict=order_id"));
    assert(upsert, "expected an upsert fallback");
    const body = upsert.body as Record<string, unknown>;
    assertEquals(body.order_id, "order_TEST1");
    assertEquals(body.status, "PAID");
    assertEquals(body.payment_method, "razorpay");
    assertEquals(body.company, "Acme Technologies");
    assertEquals(body.official_email, "jane@acme.com");
    assertEquals(body.total_paise, 550000);
  } finally {
    fetchStub.restore();
  }
});

// Regression: the PATCH used to interpolate p.order_id raw, so an entity
// without one produced `order_id=eq.undefined`. Both statements now share the
// same fallback id, which is what makes a replay find the upserted row.
Deno.test("an entity with no order_id uses one synthetic id for both statements", async () => {
  const fetchStub = stubFetch([{ match: "stub.supabase.co", json: [] }]);
  try {
    const { order_id: _omitted, ...noOrderId } = BADMINTON_ENTITY;
    assertEquals((await deliver(captured(noOrderId))).status, 200);

    const patch = fetchStub.calls.find((c) => c.method === "PATCH");
    assert(patch, "expected a PATCH");
    assertFalse(patch.url.includes("undefined"), `leaked undefined: ${patch.url}`);
    assert(patch.url.includes("order_id=eq.missing-pay_TEST1"), patch.url);

    const upsert = fetchStub.calls.find((c) => c.url.includes("on_conflict=order_id"));
    assertEquals((upsert?.body as Record<string, unknown>).order_id, "missing-pay_TEST1");
  } finally {
    fetchStub.restore();
  }
});

Deno.test("a non-badminton payment is ignored without touching the database", async () => {
  const fetchStub = stubFetch([{ match: "stub.supabase.co", json: [] }]);
  try {
    const res = await deliver(captured({ ...BADMINTON_ENTITY, notes: { regType: "chess" } }));
    assertEquals(res.status, 200);
    assertEquals(await res.text(), "Ignored");
    assertEquals(fetchStub.calls.length, 0);
  } finally {
    fetchStub.restore();
  }
});

Deno.test("an unsigned or wrongly signed delivery never reaches the database", async () => {
  const fetchStub = stubFetch([{ match: "stub.supabase.co", json: [] }]);
  try {
    const body = captured(BADMINTON_ENTITY);
    const cases: Record<string, string>[] = [
      {}, // no signature header at all
      { "x-razorpay-signature": await sign("wrong-secret", body) },
    ];
    for (const headers of cases) {
      const res = await handleRequest(
        new Request("https://stub.functions/webhooks", { method: "POST", headers, body })
      );
      assertEquals(res.status, 400);
    }
    assertEquals(fetchStub.calls.length, 0);
  } finally {
    fetchStub.restore();
  }
});

Deno.test("events other than payment.captured are ignored", async () => {
  const fetchStub = stubFetch([{ match: "stub.supabase.co", json: [] }]);
  try {
    const body = JSON.stringify({
      event: "payment.failed",
      payload: { payment: { entity: BADMINTON_ENTITY } },
    });
    assertEquals((await deliver(body)).status, 200);
    assertEquals(fetchStub.calls.length, 0);
  } finally {
    fetchStub.restore();
  }
});
