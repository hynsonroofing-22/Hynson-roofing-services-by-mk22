import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMediaQuery, usePrefersReducedMotion } from "../hooks/useMediaQuery";

/**
 * A short full-width photograph near the bottom of the page, with the content
 * scrolling past it. A breather between the enquiry form and the footer, not a
 * feature — hence the deliberately small height.
 *
 * THE PHOTO IS A REAL HYNSON JOB. `hero-bg-original` is the client's own shot
 * of a re-roof with the scaffold still standing; the faint backdrop behind the
 * address finder is a blurred crop of the same file. No stock and no generated
 * imagery anywhere on this site.
 *
 * WHY TRANSFORM AND NOT `background-attachment: fixed`
 * ---------------------------------------------------
 * `background-attachment: fixed` is the one-line way to do this and it is a
 * trap. It forces the browser to repaint the whole background on every scroll
 * frame instead of just compositing it, which stutters badly on mid-range
 * laptops, and iOS Safari has never supported it properly — it either pins the
 * image to the viewport or ignores the attachment entirely, so the effect is
 * simply broken on the phones most of this site's visitors use.
 *
 * Moving the image with a `transform` instead keeps the whole thing on the
 * compositor: no layout, no paint, one GPU-composited layer.
 *
 * It is switched off entirely — not merely reduced — on small screens and for
 * anyone who has asked for reduced motion. On a phone the effect is invisible
 * anyway (there is barely any travel in a 220px band) and it would be paying a
 * scroll listener for nothing.
 */

// The photograph is 576px wide, which is the largest version the client has
// supplied. Across a full-width band that is being stretched a long way, so
// the band is kept short and sits under a heavy dark overlay — at this height
// and this contrast the softness does not read, and the overlay is needed for
// legible text in both themes regardless. If Eugene sends the original camera
// files, swap the source here and the band gets sharper for free.
const PHOTO = "/img/hero-bg-original.webp";

export default function PhotoBand() {
  const ref = useRef(null);
  const reduceMotion = usePrefersReducedMotion();
  // Not `useIsDesktop` — this has nothing to do with pointer type, only with
  // whether there is enough band for the travel to be worth anything.
  const wideEnough = useMediaQuery("(min-width: 768px)", false);
  const parallax = wideEnough && !reduceMotion;

  // Measured against the whole page scroll from the moment the band enters the
  // viewport to the moment it leaves.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // The image is 128% of the band's height, so it has 28% of spare travel.
  // Moving it across ±9% keeps it inside its box at every scroll position —
  // no gap can ever appear at the top or bottom edge.
  const y = useTransform(scrollYProgress, [0, 1], ["-9%", "9%"]);

  return (
    <section
      ref={ref}
      // Short on purpose. Tall enough to land as a change of pace, nowhere
      // near tall enough to compete with the work gallery above it.
      className="relative isolate h-[clamp(200px,26vh,300px)] overflow-hidden bg-black"
      aria-label="Hynson Roofing on site"
      data-testid="photo-band"
    >
      <motion.img
        src={PHOTO}
        // Decorative in the sense that it carries no information the page
        // doesn't already state, but it is a photograph of the actual work, so
        // it gets a real description rather than an empty alt or a filename.
        alt="A Hynson Roofing re-roof in progress, with scaffolding still up around the ridge."
        width="576"
        height="1024"
        loading="lazy"
        decoding="async"
        style={parallax ? { y, willChange: "transform" } : undefined}
        className="absolute inset-x-0 top-[-14%] h-[128%] w-full object-cover"
      />

      {/*
        Two overlays, both literal black rather than a themed token.
        This band is dark in BOTH colour modes, so `bg-ink-950` would be the
        wrong colour half the time — in the light theme those tokens resolve to
        warm off-whites. See the note about the inverted scales in CLAUDE.md.
        The flat layer guarantees contrast; the gradient stops the band ending
        on a hard line against the sections above and below it.
      */}
      <div className="pointer-events-none absolute inset-0 bg-black/45" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70"
        aria-hidden="true"
      />

      <div className="relative flex h-full items-end">
        <div className="mx-auto w-full max-w-7xl px-5 pb-8 sm:px-8 sm:pb-10">
          <p className="font-mono text-[10px] tracking-[0.3em] text-brand-bright uppercase">
            — Hynson Roofing
          </p>
          {/* One line, and every word of it checkable against the client's own
              site: residential and commercial, Auckland. No years, no counts,
              no guarantees. */}
          <p className="mt-2 max-w-xl font-display text-[clamp(1.25rem,2.6vw,1.9rem)] font-bold uppercase leading-[1.1] tracking-tight text-white">
            Residential and commercial roofing, right across Auckland.
          </p>
        </div>
      </div>
    </section>
  );
}
