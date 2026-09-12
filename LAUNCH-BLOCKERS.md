# Launch blockers

## ⚠️ REMOVE noindex BEFORE LAUNCH
`public/index.html` has `<meta name="robots" content="noindex, nofollow">`
and `public/robots.txt` disallows all crawling. Both were added so this
preview build can't get indexed under the client's real business name
before it's actually live. **Both must be removed (or set to allow) as
one of the very last steps before the real launch**, or the finished site
will be invisible to Google.

Everything on this list must be resolved before this site goes live for
Hynson Roofing Services Ltd. Source: `CONTENT-AND-REFERENCE-BRIEF.md`
(Part 1 verified facts, Part 2 trust-claim risk). Add to this list as new
issues are found — do not remove an item until it is actually fixed, and
note the resolution when you do.

---

## 🔴 Blocking — must be resolved before go-live

### 1. Instant Estimate pricing is entirely invented
`src/components/QuoteCalculator.jsx` — the service-type multipliers,
per-m² material rates ($145 / $125 / $168), roof-pitch multipliers, and
add-on prices ($2,600 gutters, $3,200 painting, $1,250 skylight) are all
placeholder numbers with no basis in Hynson's real pricing. They are
grouped in one clearly commented block at the top of the file so they're
easy to find and swap out. Customers will act on these numbers, so this
ships wrong before it ships at all. **Needs:** Eugene to review and
confirm real rates for all four groups, or explicit sign-off to launch
with these as illustrative-only (with clearer on-page wording than the
current "Ballpark only" line if so).

### 2. Contact form does not reach a real inbox
**Updated 2026-09-09 — it was worse than this entry said, and is now honest
but still not working.**

The form was posting to the relative path `undefined/api/enquiries`, because
`API_URL` is built from an empty `REACT_APP_BACKEND_URL`. On Netlify, the
catch-all SPA rewrite in `netlify.toml` (`/* → /index.html`, status 200)
answers *any* unmatched path, POST included, with the index page and a **200
OK**. The old code checked only `res.ok`, so it took that as success and
displayed **"Enquiry received — our team will get back to you as soon as
possible."**

A homeowner with a leak read that, believed it, and waited. Nothing had been
sent. That is the same class of failure as the invented guarantee: the site
stating something untrue with total confidence.

*Fixed so far:* `Contact.jsx` now checks whether a backend is configured at
all, and checks the response content-type as well as the status (HTML back from
a POST is the signature of a rewrite swallowing a missing endpoint). When there
is nowhere to send, it says so in one sentence, keeps everything the visitor
typed on screen, and offers the phone number and email address — the two
channels that do work.

*Still needed:* somewhere for enquiries to actually go.
`src/components/Contact.jsx` and `src/pages/Admin.jsx` both call
`${REACT_APP_BACKEND_URL}/api/...` — that backend was hosted by Emergent and
did not survive migration, so a quote request currently goes nowhere and the
admin page has nothing to show. Per `HANDOVER-BRIEF.md` Part 0.1 and
`CONTENT-AND-REFERENCE-BRIEF.md` Part 4 step 6, enquiries must land at
`info@hynsonroofingservices.co.nz` once fixed (suggested approach: Netlify
Functions, per `HANDOVER-BRIEF.md`). **Needs:** rebuild the submission path,
then test end-to-end — submit a real enquiry, confirm the email arrives,
confirm it shows in `/admin`. Do not mark this done off the code alone.

### 3. Project gallery — real photos now in, permission still not explicit
`src/data/content.js` → `PROJECTS` now uses the 6 real project photos and
verbatim descriptions pulled directly from the client's own live site
(hynsonroofingservices.co.nz/portfolio-collections/...), replacing the old
generic 480×360 placeholder set entirely. These are his own published
photos of his own jobs, at proper resolution (~1024×1024, full-res JPGs
kept alongside the WebP versions actually used in `public/img/`), so the
provenance is solid. **Still needs:** Eugene to confirm it's fine to
re-host these same photos on the new site (should be a formality since
he already publishes them himself), and — per question 10 below — real
suburb-level locations if he wants those shown instead of the generic
"Auckland" currently used for all six.

### 3a. The six portfolio photos do not look like real Hynson jobs
**Found 2026-09-09.** The six images behind `PROJECTS` in `src/data/content.js`
— the ones on the "Work we're proud of" row — were taken from the client's own
Wix portfolio pages, so their provenance *on his site* is solid. But looked at
closely they have every hallmark of stock or AI-generated imagery rather than
photographs of Hynson's work:

- **Asphalt shingle roofs** in four of the six. New Zealand roofs are
  overwhelmingly long-run steel, tile or membrane; shingle is a North American
  staple and is not in Hynson's own services list.
- **No New Zealand in any of them.** No NZ vegetation, vehicles, signage,
  power poles, or scaffolding. The commercial one shows a generic American
  low-rise business park.
- **Impossibly clean and evenly lit**, with shallow depth of field and no
  people, tools, offcuts, fixings or site mess anywhere.
- All six are exactly 1024×1024, which is a generated-image output size, not a
  camera aspect ratio.

Compare them with the eight `GALLERY` photos, which are unmistakably real: NZ
sky, scaffold, shrinkwrap, hi-vis, actual long-run iron being laid.

This matters because the standing rule on this project is that **every photo is
a real Hynson job**, and a customer who recognises a stock roof stops believing
the rest of the page. It is also a claim about work that may not have been done.

**Needs a decision from Eugene, one of:**
- [ ] Confirm these are genuinely photographs of his jobs (in which case
      nothing changes and this item closes)
- [ ] Send real photos of the six job types to replace them
- [ ] Agree to drop the portfolio row and run the page on the eight real
      `GALLERY` photos alone, which is the honest option available today and
      needs no new material from him

Until that is answered, nothing on the page claims these are Hynson's own work
beyond the section heading — but the section heading is the problem, so this
cannot simply be left.

### 3b. "Our recent work" gallery — suburbs unconfirmed, photos are low-res
`src/data/content.js` → `GALLERY` drives the new pinned horizontal gallery
(`src/components/WorkGallery.jsx`) using eight of the client's real
on-the-job photos (long-run iron, flashings, capping, a flue penetration).
Two things are outstanding:

- **Suburbs.** Every entry has `suburb: null`, so each card shows only the
  verified region, "Auckland". The section carries a visible, dashed
  "PLACEHOLDER · SUBURB LABELS AWAITING CLIENT CONFIRMATION" marker on screen
  so nobody mistakes it for finished copy. **Needs:** Eugene to supply the
  real suburb for each of the eight photos, after which the marker comes off.
- **Resolution.** All eight source files are only 480×360 — the largest
  versions currently in the repo. They are displayed up to roughly 640px wide,
  so they are being upscaled and will look soft on a high-DPI screen. **Needs:**
  the original camera files from Eugene's phone. This is the single cheapest
  quality win available on the whole page.

The `job` text on each card describes only what is visibly happening in the
photograph — no date, cost, size or client is claimed.

### 3c. Only ONE real review exists — we need Eugene's Google Business Profile
`src/components/Testimonials.jsx` is built around a single verified review
(Nolan L., canopy refurbishment), because that is the only one on Eugene's
current site. The section is *designed* for one — the carousel dots and
prev/next arrows only render when `TESTIMONIALS` actually holds more than one
review, so it doesn't advertise the emptiness — and the component scales up on
its own the moment more are added.

Nolan's wording was re-checked against hynsonroofingservices.co.nz on
2026-09-09 and is transferred word for word, with nothing sharpened,
shortened or paraphrased. The live site shows **no star rating** on it either,
so the site showing none is a match, not an omission.

No amount of design fixes this. **Needs from Eugene — still outstanding:**
- [ ] The link to his **Google Business Profile** (the single highest-value
      item on this whole list: it is what lets the site show a real, verifiable
      rating and review count, and it is what customers check before ringing)
- [ ] Permission to quote his real Google reviews (name, date, wording)
- [ ] Any written testimonials he holds outside Google — emails, texts,
      Facebook comments. A screenshot is enough to verify one.

Until then: no star ratings, no review counts, no invented names. Adding
`{ name, suburb, job, text }` entries to `TESTIMONIALS` in `content.js` is all
that's required once the real ones arrive — the section switches itself over to
a real carousel (dots, arrows, keyboard support) as soon as there is more than
one, and needs no other change.

### 3d. Gaps the new pages had to be built around
**Added 2026-09-10**, when the site was expanded from one long homepage into
real pages (`/services`, six service pages, `/our-work`, `/about`,
`/roof-cost`, `/contact`). Each of these is a place where a page would normally
carry a fact, the fact has not been confirmed, and the element was therefore
left out and **marked visibly on screen** rather than filled in:

- **Opening hours.** Shown as "not published yet" on `/contact` and in the
  footer. Every business page carries hours; guessing at them sends somebody to
  voicemail expecting an answer. **Needs:** Eugene's actual hours, including
  whether he takes calls at weekends.
- **A photograph of a roof-painting job.** `/services/roof-painting` is the one
  service page with no photo of that specific work. It currently opens on a
  real Hynson roof captioned for what it actually shows, rather than a stock
  image of someone with a spray gun. **Needs:** one or two photos of a painting
  or recoating job.
- **A confirmed suburb list.** `/contact` lists the five broad areas the
  enquiry form already offers and says plainly that a suburb-by-suburb list
  hasn't been supplied. Suburb pages are the biggest remaining SEO opportunity
  (see COMPETITOR-GAP-ANALYSIS.md #8) and they cannot be written without it.
  **Needs:** which Auckland suburbs Hynson actually covers.
- **A credentials block on `/about`.** Deliberately empty, with a visible note
  saying why. It is blocked on every item in #4 below.

None of these stops the pages working. All four are visible to the client as
on-screen placeholders, so nothing reads as finished when it isn't.

### 4. Trust/credibility facts — answers not yet received
None of the ten questions in `CONTENT-AND-REFERENCE-BRIEF.md` Part 2 have
been answered by Eugene yet. No trust section (badges, warranty figure,
years trading, membership logos, review count, H&S certification) may be
added until each individual fact below is confirmed:

- [ ] Year Hynson Roofing started trading
- [ ] Defensible count of roofs/jobs completed
- [ ] Memberships/accreditations (RANZ, Site Safe, LBP, Master Builders)
- [ ] Licensed Building Practitioner status + licence number
- [ ] Public liability insurer + cover amount
- [ ] Manufacturer approvals (Colorsteel, Dimond, Viking, Nuralite)
- [ ] Actual warranty offered (workmanship years, material warranty)
- [ ] Google Business Profile link + current rating/review count
- [ ] Health & safety certification
- [ ] 5–6 real jobs with suburb, roof type, photo permission (also #3 above)

**Rule to keep enforcing:** no badge, rating, warranty figure, "established"
year, or statistic goes on the site until the corresponding box above is
checked with client-confirmed evidence. Leave the slot empty rather than
fill it with something plausible.

### 5. Live Wix booking system found — not yet reflected on the new site
The client's live site has a working booking page at `/book-online`, built
on Wix Bookings, with three bookable services and calendar links:

| Service | Duration | Price shown |
|---|---|---|
| Roof Inspection | 1 hr | $150 NZD |
| Roof Installation | 1 hr 30 min | $5,000 NZD |
| Roof Repair | 1 hr | $300 NZD |

This is a real, functioning tool — not something to silently drop. It is
**not currently linked or replicated anywhere on the new site.** The $5,000
"Roof Installation" figure in particular reads like a flat booking/deposit
slot rather than a real full job price, so it should not be read across
into the Instant Estimate calculator (blocker #1 above) without asking Eugene.
**Needs:** a decision from Eugene — keep using the Wix booking calendar
(link out to it from the new site) or replace it with a booking flow on
the new site (bigger job). Either way, this can't just disappear.

### 6. Blog has 2 real posts — not zero
Contradicts what was assumed going into this pass: the client's blog is
not empty. Two live posts exist, both by "Hynson Roofing Services
Limited," dated May 5, generic in tone (roof-maintenance tips, choosing
roofing services for renovations), 2 views / 0 comments each:
- "Essential Tips for Maintaining Your Roof's Longevity" — `/post/essential-tips-for-maintaining-your-roof-s-longevity`
- "Top Roofing Services for Your Home Renovation Needs" — `/post/top-roofing-services-for-your-home-renovation-needs`

Full bodies not yet pulled into this repo. **Needs:** a decision from
Eugene on whether these are worth migrating (they read as generic
filler, not distinctive content) before spending time importing them.

### 7. Wix media account ID — correction
Reference material assumed all client media lived under Wix account
`678784`. In practice the **portfolio photos and logo** are under `678784`,
but the **homepage icons, hero background, and social icons** are under a
second account, `569c84`. Both are real, both belong to the same site —
noted here only so a future image-harvest pass doesn't assume one ID and
silently skip half the assets.

### 8. Privacy Policy & Accessibility Statement are copied placeholder text
`src/pages/PrivacyPolicy.jsx` and `src/pages/AccessibilityStatement.jsx` are
a **word-for-word copy of the client's live Wix pages**, at the client's
explicit request (2026-08-17), as a temporary stand-in. Both are Wix's
generic unfilled template text, not a policy written for Hynson:
- The Accessibility Statement contains literal unfilled placeholders —
  `[enter relevant date]`, `[enter relevant third-party name]`,
  `[Name of the accessibility coordinator]`, etc. — and an unverified claim
  of WCAG 2.1 AA compliance that has never actually been assessed.
- The Privacy Policy is Wix's own "how to write a privacy policy" template
  copy, not a policy describing what Hynson actually does with visitor data.

**Needs:** real, Hynson-specific policies (ideally with legal input) before
launch — client said "we can do policy later," so this is intentionally
parked, not forgotten. Linked from the footer on every page in the meantime.

---

## ✅ Resolved

- **Hero ending photo tried, then reverted on feedback.** A real rooftop
  photo was wired into `FINAL_PHOTO_SRC` briefly; client feedback was that
  a single photo at the end read as confusing, not a payoff. Reverted to
  empty. The build's payoff is now `RecentWorkBand` — three real project
  photos, edge to edge, immediately after the 3D section — instead.
- **Invented "15-year workmanship guarantee"** in `Services.jsx` — removed,
  replaced with a claim-free line. (No warranty length has been confirmed —
  see blocker #4.)
- **Invented 5-star rating on Nolan L.'s testimonial** in `content.js` /
  `Testimonials.jsx` — the `rating` field and star display removed. His
  review text is untouched and still real.
- **False service-area claim** ("Auckland · Wellington · Nationwide") in
  the full-screen menu footer in `Navbar.jsx` — corrected to "Auckland Wide,"
  matching the verified service area (Auckland only).

---

### EXPORT THE WIX ENQUIRY HISTORY BEFORE CANCELLING

The client's current Wix site stores every form submission it has ever
received (Wix dashboard → Contacts / Inbox / Form Submissions), and emails
him a notification for each one.

**Cancelling the Wix subscription deletes that stored history.**

Before the subscription is cancelled:
1. Ask Eugene whether he works from the email notifications or the Wix
   dashboard — some owners never open the dashboard, others rely on it
2. Export his Contacts and Form Submissions from Wix to CSV
3. Hand him the export as part of the handover pack

Per LAUNCH-AND-HANDOVER.md Stage 5, Wix is only cancelled *after* the new
site is live and confirmed working. Do the export at the same time.

**Where submissions go on the NEW site:** Netlify Forms — stored in the
Netlify dashboard (owned by the business, so it survives handover) and
emailed to info@hynsonroofingservices.co.nz. Nothing depends on the
developer's own accounts.
