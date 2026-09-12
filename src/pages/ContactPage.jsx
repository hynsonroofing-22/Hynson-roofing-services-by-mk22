import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import PageShell from "../components/PageShell";
import { Section, SectionHead, ProcessBlock, useSettle } from "../components/PageParts";
import Contact from "../components/Contact";
import {
  LEGAL_NAME,
  ADDRESS,
  PHONE_DISPLAY,
  PHONE_TEL,
  EMAIL,
  REGIONS,
} from "../data/content";

/**
 * The contact page.
 *
 * The enquiry form opens the page — it is the thing that actually brings
 * Hynson work, so nothing goes above it. Everything a contact page also needs
 * (the three direct channels, the areas covered, what happens after you send
 * it) follows underneath.
 *
 * Opening hours are not stated anywhere. None have been confirmed, and
 * "Mon-Fri 7am-5pm" is exactly the plausible invention this project has to
 * avoid — somebody would ring at 4pm on the strength of it.
 */

const CHANNELS = [
  {
    icon: Phone,
    label: "Phone",
    value: PHONE_DISPLAY,
    href: `tel:${PHONE_TEL}`,
    note: "The fastest way to reach Hynson, and the only sensible one if water is coming in right now.",
  },
  {
    icon: Mail,
    label: "Email",
    value: EMAIL,
    href: `mailto:${EMAIL}`,
    note: "Good for photos of the problem and anything that needs a written record.",
  },
  {
    icon: MapPin,
    label: "Office",
    value: ADDRESS,
    href: `https://www.google.com/maps/search/${encodeURIComponent(ADDRESS)}`,
    note: "Hynson Roofing Services Limited is based in Onehunga and works across Auckland.",
  },
];

export default function ContactPage() {
  const settle = useSettle();

  return (
    <PageShell current="Contact">
      {/* The form IS the top of this page.
          This page exists to be filled in — the enquiry is what actually
          brings Hynson work, and anything that pushes the first field below
          the fold is costing him money. The Contact component already carries
          its own heading and the "free quotes, site inspections, Auckland-wide"
          column beside the fields, so a separate hero above it only repeated
          itself and shoved the form off the screen. The areas, the process and
          the office details all follow underneath, where they belong. */}
      <Contact compact heading="h1" />

      <Section tone="ground">
        <SectionHead eyebrow="Three ways" title="Or reach Hynson directly" />
        <div className="mt-10 grid gap-px border border-line bg-line lg:grid-cols-3">
          {CHANNELS.map((c, i) => (
            <motion.a
              key={c.label}
              {...settle(Math.min(i * 0.06, 0.2))}
              href={c.href}
              target={c.label === "Office" ? "_blank" : undefined}
              rel={c.label === "Office" ? "noopener noreferrer" : undefined}
              // min-w-0 so a grid item can shrink below its content, and
              // break-words so it can. Without both, the email address —
              // one long unbreakable token — pushed this card 16px wider
              // than a 375px screen and gave the whole page a horizontal
              // scrollbar.
              className="group min-w-0 bg-surface p-7 transition-colors hover:bg-surface-hover"
              data-testid={`contact-channel-${c.label.toLowerCase()}`}
            >
              <c.icon className="h-5 w-5 text-accent" aria-hidden="true" />
              <p className="mt-4 t-label text-content-faint">{c.label}</p>
              <p className="mt-2 break-words t-h3 text-content group-hover:text-accent">{c.value}</p>
              <p className="mt-3 t-small text-content-muted">{c.note}</p>
            </motion.a>
          ))}
        </div>

        {/* Opening hours go here once Eugene confirms them. Nothing is shown
            in the meantime — a guessed set of hours sends someone to voicemail
            expecting an answer. See LAUNCH-BLOCKERS.md #3d. */}
        <motion.div
          {...settle(0.05)}
          className="mt-8 flex max-w-3xl items-start gap-3 border border-line bg-surface p-6 shadow-card"
          data-testid="contact-emergency-note"
        >
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <p className="t-h3 text-content">Roof leaking right now?</p>
            <p className="mt-3 t-small text-content-muted">
              Don't fill in a form — ring {PHONE_DISPLAY}. A phone call gets a roofer moving, and
              water coming through a ceiling doesn't wait for office hours.
            </p>
          </div>
        </motion.div>
      </Section>

      <Section tone="surface">
        <SectionHead
          eyebrow="Where we work"
          title="Auckland, right across the region"
          lead="Auckland only. Outside the region, ring first — we'd rather say no than waste your time."
        />
        <motion.ul {...settle(0.05)} className="mt-8 flex flex-wrap gap-2.5">
          {REGIONS.filter((r) => r !== "Other").map((r) => (
            <li
              key={r}
              className="border border-line-strong bg-surface px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-content-muted"
            >
              {r}
            </li>
          ))}
        </motion.ul>
        <motion.p {...settle(0.08)} className="mt-6 max-w-measure t-small text-content-faint">
          Not sure whether you're in range? Ring and ask — it takes ten seconds and saves you
          waiting on a reply.
        </motion.p>
      </Section>

      <ProcessBlock />

      <Section tone="surface">
        <p className="t-small text-content-faint">
          {LEGAL_NAME} · {ADDRESS} · {PHONE_DISPLAY} · {EMAIL}
        </p>
      </Section>
    </PageShell>
  );
}
