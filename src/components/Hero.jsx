import { lazy, Suspense } from "react";
import HeroMobile from "./HeroMobile";
import { useIsDesktop } from "../hooks/useMediaQuery";

// Hero3D pulls in three.js, @react-three/fiber, drei and the whole building
// scene. Loading it lazily means a phone never downloads that bundle at all —
// the split point is what makes "no 3D on mobile" true for the network as
// well as for the GPU.
const Hero3D = lazy(() => import("./Hero3D"));

export default function Hero() {
  const isDesktop = useIsDesktop();

  // Deliberately a hard branch, not a CSS `hidden`: on a phone the Canvas is
  // never constructed, so there is no WebGL context, no texture download and
  // no render loop. See CLAUDE.md.
  if (!isDesktop) return <HeroMobile />;

  return (
    <Suspense fallback={<div className="h-screen w-full bg-ink-950" aria-hidden="true" />}>
      <Hero3D />
    </Suspense>
  );
}
