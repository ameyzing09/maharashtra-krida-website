import { supabase } from "./supabaseClient";
import type { ID, Match, MatchStatus, NewMatch } from "../types/tournament";
import { toServiceError } from "./error";

const TABLE = "matches";

function pruneDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => pruneDeep(v)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      out[k] = pruneDeep(v as unknown);
    }
    return out as T;
  }
  return value;
}

export async function createMatch(input: NewMatch): Promise<ID> {
  try {
    const { data, error } = await supabase.from(TABLE).insert(pruneDeep(input)).select("id").single();
    if (error) throw error;
    return data.id as ID;
  } catch (e) {
    throw toServiceError(e, "Failed to create match");
  }
}

export async function updateMatch(id: ID, patch: Partial<NewMatch>): Promise<void> {
  try {
    const { error } = await supabase.from(TABLE).update(pruneDeep(patch)).eq("id", id);
    if (error) throw error;
  } catch (e) {
    throw toServiceError(e, "Failed to update match");
  }
}

export async function deleteMatch(id: ID): Promise<void> {
  try {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  } catch (e) {
    throw toServiceError(e, "Failed to delete match");
  }
}

export async function listMatchesByEvent(eventId: ID): Promise<Match[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("eventId", eventId)
      .order("scheduledAt", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Match[];
  } catch (e) {
    throw toServiceError(e, "Failed to list matches");
  }
}

export async function listMatchesByStatus(status: MatchStatus, max = 30): Promise<Match[]> {
  const byUpcomingAsc = status === "upcoming";
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("status", status)
      .order("scheduledAt", { ascending: byUpcomingAsc })
      .limit(max);
    if (error) throw error;
    return (data ?? []) as Match[];
  } catch (e) {
    throw toServiceError(e, "Failed to list matches by status");
  }
}

export async function listRecentCompleted(limitCount = 10): Promise<Match[]> {
  return listMatchesByStatus("completed", limitCount);
}

export async function listLive(limitCount = 10): Promise<Match[]> {
  return listMatchesByStatus("live", limitCount);
}
