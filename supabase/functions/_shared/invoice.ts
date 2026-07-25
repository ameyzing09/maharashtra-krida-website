// deno-lint-ignore-file no-explicit-any
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";
import { CATEGORY_LABEL, FEE_MAP } from "./badminton.ts";

export const ORGANIZER = {
  name: "Maharashtra Krida",
  addressLines: ["OM SAI Palace", "Narhe, Sinhagad Road", "Pune 411 041"],
  contactName: "Ashwin Panhalkar",
  phone: "+91 9890 171 195",
  email: "maharashtrakrida@gmail.com",
};

export type InvoiceSourceRow = {
  invoice_number: string;
  company: string;
  contact_person: string | null;
  official_email: string;
  phone: string;
  total_paise: number;
  entries: any[];
  payment_id: string | null;
  order_id: string;
  paid_at: string | null;
};

export type InvoiceContent = {
  mode: "receipt" | "gst";
  gstin?: string;
  invoiceNumber: string;
  invoiceDate: string;
  billTo: { company: string; contact: string; email: string; phone: string };
  lineItems: { label: string; amountPaise: number }[];
  totalPaise: number;
  payment: { id: string; orderId: string; method: string };
};

/**
 * Pure — no Deno.* calls — so it's directly unit-testable with `deno test`.
 * `gstin`, when provided (from the ORGANIZER_GSTIN secret), switches the
 * document into GST-invoice mode. NOTE: this only toggles what's *displayed*
 * (GSTIN line, "TAX INVOICE" title) — it does not compute or assert a tax
 * breakup. Review with an accountant before relying on it as a compliant tax
 * invoice; today's default (no GSTIN configured) is a plain payment receipt.
 */
export function buildInvoiceContent(row: InvoiceSourceRow, gstin?: string): InvoiceContent {
  const lineItems = (row.entries || []).map((e: any) => ({
    label: (CATEGORY_LABEL[e.category] || e.category) + (e.teamName ? ` — ${e.teamName}` : ""),
    amountPaise: FEE_MAP[e.category] ?? 0,
  }));

  const invoiceDate = row.paid_at
    ? new Date(row.paid_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  return {
    mode: gstin ? "gst" : "receipt",
    gstin,
    invoiceNumber: row.invoice_number,
    invoiceDate,
    billTo: {
      company: row.company,
      contact: row.contact_person || "",
      email: row.official_email,
      phone: row.phone,
    },
    lineItems,
    totalPaise: row.total_paise,
    payment: { id: row.payment_id || "", orderId: row.order_id, method: "Razorpay" },
  };
}

// pdf-lib's built-in standard fonts use WinAnsi encoding, which cannot
// represent the ₹ glyph (would require embedding a custom Unicode font) —
// "Rs." keeps this readable with the built-in fonts.
function inr(paise: number): string {
  const amount = (paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `Rs. ${amount}`;
}

/** Renders the content into an A4 PDF. `logoBytes` is optional — a missing
 * or bad logo must never prevent the invoice from being generated. */
export async function renderInvoicePdf(
  content: InvoiceContent,
  logoBytes: Uint8Array | null
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4 in points
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const dark = rgb(0.11, 0.13, 0.15);
  const gray = rgb(0.45, 0.45, 0.45);
  const lime = rgb(0.32, 0.6, 0.09);

  const left = 50;
  const right = 545;
  let y = 800;

  if (logoBytes) {
    try {
      const img = await doc.embedJpg(logoBytes);
      const dims = img.scale(0.1);
      page.drawImage(img, { x: right - dims.width, y: 780 - dims.height + 40, width: dims.width, height: dims.height });
    } catch {
      // logo is cosmetic only — never let it fail invoice generation
    }
  }

  page.drawText(ORGANIZER.name, { x: left, y, size: 18, font: bold, color: dark });
  y -= 18;
  for (const line of ORGANIZER.addressLines) {
    page.drawText(line, { x: left, y, size: 9, font, color: gray });
    y -= 12;
  }
  page.drawText(`${ORGANIZER.email}  ·  ${ORGANIZER.phone}`, { x: left, y, size: 9, font, color: gray });
  y -= 28;

  const title = content.mode === "gst" ? "TAX INVOICE" : "PAYMENT RECEIPT";
  page.drawText(title, { x: left, y, size: 14, font: bold, color: lime });
  y -= 18;
  page.drawText(`Invoice No: ${content.invoiceNumber}`, { x: left, y, size: 10, font });
  y -= 14;
  page.drawText(`Date: ${content.invoiceDate}`, { x: left, y, size: 10, font });
  y -= 14;
  if (content.mode === "gst" && content.gstin) {
    page.drawText(`GSTIN: ${content.gstin}`, { x: left, y, size: 10, font });
    y -= 14;
  }
  y -= 10;

  page.drawText("Billed To", { x: left, y, size: 10, font: bold, color: dark });
  y -= 14;
  page.drawText(content.billTo.company, { x: left, y, size: 10, font });
  y -= 13;
  if (content.billTo.contact) {
    page.drawText(content.billTo.contact, { x: left, y, size: 10, font });
    y -= 13;
  }
  page.drawText(content.billTo.email, { x: left, y, size: 10, font });
  y -= 13;
  page.drawText(content.billTo.phone, { x: left, y, size: 10, font });
  y -= 24;

  page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 0.5, color: gray });
  y -= 16;
  page.drawText("Description", { x: left, y, size: 10, font: bold });
  page.drawText("Amount", { x: 470, y, size: 10, font: bold });
  y -= 8;
  page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 0.5, color: gray });
  y -= 18;

  for (const item of content.lineItems) {
    page.drawText(item.label, { x: left, y, size: 10, font });
    page.drawText(inr(item.amountPaise), { x: 470, y, size: 10, font });
    y -= 18;
  }

  y -= 6;
  page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 0.5, color: gray });
  y -= 20;
  page.drawText("Total", { x: left, y, size: 12, font: bold });
  page.drawText(inr(content.totalPaise), { x: 460, y, size: 12, font: bold });
  y -= 34;

  page.drawText("Payment Reference", { x: left, y, size: 10, font: bold, color: dark });
  y -= 14;
  page.drawText(`Payment ID: ${content.payment.id}`, { x: left, y, size: 9, font, color: gray });
  y -= 12;
  page.drawText(`Order ID: ${content.payment.orderId}`, { x: left, y, size: 9, font, color: gray });
  y -= 12;
  page.drawText(`Method: ${content.payment.method}`, { x: left, y, size: 9, font, color: gray });
  y -= 30;

  page.drawText(
    "Entry fees are strictly non-refundable. This is a computer-generated document.",
    { x: left, y, size: 8, font, color: gray }
  );

  return await doc.save();
}

const SB_HEADERS = () => ({
  apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
  "Content-Type": "application/json",
});

let cachedLogo: Uint8Array | null | undefined;
async function fetchLogo(): Promise<Uint8Array | null> {
  if (cachedLogo !== undefined) return cachedLogo;
  try {
    const url = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/media/branding/badminton-logo.jpg`;
    const res = await fetch(url);
    cachedLogo = res.ok ? new Uint8Array(await res.arrayBuffer()) : null;
  } catch {
    cachedLogo = null;
  }
  return cachedLogo;
}

/**
 * Fetches the registration row, assigns it an invoice number (idempotent —
 * reuses one already assigned by a prior attempt), renders the PDF, uploads
 * it to the private `invoices` bucket, and records the result on the row.
 * Safe to call more than once for the same order (used by both the webhook
 * and the admin "Regenerate" action).
 */
export async function generateAndStoreInvoice(
  orderId: string
): Promise<{ invoiceNumber: string; path: string }> {
  const base = `${Deno.env.get("SUPABASE_URL")}/rest/v1`;

  const rowRes = await fetch(
    `${base}/badminton_registrations?order_id=eq.${encodeURIComponent(orderId)}&select=*`,
    { headers: SB_HEADERS() }
  );
  if (!rowRes.ok) throw new Error(`fetch row failed (${rowRes.status}): ${await rowRes.text()}`);
  const rows = await rowRes.json();
  if (rows.length === 0) throw new Error(`registration row not found for order ${orderId}`);
  const row = rows[0];

  let invoiceNumber: string | null = row.invoice_number;
  if (!invoiceNumber) {
    const rpcRes = await fetch(`${base}/rpc/next_invoice_number`, {
      method: "POST",
      headers: SB_HEADERS(),
      body: "{}",
    });
    if (!rpcRes.ok) throw new Error(`next_invoice_number failed (${rpcRes.status}): ${await rpcRes.text()}`);
    invoiceNumber = await rpcRes.json();
  }

  const gstin = Deno.env.get("ORGANIZER_GSTIN") || undefined;
  const content = buildInvoiceContent({ ...row, invoice_number: invoiceNumber! }, gstin);
  const logo = await fetchLogo();
  const pdfBytes = await renderInvoicePdf(content, logo);

  const path = `${orderId}.pdf`;
  const upRes = await fetch(
    `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/invoices/${path}`,
    {
      method: "POST",
      headers: {
        apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "Content-Type": "application/pdf",
        "x-upsert": "true",
      },
      body: pdfBytes as BodyInit,
    }
  );
  if (!upRes.ok) throw new Error(`storage upload failed (${upRes.status}): ${await upRes.text()}`);

  const patchRes = await fetch(
    `${base}/badminton_registrations?order_id=eq.${encodeURIComponent(orderId)}`,
    {
      method: "PATCH",
      headers: SB_HEADERS(),
      body: JSON.stringify({
        invoice_number: invoiceNumber,
        invoice_path: path,
        invoice_generated_at: new Date().toISOString(),
      }),
    }
  );
  if (!patchRes.ok) throw new Error(`patch invoice fields failed (${patchRes.status}): ${await patchRes.text()}`);

  return { invoiceNumber: invoiceNumber!, path };
}
