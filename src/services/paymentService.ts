import { supabase } from "./supabaseClient";
import { BadmintonOrderPayload } from "../types/badminton";

/**
 * Creates a Razorpay order for a badminton registration via the Supabase
 * Edge Function. The server recomputes the total from the entries (client
 * amount is never trusted) and persists the full roster as a PENDING row
 * before returning the order.
 */
export async function createBadmintonOrder(payload: BadmintonOrderPayload) {
  const { data, error } = await supabase.functions.invoke("create-badminton-order", {
    body: payload,
  });
  if (error) {
    console.error("Failed to create badminton order", error);
    throw new Error("Failed to create order");
  }
  return { orderId: data.orderId, amount: data.amount, currency: data.currency, keyId: data.keyId };
}

/**
 * Reserves an offline ("company will pay separately") registration — no
 * Razorpay. The server validates + computes the amount, writes a PENDING row,
 * and returns a unique reference code the corporate quotes when paying.
 */
export async function createOfflineRegistration(payload: BadmintonOrderPayload) {
  const { data, error } = await supabase.functions.invoke("create-badminton-order", {
    body: { ...payload, paymentMode: "offline" },
  });
  if (error) {
    console.error("Failed to reserve registration", error);
    throw new Error("Failed to reserve registration");
  }
  return { referenceCode: data.referenceCode as string, amount: data.amount as number };
}

export type RegistrationStatus = {
  found: boolean;
  status?: "PENDING" | "PAID" | "CANCELLED";
  company?: string;
  totalPaise?: number;
  categoriesSummary?: string;
  paymentMethod?: "razorpay" | "offline";
  paidAt?: string | null;
  invoiceReady?: boolean;
};

/** Public status lookup by reference code (offline confirmation / status page). */
export async function getRegistrationStatus(code: string): Promise<RegistrationStatus> {
  const { data, error } = await supabase.functions.invoke("get-registration-status", {
    body: { code },
  });
  if (error) {
    console.error("Failed to fetch registration status", error);
    return { found: false };
  }
  return data as RegistrationStatus;
}
