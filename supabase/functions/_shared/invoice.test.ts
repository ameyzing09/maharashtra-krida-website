import { assertEquals } from "@std/assert";
import { buildInvoiceContent, renderInvoicePdf } from "./invoice.ts";

const row = {
  invoice_number: "MK-BADM-2026-000001",
  company: "Acme Technologies",
  contact_person: "Jane Doe",
  official_email: "jane@acme.com",
  phone: "9876543210",
  total_paise: 450000,
  entries: [
    { category: "womens_singles", players: [{ name: "Jane" }] },
    { category: "team_event", teamName: "Smashers", players: [] },
  ],
  payment_id: "pay_ABC123",
  order_id: "order_XYZ789",
  paid_at: "2026-08-01T10:30:00.000Z",
};

Deno.test("defaults to receipt mode without a GSTIN", () => {
  const content = buildInvoiceContent(row);
  assertEquals(content.mode, "receipt");
  assertEquals(content.gstin, undefined);
});

Deno.test("switches to gst mode when a GSTIN is supplied", () => {
  const content = buildInvoiceContent(row, "27ABCDE1234F1Z5");
  assertEquals(content.mode, "gst");
  assertEquals(content.gstin, "27ABCDE1234F1Z5");
});

Deno.test("line items reflect category label, team name, and server fee", () => {
  const content = buildInvoiceContent(row);
  assertEquals(content.lineItems, [
    { label: "Women's Singles", amountPaise: 150000 },
    { label: "Corporate Team Event — Smashers", amountPaise: 500000 },
  ]);
});

Deno.test("bill-to and payment reference carry through from the row", () => {
  const content = buildInvoiceContent(row);
  assertEquals(content.billTo, {
    company: "Acme Technologies",
    contact: "Jane Doe",
    email: "jane@acme.com",
    phone: "9876543210",
  });
  assertEquals(content.payment, { id: "pay_ABC123", orderId: "order_XYZ789", method: "Razorpay" });
  assertEquals(content.totalPaise, 450000);
});

Deno.test("missing contact_person renders as empty string, not a crash", () => {
  const content = buildInvoiceContent({ ...row, contact_person: null });
  assertEquals(content.billTo.contact, "");
});

Deno.test("renderInvoicePdf produces a well-formed PDF without a logo", async () => {
  const content = buildInvoiceContent(row);
  const bytes = await renderInvoicePdf(content, null);
  const header = new TextDecoder().decode(bytes.slice(0, 5));
  assertEquals(header, "%PDF-");
});

Deno.test("renderInvoicePdf tolerates garbage logo bytes instead of throwing", async () => {
  const content = buildInvoiceContent(row);
  const bytes = await renderInvoicePdf(content, new Uint8Array([1, 2, 3, 4]));
  const header = new TextDecoder().decode(bytes.slice(0, 5));
  assertEquals(header, "%PDF-");
});
