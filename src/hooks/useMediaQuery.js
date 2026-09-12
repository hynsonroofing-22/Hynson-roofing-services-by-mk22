import { useState, useEffect } from "react";

/**
 * Media-query hooks used to decide what actually gets rendered — not just
 * what gets hidden with CSS. The difference matters here: the 3D hero must
 * never be mounted on a phone (see CLAUDE.md), and `hidden` still downloads
 * the textures and runs the WebGL context.
 */

// Width alone is not enough to mean "desktop": an iPad in landscape is
// 1024px wide and would still get the 3D scene. Pairing the width with
// `pointer: fine` excludes touch tablets, which report `coarse`.
export const DESKTOP_QUERY = "(min-width: 1024px) and (pointer: fine)";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function readQuery(query, fallback) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return fallback;
  return window.matchMedia(query).matches;
}

export function useMediaQuery(query, fallback = false) {
  // Read synchronously on first render rather than in an effect: an effect
  // would render the wrong branch for one frame, which on mobile means
  // briefly mounting the 3D canvas we are trying to avoid entirely.
  const [matches, setMatches] = useState(() => readQuery(query, fallback));

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    // Re-read on mount too — a resize between the first render and this
    // effect would otherwise be missed.
    setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

// Fails closed: if matchMedia is unavailable we assume "not desktop", so the
// worst case is a phone-friendly page on a big screen rather than a WebGL
// canvas on a phone.
export function useIsDesktop() {
  return useMediaQuery(DESKTOP_QUERY, false);
}

export function usePrefersReducedMotion() {
  return useMediaQuery(REDUCED_MOTION_QUERY, false);
}

/**
 * Tracks the site's own dark theme, which Navbar toggles by putting a `dark`
 * class on <html> — it is not the OS colour scheme, so `prefers-color-scheme`
 * would be the wrong signal.
 *
 * The 3D hero needs this. Its canvas colours are painted by three.js, not CSS,
 * so they cannot inherit the theme the way the rest of the page does. Before
 * this, dark mode left a cream-coloured 3D scene behind near-white overlay
 * text, and the headline disappeared completely.
 */
export function useIsDarkTheme() {
  const read = () =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const [dark, setDark] = useState(read);

  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setDark(el.classList.contains("dark"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  return dark;
}
