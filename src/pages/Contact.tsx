import React from "react";

const Contact: React.FC = () => {
  return (
    <section className="bg-brand-paper dark:bg-brand-charcoal text-brand-charcoal dark:text-gray-200">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="max-w-3xl mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-brand-charcoal dark:text-white">Contact Us</h1>
          <p className="mt-3 text-gray-700 dark:text-gray-300 text-base sm:text-lg">We’d love to hear from you. Reach out for partnerships, event participation or general queries.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="glass-panel p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Address</h2>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              OM SAI Palace,
              <br /> Narhe, Sinhagad Road,
              <br /> Pune 411 041
            </p>
          </div>

          <div className="glass-panel p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Call</h2>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Contact Person: <span className="font-medium">Ashwin Panhalkar</span>
            </p>
            <a href="tel:+919890171195" className="mt-1 inline-block text-sm text-lime-600 dark:text-lime-400 hover:underline">+91 9890 171 195</a>
          </div>

          <div className="glass-panel p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Email</h2>
            <a href="mailto:maharashtrakrida@gmail.com" className="mt-2 inline-block text-sm text-lime-600 dark:text-lime-400 hover:underline">maharashtrakrida@gmail.com</a>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">We usually respond within 1–2 business days.</p>
          </div>
        </div>

        <div className="mt-8 glass-panel p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Send us a message</h2>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">Prefer email? Fill this out and your mail client will open with pre-filled details.</p>
          <form
            className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget as HTMLFormElement);
              const rawName = String(fd.get("name") || "");
              const subj = encodeURIComponent(String(fd.get("subject") || "Inquiry"));
              const body = encodeURIComponent(String(fd.get("message") || ""));
              const footer = rawName ? `%0D%0A%0D%0ARegards,%20${encodeURIComponent(rawName)}` : "";
              window.location.href = `mailto:maharashtrakrida@gmail.com?subject=${subj}&body=${body}${footer}`;
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
    </section>
  );
};

export default Contact;

