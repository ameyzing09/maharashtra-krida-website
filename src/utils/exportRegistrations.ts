import { RegistrationRow } from "../types/badminton";

type FlatRow = Record<string, string | number>;

function flatten(rows: RegistrationRow[]): FlatRow[] {
  return rows.map((r) => ({
    Date: new Date(r.created_at).toLocaleString("en-IN"),
    Company: r.company,
    Contact: r.contact_person ?? "",
    "Official Email": r.official_email,
    Phone: r.phone,
    Categories: r.categories_summary,
    Players: r.entries
      .flatMap((e) => (e.players.length > 0 ? e.players.map((p) => p.name) : e.teamName ? [`Team: ${e.teamName}`] : []))
      .join("; "),
    "Total (INR)": r.total_paise / 100,
    Status: r.status,
    Method: r.payment_method,
    "Payment Ref": r.payment_note ?? "",
    "Order ID": r.order_id,
    "Payment ID": r.payment_id ?? "",
    "Paid At": r.paid_at ? new Date(r.paid_at).toLocaleString("en-IN") : "",
  }));
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function stamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export function exportCSV(rows: RegistrationRow[]) {
  const flat = flatten(rows);
  if (flat.length === 0) return;
  const headers = Object.keys(flat[0]);
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...flat.map((row) => headers.map((h) => escape(row[h])).join(","))].join("\n");
  download(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }), `badminton-registrations-${stamp()}.csv`);
}

export async function exportExcel(rows: RegistrationRow[]) {
  const flat = flatten(rows);
  if (flat.length === 0) return;
  const { utils, writeFile } = await import("xlsx");
  const ws = utils.json_to_sheet(flat);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Registrations");
  writeFile(wb, `badminton-registrations-${stamp()}.xlsx`);
}
