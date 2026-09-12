# Brief: make the scroll house-build photoreal

You are working in the Hynson Roofing website — a Create React App project.
The client is **Hynson Roofing Services Ltd, Auckland NZ**. The homepage hero is a
pinned, scroll-driven 3D sequence where a house builds itself from bare ground to
finished. Your job is to take that sequence from "good stylised 3D" to
**as close to photoreal as real-time WebGL can get.**

Read this whole file before changing anything.

---

## 1. The reference

The client's reference is the TikTok by **@elyptwebdesign — "Built from the ground up"**
(the VESTA site). He has also mentioned **@webloved — "VESTA / from ink to keys"**.

What the reference actually looks like, frame by frame:

- A **modern architectural home**: two storeys, low skillion roof with very deep
  overhangs, floor-to-ceiling glazing, warm timber, board-formed concrete, charcoal steel.
- For most of the build it sits on a **seamless white studio backdrop** — no sky,
  no ground, no landscape. Like a product render.
- Thin **charcoal fascia edge** on the roof, with a **warm timber soffit** underneath
  lit by recessed downlights. This is the signature detail.
- Slim charcoal window mullions, glass balustrades, an **open timber stair** visible
  inside — it reads like a doll-house cutaway.
- The camera **barely moves**. Slow arc, gentle push in. The building assembles in place.
- **The final beat is the important one.** At the end, the white studio backdrop gives
  way to a **fully real environment** — real grass, planting, sky, warm interior light
  spilling out at dusk. That last frame looks like an architectural photograph.

### What the client said, verbatim

> "it doesnt look as good as the one in the video by the end since it by the end in
> video was practically real i want realistic grass by the end and really good also
> the lighting i want everydetails"

So: **the ending is the priority.** The studio-white build-up is already close.
The finish has to land as a photoreal architectural shot, with convincing grass
and convincing light.

---

## 2. Where things stand

`src/components/BuildingScene.jsx` (~797 lines) was rewritten to match the reference
composition. It already has:

- Five phases wired to scroll, matching `CHAPTERS` in `src/data/content.js`
- Procedural canvas-generated textures (oak grain, battens, board-formed concrete, plaster)
- Studio IBL via drei `<Environment>` + inline `<Lightformer>`s
- Roof trays as displaced `PlaneGeometry` so seams have real silhouette
- ACES filmic tone mapping, PCF soft shadows, `ContactShadows`

The Emergent original is preserved at
`src/components/BuildingScene.EMERGENT-ORIGINAL.jsx` — do not delete it.

**Treat the current file as a starting point, not something to protect.** If a
rewrite gets closer to the reference, rewrite it.

---

## 3. Hard constraints — breaking these breaks the site

1. **Keep these exports with these exact signatures.** `src/components/MiniBuilding.jsx`
   imports the last two for a small spinning widget, and renders them in a separate
   `<Canvas>` with only `ambientLight` + `directionalLight` and `shadows={false}`.
   They must still look acceptable standalone, with no Environment and no post-processing.

   ```js
   export function Rise({ progress, range, drop, children })
   export function WallLevel({ y, rightAccent, shadows })
   export function RoofShell({ shadows })
   export default function BuildingScene({ progress })   // progress is a ref, 0..1
   ```

2. **`progress` is a `useRef`, not state.** Read `progress.current` inside `useFrame`.
   Never call `setState` per frame.

3. **Keep the phase ranges aligned to `CHAPTERS`** in `src/data/content.js`, because the
   on-screen caption changes with them:

   | Range | Caption |
   |---|---|
   | 0.00–0.20 | GROUND & FOUNDATION |
   | 0.20–0.45 | STEEL & TIMBER FRAMING |
   | 0.45–0.70 | WRAP & WALL CLADDING |
   | 0.70–0.90 | LONG-RUN ROOF ASSEMBLY |
   | 0.90–1.00 | THE FINISHED SANCTUARY |

4. **This is a roofing company.** The roof is the hero. Phase 4 should be the most
   satisfying moment in the sequence, and the roof should be the best-resolved object
   in the scene.

5. Don't touch `src/data/content.js` copy, the other components, or the page layout.

---

## 4. Version trap — read before installing anything

```
react 18.3.1 · @react-three/fiber 8.18.0 · @react-three/drei 9.122.0 · three 0.169.0
```

- `@react-three/postprocessing` **v3 requires fiber v9 / React 19. It will break this project.**
  Install **`@react-three/postprocessing@^2.16.0`** (pairs with fiber v8).
- Do not upgrade fiber/drei to v9 — that pulls React 19 and this is a CRA app with
  React 18. Not worth the blast radius.
- CRA does not process `.glsl` imports. Keep shaders as template literals in `.js`.
- Anything added to `public/` is served from `/` — reference it as `/textures/foo.jpg`,
  never with an import.

---

## 5. What to actually do

Work in order. **After each phase, run `npm start`, check the browser console is clean,
and stop to let the client look.** He is non-technical — tell him exactly what to look at.

### Phase A — lighting and post-processing (biggest win per effort)

1. Add `@react-three/postprocessing@^2.16.0`. Build an `<EffectComposer>` with:
   - **SMAA** (antialiasing — Canvas already sets `antialias: true`, but SMAA is better with a composer)
   - **N8AO or SSAO** for contact darkening in the corners. This alone reads as "real".
   - **Bloom** — very restrained. `intensity` around 0.25–0.4, high `luminanceThreshold`
     (~0.9). Bloom is the easiest way to make it look cheap; keep it subtle.
   - **Vignette**, barely there (`darkness` ~0.35)
   - Optionally **DepthOfField** for the final beauty shot only — a shallow focus on the
     house with the background softening. Consider ramping `bokehScale` with progress.
2. Replace the inline-Lightformer Environment with a **real HDRI**. Download a CC0
   outdoor HDRI (Poly Haven — `kloofendal_43d_clear`, `venice_sunset`, or a dusk one for
   the ending) at 2k, put it in `public/hdri/`, and load with
   `<Environment files="/hdri/xxx.hdr" />`. Self-host it — don't rely on drei's CDN presets,
   because they fetch at runtime and will fail offline or if the CDN moves.
3. Tighten the shadow frustum hard around the building. A 2048 map over a small frustum
   looks far better than 4096 over a huge one. Consider drei `<SoftShadows>` (PCSS) —
   measure the frame cost, it is not free.

### Phase B — real PBR materials

Swap the procedural canvas textures for proper texture sets. Get CC0 sets from
**ambientCG** or **Poly Haven** — each needs albedo + normal + roughness (+ AO where useful):

- board-formed / smooth architectural concrete
- warm oak (soffit, stair treads, batten screens, interior)
- dark standing-seam or long-run metal for the roof
- grass (see Phase C)

Rules: put them in `public/textures/<material>/`, load with drei `useTexture`,
set `colorSpace = THREE.SRGBColorSpace` on **albedo only**, set `wrapS/wrapT = RepeatWrapping`
with sensible `repeat`, and set `anisotropy = 8`. Resize to 1k–2k and compress —
do not ship 4k PNGs, this is a hero on every page load.

Glass: `MeshPhysicalMaterial` with `transmission`, `thickness`, `ior: 1.5`, low roughness.
Transmission is expensive — use it on the main glazing only, and keep an eye on the frame rate.

### Phase C — realistic grass for the ending (explicitly requested)

The house currently sits on a plain near-white studio disc. For the final phase it needs
to sit in a real landscape.

Suggested approach:
- A ground plane with a proper **grass PBR texture set** (albedo/normal/roughness), tiled,
  with large-scale variation so tiling isn't obvious.
- **Instanced grass blades** on top: an `InstancedMesh` of a few thousand simple blade
  geometries scattered near the house and thinning with distance. Animate with a wind
  function in a vertex shader (`onBeforeCompile`, or a custom `ShaderMaterial`).
  Randomise height, tilt and colour per blade.
- Density is the enemy of frame rate. Start around 20–30k blades, measure, and scatter
  them only where the camera actually looks.
- Add low planting and a couple of trees at the terrace edge for depth.

### Phase D — the studio-to-real transition

This is what makes the reference land, and it is currently missing.

Between roughly **p = 0.88 and p = 1.0**, cross-fade from the white studio to the real
environment:

- Fade the white backdrop disc out; fade the grass ground and planting in
- Cross-fade the environment map from the studio lightformers to the outdoor HDRI
  (`environmentIntensity` / `background` are animatable — or blend two Environments)
- Shift the key light from neutral studio white to a low, warm, late-afternoon sun
- Bring up the warm interior lights and the soffit downlights so they read strongly
  against the cooler exterior
- Push exposure very slightly and let bloom bite a little more on the interior glow

The end frame should look like an architectural photograph at golden hour, not a
3D model on white.

### Phase E — performance pass

Non-negotiable — this is a hero on every page load, and many of his visitors are on phones.

- Target **60fps desktop / 30fps+ mid-range mobile**
- The `<Canvas>` already uses `dpr={[1, 1.75]}` — keep a cap
- Instance anything repeated (grass, battens, mullions, downlights)
- Use drei `<AdaptiveDpr>` and `<AdaptiveEvents>`, and `<Preload all />`
- Detect low-power/mobile and drop: post-processing effects, grass blade count,
  shadow map size, transmission on glass
- Respect `prefers-reduced-motion`
- Watch the total download. HDRIs and texture sets get heavy fast — budget the whole
  hero under ~8–10 MB and lazy-load where you can

---

## 6. How to verify

1. `npm start`, open `localhost:3000`, scroll the hero slowly through all five phases
2. Browser console must be clean — no warnings from three or R3F
3. Check the **mobile layout** in devtools device emulation, and check the
   **MiniBuilding widget** (bottom-right, appears after scrolling past the hero)
   still renders — it reuses `WallLevel` and `RoofShell`
4. `npm run build` must succeed with no errors
5. Check the built bundle size and flag it if the hero pushes it over ~10 MB

---

## 7. Working style with this client

- He is **non-technical**. Explain in plain language, no jargon.
- He cannot read code — describe changes by what he'll *see*, not what you edited.
- Show him progress often. Small visible steps beat one big reveal.
- If something needs a decision, give him two or three concrete options, not an open question.
- Never leave the site in a broken state at the end of a step.

---

## 8. Honest expectation to set with him

Real-time WebGL will get **close to** the reference but will not exactly match the final
photoreal frame — that frame is almost certainly **pre-rendered**, not real-time.

If he wants an exact match, the alternative is a **pre-rendered image sequence**: render
120–180 frames of the build in Blender, export as compressed WebP/AVIF, and scrub them on
scroll. Better looking, much heavier to produce, and needs 3D software. The scroll plumbing
in `Hero3D.jsx` would drive it with very little change.

Tell him that trade-off honestly before he spends a week chasing it.
