import { CategoryEntry, Organization } from "../types/badminton";

const KEY = "badminton_draft_v1";

export type BadmintonDraft = {
  step: 0 | 1 | 2 | 3;
  organization: Organization | null;
  entries: CategoryEntry[];
};

export function loadDraft(): BadmintonDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      step: [0, 1, 2, 3].includes(parsed.step) ? parsed.step : 0,
      organization: parsed.organization ?? null,
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    };
  } catch {
    return null;
  }
}

export function saveDraft(draft: BadmintonDraft): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    /* storage unavailable (private browsing quota etc.) — not fatal */
  }
}

export function clearDraft(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
