/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useRegistrationContext } from "../../hook/useRegistration";
import { createOrder } from "../../services/paymentService";

declare global { interface Window { Razorpay: any; } }

function useRazorpayScript() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const id = "rzp-checkout-js"
    if (document.getElementById(id)) {
      setReady(true)
      return
    }
    const s = document.createElement("script")
    s.id = id
    s.src = "https://checkout.razorpay.com/v1/checkout.js"
    s.onload = () => setReady(true)
    s.onerror = () => console.error("Razorpay script failed to load")
    document.body.appendChild(s)
  }, [])
  return ready
}

const StepPayment = () => {
  const { state, dispatch } = useRegistrationContext()
  const ready = useRazorpayScript()
  const [loading, setLoading] = useState(false)
  const amountDisplay = state.priceBreakup.registrationFee
  const pay = async () => {
    if (!ready) return
    setLoading(true)

    const { orderId, amount, currency, keyId } = await createOrder(
      amountDisplay,
      "event_code",
      { email: state.attendee?.companyEmail }
    )
    dispatch({ type: "SET_ORDER", payload: orderId });

    const rzp = new window.Razorpay({
      key: keyId,
      amount, currency,
      name: "Event Registration",
      description: "Register for the event",
      order_id: orderId,
      prefill: {
        name: state.attendee?.name,
        email: state.attendee?.companyEmail,
        contact: state.attendee?.phone,
      },
      notes: {
        name: state.attendee?.name,
        email: state.attendee?.companyEmail,
        contact: state.attendee?.phone,
        other: state.attendee?.other
      },
      theme: { color: "#84cc16" }, // lime-400
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      handler: function (_resp: any) {
        // Client success callback (optimistic). Real source of truth = webhook.
        window.location.href = "/success";
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
        },
      },
    });

    rzp.open();
  }
  return (
    <div className="text-center space-y-4">
      <p className="text-gray-700">
        You’ll be redirected to the secure Razorpay Checkout to complete the payment.
      </p>
      <button
        onClick={pay}
        disabled={!ready || loading}
        className="bg-lime-400 hover:bg-lime-600 disabled:opacity-50 text-white font-bold py-2 px-6 rounded"
      >
        {loading ? "Processing..." : `Pay ₹${amountDisplay}`}
      </button>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => dispatch({ type: "BACK" })}
          className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded"
        >
          Back
        </button>
        <a href="/" className="text-sm text-gray-500 underline">Start over</a>
      </div>
    </div>
  );
}

export default StepPayment