import { lazy, Suspense, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MiniBuilding from "./MiniBuilding";

const ChatBot = lazy(() => import("./ChatBot"));

/**
 * The frame every page that isn't the homepage sits in.
 *
 * It exists so that the header, the footer, the breadcrumb, the back-to-top
 * button and the assistant are defined once. A page that has to remember to
 * include its own footer is a page that will eventually ship without one.
 */

/**
 * Puts a new page at the top.
 *
 * React Router keeps the scroll position across a route change, which on a
 * long page means clicking a service link drops you into the middle of the
 * new one. Lenis has to be told as well as the window — it keeps its own idea
 * of where the page is, and left alone it scrolls the page straight back.
 */
function useScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);
}

/**
 * Breadcrumbs.
 *
 * `trail` is everything above the current page; `current` is where you are.
 * Marked up as an ordered list inside a labelled nav, which is what a screen
 * reader expects, and the current page carries aria-current rather than being
 * a link to itself.
 */
export function Breadcrumbs({ trail = [], current }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-line bg-surface-sunken">
      <ol className="mx-auto flex max-w-page flex-wrap items-center gap-x-2 gap-y-1 px-5 py-3.5 sm:px-8">
        <li className="flex items-center gap-2">
          <Link
            to="/"
            className="t-label text-content-faint transition-colors hover:text-accent"
          >
            Home
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0 text-content-faint" aria-hidden="true" />
        </li>
        {trail.map((c) => (
          <li key={c.to} className="flex items-center gap-2">
            <Link
              to={c.to}
              className="t-label text-content-faint transition-colors hover:text-accent"
            >
              {c.label}
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 text-content-faint" aria-hidden="true" />
          </li>
        ))}
        <li>
          <span className="t-label text-accent" aria-current="page">
            {current}
          </span>
        </li>
      </ol>
    </nav>
  );
}

export default function PageShell({ trail, current, children }) {
  useScrollToTop();

  return (
    <div className="bg-ground" data-testid="page-shell">
      <Navbar />
      {/* Clears the fixed header. The header is 96px at its tallest plus the
          mockup banner above it, and this is the one place that offset is
          stated, so no page can get it slightly different from another. */}
      <div className="h-[104px] sm:h-[112px]" aria-hidden="true" />
      {current && <Breadcrumbs trail={trail} current={current} />}
      <main>{children}</main>
      <Footer />
      <MiniBuilding />
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </div>
  );
}
