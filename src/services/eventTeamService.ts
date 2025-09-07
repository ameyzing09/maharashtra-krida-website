import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { collections } from "../constants";
import type { EventTeam, ID, NewEventTeam } from "../types/tournament";
import { toServiceError } from "./error";

const eventTeamsRef = collection(db, collections.EVENT_TEAMS);

function key(eventId: ID, teamId: ID): ID {
  return `${eventId}__${teamId}`;
}

function prune<T extends Record<string, unknown>>(obj: T): T {
  const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
  return Object.fromEntries(entries) as T;
}

export async function listEventTeams(eventId: ID): Promise<EventTeam[]> {
  try {
    const q = query(eventTeamsRef, where("eventId", "==", eventId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EventTeam, "id">) }));
  } catch (e) {
    throw toServiceError(e, 'Failed to list event teams');
  }
}

export async function upsertEventTeam(input: NewEventTeam): Promise<ID> {
  // deterministic id to avoid duplicates per event/team
  const id = key(input.eventId, input.teamId);
  try {
    await setDoc(doc(db, collections.EVENT_TEAMS, id), prune(input), { merge: true });
    return id;
  } catch (e) {
    throw toServiceError(e, 'Failed to upsert event team');
  }
}

export async function deleteEventTeam(eventId: ID, teamId: ID): Promise<void> {
  try {
    await deleteDoc(doc(db, collections.EVENT_TEAMS, key(eventId, teamId)));
  } catch (e) {
    throw toServiceError(e, 'Failed to delete event team');
  }
}
