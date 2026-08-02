import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BadmintonRegistrationProvider } from "../context/BadmintonRegistrationProvider";
import { useBadmintonRegistration } from "../hook/useBadmintonRegistration";
import Progress from "../component/badminton/Progress";
import { MotionGrid, MotionItem } from "../component/common/motion";
import StepOrganization from "../component/badminton/StepOrganization";
import StepEntries from "../component/badminton/StepEntries";
import StepReview from "../component/badminton/StepReview";
import StepPayment from "../component/badminton/StepPayment";
import { BADMINTON_CATEGORIES, TOURNAMENT, formatINR } from "../constants/badminton";
import logo from "../assets/badminton-logo.jpg";

function Steps() {
  const { state } = useBadmintonRegistration();
  const reduceMotion = useReducedMotion();
  const steps = [
    <StepOrganization key="org" />,
    <StepEntries key="ent" />,
    <StepReview key="rev" />,
    <StepPayment key="pay" />,
  ];
  const anim = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, x: 32 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -32 },
        transition: { duration: 0.25, ease: "easeOut" as const },
      };
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={state.step} {...anim}>
        {steps[state.step]}
      </motion.div>
    </AnimatePresence>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel relative overflow-hidden px-4 py-3 text-center">
      <div aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400/0 via-orange-500/70 to-amber-400/0" />
      <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">{value}</p>
    </div>
  );
}

const BadmintonRegister = () => {
  return (
    <section className="text-slate-600 dark:text-slate-400">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center text-center"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <img
              src={logo}
              alt="Pune's Corporate Badminton Bash 2026"
              width={620}
              height={413}
              decoding="async"
              className="w-full max-w-[320px] h-auto rounded-2xl"
            />
          </div>
          <span className="glass-pill mt-5 px-4 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {TOURNAMENT.edition} · {TOURNAMENT.playingDates}
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 mt-3">
            {TOURNAMENT.title}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl">
            Pune's premier corporate badminton championship — six categories, knockout format, and a
            prize pool of {TOURNAMENT.prizePool}, {TOURNAMENT.prizePoolNote}. Register your
            organisation below.
          </p>
          <a href="#register" className="glass-button-primary mt-5 px-6 py-3">
            Register Now
          </a>
        </motion.div>

        {/* Quick facts */}
        <MotionGrid className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MotionItem><Fact label="Playing Dates" value={TOURNAMENT.playingDates} /></MotionItem>
          <MotionItem><Fact label="Venue" value="Nahata Sports Complex, Pune" /></MotionItem>
          <MotionItem><Fact label="Last Registration" value={TOURNAMENT.lastRegistration} /></MotionItem>
          <MotionItem><Fact label="Prize Pool" value={TOURNAMENT.prizePool} /></MotionItem>
        </MotionGrid>

        {/* Entry fees */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mt-10 glass-panel p-5 sm:p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Categories & Entry Fees</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 font-medium">Players</th>
                  <th className="py-2 font-medium text-right">Entry Fee</th>
                </tr>
              </thead>
              <tbody>
                {BADMINTON_CATEGORIES.map((c) => (
                  <tr key={c.code} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-slate-900 dark:text-slate-100">{c.label}</td>
                    <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-400">
                      {Array.isArray(c.players) ? `${c.players[0]}–${c.players[1]}` : c.players}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-slate-100">
                      {formatINR(c.fee)} <span className="text-slate-400 font-normal">{c.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            Team Event: 2 Singles + 1 Doubles, minimum 2 and maximum 4 players. Knockout format for all
            events. Entry fees are strictly non-refundable.
          </p>
        </motion.div>

        {/* Registration wizard */}
        <div id="register" className="mt-10 scroll-mt-20">
          <BadmintonRegistrationProvider>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              Registration
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Secure checkout powered by Razorpay.
            </p>
            <div className="mb-4 overflow-x-auto">
              <Progress />
            </div>
            <div className="glass-panel p-4 sm:p-6">
              <Steps />
            </div>
          </BadmintonRegistrationProvider>
        </div>

        {/* Contact */}
        <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          For registrations and queries, contact{" "}
          <span className="font-medium text-slate-900 dark:text-slate-100">{TOURNAMENT.contactName}</span> —{" "}
          <a href={`tel:${TOURNAMENT.contactPhone.replace(/\s/g, "")}`} className="link-accent">
            {TOURNAMENT.contactPhone}
          </a>
        </div>
      </div>
    </section>
  );
};

export default BadmintonRegister;
