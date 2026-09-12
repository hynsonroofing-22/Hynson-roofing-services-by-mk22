import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, X, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { PROJECTS } from "../data/content";
import useScrollLock from "../hooks/useScrollLock";

const FILTERS = ["All", "Residential", "Commercial"];

export default function Projects() {
  const [filter, setFilter] = useState("All");
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const visible = filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);

  // Same lock as the other two overlays. Without it, scrolling while the
  // lightbox was open moved the gallery behind it.
  useScrollLock(lightboxIdx !== null);

  const close = useCallback(() => setLightboxIdx(null), []);
  const prev = useCallback(() => setLightboxIdx((i) => (i === null ? i : (i - 1 + visible.length) % visible.length)), [visible.length]);
  const next = useCallback(() => setLightboxIdx((i) => (i === null ? i : (i + 1) % visible.length)), [visible.length]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, close, prev, next]);

  return (
    <section id="projects" className="bg-ink-900 py-28 sm:py-36" data-testid="projects-gallery-section">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"
        >
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-brand-ember uppercase">— Our recent projects</p>
            <h2 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] font-extrabold uppercase leading-[1.0] tracking-[-0.02em] text-zinc-50">
              Work we're <span className="text-brand">proud of</span>
            </h2>
          </div>
          <div className="max-w-sm">
            <p className="text-sm text-zinc-400">
              A snapshot of recent residential and commercial roofing projects across Auckland.
            </p>
            {/* A snapshot, and now it says so — the full gallery lives on its
                own page where it can hold everything Eugene sends. */}
            <Link
              to="/our-work"
              className="btn-lift mt-5 inline-flex items-center gap-2 border border-line-strong bg-surface px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-content hover:border-accent hover:text-accent"
              data-testid="projects-see-all"
            >
              See all our work <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>

        <div className="mb-10 flex flex-wrap gap-2" data-testid="projects-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn-lift relative rounded-full border px-5 py-2 font-mono text-[11px] tracking-[0.2em] uppercase ${
                filter === f ? "border-brand text-white" : "border-ink-700/50 bg-ink-900 text-zinc-400 hover:border-brand hover:text-brand"
              }`}
              data-testid={`filter-${f.toLowerCase()}`}
            >
              {filter === f && (
                <motion.span
                  layoutId="filter-underline"
                  className="absolute inset-0 rounded-full bg-brand"
                  // Was a spring. The brief asks for nothing bouncy — this is
                  // now the same ease-out everything else on the page uses.
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <span className="relative">{f}</span>
            </button>
          ))}
        </div>
      </div>

      {/* deliberately bleeds past the right edge — a scrollable row, not a
          tidy stopped grid, so it's obvious there's more to see */}
      <div className="w-full overflow-x-auto pb-4">
        <motion.div layout className="flex snap-x gap-6 px-5 sm:px-8">
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => (
              <motion.article
                layout
                key={p.id}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setLightboxIdx(i)}
                className="group w-[85vw] shrink-0 snap-start cursor-pointer overflow-hidden border border-ink-700/40 bg-ink-900 transition-shadow duration-200 sm:w-[300px]"
                data-testid={`project-card-${p.id}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* Every card is aspect-[4/3] with object-cover, so the row
                      stays a single rhythm whatever shape the source file is.
                      The aspect box already reserves the space, and the stated
                      width/height mean the browser knows the ratio even before
                      the CSS applies. */}
                  <img
                    src={p.image}
                    alt={`${p.title} — a Hynson Roofing project in ${p.location}`}
                    width="1024"
                    height="1024"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 font-mono text-[9px] tracking-[0.2em] text-brand uppercase backdrop-blur">
                    {p.category}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-4 transition-transform duration-200 ease-out group-hover:translate-y-0">
                    <p className="flex items-center gap-1.5 text-xs text-white">
                      <MapPin className="h-3 w-3" /> {p.location}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-sm font-bold uppercase tracking-tight text-zinc-50">{p.title}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                    <MapPin className="h-3 w-3 text-brand" /> {p.location}
                  </p>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {createPortal(
        <AnimatePresence>
        {lightboxIdx !== null && visible[lightboxIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overscroll-contain bg-black/80 p-6"
            onClick={close}
            // See Modal.jsx — without this, Lenis's stopped-state
            // preventDefault kills scrolling inside the lightbox too.
            data-lenis-prevent
            data-testid="project-lightbox"
          >
            <button
              onClick={close}
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Close"
              data-testid="lightbox-close"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-8"
              aria-label="Previous"
              data-testid="lightbox-prev"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-8"
              aria-label="Next"
              data-testid="lightbox-next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <motion.div
              key={lightboxIdx}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) next();
                else if (info.offset.x > 80) prev();
              }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-3xl overflow-hidden bg-ink-900"
            >
              <img
                src={visible[lightboxIdx].image}
                alt={`${visible[lightboxIdx].title} — a Hynson Roofing project in ${visible[lightboxIdx].location}`}
                width="1024"
                height="1024"
                decoding="async"
                className="max-h-[70vh] w-full object-cover"
              />
              <div className="flex items-center justify-between p-5">
                <div>
                  <h3 className="font-display text-lg font-bold uppercase text-zinc-50">{visible[lightboxIdx].title}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
                    <MapPin className="h-3 w-3 text-brand" /> {visible[lightboxIdx].location}
                  </p>
                </div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">{lightboxIdx + 1} / {visible.length}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}
