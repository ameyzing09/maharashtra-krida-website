import { supabase } from "./supabaseClient";
import { toServiceError } from "./error";

export type GalleryItem = { id: string; imageUrl: string; alt?: string; title?: string; description?: string; createdAt?: unknown };
export type NewGalleryItem = Omit<GalleryItem, 'id' | 'createdAt'>;

const TABLE = "gallery";
const MAX_ITEMS = 10;

export async function listGallery(): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("createdAt", { ascending: false })
      .limit(30);
    if (error) throw error;
    return (data ?? []) as GalleryItem[];
  } catch (e) { throw toServiceError(e, 'Failed to list gallery'); }
}

export async function addGalleryItem(item: NewGalleryItem): Promise<string> {
  try {
    const { count, error: countError } = await supabase
      .from(TABLE)
      .select("id", { count: "exact", head: true });
    if (countError) throw countError;
    if ((count ?? 0) >= MAX_ITEMS) {
      throw new Error(`Gallery limit reached (${MAX_ITEMS}). Delete older items to add new.`);
    }
    const { data, error } = await supabase.from(TABLE).insert(item).select("id").single();
    if (error) throw error;
    return data.id as string;
  } catch (e) { throw toServiceError(e, 'Failed to add gallery item'); }
}

export async function deleteGalleryItem(id: string): Promise<void> {
  try {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  } catch (e) { throw toServiceError(e, 'Failed to delete gallery item'); }
}
