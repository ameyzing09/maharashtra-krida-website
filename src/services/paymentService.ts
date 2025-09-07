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
    // eslint-disable-next-line no-console
    console.error('Failed to create order', e);
    throw new Error('Failed to create order');
  }
}
