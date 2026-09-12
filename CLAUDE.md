# Hynson Roofing — project context

Read this first, every session. It is the standing brief.

## What this is

A new website for **Hynson Roofing Services Limited**, a roofing company in
Auckland, New Zealand. It replaces their current Wix site.

The developer (Mkasa) is building it for the owner, **Eugene**, as a paid job.
It is currently a **draft being shown to the client for approval** — not live.

## The client's real details (verified from his live site — use these exactly)

- Hynson Roofing Services Limited
- 13 Hardington Street, Onehunga, Auckland 1061
- info@hynsonroofingservices.co.nz
- 020 4028 1926
- facebook.com/hynsonroofingservices
- instagram.com/hynsonroofingservices.nz
- tiktok.com/@hynsonroofingservices
- Headline: "Built on Quality. Backed by Experience."
- 12 services incl. roof painting, emergency roofing, flashings maintenance
- Only ONE verified customer review exists (Nolan L., canopy refurbishment)

## Design direction

- **Accent colour is ORANGE** — `#C2610F` primary, `#E27614` bright.
  The site used to be green; the green is gone and must not come back.
  Backups exist as `index.css.GREEN-BACKUP` / `tailwind.config.js.GREEN-BACKUP`.
- Warm off-white grounds, never pure white. One or two dark sections for rhythm.
- Reference the client chose: **solutionroofing.co.nz** — for its polish,
  clean layout and trust density. NOT its blue.
- Cabinet Grotesk for display, Plus Jakarta Sans for body.
- Avoid the generic AI-built look: no centred-everything, no equal 3-column
  grids, no gradient buttons, no emoji icons, no uniform spacing.

## Hard technical constraints

- **React 18 + @react-three/fiber v8.** NEVER upgrade react, react-dom,
  @react-three/fiber or @react-three/drei — the newest versions require
  React 19 and will break this app.
- `@react-three/postprocessing` must stay on **^2.16.0**. v3 needs React 19.
- Tailwind is still NOT in the `npm run build` pipeline — `src/index.css` is a
  committed, pre-compiled stylesheet and the deploy uses it as-is. But it is no
  longer hand-edited. **Regenerate it with `npm run css`** after changing any
  markup, or new utility classes silently do nothing.
  `src/tailwind-source.css` is the real source (base + components layers);
  `tailwind.config.js` is the real config. Both were verified to regenerate the
  committed `index.css` byte-for-byte before this was adopted.
  Do not add a `prebuild` hook: the deploy must keep working from the committed
  CSS alone.
- The `ink-*` and `zinc-*` colour scales are **inverted**: `zinc-50` is nearly
  black in the default light theme and only becomes nearly white under `.dark`.
  Anything sitting on a photo or a permanently dark section must use literal
  `text-white` / `bg-black`, not the themed tokens, or it disappears.
- framer-motion's `useScroll({ target })` measures the target when its scroll
  listener attaches. If that element's height is set from state measured after
  mount, it measures a zero-length range and its progress is stuck at 0 forever.
  `WorkGallery.jsx` therefore drives its pin from raw page scroll plus its own
  measured geometry. Don't "simplify" it back.
- When testing scroll-driven UI, scroll with a real mouse wheel. Lenis is
  running, and programmatic `window.scrollTo` / `lenis.scrollTo` moves the page
  without producing the scroll events framer-motion listens to, so everything
  scroll-linked looks broken when it isn't.
- **Every scrollable overlay needs `data-lenis-prevent`.** While Lenis is
  stopped (which is exactly what `useScrollLock` does) it calls
  `preventDefault()` on wheel events for the whole page, so the overlay's own
  content cannot scroll either. Lenis checks for that attribute *before* the
  preventDefault and skips those elements. Modal, the full-screen menu and the
  project lightbox all carry it — any new overlay must too.
- A scrollable overlay must not combine `flex items-center` with
  `overflow-y-auto`: a panel taller than the viewport gets centred on overflow,
  which clips its top off where nothing can scroll to it. Use `items-start`
  plus `my-auto` on the panel.
- `AnimatePresence` does not work reliably in `QuoteCalculator.jsx` — `wait`,
  `sync` and `popLayout` were all tried and each left exiting steps mounted
  forever, frozen at `initial`. The step swap there is a hand-rolled crossfade
  (`step` vs `shownStep`); don't "restore" AnimatePresence without testing that
  old steps actually unmount.

## Address → roof area (`netlify/functions/roof-area.js`)

- Free data only: LINZ **NZ Building Outlines** layer `101290` for footprints,
  LINZ **NZ Addresses** layer `123113` (falling back to OpenStreetMap
  Photon) for geocoding. No paid API is involved and none may be added.
- **Confirm LINZ layer IDs against GetCapabilities, never from a web search.**
  `105689` was used here for a while on the strength of a search result; it is
  the retired pilot and the WFS answers "Feature type layer-105689 unknown".
  `…/wfs?service=WFS&version=2.0.0&request=GetCapabilities` lists the real
  names and titles.
- Autocomplete falls back to **Photon**, not Nominatim — Nominatim's usage
  policy forbids using it for type-ahead.
- Never wrap a lookup in a bare `catch { setState([]) }`. A dead function, a bad
  key, an HTTP error and a genuinely unknown address then all look identical on
  screen (nothing), which is exactly how this feature shipped broken once.
  Check `res.ok` AND the content-type — HTML coming back is the signature of the
  function not running — and surface each case differently.
- The LINZ key is read from `process.env.LINZ_API_KEY` **server-side only**.
  Never rename it to `REACT_APP_*` — CRA bakes those into the public bundle.
- A footprint is not a roof area. Multiply by `1 / cos(pitch)`: low ×1.04,
  medium ×1.10, steep ×1.22, and always show the working on screen.
- Never guess an area. No address match ⇒ say so plainly and fall back to the
  slider. Always label results "estimated from building outline data — a site
  visit gives the real figure."
- The typed address is personal data: POST only (never a URL), used once, never
  logged or stored unless the quote form is actually submitted.
- Full detail in `FEATURES-BRIEF.md` § "Address → roof area".
- ~~`src/components/MiniBuilding.jsx` imports `WallLevel` and `RoofShell`~~ —
  **no longer true.** MiniBuilding is now just a back-to-top button and imports
  nothing from any scene file. Nothing depends on those exports.
- The desktop 3D hero now renders `src/components/RoofScene.jsx`, not
  `BuildingScene.jsx`. BuildingScene is retired but kept on disk, unimported,
  in case the client ever wants the old house build back. Its 43KB never
  reaches the bundle while nothing imports it.
- The 3D hero is **code-split** behind `src/components/Hero.jsx`. That split is
  what keeps ~236KB gzipped of three.js off phones entirely — don't collapse
  `Hero.jsx` back into a direct import.
- `Modal.jsx` has a scroll lock that stops **Lenis** as well as setting
  `overflow: hidden`. Removing either half reintroduces the background-scroll
  bug. Keep both.

## Non-negotiable honesty rule

**No number, year, rating, guarantee, certification, price or service area may
appear on the site unless the client has confirmed it is true.**

This codebase has already produced: a fake "15-year workmanship guarantee",
invented star ratings on a real customer's review, a false
"Auckland · Wellington · Nationwide" service area, and invented per-m² pricing.
Assume there is more. Leave an element out rather than filling it with a
plausible-looking value. Any placeholder that must stay for the demo has to be
**visibly marked as a placeholder on screen**.

Log anything unresolved in `LAUNCH-BLOCKERS.md`.

## Client feedback that shapes the work

- Eugene saw the 3D animation and said it **"doesn't show the company is a good
  roofing company."** It sold architecture, not roofing. The animation must
  focus on the ROOF and its craft — layers, flashings, seams, ridge line.
  *Addressed:* `RoofScene.jsx` now builds a roof in eight real stages —
  trusses, purlins, underlay, long-run iron, ridge cap, barge and apron
  flashings, fascia and spouting, then one wide finished shot. The house
  underneath is deliberately four plain walls. Keep it that way.
- **No 3D on mobile at all.** Phones get a photo-led hero. Most roofing
  customers are on a phone, often standing outside looking at a leak.
  *Addressed:* `Hero.jsx` hard-branches on `useIsDesktop()`
  (`min-width: 1024px` AND `pointer: fine`, so touch tablets are excluded) and
  the 3D is lazy-loaded, so on a phone the canvas is never constructed and the
  three.js chunk is never fetched.

## Working style

Mkasa is **not technical**. Explain changes by what he will *see*, not what you
edited. No jargon. Show progress in small visible steps. Never leave the site
broken at the end of a step. If a decision is needed, give two or three concrete
options rather than an open question.

## The other briefs in this folder

- `LAUNCH-BLOCKERS.md` — everything that must be fixed before go-live. Read it.
- `LAUNCH-AND-HANDOVER.md` — the ordered runbook from demo to handover
- `CONTENT-AND-REFERENCE-BRIEF.md` — verified facts + the trust-claim risk
- `LAYOUT-BRIEF.md` — premium layout direction
- `FEATURES-BRIEF.md` — calculator, **address → roof area**, roof visualiser,
  image presentation
- `ANIMATION-BRIEF.md` — the 3D scene
- `HANDOVER-BRIEF.md` — client editing screen + account ownership
- `NEXT-UP.md` — work that needs nothing from the client

## Cost rule

No paid APIs, services or subscriptions without asking first. Any account
needed goes on the single project Gmail, never the developer's personal ones.

---

## Secrets — read before touching any API key

- `CREDENTIALS.md` in the project root holds keys and account details. It is
  gitignored. **Never commit it, never copy its contents into any source file,
  and never print a key back into a summary or a commit message.**
- The LINZ API key belongs in a Netlify environment variable (`LINZ_API_KEY`)
  read by a Netlify Function. It must never reach the frontend — React bakes
  `REACT_APP_` variables into the published bundle where anyone can read them.
- Same rule for `ADMIN_SECRET` and anything else added later.
- If a key ever does end up in committed code, say so plainly and tell me to
  regenerate it. Don't quietly remove it and move on — once it's in git history
  it's still there.
