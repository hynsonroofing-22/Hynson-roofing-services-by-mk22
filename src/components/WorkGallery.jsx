import { useRef, useState, useLayoutEffect, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { GALLERY } from "../data/content";
import { scrollToHash } from "./Navbar";
import { useIsDesktop, usePrefersReducedMotion } from "../hooks/useMediaQuery";

// "Our recent work" — the signature section.
//
// Desktop: the section pins and the row of photos travels sideways, then the
// pin releases and the page carries on down. It is driven purely by the
// existing vertical scroll position — there are no wheel, touch or key
// handlers anywhere in here, which is what guarantees it can never trap the
// user or swallow a sideways swipe.
//
// Mobile: no pinning at all. A plain swipeable row with snap points.
// Reduced motion: a plain grid, no movement of any kind.

const EASE = [0.16, 1, 0.3, 1];

/**
 * Photo + its label. Shared by all three layouts so they can't drift apart.
 *
 * `captionMotion` lets the pinned row drive the label from scroll position
 * instead of `whileInView`. It has to: IntersectionObserver does not reliably
 * re-fire when an element is moved only by an ancestor's transform, so cards
 * carried into view by the row can arrive with their label still at opacity 0.
 * Verified in-browser — cards sitting fully on screen stayed invisible.
 */
function WorkCard({ item, index, imageX, eager, captionMotion }) {
  const captionProps = captionMotion
    ? { style: captionMotion }
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.55 },
        transition: { duration: 0.45, ease: EASE },
      };

  return (
    <figure className="relative h-full w-full overflow-hidden bg-[#1a1c1f]">
      {/* The image is 116% of the frame, offset by -8%, so it sits centred
          with 8% of slack on each side for the parallax to eat into — the
          frame edge can never be exposed.
          `left` does the centring rather than a `-translate-x-1/2` class,
          because framer-motion writes the parallax into `transform` and would
          silently overwrite a Tailwind translate. */}
      <motion.img
        src={item.image}
        alt={item.job}
        width="480"
        height="360"
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={{ left: "-8%", ...(imageX ? { x: imageX } : null) }}
        className="absolute top-0 h-full w-[116%] max-w-none object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      <motion.figcaption {...captionProps} className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
        <p className="font-mono text-[10px] tracking-[0.3em] text-brand-bright uppercase">
          {String(index + 1).padStart(2, "0")}
        </p>
        <p className="mt-2 font-display text-lg font-bold uppercase leading-[1.1] tracking-[-0.01em] text-white sm:text-xl">
          {item.job}
        </p>
        <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-white/70 uppercase">
          <MapPin className="h-3 w-3 text-brand-bright" />
          {item.suburb || "Auckland"}
        </p>
      </motion.figcaption>
    </figure>
  );
}

function SectionHeading() {
  return (
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div>
        <p className="font-mono text-[10px] tracking-[0.3em] text-brand-bright uppercase">— Our recent work</p>
        <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.75rem)] font-extrabold uppercase leading-[1.0] tracking-[-0.02em] text-white">
          On the tools,
          <br />
          <span className="text-brand-bright">across Auckland.</span>
        </h2>
      </div>
      <div className="max-w-sm lg:text-right">
        <p className="text-sm leading-relaxed text-white/60">
          Real jobs, photographed on site — long-run iron, flashings, capping and
          penetrations.
        </p>
        {/* Visible placeholder marker, required while suburb-level locations
            are unconfirmed. See content.js GALLERY + LAUNCH-BLOCKERS.md. */}
        <p className="mt-3 inline-block border border-dashed border-white/25 px-2.5 py-1 font-mono text-[9px] tracking-[0.18em] text-white/40 uppercase">
          Placeholder · suburb labels awaiting client confirmation
        </p>
      </div>
    </div>
  );
}

/** Reduced motion, and the safety net if measurement ever fails: a plain grid. */
function StaticGrid() {
  return (
    <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {GALLERY.map((item, i) => (
        <div key={item.id} className="relative aspect-[4/3]">
          <WorkCard item={item} index={i} eager={i < 3} />
        </div>
      ))}
    </div>
  );
}

/** Phones and tablets: swipe, with snap points. No pinning, no hijacking. */
function SnapRow() {
  return (
    <div
      className="mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      data-testid="work-gallery-snap-row"
    >
      {/* Leading and trailing spacers keep the first and last card aligned to
          the page gutter instead of jamming against the screen edge. */}
      <span className="w-2 shrink-0" aria-hidden="true" />
      {GALLERY.map((item, i) => (
        <div key={item.id} className="aspect-[4/3] w-[82vw] max-w-[420px] shrink-0 snap-center">
          <WorkCard item={item} index={i} eager={i < 2} />
        </div>
      ))}
      <span className="w-2 shrink-0" aria-hidden="true" />
    </div>
  );
}

const clamp01 = (n) => Math.min(1, Math.max(0, n));

/**
 * One card in the pinned row. Its label is tied to the card's own position in
 * the travel rather than to an observer, so it fades up at exactly the point
 * the card slides in — every time, at any scroll speed, including a jump.
 */
function PinnedCard({ item, index, progress, imageX, cardLeft, geomRef }) {
  // Read through refs inside the transform, never through captured values: a
  // function transformer is created once and would otherwise freeze whatever
  // the geometry happened to be on the very first render (zero).
  const leftRef = useRef(cardLeft);
  leftRef.current = cardLeft;

  // Where this card's left edge currently sits on screen, and how far it is
  // through the band between "just entering" (90% across) and "settled"
  // (55% across). That band is when the label fades up.
  const reveal = useCallback(
    (p) => {
      const { travel, viewportWidth } = geomRef.current;
      if (!travel || !viewportWidth) return 1;
      const onScreenLeft = leftRef.current - p * travel;
      return clamp01((viewportWidth * 0.9 - onScreenLeft) / (viewportWidth * 0.35));
    },
    [geomRef]
  );

  const opacity = useTransform(progress, reveal);
  const y = useTransform(progress, (p) => (1 - reveal(p)) * 20);

  return (
    // `data-card` is what measure() reads offsetLeft from — it must sit on the
    // real laid-out box, so no display:contents wrapper around this.
    <div data-card className="h-[clamp(240px,44vh,480px)] aspect-[4/3] shrink-0">
      {/* Every card in the pinned row loads eagerly. Lazy loading keys off
          viewport intersection, and a card about to be translated into view
          can otherwise still be blank when it arrives. Eight 480×360 photos
          is a few hundred KB — cheap insurance, and desktop-only. */}
      <WorkCard item={item} index={index} imageX={imageX} eager captionMotion={{ opacity, y }} />
    </div>
  );
}

/** Desktop: the pinned, scroll-driven horizontal travel. */
function PinnedRow() {
  const sectionRef = useRef(null);
  const rowRef = useRef(null);
  const [metrics, setMetrics] = useState({ travel: 0, viewportWidth: 0, cardLefts: [] });

  // Geometry the scroll transforms read at call time. It is a ref as well as
  // state because the transforms below are created once and must never close
  // over a stale measurement; state is only there to re-render the cards.
  const geomRef = useRef({ pinStart: 0, travel: 0, viewportWidth: 0 });

  // One pass measures everything the section needs:
  //  * pinStart — the page scroll position at which the section's top reaches
  //    the top of the screen, i.e. where the pin begins.
  //  * travel   — how far the row must move: its full width minus one screen,
  //    plus the gutter so the last card comes fully clear of the right edge.
  //  * cardLefts — each card's offset within the row, for its label timing.
  const measure = useCallback(() => {
    const row = rowRef.current;
    const section = sectionRef.current;
    if (!row || !section) return;
    const travel = Math.max(0, row.scrollWidth - window.innerWidth + 64);
    geomRef.current = {
      pinStart: section.getBoundingClientRect().top + window.scrollY,
      travel,
      viewportWidth: window.innerWidth,
    };
    const cardLefts = Array.from(row.querySelectorAll("[data-card]")).map((c) => c.offsetLeft);
    // Bail out when nothing actually moved. This section's own height feeds
    // into the box the ResizeObserver watches, so re-rendering on every
    // measurement would let it chase its own tail.
    setMetrics((prev) =>
      prev.travel === travel &&
      prev.viewportWidth === window.innerWidth &&
      prev.cardLefts.length === cardLefts.length &&
      prev.cardLefts.every((v, i) => v === cardLefts[i])
        ? prev
        : { travel, viewportWidth: window.innerWidth, cardLefts }
    );
  }, []);

  useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);

    // Images arrive after first paint and change the row's width, so remeasure
    // once they are in rather than trusting the first reading.
    const row = rowRef.current;
    const imgs = row ? Array.from(row.querySelectorAll("img")) : [];
    imgs.forEach((img) => img.addEventListener("load", measure));

    // `pinStart` depends on everything stacked above this section, and the 3D
    // hero is code-split: it mounts a viewport-tall placeholder first and then
    // expands to 560vh. Without watching for that, the pin would start ~4000px
    // too early for the whole session. Any later layout shift above is caught
    // by the same observer.
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("resize", measure);
      imgs.forEach((img) => img.removeEventListener("load", measure));
      ro.disconnect();
    };
  }, [measure]);

  const { travel, cardLefts } = metrics;

  // Deliberately NOT `useScroll({ target })`. That measures the target when
  // the scroll listener is attached — which happens while `travel` is still 0
  // and the section is therefore exactly one viewport tall. The resulting
  // scroll range has zero length, so its progress is pinned at 0 and never
  // recovers once the real height lands. Verified in-browser.
  //
  // Raw page scroll plus our own geometry has no such measurement window.
  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, (v) => {
    const { pinStart, travel: t } = geomRef.current;
    if (t <= 0) return 0;
    return clamp01((v - pinStart) / t);
  });

  // Spring gives it mass — the row keeps moving for a beat after the wheel
  // stops instead of snapping to the scroll position. Low stiffness + high
  // damping reads as weight rather than bounce.
  const rawX = useTransform(progress, (p) => -p * geomRef.current.travel);
  const x = useSpring(rawX, { stiffness: 80, damping: 30, mass: 0.55 });

  // Parallax: the photo inside each frame drifts the other way, so it appears
  // to lag slightly behind the frame carrying it. In pixels, not percent —
  // useSpring strips units off a percentage string and would silently turn
  // "5%" into 5px anyway.
  const rawImageX = useTransform(progress, (p) => -26 + p * 52);
  const imageX = useSpring(rawImageX, { stiffness: 80, damping: 30, mass: 0.55 });

  const progressScale = useSpring(progress, { stiffness: 90, damping: 30, mass: 0.5 });

  return (
    <div
      ref={sectionRef}
      // 100vh of pin + exactly as much extra scroll as the row has to travel,
      // so one pixel of wheel is one pixel of sideways movement.
      style={{ height: `calc(100vh + ${travel}px)` }}
      data-testid="work-gallery-pinned"
    >
      <div
        // `pt-28` clears the fixed navbar (which sits below the mockup banner);
        // without it the pinned heading slides under the glass bar.
        className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-28"
        // Vertical panning is the only gesture this section ever responds to.
        style={{ touchAction: "pan-y" }}
      >
        {/* Full-width gutter, not a centred max-width container: the row below
            starts at the same `px-8`, so headline, photos and progress line all
            sit on one grid. */}
        <div className="w-full px-8">
          <SectionHeading />
        </div>

        <motion.div ref={rowRef} style={{ x }} className="mt-10 flex gap-3 pl-8 will-change-transform">
          {/* One ratio for every card, sized off viewport height so the row
              fills the pinned screen without ever overflowing it. */}
          {GALLERY.map((item, i) => (
            <PinnedCard
              key={item.id}
              item={item}
              index={i}
              progress={progress}
              imageX={imageX}
              cardLeft={cardLefts[i] ?? 0}
              geomRef={geomRef}
            />
          ))}

          {/* Closing panel — gives the row somewhere to end other than a hard
              stop, and turns the end of the travel into a call to action. */}
          <div className="flex h-[clamp(240px,44vh,480px)] w-[380px] shrink-0 flex-col justify-center pl-10 pr-8">
            <p className="font-mono text-[10px] tracking-[0.3em] text-brand-bright uppercase">— Next</p>
            <p className="mt-3 font-display text-3xl font-extrabold uppercase leading-[1.0] tracking-[-0.02em] text-white">
              Want yours
              <br />
              on this row?
            </p>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToHash("#contact");
              }}
              className="btn-lift mt-6 inline-flex w-fit items-center gap-2 bg-brand px-6 py-3.5 font-mono text-xs font-semibold tracking-[0.18em] text-white uppercase hover:bg-brand-bright"
            >
              Get a free quote <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>

        {/* How far through the row you are. */}
        <div className="mt-10 w-full px-8">
          <div className="h-px w-full bg-white/15">
            <motion.div style={{ scaleX: progressScale }} className="h-px origin-left bg-brand-bright" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkGallery() {
  const isDesktop = useIsDesktop();
  const reduceMotion = usePrefersReducedMotion();

  return (
    // The dark, deep ground the photos sit against. Fixed dark values rather
    // than the ink tokens, because this section stays dark in both themes.
    <section
      id="work"
      className="relative bg-[#101113] py-20 sm:py-24"
      data-testid="work-gallery"
    >
      {reduceMotion || !isDesktop ? (
        <>
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <SectionHeading />
          </div>
          {reduceMotion ? <StaticGrid /> : <SnapRow />}
        </>
      ) : (
        <PinnedRow />
      )}
    </section>
  );
}
