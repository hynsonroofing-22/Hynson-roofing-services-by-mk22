import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, LogOut, Download, Trash2, RefreshCw, Lock } from "lucide-react";
import { API_URL } from "../data/content";

const STATUSES = ["new", "contacted", "quoted", "closed"];
const STATUS_COLORS = {
  new: "text-brand border-brand/40 bg-brand/10",
  contacted: "text-amber-700 border-amber-500/40 bg-amber-500/10",
  quoted: "text-sky-700 border-sky-500/40 bg-sky-500/10",
  closed: "text-emerald-700 border-emerald-500/40 bg-emerald-500/10",
};

function formatApiError(detail) {
  if (detail == null) return "Something went wrong.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e?.msg || JSON.stringify(e)).join(" ");
  return String(detail);
}

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("hynson_admin_token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [enquiries, setEnquiries] = useState([]);
  const [filter, setFilter] = useState("all");

  const fetchEnquiries = useCallback(async (t) => {
    const res = await fetch(`${API_URL}/enquiries`, { headers: { Authorization: `Bearer ${t}` } });
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("hynson_admin_token");
      setToken("");
      return;
    }
    setEnquiries(await res.json());
  }, []);

  useEffect(() => {
    if (token) fetchEnquiries(token);
  }, [token, fetchEnquiries]);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(formatApiError(data.detail));
      localStorage.setItem("hynson_admin_token", data.access_token);
      setToken(data.access_token);
      toast.success("Welcome back.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("hynson_admin_token");
    setToken("");
  };

  const updateStatus = async (id, status) => {
    const res = await fetch(`${API_URL}/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setEnquiries((prev) => prev.map((e) => (e.id === id ? updated : e)));
      toast.success(`Marked as ${status}`);
    }
  };

  const remove = async (id) => {
    const res = await fetch(`${API_URL}/enquiries/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Enquiry deleted");
    }
  };

  const exportCsv = () => {
    const rows = [["Name", "Email", "Phone", "Address", "Area", "Service", "Estimate", "Status", "Date", "Details"]];
    enquiries.forEach((e) =>
      rows.push([e.name, e.email, e.phone, e.address, e.region, e.service, e.estimate, e.status, e.created_at, (e.message || "").replace(/\n/g, " ")])
    );
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "hynson-enquiries.csv";
    a.click();
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 px-5" data-testid="admin-login-page">
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={login}
          className="w-full max-w-sm border border-ink-700/40 bg-white p-8"
          data-testid="admin-login-form"
        >
          <span className="flex h-11 w-11 items-center justify-center bg-brand warm-glow"><Lock className="h-5 w-5 text-white" /></span>
          <h1 className="mt-5 font-display text-2xl font-bold uppercase text-zinc-50">Hynson Admin</h1>
          <p className="mt-1 text-xs text-zinc-500">Enquiry pipeline access — authorised staff only.</p>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@hynsonroofing.co.nz"
            className="mt-6 w-full border border-ink-700/40 bg-ink-850 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-brand"
            data-testid="admin-email-input"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="mt-3 w-full border border-ink-700/40 bg-ink-850 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-brand"
            data-testid="admin-password-input"
          />
          {error && <p className="mt-3 text-xs text-brand" data-testid="admin-login-error">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-lift mt-6 w-full bg-brand py-3 font-mono text-xs font-semibold tracking-[0.25em] text-white uppercase hover:bg-brand-bright disabled:opacity-60"
            data-testid="admin-login-btn"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <Link to="/" className="mt-4 block text-center font-mono text-[10px] tracking-[0.2em] text-zinc-600 uppercase hover:text-zinc-300" data-testid="admin-back-link">
            ← Back to site
          </Link>
        </motion.form>
      </div>
    );
  }

  const visible = filter === "all" ? enquiries : enquiries.filter((e) => e.status === filter);
  const stats = {
    total: enquiries.length,
    new: enquiries.filter((e) => e.status === "new").length,
    quoted: enquiries.filter((e) => e.status === "quoted").length,
    closed: enquiries.filter((e) => e.status === "closed").length,
  };

  return (
    <div className="min-h-screen bg-ink-950" data-testid="admin-dashboard-container">
      <header className="glass sticky top-0 z-40 border-b border-ink-700/30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-zinc-500 hover:text-zinc-200" data-testid="admin-home-link"><ArrowLeft className="h-5 w-5" /></Link>
            <h1 className="font-display text-lg font-bold uppercase text-zinc-50">Enquiry <span className="text-brand">Pipeline</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => fetchEnquiries(token)} className="btn-lift border border-ink-700/50 bg-white p-2.5 text-zinc-400 hover:border-brand" data-testid="admin-refresh-btn" aria-label="Refresh">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button onClick={exportCsv} className="btn-lift flex items-center gap-2 border border-ink-700/50 bg-white px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] text-zinc-300 uppercase hover:border-brand" data-testid="admin-export-btn">
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
            <button onClick={logout} className="btn-lift flex items-center gap-2 bg-brand px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] text-white uppercase hover:bg-brand-bright" data-testid="admin-logout-btn">
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid grid-cols-2 gap-px overflow-hidden bg-ink-700/30 sm:grid-cols-4" data-testid="admin-stats">
          {[["Total", stats.total], ["New", stats.new], ["Quoted", stats.quoted], ["Closed", stats.closed]].map(([label, val]) => (
            <div key={label} className="bg-white p-5">
              <p className="font-display text-3xl font-extrabold text-zinc-50">{val}</p>
              <p className="mt-1 font-mono text-[10px] tracking-[0.25em] text-zinc-500 uppercase">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2" data-testid="admin-filters">
          {["all", ...STATUSES].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn-lift rounded-full border px-4 py-2 font-mono text-[10px] tracking-[0.2em] uppercase ${filter === f ? "border-brand bg-brand text-white" : "border-ink-700/50 bg-white text-zinc-400 hover:border-brand"}`}
              data-testid={`admin-filter-${f}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3" data-testid="admin-enquiry-list">
          {visible.length === 0 && (
            <p className="border border-ink-700/40 bg-white p-10 text-center text-sm text-zinc-500" data-testid="admin-empty-state">
              No enquiries here yet.
            </p>
          )}
          {visible.map((e) => (
            <div key={e.id} className="border border-ink-700/40 bg-white p-5 sm:p-6" data-testid={`admin-enquiry-${e.id}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-display text-base font-bold text-zinc-50">{e.name}</p>
                    <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] uppercase ${STATUS_COLORS[e.status] || STATUS_COLORS.new}`} data-testid={`admin-status-${e.id}`}>
                      {e.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {e.email} · {e.phone || "no phone"} · {e.region}{e.address ? ` · ${e.address}` : ""}
                  </p>
                </div>
                <p className="font-mono text-[10px] text-zinc-600">{new Date(e.created_at).toLocaleString("en-NZ")}</p>
              </div>
              <p className="mt-3 text-sm text-zinc-300"><span className="font-semibold text-brand">{e.service}</span>{e.estimate ? ` — ${e.estimate}` : ""}</p>
              {e.message && <p className="mt-2 border-l-2 border-ink-700/40 pl-3 text-sm text-zinc-400">{e.message}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <select
                  value={e.status}
                  onChange={(ev) => updateStatus(e.id, ev.target.value)}
                  className="border border-ink-700/50 bg-ink-850 px-3 py-2 font-mono text-[10px] tracking-[0.15em] text-zinc-300 uppercase outline-none"
                  data-testid={`admin-status-select-${e.id}`}
                >
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <a href={`mailto:${e.email}`} className="btn-lift border border-ink-700/50 px-3 py-2 font-mono text-[10px] tracking-[0.15em] text-zinc-300 uppercase hover:border-brand" data-testid={`admin-reply-${e.id}`}>
                  Reply
                </a>
                <button onClick={() => remove(e.id)} className="btn-lift flex items-center gap-1.5 border border-brand/40 px-3 py-2 font-mono text-[10px] tracking-[0.15em] text-brand uppercase hover:bg-brand/10" data-testid={`admin-delete-${e.id}`}>
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
