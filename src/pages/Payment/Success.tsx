import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type SuccessData = {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  amount?: number;   // paise
  currency?: string;
  name?: string;
  email?: string;
  phone?: string;    // 10-digit
  ts?: number;
};

const inr = (p?: number) =>
  typeof p === "number" ? (p / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" }) : "";

export default function Success() {
  const [data, setData] = useState<SuccessData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("rzp_success");
    if (raw) { try { setData(JSON.parse(raw)); } catch { /* ignore */ } }
  }, []);

  if (!data?.razorpay_payment_id) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 text-center">
          <h2 className="text-lg sm:text-xl font-semibold mb-1">No payment found</h2>
          <p className="text-gray-600 mb-5 text-sm">If you just paid, refresh this page.</p>
          <Link to="/" className="inline-flex justify-center bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 sm:p-8 overflow-hidden">
        {/* soft background flair */}
        <div className="pointer-events-none absolute inset-0 opacity-40"
             style={{ background: "radial-gradient(500px circle at 0% 0%, #d9f99d 0%, transparent 45%), radial-gradient(700px circle at 100% 100%, #bef264 0%, transparent 55%)" }} />
        <div className="relative flex flex-col">
          {/* badge */}
          <div className="flex justify-center mb-5 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-lime-500 flex items-center justify-center shadow-lg">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <div className="flex flex-col items-center text-center mb-5">
            <h1 className="text-xl sm:text-2xl font-semibold">Payment Successful</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Thanks {data.name ? <span className="font-medium">{data.name}</span> : "there"}! Your registration is confirmed.
            </p>
          </div>

          {/* details (flex rows) */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between flex-wrap text-sm py-1.5">
              <span className="text-gray-500">Payment ID</span>
              <span className="font-medium break-all">{data.razorpay_payment_id}</span>
            </div>
            <div className="flex justify-between flex-wrap text-sm py-1.5">
              <span className="text-gray-500">Order ID</span>
              <span className="font-medium break-all">{data.razorpay_order_id}</span>
            </div>
            <div className="flex justify-between flex-wrap text-sm py-1.5">
              <span className="text-gray-500">Amount</span>
              <span className="font-semibold">{inr(data.amount)}</span>
            </div>
            <div className="flex justify-between flex-wrap text-sm py-1.5">
              <span className="text-gray-500">Email</span>
              <span className="font-medium break-all">{data.email || "—"}</span>
            </div>
            <div className="flex justify-between flex-wrap text-sm py-1.5">
              <span className="text-gray-500">Phone</span>
              <span className="font-medium">{data.phone ? `+91 ${data.phone}` : "—"}</span>
            </div>
          </div>

          {/* actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-center">
            <button
              onClick={() => navigator.clipboard?.writeText(data.razorpay_payment_id || "")}
              className="w-full sm:w-auto border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2.5 rounded"
            >
              Copy Payment ID
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto bg-lime-500 hover:bg-lime-600 text-white font-medium px-4 py-2.5 rounded text-center"
            >
              Go Home
            </Link>
          </div>

          <p className="text-[11px] sm:text-xs text-center text-gray-500 mt-4">
            Final confirmation comes from the payment webhook; check your email for receipts if enabled.
          </p>
        </div>
      </div>
    </div>
  );
}
