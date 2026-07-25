import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  cancelRegistration,
  listRegistrations,
  markPaidOffline,
} from "../services/registrationAdminService";
import { RegistrationRow, RegistrationStatus } from "../types/badminton";
import { BADMINTON_CATEGORIES, CATEGORY_BY_CODE, formatINR } from "../constants/badminton";
import { exportCSV, exportExcel } from "../utils/exportRegistrations";
import PageLoader from "../component/PageLoader";
import useToast from "../hook/useToast";
import Toast from "../component/common/Toast";

type SortKey = "created_at" | "company" | "total_paise" | "status";
type SortDir = "asc" | "desc";

const STATUS_STYLES: Record<RegistrationStatus, string> = {
  PAID: "bg-lime-500/15 text-lime-700 dark:text-lime-400 ring-1 ring-lime-500/40",
  PENDING: "bg-amber-500/15 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/40",
  CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/30",
};

function StatusBadge({ status }: { status: RegistrationStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel p-4 text-center">
      <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}

export default function RegistrationsDashboard() {
  const [rows, setRows] = useState<RegistrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast, showToast } = useToast();

  // filters
  const [statusFilter, setStatusFilter] = useState<"ALL" | RegistrationStatus>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // sort
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // row interaction
  const [expanded, setExpanded] = useState<string | null>(null);
  const [payTarget, setPayTarget] = useState<RegistrationRow | null>(null);
  const [payRef, setPayRef] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setRows(await listRegistrations());
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const from = fromDate ? new Date(fromDate).getTime() : null;
    const to = toDate ? new Date(toDate).getTime() + 86_399_999 : null;
    let out = rows.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (categoryFilter !== "ALL" && !r.entries.some((e) => e.category === categoryFilter)) return false;
      if (from !== null && new Date(r.created_at).getTime() < from) return false;
      if (to !== null && new Date(r.created_at).getTime() > to) return false;
      if (q) {
        const hay = `${r.company} ${r.contact_person ?? ""} ${r.official_email} ${r.phone}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    out = [...out].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "created_at") cmp = a.created_at.localeCompare(b.created_at);
      else if (sortKey === "company") cmp = a.company.localeCompare(b.company);
      else if (sortKey === "total_paise") cmp = a.total_paise - b.total_paise;
      else cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return out;
  }, [rows, statusFilter, categoryFilter, search, fromDate, toDate, sortKey, sortDir]);

  const stats = useMemo(() => {
    const paid = rows.filter((r) => r.status === "PAID");
    return {
      total: rows.length,
      paid: paid.length,
      pending: rows.filter((r) => r.status === "PENDING").length,
      revenue: paid.reduce((s, r) => s + r.total_paise, 0),
    };
  }, [rows]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "created_at" ? "desc" : "asc");
    }
  }

  async function confirmMarkPaid() {
    if (!payTarget) return;
    if (payRef.trim().length < 3) {
      showToast("Enter the payment reference (NEFT/UTR no.)", "error");
      return;
    }
    try {
      setBusy(true);
      await markPaidOffline(payTarget.id, payRef.trim());
      setRows((prev) =>
        prev.map((r) =>
          r.id === payTarget.id
            ? { ...r, status: "PAID", payment_method: "offline", payment_note: payRef.trim(), paid_at: new Date().toISOString() }
            : r
        )
      );
      showToast("Marked as paid (offline).", "success");
      setPayTarget(null);
      setPayRef("");
    } catch (e) {
      console.error(e);
      showToast("Update failed. Try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function onCancel(row: RegistrationRow) {
    if (!window.confirm(`Cancel the registration from ${row.company}? This keeps the row for audit but removes it from the draw.`)) return;
    try {
      setBusy(true);
      await cancelRegistration(row.id);
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: "CANCELLED" } : r)));
      showToast("Registration cancelled.", "success");
    } catch (e) {
      console.error(e);
      showToast("Update failed. Try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  const arrow = (key: SortKey) => (sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "");

  if (loading) return <PageLoader variant="center" label="Loading registrations..." />;

  return (
    <div className="container mx-auto px-4 py-8 text-brand-charcoal dark:text-gray-200">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Badminton Registrations
        </h1>
        <div className="flex gap-2">
          <button onClick={() => exportCSV(filtered)} className="glass-button-secondary px-4 py-2 text-sm text-gray-800 dark:text-white">
            Export CSV
          </button>
          <button onClick={() => exportExcel(filtered)} className="glass-button-secondary px-4 py-2 text-sm text-gray-800 dark:text-white">
            Export Excel
          </button>
          <button onClick={load} className="glass-button-outline px-4 py-2 text-sm">
            Refresh
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatTile label="Total" value={String(stats.total)} />
        <StatTile label="Paid" value={String(stats.paid)} />
        <StatTile label="Pending" value={String(stats.pending)} />
        <StatTile label="Revenue (paid)" value={formatINR(stats.revenue)} />
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <input
          className="glass-input px-3 py-2 lg:col-span-2"
          placeholder="Search company / contact / email / phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="glass-input px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as never)}>
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select className="glass-input px-3 py-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="ALL">All categories</option>
          {BADMINTON_CATEGORIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input type="date" className="glass-input px-2 py-2 w-full" value={fromDate} onChange={(e) => setFromDate(e.target.value)} aria-label="From date" />
          <span className="text-gray-400">–</span>
          <input type="date" className="glass-input px-2 py-2 w-full" value={toDate} onChange={(e) => setToDate(e.target.value)} aria-label="To date" />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-black/10 dark:border-white/10">
              <th className="px-4 py-3 font-medium cursor-pointer select-none" onClick={() => toggleSort("created_at")}>
                Date{arrow("created_at")}
              </th>
              <th className="px-4 py-3 font-medium cursor-pointer select-none" onClick={() => toggleSort("company")}>
                Company{arrow("company")}
              </th>
              <th className="px-4 py-3 font-medium">Categories</th>
              <th className="px-4 py-3 font-medium cursor-pointer select-none text-right" onClick={() => toggleSort("total_paise")}>
                Total{arrow("total_paise")}
              </th>
              <th className="px-4 py-3 font-medium cursor-pointer select-none" onClick={() => toggleSort("status")}>
                Status{arrow("status")}
              </th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No registrations match the current filters.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <>
                <tr
                  key={r.id}
                  onClick={() => setExpanded((x) => (x === r.id ? null : r.id))}
                  className="border-b border-black/5 dark:border-white/5 hover:bg-black/[.03] dark:hover:bg-white/[.04] cursor-pointer"
                >
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white">{r.company}</p>
                    <p className="text-xs text-gray-500">{r.contact_person || r.official_email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 max-w-[220px] truncate">
                    {r.categories_summary || "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">{formatINR(r.total_paise)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                    <p className="text-[10px] text-gray-500 mt-0.5">{r.payment_method === "offline" ? "offline" : "razorpay"}</p>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    {r.status === "PENDING" && (
                      <button
                        disabled={busy}
                        onClick={() => { setPayTarget(r); setPayRef(""); }}
                        className="text-xs text-lime-700 dark:text-lime-400 hover:underline mr-3"
                      >
                        Mark Paid
                      </button>
                    )}
                    {r.status !== "CANCELLED" && (
                      <button disabled={busy} onClick={() => onCancel(r)} className="text-xs text-red-600 hover:underline">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
                <AnimatePresence initial={false}>
                  {expanded === r.id && (
                    <tr key={`${r.id}-detail`}>
                      <td colSpan={6} className="px-4 pb-4 pt-0 bg-black/[.02] dark:bg-white/[.03]">
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-xs">
                            <div className="space-y-1">
                              <p><span className="text-gray-500">Official email:</span> {r.official_email}</p>
                              <p><span className="text-gray-500">Phone:</span> {r.phone}</p>
                              {r.personal_email && <p><span className="text-gray-500">Personal email:</span> {r.personal_email}</p>}
                              <p><span className="text-gray-500">Order:</span> {r.order_id}</p>
                              {r.payment_id && <p><span className="text-gray-500">Payment:</span> {r.payment_id}</p>}
                              {r.payment_note && <p><span className="text-gray-500">Payment ref:</span> {r.payment_note}</p>}
                              {r.paid_at && <p><span className="text-gray-500">Paid at:</span> {new Date(r.paid_at).toLocaleString("en-IN")}</p>}
                            </div>
                            <div className="space-y-2">
                              {r.entries.map((e) => (
                                <div key={e.id} className="glass-panel-subtle p-2">
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {CATEGORY_BY_CODE[e.category]?.label ?? e.category}
                                    {e.teamName ? ` — ${e.teamName}` : ""}
                                  </p>
                                  {e.players.length > 0 && (
                                    <ul className="mt-1 space-y-0.5 text-gray-600 dark:text-gray-300">
                                      {e.players.map((p, i) => (
                                        <li key={i}>{p.name} · {p.phone} · {p.officialEmail}{p.designation ? ` · ${p.designation}` : ""}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Showing {filtered.length} of {rows.length} registrations. Click a row for full details.
      </p>

      {/* Mark Paid modal */}
      <AnimatePresence>
        {payTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => !busy && setPayTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="glass-panel-strong w-full max-w-md p-6 bg-white/90 dark:bg-brand-slate/95"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mark as Paid (offline)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {payTarget.company} — {formatINR(payTarget.total_paise)}
              </p>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mt-4 mb-1">
                Payment reference (NEFT / UTR / cheque no.)
              </label>
              <input
                autoFocus
                className="glass-input w-full px-3 py-2"
                placeholder="e.g. UTR N123456789012345"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
              />
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-5">
                <button
                  disabled={busy}
                  onClick={() => setPayTarget(null)}
                  className="glass-button-secondary px-5 py-2 text-gray-800 dark:text-white"
                >
                  Close
                </button>
                <button disabled={busy} onClick={confirmMarkPaid} className="glass-button-primary px-5 py-2">
                  {busy ? "Saving..." : "Confirm Paid"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
