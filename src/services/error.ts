export function toServiceError(e: unknown, context: string): Error {
  // Preserve existing Error with context prefix
  if (e instanceof Error) {
    e.message = `${context}: ${e.message}`;
    return e;
  }
  // Supabase PostgrestError and similar plain objects carry code/message.
  const pe = e as { code?: string; message?: string };
  const code = pe?.code ? ` (${pe.code})` : "";
  const msg = pe?.message ?? String(e);
  return new Error(`${context}${code}: ${msg}`);
}

// Extracts a human-readable message from a caught value for display in a
// toast. Falls through plain-object/string shapes since not every rejection
// is an Error instance (e.g. a raw string throw or a Supabase-like object).
export function errorMessage(e: unknown, fallback = "Something went wrong."): string {
  if (e instanceof Error && e.message) return e.message;
  const pe = e as { message?: string } | undefined;
  if (pe?.message) return String(pe.message);
  if (typeof e === "string" && e) return e;
  return fallback;
}
