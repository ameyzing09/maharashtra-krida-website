import { supabase } from "./supabaseClient";
import { toServiceError } from "./error";
import { RegistrationRow } from "../types/badminton";

const TABLE = "badminton_registrations";

/** Admin-only (RLS: authenticated). Anonymous sessions receive zero rows. */
export async function listRegistrations(): Promise<RegistrationRow[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as RegistrationRow[];
  } catch (e) {
    throw toServiceError(e, "Failed to load registrations");
  }
}

/** Mark a registration paid via an offline payment (NEFT/bank transfer). */
export async function markPaidOffline(id: string, reference: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(TABLE)
      .update({
        status: "PAID",
        payment_method: "offline",
        payment_note: reference,
        paid_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
  } catch (e) {
    throw toServiceError(e, "Failed to mark paid");
  }
}

export async function cancelRegistration(id: string): Promise<void> {
  try {
    const { error } = await supabase.from(TABLE).update({ status: "CANCELLED" }).eq("id", id);
    if (error) throw error;
  } catch (e) {
    throw toServiceError(e, "Failed to cancel registration");
  }
}

/** Admin session only — the signed URL is short-lived and not cached. */
export async function getInvoiceDownloadUrl(invoicePath: string): Promise<string> {
  try {
    const { data, error } = await supabase.storage.from("invoices").createSignedUrl(invoicePath, 3600);
    if (error) throw error;
    return data.signedUrl;
  } catch (e) {
    throw toServiceError(e, "Failed to get invoice link");
  }
}

/** Re-runs invoice generation for a row (e.g. after a prior failure). */
export async function regenerateInvoice(orderId: string): Promise<{ invoiceNumber: string; path: string }> {
  const { data, error } = await supabase.functions.invoke("regenerate-invoice", {
    body: { order_id: orderId },
  });
  if (error) throw toServiceError(error, "Failed to regenerate invoice");
  return data;
}
