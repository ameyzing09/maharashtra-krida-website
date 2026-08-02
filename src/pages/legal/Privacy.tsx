import { Link } from "react-router-dom";
import LegalPage, { List, Section } from "./LegalPage";
import { ADDRESS_INLINE, ORGANISATION } from "../../constants/organisation";

// Deliberately describes what this site actually does, field by field, rather
// than generic boilerplate: the registration form's fields, Razorpay for
// payments, Supabase for storage, and the specific browser storage keys used.

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`What ${ORGANISATION.legalName} collects when you register for an event, why, and what we do with it.`}
    >
      <Section heading="Who is responsible">
        <p>
          <strong>{ORGANISATION.legalName}</strong>, {ADDRESS_INLINE}, decides how and why the
          information described here is used. Contact details are at the bottom of this page.
        </p>
      </Section>

      <Section heading="What we collect">
        <p>When an organisation registers, the form asks for:</p>
        <List
          items={[
            <>
              <strong>About the organisation</strong> — company name, contact person's name,
              official email address, phone number, and optionally a personal email address and
              the state you are registering from.
            </>,
            <>
              <strong>About each player entered</strong> — name, phone number, official email
              address, and optionally a personal email address and designation or employee id.
            </>,
            <>
              <strong>About the entry</strong> — the categories chosen, team names, and the
              amount payable.
            </>,
          ]}
        />
        <p>
          If you enter other people as players, you confirm you are entitled to give us their
          details for this purpose and that they know you have.
        </p>
      </Section>

      <Section heading="Payment details — what we never see">
        <p>
          Payments are processed by <strong>Razorpay</strong>, a payment gateway regulated in
          India. When you pay, you enter your card, UPI, netbanking or wallet details directly
          into Razorpay's secure checkout.
        </p>
        <p>
          <strong>
            Those details never reach our servers and we never store them.
          </strong>{" "}
          What we receive back is limited to an order reference, a payment identifier, the
          amount, and whether the payment succeeded. Razorpay handles your payment information
          under its own privacy policy.
        </p>
      </Section>

      <Section heading="Why we use it">
        <List
          items={[
            "To process your registration, confirm your entry and take payment for it.",
            "To produce and store your invoice, including any GST details required by law.",
            "To contact you about the event you registered for — schedules, draws, venue changes and the Captains' Meeting.",
            "To verify eligibility, resolve disputes and keep an accurate record of entries.",
            "To meet accounting, tax and other legal obligations.",
          ]}
        />
        <p>
          We do not sell your information, and we do not use it for unrelated marketing.
        </p>
      </Section>

      <Section heading="Where it is held">
        <p>
          Registration records and invoices are held in our Supabase project, hosted in India
          (Mumbai region). Access is restricted to administrators of{" "}
          {ORGANISATION.legalName} who need it to run events.
        </p>
      </Section>

      <Section heading="Who else sees it">
        <List
          items={[
            "Razorpay, to take payment and issue any refund.",
            "Supabase, as the hosting provider that stores the records on our behalf.",
            "Anyone we are legally required to disclose it to, such as a tax authority or a court.",
          ]}
        />
        <p>
          Names and team names of entered players appear in published draws, schedules and
          results — that is inherent to running a tournament.
        </p>
      </Section>

      <Section heading="How long we keep it">
        <p>
          Registration and invoice records are kept for as long as needed to run the event and
          then for the period required by Indian tax and accounting rules. After that they are
          deleted or anonymised.
        </p>
      </Section>

      <Section heading="Storage in your browser">
        <p>
          This site does not use advertising or tracking cookies. It stores a small amount of
          data in your own browser:
        </p>
        <List
          items={[
            "an in-progress registration draft, so a failed payment or a refresh does not lose what you typed;",
            "your light or dark theme preference;",
            "a payment result passed to the confirmation screen immediately after checkout;",
            "for administrators only, a session that keeps you signed in.",
          ]}
        />
        <p>Clearing your browser storage removes all of these.</p>
      </Section>

      <Section heading="Your choices">
        <p>
          Email{" "}
          <a
            href={`mailto:${ORGANISATION.email}`}
            className="text-slate-900 dark:text-slate-100 font-medium underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500 dark:decoration-slate-600 dark:hover:decoration-slate-400"
          >
            {ORGANISATION.email}
          </a>{" "}
          to ask for a copy of what we hold about you, to have something corrected, or to have
          it deleted. Write from the official email address used to register, and quote your
          order id or <code>MKB-</code> reference so we can find the record.
        </p>
        <p>
          We may need to keep information required for tax or legal reasons even after a
          deletion request, and we cannot remove a completed entry from the historical record
          of an event that has already been played.
        </p>
      </Section>

      <Section heading="Changes">
        <p>
          We may update this policy; the date it was last changed is shown at the top of this
          page. See also our{" "}
          <Link to="/terms" className="text-slate-900 dark:text-slate-100 font-medium underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500 dark:decoration-slate-600 dark:hover:decoration-slate-400">
            Terms &amp; Conditions
          </Link>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
