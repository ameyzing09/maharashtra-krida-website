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

export async function wrapService<T>(promise: Promise<T>, context: string): Promise<T> {
  try {
    return await promise;
  } catch (e) {
    console.error(context, e);
    throw toServiceError(e, context);
  }
}
