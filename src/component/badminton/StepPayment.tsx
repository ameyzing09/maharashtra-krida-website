import { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { useBadmintonRegistration } from "../../hook/useBadmintonRegistration";
import { createBadmintonOrder } from "../../services/paymentService";
import { useRazorpayScript, RazorpaySuccess } from "../../hook/useRazorpayScript";
import { CATEGORY_BY_CODE, formatINR, TOURNAMENT } from "../../constants/badminton";
import { clearDraft } from "../../utils/badmintonDraft";
import useToast from "../../hook/useToast";
import Toast from "../common/Toast";

export default function StepPayment() {
  const { state, dispatch } = useBadmintonRegistration();
  const { toast, showToast } = useToast();
  const ready = useRazorpayScript();
  const [loading, setLoading] = useState(false);

  const org = state.organization;
  const totalPaise = state.entries.reduce((sum, e) => sum + CATEGORY_BY_CODE[e.category].fee, 0);

  const pay = async () => {
    if (!ready || loading) return;
    if (!org || state.entries.length === 0) {
      showToast("Registration details are incomplete.", "error");
      return;
    }
    setLoading(true);
    try {
      const contact = String(org.phone).replace(/\D/g, "").slice(-10);
      if (contact.length !== 10) {
        showToast("Invalid mobile number", "error");
        setLoading(false);
        return;
      }

      const { orderId, amount, currency, keyId } = await createBadmintonOrder({
        organization: org,
        entries: state.entries,
      });
      dispatch({ type: "SET_ORDER", payload: orderId });

      const payloadForSuccess = {
        amount,
        currency,
        name: org.companyName,
        email: org.officialEmail,
        phone: contact,
      };

      // Fallback in case neither the failed nor dismiss handler fires.
      const safety = window.setTimeout(() => {
        setLoading(false);
        showToast("Payment window did not respond. Please try again.", "error");
      }, 20000);

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: TOURNAMENT.title,
        description: "Corporate Badminton Bash 2026 — Registration",
        order_id: orderId,
        prefill: {
          name: org.contactPersonName,
          email: org.officialEmail,
          contact,
        },
        notes: {
          regType: "badminton",
          company: org.companyName,
          email: org.officialEmail,
        },
        theme: { color: "#84cc16" },
        handler: function (resp: RazorpaySuccess) {
          sessionStorage.setItem("rzp_success", JSON.stringify({ ...resp, ...payloadForSuccess }));
          clearDraft();
          window.location.href = "/payment/success";
        },
        remember_customer: false,
        modal: {
          ondismiss: function () {
            setLoading(false);
            window.clearTimeout(safety);
          },
        },
      });

      rzp.on("payment.failed", function (resp: unknown) {
        setLoading(false);
        window.clearTimeout(safety);
        const base = typeof resp === "object" && resp !== null ? (resp as Record<string, unknown>) : {};
        sessionStorage.setItem("rzp_failed", JSON.stringify({ ...base, ts: Date.now() }));
        window.location.href = "/payment/failure";
      });

      rzp.on("payment.error", function (resp: unknown) {
        setLoading(false);
        window.clearTimeout(safety);
        const base = typeof resp === "object" && resp !== null ? (resp as Record<string, unknown>) : {};
        sessionStorage.setItem("rzp_failed", JSON.stringify({ ...base, ts: Date.now() }));
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
        className="glass-button-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && <TailSpin color="#ffffff" height={18} width={18} />}
        {loading ? "Processing..." : `Pay ${formatINR(totalPaise)}`}
      </button>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => dispatch({ type: "BACK" })}
          className="rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-brand-charcoal dark:text-gray-100 font-medium py-2 px-4"
        >
          Back
        </button>
        <a
          href="/"
          onClick={clearDraft}
          className="text-sm text-gray-500 dark:text-gray-400 underline"
        >
          Start over
        </a>
      </div>
    </div>
  );
}
