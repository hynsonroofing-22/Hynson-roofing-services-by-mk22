import { motion } from "framer-motion";
import { Phone, Mail } from "lucide-react";
import { PHONE_DISPLAY, PHONE_TEL, EMAIL } from "../data/content";

// Emergency roofing is one of the client's twelve real services, and it is
// the highest-intent reason anyone reaches this site on a phone — yet on both
// his current site and the competitor's it is buried in a services list. This
// band gives it its own address (#emergency) directly under the hero.
//
// HONESTY: no response time, no "24/7", no call-out fee appears here. None of
// those have been confirmed by the client. The description below is his own
// wording from his live site. See LAUNCH-BLOCKERS.md.
export default function EmergencyBand() {
  return (
    <section id="emergency" className="border-y border-brand/25 bg-ink-900" data-testid="emergency-band">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-9 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-start gap-4"
        >
          <span className="relative mt-1.5 flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-bright/60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-bright" />
          </span>
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-brand-bright uppercase">— Emergency roofing</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold uppercase leading-[1.0] tracking-[-0.01em] text-zinc-50 sm:text-3xl">
              Leak or storm damage right now?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
              Leaks, storm damage and urgent repairs — prompt, reliable emergency support
              before small issues turn into major property damage.
            </p>
          </div>
        </motion.div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <a
            href={`tel:${PHONE_TEL}`}
            className="btn-lift flex min-h-[54px] items-center justify-center gap-2.5 bg-brand px-7 font-mono text-xs font-semibold tracking-[0.18em] text-white uppercase warm-glow hover:bg-brand-bright"
            data-testid="emergency-call"
          >
            <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="btn-lift flex min-h-[54px] items-center justify-center gap-2.5 border border-ink-700/60 px-7 font-mono text-xs font-semibold tracking-[0.18em] text-zinc-200 uppercase hover:border-brand hover:text-brand-bright"
            data-testid="emergency-email"
          >
            <Mail className="h-4 w-4 text-brand-bright" /> Email us
          </a>
        </div>
      </div>
    </section>
  );
}
