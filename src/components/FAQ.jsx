import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { FAQS, PHONE_DISPLAY, PHONE_TEL } from "../data/content";

export default function FAQ() {
  return (
    <section id="faqs" className="bg-ink-900 py-28 sm:py-36" data-testid="faq-section">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-2"
        >
          <p className="font-mono text-[10px] tracking-[0.3em] text-brand-ember uppercase">— Common questions</p>
          <h2 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] font-extrabold uppercase leading-[1.0] tracking-[-0.02em] text-zinc-50">
            Need roofers? <span className="text-brand">Ask us anything.</span>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-zinc-400">
            Get in touch with our expert team today for a free, no-obligation quote. We carry out professional roof
            inspections and give honest recommendations — repairs, maintenance, or full replacement.
          </p>
          <a
            href={`tel:${PHONE_TEL}`}
            className="btn-lift mt-8 inline-flex items-center gap-3 bg-brand px-7 py-4 font-mono text-xs font-semibold tracking-[0.25em] text-white uppercase hover:bg-brand-bright warm-glow"
            data-testid="faq-call-btn"
          >
            <Phone className="h-4 w-4" /> Call {PHONE_DISPLAY}
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="lg:col-span-3"
        >
          <Accordion type="single" collapsible className="border border-ink-700/40 bg-ink-900 px-6 sm:px-8" data-testid="faq-accordion">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-ink-700/30">
                <AccordionTrigger
                  className="py-6 text-left font-display text-base font-bold uppercase tracking-tight text-zinc-50 hover:text-brand hover:no-underline sm:text-lg"
                  data-testid={`faq-question-${i}`}
                >
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-sm leading-relaxed text-zinc-400" data-testid={`faq-answer-${i}`}>
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
