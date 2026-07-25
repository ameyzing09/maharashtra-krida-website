import { supabase } from "./supabaseClient";
import type { ID, NewTeam, Team } from "../types/tournament";
import { toServiceError } from "./error";

const TABLE = "teams";

function prune<T extends Record<string, unknown>>(obj: T): T {
  const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
  return Object.fromEntries(entries) as T;
}

export async function listTeams(): Promise<Team[]> {
  try {
    const { data, error } = await supabase.from(TABLE).select("*").order("name");
    if (error) throw error;
    return (data ?? []) as Team[];
  } catch (e) {
    throw toServiceError(e, "Failed to list teams");
  }
}

export async function getTeam(id: ID): Promise<Team | null> {
  try {
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Team) ?? null;
  } catch (e) {
    throw toServiceError(e, "Failed to get team");
  }
}

export async function createTeam(input: NewTeam): Promise<ID> {
  try {
    const { data, error } = await supabase.from(TABLE).insert(prune(input)).select("id").single();
    if (error) throw error;
    return data.id as ID;
  } catch (e) {
    throw toServiceError(e, "Failed to create team");
  }
}

export async function updateTeam(id: ID, patch: Partial<NewTeam>): Promise<void> {
  try {
    const { error } = await supabase.from(TABLE).update(prune(patch)).eq("id", id);
    if (error) throw error;
  } catch (e) {
    throw toServiceError(e, "Failed to update team");
  }
}

export async function deleteTeam(id: ID): Promise<void> {
  try {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  } catch (e) {
    throw toServiceError(e, "Failed to delete team");
  }
}
