const DEFAULT_MAX_BYTES = 5 * 1024 * 1024; // 5MB — adjust if the Supabase Storage bucket limit differs

// Returns an error message if the file fails validation, or null if it's valid.
export function validateImageFile(file: File, maxBytes: number = DEFAULT_MAX_BYTES): string | null {
  if (!file.type.startsWith("image/")) return `"${file.name}" is not an image file.`;
  if (file.size > maxBytes) return `"${file.name}" is larger than ${(maxBytes / (1024 * 1024)).toFixed(0)}MB.`;
  return null;
}

export function validateUploadFile(
  file: File,
  allowedPrefixes: string[],
  maxBytes: number = DEFAULT_MAX_BYTES
): string | null {
  if (!allowedPrefixes.some((prefix) => file.type.startsWith(prefix))) {
    return `"${file.name}" is not an accepted file type.`;
  }
  if (file.size > maxBytes) return `"${file.name}" is larger than ${(maxBytes / (1024 * 1024)).toFixed(0)}MB.`;
  return null;
}
