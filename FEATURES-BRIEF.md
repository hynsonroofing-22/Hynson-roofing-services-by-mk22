# Brief: the interactive features the client asked for

Fourth brief. Read after `CONTENT-AND-REFERENCE-BRIEF.md`.

The developer looked at `solutionroofing.co.nz` and named exactly what he wants:

> "i like their clean and neatnes of site and interactiveness and the generate new roof
> feaures and the new roof likely to cost page and the way their images are put and can
> be seen want it t seem inviting like theirs with authenticity"

Four things: **the roof visualiser**, **the cost estimator**, **how images are presented**,
and an overall feeling of **clean, inviting authenticity**. Taken in order of value.

---

## 1. How the reference's tools actually work

### Their roof visualiser — `visualise.solutionroofing.co.nz/generateyournewroof`

Marketed as "Free · No obligation · 60-second setup". Four steps:

1. Enter your property address (or upload a photo of your home)
2. It pulls a street photo of the property automatically; you confirm it
3. Pick a Colorsteel® colour
4. It renders your house with the new roof, and shows indicative cost

This is a **lead-capture machine**, not a toy. The visual is the hook; the address and
contact details are the product.

### Their cost estimator

Worth knowing before copying it: the "Instant Estimator" **is mostly a promise.** The
"Get my estimate" button goes to their contact form. There is no real live calculator
behind it.

**Hynson already has a genuine one** — `src/components/QuoteCalculator.jsx`. With real
numbers from Eugene, this can be honestly better than the site being copied.

---

## 2. Roof visualiser — three ways to build it

The full address-lookup version needs Google Street View imagery (paid API, per request)
and AI image generation to recolour the roof (paid per image, unpredictable quality on
NZ housing stock). It also fails awkwardly on rural properties, tree cover and bad
street imagery. It is a real product, not an afternoon's work, and it costs money per use.

Three options, cheapest and most reliable first:

### Option A — colour the 3D house that already exists ★ recommended first

The homepage already renders a full 3D house. Let the visitor **change the roof colour
and profile on it live** — swatches for the Colorsteel range, long-run vs membrane,
maybe a day/dusk lighting toggle.

- No API costs, no per-use billing, works offline, instant
- Impossible to get "wrong" — nobody's actual house is being misrepresented
- Reuses the thing no competitor in this market has
- Feeds the quote form: "You picked Grey Friars long-run — get a quote for it"

### Option B — real jobs, real colours

Take a handful of Hynson's own completed roofs and present each in the available colour
options, as a swatch-driven image swap. Honest, fast, and every image is real work.

Needs colour variants prepared once, per photo.

### Option C — upload your own house photo

Closest to the reference. The visitor uploads a photo, picks a colour, and gets their own
house back with a new roof.

Be clear-eyed about what this commits to:
- An image-generation or segmentation API — real per-image cost, ongoing
- Quality varies wildly with photo angle, light and roof shape
- Uploaded photos of people's homes are personal data — needs a retention policy and a
  privacy note
- Someone must handle abuse and failure cases

**Recommendation: build A now.** It is genuinely differentiated, costs nothing to run, and
can ship this week. Revisit C once the site is live and Eugene has seen what leads it
actually generates.

### Non-negotiable if any colour preview ships

- A visible disclaimer: on-screen colours are indicative and vary from the real product;
  always check a physical sample
- Only use the **Colorsteel®** name for colours if that is genuinely the product range
  Hynson installs. Naming a range is fine; implying **approved-installer status** is not,
  unless Eugene holds it. Same rule as the trust badges — see the content brief

---

## 3. The cost page — "what a new roof is likely to cost"

High intent. This is what people actually search. Worth doing properly.

Build it as its own page, driven by `QuoteCalculator.jsx`:

- Roof size — slider, exact type-in figure, **or look it up from their address**
  (see "Address → roof area" below), because nobody knows their roof area
- Roof type — long-run, membrane, tile
- Job type — new roof, re-roof, repair, painting
- Pitch/access complexity — single vs two storey
- Output: an **indicative range**, never a single number
- Then: "Get an exact quote" → the contact form, pre-filled with what they selected

### Address → roof area — BUILT ✅

**This was previously written off in this brief as "large build, low payoff" on
the assumption it needed paid Google APIs. That assumption was wrong, and it is
why the feature went unbuilt twice. It is free, and it is now built.**

- `src/components/RoofAreaFinder.jsx` — the UI, inside the estimator's Roof step
- `netlify/functions/roof-area.js` — the server-side lookup

How it works: address → coordinate → building footprint polygons → area.

| Piece | Source | Cost |
|---|---|---|
| Building footprints | LINZ **NZ Building Outlines**, layer `101290` | Free, open data |
| Address → coordinate | LINZ **NZ Addresses**, layer `123113`, falling back to OpenStreetMap Photon | Free, no signup |

**A footprint is not a roof area.** LINZ gives the flat outline seen from
above; a pitched roof covers more surface than the ground beneath it. The
multiplier is `1 / cos(pitch)` and matches the estimator's own pitch buttons:

| Pitch | Multiplier |
|---|---|
| Low (< 15°) | ×1.04 |
| Medium (15–30°) | ×1.10 |
| Steep (30°+) | ×1.22 |

The working is always shown in full — *"Footprint 176 m² · medium pitch ×1.1 ·
roof approx. 194 m²"* — and the result is labelled **"estimated from building
outline data — a site visit gives the real figure."** It is never presented as
surveyed.

Rules that must not be quietly dropped:

- **The key never reaches the browser.** It lives in a Netlify environment
  variable, `LINZ_API_KEY`, read only by the function. Naming it
  `REACT_APP_*` would bake it into the public bundle.
- **Never guess a number.** If the address or building can't be matched, say so
  in one sentence and leave the slider alone.
- **Multi-building sections** (house + garage + sleepout) must let the visitor
  pick which building, or it returns the wrong roof. Results are ordered
  nearest-first with a distance shown.
- **Privacy:** the typed address is POSTed (never in a URL), used once, and not
  stored or logged. It is only retained if they go on to submit the quote form.

**Correction (previously recorded wrongly here):** this brief used to say the
address layer was `105689` and that it returned 400 because its licence had not
been accepted. Both were wrong. `105689` is the **retired pilot** dataset and is
not published on the WFS at all — the service answers "Feature type
layer-105689 unknown". Nothing needs to be accepted or clicked.

The live layer is **`123113` — "NZ Addresses"**, confirmed from the service's
own capabilities document rather than from a search result:

```
GET https://data.linz.govt.nz/services;key=KEY/wfs?service=WFS&version=2.0.0&request=GetCapabilities
```

That lists 1842 feature types with their titles; filtering for "address" gives
`layer-123113 = NZ Addresses`. Verified working:
`full_address_ascii ILIKE '72 halsey%'` → "72 Halsey Drive, Lynfield, Auckland".

**Always confirm a layer ID against GetCapabilities. Do not take it from a web
search.**

Suggestions query LINZ first (Auckland results sorted to the top) and fall back
to **Photon** — not Nominatim, whose usage policy explicitly forbids
autocomplete — when a prefix match finds nothing.

### The numbers must come from Eugene

**Do not invent roofing prices.** Ask him for per-m² ranges for each roof type and job
type, plus what typically pushes a job to the top of the range. If he won't give numbers,
the page becomes a guide to *what drives cost* with no figures — still useful, still honest.

Publishing prices Eugene won't honour is a Fair Trading problem for **him**. Required on
the page:

- "Indicative only — every roof is different"
- "Prices as at [month/year]"
- Clear statement that a site visit produces the real quote

Add a short plain-English "what changes the price" section — access, pitch, existing roof
condition, scaffolding, asbestos, spouting. This is the part that builds trust, and it
costs nothing to verify.

---

## 4. How images are presented

The reference's gallery: a filtered grid (All / Residential / Commercial), each project a
card labelled by **street and suburb** — "Westbourne Road, Remuera" — with some marked
Featured, each linking to its own case-study page rather than a popup.

Hynson already has the grid and the filters. What's missing:

- **Location labels.** "Re-roof — Onehunga" beats "Residential Re-Roof". Local specificity
  is what sells in trades, and it quietly does the SEO job too
- **Consistent aspect ratios.** Mismatched crops are the single biggest thing that makes a
  site look untidy. Pick one ratio, `object-fit: cover`, no exceptions
- **Click to enlarge.** Lightbox with keyboard and swipe support
- **Before / after sliders** on two or three jobs, if Eugene has the pairs. Nothing sells
  roofing harder
- **Case study pages** for the best 3–5 jobs: the problem, what was done, the roof system
  used, the suburb, a few photos. Even 150 words each
- **Lazy loading and compression.** Job photos off a phone are enormous. Serve WebP,
  correctly sized, or the site will feel slow — which reads as unprofessional
- **Real alt text** on every image, for accessibility and search

### ⚠️ Check the existing photos are real

The nine images in `public/img/` came from an AI site builder. **Confirm with Eugene that
every one is a real Hynson job.** Any that are stock or AI-generated must be replaced
before launch — presenting someone else's roof, or a synthetic one, as your own work is
exactly the authenticity failure this brief is trying to avoid.

**Ask Eugene for 20–30 high-resolution photos of real completed jobs, with suburb names
and permission to publish.** This single act will do more for "inviting and authentic"
than any code in this document.

---

## 5. "Clean, neat, inviting"

That look comes from restraint, not additions:

- **More whitespace than feels necessary.** Generous, consistent section padding
- **One type scale.** Three or four sizes total, used consistently
- **Two colours plus neutrals.** Hynson's cream / deep green / clay — keep it. The client
  liked the reference's *credibility*, not its blue
- **Consistent card treatment.** One corner radius, one shadow, one border. Pick and repeat
- **Alignment.** Everything on a shared grid; nothing a few pixels adrift
- **Fewer, better photos.** Six excellent real job photos beat twenty mediocre ones
- **One primary action per section.** Usually "Get a quote"
- **Calm motion.** Gentle fades on scroll. The 3D hero is the showpiece — everything else
  should stay quiet so it lands

Authenticity specifically: real photos, real names ("Eugene and the team"), real suburbs,
a real address in Onehunga, a real response time the business will actually meet. Not
badges, not stock imagery, not invented numbers.

---

## 6. Suggested order

1. Image presentation fixes — ratios, lightbox, suburb labels, compression *(no new facts needed)*
2. Cost page structure, with the "what changes the price" section *(figures added when Eugene supplies them)*
3. Roof colour picker on the existing 3D house (Option A)
4. Case study pages, once real photos arrive
5. Whitespace and consistency pass across the whole site
6. Revisit the photo-upload visualiser (Option C) only after launch, with real usage data

Everything in steps 1, 3 and 5 can be built today without waiting on the client.
