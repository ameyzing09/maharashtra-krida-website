import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import { supabase } from "../services/supabaseClient";
import { getRegistrationStatus, RegistrationStatus as StatusData } from "../services/paymentService";
import {
  DEFAULT_PAYMENT_SETTINGS,
  getPaymentSettings,
  PaymentSettings,
} from "../services/paymentSettingsService";

const inr = (p?: number) =>
  typeof p === "number" ? (p / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" }) : "";

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  PENDING: { text: "Reserved — awaiting payment", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  PAID: { text: "Confirmed", cls: "bg-lime-500/15 text-lime-700 dark:text-lime-400" },
  CANCELLED: { text: "Cancelled", cls: "bg-red-500/10 text-red-600 dark:text-red-400" },
};

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3 text-sm py-1">
      <span className="text-gray-500 dark:text-gray-300">{label}</span>
      <span className="font-medium text-brand-charcoal dark:text-white text-right break-all">{value}</span>
    </div>
  );
}

export default function RegistrationStatus() {
  const [params] = useSearchParams();
  const codeParam = params.get("code") || "";
  const isNew = params.get("new") === "1";

  const [code, setCode] = useState(codeParam);
  const [query, setQuery] = useState(codeParam);
  const [data, setData] = useState<StatusData | null>(null);
  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    getPaymentSettings().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query) return;
    let cancelled = false;
    setLoading(true);
    getRegistrationStatus(query)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  // Generate a QR of this status page URL (so it can be scanned/shared) once
  // we have a confirmed-existing pending registration. Lazy-imported to keep
  // qrcode out of the main bundle.
  useEffect(() => {
    if (!data?.found || data.status !== "PENDING" || !query) {
      setQrDataUrl(null);
      return;
    }
    let cancelled = false;
    const url = `${window.location.origin}/registration/status?code=${encodeURIComponent(query)}`;
    import("qrcode").then((QR) => {
      QR.toDataURL(url, { width: 180, margin: 1 }).then((u) => {
        if (!cancelled) setQrDataUrl(u);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [data, query]);

  async function downloadInvoice() {
    const { data: inv, error } = await supabase.functions.invoke("get-invoice", {
      body: { order_id: query },
    });
    if (!error && inv?.ready && inv.url) window.open(inv.url, "_blank", "noopener,noreferrer");
  }

  const status = data?.status ? STATUS_LABEL[data.status] : null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg glass-panel p-6 sm:p-8">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-brand-charcoal dark:text-white mb-1">
          Registration Status
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
          {isNew
            ? "Your registration is reserved. Save your reference code below — quote it when paying."
            : "Enter your reference code to check your registration."}
        </p>

        {/* Code lookup */}
        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          <input
            className="glass-input px-3 py-2 flex-1"
            placeholder="MKB-XXXXXX"
            value={code}
            onChange={(e) => setCode(e.target.value.trim().toUpperCase())}
          />
          <button
            onClick={() => setQuery(code)}
            disabled={loading || code.length < 5}
            className="glass-button-primary px-5 py-2 disabled:opacity-50"
          >
            {loading ? <TailSpin color="#fff" height={18} width={18} /> : "Check"}
          </button>
        </div>

        {data && !data.found && (
          <p className="text-sm text-red-600">No registration found for that code. Double-check and try again.</p>
        )}

        {data?.found && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-300">Reference</span>
              <span className="font-mono font-semibold text-brand-charcoal dark:text-white">{query}</span>
            </div>
            {status && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status.cls}`}>
                {status.text}
              </span>
            )}

            <div className="rounded-xl bg-black/5 dark:bg-white/10 p-4">
              <Row label="Company" value={data.company} />
              <Row label="Categories" value={data.categoriesSummary} />
              <Row label="Amount" value={inr(data.totalPaise)} />
            </div>

            {/* Pending → how to pay */}
            {data.status === "PENDING" && (
              <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">How to pay</p>
                {settings.instructions_note && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                    {settings.instructions_note}
                  </p>
                )}
                <Row label="Account Name" value={settings.bank_account_name} />
                <Row label="Account Number" value={settings.bank_account_number} />
                <Row label="IFSC" value={settings.bank_ifsc} />
                <Row label="UPI ID" value={settings.upi_id} />
                <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                  Quote reference <span className="font-mono font-semibold">{query}</span> in your transfer. Your
                  registration is confirmed once we receive payment.
                </p>
                {qrDataUrl && (
                  <div className="flex flex-col items-center pt-2">
                    <img src={qrDataUrl} alt="Status QR code" width={160} height={160} />
                    <p className="text-[11px] text-gray-500 mt-1">Scan to reopen this status page</p>
                  </div>
                )}
              </div>
            )}

            {/* Paid → invoice */}
            {data.status === "PAID" && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">Payment received — your registration is confirmed.</p>
                {data.invoiceReady && (
                  <button onClick={downloadInvoice} className="glass-button-primary px-6 py-2.5">
                    Download Invoice
                  </button>
                )}
              </div>
            )}

            {data.status === "CANCELLED" && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This registration was cancelled. Please contact us if you believe this is a mistake.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
