import { lazy, Suspense } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import EmergencyBand from "../components/EmergencyBand";
import WorkGallery from "../components/WorkGallery";
import Marquee from "../components/Marquee";
import About from "../components/About";
import Services from "../components/Services";
import QuoteCalculator from "../components/QuoteCalculator";
import Projects from "../components/Projects";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";
import Contact from "../components/Contact";
import PhotoBand from "../components/PhotoBand";
import Footer from "../components/Footer";
import MiniBuilding from "../components/MiniBuilding";

// The assistant and its knowledge base are fetched only once the page has
// settled, never as part of the first download. Nothing on the page depends on
// it, so there is nothing to wait for and nothing to reserve space for — the
// launcher is fixed-position and simply appears in the corner.
const ChatBot = lazy(() => import("../components/ChatBot"));

export default function Home() {
  return (
    <div id="top" className="bg-ink-950" data-testid="home-page">
      <Navbar />
      <Hero />
      <EmergencyBand />
      <WorkGallery />
      <Marquee />
      <About />
      <Services />
      <QuoteCalculator />
      <Projects />
      <Testimonials />
      <FAQ />
      <Contact />
      <PhotoBand />
      <Footer />
      <MiniBuilding />
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </div>
  );
}
