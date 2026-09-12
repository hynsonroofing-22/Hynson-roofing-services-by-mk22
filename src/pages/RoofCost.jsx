import { motion } from "framer-motion";
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
 * "How much does a new roof cost" is one of the most searched roofing
 * questions there is. This page answers the real question underneath it —
 * WHAT MOVES THE PRICE — and then measures the visitor's actual roof.
 *
 * No figures appear anywhere on it. That is not a limitation being worked
 * around: a per-m² number on a website is close to meaningless when access,
 * height, pitch and the state of the existing roof swing the total so hard,
 * and publishing one would mislead people who then budget against it. What
 * this page gives instead is understanding plus a real measurement, which is
 * more than any competing roofing site in Auckland currently offers.
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
    body: "Roof area, not floor area. A pitched roof is always larger than the ground it covers, and the steeper the pitch the bigger the difference. The tool below works yours out in about a minute.",
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
    q: "Why isn't there a price per square metre on here?",
    a: "Because it would be close to meaningless. The same size roof can vary hugely depending on access, height, pitch and what's found underneath the old one — and most of that can't be seen from the street. A number on a website would only mislead you. A look at the roof gives you a real one, in writing, for nothing.",
  },
  {
    q: "So how do I find out what mine will cost?",
    a: "Work out your roof size below — it takes about a minute — then send it through. Eugene comes and looks at the roof, and you get a written quote you can compare against anyone else's. No charge and no obligation.",
  },
  {
    q: "How do I compare two roofing quotes properly?",
    a: "Check they cover the same scope. Does each include scaffold? New underlay? All new flashings, or reusing the old ones? Spouting? Taking the rubbish away? What happens if rot turns up once the old roof is off? Two quotes with very different numbers are usually quoting two different jobs.",
  },
  {
    q: "Is the roof size you work out accurate?",
    a: "The address method measures your building from the national property records, and it's usually close. Tracing it yourself on the aerial photo is closer again, because you can see exactly what's yours and what's the neighbour's. Either way it's a measurement rather than a guess — and if you know better, you can type your own figure over the top.",
  },
];

export default function RoofCost() {
  const settle = useSettle();

  return (
    <PageShell current="Roof cost guide">
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-page px-5 py-10 sm:px-8 sm:py-12">
          <motion.div {...settle()} className="max-w-measure">
            <p className="t-label text-accent">— Roof cost guide</p>
            <h1 className="mt-4 t-display text-content">How big is your roof?</h1>
            <p className="mt-5 t-body text-content-muted">
              It's the first thing a roofer needs, and most people have no idea. Find out below in
              about a minute — then read what actually moves the price.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The tool comes FIRST.
          This page is what the "Roof Cost" link in the header points at, and
          the thing someone clicking it wants is the tool — not six paragraphs
          of preamble to scroll past before they find it. The explanation of
          what moves a price is worth reading, but it reads better once you
          know how big your own roof is.

          `compact` because the page heading above already asks the question —
          without it the tool repeats "How big is your roof?" immediately
          underneath the h1 saying exactly that. */}
      <QuoteCalculator compact />

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

      <ProcessBlock />
      <FaqBlock faqs={COST_FAQS} />
      <CtaBand
        title="Get the real number"
        lead="A free look at the roof and a written quote. No obligation either way."
      />
    </PageShell>
  );
}
