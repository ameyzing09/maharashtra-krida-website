import { Link } from "react-router-dom";
import LegalPage, { List, Section } from "./LegalPage";
import { ORGANISATION } from "../../constants/organisation";
import { TOURNAMENT } from "../../constants/badminton";

// Wording here must stay consistent with the acknowledgement registrants tick at
// checkout (component/badminton/StepReview.tsx) — both say fees are strictly
// non-refundable and entries non-transferable.

export default function Refunds() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      intro={`How entry fees are treated once paid, for events organised by ${ORGANISATION.legalName}.`}
    >
      <Section heading="Entry fees are non-refundable">
        <p>
          Entry fees are <strong>strictly non-refundable</strong> once paid. Registration
          confirms a place in the draw, and costs such as court hire, shuttles, officials and
          prizes are committed well in advance on the basis of confirmed entries.
        </p>
        <p>
          You are asked to confirm this before paying — the review step of the registration
          form requires you to acknowledge it explicitly.
        </p>
      </Section>

      <Section heading="Entries cannot be cancelled or transferred">
        <List
          items={[
            "A confirmed entry cannot be cancelled for a refund.",
            "An entry cannot be transferred to another organisation, another category, or a future edition of the tournament.",
            "Replacing a named player within your own entry is permitted up to the Captains' Meeting, at no charge. This is a change of roster, not a transfer of entry.",
          ]}
        />
      </Section>

      <Section heading="When we do refund you">
        <p>
          If <strong>{ORGANISATION.legalName} cancels or abandons the event</strong> and it is
          not played on either the scheduled dates ({TOURNAMENT.playingDates}) or the reserve
          dates ({TOURNAMENT.reserveDates}), you receive a{" "}
          <strong>full refund of your entry fee</strong>.
        </p>
        <p>
          A change of venue, schedule, format or draw is not a cancellation, and does not
          create a right to a refund. Nor does a walkover, a withdrawal, a no-show, or
          disqualification for breach of the{" "}
          <Link to="/terms" className="link-accent">
            tournament terms
          </Link>
          .
        </p>
        <p>
          If a refund is due for any other reason, it is at our discretion and we will tell you
          in writing.
        </p>
      </Section>

      <Section heading="How a refund reaches you">
        <List
          items={[
            "Refunds are issued to the original payment method through Razorpay, our payment gateway. We cannot redirect a refund to a different card, account or UPI ID.",
            "We initiate the refund within 5–7 working days of confirming it.",
            "Once initiated, your bank or card issuer typically takes a further 5–10 working days to credit it. That leg is outside our control.",
            "Refunds are made in Indian Rupees for the amount paid. Any bank charges or exchange differences on your side are not reimbursed.",
          ]}
        />
      </Section>

      <Section heading="Payments taken offline">
        <p>
          Where an organisation pays by bank transfer or UPI rather than through the online
          checkout, the same policy applies from the point the payment reaches us and the
          registration is confirmed against its <code>MKB-</code> reference code.
        </p>
      </Section>

      <Section heading="Raising a refund query">
        <p>
          Email{" "}
          <a
            href={`mailto:${ORGANISATION.email}`}
            className="link-accent"
          >
            {ORGANISATION.email}
          </a>{" "}
          from the official email address used to register, quoting your{" "}
          <strong>order id or {`MKB-`} reference code</strong> and the registered organisation
          name. Both appear on your confirmation screen and on your invoice.
        </p>
        <p>
          We aim to acknowledge within 1–2 business days and to resolve within 7 working days.
        </p>
      </Section>
    </LegalPage>
  );
}
