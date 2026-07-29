// Who we are, in one place.
//
// These details appear in the footer, on /contact, and across the four policy
// pages that Razorpay's merchant verification checks. They were previously
// hardcoded per-file, which is how the footer ended up advertising a
// placeholder phone number that contradicted /contact — exactly the kind of
// inconsistency that gets a merchant application sent back.
//
// Mirrored server-side by ORGANIZER in supabase/functions/_shared/invoice.ts,
// which stamps the invoice PDF. Deno and Vite cannot share a module, so the two
// have to be edited together — same contract as the fee tables.

export const ORGANISATION = {
  legalName: "Maharashtra Krida",
  addressLines: ["OM SAI Palace", "Narhe, Sinhagad Road", "Pune 411 041"],
  contactName: "Ashwin Panhalkar",
  phone: "+91 9890 171 195",
  phoneHref: "tel:+919890171195",
  email: "maharashtrakrida@gmail.com",
  /** Shown on every policy page. Bump when the policy text materially changes. */
  policiesLastUpdated: "29 July 2026",
} as const;

/** "OM SAI Palace, Narhe, Sinhagad Road, Pune 411 041" — for inline prose. */
export const ADDRESS_INLINE = ORGANISATION.addressLines.join(", ");
