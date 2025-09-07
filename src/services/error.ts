import type { FirebaseError } from "firebase/app";

export function toServiceError(e: unknown, context: string): Error {
  // Preserve existing Error with context prefix
  if (e instanceof Error) {
    e.message = `${context}: ${e.message}`;
    return e;
  }
  const fe = e as Partial<FirebaseError> & { code?: string; message?: string };
  const code = fe?.code ? ` (${fe.code})` : "";
  const msg = fe?.message ?? String(e);
  return new Error(`${context}${code}: ${msg}`);
}

export async function wrapService<T>(promise: Promise<T>, context: string): Promise<T> {
  try {
    return await promise;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(context, e);
    throw toServiceError(e, context);
  }
}

