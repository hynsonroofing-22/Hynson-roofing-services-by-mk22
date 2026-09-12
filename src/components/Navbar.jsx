import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Phone, Menu, X, ArrowUpRight, ChevronDown, Ruler, Moon, Sun, ClipboardCheck } from "lucide-react";
import { PHONE_TEL, PHONE_DISPLAY } from "../data/content";
import { SERVICE_NAV } from "../data/services";
import useScrollLock from "../hooks/useScrollLock";
import MockupBanner from "./MockupBanner";
import Modal from "./Modal";

// The roof tool is heavy (address lookup, and Leaflet if the map tab is
// opened). It is only fetched when someone actually opens it.
const QuoteCalculator = lazy(() => import("./QuoteCalculator"));

const THEME_KEY = "hynson_theme";

/** One-line descriptions for the Services dropdown, keyed by slug. */
const SERVICE_BLURB = {
  "roof-repairs": "Leaks, flashings and general upkeep",
  "re-roofing": "Strip the old roof, install a new system",
  "long-run-roofing": "Full-length steel sheets, ridge to gutter",
  "membrane-roofing": "Flat and low-slope waterproofing",
  "roof-painting": "Protective recoating and colour refresh",
  "emergency-roofing": "Leaks and storm damage, right now",
};

/**
 * The header navigation.
 *
 * One dropdown, four plain links, and every one of them lands on a real page.
 *
 * It used to be four dropdowns — Services, Our Work, Company and Areas —
 * seventeen items between them, and most of them pointed at the same handful
 * of destinations. "Areas" was five entries that all went to the contact form.
 * That is a lot of reading to do before you can decide where to click.
 *
 * Only Services keeps a dropdown, because it is the only one where the child
 * pages are genuinely different destinations rather than the same page
 * described four ways. Nothing has been lost: the areas are listed on the
 * contact page and in the footer, the FAQs and reviews are on the homepage and
 * linked from the footer, and every single one is still two clicks away.
 */
const NAV_GROUPS = [
  {
    label: "Services",
    href: "/services",
    items: [
      ...SERVICE_NAV.map((s) => ({
        label: s.name,
        desc: SERVICE_BLURB[s.slug],
        href: `/services/${s.slug}`,
      })),
      { label: "All 12 services", desc: "The full list, residential and commercial", href: "/services" },
    ],
  },
];

const SIMPLE_LINKS = [
  { label: "Our Work", href: "/our-work" },
  { label: "Roof Cost", href: "/roof-cost" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const MENU_LINKS = [
  { label: "Home", href: "/", num: "01" },
  { label: "Services", href: "/services", num: "02" },
  { label: "Emergency Roofing", href: "/services/emergency-roofing", num: "03" },
  { label: "Roof Repairs", href: "/services/roof-repairs", num: "04" },
  { label: "Re-Roofing", href: "/services/re-roofing", num: "05" },
  { label: "Our Work", href: "/our-work", num: "06" },
  { label: "Roof Cost Guide", href: "/roof-cost", num: "07" },
  { label: "About Hynson", href: "/about", num: "08" },
  { label: "Reviews", href: "#testimonials", num: "09" },
  { label: "Contact & Quote", href: "/contact", num: "10" },
  { label: "Admin Login", href: "/admin", num: "11" },
];

export function scrollToHash(href) {
  // Resolve the target first. Lenis throws on a selector that matches
  // nothing, so an anchor pointing at a section that has been renamed or
  // removed would otherwise blow up mid-click instead of just doing nothing.
  const target = document.querySelector(href);
  if (!target) return;
  if (window.__lenis) {
    window.__lenis.scrollTo(target, { offset: -70 });
    return;
  }
  // No Lenis: either the page hasn't finished mounting, or the visitor has
  // asked for reduced motion and we never started it. Do the offset by hand —
  // plain scrollIntoView lands the section's heading underneath the sticky
  // header, which is a real bug and not just a cosmetic one.
  const reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({
    top: target.getBoundingClientRect().top + window.scrollY - 70,
    behavior: reduced ? "auto" : "smooth",
  });
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  // Initialised from the class the inline boot script already put on <html>,
  // not from `false` — starting false would make the toggle icon wrong for a
  // frame on a dark-by-default site.
  const [dark, setDark] = useState(
    () => typeof document === "undefined" || document.documentElement.classList.contains("dark")
  );
  const [showFabs, setShowFabs] = useState(false);
  const [toolOpen, setToolOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onHome = pathname === "/";

  // The full-screen menu is an overlay like any other: the page behind it must
  // not move. It previously had no lock at all, so scrolling over it dragged
  // the page underneath.
  useScrollLock(menuOpen);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    /**
     * The floating buttons wait for the hero ONLY on the homepage.
     *
     * The homepage opens on a full-screen 3D build (or, on a phone, a photo
     * hero with its own two CTAs pinned to the bottom), so anything floating
     * there lands on top of them. Every other page opens on a heading and a
     * breadcrumb — there is nothing to clear, and making someone scroll before
     * the quote button appears is just hiding the quote button.
     */
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setShowFabs(!onHome || window.scrollY > window.innerHeight * 0.92);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onHome]);

  // Dark is the default. Only someone who has explicitly chosen light gets
  // light, so a first-time visitor opens on the dark site.
  //
  // The <html> class is already set by the inline script in public/index.html
  // before React loads — this effect only syncs React's own state to match, so
  // the toggle button starts in the right position. Doing the initial paint
  // from here instead would show one light frame and then snap.
  useEffect(() => {
    let stored = null;
    try {
      stored = localStorage.getItem(THEME_KEY);
    } catch {
      stored = null;
    }
    setDark(stored !== "light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    // Keep the browser chrome (phone status bar / tab strip) in step with the
    // theme, and keep the pre-paint background colour correct for the next load.
    const meta = document.querySelector('meta[name="theme-color"]');
    // Read from the tokens rather than repeating hex codes here. These two
    // lines were still the old warm palette after the ground changed, which
    // meant the phone status bar and the pre-paint background were a colour
    // that no longer existed anywhere else on the site.
    const css = getComputedStyle(document.documentElement);
    const token = (name) => `rgb(${css.getPropertyValue(name).trim()})`;
    if (meta) meta.setAttribute("content", dark ? token("--ground") : token("--accent"));
    document.documentElement.style.backgroundColor = token("--ground");
    try {
      localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    } catch {
      // localStorage unavailable — theme just won't persist
    }
  }, [dark]);

  /**
   * One click handler for both kinds of destination.
   *
   * The nav now mixes real routes ("/services/roof-repairs") with anchors on
   * the homepage ("#testimonials"), and the two need different handling:
   * a route is a router navigation, an anchor is a scroll — and an anchor
   * clicked from an inner page has to go home first and then scroll, once the
   * homepage has actually mounted.
   */
  const go = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    setOpenDropdown(null);

    if (href.startsWith("/")) {
      navigate(href);
      return;
    }

    if (window.location.pathname !== "/") {
      navigate("/");
      // The homepage is code-split and its sections mount over a few frames,
      // so the target does not exist the instant navigate() returns.
      setTimeout(() => scrollToHash(href), 350);
    } else {
      setTimeout(() => scrollToHash(href), 60);
    }
  };

  return (
    <>
      <MockupBanner />
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className={`fixed inset-x-0 top-8 z-50 transition-all duration-200 ${scrolled ? "glass border-b border-ink-700/30" : ""}`}
        data-testid="nav-container"
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between px-5 transition-all duration-200 sm:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4 lg:px-4 ${scrolled ? "py-3" : "py-4"}`}
        >
          <nav className="hidden items-center gap-0.5 whitespace-nowrap lg:-ml-12 lg:flex xl:-ml-[72px] xl:gap-1" data-testid="nav-links">
            {/* Home appears only when you are not already on it.
                On the homepage it is dead weight — the logo already goes
                there — but on an inner page it is the fastest way back and
                its absence is the sort of thing that quietly strands people. */}
            {!onHome && (
              <Link
                to="/"
                className="group/link relative px-2 py-2 font-mono text-[11px] tracking-[0.2em] text-zinc-400 uppercase transition-colors hover:text-brand xl:px-3"
                data-testid="nav-link-home"
              >
                Home
                <span className="absolute bottom-0 left-2 right-2 h-[1.5px] origin-left scale-x-0 bg-brand transition-transform duration-200 ease-out group-hover/link:scale-x-100" />
              </Link>
            )}
            {NAV_GROUPS.map((g) => (
              <div
                key={g.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(g.label)}
                onMouseLeave={() => setOpenDropdown((cur) => (cur === g.label ? null : cur))}
              >
                <a
                  href={g.href}
                  onClick={(e) => go(e, g.href)}
                  className="group/link relative flex items-center gap-1 px-2 py-2 font-mono text-[11px] tracking-[0.2em] text-zinc-400 uppercase transition-colors hover:text-brand xl:px-3"
                  data-testid={`nav-link-${g.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {g.label}
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${openDropdown === g.label ? "rotate-180" : ""}`} />
                  <span className="absolute bottom-0 left-2 right-2 h-[1.5px] origin-left scale-x-0 bg-brand transition-transform duration-200 ease-out group-hover/link:scale-x-100" />
                </a>
                <AnimatePresence>
                  {openDropdown === g.label && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute left-0 top-full mt-2 w-64 border border-ink-700/30 bg-ink-900 p-2 shadow-xl"
                      data-testid={`nav-dropdown-${g.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {g.items.map((it) => (
                        <a
                          key={it.label}
                          href={it.href}
                          onClick={(e) => go(e, it.href)}
                          className="block px-3 py-2.5 transition-colors hover:bg-ink-850"
                        >
                          <p className="font-display text-sm font-bold text-zinc-100">{it.label}</p>
                          <p className="mt-0.5 text-xs text-zinc-500">{it.desc}</p>
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            {SIMPLE_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => go(e, l.href)}
                className="group/link relative px-2 py-2 font-mono text-[11px] tracking-[0.2em] text-zinc-400 uppercase transition-colors hover:text-brand xl:px-3"
                data-testid={`nav-link-${l.label.toLowerCase()}`}
              >
                {l.label}
                <span className="absolute bottom-0 left-2 right-2 h-[1.5px] origin-left scale-x-0 bg-brand transition-transform duration-200 ease-out group-hover/link:scale-x-100" />
              </a>
            ))}
          </nav>

          {/* The logo is a real link home from anywhere, not a scroll-to-top
              that only works on the homepage. */}
          <Link to="/" className="btn-lift flex items-center gap-3 lg:justify-self-center" data-testid="nav-logo">
            {/* `drop-` used to be tacked on the end of this class list — an
                unfinished Tailwind class that generated nothing. Removed.
                Dimensions are stated so the header doesn't reflow around the
                logo as it decodes. */}
            {/* The logo shrinks on a phone. At 375px the full-size mark plus
                the wordmark plus the call and menu buttons did not fit, and
                the wordmark was being clipped mid-word — "HYNSON ROOFIN". */}
            <img
              src="/brand/logo.png"
              alt="Hynson Roofing Services"
              width="56"
              height="56"
              decoding="async"
              className="h-10 w-10 object-contain sm:h-14 sm:w-14"
            />
            <span className="whitespace-nowrap font-display text-base font-extrabold uppercase tracking-tight text-zinc-50 sm:text-xl">
              Hynson <span className="text-brand-ember">Roofing</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4 lg:justify-self-end">
            {/* The pulsing dot that used to sit here has gone. It was a
                decorative "we're online" indicator next to a phone number,
                which is not a thing a phone number can be, and it was the
                busiest element in the header. The number itself is the
                message. */}
            <a
              href={`tel:${PHONE_TEL}`}
              className="hidden items-center gap-2 font-mono text-[11px] tracking-widest text-zinc-300 transition-colors hover:text-brand lg:flex"
              data-testid="nav-phone"
            >
              <Phone className="h-3.5 w-3.5 text-brand" /> {PHONE_DISPLAY}
            </a>
            {/* One primary action in the header, and it now goes to the
                contact page rather than opening a modal over whatever you
                were reading. */}
            <Link
              to="/contact"
              className="btn-lift hidden bg-brand px-5 py-2.5 font-mono text-[11px] font-semibold tracking-[0.2em] text-white uppercase hover:bg-brand-bright sm:block"
              data-testid="nav-quote-btn"
            >
              Get a quote
            </Link>
            <button
              onClick={() => {
                const next = !dark;
                setDark(next);
                toast(next ? "Switched to dark mode" : "Switched to light mode", { duration: 3000 });
              }}
              className="btn-lift hidden h-9 w-9 items-center justify-center border border-ink-700/50 bg-ink-900/70 text-zinc-300 backdrop-blur hover:border-brand hover:text-brand lg:flex"
              aria-label="Toggle dark theme"
              data-testid="nav-theme-toggle"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {/* Call button, phones only.
                The full phone number beside it is `lg:flex`, so below 1024px
                there was no way to ring from the header at all — you had to
                open the menu and find it. Most people who need a roofer are
                standing outside on a phone looking at a leak, which makes
                "call now" the single most important control on a small screen.
                Icon-only because the number does not fit next to the logo at
                390px, and the aria-label reads it out in full. */}
            <a
              href={`tel:${PHONE_TEL}`}
              className="btn-lift flex h-[42px] w-[42px] items-center justify-center border border-brand bg-brand text-white hover:bg-brand-bright lg:hidden"
              aria-label={`Call Hynson Roofing on ${PHONE_DISPLAY}`}
              data-testid="nav-phone-mobile"
            >
              <Phone className="h-4 w-4" />
            </a>
            <button
              onClick={() => setMenuOpen(true)}
              className="btn-lift flex items-center gap-2 border border-ink-700/50 bg-ink-900/70 px-4 py-2.5 font-mono text-[11px] font-semibold tracking-[0.2em] text-zinc-100 uppercase backdrop-blur hover:border-brand lg:hidden"
              data-testid="nav-menu-btn"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4 text-brand" /> <span className="hidden sm:inline text-zinc-300">Menu</span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[70] flex flex-col bg-ink-950/97 backdrop-blur-xl"
            data-testid="fullscreen-menu"
          >
            <div className="flex items-center justify-between px-5 py-4 sm:px-8">
              <span className="flex items-center gap-2.5">
                <img
                  src="/brand/logo.png"
                  alt="Hynson Roofing Services"
                  width="36"
                  height="36"
                  decoding="async"
                  className="h-9 w-9 object-contain"
                />
                <span className="font-display text-base font-bold uppercase tracking-tight text-zinc-50">
                  Hynson <span className="text-brand">Roofing</span>
                </span>
              </span>
              <div className="flex items-center gap-2.5">
              {/* The light/dark switch lives here as well as in the header.
                  The header copy is `lg:flex`, so on a phone or a tablet there
                  was no way to change theme at all — and the menu is the one
                  place on a small screen with room for it. */}
              <button
                onClick={() => {
                  const next = !dark;
                  setDark(next);
                  toast(next ? "Switched to dark mode" : "Switched to light mode", { duration: 3000 });
                }}
                className="btn-lift flex h-[42px] w-[42px] items-center justify-center border border-ink-700/50 bg-ink-900 text-zinc-300 hover:border-brand hover:text-brand lg:hidden"
                aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
                data-testid="menu-theme-toggle"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setMenuOpen(false)}
                className="btn-lift flex items-center gap-2 border border-ink-700/50 bg-ink-900 px-4 py-2.5 font-mono text-[11px] font-semibold tracking-[0.2em] text-zinc-300 uppercase hover:border-brand"
                data-testid="menu-close-btn"
                aria-label="Close menu"
              >
                <X className="h-4 w-4 text-brand" /> Close
              </button>
              </div>
            </div>

            {/* min-h-0 lets this flex child actually shrink, which is what
                makes its own overflow scroll work — without it the list just
                pushes the footer off-screen on a short phone. */}
            <nav
              className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto overscroll-contain px-8 sm:px-16"
              // See Modal.jsx — Lenis preventDefaults all wheel events while
              // stopped, so a scrollable overlay needs this to scroll at all.
              data-lenis-prevent
              data-testid="menu-links"
            >
              {MENU_LINKS.map((l, i) => (
                <motion.div
                  key={l.href + l.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.06 * i, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    className="group flex items-baseline gap-4 border-b border-ink-700/25 py-3 sm:py-4"
                    data-testid={`menu-link-${l.label.toLowerCase().replace(/[^a-z]/g, "-")}`}
                  >
                    <span className="font-mono text-xs tracking-[0.25em] text-brand-ember">{l.num}</span>
                    <span className="font-display text-3xl font-extrabold uppercase tracking-tight text-zinc-50 transition-colors group-hover:text-brand sm:text-5xl">
                      {l.label}
                    </span>
                    <ArrowUpRight className="ml-auto h-6 w-6 text-zinc-600 opacity-0 transition-all group-hover:text-brand group-hover:opacity-100" />
                  </a>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-between gap-4 px-8 py-6 sm:px-16"
            >
              <p className="font-mono text-[10px] tracking-[0.25em] text-zinc-500 uppercase">Auckland Wide</p>
              <a href="tel:+642040281926" className="font-mono text-xs tracking-[0.2em] text-brand" data-testid="menu-phone">
                020 4028 1926
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating triggers — always reachable while scrolling, labelled so
          the calculator especially (previously a bare nav icon nobody
          understood) is self-explanatory at a glance. Sits above the
          back-to-top button (MiniBuilding.jsx, bottom-5/right-5). */}
      <AnimatePresence>
        {showFabs && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-5 z-40 flex flex-col items-end gap-2.5 sm:bottom-28 sm:right-8"
          >
            {/* Labelled, because an unexplained icon is a button nobody
                presses. One short line each rather than the old two-line
                stack, so they say what they do without becoming a slab of
                button sitting on the page's right-hand column.

                The roof tool opens OVER the page rather than navigating: the
                header already has a Roof Cost link for the full page, so this
                is the shortcut that lets you measure a roof without losing
                your place. */}
            <button
              type="button"
              onClick={() => setToolOpen(true)}
              className="btn-lift flex items-center gap-2.5 border border-line-strong bg-surface py-2.5 pl-2.5 pr-4 shadow-card hover:border-accent"
              data-testid="fab-calculator"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-accent/10 text-accent">
                <Ruler className="h-4 w-4" />
              </span>
              <span className="whitespace-nowrap font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-content">
                Roof size tool
              </span>
            </button>
            {pathname !== "/contact" && (
              <Link
                to="/contact"
                className="btn-lift flex items-center gap-2.5 bg-accent py-2.5 pl-2.5 pr-4 text-accent-on shadow-card hover:bg-accent-hover"
                data-testid="fab-quote"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-white/15">
                  <ClipboardCheck className="h-4 w-4" />
                </span>
                <span className="whitespace-nowrap font-mono text-[11px] font-semibold uppercase tracking-[0.12em]">
                  Get a free quote
                </span>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* The roof size tool, over the page.
          Lazy: the estimator pulls in the address lookup and, if someone opens
          the map tab, Leaflet. None of that should be in the first download
          just because a button exists. */}
      <Modal open={toolOpen} onClose={() => setToolOpen(false)} maxWidthClass="max-w-4xl">
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center bg-surface">
              <span className="t-label text-content-faint">Loading…</span>
            </div>
          }
        >
          <QuoteCalculator compact />
        </Suspense>
      </Modal>
    </>
  );
}
