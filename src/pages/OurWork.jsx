import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, AlertTriangle } from "lucide-react";
import PageShell from "../components/PageShell";
import { Section, SectionHead, CtaBand, useSettle } from "../components/PageParts";
import { GALLERY, PROJECTS } from "../data/content";

/**
 * The full gallery, on a page of its own.
 *
 * The homepage keeps its pinned horizontal gallery exactly as it was — nothing
 * is taken away from it. This page is the version that can hold everything
 * Eugene ever sends, rather than being capped by what fits in a homepage
 * section.
 *
 * TWO HONESTY NOTES, both visible on the page rather than only in here:
 *
 *  1. No suburb is claimed for any photo. Every one shows "Auckland", which is
 *     the verified region, and the page says why. (LAUNCH-BLOCKERS.md #3b)
 *  2. The six portfolio images are separated from the eight on-the-job photos
 *     and carry a visible note, because they do not look like photographs of
 *     Hynson's own work and that has not yet been confirmed either way.
 *     (LAUNCH-BLOCKERS.md #3a)
 */

const FILTERS = [
  { id: "all", label: "All work" },
  { id: "onsite", label: "On the tools" },
  { id: "portfolio", label: "Project types" },
];

export default function OurWork() {
  const [filter, setFilter] = useState("all");
  const settle = useSettle();

  const onsite = GALLERY.map((g) => ({
    key: g.id,
    src: g.image,
    alt: `${g.job} — a Hynson Roofing job in Auckland`,
    title: g.job,
    suburb: g.suburb,
    kind: "onsite",
  }));

  const portfolio = PROJECTS.map((p) => ({
    key: p.id,
    src: p.image,
    alt: `${p.title} — ${p.category} roofing`,
    title: p.title,
    desc: p.desc,
    suburb: null,
    kind: "portfolio",
  }));

  const shown =
    filter === "onsite" ? onsite : filter === "portfolio" ? portfolio : [...onsite, ...portfolio];

  return (
    <PageShell current="Our work">
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-page px-5 py-14 sm:px-8 sm:py-20">
          <motion.div {...settle()} className="max-w-measure">
            <p className="t-label text-accent">— Our recent work</p>
            <h1 className="mt-5 t-display text-content">Roofs Hynson has worked on</h1>
            <p className="mt-6 t-body text-content-muted">
              Real photographs from real jobs. No stock, nothing generated.
            </p>
          </motion.div>
        </div>
      </section>

      <Section tone="ground">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow="The gallery" title="Every photo we have" />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter work" data-testid="work-filters">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`btn-lift border px-5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                  filter === f.id
                    ? "border-accent bg-accent text-accent-on"
                    : "border-line-strong bg-surface text-content-muted hover:border-accent hover:text-accent"
                }`}
                data-testid={`work-filter-${f.id}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visible placeholder marker, not a comment in the source. Comes off
            the moment Eugene supplies real suburbs. */}
        <motion.p
          {...settle(0.05)}
          className="mt-8 flex items-start gap-2.5 border border-dashed border-warning/60 bg-warning/10 p-4 t-small text-content-muted"
          data-testid="work-suburb-placeholder"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
          <span>
            <strong className="text-content">Placeholder · suburbs awaiting confirmation.</strong>{" "}
            Every photo shows "Auckland" because that's the only location confirmed. Nothing here is
            guessed.
          </span>
        </motion.p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((item, i) => (
            <motion.figure
              key={item.key}
              {...settle(Math.min(i * 0.03, 0.2))}
              className="surface-card group overflow-hidden"
              data-testid={`work-item-${item.key}`}
            >
              {/* One aspect ratio for every card, whatever shape the file is. */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={item.src}
                  alt={item.alt}
                  width="480"
                  height="360"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
              </div>
              <figcaption className="p-5">
                <h3 className="t-h3 text-content">{item.title}</h3>
                <p className="mt-2 flex items-center gap-1.5 t-label text-content-faint">
                  <MapPin className="h-3 w-3 text-accent" aria-hidden="true" />
                  {item.suburb || "Auckland"}
                </p>
                {item.desc && <p className="mt-3 t-small text-content-muted">{item.desc}</p>}
              </figcaption>
            </motion.figure>
          ))}
        </div>

        {(filter === "all" || filter === "portfolio") && (
          <motion.p
            {...settle(0.05)}
            className="mt-10 flex items-start gap-2.5 border border-dashed border-warning/60 bg-warning/10 p-4 t-small text-content-muted"
            data-testid="work-portfolio-note"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            <span>
              <strong className="text-content">Placeholder · the six "project type" images are
              awaiting confirmation.</strong>{" "}
              They came from the client's current site but don't look like photographs of his own
              jobs, so they're shown as illustrations of the work rather than as a portfolio. The
              eight above are verified Hynson jobs.
            </span>
          </motion.p>
        )}
      </Section>

      <CtaBand
        title="Want your roof to be one of these?"
        lead="Free quotations and site assessments for residential and commercial roofing across Auckland."
      />
    </PageShell>
  );
}
