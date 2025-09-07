import { collection, getDocs, addDoc, doc, setDoc, deleteDoc, getDoc, query, orderBy } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { collections } from "../constants";
import type { ID, NewTeam, Team } from "../types/tournament";
import { toServiceError } from "./error";

const teamsRef = collection(db, collections.TEAMS);

function prune<T extends Record<string, unknown>>(obj: T): T {
  const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
  return Object.fromEntries(entries) as T;
}

export async function listTeams(): Promise<Team[]> {
  try {
    const q = query(teamsRef, orderBy("name"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Team, "id">) }));
  } catch (e) {
    throw toServiceError(e, 'Failed to list teams');
  }
}

export async function getTeam(id: ID): Promise<Team | null> {
  try {
    const d = await getDoc(doc(db, collections.TEAMS, id));
    if (!d.exists()) return null;
    return { id: d.id, ...(d.data() as Omit<Team, "id">) };
  } catch (e) {
    throw toServiceError(e, 'Failed to get team');
  }
}

export async function createTeam(input: NewTeam): Promise<ID> {
  try {
    const res = await addDoc(teamsRef, prune(input));
    return res.id;
  } catch (e) {
    throw toServiceError(e, 'Failed to create team');
  }
}

export async function updateTeam(id: ID, patch: Partial<NewTeam>): Promise<void> {
  try {
    await setDoc(doc(db, collections.TEAMS, id), prune(patch), { merge: true });
  } catch (e) {
    throw toServiceError(e, 'Failed to update team');
  }
}

export async function deleteTeam(id: ID): Promise<void> {
  try {
    await deleteDoc(doc(db, collections.TEAMS, id));
  } catch (e) {
    throw toServiceError(e, 'Failed to delete team');
  }
}
