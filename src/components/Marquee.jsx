import { Check } from "lucide-react";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";

/**
 * The four things worth saying about Hynson before anyone reads a word of the
 * page. Every one is checkable in seconds and none needed confirming.
 *
 * These were briefly replaced with a scrolling list of the twelve services.
 * That made the strip a navigation bar, which it is not — the services are
 * already in the header dropdown and the footer, and a customer skimming past
 * does not need a third copy. What they need at that moment is a reason to
 * keep reading, which is what these four are.
 *
 * NOTE ON WHAT IS NOT HERE: no response time, no years trading, no rating, no
 * guarantee. "Emergency roofing available" names the service; it deliberately
 * does not promise a speed, because no speed has ever been confirmed.
 */
const TRUST_ITEMS = [
  "Free, no-obligation quotes",
  "Auckland owned & operated",
  "Real photos, real jobs",
  "Residential & commercial",
  "Emergency roofing available",
];

/**
 * The banner strip.
 *
 * WHAT IT IS FOR — decided before any of it was styled.
 *
 * It used to carry four trust lines that already appear, in full sentences, in
 * the section immediately below it. A strip that repeats the next section is
 * decoration, and it read as decoration.
 *
 * It now carries the twelve real services, and six of them are links to their
 * own page. That makes it the fastest route into the deepest part of the site
 * from the homepage, which is a job worth doing — and it is the one piece of
 * content on the page that genuinely benefits from being a long scrolling
 * line, because there are twelve of them and they are all short.
 *
 * The four trust lines were not deleted. They are stated properly on the About
 * page and in the "why choose us" section, where a sentence has room to be a
 * sentence.
 *
 * MOTION
 * ------
 * The track is a single CSS transform animation — no JavaScript runs per
 * frame, so it composites on the GPU and holds 60fps while the rest of the
 * page is doing its own work.
 *
 * The dot markers grow and shrink as they travel. Each dot runs the same short
 * scale animation with its delay staggered by index, so at any moment they are
 * all at different sizes and each one visibly swells and settles as it crosses
 * the screen. It is `transform: scale` only — the cheapest thing a browser can
 * animate — and it needs no measurement, which is what keeps it smooth at any
 * width.
 *
 * It pauses on hover so a name can actually be read and clicked, and anyone
 * who has asked for reduced motion gets a static, wrapped row instead of a
 * moving one — not a slower version of the same thing.
 */
/** One line in the strip: a tick, the claim, and a travelling dot after it. */
function Item({ text, delay }) {
  return (
    <span className="flex shrink-0 items-center">
      <Check className="mr-2.5 h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={3} aria-hidden="true" />
      <span className="whitespace-nowrap font-mono text-xs font-semibold uppercase tracking-[0.16em] text-content">
        {text}
      </span>
      <span
        className="mx-8 h-1.5 w-1.5 shrink-0 rounded-full bg-accent animate-dot-pulse"
        style={{ animationDelay: delay }}
        aria-hidden="true"
      />
    </span>
  );
}

export default function Marquee() {
  const reduceMotion = usePrefersReducedMotion();

  if (reduceMotion) {
    // Static: the same four claims, wrapped, no movement at all.
    return (
      <div className="border-y border-line bg-surface-sunken py-6" data-testid="editorial-marquee">
        <ul className="mx-auto flex max-w-page flex-wrap items-center gap-x-8 gap-y-3 px-5 sm:px-8">
          {TRUST_ITEMS.map((t) => (
            <li
              key={t}
              className="flex items-center gap-2.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-content"
            >
              <Check className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={3} aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Two copies, so the -50% translate loops seamlessly.
  const items = [...TRUST_ITEMS, ...TRUST_ITEMS];

  return (
    <div
      className="group/strip overflow-hidden border-y border-line bg-surface-sunken py-6"
      data-testid="editorial-marquee"
    >
      {/* The visible, moving copy. Duplicated for the loop, so it is hidden
          from screen readers and announced once from the list below. */}
      <div
        className="flex w-max animate-marquee items-center group-hover/strip:[animation-play-state:paused]"
        aria-hidden="true"
      >
        {items.map((t, i) => (
          <Item key={`${t}-${i}`} text={t} delay={`${(i % TRUST_ITEMS.length) * 0.36}s`} />
        ))}
      </div>
      <ul className="sr-only">
        {TRUST_ITEMS.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
