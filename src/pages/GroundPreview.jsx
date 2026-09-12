import { MARQUEE_ITEMS } from "../data/content";

/**
 * Light-mode ground comparison — a working page, not a mockup.
 *
 * The brief was that cream fights the orange: both are warm, so the accent
 * stops popping and the page reads muddy. This puts four candidate grounds
 * side by side using the SAME real content, the same real fonts and exactly
 * the same orange, so the only variable being judged is the ground itself.
 *
 * It is a route rather than a static image on purpose: rendered in the real
 * browser with Cabinet Grotesk and Plus Jakarta Sans actually loaded, at the
 * real weights and sizes. A screenshot of a mockup would not tell you what the
 * orange does against each one.
 *
 * DELETE THIS PAGE once a ground is chosen. It is a decision aid, not part of
 * the site, and it is not linked from anywhere.
 */

// Every candidate carries a full set, not just a background: a ground alone
// tells you nothing until you see what the borders, the raised cards and the
// muted text have to do to sit on it.
const GROUNDS = [
  {
    id: "current",
    name: "What's there now",
    note: "Cream. Warm ground against a warm accent — the orange has nothing to push against.",
    current: true,
    ground: "#F7F3EB",
    raised: "#FDFBF7",
    border: "#DCD4C0",
    text: "#2A2F2D",
    muted: "#6F7975",
  },
  {
    id: "a",
    name: "A · Cool off-white",
    note: "Faintly blue-grey. The coldest of the three, so the orange reads hottest against it.",
    ground: "#F3F4F6",
    raised: "#FFFFFF",
    border: "#DFE2E7",
    text: "#17181A",
    muted: "#5C6169",
  },
  {
    id: "b",
    name: "B · Warm stone",
    note: "Warm, but far less than cream — closer to paper than to sand.",
    ground: "#F6F5F3",
    raised: "#FFFFFF",
    border: "#E4E1DC",
    text: "#1A1917",
    muted: "#63605A",
  },
  {
    id: "c",
    name: "C · Near-white",
    note: "Almost white. Maximum contrast, and the least character of its own.",
    ground: "#FBFBFC",
    raised: "#FFFFFF",
    border: "#E6E7EA",
    text: "#141519",
    muted: "#5A5D64",
  },
];

// Identical in all four. This is the whole point of the exercise.
const BRAND = "#C2610F";
const BRAND_BRIGHT = "#E27614";

// Real services, real descriptions, from the client's own site.
const CARDS = [
  {
    num: "01",
    tag: "Homes",
    title: "Residential Roofing",
    desc: "Re-roofing, repairs and ongoing maintenance, built for New Zealand conditions.",
  },
  {
    num: "02",
    tag: "Business",
    title: "Commercial Roofing",
    desc: "Offices, warehouses and retail — membrane and long-run systems.",
  },
  {
    num: "03",
    tag: "Rapid response",
    title: "Emergency Roofing",
    desc: "Leaks, storm damage and urgent repairs before they turn into bigger ones.",
  },
];

function Panel({ g }) {
  // Plain inline styles rather than Tailwind classes, so each panel can carry
  // its own palette without any of them being able to inherit the page theme.
  const s = {
    ground: { background: g.ground, color: g.text },
    raised: { background: g.raised, borderColor: g.border },
    muted: { color: g.muted },
  };

  return (
    <section style={s.ground} data-testid={`ground-${g.id}`}>
      {/* Which one you're looking at, and its actual hex values. */}
      <div
        style={{ borderBottom: `1px solid ${g.border}` }}
        className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-5 sm:flex-row sm:items-baseline sm:justify-between"
      >
        <div>
          <p className="font-display text-lg font-extrabold uppercase tracking-tight">
            {g.name}
            {g.current && (
              <span
                style={{ color: BRAND }}
                className="ml-3 font-mono text-[10px] font-semibold tracking-[0.2em]"
              >
                CURRENT
              </span>
            )}
          </p>
          <p style={s.muted} className="mt-1 max-w-lg text-sm leading-relaxed">
            {g.note}
          </p>
        </div>
        <p style={s.muted} className="shrink-0 font-mono text-[10px] tracking-[0.15em] uppercase">
          ground {g.ground} · text {g.text}
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
        {/* ---- the hero ---- */}
        <p
          style={{ color: BRAND }}
          className="font-mono text-[10px] font-semibold tracking-[0.3em] uppercase"
        >
          — Hynson Roofing Services Ltd · Auckland NZ
        </p>
        <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold uppercase leading-[1.0] tracking-[-0.02em]">
          Built on quality.
          <br />
          <span style={{ color: BRAND }}>Auckland roofing, done right.</span>
        </h2>
        <p style={s.muted} className="mt-6 max-w-[60ch] text-base leading-relaxed">
          Re-roofing, repairs, new installs and gutters — residential and commercial, across
          Auckland. Free quotations and site assessments on every job.
        </p>

        {/* ---- the buttons ---- */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            style={{ background: BRAND, color: "#fff" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_BRIGHT)}
            onMouseLeave={(e) => (e.currentTarget.style.background = BRAND)}
            className="btn-lift px-7 py-4 font-mono text-xs font-semibold tracking-[0.22em] uppercase"
          >
            Get a free quote
          </button>
          <button
            type="button"
            style={{ ...s.raised, borderWidth: 1, borderStyle: "solid", color: g.text }}
            className="btn-lift px-7 py-4 font-mono text-xs font-semibold tracking-[0.22em] uppercase"
          >
            020 4028 1926
          </button>
        </div>

        {/* ---- the card row ---- */}
        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {CARDS.map((c) => (
            <div
              key={c.num}
              style={{ ...s.raised, borderWidth: 1, borderStyle: "solid" }}
              className="p-6"
            >
              <div className="flex items-start justify-between">
                <span style={s.muted} className="font-mono text-[10px] tracking-[0.2em]">
                  {c.num}
                </span>
                <span
                  style={{ color: BRAND }}
                  className="font-mono text-[9px] tracking-[0.18em] uppercase"
                >
                  {c.tag}
                </span>
              </div>
              <p className="mt-5 font-display text-base font-bold uppercase tracking-tight">
                {c.title}
              </p>
              <p style={s.muted} className="mt-2 text-sm leading-relaxed">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ---- the strip ---- */}
      <div
        style={{ borderTop: `1px solid ${g.border}`, borderBottom: `1px solid ${g.border}` }}
        className="overflow-hidden py-5"
      >
        <div className="flex items-center gap-8 whitespace-nowrap px-6">
          {MARQUEE_ITEMS.map((item) => (
            <span key={item} className="flex shrink-0 items-center gap-8">
              <span className="font-mono text-[11px] font-semibold tracking-[0.22em] uppercase">
                {item}
              </span>
              <span
                style={{ background: BRAND }}
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                aria-hidden="true"
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function GroundPreview() {
  return (
    // `light` is forced by simply not putting `dark` anywhere above this, and
    // each panel sets its own colours outright, so the site's theme toggle
    // cannot interfere with the comparison.
    <div className="min-h-screen bg-white" data-testid="ground-preview">
      <header className="mx-auto max-w-6xl px-6 py-10">
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: BRAND }}>
          — Decision aid · not part of the site
        </p>
        <h1 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-tight text-black sm:text-4xl">
          Which light ground?
        </h1>
        <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-neutral-600">
          Same content, same fonts, same orange (#C2610F / #E27614) in all four. The only thing
          changing is the ground and the text colour that sits on it. Scroll through and compare
          how hard the orange has to work in each.
        </p>
      </header>

      {GROUNDS.map((g) => (
        <Panel key={g.id} g={g} />
      ))}

      <footer className="mx-auto max-w-6xl px-6 py-14">
        <p className="text-sm leading-relaxed text-neutral-600">
          Once one is chosen, this page gets deleted and its values become the light half of the
          colour tokens — every one of which gets a dark counterpart.
        </p>
      </footer>
    </div>
  );
}
