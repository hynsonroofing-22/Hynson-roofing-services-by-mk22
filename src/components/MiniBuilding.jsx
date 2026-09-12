import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

/**
 * Back-to-top button. Used to be a second live WebGL canvas (a spinning
 * mini house reusing WallLevel/RoofShell) — replaced with a plain button
 * so the page only ever runs one 3D scene at a time.
 */
export default function MiniBuilding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Matches the FAB threshold in Navbar.jsx — both have to clear the
    // mobile hero's bottom-anchored CTA row before they appear.
    const on = () => setShow(window.scrollY > window.innerHeight * 0.92);
    window.addEventListener("scroll", on, { passive: true });
    on();
    return () => window.removeEventListener("scroll", on);
  }, []);

  const toTop = () => {
    if (window.__lenis) window.__lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.9 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={toTop}
          className="btn-lift fixed bottom-5 right-5 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-brand text-white shadow-xl warm-glow hover:bg-brand-bright sm:h-16 sm:w-16"
          data-testid="mini-building-widget"
          aria-label="Back to top"
        >
          <ArrowUp className="h-6 w-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
