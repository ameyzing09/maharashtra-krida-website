import { supabase } from "./supabaseClient";
import { toServiceError } from "./error";

const TABLE = "invoice_settings";

export type InvoiceSettings = {
  gst_enabled: boolean;
  gstin: string | null;
  hsn_sac_code: string | null;
  gst_rate_percent: number | null;
  organizer_legal_name: string | null;
  organizer_pan: string | null;
  organizer_state: string | null;
  organizer_address: string | null;
};

export const DEFAULT_SETTINGS: InvoiceSettings = {
  gst_enabled: false,
  gstin: null,
  hsn_sac_code: null,
  gst_rate_percent: null,
  organizer_legal_name: null,
  organizer_pan: null,
  organizer_state: null,
  organizer_address: null,
};

/** Admin-only (RLS: authenticated). Returns defaults if no row exists yet. */
export async function getInvoiceSettings(): Promise<InvoiceSettings> {
  try {
    const { data, error } = await supabase.from(TABLE).select("*").maybeSingle();
    if (error) throw error;
    return data ? (data as InvoiceSettings) : DEFAULT_SETTINGS;
  } catch (e) {
    throw toServiceError(e, "Failed to load invoice settings");
  }
}

export async function updateInvoiceSettings(settings: InvoiceSettings): Promise<void> {
  try {
    const { error } = await supabase
      .from(TABLE)
      .upsert({ id: true, ...settings, updated_at: new Date().toISOString() });
    if (error) throw error;
  } catch (e) {
    throw toServiceError(e, "Failed to save invoice settings");
  }
}
