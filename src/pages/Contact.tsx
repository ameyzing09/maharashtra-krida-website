import React from "react";
import { ORGANISATION } from "../constants/organisation";
import { MotionSection, MotionGrid, MotionItem } from "../component/common/motion";

type ContactProps = {
  /* When rendered inside another page (e.g. Home), demote the page heading to
     an h2 so the document keeps a single h1. */
  embedded?: boolean;
};

const Contact: React.FC<ContactProps> = ({ embedded = false }) => {
  const Heading = embedded ? "h2" : "h1";
  return (
    <MotionSection>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="max-w-3xl mb-8">
          <Heading className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100"><span aria-hidden className="mr-3 inline-block h-7 w-1.5 -mb-0.5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600" />Contact Us</Heading>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-base sm:text-lg">We’d love to hear from you. Reach out for partnerships, event participation or general queries.</p>
        </div>

        <MotionGrid className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
          <MotionItem className="glass-panel p-5 sm:p-6 group relative overflow-hidden hover:border-orange-200 dark:hover:border-orange-400/30 hover:shadow-md">
            <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Address</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {ORGANISATION.addressLines.map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </p>
          </MotionItem>

          <MotionItem className="glass-panel p-5 sm:p-6 group relative overflow-hidden hover:border-orange-200 dark:hover:border-orange-400/30 hover:shadow-md">
            <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Call</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Contact Person: <span className="font-medium">{ORGANISATION.contactName}</span>
            </p>
            <a href={ORGANISATION.phoneHref} className="mt-1 inline-block text-sm link-accent">{ORGANISATION.phone}</a>
          </MotionItem>

          <MotionItem className="glass-panel p-5 sm:p-6 group relative overflow-hidden hover:border-orange-200 dark:hover:border-orange-400/30 hover:shadow-md">
            <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Email</h3>
            <a href={`mailto:${ORGANISATION.email}`} className="mt-2 inline-block text-sm link-accent">{ORGANISATION.email}</a>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">We usually respond within 1–2 business days.</p>
          </MotionItem>
        </MotionGrid>

        <div className="mt-4 sm:mt-5 glass-panel p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Send us a message</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Prefer email? Fill this out and your mail client will open with pre-filled details.</p>
          <form
            className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget as HTMLFormElement);
              const rawName = String(fd.get("name") || "");
              const subj = encodeURIComponent(String(fd.get("subject") || "Inquiry"));
              const body = encodeURIComponent(String(fd.get("message") || ""));
              const footer = rawName ? `%0D%0A%0D%0ARegards,%20${encodeURIComponent(rawName)}` : "";
              window.location.href = `mailto:${ORGANISATION.email}?subject=${subj}&body=${body}${footer}`;
              (e.currentTarget as HTMLFormElement).reset();
            }}
          >
            <input name="name" placeholder="Your name" className="glass-input px-3 py-2 text-sm" />
            <input name="subject" placeholder="Subject" className="glass-input px-3 py-2 text-sm" />
            <textarea name="message" placeholder="Message" className="sm:col-span-2 min-h-[120px] glass-input px-3 py-2 text-sm" />
            <div className="sm:col-span-2 flex justify-end gap-2">
              <button type="submit" className="glass-button-primary px-5 py-2">Open Email</button>
              <a href="/upcoming-events" className="glass-button-outline px-5 py-2">View Events</a>
            </div>
          </form>
        </div>
      </div>
    </MotionSection>
  );
};

export default Contact;

