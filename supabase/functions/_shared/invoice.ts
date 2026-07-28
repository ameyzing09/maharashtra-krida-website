// The inline `npm:` specifier is deliberate, and why deno.json excludes the
// `no-import-prefix` lint rule. It's the documented Supabase Edge Function
// import form, and this project's functions all deploy with import_map: false
// (see `supabase functions list`) — moving pdf-lib to a bare specifier would
// stake invoice generation on an import map that has never been exercised at
// deploy time. Not a trade worth making on a live payment path.
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";
import { CATEGORY_LABEL, CategoryEntry, FEE_MAP } from "./badminton.ts";

// Fallback branding used whenever invoice_settings doesn't override a field
// (or the settings row doesn't exist / GST mode is off).
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
  state: string | null;
  total_paise: number;
  entries: CategoryEntry[];
  payment_id: string | null;
  payment_method: string | null;
  payment_note: string | null;
  order_id: string;
  paid_at: string | null;
};

/** The invoice_settings table — admin-configured via /menu/invoice-settings. */
export type InvoiceSettings = {
  gst_enabled: boolean;
  gstin: string | null;
  hsn_sac_code: string | null;
  gst_rate_percent: number | null;
  organizer_legal_name: string | null;
  organizer_pan: string | null;
  organizer_state: string | null;
  organizer_address: string | null;
};

export type TaxLine = { label: string; amountPaise: number };

export type InvoiceContent = {
  mode: "receipt" | "gst";
  gstin?: string;
  hsnSac?: string;
  organizerName: string;
  organizerAddressLines: string[];
  invoiceNumber: string;
  invoiceDate: string;
  billTo: { company: string; contact: string; email: string; phone: string };
  lineItems: { label: string; amountPaise: number }[];
  /** Value before tax. Equals totalPaise in receipt mode or when the rate
   * isn't configured. */
  taxableValuePaise: number;
  taxLines: TaxLine[];
  /** What was actually collected (tax-inclusive) — never changes based on
   * GST mode; only how it's broken down on the document does. */
  totalPaise: number;
  payment: { id: string; orderId: string; method: string; refLabel: string };
};

/**
 * Splits an already-collected (tax-inclusive) amount into taxable value +
 * tax, given a GST rate. Entry fees are quoted and charged as a single flat
 * amount — there is no separate "add tax at checkout" step in this flow —
 * so GST mode treats that collected total as inclusive of tax and works
 * backwards from it, rather than adding tax on top of what was charged.
 * Rounds the taxable value once and derives tax as the remainder, so any
 * further split (CGST+SGST) always sums back to exactly this tax amount.
 */
function splitTax(totalPaise: number, ratePercent: number): { taxableValuePaise: number; taxPaise: number } {
  const taxableValuePaise = Math.round(totalPaise / (1 + ratePercent / 100));
  return { taxableValuePaise, taxPaise: totalPaise - taxableValuePaise };
}

/** Payment reference for the invoice. Offline (bank-transfer) registrations
 * have no Razorpay payment id — they carry the admin-entered reference
 * (NEFT/UTR/cheque no.) in payment_note and the correct method label. */
function payment(row: InvoiceSourceRow): InvoiceContent["payment"] {
  const isOffline = row.payment_method === "offline";
  return {
    id: isOffline ? row.payment_note || "" : row.payment_id || "",
    orderId: row.order_id,
    method: isOffline ? "Bank Transfer (Offline)" : "Razorpay",
    refLabel: isOffline ? "Payment Ref" : "Payment ID",
  };
}

/**
 * Pure — no Deno.* calls — so it's directly unit-testable with `deno test`.
 *
 * `settings` (from invoice_settings, admin-configured) controls receipt vs
 * GST mode. The GST rate/HSN/GSTIN themselves are taken as given — this
 * function applies them mechanically, it does not assert they are correct;
 * that is a compliance decision for the organiser (see splitTax above for
 * the one methodology choice made here: tax-inclusive back-calculation).
 *
 * Same-state-as-organizer → CGST+SGST (split evenly); different state →
 * IGST. When the registrant's state is unknown (older rows predating the
 * state field) or the rate isn't configured, this degrades gracefully
 * (IGST label as a neutral default / no tax lines) rather than throwing.
 */
export function buildInvoiceContent(row: InvoiceSourceRow, settings?: InvoiceSettings | null): InvoiceContent {
  const lineItems = (row.entries || []).map((e) => ({
    label: (CATEGORY_LABEL[e.category] || e.category) + (e.teamName ? ` — ${e.teamName}` : ""),
    amountPaise: FEE_MAP[e.category] ?? 0,
  }));

  const invoiceDate = row.paid_at
    ? new Date(row.paid_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  const gstMode = !!settings?.gst_enabled;
  const rate = settings?.gst_rate_percent;
  let taxableValuePaise = row.total_paise;
  const taxLines: TaxLine[] = [];

  if (gstMode && typeof rate === "number" && rate > 0) {
    const split = splitTax(row.total_paise, rate);
    taxableValuePaise = split.taxableValuePaise;
    const sameState = !!(row.state && settings?.organizer_state && row.state === settings.organizer_state);
    if (sameState) {
      const cgst = Math.round(split.taxPaise / 2);
      const sgst = split.taxPaise - cgst;
      taxLines.push({ label: `CGST @ ${rate / 2}%`, amountPaise: cgst });
      taxLines.push({ label: `SGST @ ${rate / 2}%`, amountPaise: sgst });
    } else {
      taxLines.push({ label: `IGST @ ${rate}%`, amountPaise: split.taxPaise });
    }
  }

  return {
    mode: gstMode ? "gst" : "receipt",
    gstin: settings?.gstin || undefined,
    hsnSac: settings?.hsn_sac_code || undefined,
    organizerName: settings?.organizer_legal_name || ORGANIZER.name,
    organizerAddressLines: settings?.organizer_address
      ? settings.organizer_address.split("\n").map((l) => l.trim()).filter(Boolean)
      : ORGANIZER.addressLines,
    invoiceNumber: row.invoice_number,
    invoiceDate,
    billTo: {
      company: row.company,
      contact: row.contact_person || "",
      email: row.official_email,
      phone: row.phone,
    },
    lineItems,
    taxableValuePaise,
    taxLines,
    totalPaise: row.total_paise,
    payment: payment(row),
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

  page.drawText(content.organizerName, { x: left, y, size: 18, font: bold, color: dark });
  y -= 18;
  for (const line of content.organizerAddressLines) {
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
  if (content.mode === "gst" && content.hsnSac) {
    page.drawText(`HSN/SAC: ${content.hsnSac}`, { x: left, y, size: 10, font });
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

  if (content.taxLines.length > 0) {
    page.drawText("Taxable Value", { x: left, y, size: 10, font });
    page.drawText(inr(content.taxableValuePaise), { x: 470, y, size: 10, font });
    y -= 16;
    for (const t of content.taxLines) {
      page.drawText(t.label, { x: left, y, size: 10, font });
      page.drawText(inr(t.amountPaise), { x: 470, y, size: 10, font });
      y -= 16;
    }
    y -= 4;
  }

  page.drawText("Total", { x: left, y, size: 12, font: bold });
  page.drawText(inr(content.totalPaise), { x: 460, y, size: 12, font: bold });
  y -= 34;

  page.drawText("Payment Reference", { x: left, y, size: 10, font: bold, color: dark });
  y -= 14;
  page.drawText(`${content.payment.refLabel}: ${content.payment.id}`, { x: left, y, size: 9, font, color: gray });
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

async function fetchInvoiceSettings(): Promise<InvoiceSettings | null> {
  try {
    const res = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/rest/v1/invoice_settings?select=*&limit=1`,
      { headers: SB_HEADERS() }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] ?? null;
  } catch {
    return null;
  }
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

  const settings = await fetchInvoiceSettings();
  const content = buildInvoiceContent({ ...row, invoice_number: invoiceNumber! }, settings);
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
