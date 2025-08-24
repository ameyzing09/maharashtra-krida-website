export async function createOrder(amount: number, eventCode: string, customer: { email?: string, contact?: string }) {
  const res = await fetch("/.netlify/functions/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventCode,
      qty: 1,
      customer
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  // return res.json() as Promise<{ orderId: string; amount: number; currency: string; keyId: string }>;
  const data = await res.json();
  console.log('payment response -> ', data)
  return {
    orderId: data.orderId,
    amount: data.amount,
    currency: data.currency,
    keyId: data.keyId,
  };
}
