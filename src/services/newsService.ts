import { supabase } from "./supabaseClient";
import { toServiceError } from "./error";

export type NewsItem = { id: string; title: string; summary?: string; content?: string; imageUrl?: string; eventId?: string; createdAt?: unknown };
export type NewNewsItem = Omit<NewsItem, 'id' | 'createdAt'>;

const TABLE = "news";

export async function listNews(max = 20): Promise<NewsItem[]> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("createdAt", { ascending: false })
      .limit(max);
    if (error) throw error;
    return (data ?? []) as NewsItem[];
  } catch (e) { throw toServiceError(e, 'Failed to fetch news'); }
}

export async function addNewsItem(item: NewNewsItem): Promise<string> {
  try {
    const { data, error } = await supabase.from(TABLE).insert(item).select("id").single();
    if (error) throw error;
    return data.id as string;
  } catch (e) { throw toServiceError(e, 'Failed to add news'); }
}

export async function deleteNewsItem(id: string): Promise<void> {
  try {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  } catch (e) { throw toServiceError(e, 'Failed to delete news'); }
}

export async function getNewsItem(id: string): Promise<NewsItem | null> {
  try {
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as NewsItem) ?? null;
  } catch (e) { throw toServiceError(e, 'Failed to fetch news'); }
}
