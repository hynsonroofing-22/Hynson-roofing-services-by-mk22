import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Send, Phone, MapPin, ClipboardCheck } from "lucide-react";
import { API_URL, REGIONS, PHONE_DISPLAY, PHONE_TEL, EMAIL } from "../data/content";

const SERVICE_CHIPS = ["Roof Replacement", "New Roof", "Leaks & Repairs", "Emergency"];

/**
 * Where the roof tool parks its answers when it has to send someone to another
 * page to reach this form. Exported so there is one spelling of the key rather
 * than two string literals that can drift apart.
 */
export const PREFILL_KEY = "hynson_enquiry_prefill";

const EMPTY = { name: "", email: "", phone: "", address: "", region: REGIONS[0], service: SERVICE_CHIPS[0], message: "", estimate: "" };

export default function Contact({ compact = false, heading = "h2" } = {}) {
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  // Set once a send has demonstrably failed, or when there is no inbox to
  // send to at all. Shown above the button, with the details still filled in
  // so nothing anyone typed is lost.
  const [noInbox, setNoInbox] = useState(false);

  /**
   * Catches everything the roof tool collected so nobody types it twice.
   *
   * The address is carried across as well as the summary now — it is the one
   * field someone has genuinely already filled in over there, and asking for
   * it again immediately after showing them their own roof reads as though we
   * weren't paying attention.
   */
  useEffect(() => {
    const apply = (detail) => {
      if (!detail) return;
      setForm((f) => ({
        ...f,
        service: detail.service || f.service,
        address: detail.address || f.address,
        estimate: detail.estimate || "",
        message: detail.estimate || f.message,
      }));
      toast.info("Your roof details are attached — just add your contact details.");
    };

    const onPrefill = (e) => apply(e.detail);
    window.addEventListener("prefill-enquiry", onPrefill);

    // Arriving from the roof tool on another page: it parked the details in
    // sessionStorage because this form wasn't mounted yet. Pick them up once,
    // then clear them so a later visit to this page isn't pre-filled with
    // somebody's stale answers.
    try {
      const parked = sessionStorage.getItem(PREFILL_KEY);
      if (parked) {
        sessionStorage.removeItem(PREFILL_KEY);
        apply(JSON.parse(parked));
        // Land on the form, not the top of the page. Someone who has just
        // filled in the roof tool has been sent here to finish — making them
        // hunt for the thing they were sent to is the sort of small failure
        // that loses an enquiry. Deferred so the page has laid out first.
        setTimeout(() => {
          const el = document.querySelector("[data-testid=contact-section]");
          if (!el) return;
          const y = el.getBoundingClientRect().top + window.scrollY - 90;
          if (window.__lenis) window.__lenis.scrollTo(y);
          else window.scrollTo({ top: y, behavior: "smooth" });
        }, 450);
      }
    } catch {
      // Unreadable or unavailable storage — nothing to restore.
    }

    return () => window.removeEventListener("prefill-enquiry", onPrefill);
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  /**
   * Is there actually somewhere for an enquiry to go?
   *
   * `API_URL` is built from `REACT_APP_BACKEND_URL`, which is empty — the
   * Emergent backend that used to answer it did not survive the migration
   * (LAUNCH-BLOCKERS.md #2). With it empty, `API_URL` is the literal string
   * "undefined/api", and that is where this used to POST.
   */
  const backendConfigured = Boolean(
    process.env.REACT_APP_BACKEND_URL && !String(API_URL).startsWith("undefined")
  );

  const submit = async (e) => {
    e.preventDefault();

    /* ------------------------------------------------------------------ *
     * THIS FORM USED TO LIE, AND THAT IS WHY THIS BLOCK EXISTS.
     *
     * With no backend configured it posted to the relative path
     * "undefined/api/enquiries". On Netlify the catch-all SPA rewrite in
     * netlify.toml answers ANY unmatched path — POST included — with
     * index.html and a 200. `res.ok` was therefore true, so the old code ran
     * `setSent(true)` and told the customer "Enquiry received — our team will
     * get back to you as soon as possible."
     *
     * A homeowner with a leak read that, believed it, and waited. The enquiry
     * had gone nowhere.
     *
     * Saying nothing would have been better than that. So: if there is no
     * inbox to send to, we say so in one sentence and give the two channels
     * that genuinely work — the phone and the email address — rather than
     * pretending. See CLAUDE.md, the non-negotiable honesty rule.
     * ------------------------------------------------------------------ */
    if (!backendConfigured) {
      setNoInbox(true);
      toast.error("This form isn't connected yet — please ring or email instead.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${API_URL}/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      // Content-type is checked as well as status, for the same reason the
      // address lookup checks it: HTML coming back from a POST is the
      // signature of a rewrite catching an endpoint that does not exist, and
      // it arrives with a perfectly healthy 200.
      const type = res.headers.get("content-type") || "";
      if (!res.ok || !type.includes("application/json")) {
        throw new Error("The enquiry didn't reach us.");
      }
      setSent(true);
      toast.success("Enquiry received — our team will get back to you as soon as possible.");
    } catch (err) {
      console.error("[contact] enquiry submission failed:", err);
      setNoInbox(true);
      toast.error("That didn't send. Please ring or email instead.");
    } finally {
      setSending(false);
    }
  };

  const inputCls =
    "w-full border border-ink-700/40 bg-ink-850 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30";

  return (
    <section id={compact ? undefined : "contact"} className={compact ? "bg-ink-950" : "bg-ink-950 py-28 sm:py-36"} data-testid="contact-section">
      <div className={`mx-auto grid max-w-7xl gap-10 lg:grid-cols-5 ${compact ? "px-5 py-8 sm:px-8 sm:py-10" : "gap-14 px-5 sm:px-8"}`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-2"
        >
          <p className="font-mono text-[10px] tracking-[0.3em] text-brand-ember uppercase">— Service enquiry</p>
          {/* An <h1> when this is the top of the contact page, an <h2> when it
              is a section further down the homepage. One heading either way —
              the page used to carry its own copy of this line directly above,
              which said the same thing twice and pushed the form off screen. */}
          {heading === "h1" ? (
            <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] font-extrabold uppercase leading-[1.0] tracking-[-0.02em] text-zinc-50">
              Free quotes. <span className="text-brand">No obligation.</span>
            </h1>
          ) : (
            <h2 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] font-extrabold uppercase leading-[1.0] tracking-[-0.02em] text-zinc-50">
              Free quotes. <span className="text-brand">No obligation.</span>
            </h2>
          )}
          <p className="mt-5 max-w-md text-sm leading-relaxed text-zinc-400">
            Tell us about the roof and Eugene will come and look at it — free, and with no obligation
            either way. Residential and commercial, right across Auckland.
          </p>
          <div className="mt-10 space-y-5">
            <a href={`tel:${PHONE_TEL}`} className="group flex items-center gap-4 text-sm text-zinc-300 transition-colors hover:text-brand" data-testid="contact-phone">
              <span className="flex h-10 w-10 items-center justify-center border border-ink-700/40 bg-ink-900 transition-colors group-hover:border-brand"><Phone className="h-4 w-4 text-brand" /></span>
              {PHONE_DISPLAY} — call now
            </a>
            <div className="flex items-center gap-4 text-sm text-zinc-300" data-testid="contact-free-quotes">
              <span className="flex h-10 w-10 items-center justify-center border border-ink-700/40 bg-ink-900"><ClipboardCheck className="h-4 w-4 text-brand" /></span>
              Free quotes & site inspections
            </div>
            <div className="flex items-center gap-4 text-sm text-zinc-300" data-testid="contact-location">
              <span className="flex h-10 w-10 items-center justify-center border border-ink-700/40 bg-ink-900"><MapPin className="h-4 w-4 text-brand" /></span>
              Auckland-wide · Residential & commercial
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="lg:col-span-3"
        >
          {sent ? (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center border border-brand/40 bg-ink-900 p-10 text-center" data-testid="contact-success">
              <span className="flex h-14 w-14 items-center justify-center bg-brand warm-glow"><Send className="h-6 w-6 text-white" /></span>
              <h3 className="mt-6 font-display text-2xl font-bold uppercase text-zinc-50">Enquiry received</h3>
              <p className="mt-3 max-w-sm text-sm text-zinc-400">
                Thanks {form.name.split(" ")[0]} — the Hynson team will get back to you with a quote or advice as
                soon as possible.
              </p>
              <button
                onClick={() => { setSent(false); setForm(EMPTY); }}
                className="btn-lift mt-8 border border-ink-700/50 px-6 py-3 font-mono text-xs tracking-[0.2em] text-zinc-300 uppercase hover:border-brand"
                data-testid="contact-send-another-btn"
              >
                Send another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="border border-ink-700/40 bg-ink-900 p-6 sm:p-10" data-testid="contact-quote-form">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-mono text-[10px] tracking-[0.25em] text-zinc-500 uppercase">Full name *</label>
                  <input required value={form.name} onChange={set("name")} placeholder="Jane Doe" className={inputCls} data-testid="contact-name-input" />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] tracking-[0.25em] text-zinc-500 uppercase">Email *</label>
                  <input required type="email" value={form.email} onChange={set("email")} placeholder="jane@example.co.nz" className={inputCls} data-testid="contact-email-input" />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] tracking-[0.25em] text-zinc-500 uppercase">Phone *</label>
                  <input required value={form.phone} onChange={set("phone")} placeholder="020 000 0000" className={inputCls} data-testid="contact-phone-input" />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] tracking-[0.25em] text-zinc-500 uppercase">Address *</label>
                  <input required value={form.address} onChange={set("address")} placeholder="Street, suburb, Auckland" className={inputCls} data-testid="contact-address-input" />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] tracking-[0.25em] text-zinc-500 uppercase">Area *</label>
                  <select value={form.region} onChange={set("region")} className={inputCls} data-testid="contact-region-select">
                    {REGIONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block font-mono text-[10px] tracking-[0.25em] text-zinc-500 uppercase">What do you need? *</label>
                  <div className="flex flex-wrap gap-2" data-testid="contact-service-chips">
                    {SERVICE_CHIPS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, service: s }))}
                        className={`chip rounded-full border px-4 py-2 text-xs font-semibold ${
                          form.service === s
                            ? "border-brand bg-brand text-white"
                            : "border-ink-700/40 bg-ink-850 text-zinc-400 hover:border-brand/50"
                        }`}
                        data-testid={`chip-${s.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                        aria-pressed={form.service === s}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block font-mono text-[10px] tracking-[0.25em] text-zinc-500 uppercase">Project details</label>
                  <textarea rows={4} value={form.message} onChange={set("message")} placeholder="Roof size, age, any leaks, access notes…" className={inputCls} data-testid="contact-message-input" />
                </div>
              </div>
              {noInbox && (
                <div
                  className="mt-6 border border-brand-ember/40 bg-brand-ember/10 p-5"
                  role="alert"
                  data-testid="contact-no-inbox"
                >
                  <p className="font-display text-sm font-bold uppercase tracking-tight text-brand-ember">
                    That didn't send — sorry
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    Something went wrong at our end, and we'd rather tell you than leave you
                    waiting on a reply that never comes. Everything you typed is still here. Give
                    Eugene a ring or send it by email and he'll pick it up straight away.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href={`tel:${PHONE_TEL}`}
                      className="btn-lift inline-flex items-center gap-2 bg-brand px-5 py-3 font-mono text-xs font-semibold tracking-[0.18em] text-white uppercase hover:bg-brand-bright"
                      data-testid="contact-fallback-call"
                    >
                      <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
                    </a>
                    <a
                      href={`mailto:${EMAIL}?subject=${encodeURIComponent("Roofing enquiry")}`}
                      className="btn-lift inline-flex items-center gap-2 border border-ink-700/50 bg-ink-850 px-5 py-3 font-mono text-xs font-semibold tracking-[0.18em] text-zinc-200 uppercase hover:border-brand hover:text-brand"
                      data-testid="contact-fallback-email"
                    >
                      <Send className="h-4 w-4" /> Email us
                    </a>
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={sending}
                className="btn-lift mt-8 flex w-full items-center justify-center gap-3 bg-brand px-8 py-4 font-mono text-xs font-semibold tracking-[0.25em] text-white uppercase hover:bg-brand-bright disabled:opacity-60 warm-glow"
                data-testid="contact-submit-btn"
              >
                {sending ? "Sending…" : (<>Submit enquiry <Send className="h-4 w-4" /></>)}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
