import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, useScroll, useMotionValueEvent, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, SkipForward, ArrowUpRight, Phone } from "lucide-react";
import { scrollToHash } from "./Navbar";
import RoofScene from "./RoofScene";
import { useIsDarkTheme } from "../hooks/useMediaQuery";
import { CHAPTERS, FINAL_PHOTO_SRC } from "../data/content";

const INTRO_SKIPPED_KEY = "hynson_intro_skipped";

export default function Hero3D() {
  const ref = useRef(null);
  // What the scene draws (eased), and where the scroll actually is (raw).
  const progress = useRef(0);
  const targetProgress = useRef(0);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [pct, setPct] = useState(0);
  // three.js paints the canvas, so it can't inherit the CSS theme. Without
  // this, dark mode left a cream 3D scene behind near-white overlay text and
  // the headline vanished completely.
  const dark = useIsDarkTheme();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Jumps past the pinned 5-screen build straight to the emergency band —
  // targets that section directly (not a computed offset off the hero's
  // own height) so it can't drift out of sync with layout, and always
  // lands with the 3D canvas fully off-screen. Remembers the choice so
  // returning visitors land straight past it — see the mount effect below.
  const jumpPastIntro = useCallback((smooth = true) => {
    const el = ref.current;
    if (!el) return;
    const nextSection = document.querySelector('[data-testid="emergency-band"]');
    // +32px past the section's own top: landing exactly at the sticky
    // release point still leaves the canvas filling the screen (that's
    // the boundary, not past it) — a small buffer guarantees it's gone.
    // Named scrollTarget, not `target`: there is a `targetProgress` ref in
    // this component and a plain `target` local here shadowed nothing but read
    // confusingly next to it — the first version of the easing code assigned
    // `target.current` and hit this number instead of the ref.
    const scrollTarget = nextSection
      ? nextSection.offsetTop + 32
      : el.offsetTop + el.offsetHeight - window.innerHeight;
    if (!smooth) {
      // Give the 3D scene the right frame immediately, don't wait for the
      // scroll-linked motion value to catch up. Both the eased value and its
      // target, or the easing loop would spend a second dragging it back.
      progress.current = 1;
      targetProgress.current = 1;
    }
    if (window.__lenis) {
      window.__lenis.scrollTo(scrollTarget, smooth ? { duration: 1 } : { immediate: true });
    } else {
      window.scrollTo({ top: scrollTarget, behavior: smooth ? "smooth" : "auto" });
    }
    try {
      localStorage.setItem(INTRO_SKIPPED_KEY, "1");
    } catch {
      // localStorage unavailable (private browsing etc.) — skip still works, just isn't remembered
    }
  }, []);

  useEffect(() => {
    let skipped = false;
    try {
      skipped = localStorage.getItem(INTRO_SKIPPED_KEY) === "1";
    } catch {
      skipped = false;
    }
    if (skipped && window.scrollY < 50) {
      // Fresh load at the top for a returning visitor — jump instantly, no
      // animation. Deferred a beat so layout/fonts settle first: jumping on
      // the very first frame reads a not-yet-final section height and can
      // land the scroll (and the scroll-linked 3D progress) out of sync.
      const id = setTimeout(() => jumpPastIntro(false), 300);
      return () => clearTimeout(id);
    }
  }, [jumpPastIntro]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.09], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.09], [0, -60]);

  // The build's final beat: dissolve from the live 3D scene into a real
  // photo — deliberately a different angle and time of day, so it reads
  // as a second, contrasting shot rather than an attempt to match the
  // model. Slow scale settle gives it an authored, not-a-hard-cut feel.
  const photoOpacity = useTransform(scrollYProgress, [0.93, 1], [0, 1]);
  const photoScale = useTransform(scrollYProgress, [0.93, 1], [1.08, 1]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    // The raw scroll position is the TARGET, not the thing the scene draws.
    targetProgress.current = v;
    setPct(Math.round(v * 100));
    const idx = CHAPTERS.findIndex((c) => v >= c.range[0] && v < c.range[1]);
    setChapterIdx(idx === -1 ? CHAPTERS.length - 1 : idx);
  });

  /**
   * Eases the build toward the scroll position instead of snapping to it.
   *
   * A mouse wheel does not produce a smooth stream of positions — it produces
   * one jump per notch, and a single notch can be several hundred pixels. The
   * scene was reading that raw value, so a normal scroll made the roof lurch
   * from one state to the next and could skip a whole stage between frames.
   * It looked like it was breaking; it was just being told to teleport.
   *
   * Everything in RoofScene reads `progress.current` inside its own useFrame,
   * so easing that one number here smooths the entire build — trusses, sheets,
   * flashings, camera — with no change to any of them.
   *
   * 0.12 was chosen by feel against a real wheel: high enough to keep up when
   * you scroll fast, low enough that a single notch glides rather than snaps.
   * The loop is stopped once it is within a thousandth of the target so it
   * isn't burning a frame forever while the page sits still.
   */
  useEffect(() => {
    let raf;
    const EASE = 0.12;
    const tick = () => {
      const diff = targetProgress.current - progress.current;
      progress.current = Math.abs(diff) < 0.0005 ? targetProgress.current : progress.current + diff * EASE;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const chapter = CHAPTERS[chapterIdx];

  return (
    // 720vh, up from 560vh. Nine stages across 560vh gave each one about 62vh
    // of scroll, which is roughly two notches of a mouse wheel — so a normal
    // scroll skipped stages entirely. 80vh each is enough that every stage
    // gets seen on the way past without the intro outstaying its welcome.
    <section ref={ref} data-testid="hero-3d-pinned-section" className="relative h-[720vh] bg-ground">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink-950">
        {/* Skip just scrolls past this pinned section — the canvas stays
            mounted so scrolling back up still shows the build normally. */}
        <Canvas
          data-testid="hero-3d-canvas"
          dpr={[1, 1.25]}
          camera={{ position: [9, 3, 9], fov: 40 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          style={{ position: "absolute", inset: 0 }}
        >
          {/* The canvas ground matches the page ground exactly, so there is no
              visible seam where the WebGL rectangle ends. These two are the
              --ground token's light and dark values; three.js cannot read CSS
              variables, which is the only reason they are repeated here. */}
          <color attach="background" args={[dark ? "#0E0F11" : "#F3F4F6"]} />
          <RoofScene progress={progress} dark={dark} />
        </Canvas>

        {/* final beat: the 3D scene dissolves into a real photograph — */}
        {/* skipped entirely until FINAL_PHOTO_SRC points at a real image */}
        {FINAL_PHOTO_SRC && (
          <motion.div
            style={{ opacity: photoOpacity, scale: photoScale, backgroundImage: `url(${FINAL_PHOTO_SRC})` }}
            className="pointer-events-none absolute inset-0 bg-cover bg-center"
            data-testid="hero-final-photo"
          />
        )}

        {/* Vignette that pulls the scene edges toward the page ground, so the
            canvas doesn't end on a hard rectangle. Has to follow the theme —
            a cream vignette over a dark scene was a bright halo. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(ellipse at center, transparent 45%, ${
              dark ? "rgba(14,14,12,0.9)" : "rgba(247,243,235,0.85)"
            } 100%)`,
          }}
        />

        <motion.div
          style={{ opacity: titleOpacity, y: titleY }}
          // pt was 64/72 (256/288px), which pushed the headline and both CTAs
          // off the bottom of a laptop-height viewport entirely.
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 pt-36 text-center sm:pt-40"
        >
          <p className="mb-3 font-mono text-[10px] tracking-[0.3em] text-brand-ember uppercase sm:mb-5" data-testid="hero-eyebrow">
            Hynson Roofing Services Ltd · Auckland NZ
          </p>
          <h1 className="font-display text-4xl font-extrabold uppercase leading-[1.0] tracking-[-0.02em] text-zinc-50 sm:text-5xl lg:text-7xl">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              >
                Built on quality.
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span
                className="block text-brand"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.32 }}
              >
                Auckland roofing,
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.49 }}
              >
                done right.
              </motion.span>
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mt-4 max-w-md text-base font-medium text-zinc-200 sm:mt-6 sm:text-lg"
          >
            Re-roofing, repairs, new installs & gutters — residential and commercial, across Auckland.
            <span className="hidden text-zinc-400 sm:block"> Scroll to watch a roof go on — trusses to spouting, stage by stage.</span>
          </motion.p>

          {/* compact quote panel — the hero had zero call-to-action before
              this; two buttons, no form, so it stays out of the way of
              the 3D scene */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
            className="pointer-events-auto mt-5 flex flex-wrap items-center justify-center gap-3 sm:mt-8"
          >
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToHash("#contact");
              }}
              className="btn-lift flex items-center gap-2 bg-brand px-6 py-3.5 font-mono text-xs font-semibold tracking-[0.2em] text-white uppercase hover:bg-brand-bright warm-glow"
              data-testid="hero-quote-cta"
            >
              Get a free quote <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="tel:+642040281926"
              className="btn-lift flex items-center gap-2 border border-zinc-50/30 bg-ink-950/30 px-6 py-3.5 font-mono text-xs font-semibold tracking-[0.2em] text-zinc-50 uppercase backdrop-blur hover:border-brand hover:text-brand"
              data-testid="hero-call-cta"
            >
              <Phone className="h-3.5 w-3.5" /> 020 4028 1926
            </a>
          </motion.div>
        </motion.div>

        <div className="pointer-events-none absolute left-5 top-24 sm:left-10 sm:top-28" data-testid="hero-chapter-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={chapterIdx}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xs border-l-2 border-brand pl-5 sm:max-w-sm"
            >
              {/* Derived from CHAPTERS, not hardcoded — the count changed from
                  5 to 8 when the build became roof-only. */}
              <p className="font-mono text-[11px] tracking-[0.3em] text-brand-ember">
                STAGE {chapter.step} / {String(CHAPTERS.length).padStart(2, "0")}
              </p>
              <h2 className="mt-2 font-display text-xl font-bold uppercase tracking-tight text-zinc-50 sm:text-3xl">
                {chapter.title}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400 sm:text-sm">{chapter.desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          className="pointer-events-none absolute bottom-8 left-5 sm:left-10 max-sm:hidden [@media(max-height:820px)]:hidden"
          data-testid="hero-progress-counter"
        >
          <p className="font-display text-5xl font-extrabold tabular-nums text-zinc-50 sm:text-7xl">
            {pct}
            <span className="text-brand">%</span>
          </p>
          <p className="mt-1 font-mono text-[10px] tracking-[0.3em] text-zinc-500 uppercase">Build complete</p>
        </div>

        <div className="pointer-events-none absolute bottom-8 right-5 flex flex-col items-center gap-2 sm:right-10 max-sm:hidden [@media(max-height:820px)]:hidden">
          <p className="font-mono text-[10px] tracking-[0.3em] text-zinc-500 uppercase [writing-mode:vertical-rl]">Scroll</p>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}>
            <ChevronDown className="h-5 w-5 text-brand" />
          </motion.div>
        </div>

        <button
          onClick={() => jumpPastIntro(true)}
          className="btn-lift absolute right-5 top-52 z-10 flex items-center gap-2 rounded-full border border-zinc-50/30 bg-ink-950/40 px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-zinc-50 uppercase backdrop-blur hover:border-brand hover:text-brand sm:right-10 sm:top-28"
          data-testid="hero-skip-intro"
        >
          Skip intro animation <SkipForward className="h-3.5 w-3.5" />
        </button>

        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-ink-700/20">
          <div className="h-full bg-brand transition-[width] duration-150" style={{ width: `${pct}%` }} data-testid="hero-progress-bar" />
        </div>
      </div>
    </section>
  );
}
