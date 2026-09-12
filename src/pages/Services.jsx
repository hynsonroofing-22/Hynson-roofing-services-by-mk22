import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
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
import { ALL_SERVICES } from "../data/services";

/**
 * The services hub — all twelve real services in one place.
 *
 * Twelve is a lot to list, and the previous approach was to curate seven onto
 * the homepage and fold the rest into bullet points. That reads well but it
 * means the other five have no page of their own for anyone to find. This hub
 * lists all twelve properly; six of them link through to a full page, and the
 * six that don't say so rather than pretending to be links.
 */
export default function Services() {
  const settle = useSettle();

  return (
    <PageShell current="Services">
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-page px-5 py-14 sm:px-8 sm:py-20">
          <motion.div {...settle()} className="max-w-measure">
            <p className="t-label text-accent">— What we do</p>
            <h1 className="mt-5 t-display text-content">Roofing services across Auckland</h1>
            <p className="mt-6 t-body text-content-muted">
              Residential and commercial. Free quotes and site inspections on every job.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PrimaryLink to="/contact">Get a free quote</PrimaryLink>
              <CallLink />
            </div>
          </motion.div>
        </div>
      </section>

      <Section tone="ground">
        <SectionHead eyebrow="All twelve" title="Everything Hynson does" />

        <div className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {ALL_SERVICES.map((s, i) => {
            const num = String(i + 1).padStart(2, "0");
            const body = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <span className="t-label text-content-faint">{num}</span>
                  <span className="t-label text-accent">{s.tag}</span>
                </div>
                <h2 className="mt-5 t-h3 text-content group-hover:text-accent">{s.name}</h2>
                <p className="mt-3 flex-1 t-small text-content-muted">{s.blurb}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 t-label text-content-faint group-hover:text-accent">
                  {s.slug ? (
                    <>
                      Read more <ArrowUpRight className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    "Ask us about this"
                  )}
                </span>
              </>
            );

            return (
              <motion.div key={s.name} {...settle(Math.min(i * 0.03, 0.2))}>
                {s.slug ? (
                  <Link
                    to={`/services/${s.slug}`}
                    className="group flex h-full flex-col bg-surface p-7 transition-colors hover:bg-surface-hover"
                    data-testid={`service-card-${s.slug}`}
                  >
                    {body}
                  </Link>
                ) : (
                  <Link
                    to="/contact"
                    className="group flex h-full flex-col bg-surface p-7 transition-colors hover:bg-surface-hover"
                    data-testid={`service-card-${s.name.toLowerCase().replace(/\W+/g, "-")}`}
                  >
                    {body}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </Section>

      <ProcessBlock />
      <CtaBand />
    </PageShell>
  );
}
