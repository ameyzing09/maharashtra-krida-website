import { assertEquals } from "@std/assert";
import { buildInvoiceContent, InvoiceSettings, InvoiceSourceRow, renderInvoicePdf } from "./invoice.ts";

// Annotated rather than inferred so the fixture has to stay a valid row: if
// InvoiceSourceRow changes, this fails to compile instead of silently drifting.
const row: InvoiceSourceRow = {
  invoice_number: "MK-BADM-2026-000001",
  company: "Acme Technologies",
  contact_person: "Jane Doe",
  official_email: "jane@acme.com",
  phone: "9876543210",
  state: "Maharashtra",
  total_paise: 450000,
  entries: [
    {
      category: "womens_singles",
      players: [{ name: "Jane", phone: "9876543210", officialEmail: "jane@acme.com" }],
    },
    { category: "team_event", teamName: "Smashers", players: [] },
  ],
  payment_id: "pay_ABC123",
  payment_method: "razorpay",
  payment_note: null,
  order_id: "order_XYZ789",
  paid_at: "2026-08-01T10:30:00.000Z",
};

const gstSettings: InvoiceSettings = {
  gst_enabled: true,
  gstin: "27ABCDE1234F1Z5",
  hsn_sac_code: "998596",
  gst_rate_percent: 18,
  organizer_legal_name: "Maharashtra Krida Foundation",
  organizer_pan: "ABCDE1234F",
  organizer_state: "Maharashtra",
  organizer_address: "OM SAI Palace\nNarhe, Sinhagad Road\nPune 411 041",
};

Deno.test("no settings row defaults to receipt mode", () => {
  const content = buildInvoiceContent(row, null);
  assertEquals(content.mode, "receipt");
  assertEquals(content.taxLines, []);
  assertEquals(content.taxableValuePaise, row.total_paise);
});

Deno.test("gst_enabled: false stays in receipt mode even with other fields set", () => {
  const content = buildInvoiceContent(row, { ...gstSettings, gst_enabled: false });
  assertEquals(content.mode, "receipt");
  assertEquals(content.taxLines, []);
});

Deno.test("same-state registrant splits into CGST + SGST summing to the exact tax", () => {
  const content = buildInvoiceContent(row, gstSettings); // both Maharashtra
  assertEquals(content.mode, "gst");
  assertEquals(content.taxLines.length, 2);
  assertEquals(content.taxLines[0].label, "CGST @ 9%");
  assertEquals(content.taxLines[1].label, "SGST @ 9%");
  const taxSum = content.taxLines.reduce((s, t) => s + t.amountPaise, 0);
  assertEquals(content.taxableValuePaise + taxSum, content.totalPaise);
});

Deno.test("different-state registrant gets a single IGST line", () => {
  const content = buildInvoiceContent({ ...row, state: "Karnataka" }, gstSettings);
  assertEquals(content.taxLines.length, 1);
  assertEquals(content.taxLines[0].label, "IGST @ 18%");
  assertEquals(content.taxableValuePaise + content.taxLines[0].amountPaise, content.totalPaise);
});

Deno.test("unknown registrant state defaults to IGST, not a crash", () => {
  const content = buildInvoiceContent({ ...row, state: null }, gstSettings);
  assertEquals(content.taxLines.length, 1);
  assertEquals(content.taxLines[0].label, "IGST @ 18%");
});

Deno.test("gst_enabled with no rate configured skips tax lines gracefully", () => {
  const content = buildInvoiceContent(row, { ...gstSettings, gst_rate_percent: null });
  assertEquals(content.mode, "gst"); // still shows GSTIN/title, just no computed tax
  assertEquals(content.taxLines, []);
  assertEquals(content.taxableValuePaise, row.total_paise);
});

Deno.test("razorpay row shows the payment id and Razorpay method", () => {
  const content = buildInvoiceContent(row, null);
  assertEquals(content.payment.refLabel, "Payment ID");
  assertEquals(content.payment.id, "pay_ABC123");
  assertEquals(content.payment.method, "Razorpay");
});

Deno.test("offline row shows the NEFT reference (payment_note), not a blank Razorpay id", () => {
  const offline = { ...row, payment_method: "offline", payment_id: null, payment_note: "UTR N999888777" };
  const content = buildInvoiceContent(offline, null);
  assertEquals(content.payment.method, "Bank Transfer (Offline)");
  assertEquals(content.payment.refLabel, "Payment Ref");
  assertEquals(content.payment.id, "UTR N999888777");
  assertEquals(content.payment.orderId, "order_XYZ789");
});

Deno.test("total never changes based on GST mode — only the breakdown does", () => {
  const receipt = buildInvoiceContent(row, null);
  const gst = buildInvoiceContent(row, gstSettings);
  assertEquals(receipt.totalPaise, row.total_paise);
  assertEquals(gst.totalPaise, row.total_paise);
});

Deno.test("organizer name/address fall back to defaults when settings don't override them", () => {
  const content = buildInvoiceContent(row, { ...gstSettings, organizer_legal_name: null, organizer_address: null });
  assertEquals(content.organizerName, "Maharashtra Krida");
  assertEquals(content.organizerAddressLines, ["OM SAI Palace", "Narhe, Sinhagad Road", "Pune 411 041"]);
});

Deno.test("organizer settings override the defaults when provided", () => {
  const content = buildInvoiceContent(row, gstSettings);
  assertEquals(content.organizerName, "Maharashtra Krida Foundation");
  assertEquals(content.organizerAddressLines, ["OM SAI Palace", "Narhe, Sinhagad Road", "Pune 411 041"]);
});

Deno.test("renderInvoicePdf produces a well-formed PDF in receipt mode", async () => {
  const content = buildInvoiceContent(row, null);
  const bytes = await renderInvoicePdf(content, null);
  assertEquals(new TextDecoder().decode(bytes.slice(0, 5)), "%PDF-");
});

Deno.test("renderInvoicePdf produces a well-formed PDF in GST mode with tax lines", async () => {
  const content = buildInvoiceContent(row, gstSettings);
  const bytes = await renderInvoicePdf(content, null);
  assertEquals(new TextDecoder().decode(bytes.slice(0, 5)), "%PDF-");
});

Deno.test("renderInvoicePdf tolerates garbage logo bytes instead of throwing", async () => {
  const content = buildInvoiceContent(row, null);
  const bytes = await renderInvoicePdf(content, new Uint8Array([1, 2, 3, 4]));
  assertEquals(new TextDecoder().decode(bytes.slice(0, 5)), "%PDF-");
});
