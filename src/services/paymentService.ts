import { BadmintonOrderPayload } from "../types/badminton";

export async function createOrder(amount: number, eventCode: string, customer: { email?: string; contact?: string }) {
  try {
    const res = await fetch("/.netlify/functions/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventCode, qty: 1, customer, amount }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return { orderId: data.orderId, amount: data.amount, currency: data.currency, keyId: data.keyId };
  } catch (e) {
    console.error('Failed to create order', e);
    throw new Error('Failed to create order');
  }
}

/**
 * Creates a Razorpay order for a badminton registration. The server recomputes
 * the total from the entries (client amount is never trusted) and persists the
 * full roster as a PENDING row before returning the order.
 */
export async function createBadmintonOrder(payload: BadmintonOrderPayload) {
  try {
    const res = await fetch("/.netlify/functions/create-badminton-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return { orderId: data.orderId, amount: data.amount, currency: data.currency, keyId: data.keyId };
  } catch (e) {
    console.error("Failed to create badminton order", e);
    throw new Error("Failed to create order");
  }
}
