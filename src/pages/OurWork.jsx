import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import PageShell from "../components/PageShell";
import { Section, SectionHead, CtaBand, useSettle } from "../components/PageParts";
import { GALLERY, PROJECTS } from "../data/content";

/**
 * The full gallery, on a page of its own.
 *
 * Two sets, shown together: the eight on-the-job photographs, grouped by what
 * is visible in each, and the six project types from the client's portfolio.
 * Nothing here claims a suburb, a date, a client or a job value, because none
 * of those has been confirmed.
 */

const FILTERS = [
  { id: "all", label: "All work" },
  { id: "Re-roofing", label: "Re-roofing" },
  { id: "Flashings", label: "Flashings" },
  { id: "Commercial", label: "Commercial" },
  { id: "Project types", label: "Project types" },
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
    tag: g.tag,
    w: 480,
    h: 360,
  }));

  const portfolio = PROJECTS.map((p) => ({
    key: p.id,
    src: p.image,
    alt: `${p.title} — ${p.category.toLowerCase()} roofing in ${p.location}`,
    title: p.title,
    desc: p.desc,
    suburb: p.location,
    tag: "Project types",
    w: 1024,
    h: 1024,
  }));

  const items = [...onsite, ...portfolio];
  const shown = filter === "all" ? items : items.filter((i) => i.tag === filter);

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
                  width={item.w}
                  height={item.h}
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

        <motion.p {...settle(0.05)} className="mt-10 max-w-measure t-small text-content-faint">
          Want to see something closer to your own roof before you commit? Ring and ask — Eugene has
          plenty more on his phone.
        </motion.p>
      </Section>

      <CtaBand
        title="Want your roof to be one of these?"
        lead="Free look at the roof, written quote, no obligation. Residential and commercial, right across Auckland."
      />
    </PageShell>
  );
}
