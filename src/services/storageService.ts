import { supabase } from "./supabaseClient";
import { toServiceError } from "./error";

const BUCKET = "media";

/** Strip anything unsafe from a filename for use as a storage key. */
function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

/**
 * Uploads a file to the public `media` bucket under `folder/` and returns its
 * public URL. Requires an authenticated (admin) session — the bucket denies
 * anonymous writes.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  try {
    const path = `${folder}/${Date.now()}_${safeName(file.name)}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    throw toServiceError(e, "Failed to upload file");
  }
}
