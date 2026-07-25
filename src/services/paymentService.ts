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
