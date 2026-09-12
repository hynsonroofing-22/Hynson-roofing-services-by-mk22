import { Link } from "react-router-dom";
import { ALL_SERVICES } from "../data/services";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";

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
export default function Marquee() {
  const reduceMotion = usePrefersReducedMotion();

  // Two copies, so the -50% translate loops seamlessly.
  const one = ALL_SERVICES;
  const items = [...one, ...one];

  if (reduceMotion) {
    // Static: the same content, wrapped, still clickable, no movement at all.
    return (
      <div
        className="border-y border-line bg-surface-sunken py-6"
        data-testid="editorial-marquee"
      >
        <div className="mx-auto flex max-w-page flex-wrap items-center gap-x-7 gap-y-3 px-5 sm:px-8">
          {one.map((s) => (
            <Item key={s.name} s={s} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="group/strip overflow-hidden border-y border-line bg-surface-sunken py-6"
      data-testid="editorial-marquee"
      // The list is duplicated for the loop, so a screen reader would read all
      // twelve twice. It is announced once, as a plain list, from the static
      // markup underneath.
      aria-hidden="true"
    >
      <div className="flex w-max animate-marquee items-center group-hover/strip:[animation-play-state:paused]">
        {items.map((s, i) => (
          <span key={`${s.name}-${i}`} className="flex items-center">
            <Item s={s} />
            {/* The marker. Its scale animation is staggered by index so the
                dots are never all the same size at the same moment. */}
            <span
              className="mx-7 h-1.5 w-1.5 shrink-0 rounded-full bg-accent animate-dot-pulse"
              style={{ animationDelay: `${(i % one.length) * 0.32}s` }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}

/** One service in the strip — a link where it has a page, plain text where it doesn't. */
function Item({ s }) {
  const cls =
    "whitespace-nowrap font-mono text-xs font-semibold uppercase tracking-[0.18em] transition-colors";
  if (s.slug) {
    return (
      <Link to={`/services/${s.slug}`} className={`${cls} text-content hover:text-accent`}>
        {s.name}
      </Link>
    );
  }
  return <span className={`${cls} text-content-muted`}>{s.name}</span>;
}
