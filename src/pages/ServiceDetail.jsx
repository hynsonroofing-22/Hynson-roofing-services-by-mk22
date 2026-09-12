import { Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import {
  Section,
  SectionHead,
  PageHero,
  TickList,
  ProcessBlock,
  WorkStrip,
  FaqBlock,
  CtaBand,
  RelatedLinks,
  useSettle,
} from "../components/PageParts";
import { getService, ALL_SERVICES } from "../data/services";

/**
 * One roofing service, in full.
 *
 * The shape is the same every time — what it is, when you need it, what
 * Hynson does, real photos, the process, a couple of questions, a quote CTA —
 * because six pages that are laid out differently read as six different sites.
 *
 * Everything on the page is either the client's own published copy or plain
 * explanation of the trade itself. There is no price, no timeframe, no
 * guarantee and no credential anywhere in it, and none may be added without
 * Eugene confirming it. See `src/data/services.js`.
 */
export default function ServiceDetail() {
  const { slug } = useParams();
  const service = getService(slug);
  const settle = useSettle();

  // An unknown slug goes to the hub rather than a dead end.
  if (!service) return <Navigate to="/services" replace />;

  const related = (service.related || [])
    .map((s) => ALL_SERVICES.find((x) => x.slug === s))
    .filter(Boolean);

  return (
    <PageShell trail={[{ to: "/services", label: "Services" }]} current={service.name}>
      <PageHero
        eyebrow={service.tag}
        title={service.name}
        lead={service.lead}
        image={service.hero}
      />

      {/* The two panels that answer "is this me?" sit side by side, so the
          page opens with one screen of substance rather than three sections
          of scrolling. Only the first two paragraphs run here — anything
          longer was making the page a wall of text. */}
      <Section tone="ground">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <SectionHead eyebrow="What it is" title={service.name} />
            <div className="measure mt-6 grid gap-5">
              {service.whatItIs.slice(0, 2).map((p, i) => (
                <motion.p
                  key={p.slice(0, 24)}
                  {...settle(Math.min(i * 0.05, 0.15))}
                  className="t-body text-content-muted"
                >
                  {p}
                </motion.p>
              ))}
            </div>

            {/* The client's own words for this service, kept verbatim and
                clearly attributed, where he has published a description. */}
            {service.source === "client" && (
              <motion.blockquote
                {...settle(0.1)}
                className="mt-9 border-l-2 border-accent bg-surface p-6 shadow-card"
              >
                <p className="t-label text-accent">In Hynson's own words</p>
                <p className="mt-3 t-body text-content">{service.blurb}</p>
              </motion.blockquote>
            )}
          </div>

          <motion.div {...settle(0.06)} className="surface-card h-fit p-7">
            <h2 className="t-h3 text-content">When you need it</h2>
            <TickList items={service.whenYouNeed} testid="when-you-need" />
          </motion.div>
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <SectionHead eyebrow="What Hynson does" title="On the job" />
          <div>
            <TickList items={service.whatWeDo} testid="what-we-do" />
          </div>
        </div>
      </Section>

      <WorkStrip photos={service.photos} />
      <ProcessBlock />
      <FaqBlock faqs={service.faqs} />
      <RelatedLinks links={related} />
      <CtaBand title={`Get a quote on ${service.name.toLowerCase()}`} />
    </PageShell>
  );
}
