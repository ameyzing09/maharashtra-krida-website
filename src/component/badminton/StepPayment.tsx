import { useEffect, useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { useBadmintonRegistration } from "../../hook/useBadmintonRegistration";
import { createBadmintonOrder, createOfflineRegistration } from "../../services/paymentService";
import { getPaymentSettings } from "../../services/paymentSettingsService";
import { useRazorpayScript, RazorpaySuccess } from "../../hook/useRazorpayScript";
import { CATEGORY_BY_CODE, formatINR, TOURNAMENT } from "../../constants/badminton";
import { clearDraft } from "../../utils/badmintonDraft";
import useToast from "../../hook/useToast";
import Toast from "../common/Toast";

type Method = "online" | "offline";

export default function StepPayment() {
  const { state, dispatch } = useBadmintonRegistration();
  const { toast, showToast } = useToast();
  const ready = useRazorpayScript();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<Method>("online");
  const [onlineEnabled, setOnlineEnabled] = useState(true);
  const [offlineEnabled, setOfflineEnabled] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const org = state.organization;
  const totalPaise = state.entries.reduce((sum, e) => sum + CATEGORY_BY_CODE[e.category].fee, 0);

  useEffect(() => {
    getPaymentSettings()
      .then((s) => {
        setOnlineEnabled(s.online_enabled !== false);
        setOfflineEnabled(!!s.offline_enabled);
        // Don't strand someone on a method that's been switched off.
        if (s.online_enabled === false && s.offline_enabled) setMethod("offline");
      })
      .catch(() => {
        // Can't read the switches: keep the pre-existing posture rather than
        // blocking registration. The Edge Function is the real gate and will
        // refuse a suspended method regardless of what the form shows.
        setOnlineEnabled(true);
        setOfflineEnabled(false);
      })
      .finally(() => setSettingsLoaded(true));
  }, []);

  const nothingAvailable = settingsLoaded && !onlineEnabled && !offlineEnabled;

  const pay = async () => {
    if (!ready || loading || !onlineEnabled) return;
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
        theme: { color: "#0F172A" },
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

  const reserve = async () => {
    if (loading) return;
    if (!org || state.entries.length === 0) {
      showToast("Registration details are incomplete.", "error");
      return;
    }
    setLoading(true);
    try {
      const { referenceCode } = await createOfflineRegistration({
        organization: org,
        entries: state.entries,
      });
      clearDraft();
      window.location.href = `/registration/status?code=${encodeURIComponent(referenceCode)}&new=1`;
    } catch (err) {
      console.error("Failed to reserve registration:", err);
      showToast("Could not reserve registration. Please try again.", "error");
      setLoading(false);
    }
  };

  const optionCls = (active: boolean) =>
    [
      "flex-1 text-left rounded-xl border p-4 transition-all",
      active
        ? "border-slate-900 ring-2 ring-slate-900/20 bg-slate-100 dark:border-slate-100 dark:ring-slate-100/20 dark:bg-slate-800"
        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
    ].join(" ");

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <p className="text-sm text-slate-600 dark:text-slate-400">
        Total payable: <span className="font-semibold text-slate-900 dark:text-slate-100">{formatINR(totalPaise)}</span>
      </p>

      {nothingAvailable && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            Registration is temporarily paused
          </p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
            We can't accept payments right now. Your entries are saved on this device — please try
            again shortly, or contact {TOURNAMENT.contactName} on {TOURNAMENT.contactPhone}.
          </p>
        </div>
      )}

      {onlineEnabled && offlineEnabled && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={() => setMethod("online")} className={optionCls(method === "online")}>
            <p className="font-semibold text-slate-900 dark:text-slate-100">Pay now online</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Card, UPI, netbanking or wallet via secure Razorpay checkout. Confirmed instantly.
            </p>
          </button>
          <button type="button" onClick={() => setMethod("offline")} className={optionCls(method === "offline")}>
            <p className="font-semibold text-slate-900 dark:text-slate-100">Company will pay separately</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Reserve now and pay by bank transfer / company account. You'll get a reference code; we confirm once
              payment is received.
            </p>
          </button>
        </div>
      )}

      {onlineEnabled && !offlineEnabled && (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          You'll be redirected to the secure Razorpay checkout to complete the payment.
        </p>
      )}

      {!onlineEnabled && offlineEnabled && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <p className="font-semibold text-slate-900 dark:text-slate-100">Company will pay separately</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Online card payment is unavailable at the moment, so reserve your place now and settle by
            bank transfer. You'll get a reference code immediately and we'll confirm once payment is
            received.
          </p>
        </div>
      )}

      {nothingAvailable ? null : method === "online" ? (
        <button
          onClick={pay}
          disabled={!ready || loading || !onlineEnabled}
          className="glass-button-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <TailSpin color="#ffffff" height={18} width={18} />}
          {loading ? "Processing..." : `Pay ${formatINR(totalPaise)}`}
        </button>
      ) : (
        <button
          onClick={reserve}
          disabled={loading}
          className="glass-button-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <TailSpin color="#ffffff" height={18} width={18} />}
          {loading ? "Reserving..." : "Reserve Registration"}
        </button>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={() => dispatch({ type: "BACK" })}
          className="rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium py-2 px-4"
        >
          Back
        </button>
        <a href="/" onClick={clearDraft} className="text-sm text-slate-500 dark:text-slate-400 underline">
          Start over
        </a>
      </div>
    </div>
  );
}
