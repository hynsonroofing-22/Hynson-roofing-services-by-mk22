import { Link } from "react-router-dom";
import { ArrowUp, Phone, Facebook, Instagram } from "lucide-react";
import { scrollToHash } from "./Navbar";
import { PHONE_DISPLAY, PHONE_TEL, EMAIL, ADDRESS, LEGAL_NAME, REGIONS } from "../data/content";
import { SERVICE_NAV } from "../data/services";

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://facebook.com/hynsonroofingservices", Icon: Facebook },
  { label: "Instagram", href: "https://instagram.com/hynsonroofingservices.nz", Icon: Instagram },
];

/** lucide-react has no TikTok glyph — a small inline mark instead. */
function TikTokIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.6 5.82c-.9-.88-1.42-2.07-1.46-3.32h-3.4v13.2c0 1.53-1.25 2.78-2.78 2.78a2.78 2.78 0 1 1 0-5.56c.28 0 .55.04.8.12V9.6a6.2 6.2 0 0 0-.8-.05A6.24 6.24 0 0 0 3 15.8a6.24 6.24 0 0 0 6.24 6.24 6.24 6.24 0 0 0 6.24-6.24V9.01a8.6 8.6 0 0 0 4.52 1.29V6.9a5.2 5.2 0 0 1-3.4-1.08Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-ink-700/40 bg-ink-950" data-testid="footer-section">
      {/* The extra bottom padding is not decoration. Three things float above
          the page bottom — the assistant launcher bottom-left, and the quote
          and estimate buttons bottom-right — and without it they sit on top of
          the address, the email and the emergency phone number down here. */}
      <div className="mx-auto max-w-page px-5 pb-32 pt-20 sm:px-8 sm:pb-36 sm:pt-24">
        {/* gap-10 put the wordmark and its orange full stop almost touching
            the "Services" column on a laptop. The brand block now has room of
            its own and a width cap, so the two never run together. */}
        <div className="flex flex-col justify-between gap-14 lg:flex-row lg:gap-24">
          <div className="lg:max-w-xs lg:shrink-0">
            <div className="flex items-center gap-3">
              <img
                src="/brand/logo.png"
                alt="Hynson Roofing Services"
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
                className="h-12 w-12 object-contain"
              />
              <p className="font-display text-4xl font-black uppercase leading-none tracking-tight text-zinc-50 sm:text-5xl">
                Hynson
                <span className="text-brand">.</span>
              </p>
            </div>
            <p className="mt-3 font-mono text-[10px] tracking-[0.3em] text-brand-ember uppercase">Built on quality · Backed by experience</p>
            <p className="mt-4 max-w-xs text-sm text-zinc-500">
              {LEGAL_NAME} — professional roofing solutions for residential and commercial properties across Auckland.
            </p>
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-zinc-500">
              {ADDRESS}
              <br />
              <a href={`mailto:${EMAIL}`} className="hover:text-brand">{EMAIL}</a>
            </p>
            <div className="mt-5 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="btn-lift flex h-9 w-9 items-center justify-center rounded-full border border-ink-700/40 text-zinc-400 hover:border-brand hover:text-brand"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
              <a
                href="https://tiktok.com/@hynsonroofingservices"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="btn-lift flex h-9 w-9 items-center justify-center rounded-full border border-ink-700/40 text-zinc-400 hover:border-brand hover:text-brand"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
          {/* The footer is the sitemap. Every page on the site is reachable
              from here, on every page, which is how both Google and a lost
              visitor find the ones that aren't in the header. */}
          <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4 lg:gap-x-10">
            <div>
              <p className="t-label text-zinc-600">Services</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                {SERVICE_NAV.map((s) => (
                  <li key={s.slug}>
                    <Link to={`/services/${s.slug}`} className="transition-colors hover:text-brand">
                      {s.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/services" className="transition-colors hover:text-brand">
                    All 12 services →
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="t-label text-zinc-600">Pages</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                <li><Link to="/" className="transition-colors hover:text-brand">Home</Link></li>
                <li><Link to="/about" className="transition-colors hover:text-brand">About Hynson</Link></li>
                <li><Link to="/our-work" className="transition-colors hover:text-brand">Our work</Link></li>
                <li><Link to="/roof-cost" className="transition-colors hover:text-brand">Roof cost guide</Link></li>
                <li><Link to="/contact" className="transition-colors hover:text-brand">Contact &amp; quote</Link></li>
                <li>
                  <a
                    href="#faqs"
                    onClick={(e) => { e.preventDefault(); scrollToHash("#faqs"); }}
                    className="transition-colors hover:text-brand"
                  >
                    FAQs
                  </a>
                </li>
                <li><Link to="/admin" className="transition-colors hover:text-brand">Admin</Link></li>
              </ul>
            </div>
            <div>
              <p className="t-label text-zinc-600">Areas served</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                {REGIONS.filter((r) => r !== "Other").map((r) => (
                  <li key={r}>
                    <Link to="/contact" className="transition-colors hover:text-brand">{r}</Link>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                Auckland only. Outside the region, ring first.
              </p>
            </div>
            <div>
              <p className="t-label text-zinc-600">Emergency roofing</p>
              <a href={`tel:${PHONE_TEL}`} className="mt-4 flex items-center gap-2 font-display text-xl font-bold text-brand" data-testid="footer-emergency-phone">
                <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
              </a>
              <p className="mt-2 text-xs text-zinc-500">Prompt emergency support for leaks &amp; storm damage across Auckland</p>
              {/* Hours would go here. None have been confirmed, so rather than
                  invent "Mon–Fri 7–5" the gap is stated. */}
              <p className="mt-4 text-xs leading-relaxed text-zinc-600">
                Opening hours not published yet — ring and you'll get a straight answer.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-ink-700/40 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <p className="font-mono text-[10px] tracking-[0.2em] text-zinc-600 uppercase">
              © {new Date().getFullYear()} Hynson Roofing Services Ltd. All Rights Reserved.
            </p>
            <Link to="/privacy-policy" className="font-mono text-[10px] tracking-[0.2em] text-zinc-600 uppercase hover:text-brand">
              Privacy Policy
            </Link>
            <Link to="/accessibility-statement" className="font-mono text-[10px] tracking-[0.2em] text-zinc-600 uppercase hover:text-brand">
              Accessibility Statement
            </Link>
          </div>
          <button
            onClick={() => (window.__lenis ? window.__lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" }))}
            className="btn-lift flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-zinc-400 uppercase hover:text-brand"
            data-testid="footer-back-to-top"
          >
            Back to top <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
