import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, HeartHandshake, ShieldCheck, ArrowUpRight } from "lucide-react";

const WHY = [
  {
    icon: BadgeCheck,
    title: "Quality Craftsmanship",
    desc: "Roofing solutions built for long-term performance and protection. Using quality materials and proven roofing systems, our team focuses on workmanship, reliability, and attention to detail on every project.",
  },
  {
    icon: HeartHandshake,
    title: "Customer-Focused Service",
    desc: "Honest communication, dependable service, and lasting relationships. From the initial quote through to completion, we work closely with homeowners and businesses for a smooth, professional experience.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable Roofing Solutions",
    desc: "Repairs, re-roofing, membrane roofing or long-run systems — practical, reliable solutions across Auckland that look good and stand the test of time in New Zealand conditions.",
  },
];

export default function About() {
  return (
    <section id="about" className="relative bg-ink-950 py-28 sm:py-36" data-testid="about-section">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-mono text-[10px] tracking-[0.3em] text-brand-ember uppercase">— Who we are</p>
          <h2 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] font-extrabold uppercase leading-[1.0] tracking-[-0.02em] text-zinc-50">
            Built on quality. <span className="text-brand">Backed by experience.</span>
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
            Auckland based, specialising in residential and commercial roofing. Reliable workmanship and durable
            systems, built for New Zealand conditions — from repairs to full re-roofs.
          </p>
          {/* This section is a summary of the About page now — the fuller
              version, in Hynson's own words, lives at /about. */}
          <Link
            to="/about"
            className="btn-lift mt-6 inline-flex items-center gap-2 border border-line-strong bg-surface px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-content hover:border-accent hover:text-accent"
            data-testid="about-read-more"
          >
            More about Hynson <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="absolute -bottom-5 -right-5 h-full w-full bg-brand" />
          <div className="relative aspect-[4/3] overflow-hidden border border-ink-700/40">
            {/* The real photo is portrait (523x698) and this frame is 4:3, so
                object-cover crops the top and bottom off. object-position sits
                slightly high so the crew and the coating work stay in frame
                rather than the empty footpath at the bottom. */}
            <img
              src="/img/about.webp"
              alt="A Hynson Roofing crew applying a protective coating along a commercial walkway in Auckland"
              width="523"
              height="698"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-[50%_35%] transition-transform duration-700 hover:scale-105"
              data-testid="about-image"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 border-t border-l border-ink-700/40 bg-ink-900 px-5 py-4">
            <p className="font-mono text-[10px] tracking-[0.3em] text-brand-ember uppercase">Auckland Based</p>
            <p className="mt-1 text-sm text-zinc-300">Residential & commercial roofing specialists</p>
          </div>
        </motion.div>
      </div>

      <div className="mx-auto mt-20 max-w-7xl border-t border-ink-700/30 px-5 pt-14 sm:px-8">
        <p className="mb-10 font-mono text-[10px] tracking-[0.3em] text-brand-ember uppercase">— Why choose us</p>
        <div className="grid gap-10 sm:grid-cols-3" data-testid="about-why-grid">
          {WHY.map((w, i) => (
            <motion.div
              key={w.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              data-testid={`about-why-${i}`}
            >
              <w.icon className="h-5 w-5 text-brand" />
              <h3 className="mt-4 font-display text-base font-bold uppercase tracking-tight text-zinc-50">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{w.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
