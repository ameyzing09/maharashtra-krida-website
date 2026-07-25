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
