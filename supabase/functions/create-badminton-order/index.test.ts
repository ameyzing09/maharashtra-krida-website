// End-to-end coverage of the order handler: request in, Razorpay call and
// Supabase row out. `deno check` proves the types line up; only these prove the
// wiring does — that the server recomputes the amount, that the roster reaches
// the database, and that hostile input is a 400 rather than a 500.
import { assert, assertEquals } from "@std/assert";
import { stubEnv, stubFetch } from "../_shared/stub.ts";
import { handleRequest } from "./index.ts";

stubEnv();

const ORIGIN = "https://maharashtrakrida.in";

const organization = {
  companyName: "Acme Technologies",
  contactPersonName: "Jane Doe",
  officialEmail: "jane@acme.com",
  phone: "9876543210",
};
const player = { name: "Jane Doe", phone: "9876543210", officialEmail: "jane@acme.com" };

function post(body: unknown, origin: string = ORIGIN): Request {
  return new Request("https://stub.functions/create-badminton-order", {
    method: "POST",
    headers: { origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const RAZORPAY_OK = { match: "api.razorpay.com", json: { id: "order_TESTORDER1" } };
const SUPABASE_OK = { match: "stub.supabase.co", status: 201, text: "" };

Deno.test("online path: charges the server-computed amount and stores the roster", async () => {
  const fetchStub = stubFetch([RAZORPAY_OK, SUPABASE_OK]);
  try {
    const res = await handleRequest(
      post({
        organization,
        entries: [
          { category: "womens_singles", players: [player] },
          { category: "team_event", teamName: "Smashers", players: [] },
        ],
      })
    );

    assertEquals(res.status, 200);
    const json = await res.json();
    assertEquals(json.orderId, "order_TESTORDER1");
    assertEquals(json.currency, "INR");
    assertEquals(json.keyId, "rzp_test_stubkey");
    // 150000 (womens_singles) + 400000 (team_event)
    assertEquals(json.amount, 550000);

    const [rzp] = fetchStub.to("api.razorpay.com");
    const rzpBody = rzp.body as { amount: number; notes: Record<string, string> };
    assertEquals(rzpBody.amount, 550000);
    assertEquals(rzpBody.notes.regType, "badminton");
    assertEquals(rzpBody.notes.company, "Acme Technologies");

    const [row] = fetchStub.to("badminton_registrations");
    const rowBody = row.body as Record<string, unknown>;
    assertEquals(rowBody.order_id, "order_TESTORDER1");
    assertEquals(rowBody.status, "PENDING");
    assertEquals(rowBody.payment_method, "razorpay");
    assertEquals(rowBody.total_paise, 550000);
    assertEquals(rowBody.company, "Acme Technologies");
    assertEquals(rowBody.categories_summary, "Women's Singles, Corporate Team Event (Smashers)");
    assertEquals((rowBody.entries as unknown[]).length, 2);
  } finally {
    fetchStub.restore();
  }
});

// The whole point of computeAmount living on the server.
Deno.test("a client-supplied amount cannot lower the charge", async () => {
  const fetchStub = stubFetch([RAZORPAY_OK, SUPABASE_OK]);
  try {
    const res = await handleRequest(
      post({
        organization,
        entries: [{ category: "team_event", teamName: "Smashers", players: [] }],
        amount: 1,
        total_paise: 1,
      })
    );
    assertEquals(res.status, 200);
    assertEquals((await res.json()).amount, 400000);
    const rzpBody = fetchStub.to("api.razorpay.com")[0].body as { amount: number };
    assertEquals(rzpBody.amount, 400000);
  } finally {
    fetchStub.restore();
  }
});

Deno.test("offline path: reserves a code and never calls Razorpay", async () => {
  const fetchStub = stubFetch([RAZORPAY_OK, SUPABASE_OK]);
  try {
    const res = await handleRequest(
      post({
        organization,
        entries: [{ category: "mens_singles", players: [player] }],
        paymentMode: "offline",
      })
    );

    assertEquals(res.status, 200);
    const json = await res.json();
    assertEquals(json.offline, true);
    assertEquals(json.amount, 150000);
    assert(/^MKB-[A-Z2-9]{6}$/.test(json.referenceCode), `bad code: ${json.referenceCode}`);

    assertEquals(fetchStub.to("api.razorpay.com").length, 0);
    const rowBody = fetchStub.to("badminton_registrations")[0].body as Record<string, unknown>;
    assertEquals(rowBody.payment_method, "offline");
    assertEquals(rowBody.order_id, json.referenceCode);
  } finally {
    fetchStub.restore();
  }
});

Deno.test("validator failures are 400s carrying the message, and touch nothing", async () => {
  const fetchStub = stubFetch([RAZORPAY_OK, SUPABASE_OK]);
  try {
    const res = await handleRequest(
      post({ organization, entries: [{ category: "mens_doubles", players: [player] }] })
    );
    assertEquals(res.status, 400);
    assertEquals((await res.json()).error, "Men's Doubles requires 2 player(s)");
    assertEquals(fetchStub.calls.length, 0);
  } finally {
    fetchStub.restore();
  }
});

// Regression for the inherited-key hole: this used to pass the category check
// and then crash the PLAYER_BOUNDS destructure, i.e. a 500 on crafted input.
Deno.test("a prototype-key category is a 400, not a 500", async () => {
  const fetchStub = stubFetch([RAZORPAY_OK, SUPABASE_OK]);
  try {
    for (const category of ["toString", "constructor"]) {
      const res = await handleRequest(post({ organization, entries: [{ category, players: [] }] }));
      assertEquals(res.status, 400);
      assertEquals((await res.json()).error, `Invalid category: ${category}`);
    }
    assertEquals(fetchStub.calls.length, 0);
  } finally {
    fetchStub.restore();
  }
});

Deno.test("a disallowed origin is refused before any work happens", async () => {
  const fetchStub = stubFetch([RAZORPAY_OK, SUPABASE_OK]);
  try {
    const res = await handleRequest(
      post({ organization, entries: [{ category: "mens_singles", players: [player] }] },
        "https://evilmaharashtrakrida.in")
    );
    assertEquals(res.status, 403);
    assertEquals(fetchStub.calls.length, 0);
  } finally {
    fetchStub.restore();
  }
});

Deno.test("a Razorpay outage is a 500, and no PENDING row is written", async () => {
  const fetchStub = stubFetch([
    { match: "api.razorpay.com", status: 502, text: "upstream boom" },
    SUPABASE_OK,
  ]);
  try {
    const res = await handleRequest(
      post({ organization, entries: [{ category: "mens_singles", players: [player] }] })
    );
    assertEquals(res.status, 500);
    assertEquals(fetchStub.to("badminton_registrations").length, 0);
  } finally {
    fetchStub.restore();
  }
});

// The insert is deliberately best-effort: the webhook has an upsert fallback,
// so a database hiccup must not cost the user their payment.
Deno.test("a failed PENDING insert still returns the order", async () => {
  const fetchStub = stubFetch([
    RAZORPAY_OK,
    { match: "stub.supabase.co", status: 500, text: "db down" },
  ]);
  try {
    const res = await handleRequest(
      post({ organization, entries: [{ category: "mens_singles", players: [player] }] })
    );
    assertEquals(res.status, 200);
    assertEquals((await res.json()).orderId, "order_TESTORDER1");
  } finally {
    fetchStub.restore();
  }
});
