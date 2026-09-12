import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import PageShell from "../components/PageShell";
import {
  Section,
  SectionHead,
  ProcessBlock,
  FaqBlock,
  CtaBand,
  useSettle,
} from "../components/PageParts";
import QuoteCalculator from "../components/QuoteCalculator";

/**
 * The roof cost guide.
 *
 * THE POINT OF THIS PAGE, given we cannot publish a single price:
 *
 * "How much does a new roof cost" is one of the most searched roofing
 * questions there is, and the competitor answers it with a per-m² range and a
 * worked example. We cannot — no Hynson rate has been confirmed, and the
 * calculator's figures are openly placeholder.
 *
 * So this page answers the question underneath it instead: WHAT MOVES THE
 * PRICE. That is genuinely useful, it is entirely honest, it needs no number
 * we do not have, and it is the thing a homeowner actually needs to understand
 * before comparing two quotes.
 *
 * The calculator is embedded whole — nothing removed — with its demo-pricing
 * warning intact and a second, larger one above it.
 */

const DRIVERS = [
  {
    title: "The condition of what's underneath",
    body: "The single biggest unknown. Purlins, battens and rafter ends only become visible once the old roof is off, and rot or corrosion found there has to be dealt with before anything new goes on. Two identical-looking houses can be very different jobs.",
  },
  {
    title: "Access, height and scaffold",
    body: "Getting people and materials safely onto a roof is a real cost in its own right. A single-storey house with clear access on all sides is a different proposition from a two-storey on a tight site where scaffold has to go up before anyone touches the roof.",
  },
  {
    title: "The shape of the roof",
    body: "A simple gable is mostly straight runs. Valleys, dormers, hips, skylights, flues and chimneys each need flashings made and fitted, and flashings are where the labour and the skill go — and where roofs leak if they're rushed.",
  },
  {
    title: "The size of it",
    body: "Roof area, not floor area. A pitched roof is always larger than the ground it covers, and the steeper the pitch the bigger the difference. The estimator below works this out from your address using public building outline data.",
  },
  {
    title: "The system going on",
    body: "Long-run steel, membrane, and the various profiles and finishes within each are not equivalent products, and the right one depends on the pitch and shape of the roof rather than on preference alone.",
  },
  {
    title: "What's done at the same time",
    body: "Spouting, downpipes, roof painting or skylights cost far less done while access already exists than as separate jobs later. If any of them are due, it is usually worth doing them together.",
  },
];

const COST_FAQS = [
  {
    q: "Why won't this page just tell me a price per square metre?",
    a: "Because Hynson hasn't confirmed one, and inventing a plausible-looking number would be worse than useless — you'd budget against it. Roofing quotes vary enormously with the six factors above, most of which can't be seen from the street. The free site inspection produces a real figure in writing.",
  },
  {
    q: "So what do I actually do to find out?",
    a: "Book the free site inspection. It costs nothing, there's no obligation, and you get a written quotation you can compare against anyone else's. If you want a rough shape of the number first, the estimator below will give you one — but read the warning on it.",
  },
  {
    q: "How do I compare two roofing quotes properly?",
    a: "Check they cover the same scope. Does each include scaffold? New underlay? All new flashings, or reusing existing ones? Spouting? Rubbish removal? What happens if rot is found once the old roof is off? Two quotes with very different numbers are often quoting two different jobs.",
  },
];

export default function RoofCost() {
  const settle = useSettle();

  return (
    <PageShell current="Roof cost guide">
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-page px-5 py-14 sm:px-8 sm:py-20">
          <motion.div {...settle()} className="max-w-measure">
            <p className="t-label text-accent">— Roof cost guide</p>
            <h1 className="mt-5 t-display text-content">What moves the price of a roof</h1>
            <p className="mt-6 t-body text-content-muted">
              No per-square-metre figure, because Hynson hasn't confirmed one and you'd end up
              budgeting against a made-up number. Here's what a roofer is actually pricing instead.
            </p>
          </motion.div>
        </div>
      </section>

      <Section tone="ground">
        <SectionHead eyebrow="Six things" title="What a quote is actually pricing" />
        <div className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {DRIVERS.map((d, i) => (
            <motion.div key={d.title} {...settle(Math.min(i * 0.04, 0.2))} className="bg-surface p-7">
              <p className="t-label text-accent">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-4 t-h3 text-content">{d.title}</h3>
              <p className="mt-3 t-small text-content-muted">{d.body}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHead
          eyebrow="Rough shape only"
          title="Try the instant estimator"
          lead="It finds your roof area from your address, then applies demo rates to it."
        />
        <motion.div
          {...settle(0.05)}
          className="mt-8 flex max-w-3xl items-start gap-3 border border-dashed border-warning/60 bg-warning/10 p-6"
          data-testid="roof-cost-warning"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
          <div>
            <p className="t-h3 text-content">Demo rates, not Hynson's prices</p>
            <p className="mt-3 t-small text-content-muted">
              The roof <em>area</em> it finds from your address is real. The money attached to it is
              a placeholder Eugene hasn't reviewed — don't budget against it.
            </p>
          </div>
        </motion.div>
      </Section>

      {/* The calculator, whole and unmodified, with its own warnings intact. */}
      <QuoteCalculator />

      <ProcessBlock />
      <FaqBlock faqs={COST_FAQS} />
      <CtaBand
        title="Get the real number"
        lead="A free site inspection and a detailed written quotation, with no obligation attached to either."
      />
    </PageShell>
  );
}
