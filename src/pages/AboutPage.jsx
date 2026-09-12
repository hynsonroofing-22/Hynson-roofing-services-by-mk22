import { motion } from "framer-motion";
import { MapPin, Phone, Mail, AlertTriangle } from "lucide-react";
import PageShell from "../components/PageShell";
import {
  Section,
  SectionHead,
  ProcessBlock,
  CtaBand,
  PrimaryLink,
  CallLink,
  useSettle,
} from "../components/PageParts";
import { LEGAL_NAME, ADDRESS, PHONE_DISPLAY, PHONE_TEL, EMAIL } from "../data/content";

/**
 * About.
 *
 * The long "Who we are" paragraph is the client's own copy, word for word from
 * hynsonroofingservices.co.nz, as are the three pillars below it. They are his
 * voice and they are verified — do not reword them.
 *
 * WHAT IS DELIBERATELY MISSING, and why: no founding year, no number of jobs,
 * no team size, no licence numbers, no memberships, no insurance figure, no
 * guarantee. Every one of those is exactly what an About page usually leads
 * with, and not one of them has been confirmed by Eugene. The page carries a
 * visible note saying so rather than quietly having a thin middle.
 * See LAUNCH-BLOCKERS.md #4.
 */

// Verbatim from the client's live site.
const WHO_WE_ARE = [
  "Hynson Roofing Services Ltd is an Auckland based company specialising in residential and commercial roofing solutions. We take pride in delivering reliable workmanship, professional service, and durable systems designed to perform in New Zealand conditions.",
  "From repairs and re roofing to membrane and long run installations, our team provides practical solutions tailored to each project. We focus on clear communication, attention to detail, and completing every job to a high standard from start to finish.",
  "At Hynson Roofing Services Ltd, we believe a well built roof is essential to the protection and longevity of any property. Our goal is to deliver dependable results and lasting quality our clients can rely on for years to come.",
];

// Also verbatim — the three "Why choose us" pillars.
const PILLARS = [
  {
    title: "Quality craftsmanship",
    body: "At Hynson Roofing Services Ltd, we take pride in delivering roofing solutions built for long-term performance and protection. Using quality materials and proven roofing systems, our team focuses on workmanship, reliability, and attention to detail to ensure every project is completed to a high standard.",
  },
  {
    title: "Customer-focused service",
    body: "We value honest communication, dependable service, and building lasting relationships with our clients. From the initial quote through to project completion, we work closely with homeowners and businesses to provide a smooth, professional experience and roofing solutions tailored to their needs.",
  },
  {
    title: "Reliable roofing solutions",
    body: "Whether it's roof repairs, re-roofing, membrane roofing, or long-run roofing systems, we provide practical and reliable solutions across Auckland. Our goal is to deliver quality results that not only look good but also stand the test of time in New Zealand conditions.",
  },
];

// Only things that can be checked in seconds.
const FACTS = [
  { icon: MapPin, label: "Based in Onehunga", detail: ADDRESS },
  { icon: Phone, label: "Talk to Eugene", detail: PHONE_DISPLAY, href: `tel:${PHONE_TEL}` },
  { icon: Mail, label: "Email the office", detail: EMAIL, href: `mailto:${EMAIL}` },
];

export default function AboutPage() {
  const settle = useSettle();

  return (
    <PageShell current="About">
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-page gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          <motion.div {...settle()}>
            <p className="t-label text-accent">— Who we are</p>
            <h1 className="mt-5 t-display text-content">
              Built on quality. Backed by experience.
            </h1>
            <p className="mt-6 t-body text-content-muted">
              {LEGAL_NAME} is an Auckland roofing company, based in Onehunga and run by Eugene,
              working on homes and commercial buildings across the region.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PrimaryLink to="/contact">Get a free quote</PrimaryLink>
              <CallLink />
            </div>
          </motion.div>

          <motion.figure {...settle(0.08)}>
            <div className="aspect-[4/3] overflow-hidden border border-line shadow-card">
              <img
                src="/img/about.webp"
                alt="A Hynson Roofing crew applying a protective coating along a commercial walkway in Auckland"
                width="523"
                height="698"
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover object-[50%_35%]"
              />
            </div>
            <figcaption className="mt-3 t-label text-content-faint">
              On a commercial job · Auckland
            </figcaption>
          </motion.figure>
        </div>
      </section>

      <Section tone="ground">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <SectionHead eyebrow="In Hynson's own words" title="The company" />
            <div className="measure mt-6 grid gap-5">
              {WHO_WE_ARE.map((p, i) => (
                <motion.p
                  key={p.slice(0, 24)}
                  {...settle(Math.min(i * 0.05, 0.15))}
                  className="t-body text-content-muted"
                >
                  {p}
                </motion.p>
              ))}
            </div>
          </div>

          <motion.div {...settle(0.06)} className="h-fit">
            <div className="grid gap-px border border-line bg-line">
              {FACTS.map((f) => {
                const inner = (
                  <>
                    <f.icon className="h-4 w-4 text-accent" aria-hidden="true" />
                    <span className="mt-3 block t-label text-content-faint">{f.label}</span>
                    <span className="mt-1.5 block t-small text-content">{f.detail}</span>
                  </>
                );
                return f.href ? (
                  <a
                    key={f.label}
                    href={f.href}
                    className="bg-surface p-6 transition-colors hover:bg-surface-hover"
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={f.label} className="bg-surface p-6">
                    {inner}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHead eyebrow="Why choose us" title="How Hynson works" />
        <div className="mt-10 grid gap-px border border-line bg-line lg:grid-cols-3">
          {PILLARS.map((p, i) => (
            <motion.div key={p.title} {...settle(Math.min(i * 0.06, 0.2))} className="bg-surface p-7">
              <h3 className="t-h3 text-content">{p.title}</h3>
              <p className="mt-4 t-small text-content-muted">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <ProcessBlock />

      {/* Visible, on-screen, and deliberately not hidden in a comment. */}
      <Section tone="ground">
        <motion.div
          {...settle()}
          className="flex max-w-3xl items-start gap-3 border border-dashed border-warning/60 bg-warning/10 p-6"
          data-testid="about-credentials-placeholder"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
          <div>
            <p className="t-h3 text-content">Credentials section still to come</p>
            <p className="mt-3 t-small text-content-muted">
              An About page would normally carry the year the company started, licensing, insurance
              cover, industry memberships and a workmanship guarantee. None of those has been
              confirmed yet, and this site does not publish a fact it cannot stand behind — so the
              section is empty rather than filled in with something plausible. It goes on the moment
              Eugene supplies the real answers.
            </p>
          </div>
        </motion.div>
      </Section>

      <CtaBand />
    </PageShell>
  );
}
