import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { collections } from "../constants";
import { toServiceError } from "./error";

export type NewsItem = { id: string; title: string; summary?: string; content?: string; imageUrl?: string; eventId?: string; createdAt?: unknown };
export type NewNewsItem = Omit<NewsItem, 'id' | 'createdAt'>;

const coll = collection(db, collections.NEWS);

export async function listNews(max = 20): Promise<NewsItem[]> {
  try {
    const snap = await getDocs(query(coll, orderBy('createdAt', 'desc'), limit(max)));
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<NewsItem, 'id'>) }));
  } catch (e) { throw toServiceError(e, 'Failed to fetch news'); }
}

export async function addNewsItem(item: NewNewsItem): Promise<string> {
  try {
    const res = await addDoc(coll, { ...item, createdAt: serverTimestamp() });
    return res.id;
  } catch (e) { throw toServiceError(e, 'Failed to add news'); }
}

export async function deleteNewsItem(id: string): Promise<void> {
  try { await deleteDoc(doc(db, collections.NEWS, id)); }
  catch (e) { throw toServiceError(e, 'Failed to delete news'); }
}

export async function getNewsItem(id: string): Promise<NewsItem | null> {
  try {
    const d = await getDoc(doc(db, collections.NEWS, id));
    if (!d.exists()) return null;
    return { id: d.id, ...(d.data() as Omit<NewsItem, 'id'>) };
  } catch (e) { throw toServiceError(e, 'Failed to fetch news'); }
}
