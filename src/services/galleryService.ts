import { addDoc, collection, deleteDoc, doc, getCountFromServer, getDocs, limit, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { collections } from "../constants";
import { toServiceError } from "./error";

export type GalleryItem = { id: string; imageUrl: string; alt?: string; title?: string; description?: string; createdAt?: unknown };
export type NewGalleryItem = Omit<GalleryItem, 'id' | 'createdAt'>;

const coll = collection(db, collections.GALLERY);
const MAX_ITEMS = 10;

export async function listGallery(): Promise<GalleryItem[]> {
  try {
    const snap = await getDocs(query(coll, orderBy('createdAt', 'desc'), limit(30)));
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<GalleryItem, 'id'>) }));
  } catch (e) { throw toServiceError(e, 'Failed to list gallery'); }
}

export async function addGalleryItem(item: NewGalleryItem): Promise<string> {
  try {
    const countSnap = await getCountFromServer(coll);
    if ((countSnap.data().count ?? 0) >= MAX_ITEMS) {
      throw new Error(`Gallery limit reached (${MAX_ITEMS}). Delete older items to add new.`);
    }
    const res = await addDoc(coll, { ...item, createdAt: serverTimestamp() });
    return res.id;
  } catch (e) { throw toServiceError(e, 'Failed to add gallery item'); }
}

export async function deleteGalleryItem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, collections.GALLERY, id));
  } catch (e) { throw toServiceError(e, 'Failed to delete gallery item'); }
}

