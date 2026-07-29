import { useEffect, useState } from "react";
import {
  DEFAULT_SETTINGS,
  getInvoiceSettings,
  InvoiceSettings as InvoiceSettingsType,
  updateInvoiceSettings,
} from "../services/invoiceSettingsService";
import {
  DEFAULT_PAYMENT_SETTINGS,
  getPaymentSettings,
  PaymentSettings,
  updatePaymentSettings,
} from "../services/paymentSettingsService";
import { INDIAN_STATES } from "../constants/indianStates";
import PageLoader from "../component/PageLoader";
import useToast from "../hook/useToast";
import Toast from "../component/common/Toast";

const input = "glass-input w-full px-3 py-2";
const label = "text-sm font-medium text-gray-700 dark:text-gray-200 mb-1";

export default function InvoiceSettings() {
  const [settings, setSettings] = useState<InvoiceSettingsType>(DEFAULT_SETTINGS);
  const [pay, setPay] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPay, setSavingPay] = useState(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const [inv, pmt] = await Promise.all([getInvoiceSettings(), getPaymentSettings()]);
        setSettings(inv);
        setPay(pmt);
      } catch (e) {
        console.error(e);
        showToast("Failed to load settings.", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [showToast]);

  function set<K extends keyof InvoiceSettingsType>(key: K, value: InvoiceSettingsType[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function setP<K extends keyof PaymentSettings>(key: K, value: PaymentSettings[K]) {
    setPay((s) => ({ ...s, [key]: value }));
  }

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setSaving(true);
      await updateInvoiceSettings(settings);
      showToast("Invoice settings saved.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to save settings.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function onSavePay(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setSavingPay(true);
      await updatePaymentSettings(pay);
      showToast("Payment settings saved.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to save payment settings.", "error");
    } finally {
      setSavingPay(false);
    }
  }

  if (loading) return <PageLoader variant="center" label="Loading settings..." />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl text-brand-charcoal dark:text-gray-200">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Invoice &amp; Payment Settings
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Controls how registration invoices are generated. By default, invoices are a plain payment
        receipt. Turning on GST mode switches them to a tax invoice using the details below —
        confirm the rate, HSN/SAC code, and GSTIN with your accountant before enabling this for
        real registrations.
      </p>

      <form onSubmit={onSave} className="glass-panel p-5 sm:p-6 space-y-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={settings.gst_enabled}
            onChange={(e) => set("gst_enabled", e.target.checked)}
          />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            GST mode enabled (generate tax invoices instead of receipts)
          </span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-black/5 dark:border-white/10">
          <div className="flex flex-col">
            <label className={label}>GSTIN</label>
            <input
              className={input}
              placeholder="27ABCDE1234F1Z5"
              value={settings.gstin ?? ""}
              onChange={(e) => set("gstin", e.target.value || null)}
            />
          </div>
          <div className="flex flex-col">
            <label className={label}>HSN/SAC Code</label>
            <input
              className={input}
              placeholder="998596"
              value={settings.hsn_sac_code ?? ""}
              onChange={(e) => set("hsn_sac_code", e.target.value || null)}
            />
          </div>
          <div className="flex flex-col">
            <label className={label}>GST Rate (%)</label>
            <input
              className={input}
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="18"
              value={settings.gst_rate_percent ?? ""}
              onChange={(e) => set("gst_rate_percent", e.target.value === "" ? null : Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col">
            <label className={label}>Organiser's State</label>
            <select
              className={input}
              value={settings.organizer_state ?? ""}
              onChange={(e) => set("organizer_state", e.target.value || null)}
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-500 mt-1">
              Used to decide CGST+SGST (same state as registrant) vs IGST (different state).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-black/5 dark:border-white/10">
          <div className="flex flex-col">
            <label className={label}>
              Legal Business Name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              className={input}
              placeholder="Maharashtra Krida"
              value={settings.organizer_legal_name ?? ""}
              onChange={(e) => set("organizer_legal_name", e.target.value || null)}
            />
          </div>
          <div className="flex flex-col">
            <label className={label}>
              PAN <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              className={input}
              placeholder="ABCDE1234F"
              value={settings.organizer_pan ?? ""}
              onChange={(e) => set("organizer_pan", e.target.value || null)}
            />
          </div>
          <div className="flex flex-col sm:col-span-2">
            <label className={label}>
              Registered Address <span className="text-gray-400 font-normal">(optional, one line per address line)</span>
            </label>
            <textarea
              className={`${input} min-h-[80px]`}
              placeholder={"OM SAI Palace\nNarhe, Sinhagad Road\nPune 411 041"}
              value={settings.organizer_address ?? ""}
              onChange={(e) => set("organizer_address", e.target.value || null)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving} className="glass-button-primary px-6 py-2.5 disabled:opacity-50">
            {saving ? "Saving..." : "Save Invoice Settings"}
          </button>
        </div>
      </form>

      {/* Payment methods */}
      <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mt-10 mb-2">
        Payment Methods
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Which ways registrants can pay. Both switches are enforced on the server, so turning one off
        genuinely stops that method rather than only hiding it on the form.
      </p>

      <form onSubmit={onSavePay} className="glass-panel p-5 sm:p-6 space-y-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 mt-0.5"
            checked={pay.online_enabled}
            onChange={(e) => setP("online_enabled", e.target.checked)}
          />
          <span>
            <span className="block text-sm font-semibold text-gray-900 dark:text-white">
              Online payment — card, UPI, netbanking via Razorpay
            </span>
            <span className="block text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Turn off to suspend card payments, for example while Razorpay is verifying the website
              or during a gateway outage. Leave offline enabled below so teams can still register.
            </span>
          </span>
        </label>

        {!pay.online_enabled && !pay.offline_enabled && (
          <p className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            Both methods are off — nobody can complete a registration. Enable at least one.
          </p>
        )}

        <label className="flex items-start gap-3 cursor-pointer pt-1">
          <input
            type="checkbox"
            className="w-4 h-4 mt-0.5"
            checked={pay.offline_enabled}
            onChange={(e) => setP("offline_enabled", e.target.checked)}
          />
          <span>
            <span className="block text-sm font-semibold text-gray-900 dark:text-white">
              Offer &quot;company will pay separately&quot; on the registration form
            </span>
            <span className="block text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Registrants reserve a place, get an MKB- reference code, and settle by bank transfer.
              The details below appear on their status page. Confirm each one from the registrations
              dashboard once the money arrives.
            </span>
          </span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-black/5 dark:border-white/10">
          <div className="flex flex-col">
            <label className={label}>Account Name</label>
            <input
              className={input}
              placeholder="Maharashtra Krida"
              value={pay.bank_account_name ?? ""}
              onChange={(e) => setP("bank_account_name", e.target.value || null)}
            />
          </div>
          <div className="flex flex-col">
            <label className={label}>Account Number</label>
            <input
              className={input}
              placeholder="000111222333"
              value={pay.bank_account_number ?? ""}
              onChange={(e) => setP("bank_account_number", e.target.value || null)}
            />
          </div>
          <div className="flex flex-col">
            <label className={label}>IFSC</label>
            <input
              className={input}
              placeholder="HDFC0001234"
              value={pay.bank_ifsc ?? ""}
              onChange={(e) => setP("bank_ifsc", e.target.value || null)}
            />
          </div>
          <div className="flex flex-col">
            <label className={label}>
              UPI ID <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              className={input}
              placeholder="maharashtrakrida@okhdfcbank"
              value={pay.upi_id ?? ""}
              onChange={(e) => setP("upi_id", e.target.value || null)}
            />
          </div>
          <div className="flex flex-col sm:col-span-2">
            <label className={label}>
              Instructions Note <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              className={`${input} min-h-[80px]`}
              placeholder="e.g. Please quote your reference code in the transfer remarks. NEFT/RTGS accepted."
              value={pay.instructions_note ?? ""}
              onChange={(e) => setP("instructions_note", e.target.value || null)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={savingPay} className="glass-button-primary px-6 py-2.5 disabled:opacity-50">
            {savingPay ? "Saving..." : "Save Payment Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
