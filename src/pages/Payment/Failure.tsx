import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type FailData = {
  error?: {
    code?: string;
    description?: string;
    step?: string;
    reason?: string;
    metadata?: { payment_id?: string; order_id?: string };
  };
  ts?: number;
};

export default function Failure() {
  const [data, setData] = useState<FailData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("rzp_failed");
    if (raw) {
      try {
        setData(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const paymentId = data?.error?.metadata?.payment_id || "—";
  const orderId = data?.error?.metadata?.order_id || "—";
  const msg = data?.error?.description || data?.error?.reason || "Payment was not completed.";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 sm:mb-5">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-1">Payment Failed</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-5 text-sm sm:text-base">{msg}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 p-4">
          <div className="flex justify-between flex-wrap text-sm py-1.5">
            <span className="text-slate-500 dark:text-slate-400">Payment ID</span>
            <span className="font-medium text-slate-900 dark:text-slate-100 break-all">{paymentId}</span>
          </div>
          <div className="flex justify-between flex-wrap text-sm py-1.5">
            <span className="text-slate-500 dark:text-slate-400">Order ID</span>
            <span className="font-medium text-slate-900 dark:text-slate-100 break-all">{orderId}</span>
          </div>
          <div className="flex justify-between flex-wrap text-sm py-1.5">
            <span className="text-slate-500 dark:text-slate-400">Code</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{data?.error?.code || "—"}</span>
          </div>
          <div className="flex justify-between flex-wrap text-sm py-1.5">
            <span className="text-slate-500 dark:text-slate-400">Step</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{data?.error?.step || "—"}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-center">
          <Link
            to="/"
            className="w-full sm:w-auto rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium px-4 py-2.5 text-center"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 font-medium px-4 py-2.5"
          >
            Try Again
          </button>
        </div>

        <p className="text-[11px] sm:text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
          If any amount was debited, it will auto-refund or reflect after confirmation.
        </p>
      </div>
    </div>
  );
}

