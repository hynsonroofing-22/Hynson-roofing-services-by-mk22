import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, AlertTriangle } from "lucide-react";
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
 * The enquiry form is the existing `Contact` component, embedded whole —
 * including the honest "this form isn't connected yet" state it grew when the
 * missing backend was found. Nothing about it is duplicated or reimplemented
 * here; this page adds the surrounding information a contact page needs and
 * the homepage section had no room for.
 *
 * Opening hours are NOT stated. None have been confirmed, and "Mon–Fri 7am–5pm"
 * is exactly the sort of plausible invention this project has to avoid — a
 * customer would ring at 4pm on the strength of it. The page says so out loud.
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
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-page px-5 py-14 sm:px-8 sm:py-20">
          <motion.div {...settle()} className="max-w-measure">
            <p className="t-label text-accent">— Get in touch</p>
            <h1 className="mt-5 t-display text-content">Free quotes. No obligation.</h1>
            <p className="mt-6 t-body text-content-muted">
              Tell us about the roof and Eugene will come and look at it. Residential and commercial,
              right across Auckland.
            </p>
          </motion.div>
        </div>
      </section>

      <Section tone="ground">
        <SectionHead eyebrow="Three ways" title="How to reach Hynson" />
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

        {/* Hours are a fact, and we don't have it. */}
        <motion.div
          {...settle(0.05)}
          className="mt-8 flex max-w-3xl items-start gap-3 border border-dashed border-warning/60 bg-warning/10 p-6"
          data-testid="contact-hours-placeholder"
        >
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
          <div>
            <p className="t-h3 text-content">Opening hours not published yet</p>
            <p className="mt-3 t-small text-content-muted">
              Hynson hasn't confirmed his hours, so none are shown. Guessing at them would send
              somebody to voicemail expecting an answer. Ring {PHONE_DISPLAY} and you'll find out in
              a moment what a website can't tell you.
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
        <motion.p {...settle(0.08)} className="mt-6 flex items-start gap-2.5 t-small text-content-faint">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
          <span>
            These are the broad areas the enquiry form offers. A confirmed suburb-by-suburb list
            hasn't been supplied yet — see LAUNCH-BLOCKERS.
          </span>
        </motion.p>
      </Section>

      {/* The existing enquiry form, whole. `compact` keeps its own section
          padding out of the way, since this page supplies it. */}
      <Section tone="ground" className="!py-0">
        <div className="py-section-sm sm:py-section">
          <SectionHead eyebrow="Send an enquiry" title="Tell us about the roof" />
        </div>
      </Section>
      <Contact compact />

      <ProcessBlock />

      <Section tone="surface">
        <p className="t-small text-content-faint">
          {LEGAL_NAME} · {ADDRESS} · {PHONE_DISPLAY} · {EMAIL}
        </p>
      </Section>
    </PageShell>
  );
}
