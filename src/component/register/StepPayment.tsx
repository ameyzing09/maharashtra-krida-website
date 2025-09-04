import { useEffect, useState } from "react";
import { useRegistrationContext } from "../../hook/useRegistration";
import { createOrder } from "../../services/paymentService";
import useToast from "../../hook/useToast";
import Toast from "../common/Toast";

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
  on: (event: string, handler: (resp: unknown) => void) => void;
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
  const { toast, showToast } = useToast();

  const ready = useRazorpayScript();
  const [loading, setLoading] = useState(false);
  const amountDisplay = state.priceBreakup.registrationFee / 100;
  const pay = async () => {
    if (!ready || loading) return;
    setLoading(true);
    try {
      // Validate contact BEFORE creating order
      const contact = String(state.attendee?.phone ?? "")
        .replace(/\D/g, "")
        .slice(-10);
      if (contact.length !== 10) {
        showToast("Invalid mobile number", "error");
        setLoading(false);
        return;
      }

      const { orderId, amount, currency, keyId } = await createOrder(
        amountDisplay,
        "registration_price",
        { email: state.attendee?.companyEmail, contact: state.attendee?.phone }
      );
      dispatch({ type: "SET_ORDER", payload: orderId });

      const payloadForSuccess = {
        amount,
        currency,
        name: state.attendee?.name || "",
        email: state.attendee?.companyEmail || "",
        phone: contact,
      };

      let safety: number | undefined;
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
          // No need to reset loading as we navigate away
          window.location.href = "/payment/success";
        },
        remember_customer: false,
        modal: {
          ondismiss: function () {
            // User closed the modal without success
            setLoading(false);
            if (safety) window.clearTimeout(safety);
          },
        },
      });

      // safety timer in case neither failed nor dismiss fires (edge errors)
      safety = window.setTimeout(() => {
        setLoading(false);
        showToast("Payment window did not respond. Please try again.", "error");
      }, 20000);

      rzp.on("payment.failed", function (resp: unknown) {
        // Ensure button returns to normal state on failure
        setLoading(false);
        if (safety !== undefined) window.clearTimeout(safety);
        const base = typeof resp === "object" && resp !== null ? (resp as Record<string, unknown>) : {};
        const payload = { ...base, ts: Date.now() };
        sessionStorage.setItem("rzp_failed", JSON.stringify(payload));
        window.location.href = "/payment/failure";
      });

      // try to catch configuration/initialization errors too
      rzp.on("payment.error", function (resp: unknown) {
        setLoading(false);
        if (safety !== undefined) window.clearTimeout(safety);
        const base = typeof resp === "object" && resp !== null ? (resp as Record<string, unknown>) : {};
        const payload = { ...base, ts: Date.now() };
        sessionStorage.setItem("rzp_failed", JSON.stringify(payload));
        showToast("Payment could not be initialized.", "error");
      });

      rzp.open();
    } catch (err) {
      console.error("Failed to initialize payment:", err);
      showToast("Could not start payment. Please try again.", "error");
      setLoading(false);
    }
  };
  return (
    <div className="text-center space-y-4">
      {toast && <Toast message={toast.message} type={toast.type} />}
      <p className="text-gray-700 dark:text-gray-300">
        You'll be redirected to the secure Razorpay Checkout to complete the payment.
      </p>
      <button
        onClick={pay}
        disabled={!ready || loading}
        className="rounded-full border border-black/10 bg-brand-lime hover:bg-brand-limeDark disabled:bg-brand-lime/50 disabled:text-brand-charcoal/70 disabled:cursor-not-allowed text-brand-charcoal font-semibold py-2.5 px-6 shadow-soft"
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
