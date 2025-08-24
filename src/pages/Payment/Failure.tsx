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
    if (raw) { try { setData(JSON.parse(raw)); } catch { /* ignore */ } }
  }, []);

  const paymentId = data?.error?.metadata?.payment_id || "—";
  const orderId   = data?.error?.metadata?.order_id   || "—";
  const msg       = data?.error?.description || data?.error?.reason || "Payment was not completed.";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          {/* badge */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 sm:mb-5">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold mb-1">Payment Failed</h1>
          <p className="text-gray-600 mb-5 text-sm sm:text-base">{msg}</p>
        </div>

        {/* details (flex rows) */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between flex-wrap text-sm py-1.5">
            <span className="text-gray-500">Payment ID</span>
            <span className="font-medium break-all">{paymentId}</span>
          </div>
          <div className="flex justify-between flex-wrap text-sm py-1.5">
            <span className="text-gray-500">Order ID</span>
            <span className="font-medium break-all">{orderId}</span>
          </div>
          <div className="flex justify-between flex-wrap text-sm py-1.5">
            <span className="text-gray-500">Code</span>
            <span className="font-medium">{data?.error?.code || "—"}</span>
          </div>
          <div className="flex justify-between flex-wrap text-sm py-1.5">
            <span className="text-gray-500">Step</span>
            <span className="font-medium">{data?.error?.step || "—"}</span>
          </div>
        </div>

        {/* actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-center">
          <Link
            to="/"
            className="w-full sm:w-auto border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2.5 rounded text-center"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto bg-lime-500 hover:bg-lime-600 text-white font-medium px-4 py-2.5 rounded"
          >
            Try Again
          </button>
        </div>

        <p className="text-[11px] sm:text-xs text-center text-gray-500 mt-4">
          If any amount was debited, it will auto-refund or reflect after confirmation.
        </p>
      </div>
    </div>
  );
}
