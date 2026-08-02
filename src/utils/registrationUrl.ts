// Values a registration URL field can hold that aren't a real, usable link —
// left blank, an explicit "not applicable", or a placeholder anchor ("#")
// someone typed while the real link wasn't ready yet.
const INVALID_REGISTRATION_VALUES = new Set(["", "#", "na", "n/a"]);

export const hasValidRegistration = (url?: string): boolean => {
  if (!url) return false;
  return !INVALID_REGISTRATION_VALUES.has(url.trim().toLowerCase());
};

export const isExternalUrl = (url?: string): boolean => !!url && /^https?:\/\//i.test(url);
