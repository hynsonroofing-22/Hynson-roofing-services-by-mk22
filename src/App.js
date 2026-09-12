import { useEffect, lazy, Suspense } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "sonner";
import Home from "./pages/Home";

// Only the home page is part of the first download.
//
// The admin screen, the privacy policy and the accessibility statement were
// all imported directly here, which meant every visitor to the front page
// downloaded and parsed all three before anything could paint — including the
// admin login, which almost nobody will ever open. They are split out into
// their own files that are fetched only when someone actually visits those
// paths.
// Every page except the homepage is code-split, so a visitor who only ever
// reads the front page never downloads any of them.
const Services = lazy(() => import("./pages/Services"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const OurWork = lazy(() => import("./pages/OurWork"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const RoofCost = lazy(() => import("./pages/RoofCost"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const Admin = lazy(() => import("./pages/Admin"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const AccessibilityStatement = lazy(() => import("./pages/AccessibilityStatement"));
// Temporary: the light-ground comparison at /preview/grounds. Delete the route
// and the page once a ground has been picked. Lazy, unlinked, and behind a
// path nobody will guess, so it costs a real visitor nothing.
const GroundPreview = lazy(() => import("./pages/GroundPreview"));

/**
 * How much Lenis smooths the wheel, from 0 (never moves) to 1 (no smoothing).
 *
 * This was 0.09, which is a long, floaty glide: after the wheel stops the page
 * keeps coasting for the better part of a second, and a flick to reach
 * something specific overshoots it. 0.13 keeps the smoothness that makes the
 * scroll-linked sections read properly — the 3D roof build and the pinned work
 * gallery both depend on it — while stopping close to where you stopped.
 *
 * Chosen over 0.15, which was noticeably crisper still but started to stutter
 * on the pinned gallery, and over 0.12, which was hard to tell from the old
 * feel. Anything above about 0.2 is just native scrolling with extra steps.
 */
const LENIS_LERP = 0.13;

function App() {
  useEffect(() => {
    // Anyone who has asked their operating system to reduce motion gets the
    // browser's own scrolling, untouched. Smooth-scroll hijacking is exactly
    // the kind of thing that setting exists to switch off, and it can make
    // people motion-sick. Lenis is never constructed for them at all, so it
    // also costs them nothing to run.
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    const lenis = new Lenis({ lerp: LENIS_LERP });
    window.__lenis = lenis;
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <BrowserRouter
      // Opts in early to the two v7 behaviours React Router otherwise warns
      // about on every page load. Purely removes console noise; both flags
      // describe how v7 will behave anyway.
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Toaster position="top-center" richColors offset={112} />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/our-work" element={<OurWork />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/roof-cost" element={<RoofCost />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/accessibility-statement" element={<AccessibilityStatement />} />
          <Route path="/preview/grounds" element={<GroundPreview />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
