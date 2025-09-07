import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, where, limit } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { collections } from "../constants";
import type { ID, Match, MatchStatus, NewMatch } from "../types/tournament";
import { toServiceError } from "./error";

const matchesRef = collection(db, collections.MATCHES);

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
  console.log("Creating match:", input);
  try {
    const res = await addDoc(matchesRef, pruneDeep(input));
    return res.id;
  } catch (e) {
    throw toServiceError(e, 'Failed to create match');
  }
}

export async function updateMatch(id: ID, patch: Partial<NewMatch>): Promise<void> {
  console.log("Updating match:", id, patch);
  try {
    const res = await setDoc(doc(db, collections.MATCHES, id), pruneDeep(patch), { merge: true });
    console.log("Match updated:", id, res);
  } catch (e) {
    throw toServiceError(e, 'Failed to update match');
  }
}

export async function deleteMatch(id: ID): Promise<void> {
  try {
    await deleteDoc(doc(db, collections.MATCHES, id));
  } catch (e) {
    throw toServiceError(e, 'Failed to delete match');
  }
}

export async function listMatchesByEvent(eventId: ID): Promise<Match[]> {
  try {
    const q = query(matchesRef, where("eventId", "==", eventId), orderBy("scheduledAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Match, "id">) }));
  } catch (e: unknown) {
    // Fallback if composite index not yet created: fetch without order and sort client-side
    const q = query(matchesRef, where("eventId", "==", eventId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Match, "id">) }))
      .sort((a, b) => (b.scheduledAt ?? 0) - (a.scheduledAt ?? 0));
  }
}

export async function listMatchesByStatus(status: MatchStatus, max = 30): Promise<Match[]> {
  const byUpcomingAsc = status === "upcoming";
  try {
    const q = query(
      matchesRef,
      where("status", "==", status),
      orderBy("scheduledAt", byUpcomingAsc ? "asc" : "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Match, "id">) }));
  } catch (e: unknown) {
    // Fallback if composite index not yet created
    const q = query(matchesRef, where("status", "==", status), limit(max));
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Match, "id">) }));
    return rows.sort((a, b) =>
      byUpcomingAsc
        ? (a.scheduledAt ?? 0) - (b.scheduledAt ?? 0)
        : (b.scheduledAt ?? 0) - (a.scheduledAt ?? 0)
    );
  }
}

export async function listRecentCompleted(limitCount = 10): Promise<Match[]> {
  try {
    const q = query(matchesRef, where("status", "==", "completed"), orderBy("scheduledAt", "desc"), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Match, "id">) }));
  } catch (e) {
    const q = query(matchesRef, where("status", "==", "completed"), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Match, "id">) }))
      .sort((a, b) => (b.scheduledAt ?? 0) - (a.scheduledAt ?? 0));
  }
}

export async function listLive(limitCount = 10): Promise<Match[]> {
  try {
    const q = query(matchesRef, where("status", "==", "live"), orderBy("scheduledAt", "desc"), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Match, "id">) }));
  } catch (e) {
    const q = query(matchesRef, where("status", "==", "live"), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Match, "id">) }))
      .sort((a, b) => (b.scheduledAt ?? 0) - (a.scheduledAt ?? 0));
  }
}
