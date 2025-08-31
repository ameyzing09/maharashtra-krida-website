import { useEffect, useState } from "react";
import { useRegistrationContext } from "../../hook/useRegistration";
import { createOrder } from "../../services/paymentService";

type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
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

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (resp: unknown) => void) => void;
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function useRazorpayScript() {
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

const StepPayment = () => {
  const { state, dispatch } = useRegistrationContext();

  const ready = useRazorpayScript();
  const [loading, setLoading] = useState(false);
  const amountDisplay = state.priceBreakup.registrationFee / 100;
  const pay = async () => {
    if (!ready) return;
    setLoading(true);

    const { orderId, amount, currency, keyId } = await createOrder(
      amountDisplay,
      "registration_price",
      { email: state.attendee?.companyEmail, contact: state.attendee?.phone }
    );
    dispatch({ type: "SET_ORDER", payload: orderId });

    const contact = String(state.attendee?.phone ?? "")
      .replace(/\D/g, "")
      .slice(-10);

    if (contact.length !== 10) {
      alert("Invalid mobile number");
      return;
    }

    const payloadForSuccess = {
      amount,
      currency,
      name: state.attendee?.name || "",
      email: state.attendee?.companyEmail || "",
      phone: contact,
    };

    const rzp = new window.Razorpay({
      key: keyId,
      amount,
      currency,
      name: "Event Registration",
      description: "Register for the event",
      order_id: orderId,
      prefill: {
        name: payloadForSuccess.name,
        email: payloadForSuccess.email,
        contact: payloadForSuccess.phone,
      },
      notes: {
        eventCode: state.eventId,
        ...payloadForSuccess,
      },
      theme: { color: "#84cc16" },
      handler: function (_resp: RazorpaySuccess) {
        sessionStorage.setItem("rzp_success", JSON.stringify({ ..._resp, ...payloadForSuccess }));
        window.location.href = "/payment/success";
      },
      remember_customer: false,
      modal: {
        ondismiss: function () {
          setLoading(false);
        },
      },
    });
    rzp.on("payment.failed", function (resp: unknown) {
      const base = typeof resp === "object" && resp !== null ? (resp as Record<string, unknown>) : {};
      const payload = { ...base, ts: Date.now() };
      sessionStorage.setItem("rzp_failed", JSON.stringify(payload));
      window.location.href = "/payment/failure";
    });
    rzp.open();
  };
  return (
    <div className="text-center space-y-4">
      <p className="text-gray-700 dark:text-gray-300">
        You'll be redirected to the secure Razorpay Checkout to complete the payment.
      </p>
      <button
        onClick={pay}
        disabled={!ready || loading}
        className="rounded-full bg-brand-lime hover:bg-brand-limeDark disabled:opacity-50 text-white font-semibold py-2.5 px-6"
      >
        {loading
          ? "Processing..."
          : `Pay ${amountDisplay.toLocaleString("en-IN", { style: "currency", currency: "INR" })}`}
      </button>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => dispatch({ type: "BACK" })}
          className="rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-brand-charcoal dark:text-gray-100 font-medium py-2 px-4"
        >
          Back
        </button>
        <a href="/" className="text-sm text-gray-500 dark:text-gray-400 underline">Start over</a>
      </div>
    </div>
  );
};

export default StepPayment;
