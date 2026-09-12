import { motion } from "framer-motion";
import { ArrowUpRight, Phone, ChevronRight } from "lucide-react";
import { scrollToHash } from "./Navbar";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";
import { PHONE_DISPLAY, PHONE_TEL } from "../data/content";

// The phone/tablet hero. There is deliberately no 3D here and no lightweight
// stand-in for it — most roofing customers arrive on a phone, often standing
// outside looking at a leak, so this has to be one real photo and two obvious
// actions. See CLAUDE.md ("No 3D on mobile at all").
//
// The photo is one of the client's own drone shots of a live job: a real roof
// mid-re-roof with the scaffold still up. It is portrait, which is why it
// holds a full-bleed phone screen without being cropped to nothing.
const HERO_PHOTO = "/img/hero-bg-original.webp";

export default function HeroMobile() {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <section
      id="hero"
      className="relative flex h-[100svh] min-h-[600px] w-full flex-col justify-end overflow-hidden bg-ink-950"
      data-testid="hero-mobile"
    >
      {/* Slow drift across the roof. One GPU-composited transform, no
          per-frame JS — cheap enough not to show up as battery drain. */}
      <motion.img
        src={HERO_PHOTO}
        alt="A Hynson Roofing job in progress — a re-roof in Auckland with the scaffold still up"
        width="576"
        height="1024"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        initial={false}
        animate={reduceMotion ? { scale: 1 } : { scale: [1.06, 1.16] }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 26, ease: "linear", repeat: Infinity, repeatType: "reverse" }
        }
      />

      {/* Two scrims, not one: the top keeps the fixed navbar legible over a
          bright sky, the bottom carries the headline. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-ink-950/80 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

      <div className="relative px-5 pb-10 sm:px-8 sm:pb-14">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-mono text-[10px] tracking-[0.3em] text-brand-bright uppercase"
        >
          — Hynson Roofing · Auckland
        </motion.p>

        {/* Literal white, not `text-zinc-50`. The ink/zinc scales in this
            project are inverted — `zinc-50` resolves to near-black in the
            default (light) theme and only becomes near-white under `.dark`.
            Anything sitting on a photo has to opt out of the theme entirely
            or it disappears against the scrim. */}
        <h1 className="mt-4 font-display text-[clamp(2.6rem,13vw,4.5rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.02em] text-white">
          {["Auckland", "roofing,", "done right."].map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <motion.span
                className={`block ${i === 2 ? "text-brand-bright" : ""}`}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.11 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/85"
        >
          Built on quality. Backed by experience. Re-roofing, repairs, new installs and
          gutters — residential and commercial.
        </motion.p>

        {/* Both actions sit within thumb reach at the bottom of the screen,
            and both are full-width so neither is the fiddly one. */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.62 }}
          className="mt-7 flex flex-col gap-3 sm:flex-row"
        >
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToHash("#contact");
            }}
            className="btn-lift flex min-h-[54px] flex-1 items-center justify-center gap-2 whitespace-nowrap bg-brand px-6 font-mono text-xs font-semibold tracking-[0.18em] text-white uppercase hover:bg-brand-bright"
            data-testid="hero-mobile-quote-cta"
          >
            Get a free quote <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href={`tel:${PHONE_TEL}`}
            className="btn-lift flex min-h-[54px] flex-1 items-center justify-center gap-2 whitespace-nowrap border border-white/35 bg-white/10 px-6 font-mono text-xs font-semibold tracking-[0.18em] text-white uppercase backdrop-blur hover:border-brand-bright hover:text-brand-bright"
            data-testid="hero-mobile-call-cta"
          >
            <Phone className="h-4 w-4 text-brand-bright" /> {PHONE_DISPLAY}
          </a>
        </motion.div>

        {/* High-intent shortcut. Emergency roofing is a service the client
            actually offers; no response-time or 24/7 claim is made here
            because none has been confirmed. */}
        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          href="#emergency"
          onClick={(e) => {
            e.preventDefault();
            scrollToHash("#emergency");
          }}
          className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.15em] text-white/75 uppercase transition-colors hover:text-brand-bright"
          data-testid="hero-mobile-emergency-link"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-bright" />
          Roof leaking? Emergency roofing
          <ChevronRight className="h-3.5 w-3.5" />
        </motion.a>
      </div>
    </section>
  );
}
