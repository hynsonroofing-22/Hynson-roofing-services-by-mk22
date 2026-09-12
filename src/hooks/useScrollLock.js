import { useEffect } from "react";

/**
 * Locks background scrolling while an overlay is open.
 *
 * This site runs Lenis smooth scroll, which intercepts wheel events
 * globally — so `overflow: hidden` on <body> is NOT enough on its own.
 * Lenis has to be stopped too, or the page keeps moving behind the overlay
 * and the overlay's own content won't scroll properly either.
 *
 * Also pads <body> by the scrollbar width so the page doesn't jump
 * sideways when the scrollbar disappears.
 *
 * Usage:  useScrollLock(isOpen);
 */
export default function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;

    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (window.__lenis) window.__lenis.stop();
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
      if (window.__lenis) window.__lenis.start();
    };
  }, [active]);
}
