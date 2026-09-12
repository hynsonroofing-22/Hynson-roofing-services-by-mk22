import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Phone, Check } from "lucide-react";
import { PHONE_DISPLAY, PHONE_TEL } from "../data/content";
import { PROCESS } from "../data/services";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";

/**
 * The pieces every inner page is built from.
 *
 * Defined once so the whitespace, the type scale, the grid and the one card
 * treatment are literally the same object on every page rather than six
 * near-identical copies that drift apart. That sameness is most of what makes
 * a set of pages feel like one site.
 */

const EASE = [0.16, 1, 0.3, 1];

/**
 * Sections settle in as they arrive: a short fade and eight pixels of travel,
 * once only. Deliberately quick and deliberately small — the text is legible
 * from the first frame, so nobody is ever waiting on an animation to read.
 * Returns nothing at all under reduced motion, so the content is simply there.
 */
export function useSettle() {
  const reduce = usePrefersReducedMotion();
  return (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 8 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.4, delay, ease: EASE },
        };
}

/** One page-width container and one vertical rhythm, used by everything. */
export function Section({ children, className = "", tone = "ground", ...rest }) {
  const grounds = {
    ground: "bg-ground",
    surface: "bg-surface",
    sunken: "bg-surface-sunken",
  };
  return (
    <section className={`${grounds[tone]} py-section-sm sm:py-section ${className}`} {...rest}>
      <div className="mx-auto max-w-page px-5 sm:px-8">{children}</div>
    </section>
  );
}

/** Eyebrow + heading + optional standfirst, in the one arrangement. */
export function SectionHead({ eyebrow, title, lead, className = "" }) {
  const settle = useSettle();
  return (
    <motion.div {...settle()} className={`max-w-measure ${className}`}>
      {eyebrow && <p className="t-label text-accent">— {eyebrow}</p>}
      <h2 className="mt-4 t-h2 text-content">{title}</h2>
      {lead && <p className="mt-5 t-body text-content-muted">{lead}</p>}
    </motion.div>
  );
}

/** The page's own top block: breadcrumb sits above it, content below. */
export function PageHero({ eyebrow, title, lead, image }) {
  const settle = useSettle();
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto grid max-w-page gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
        <motion.div {...settle()}>
          <p className="t-label text-accent">— {eyebrow}</p>
          <h1 className="mt-5 t-display text-content">{title}</h1>
          <p className="mt-6 t-body text-content-muted">{lead}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <PrimaryLink to="/contact">Get a free quote</PrimaryLink>
            <CallLink />
          </div>
        </motion.div>

        {image && (
          <motion.figure {...settle(0.08)} className="relative">
            {/* One aspect ratio for every hero image on every page. */}
            <div className="aspect-[4/3] overflow-hidden border border-line shadow-card">
              <img
                src={image.src}
                alt={image.alt}
                width="480"
                height="360"
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 t-label text-content-faint">
              {image.caption} · Auckland
            </figcaption>
          </motion.figure>
        )}
      </div>
    </section>
  );
}

/** The one primary button. There is a single one of these per section. */
export function PrimaryLink({ to, href, children, className = "" }) {
  const cls =
    "btn-lift inline-flex items-center gap-2 bg-accent px-7 py-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent-on hover:bg-accent-hover " +
    className;
  if (href) {
    return (
      <a href={href} className={cls}>
        {children} <ArrowUpRight className="h-4 w-4" />
      </a>
    );
  }
  return (
    <Link to={to} className={cls}>
      {children} <ArrowUpRight className="h-4 w-4" />
    </Link>
  );
}

/** The one secondary button. */
export function SecondaryLink({ to, href, children }) {
  const cls =
    "btn-lift inline-flex items-center gap-2 border border-line-strong bg-surface px-7 py-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-content hover:border-accent hover:text-accent";
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={cls}>
      {children}
    </Link>
  );
}

export function CallLink() {
  return (
    <a
      href={`tel:${PHONE_TEL}`}
      className="btn-lift inline-flex items-center gap-2 border border-line-strong bg-surface px-7 py-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-content hover:border-accent hover:text-accent"
    >
      <Phone className="h-4 w-4 text-accent" /> {PHONE_DISPLAY}
    </a>
  );
}

/**
 * A ticked list. Used for "when you need it" and "what we do".
 *
 * Kept to short lines on purpose: these are things you scan, not read. If an
 * item needs a sentence to explain it, it belongs in the prose above.
 */
export function TickList({ items, testid }) {
  const settle = useSettle();
  return (
    <ul className="mt-6 grid gap-3" data-testid={testid}>
      {items.map((t, i) => (
        <motion.li
          key={t}
          {...settle(Math.min(i * 0.04, 0.2))}
          className="flex gap-3 t-small text-content-muted"
        >
          <Check className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <span>{t}</span>
        </motion.li>
      ))}
    </ul>
  );
}

/**
 * The four-step process, identical on every service page.
 *
 * Carries no timings on purpose — how long any of this takes has never been
 * confirmed by the client, and a made-up "within 48 hours" is exactly the kind
 * of thing this project has shipped before and had to take back.
 */
export function ProcessBlock() {
  const settle = useSettle();
  return (
    <Section tone="sunken" data-testid="process-block">
      <SectionHead eyebrow="How it works" title="What happens next" />
      <div className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {PROCESS.map((p, i) => (
          <motion.div key={p.step} {...settle(Math.min(i * 0.06, 0.24))} className="bg-surface p-7">
            <p className="t-label text-accent">{p.step}</p>
            <h3 className="mt-4 t-h3 text-content">{p.title}</h3>
            <p className="mt-3 t-small text-content-muted">{p.body}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/**
 * Three real Hynson photographs, captioned with what is actually in them.
 *
 * Every caption describes only what is visible in the photograph — no claim
 * about when, where or for whom. The suburb is not stated because no suburb
 * has been confirmed for any of these; the verified region, Auckland, is.
 */
export function WorkStrip({ photos, heading = "Real Hynson work" }) {
  const settle = useSettle();
  return (
    <Section tone="ground" data-testid="work-strip">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <SectionHead eyebrow="On the tools" title={heading} />
        <SecondaryLink to="/our-work">See all our work</SecondaryLink>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {photos.map((p, i) => (
          <motion.figure key={p.src} {...settle(Math.min(i * 0.06, 0.2))}>
            {/* Same 4:3 box as every other photo on the site. */}
            <div className="aspect-[4/3] overflow-hidden border border-line shadow-card">
              <img
                src={p.src}
                alt={p.alt}
                width="480"
                height="360"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 t-label text-content-faint">{p.caption}</figcaption>
          </motion.figure>
        ))}
      </div>
    </Section>
  );
}

/** The FAQ block. Plain details/summary — no library, keyboard-native. */
export function FaqBlock({ faqs }) {
  const settle = useSettle();
  if (!faqs || !faqs.length) return null;
  return (
    <Section tone="surface" data-testid="faq-block">
      <SectionHead eyebrow="Common questions" title="Worth knowing" />
      <div className="mt-10 max-w-3xl border-t border-line">
        {faqs.map((f, i) => (
          <motion.details
            key={f.q}
            {...settle(Math.min(i * 0.05, 0.2))}
            className="group border-b border-line py-5"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 t-h3 text-content transition-colors hover:text-accent">
              {f.q}
              <span
                className="mt-0.5 shrink-0 font-mono text-lg leading-none text-accent transition-transform duration-200 group-open:rotate-45"
                aria-hidden="true"
              >
                +
              </span>
            </summary>
            <p className="mt-4 t-body text-content-muted">{f.a}</p>
          </motion.details>
        ))}
      </div>
    </Section>
  );
}

/** The closing call to action. One per page, always the same shape. */
export function CtaBand({
  title = "Get a free quote",
  lead = "Free site inspections across Auckland. No obligation.",
}) {
  const settle = useSettle();
  return (
    <section className="border-y border-line bg-surface-sunken" data-testid="cta-band">
      <motion.div
        {...settle()}
        className="mx-auto flex max-w-page flex-col items-start justify-between gap-7 px-5 py-14 sm:px-8 sm:py-16 lg:flex-row lg:items-center"
      >
        <div>
          <h2 className="t-h2 text-content">{title}</h2>
          <p className="mt-3 t-body text-content-muted">{lead}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <PrimaryLink to="/contact">Get a free quote</PrimaryLink>
          <CallLink />
        </div>
      </motion.div>
    </section>
  );
}

/** Related links at the foot of a service page. */
export function RelatedLinks({ links }) {
  const settle = useSettle();
  if (!links || !links.length) return null;
  return (
    <Section tone="ground" data-testid="related-links">
      <SectionHead eyebrow="Related" title="Other work Hynson does" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {links.map((s, i) => (
          <motion.div key={s.slug} {...settle(Math.min(i * 0.05, 0.15))}>
            <Link
              to={`/services/${s.slug}`}
              className="surface-card group flex h-full flex-col p-6"
            >
              <span className="t-label text-accent">{s.tag}</span>
              <span className="mt-4 t-h3 text-content group-hover:text-accent">{s.name}</span>
              <span className="mt-3 t-small text-content-muted">{s.blurb}</span>
              <span className="mt-5 inline-flex items-center gap-1.5 t-label text-content-faint group-hover:text-accent">
                Read more <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
