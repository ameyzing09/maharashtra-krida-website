import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import { supabase } from "../../services/supabaseClient";

type SuccessData = {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  amount?: number; // paise
  currency?: string;
  name?: string;
  email?: string;
  phone?: string; // 10-digit
  ts?: number;
};

const inr = (p?: number) =>
  typeof p === "number" ? (p / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" }) : "";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 10; // ~30s

function InvoiceDownload({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<"polling" | "ready" | "timeout">("polling");
  const [url, setUrl] = useState<string | null>(null);
  const attempts = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function poll() {
      attempts.current += 1;
      try {
        const { data, error } = await supabase.functions.invoke("get-invoice", {
          body: { order_id: orderId },
        });
        if (cancelled) return;
        if (!error && data?.ready && data.url) {
          setUrl(data.url);
          setStatus("ready");
          return;
        }
      } catch {
        /* keep polling — a transient failure shouldn't stop retries */
      }
      if (cancelled) return;
      if (attempts.current >= MAX_POLLS) {
        setStatus("timeout");
        return;
      }
      timer = window.setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [orderId]);

  if (status === "ready" && url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto rounded-full border border-black/10 bg-brand-lime hover:bg-brand-limeDark text-brand-charcoal font-medium px-4 py-2.5 text-center inline-flex items-center justify-center gap-2"
      >
        Download Invoice
      </a>
    );
  }

  if (status === "timeout") {
    return (
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
        Your invoice is taking longer than expected. Refresh this page in a bit, or contact us and we'll send it over.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
      <TailSpin color="#84cc16" height={16} width={16} />
      Preparing your invoice…
    </div>
  );
}

export default function Success() {
  const [data, setData] = useState<SuccessData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("rzp_success");
    if (raw) {
      try {
        setData(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, []);

  if (!data?.razorpay_payment_id) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate shadow-soft p-6 text-center">
          <h2 className="text-lg sm:text-xl font-semibold text-brand-charcoal dark:text-white mb-1">No payment found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-5 text-sm">If you just paid, refresh this page.</p>
          <Link to="/" className="inline-flex justify-center rounded-full border border-black/10 bg-brand-lime hover:bg-brand-limeDark text-brand-charcoal px-4 py-2 font-semibold">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="relative w-full max-w-lg rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-slate shadow-lift p-6 sm:p-8 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            background:
              "radial-gradient(500px circle at 0% 0%, #d9f99d 0%, transparent 45%), radial-gradient(700px circle at 100% 100%, #bef264 0%, transparent 55%)",
          }}
        />
        <div className="relative flex flex-col">
          <div className="flex justify-center mb-5 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-lime flex items-center justify-center shadow-lg">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col items-center text-center mb-5">
            <h1 className="text-xl sm:text-2xl font-semibold text-brand-charcoal dark:text-white">Payment Successful</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">
              Thanks {data.name ? <span className="font-medium">{data.name}</span> : "there"}! Your registration is confirmed.
            </p>
          </div>

          <div className="rounded-xl bg-black/5 dark:bg-white/10 p-4">
            <div className="flex justify-between flex-wrap text-sm py-1.5">
              <span className="text-gray-500 dark:text-gray-300">Payment ID</span>
              <span className="font-medium text-brand-charcoal dark:text-white break-all">{data.razorpay_payment_id}</span>
            </div>
            <div className="flex justify-between flex-wrap text-sm py-1.5">
              <span className="text-gray-500 dark:text-gray-300">Order ID</span>
              <span className="font-medium text-brand-charcoal dark:text-white break-all">{data.razorpay_order_id}</span>
            </div>
            <div className="flex justify-between flex-wrap text-sm py-1.5">
              <span className="text-gray-500 dark:text-gray-300">Amount</span>
              <span className="font-semibold text-brand-charcoal dark:text-white">{inr(data.amount)}</span>
            </div>
            <div className="flex justify-between flex-wrap text-sm py-1.5">
              <span className="text-gray-500 dark:text-gray-300">Email</span>
              <span className="font-medium text-brand-charcoal dark:text-white break-all">{data.email || "-"}</span>
            </div>
            <div className="flex justify-between flex-wrap text-sm py-1.5">
              <span className="text-gray-500 dark:text-gray-300">Phone</span>
              <span className="font-medium text-brand-charcoal dark:text-white">{data.phone ? `+91 ${data.phone}` : "-"}</span>
            </div>
          </div>

          {data.razorpay_order_id && (
            <div className="mt-4 flex justify-center">
              <InvoiceDownload orderId={data.razorpay_order_id} />
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-center">
            <button
              onClick={() => navigator.clipboard?.writeText(data.razorpay_payment_id || "")}
              className="w-full sm:w-auto rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-brand-charcoal dark:text-gray-100 font-medium px-4 py-2.5"
            >
              Copy Payment ID
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto rounded-full border border-black/10 bg-brand-lime hover:bg-brand-limeDark text-brand-charcoal font-medium px-4 py-2.5 text-center"
            >
              Go Home
            </Link>
          </div>

          <p className="text-[11px] sm:text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
            Please save your Payment ID above — it's your confirmation reference for this registration.
          </p>
        </div>
      </div>
    </div>
  );
}
