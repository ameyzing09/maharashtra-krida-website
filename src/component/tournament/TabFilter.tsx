import { ReactNode, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

export type Tab = "live" | "upcoming" | "past";

// Not exported: both call sites render this component rather than their own
// copy of the pills, which is what let the two versions drift apart before.
const TABS: [Tab, string][] = [
  ["live", "Live"],
  ["upcoming", "Upcoming"],
  ["past", "Past"],
];

type Props = {
  value: Tab;
  onChange: (tab: Tab) => void;
  /** Extra item shown under a divider in the mobile menu — e.g. a link away
   *  from a preview section. Omitted on a page that is already the destination. */
  menuFooter?: ReactNode;
};

/**
 * The live/upcoming/past filter, in both the forms it needs to take.
 *
 * Above `sm` it is a pill group. Below it collapses to a single icon, because
 * a section heading already takes ~240px of a phone's ~330px and the pills
 * need ~215px more — left in one row they widen the document and the whole
 * page scrolls sideways.
 *
 * The disclosure uses the same max-height transition as the site header, so
 * there is no click-outside or focus-trap handling to get wrong.
 *
 * Both pages render this rather than their own copy: they had already drifted
 * once (`text-xs` here, `text-sm` there) before this existed.
 */
export default function TabFilter({ value, onChange, menuFooter }: Props) {
  const [open, setOpen] = useState(false);

  const select = (tab: Tab) => {
    onChange(tab);
    setOpen(false);
  };

  return (
    <>
      <div className="hidden glass-panel-subtle rounded-full p-1 sm:inline-flex">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`px-3 py-1.5 text-xs sm:text-sm rounded-full transition-all duration-200 ${
              value === key
                ? "glass-button-primary rounded-full"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="tournament-filter-menu"
        className="glass-panel-subtle ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:hidden"
      >
        <FontAwesomeIcon icon={faFilter} aria-hidden className="h-4 w-4" />
        <span className="sr-only">Filter tournaments</span>
      </button>

      {/* Full-width so it drops below the header row rather than beside it.
          Its spacing sits on the inner panel, inside the clipped box — a margin
          on this element would leave a gap in the row while closed. Callers
          pair this with `gap-x-*` rather than `gap-*` for the same reason. */}
      <div
        id="tournament-filter-menu"
        className={`w-full overflow-hidden transition-[max-height] duration-300 sm:hidden ${
          open ? "max-h-60" : "max-h-0"
        }`}
      >
        <div className="glass-panel-subtle mt-3 rounded-2xl p-2">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => select(key)}
              aria-current={value === key ? "true" : undefined}
              className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                value === key ? "glass-button-primary" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
          {menuFooter && (
            <>
              <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
              {menuFooter}
            </>
          )}
        </div>
      </div>
    </>
  );
}
