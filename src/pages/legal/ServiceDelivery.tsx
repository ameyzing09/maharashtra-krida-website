import { Link } from "react-router-dom";
import LegalPage, { List, Section } from "./LegalPage";
import { ORGANISATION } from "../../constants/organisation";
import { TOURNAMENT } from "../../constants/badminton";

// Razorpay's merchant checklist asks for a "Shipping & Delivery Policy" even
// for service businesses, so the page keeps that title. The content is honest
// that nothing is physically shipped and describes what is actually delivered.

export default function ServiceDelivery() {
  return (
    <LegalPage
      title="Shipping & Delivery Policy"
      intro={`${ORGANISATION.legalName} sells event registrations, not physical goods. This page explains what you receive when you pay, and when.`}
    >
      <Section heading="Nothing is shipped">
        <p>
          We do not sell or dispatch any physical product, and no shipping charges are ever
          applied. What you buy is a <strong>place in a tournament</strong>, delivered
          electronically and fulfilled by our running the event.
        </p>
      </Section>

      <Section heading="What you receive, and when">
        <List
          items={[
            <>
              <strong>Immediately on successful payment</strong> — an on-screen confirmation
              showing your order reference, the categories entered and the amount paid.
            </>,
            <>
              <strong>Within a few moments</strong> — a GST-compliant invoice, downloadable
              from the confirmation screen. If it is still generating, the page will keep
              checking; you can also retrieve it later from the registration status page.
            </>,
            <>
              <strong>Before the Captains' Meeting</strong> — the draw, match schedule and
              venue details, sent to the contact person's email address.
            </>,
            <>
              <strong>On the playing dates</strong> — the event itself.
            </>,
          ]}
        />
      </Section>

      <Section heading="Registrations paid offline">
        <p>
          If your organisation chooses to pay by bank transfer or UPI instead of the online
          checkout, you receive an <code>MKB-</code> reference code straight away and your
          place is held as pending. Delivery is confirmed once we have matched the payment,
          normally within 1–2 business days of it reaching us. Quote the reference code with
          your transfer so we can match it.
        </p>
      </Section>

      <Section heading="Where and when the event takes place">
        <List
          items={[
            <>
              <strong>Event</strong> — {TOURNAMENT.title} ({TOURNAMENT.edition})
            </>,
            <>
              <strong>Venue</strong> — {TOURNAMENT.venue}
            </>,
            <>
              <strong>Playing dates</strong> — {TOURNAMENT.playingDates}
            </>,
            <>
              <strong>Reserve dates</strong> — {TOURNAMENT.reserveDates}
            </>,
            <>
              <strong>Registrations close</strong> — {TOURNAMENT.lastRegistration}
            </>,
          ]}
        />
        <p>
          Schedules and venues can change; we notify the registered contact person when they
          do. See the{" "}
          <Link to="/terms" className="text-slate-900 dark:text-slate-100 font-medium underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500 dark:decoration-slate-600 dark:hover:decoration-slate-400">
            Terms &amp; Conditions
          </Link>
          .
        </p>
      </Section>

      <Section heading="If your confirmation does not arrive">
        <p>
          If payment left your account but you did not see a confirmation, do not pay again.
          Check the{" "}
          <Link
            to="/registration/status"
            className="text-slate-900 dark:text-slate-100 font-medium underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500 dark:decoration-slate-600 dark:hover:decoration-slate-400"
          >
            registration status page
          </Link>{" "}
          first, then email{" "}
          <a
            href={`mailto:${ORGANISATION.email}`}
            className="text-slate-900 dark:text-slate-100 font-medium underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500 dark:decoration-slate-600 dark:hover:decoration-slate-400"
          >
            {ORGANISATION.email}
          </a>{" "}
          with your order id or reference code. We will confirm the position within 1–2
          business days.
        </p>
        <p>
          Refunds are governed by the{" "}
          <Link to="/refunds" className="text-slate-900 dark:text-slate-100 font-medium underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500 dark:decoration-slate-600 dark:hover:decoration-slate-400">
            Refund &amp; Cancellation Policy
          </Link>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
