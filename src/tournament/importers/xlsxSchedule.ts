import type { MatchStatus } from "../../types/tournament";

export type RawScheduleRow = {
  teamA: string;
  teamB: string;
  date?: string | number;
  time?: string | number;
  datetime?: string | number;
  venue?: string;
  status?: MatchStatus;
};

export type ParsedSchedule = {
  teamA: string;
  teamB: string;
  scheduledAt: number; // epoch ms
  venue?: string;
  status: MatchStatus;
};

function excelDateToMs(v: number): number {
  // Excel stores dates as days since 1899-12-30
  const ms = (v - 25569) * 86400 * 1000;
  return Math.round(ms);
}

function toEpochMs(date?: string | number, time?: string | number, datetime?: string | number): number {
  // Prefer combined datetime
  if (datetime !== undefined && datetime !== null && datetime !== "") {
    if (typeof datetime === "number") return excelDateToMs(datetime);
    const t = Date.parse(String(datetime));
    return isNaN(t) ? Date.now() : t;
  }
  // Combine date + time if present
  if (date !== undefined && date !== null && date !== "") {
    if (typeof date === "number") {
      const base = excelDateToMs(date);
      if (typeof time === "number") {
        const timeMs = Math.round((time % 1) * 86400 * 1000);
        return base + timeMs;
      }
      return base;
    }
    const dateStr = String(date);
    let iso = dateStr;
    if (time !== undefined && time !== null && time !== "") {
      if (typeof time === "number") {
        const timeMs = Math.round((time % 1) * 86400 * 1000);
        const d = new Date(dateStr);
        const ms = isNaN(d.getTime()) ? Date.now() : d.getTime();
        return ms + timeMs;
      }
      // If time is a string and may contain a range (e.g., "09:00 am – 10:00 am"), take the start time
      const timeStr = String(time).replace(/[\u2013\u2014]/g, "-"); // normalize en/em dash to hyphen
      const start = timeStr.split(/\s*[-–—]\s*/)[0]?.trim() || timeStr.trim();
      iso = `${dateStr} ${start}`;
    }
    const t = Date.parse(iso);
    return isNaN(t) ? Date.now() : t;
  }
  return Date.now();
}

export async function parseScheduleXlsx(file: File): Promise<ParsedSchedule[]> {
  const { read, utils } = await import("xlsx");
  const arrayBuf = await file.arrayBuffer();
  const wb = read(arrayBuf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, unknown>[] = utils.sheet_to_json(ws, { defval: "" });

  const out: ParsedSchedule[] = [];
  for (const r of rows) {
    const teamA = String((r["Team A"] ?? r["teamA"] ?? r["TeamA"] ?? r["A"] ?? "")).trim();
    const teamB = String((r["Team B"] ?? r["teamB"] ?? r["TeamB"] ?? r["B"] ?? "")).trim();
    const date = (r["Date"] ?? r["date"]) as string | number | undefined;
    const time = (r["Time"] ?? r["time"]) as string | number | undefined;
    const datetime = (r["DateTime"] ?? r["Datetime"] ?? r["datetime"]) as string | number | undefined;
    const venue = String((r["Venue"] ?? r["venue"] ?? "")).trim() || undefined;
    const statusRaw = String((r["Status"] ?? r["status"] ?? "")).trim().toLowerCase();
    const status = (statusRaw === "live" || statusRaw === "completed" || statusRaw === "cancelled") ? (statusRaw as MatchStatus) : ("upcoming" as MatchStatus);

    if (!teamA || !teamB) continue;
    const scheduledAt = toEpochMs(date, time, datetime);
    out.push({ teamA, teamB, scheduledAt, venue, status });
  }
  return out;
}
