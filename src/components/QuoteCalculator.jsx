import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  MapPin,
  PencilRuler,
  Home,
  Check,
  Ruler,
  Loader2,
} from "lucide-react";
import { scrollToHash } from "./Navbar";
import RoofAreaFinder, { PITCH_FACTORS } from "./RoofAreaFinder";
import HouseDescriber from "./HouseDescriber";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";
import { PREFILL_KEY } from "./Contact";

/**
 * The roof estimator.
 *
 * WHAT IT DOES, AND WHY IT NO LONGER SHOWS A PRICE
 * ------------------------------------------------
 * This used to end on a dollar range. Every figure behind it — the per-m²
 * material rates, the service multipliers, the add-on prices — was invented,
 * and the page carried a warning saying so. A warning does not fix an invented
 * number: people read the number, not the warning, and then they budget
 * against it and feel misled when the real quote arrives.
 *
 * So the numbers are gone and what is left is the part that was always true
 * and always useful: **how big your roof actually is, and what will move its
 * price.** That is a genuinely better tool than a made-up range, and it is the
 * thing most roofing "instant estimators" cannot do at all — they are a
 * contact form with a progress bar. This one measures a roof.
 *
 * It ends by handing everything the visitor has told us straight into the
 * enquiry form, so nobody types anything twice.
 *
 * WHEN REAL RATES ARRIVE: `PRICE_DRIVERS` below already models every factor a
 * quote depends on, and each one carries the flag the pricing would key off.
 * Dropping figures in means adding a rate to each and rendering a range in the
 * summary — the questions, the ordering and the wording do not need to change.
 * See LAUNCH-BLOCKERS.md for exactly what to ask for.
 */

// Loaded only when someone opens the map tab. Leaflet plus its stylesheet is
// around 45KB gzipped, and most people will use the address box and never
// need it.
const RoofMapDrawer = lazy(() => import("./RoofMapDrawer"));

const AREA_MIN = 30;
const AREA_MAX = 900;

const EASE = [0.16, 1, 0.3, 1];

/* -------------------------------------------------------------------------
 * What actually moves the price of a roof.
 *
 * Every one of these is true of roofing generally — none is a claim about
 * Hynson, none carries a figure, and none needed anybody's sign-off. They are
 * the questions a roofer asks on the phone before coming out.
 *
 * `impact` is what gets shown back to the visitor in the summary. `key` is
 * what a future pricing model would multiply on.
 * ---------------------------------------------------------------------- */

const SERVICES = [
  { id: "re-roof", key: "reroof", label: "Full re-roof", desc: "Old roof off, new one on" },
  { id: "new-install", key: "newbuild", label: "New roof", desc: "New build or extension" },
  { id: "repair", key: "repair", label: "Repair a problem", desc: "Leak, flashing or storm damage" },
  { id: "paint", key: "paint", label: "Roof painting", desc: "Recoat a sound roof" },
];

const PITCHES = [
  { id: "low", label: "Low / nearly flat", hint: "You can barely see the slope" },
  { id: "medium", label: "Normal pitch", hint: "The usual house roof" },
  { id: "steep", label: "Steep", hint: "Noticeably steep from the street" },
];

const STOREYS = [
  { id: "one", label: "Single storey" },
  { id: "two", label: "Two storeys" },
  { id: "three", label: "Three or more" },
];

const ACCESS = [
  { id: "easy", label: "Easy", hint: "Clear space all the way round" },
  { id: "tight", label: "Tight", hint: "Fences, neighbours or a narrow drive" },
  { id: "difficult", label: "Difficult", hint: "Steep site, no vehicle access" },
];

const CONDITION = [
  { id: "sound", label: "Looks sound", hint: "Tired, but nothing obviously wrong" },
  { id: "leaking", label: "It leaks", hint: "Water is getting in somewhere" },
  { id: "poor", label: "Visibly poor", hint: "Rust, damage or sagging" },
  { id: "unsure", label: "Not sure", hint: "That's what the inspection's for" },
];

const EXTRAS = [
  { id: "spouting", label: "Spouting & downpipes" },
  { id: "skylights", label: "Skylights" },
  { id: "asbestos", label: "Possible asbestos" },
  { id: "solar", label: "Solar panels to work around" },
];

/**
 * The material question, kept from the original estimator.
 *
 * It was dropped when the pricing came out, on the grounds that without rates
 * it had nothing to multiply. That was the wrong reason to remove it: it is
 * useful to Eugene regardless — knowing someone is after a membrane rather
 * than long-run changes the conversation before he even gets in the van — and
 * "not sure" is a perfectly good answer that costs the visitor nothing.
 */
const MATERIALS = [
  { id: "longrun", label: "Long-run steel", hint: "The usual New Zealand roof" },
  { id: "membrane", label: "Membrane", hint: "Flat and low-slope roofs" },
  { id: "tile", label: "Tile", hint: "Concrete or clay tiles" },
  { id: "unsure", label: "Not sure yet", hint: "Happy to be advised" },
];

/**
 * Turns the answers into plain-English reasons, in the order a roofer would
 * raise them. This is the payoff screen: not a number, but an honest account
 * of what the person quoting is going to be looking at.
 */
function priceDrivers({ area, areaRange, pitch, storeys, access, condition, extras, service }) {
  const out = [];

  if (area) {
    // The figure lives in the body, not the heading. Headings here are
    // uppercased, and "123 M² OF ROOF" reads badly — and when the describe
    // method has produced a range, a single number in the heading contradicts
    // the range shown directly above it.
    const size = areaRange ? `${areaRange[0]}–${areaRange[1]} m²` : `${area} m²`;
    out.push({
      title: "The size of your roof",
      body: `About ${size}. The starting point for any quote — materials and labour both scale with it. That's roof surface, not floor area, so it's already bigger than the ground the house sits on.`,
    });
  }

  if (storeys === "two" || storeys === "three") {
    out.push({
      title: storeys === "two" ? "Two storeys" : "Three or more storeys",
      body:
        "Height means scaffolding and edge protection, and that is a real line on any honest roofing quote. It is also the main reason two similar-sized roofs can be quoted very differently.",
    });
  }

  if (pitch === "steep") {
    out.push({
      title: "A steep roof",
      body:
        "Two things at once: more surface area than the footprint suggests, and slower, more careful work to stay safe on it.",
    });
  } else if (pitch === "low") {
    out.push({
      title: "A low pitch",
      body:
        "Below about 3° water stops shedding properly, so a low roof may need a membrane system rather than steel sheets. That changes the whole approach.",
    });
  }

  if (access === "tight" || access === "difficult") {
    out.push({
      title: access === "tight" ? "Tight access" : "Difficult access",
      body:
        "Getting people, scaffold and several tonnes of material on and off the site is a real cost. A narrow drive or a steep section can matter more than the size of the roof.",
    });
  }

  if (condition === "leaking" || condition === "poor") {
    out.push({
      title: condition === "leaking" ? "It's leaking" : "The roof is visibly past it",
      body:
        "Water that has been getting in has usually reached the purlins and the rafter ends. Nobody can price that from the ground — it is exactly what the free inspection is for, and it is the single biggest unknown in a re-roof.",
    });
  } else if (service === "re-roof") {
    out.push({
      title: "What's underneath",
      body:
        "The structure only becomes visible once the old roof is off. Any rot or rusted purlins found then have to be dealt with while they are reachable.",
    });
  }

  if (extras.includes("asbestos")) {
    out.push({
      title: "Possible asbestos",
      body:
        "Older roofs and their underlays sometimes contain it. It has to be tested and, if present, removed under the proper rules. Worth flagging early — it changes the plan, not just the price.",
    });
  }

  if (extras.includes("spouting")) {
    out.push({
      title: "Spouting and downpipes",
      body:
        "Almost always cheaper done while the scaffold is already up than as a separate job later.",
    });
  }

  if (extras.includes("skylights")) {
    out.push({
      title: "Skylights",
      body: "Every penetration needs its own flashing made and fitted. They are fiddly, and they are where roofs leak.",
    });
  }

  if (extras.includes("solar")) {
    out.push({
      title: "Solar panels",
      body: "They need removing and refitting, usually by the solar installer, and that has to be coordinated.",
    });
  }

  return out;
}

const METHOD_LABEL = {
  address: "from your address",
  map: "traced on the map",
  describe: "from your description",
  manual: "entered by hand",
};

/** One selectable button, used by every question in step two. */
function Choice({ on, onClick, label, hint, testid }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      data-testid={testid}
      className={`btn-lift border p-4 text-left transition-colors ${
        on
          ? "border-accent bg-accent/10"
          : "border-line-strong bg-surface hover:border-accent/60"
      }`}
    >
      <span className={`block font-display text-sm font-bold ${on ? "text-accent" : "text-content"}`}>
        {label}
      </span>
      {hint && <span className="mt-1 block t-small text-content-muted">{hint}</span>}
    </button>
  );
}

export default function QuoteCalculator({ compact = false } = {}) {
  const [step, setStep] = useState(0);
  const reduceMotion = usePrefersReducedMotion();

  // ---- step 1: how big is the roof ----
  const [method, setMethod] = useState("address");
  const [area, setArea] = useState(null);
  const [footprint, setFootprint] = useState(null);
  const [areaRange, setAreaRange] = useState(null);
  const [centre, setCentre] = useState(null);
  const [address, setAddress] = useState(null);

  // ---- step 2: what's the job ----
  const [service, setService] = useState("re-roof");
  const [pitch, setPitch] = useState("medium");
  const [storeys, setStoreys] = useState("one");
  const [access, setAccess] = useState("easy");
  const [condition, setCondition] = useState("unsure");
  const [material, setMaterial] = useState("unsure");
  const [extras, setExtras] = useState([]);

  const cardRef = useRef(null);
  const navigate = useNavigate();
  const factor = PITCH_FACTORS[pitch] ?? 1;

  const toggleExtra = (id) =>
    setExtras((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  /* ---- the three ways in. Switching between them never loses anything ----
     Each method keeps its own result, so someone can look their address up,
     try the map, decide they preferred the first answer and go back to it. */
  const fromAddress = useCallback((roofArea, working) => {
    setArea(Math.min(AREA_MAX, Math.max(AREA_MIN, Math.round(roofArea))));
    setFootprint(working?.footprint ?? null);
    setAreaRange(null);
    setMethod("address");
    if (working?.lat && working?.lon) setCentre([working.lat, working.lon]);
    if (working?.label) setAddress(working.label);
  }, []);

  const fromMap = useCallback((result) => {
    if (!result) return;
    setArea(Math.min(AREA_MAX, Math.max(AREA_MIN, result.roof)));
    setFootprint(result.footprint);
    setAreaRange(null);
    setMethod("map");
  }, []);

  const fromDescribe = useCallback((result) => {
    if (!result) return;
    setArea(Math.min(AREA_MAX, Math.max(AREA_MIN, result.roof)));
    setFootprint(result.footprint);
    setAreaRange([result.low, result.high]);
    setMethod("describe");
  }, []);

  const [tab, setTab] = useState("address");

  /**
   * Everything the visitor told us, handed to the enquiry form.
   *
   * The enquiry form is on the homepage and on /contact, but NOT on
   * /roof-cost, where this tool also lives. The old version just fired an
   * event and scrolled to "#contact"; on /roof-cost there is no such section,
   * so the button dispatched into nothing and scrolled nowhere. It looked
   * broken because it was.
   *
   * So: if the form is on this page, hand it over directly. If it isn't, park
   * the details in sessionStorage and go to the contact page, where the form
   * picks them up as it mounts. Either way nothing is retyped.
   */
  const sendToQuote = () => {
    const svc = SERVICES.find((s) => s.id === service);
    const lines = [
      area
        ? `Roof size: about ${areaRange ? `${areaRange[0]}–${areaRange[1]}` : area} m² (${METHOD_LABEL[method]})`
        : null,
      address ? `Address: ${address}` : null,
      `Job: ${svc.label}`,
      `Pitch: ${PITCHES.find((p) => p.id === pitch).label}`,
      `Storeys: ${STOREYS.find((s) => s.id === storeys).label}`,
      `Access: ${ACCESS.find((a) => a.id === access).label}`,
      `Roof condition: ${CONDITION.find((c) => c.id === condition).label}`,
      `Roofing they want: ${MATERIALS.find((m) => m.id === material).label}`,
      extras.length
        ? `Also mentioned: ${extras.map((e) => EXTRAS.find((x) => x.id === e).label).join(", ")}`
        : null,
    ].filter(Boolean);

    const detail = { service: svc.label, estimate: lines.join("\n"), address: address || "" };

    if (document.querySelector("#contact")) {
      window.dispatchEvent(new CustomEvent("prefill-enquiry", { detail }));
      scrollToHash("#contact");
      return;
    }

    try {
      sessionStorage.setItem(PREFILL_KEY, JSON.stringify(detail));
    } catch {
      // Private browsing — the details are lost, but the navigation still
      // works and the form is still there to fill in.
    }
    navigate("/contact");
  };

  const steps = ["Your roof", "The job", "Summary"];
  const canAdvance = step === 0 ? Boolean(area) : true;

  const goNext = () => {
    if (!canAdvance) return;
    setStep((s) => Math.min(2, s + 1));
  };

  // Bring the top of the panel back into view on a step change, but never
  // hijack the page when the card is already fully visible.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < 0) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      if (window.__lenis) window.__lenis.scrollTo(y);
      else window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [step]);

  const drivers = priceDrivers({
    area,
    areaRange,
    pitch,
    storeys,
    access,
    condition,
    extras,
    service,
  });

  const TABS = [
    { id: "address", label: "Use my address", icon: MapPin },
    { id: "map", label: "Draw it on a map", icon: PencilRuler },
    { id: "describe", label: "Describe my house", icon: Home },
  ];

  return (
    <section
      id={compact ? undefined : "calculator"}
      className={`relative bg-ground ${compact ? "py-8 sm:py-10" : "py-section-sm sm:py-section"}`}
      data-testid="quote-calculator-container"
    >
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        {!compact && (
          <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="t-label text-accent">— Roof size tool</p>
              <h2 className="mt-4 t-h2 text-content">How big is your roof?</h2>
            </div>
            <p className="max-w-xs t-small text-content-muted sm:text-right">
              Most people have no idea, and it's the first thing a roofer needs. Three ways to
              find out — the quickest takes about ten seconds.
            </p>
          </div>
        )}

        <div ref={cardRef} className="border border-line bg-surface shadow-card">
          {/* ---- step tabs ---- */}
          <div className="flex border-b border-line">
            {steps.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => i <= step && setStep(i)}
                disabled={i > step}
                aria-current={i === step ? "step" : undefined}
                className={`flex-1 px-3 py-3.5 text-center font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                  i === step
                    ? "bg-accent/10 text-accent"
                    : i < step
                      ? "text-content-muted hover:bg-surface-hover hover:text-content"
                      : "cursor-not-allowed text-content-faint"
                }`}
                data-testid={`calc-step-tab-${i}`}
              >
                {i + 1}. {s}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-9">
            {/* ================= STEP 1 — how big is the roof ================= */}
            {step === 0 && (
              <div data-testid="calc-step-roof">
                {/* Method picker. The current answer survives switching. */}
                <div className="grid gap-2 sm:grid-cols-3" role="tablist" aria-label="How to find your roof size">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={tab === t.id}
                      onClick={() => setTab(t.id)}
                      className={`btn-lift flex items-center gap-2.5 border px-4 py-3 text-left transition-colors ${
                        tab === t.id
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-line-strong bg-surface text-content-muted hover:border-accent/60 hover:text-content"
                      }`}
                      data-testid={`calc-method-${t.id}`}
                    >
                      <t.icon className="h-4 w-4 shrink-0" />
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-7">
                  {tab === "address" && (
                    <RoofAreaFinder pitch={pitch} onPick={fromAddress} />
                  )}

                  {tab === "map" && (
                    <Suspense
                      fallback={
                        <div className="flex h-[340px] items-center justify-center border border-line bg-surface-sunken sm:h-[420px]">
                          <Loader2 className="h-5 w-5 animate-spin text-content-faint" />
                        </div>
                      }
                    >
                      <RoofMapDrawer centre={centre} onArea={fromMap} pitchFactor={factor} />
                    </Suspense>
                  )}

                  {tab === "describe" && (
                    <HouseDescriber onArea={fromDescribe} pitchFactor={factor} />
                  )}
                </div>

                {/* The running answer, always visible, always labelled with
                    where it came from. */}
                {area && (
                  <div
                    className="mt-7 flex flex-wrap items-center justify-between gap-4 border border-line bg-surface-sunken p-5"
                    data-testid="calc-current-area"
                  >
                    <div className="flex items-center gap-3">
                      <Ruler className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                      <div>
                        <p className="font-display text-xl font-bold text-content">
                          {areaRange ? `${areaRange[0]}–${areaRange[1]} m²` : `${area} m²`}
                        </p>
                        <p className="mt-0.5 t-label text-content-faint">
                          Roof size {METHOD_LABEL[method]}
                          {footprint ? ` · ${footprint} m² footprint` : ""}
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 t-label text-content-faint">
                      Adjust
                      <input
                        type="number"
                        min={AREA_MIN}
                        max={AREA_MAX}
                        value={area}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (!Number.isFinite(n)) return;
                          setArea(n);
                          setAreaRange(null);
                          setMethod("manual");
                        }}
                        className="h-11 w-24 border border-line bg-surface px-3 text-right font-display text-base font-bold text-content outline-none focus:border-accent"
                        data-testid="calc-area-number"
                        aria-label="Roof area in square metres"
                      />
                    </label>

                    {/* The drag slider is back.
                        The original estimator had one and the first version of
                        this rewrite dropped it for a number box alone. That was
                        a straight loss: nudging a figure by feel is far nicer
                        than selecting text and retyping it, especially on a
                        phone. The two are two views of one value — dragging
                        updates the number, typing moves the handle. */}
                    <input
                      type="range"
                      min={AREA_MIN}
                      max={AREA_MAX}
                      step="1"
                      value={area}
                      onChange={(e) => {
                        setArea(Number(e.target.value));
                        setAreaRange(null);
                        setMethod("manual");
                      }}
                      aria-label="Adjust roof area by dragging"
                      className="h-11 w-full min-w-0 basis-full accent-accent"
                      data-testid="calc-area-slider"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ===================== STEP 2 — the job ===================== */}
            {step === 1 && (
              <div className="grid gap-8" data-testid="calc-step-job">
                <div>
                  <p className="t-label text-content-faint">What do you need done?</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {SERVICES.map((s) => (
                      <Choice
                        key={s.id}
                        on={service === s.id}
                        onClick={() => setService(s.id)}
                        label={s.label}
                        hint={s.desc}
                        testid={`calc-service-${s.id}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="t-label text-content-faint">How steep is it?</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {PITCHES.map((p) => (
                      <Choice
                        key={p.id}
                        on={pitch === p.id}
                        onClick={() => setPitch(p.id)}
                        label={p.label}
                        hint={p.hint}
                        testid={`calc-pitch-${p.id}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <p className="t-label text-content-faint">How many storeys?</p>
                    <div className="mt-3 grid gap-2">
                      {STOREYS.map((s) => (
                        <Choice
                          key={s.id}
                          on={storeys === s.id}
                          onClick={() => setStoreys(s.id)}
                          label={s.label}
                          testid={`calc-storeys-${s.id}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="t-label text-content-faint">Getting round the house?</p>
                    <div className="mt-3 grid gap-2">
                      {ACCESS.map((a) => (
                        <Choice
                          key={a.id}
                          on={access === a.id}
                          onClick={() => setAccess(a.id)}
                          label={a.label}
                          hint={a.hint}
                          testid={`calc-access-${a.id}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="t-label text-content-faint">What roofing are you after?</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {MATERIALS.map((m) => (
                      <Choice
                        key={m.id}
                        on={material === m.id}
                        onClick={() => setMaterial(m.id)}
                        label={m.label}
                        hint={m.hint}
                        testid={`calc-material-${m.id}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="t-label text-content-faint">What sort of shape is the roof in?</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {CONDITION.map((c) => (
                      <Choice
                        key={c.id}
                        on={condition === c.id}
                        onClick={() => setCondition(c.id)}
                        label={c.label}
                        hint={c.hint}
                        testid={`calc-condition-${c.id}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="t-label text-content-faint">Anything else on the roof?</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {EXTRAS.map((e) => {
                      const on = extras.includes(e.id);
                      return (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => toggleExtra(e.id)}
                          aria-pressed={on}
                          className={`btn-lift border px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                            on
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-line-strong bg-surface text-content-muted hover:border-accent/60 hover:text-content"
                          }`}
                          data-testid={`calc-extra-${e.id}`}
                        >
                          {e.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ===================== STEP 3 — summary ===================== */}
            {step === 2 && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                data-testid="calc-step-summary"
              >
                <div className="border border-accent/40 bg-accent/10 p-6 sm:p-8">
                  <p className="t-label text-accent">Your roof</p>
                  <p className="mt-3 font-display text-[clamp(2.5rem,7vw,4rem)] font-extrabold leading-none text-content">
                    {areaRange ? `${areaRange[0]}–${areaRange[1]}` : area}
                    <span className="ml-2 text-[0.4em] font-bold">m²</span>
                  </p>
                  <p className="mt-3 t-small text-content-muted">
                    Worked out {METHOD_LABEL[method]}
                    {footprint ? `, from a ${footprint} m² footprint` : ""}. That's roof surface,
                    not floor area.
                  </p>
                </div>

                <div className="mt-10">
                  <h3 className="t-h3 text-content">What will move your price</h3>
                  <p className="mt-2 t-small text-content-muted">
                    Based on what you've told us. These are the things Eugene will be looking at
                    when he comes out.
                  </p>
                  <div className="mt-6 grid gap-px border border-line bg-line">
                    {drivers.map((d) => (
                      <div key={d.title} className="bg-surface p-5 sm:p-6">
                        <p className="flex items-start gap-2.5 font-display text-sm font-bold uppercase tracking-tight text-content">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                          {d.title}
                        </p>
                        <p className="mt-2 pl-[26px] t-small text-content-muted">{d.body}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* The hand-off. Everything above travels with them. */}
                <div className="mt-10 border-t border-line pt-8">
                  <h3 className="t-h3 text-content">Ready for a real number?</h3>
                  <p className="mt-2 max-w-measure t-body text-content-muted">
                    Eugene will come and look at the roof, free, and put a written quote in front
                    of you. Send this through and you won't have to type any of it again.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={sendToQuote}
                      className="btn-lift inline-flex items-center gap-2 bg-accent px-7 py-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent-on hover:bg-accent-hover"
                      data-testid="calc-request-survey-btn"
                    >
                      Send this and book a free look <ArrowUpRight className="h-4 w-4" />
                    </button>
                    <Link
                      to="/roof-cost"
                      className="btn-lift inline-flex items-center gap-2 border border-line-strong bg-surface px-7 py-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-content hover:border-accent hover:text-accent"
                    >
                      More on roofing costs
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* ---- step controls ----
              Stacked on a phone, with Next full width. Side by side, the two
              buttons sat in the bottom corners of the screen — exactly where
              the assistant launcher and the back-to-top button float — so the
              primary action of the whole tool was partly covered. Full width
              means its middle is always clear. */}
          <div className="flex flex-col-reverse gap-3 border-t border-line px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-9">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center justify-center gap-2 py-2 font-mono text-xs uppercase tracking-[0.18em] text-content-muted transition-colors hover:text-content disabled:opacity-30 sm:justify-start sm:py-0"
              data-testid="calc-back-btn"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {step < 2 && (
              <button
                type="button"
                onClick={goNext}
                disabled={!canAdvance}
                title={canAdvance ? undefined : "Find your roof size first"}
                className="btn-lift inline-flex w-full items-center justify-center gap-2 bg-accent px-6 py-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent-on hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent sm:w-auto sm:py-3"
                data-testid="calc-next-btn"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
