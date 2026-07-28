// Test-only helpers for driving the Edge Function handlers without a network
// or a database. Imported solely by *.test.ts files — never by a deployed
// function, so it is not bundled at deploy time.

export type RecordedCall = {
  url: string;
  method: string;
  headers: Record<string, string>;
  /** Parsed JSON body, or undefined when there was no body. */
  body?: unknown;
};

export type StubRoute = {
  /** Matched against the request URL with `includes`. */
  match: string;
  status?: number;
  /** JSON body to return. Arrays are useful for PostgREST representations. */
  json?: unknown;
  text?: string;
};

export type FetchStub = {
  calls: RecordedCall[];
  restore: () => void;
  /** Calls whose URL contains the given fragment. */
  to: (fragment: string) => RecordedCall[];
};

/**
 * Replaces globalThis.fetch with a recorder that answers from `routes`.
 * The first route whose `match` appears in the URL wins; an unmatched request
 * throws, so a handler reaching an unexpected endpoint fails loudly rather
 * than silently hitting the real internet.
 */
export function stubFetch(routes: StubRoute[]): FetchStub {
  const original = globalThis.fetch;
  const calls: RecordedCall[] = [];

  globalThis.fetch = ((input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const rawBody = typeof init?.body === "string" ? init.body : undefined;

    const headers: Record<string, string> = {};
    const h = init?.headers;
    if (h && typeof h === "object" && !Array.isArray(h)) {
      for (const [k, v] of Object.entries(h as Record<string, string>)) headers[k.toLowerCase()] = v;
    }

    calls.push({
      url,
      method: init?.method ?? "GET",
      headers,
      body: rawBody === undefined ? undefined : JSON.parse(rawBody),
    });

    const route = routes.find((r) => url.includes(r.match));
    if (!route) throw new Error(`stubFetch: no route matches ${url}`);

    const status = route.status ?? 200;
    const payload = route.text ?? JSON.stringify(route.json ?? {});
    return Promise.resolve(
      new Response(payload, { status, headers: { "Content-Type": "application/json" } })
    );
  }) as typeof globalThis.fetch;

  return {
    calls,
    restore: () => {
      globalThis.fetch = original;
    },
    to: (fragment: string) => calls.filter((c) => c.url.includes(fragment)),
  };
}

/** Env the functions expect. Set once per test file; values are never real. */
export function stubEnv() {
  Deno.env.set("SUPABASE_URL", "https://stub.supabase.co");
  Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "stub-service-role-key");
  Deno.env.set("RAZORPAY_KEY_ID", "rzp_test_stubkey");
  Deno.env.set("RAZORPAY_KEY_SECRET", "stub-secret");
  Deno.env.set("RZP_WEBHOOK_SECRET", "stub-webhook-secret");
}
