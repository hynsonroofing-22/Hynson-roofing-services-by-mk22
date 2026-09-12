import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, animate } from "framer-motion";
import { ArrowLeft, ArrowRight, Calculator, AlertTriangle } from "lucide-react";
import { scrollToHash } from "./Navbar";
import RoofAreaFinder from "./RoofAreaFinder";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";

// Bounds shared by the slider and the type-in field, so the two can never
// disagree about what a valid roof area is.
const AREA_MIN = 60;
const AREA_MAX = 600;

/** Animates a number counting up to `value` whenever it changes. */
function CountUp({ value, prefix = "" }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Counting up is the moment the estimate lands, but for anyone who has
    // asked the OS for less motion it just jumps straight to the figure.
    if (reduceMotion) {
      setDisplay(value);
      prev.current = value;
      return undefined;
    }
    const controls = animate(prev.current, value, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, reduceMotion]);

  return <>{prefix}{display.toLocaleString()}</>;
}

/* ------------------------------------------------------------------ *
 * PLACEHOLDER PRICING — NOT CONFIRMED WITH THE CLIENT.
 * Every rate, multiplier and add-on price below is an invented estimate
 * for demo purposes. Customers act on price, so this block is a launch
 * blocker: see LAUNCH-BLOCKERS.md. Do not go live until Eugene has
 * reviewed and confirmed real figures for all four groups below.
 * ------------------------------------------------------------------ */

const SERVICE_OPTS = [
  { id: "re-roof", label: "Re-Roofing", rate: 1.0 },
  { id: "new-install", label: "New Roof Installation", rate: 1.12 },
  { id: "repair", label: "Roof Repair", rate: 0.55 },
];

const MATERIALS = [
  { id: "longrun", label: "Long-Run Steel", desc: "NZ's proven favourite", perSqm: 145 },
  { id: "membrane", label: "Membrane System", desc: "Flat & low-slope roofs", perSqm: 125 },
  { id: "premium", label: "Premium Long-Run", desc: "Maximum durability finish", perSqm: 168 },
];

const PITCHES = [
  { id: "low", label: "Low (< 15°)", mult: 1.0 },
  { id: "medium", label: "Medium (15–30°)", mult: 1.1 },
  { id: "steep", label: "Steep (30°+)", mult: 1.28 },
];

const ADDONS = [
  { id: "gutters", label: "New spouting & downpipes", price: 2600 },
  { id: "painting", label: "Roof painting", price: 3200 },
  { id: "skylight", label: "Skylight flashing", price: 1250 },
];

/* -------------------------- end placeholder pricing ----------------------- */

export default function QuoteCalculator({ compact = false } = {}) {
  const [step, setStep] = useState(0);
  const [service, setService] = useState("re-roof");
  const [area, setArea] = useState(180);
  // The typed value is held as a string while the field has focus. Clamping on
  // every keystroke would fight the user — typing "2" on the way to "240"
  // would snap straight to the minimum — so the draft is only committed on
  // blur or Enter.
  const [areaDraft, setAreaDraft] = useState(String(180));
  const [pitch, setPitch] = useState("medium");
  const [material, setMaterial] = useState("longrun");
  const [addons, setAddons] = useState([]);

  const mat = MATERIALS.find((m) => m.id === material);
  const pit = PITCHES.find((p) => p.id === pitch);
  const svc = SERVICE_OPTS.find((s) => s.id === service);
  const addonTotal = ADDONS.filter((a) => addons.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const base = mat.perSqm * area * pit.mult * svc.rate + addonTotal;
  const low = Math.round((base * 0.9) / 100) * 100;
  const high = Math.round((base * 1.12) / 100) * 100;

  const toggleAddon = (id) => setAddons((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));

  const requestSurvey = () => {
    const summary = `Instant estimate: $${low.toLocaleString()} – $${high.toLocaleString()} NZD · ${area}m² · ${mat.label} · ${pit.label} · ${svc.label}${addons.length ? " · Add-ons: " + addons.join(", ") : ""}`;
    window.dispatchEvent(new CustomEvent("prefill-enquiry", { detail: { service: svc.label, estimate: summary } }));
    scrollToHash("#contact");
  };

  // Commits whatever was typed: clamp into range, round to a whole metre, and
  // fall back to the current value if the field was left empty or unparseable.
  const commitArea = () => {
    const n = Math.round(Number(areaDraft));
    if (areaDraft.trim() === "" || !Number.isFinite(n)) {
      setAreaDraft(String(area));
      return;
    }
    const clamped = Math.min(AREA_MAX, Math.max(AREA_MIN, n));
    setArea(clamped);
    setAreaDraft(String(clamped));
    setFoundFrom(null); // typed by hand, so it is no longer a looked-up figure
  };

  // Set when the area came from an address lookup rather than the slider, so
  // the source can be shown. Cleared as soon as the visitor overrides it.
  const [foundFrom, setFoundFrom] = useState(null);

  const applyFoundArea = (roofArea, working) => {
    const clamped = Math.min(AREA_MAX, Math.max(AREA_MIN, Math.round(roofArea)));
    setArea(clamped);
    setAreaDraft(String(clamped));
    setFoundFrom(working);
  };

  const steps = ["Project", "Roof", "Material", "Estimate"];

  // A step is only complete when it has a usable answer. Steps 0 and 2 ship
  // with a sensible default so they are always satisfied; step 1 is the one
  // that can genuinely be wrong, because the number field can be mid-edit,
  // empty, or outside the range the slider allows.
  const areaDraftValid = (() => {
    const n = Number(areaDraft);
    return areaDraft.trim() !== "" && Number.isFinite(n) && n >= AREA_MIN && n <= AREA_MAX;
  })();
  const stepValid = (i) => (i === 1 ? areaDraftValid : true);
  const canAdvance = stepValid(step);

  // Furthest step reached, so the tabs can jump back to anything already
  // answered without letting people skip ahead past an unanswered step.
  const [maxStep, setMaxStep] = useState(0);
  const goToStep = (i) => {
    if (i > maxStep || !stepValid(step)) return;
    setStep(i);
  };
  const goNext = () => {
    if (!canAdvance) return;
    const next = Math.min(3, step + 1);
    setStep(next);
    setMaxStep((m) => Math.max(m, next));
  };

  const cardRef = useRef(null);



  // `step` is what the tabs and buttons act on; `shownStep` is what is
  // currently painted. When they differ we fade out, swap, then fade back in,
  // which is what gives each step a real exit without any remounting.
  const [shownStep, setShownStep] = useState(0);
  const swapping = shownStep !== step;

  useEffect(() => {
    if (shownStep === step) return undefined;
    const t = setTimeout(() => setShownStep(step), 180);
    return () => clearTimeout(t);
  }, [step, shownStep]);

  // On step change, bring the top of the panel back into view. Inside the
  // modal that is the panel's own scroller; on the page we only do it if the
  // card has already scrolled off the top, so it never hijacks the page.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const scroller = el.closest("[data-lenis-prevent]");
    if (scroller) {
      scroller.scrollTo({ top: 0, behavior: "smooth" });
    } else if (el.getBoundingClientRect().top < 0) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      if (window.__lenis) window.__lenis.scrollTo(y);
      else window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [step]);

  return (
    <section
      id={compact ? undefined : "calculator"}
      // `dark` is a plain class in the stylesheet, not a `:root` rule, so
      // scoping it to this one section flips the whole ink/zinc palette for
      // its subtree. That gives the page its second dark band for rhythm
      // without recolouring a single child. Not applied in the modal, where
      // the surrounding chrome stays light.
      className={`relative overflow-hidden bg-ink-950 ${compact ? "py-8 sm:py-10" : "dark py-28 sm:py-36"}`}
      data-testid="quote-calculator-container"
    >
      {!compact && <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-brand/10 blur-[120px]" />}
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        {/* Headline left, support right — not centred. */}
        <div className={compact ? "mb-8" : "mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"}>
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-brand-bright uppercase">— Instant estimator</p>
            <h2 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] font-extrabold uppercase leading-[1.0] tracking-[-0.02em] text-zinc-50">
              What's your roof <span className="text-brand-bright">likely to cost?</span>
            </h2>
          </div>
          <div className="max-w-xs sm:text-right">
            <p className="text-sm leading-relaxed text-zinc-400">
              Four quick steps. A ballpark range in seconds — then book a free site inspection for a detailed
              quotation.
            </p>
            {/* The full explanation of what actually moves a roofing price —
                the thing this estimator can only gesture at — is its own page. */}
            {!compact && (
              <Link
                to="/roof-cost"
                className="btn-lift mt-5 inline-flex items-center gap-2 border border-line-strong bg-surface px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-content hover:border-accent hover:text-accent"
                data-testid="calc-cost-guide-link"
              >
                Roof cost guide <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -bottom-4 -right-4 hidden h-full w-full bg-brand-ember sm:block" />
          <div ref={cardRef} className="relative border border-ink-700/40 bg-ink-900">
          <div className="flex border-b border-ink-700/30">
            {steps.map((s, i) => {
              const reachable = i <= maxStep;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => goToStep(i)}
                  disabled={!reachable}
                  aria-current={i === step ? "step" : undefined}
                  className={`flex-1 px-3 py-3 text-center font-mono text-[10px] tracking-[0.2em] uppercase transition-colors ${
                    i === step
                      ? "bg-brand/10 text-brand"
                      : reachable
                        ? "text-zinc-400 hover:bg-ink-850 hover:text-zinc-100"
                        : "cursor-not-allowed text-zinc-600"
                  }`}
                  data-testid={`calc-step-tab-${i}`}
                >
                  {i + 1}. {s}
                </button>
              );
            })}
          </div>

          <div className="p-6 sm:p-10">
            {/* Height is animated to the measured height of whatever step is
                mounted, so the panel grows and shrinks smoothly instead of the
                button row below it jumping. */}
            <motion.div
              initial={false}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
            {/* Deliberately NOT AnimatePresence.
                Three variants were tried here — mode="wait", plain sync and
                mode="popLayout" — and in this component every one of them left
                exiting steps mounted forever, frozen at their `initial` state,
                so the panel accumulated all four steps on top of each other.
                A keyed remount plus the height ResizeObserver's re-renders is
                evidently more than the presence machinery copes with.

                This does the same job with no remount at all: one element that
                fades out, swaps its content at the midpoint, and fades back
                in. Fully deterministic and impossible to leave half-finished.

                There is also no animated height wrapper any more. It needed
                `overflow-hidden` plus a ResizeObserver, and that combination
                clipped the address suggestions to an unreadable sliver when
                the observer stopped firing — the panel stayed 419px while its
                content was 605px. The height change is already hidden by the
                crossfade (the content is at opacity 0 while it resizes), so
                plain auto height looks the same and cannot clip anything. */}
            <motion.div
              animate={swapping ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
              initial={false}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
            <div>
              {shownStep === 0 && (
                <div className="grid gap-3 sm:grid-cols-3" data-testid="calc-step-service">
                  {SERVICE_OPTS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setService(s.id)}
                      className={`btn-lift border p-5 text-left ${service === s.id ? "border-brand bg-brand/10" : "border-ink-700/40 bg-ink-850 hover:border-brand/50"}`}
                      data-testid={`calc-service-${s.id}`}
                    >
                      <p className="font-display text-base font-bold uppercase text-zinc-50">{s.label}</p>
                    </button>
                  ))}
                </div>
              )}

              {shownStep === 1 && (
                <div data-testid="calc-step-roof">
                  <label
                    htmlFor="calc-area-number"
                    className="font-mono text-xs tracking-[0.2em] text-zinc-400 uppercase"
                  >
                    Roof area
                  </label>

                  {/* Slider and type-in are two views of one value. Dragging
                      updates the number, typing moves the slider. */}
                  <div className="mt-4 flex items-center gap-4">
                    <input
                      type="range"
                      min={AREA_MIN}
                      max={AREA_MAX}
                      // step=1, not 10: a typed figure like 245 is not on a
                      // 10m grid, and the browser would silently snap the
                      // thumb to 250 while the number field still read 245.
                      step="1"
                      value={area}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        setArea(n);
                        setAreaDraft(String(n));
                        setFoundFrom(null); // manual override — no longer from the lookup
                      }}
                      aria-label="Roof area in square metres"
                      className="h-11 min-w-0 flex-1 accent-brand"
                      data-testid="calc-area-slider"
                    />
                    <div className="relative shrink-0">
                      <input
                        id="calc-area-number"
                        type="number"
                        inputMode="numeric"
                        min={AREA_MIN}
                        max={AREA_MAX}
                        value={areaDraft}
                        onChange={(e) => setAreaDraft(e.target.value)}
                        onBlur={() => commitArea()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitArea();
                            e.currentTarget.blur();
                          }
                        }}
                        className="h-[54px] w-28 border border-ink-700/40 bg-ink-850 pl-4 pr-9 text-right font-display text-lg font-bold text-zinc-50 outline-none transition-colors focus:border-brand"
                        data-testid="calc-area-number"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-500">
                        m²
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 font-mono text-[10px] tracking-[0.15em] text-zinc-500 uppercase">
                    Type an exact figure, or drag — {AREA_MIN}–{AREA_MAX} m²
                  </p>
                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {PITCHES.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPitch(p.id)}
                        className={`btn-lift border p-4 text-sm ${pitch === p.id ? "border-brand bg-brand/10 text-zinc-50" : "border-ink-700/40 bg-ink-850 text-zinc-400 hover:border-brand/50"}`}
                        data-testid={`calc-pitch-${p.id}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Sits after the pitch buttons on purpose: the lookup needs
                      a pitch to convert a flat footprint into a roof area, so
                      the pitch has to be chosen first for the working to read
                      correctly. */}
                  <div className="mt-8">
                    <RoofAreaFinder pitch={pitch} onPick={applyFoundArea} />
                    {foundFrom && (
                      <p className="mt-3 font-mono text-[10px] tracking-[0.15em] text-brand uppercase" data-testid="calc-area-source">
                        Roof area set from building outline · footprint {foundFrom.footprint} m² × {foundFrom.factor}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {shownStep === 2 && (
                <div data-testid="calc-step-material">
                  <div className="mb-5 flex w-fit items-center gap-2 border border-brand-ember/40 bg-brand-ember/10 px-3 py-1.5 text-brand-ember">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="font-mono text-[10px] tracking-[0.15em] uppercase">Demo rates — not final pricing</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {MATERIALS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMaterial(m.id)}
                        className={`btn-lift border p-5 text-left ${material === m.id ? "border-brand bg-brand/10" : "border-ink-700/40 bg-ink-850 hover:border-brand/50"}`}
                        data-testid={`calc-material-${m.id}`}
                      >
                        <p className="font-display text-sm font-bold uppercase text-zinc-50">{m.label}</p>
                        <p className="mt-1 text-xs text-zinc-500">{m.desc}</p>
                        <p className="mt-3 font-mono text-xs text-brand">${m.perSqm}/m²</p>
                      </button>
                    ))}
                  </div>
                  <p className="mt-8 font-mono text-xs tracking-[0.2em] text-zinc-400 uppercase">Add-ons</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {ADDONS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => toggleAddon(a.id)}
                        className={`btn-lift border p-4 text-left text-xs ${addons.includes(a.id) ? "border-brand bg-brand/10 text-zinc-50" : "border-ink-700/40 bg-ink-850 text-zinc-400 hover:border-brand/50"}`}
                        data-testid={`calc-addon-${a.id}`}
                      >
                        {a.label}
                        <span className="mt-1 block font-mono text-brand">+${a.price.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {shownStep === 3 && (
                <div className="text-center" data-testid="calc-step-estimate">
                  <div className="mx-auto mb-5 flex w-fit items-center gap-2 border border-brand-ember/40 bg-brand-ember/10 px-3 py-1.5 text-brand-ember" data-testid="calc-placeholder-badge">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="font-mono text-[10px] tracking-[0.15em] uppercase">Demo pricing — not final rates</span>
                  </div>
                  <Calculator className="mx-auto h-8 w-8 text-brand" />
                  <p className="mt-4 font-mono text-xs tracking-[0.3em] text-zinc-400 uppercase">Your estimated range</p>
                  <p className="mt-3 font-display text-4xl font-extrabold text-zinc-50 sm:text-6xl" data-testid="calc-estimate-value">
                    <CountUp value={low} prefix="$" /> <span className="text-brand">–</span> <CountUp value={high} prefix="$" />
                  </p>
                  <p className="mt-4 text-sm text-zinc-400">
                    {area} m² · {mat.label} · {pit.label} · {svc.label}
                    {addons.length > 0 && ` · ${addons.length} add-on${addons.length > 1 ? "s" : ""}`}
                  </p>
                  {/* What actually moves this number. Answers the question the
                      range immediately raises, instead of leaving people to
                      guess why it isn't one figure. */}
                  <div className="mx-auto mt-8 max-w-md border-t border-ink-700/30 pt-6 text-left">
                    <p className="font-mono text-[10px] tracking-[0.25em] text-zinc-500 uppercase">
                      What changes this price
                    </p>
                    <ul className="mt-3 grid gap-2 text-sm text-zinc-400">
                      {[
                        "Condition of what's underneath — rot or rusted purlins add work",
                        "Access and storey height, and whether scaffold is needed",
                        "Roof shape — valleys, dormers and penetrations all add flashings",
                        "Spouting, skylights or painting done at the same time",
                      ].map((line) => (
                        <li key={line} className="flex gap-2.5">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rotate-45 bg-brand" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="mx-auto mt-6 max-w-sm text-xs leading-relaxed text-zinc-500">
                    Ballpark only, using placeholder rates not yet confirmed by Hynson — every roof is different. We
                    provide free site inspections and detailed written quotes.
                  </p>
                  <button
                    onClick={requestSurvey}
                    className="btn-lift mt-8 bg-brand px-8 py-4 font-mono text-xs font-semibold tracking-[0.25em] text-white uppercase hover:bg-brand-bright warm-glow"
                    data-testid="calc-request-survey-btn"
                  >
                    Book my free site inspection
                  </button>
                </div>
              )}
            </div>
            </motion.div>
            </motion.div>

            <div className="mt-10 flex items-center justify-between border-t border-ink-700/30 pt-6">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-zinc-400 uppercase transition-colors hover:text-zinc-100 disabled:opacity-30"
                data-testid="calc-back-btn"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {step < 3 && (
                <button
                  onClick={goNext}
                  disabled={!canAdvance}
                  title={canAdvance ? undefined : `Enter a roof area between ${AREA_MIN} and ${AREA_MAX} m²`}
                  className="btn-lift flex items-center gap-2 bg-brand px-6 py-3 font-mono text-xs font-semibold tracking-[0.2em] text-white uppercase hover:bg-brand-bright disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-brand"
                  data-testid="calc-next-btn"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
