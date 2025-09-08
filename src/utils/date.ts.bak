export type FlexibleDateInput = string | number | Date | null | undefined;

function toOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function tryParseKnownPatterns(text: string): Date | null {
  // ISO or browser-parsable
  const t = Date.parse(text);
  if (!Number.isNaN(t)) return new Date(t);

  // dd-MMM-yy or dd-MMM-yyyy (e.g., 30-Aug-25 or 30-Aug-2025)
  let m = text.match(/^(\d{1,2})[\s\-]([A-Za-z]{3,})[\s\-](\d{2,4})$/);
  if (m) {
    const day = parseInt(m[1], 10);
    const monStr = m[2].slice(0, 3).toLowerCase();
    const map: Record<string, number> = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
    const month = map[monStr] ?? 0;
    const yy = parseInt(m[3], 10);
    const year = yy < 100 ? 2000 + yy : yy;
    return new Date(year, month, day);
  }

  // dd/MM/yyyy or dd-MM-yyyy
  m = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    const yy = parseInt(m[3], 10);
    const year = yy < 100 ? 2000 + yy : yy;
    return new Date(year, month, day);
  }

  return null;
}

export function parseFlexibleDate(input: FlexibleDateInput): Date | null {
  if (input == null) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  if (typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  const text = String(input).trim();
  if (!text) return null;
  const byKnown = tryParseKnownPatterns(text);
  if (byKnown) return byKnown;
  const ts = Date.parse(text);
  return Number.isNaN(ts) ? null : new Date(ts);
}

export function formatDateLong(input: FlexibleDateInput): string {
  const d = parseFlexibleDate(input);
  if (!d) return String(input ?? "");
  const day = toOrdinal(d.getDate());
  const month = d.toLocaleString("en-GB", { month: "long" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

