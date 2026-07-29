import { supabase } from "./supabaseClient";
import { toServiceError } from "./error";

const TABLE = "payment_settings";

export type PaymentSettings = {
  /** Razorpay checkout. Turn off to suspend card payments — the Edge Function
   *  enforces this too, so it is a real switch and not just a hidden button. */
  online_enabled: boolean;
  offline_enabled: boolean;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  upi_id: string | null;
  instructions_note: string | null;
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  online_enabled: true,
  offline_enabled: false,
  bank_account_name: null,
  bank_account_number: null,
  bank_ifsc: null,
  upi_id: null,
  instructions_note: null,
};

/** Publicly readable (RLS: anon SELECT) — used by the registration form and
 * the offline status page. Returns defaults when no row exists yet. */
export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    const { data, error } = await supabase.from(TABLE).select("*").maybeSingle();
    if (error) throw error;
    return data ? (data as PaymentSettings) : DEFAULT_PAYMENT_SETTINGS;
  } catch (e) {
    throw toServiceError(e, "Failed to load payment settings");
  }
}

export async function updatePaymentSettings(settings: PaymentSettings): Promise<void> {
  try {
    const { error } = await supabase
      .from(TABLE)
      .upsert({ id: true, ...settings, updated_at: new Date().toISOString() });
    if (error) throw error;
  } catch (e) {
    throw toServiceError(e, "Failed to save payment settings");
  }
}
