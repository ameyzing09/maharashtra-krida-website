import { Link } from "react-router-dom";
import LegalPage, { List, Section } from "./LegalPage";
import { ADDRESS_INLINE, ORGANISATION } from "../../constants/organisation";
import { BADMINTON_CATEGORIES, formatINR, TOURNAMENT } from "../../constants/badminton";

export default function Terms() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro={`The terms on which ${ORGANISATION.legalName} accepts registrations and runs its events.`}
    >
      <Section heading="Who you are contracting with">
        <p>
          This site is operated by <strong>{ORGANISATION.legalName}</strong>, {ADDRESS_INLINE}.
          Registering for an event, or using this site, means you accept these terms on behalf
          of the organisation you are registering.
        </p>
      </Section>

      <Section heading="Who can enter">
        <List
          items={[
            "Events are for corporate and institutional teams. Each entry is made by an organisation, not by an individual.",
            "Players entered under an organisation must be genuinely associated with it. We may ask for proof of employment or association at any point.",
            "The person registering confirms they are authorised to commit their organisation and to share the contact details of the players they enter.",
          ]}
        />
      </Section>

      <Section heading="Entry fees and confirmation">
        <p>
          Fees are quoted and charged in Indian Rupees, and are shown in full on the{" "}
          <Link to="/badminton" className="link-accent">
            registration page
          </Link>{" "}
          before you pay. For {TOURNAMENT.title} they are:
        </p>
        <List
          items={BADMINTON_CATEGORIES.map((c) => (
            <>
              {c.label} — <strong>{formatINR(c.fee)}</strong> {c.unit}
            </>
          ))}
        />
        <p>
          The amount payable is always calculated on our servers from the categories you
          select. A registration is <strong>confirmed only once the fee has been received</strong>;
          submitting the form alone does not reserve a place. Registrations close on{" "}
          {TOURNAMENT.lastRegistration}.
        </p>
        <p>
          Entry fees are non-refundable. See the{" "}
          <Link to="/refunds" className="link-accent">
            Refund &amp; Cancellation Policy
          </Link>
          .
        </p>
      </Section>

      <Section heading="Running the event">
        <p>
          {TOURNAMENT.title} is scheduled for {TOURNAMENT.playingDates} at {TOURNAMENT.venue},
          with {TOURNAMENT.reserveDates} held in reserve. We may:
        </p>
        <List
          items={[
            "set and change the format, draw, seeding and match schedule;",
            "move matches between the scheduled and reserve dates, or between courts and venues, including at short notice;",
            "appoint officials whose decisions on play are final;",
            "reject or disqualify an entry, without refund, where information given is false, a player is ineligible, or conduct falls below the standard below.",
          ]}
        />
        <p>
          Where we change something material, we will tell the registered contact person using
          the details supplied at registration.
        </p>
      </Section>

      <Section heading="Conduct">
        <p>
          Players and supporters are expected to compete fairly, follow the laws of the game,
          respect officials and other participants, and comply with venue rules. Abusive
          behaviour, intimidation, or any attempt to manipulate a result may lead to
          disqualification without refund.
        </p>
      </Section>

      <Section heading="Participation is at your own risk">
        <p>
          Sport carries a risk of injury. Each participant takes part at their own risk and
          confirms they are medically fit to do so. {ORGANISATION.legalName} is not liable for
          injury, illness, or loss of or damage to personal property at a venue, except where
          such liability cannot be excluded by law.
        </p>
        <p>
          Where our liability cannot be excluded, it is limited to the entry fee paid for the
          affected entry. We are not liable for indirect or consequential loss, including
          travel or accommodation costs booked around an event.
        </p>
      </Section>

      <Section heading="Photography and media">
        <p>
          We may photograph or film events and use the material to report on and promote our
          events. If you would prefer a specific individual not to appear, email us and we will
          make reasonable efforts to accommodate that.
        </p>
      </Section>

      <Section heading="Your information">
        <p>
          What we collect and why is set out in the{" "}
          <Link to="/privacy" className="link-accent">
            Privacy Policy
          </Link>
          . How your entry is delivered to you is set out in the{" "}
          <Link to="/shipping" className="link-accent">
            Shipping &amp; Delivery Policy
          </Link>
          .
        </p>
      </Section>

      <Section heading="Changes to these terms">
        <p>
          We may update these terms. The version in force for your entry is the one published
          when you registered, and the date it was last changed is shown at the top of this
          page.
        </p>
      </Section>

      <Section heading="Governing law">
        <p>
          These terms are governed by the laws of India. The courts at Pune, Maharashtra have
          exclusive jurisdiction over any dispute arising from them.
        </p>
      </Section>
    </LegalPage>
  );
}
