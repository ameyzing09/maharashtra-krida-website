import { useEffect, useState } from "react";

export type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, unknown>;
  theme?: { color?: string };
  handler: (resp: RazorpaySuccess) => void;
  remember_customer?: boolean;
  modal?: { ondismiss?: () => void };
};

export type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (resp: unknown) => void) => void;
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

/** Loads the Razorpay Checkout script once and reports when it is ready. */
export function useRazorpayScript() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = "rzp-checkout-js";
    if (document.getElementById(id)) {
      setReady(true);
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => setReady(true);
    s.onerror = () => console.error("Razorpay script failed to load");
    document.body.appendChild(s);
  }, []);
  return ready;
}
