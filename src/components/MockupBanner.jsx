const NOTICE = "PREVIEW MOCKUP — NOT THE FINISHED WEBSITE — CONTENT & DESIGN STILL IN PROGRESS";

// A moving ribbon that makes it unmistakable this build is a work-in-progress
// preview, not the live site. Sits above the fixed navbar (see Navbar's
// top-8) so it can't be missed or scrolled away.
export default function MockupBanner() {
  const items = Array(6).fill(NOTICE);
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-8 overflow-hidden bg-brand-ember" data-testid="mockup-banner">
      <div className="flex h-full animate-marquee items-center whitespace-nowrap">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="mx-6 font-mono text-[10px] font-semibold tracking-[0.2em] text-white uppercase">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
