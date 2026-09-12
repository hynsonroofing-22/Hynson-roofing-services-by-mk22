import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote, ArrowUpRight, MapPin, ClipboardCheck, Building2 } from "lucide-react";
import { TESTIMONIALS } from "../data/content";
import { scrollToHash } from "./Navbar";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";

/* ------------------------------------------------------------------ *
 * HONESTY — read before editing.
 *
 * There is exactly ONE verified review: Nolan L., from the client's own live
 * site. No star ratings, no review counts, no invented names, no "trusted by
 * N customers". If Eugene has not confirmed it, it does not go on this page.
 * See CLAUDE.md and LAUNCH-BLOCKERS.md.
 *
 * So this section is designed to make ONE review look excellent, rather than
 * to make the section look full. The slider chrome (dots and prev/next
 * arrows) only renders when there is genuinely more than one review — a
 * carousel with a single slide advertises the emptiness.
 *
 * Everything else in here is a fact that can be checked in seconds: Eugene's
 * name, Onehunga, free quotes and site inspections, residential and
 * commercial. Specifics beat adjectives, and they cost nothing to verify.
 * ------------------------------------------------------------------ */

const EASE = [0.16, 1, 0.3, 1];

// The line worth pulling out of Nolan's review. Kept as an exact substring of
// his own words — nothing is paraphrased or sharpened.
const PULL_QUOTE = "The new solution is higher quality than the original installation.";

/** Splits a review into sentences so they can settle in one at a time. */
function sentences(text) {
  return text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const PROOF = [
  { icon: MapPin, label: "Auckland owned & operated", detail: "Based in Onehunga" },
  { icon: ClipboardCheck, label: "Free quotes & site inspections", detail: "On every job" },
  { icon: Building2, label: "Residential & commercial", detail: "Homes, offices, warehouses" },
];

export default function Testimonials() {
  const reviews = TESTIMONIALS.filter((t) => !t.cta);
  const [idx, setIdx] = useState(0);
  const t = reviews[idx];
  const reduceMotion = usePrefersReducedMotion();

  // Only a real carousel gets carousel controls.
  const isCarousel = reviews.length > 1;

  const lines = sentences(t.text);
  const pullIndex = lines.findIndex((l) => l.includes(PULL_QUOTE));
  const rest = lines.filter((_, i) => i !== pullIndex);
  const pull = pullIndex >= 0 ? lines[pullIndex] : null;

  // Each line settles as it comes into view, one after the next. `once` so it
  // never re-plays, and it only moves a few pixels — the review is meant to be
  // readable the instant it appears, not revealed slowly.
  //
  // Timings are deliberately short. At half a second per line with a 60ms
  // stagger, the closing lines of a long review were still arriving well after
  // someone had finished reading the opening ones, which reads as sluggish
  // rather than considered. 0.34s with a 45ms stagger keeps the sense of the
  // lines writing themselves in without ever making anyone wait, and the whole
  // review has settled inside half a second.
  //
  // With reduced motion asked for, this returns no animation props at all:
  // every line is simply there, at full opacity, from the first paint.
  const line = (i) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.34, delay: Math.min(0.045 * i, 0.4), ease: EASE },
        };

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-ink-950 py-28 sm:py-36"
      data-testid="testimonials-slider-section"
    >
      <div className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-brand/10 blur-[120px]" />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        <motion.div {...line(0)} className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-brand-ember uppercase">— What our clients say</p>
            <h2 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] font-extrabold uppercase leading-[1.0] tracking-[-0.02em] text-zinc-50">
              Recommended by <span className="text-brand">word of mouth</span>
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
            Free quotes and site inspections on every job, residential and commercial, across Auckland.
          </p>
        </motion.div>

        <div className="relative border border-ink-700/40 bg-ink-900 p-7 sm:p-14" data-testid="testimonial-card">
          <Quote className="absolute right-7 top-7 h-9 w-9 text-brand/15 sm:right-10 sm:top-10 sm:h-12 sm:w-12" />

          {/* The strongest line, given room to be the thing you actually read. */}
          {pull && (
            <motion.p
              {...line(1)}
              className="max-w-3xl font-display text-[clamp(1.6rem,3.4vw,2.6rem)] font-bold leading-[1.15] tracking-[-0.01em] text-zinc-50"
              data-testid="testimonial-pull-quote"
            >
              “{pull}”
            </motion.p>
          )}

          {/* The rest, quieter, settling in a line at a time. */}
          <blockquote className="mt-7 max-w-2xl space-y-3" data-testid="testimonial-text">
            {rest.map((s, i) => (
              <motion.p key={s} {...line(2 + i)} className="text-base leading-relaxed text-zinc-400">
                {s}
              </motion.p>
            ))}
          </blockquote>

          <motion.div {...line(2 + rest.length)} className="mt-10 flex items-center gap-4 border-t border-ink-700/30 pt-7">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand font-display text-lg font-bold text-white">
              {t.name[0]}
            </span>
            <div>
              <p className="font-display text-base font-bold text-zinc-50" data-testid="testimonial-name">
                {t.name}
              </p>
              <p className="mt-0.5 font-mono text-[10px] tracking-[0.18em] text-zinc-500 uppercase">
                {t.job} · {t.suburb}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Carousel chrome only when there is something to carousel. */}
        {isCarousel && (
          <div className="mt-8 flex items-center justify-between" data-testid="testimonial-controls">
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-1 transition-all duration-200 ${i === idx ? "w-10 bg-brand" : "w-5 bg-ink-700/30 hover:bg-ink-700/40"}`}
                  data-testid={`testimonial-dot-${i}`}
                  aria-label={`Review ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIdx((idx - 1 + reviews.length) % reviews.length)}
                className="btn-lift border border-ink-700/50 bg-ink-900 p-3 text-zinc-300 hover:border-brand hover:text-brand"
                data-testid="testimonial-prev-btn"
                aria-label="Previous review"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIdx((idx + 1) % reviews.length)}
                className="btn-lift border border-ink-700/50 bg-ink-900 p-3 text-zinc-300 hover:border-brand hover:text-brand"
                data-testid="testimonial-next-btn"
                aria-label="Next review"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Verifiable specifics rather than adjectives. Every one of these is
            confirmed from the client's own site. */}
        <div className="mt-12 grid gap-px border border-ink-700/30 bg-ink-700/30 sm:grid-cols-3" data-testid="testimonial-proof">
          {PROOF.map((p, i) => (
            <motion.div key={p.label} {...line(i)} className="bg-ink-950 p-6">
              <p.icon className="h-4 w-4 text-brand" />
              <p className="mt-3 font-display text-sm font-bold uppercase tracking-tight text-zinc-50">{p.label}</p>
              <p className="mt-1 text-xs text-zinc-500">{p.detail}</p>
            </motion.div>
          ))}
        </div>

        <motion.div {...line(1)} className="mt-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-2xl font-extrabold uppercase leading-[1.05] tracking-tight text-zinc-50 sm:text-3xl">
              Your project <span className="text-brand">could be next.</span>
            </p>
            <p className="mt-2 max-w-md text-sm text-zinc-400">
              Free quotations and site assessments for residential and commercial roofing across Auckland.
            </p>
          </div>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToHash("#contact");
            }}
            className="btn-lift inline-flex shrink-0 items-center gap-2 bg-brand px-7 py-4 font-mono text-xs font-semibold tracking-[0.25em] text-white uppercase hover:bg-brand-bright"
            data-testid="testimonial-cta-btn"
          >
            Get my free quote <ArrowUpRight className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
