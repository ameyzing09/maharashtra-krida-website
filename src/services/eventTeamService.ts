import { supabase } from "./supabaseClient";
import type { EventTeam, ID, NewEventTeam } from "../types/tournament";
import { toServiceError } from "./error";

const TABLE = "event_teams";

function key(eventId: ID, teamId: ID): ID {
  return `${eventId}__${teamId}`;
}

function prune<T extends Record<string, unknown>>(obj: T): T {
  const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
  return Object.fromEntries(entries) as T;
}

export async function listEventTeams(eventId: ID): Promise<EventTeam[]> {
  try {
    const { data, error } = await supabase.from(TABLE).select("*").eq("eventId", eventId);
    if (error) throw error;
    return (data ?? []) as EventTeam[];
  } catch (e) {
    throw toServiceError(e, "Failed to list event teams");
  }
}

export async function upsertEventTeam(input: NewEventTeam): Promise<ID> {
  // deterministic id to avoid duplicates per event/team
  const id = key(input.eventId, input.teamId);
  try {
    const { error } = await supabase.from(TABLE).upsert({ id, ...prune(input) });
    if (error) throw error;
    return id;
  } catch (e) {
    throw toServiceError(e, "Failed to upsert event team");
  }
}

export async function deleteEventTeam(eventId: ID, teamId: ID): Promise<void> {
  try {
    const { error } = await supabase.from(TABLE).delete().eq("id", key(eventId, teamId));
    if (error) throw error;
  } catch (e) {
    throw toServiceError(e, "Failed to delete event team");
  }
}
