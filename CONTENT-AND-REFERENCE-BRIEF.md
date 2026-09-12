# Brief: real business facts + the client's reference site

Read this alongside `ANIMATION-BRIEF.md` and `HANDOVER-BRIEF.md`.

Two sources matter here:

1. **`hynsonroofingservices.co.nz`** — the client's real existing website. This is the
   **source of truth** for anything factual. The new site is a better version of this.
2. **`solutionroofing.co.nz`** — a competitor site the client saw, liked, and explicitly
   asked to be used as a reference.

---

## PART 1 — Verified business facts

Taken from the client's own live site. Use these exactly; correct anything in
`src/data/content.js` that disagrees.

| Field | Value |
|---|---|
| Legal name | Hynson Roofing Services Limited |
| Phone | 020 4028 1926 |
| Email | info@hynsonroofingservices.co.nz |
| Address | 13 Hardington Street, Onehunga, Auckland 1061 |
| Service area | Auckland |
| Headline | "Built on Quality. Backed by Experience." |

The headline already matches the new site — keep it.

**Note the email.** The current build has no real enquiry address wired up. When the
contact form is rebuilt (Part 0 of the handover brief), enquiries should land at
`info@hynsonroofingservices.co.nz` unless the client says otherwise.

### Services actually offered (12)

Roof repairs · Re-roofing · Long-run roofing · Membrane roofing systems ·
Roof painting · Gutter services · New roof installation · Emergency roofing ·
Residential roofing · Commercial roofing · Leak repairs · Flashings maintenance

The current `SERVICES` list should be reconciled against this. **Roof painting**,
**emergency roofing** and **flashings maintenance** are real offerings worth surfacing —
emergency work especially, since that's high-intent search traffic.

### The one testimonial that is verified

> "We approached Hynson Roofing, who were highly recommended by a friend, for a complex
> canopy refurbishment project. Eugene and his team were efficient and committed to
> ensuring the job was done to a high standard."
> — **Nolan L.**

This appears to be the **only** real, attributable review on the client's existing site.
It also tells us the person running the business is likely **Eugene** — worth confirming,
and worth using ("Eugene and the team") because named humans build trust in trades.

### What the existing site does NOT claim

Checked and absent — **do not invent any of these**:

- No years-in-business or "established" date
- No accreditations, memberships or licences (no RANZ, no LBP, no Site Safe)
- No guarantee or warranty length
- No star rating or review count
- No detailed project case studies (gallery images only, no descriptions)

---

## PART 2 — 🔴 The risk this creates

The client likes Solution Roofing. **The thing that makes that site work is trust density** —
credentials and proof repeated everywhere:

- "Established 2014"
- "4.9 · 120+ Google reviews"
- MoneyHub #1 ranking
- Badges: RANZ Member, LBP, Site Safe, QBE Insurance, Colorsteel Approved
- Metric cards: project count, review count, years trading, warranty length
- A warranty figure stated as a headline number

**Hynson currently has none of that publicly stated.**

So the obvious move — copying that layout — creates slots for numbers and badges that
nobody has verified. Filling them with plausible-looking placeholders would put **false
representations about qualifications, approvals and guarantees on a live New Zealand
trading website.** Under the Fair Trading Act that exposure sits with **Hynson Roofing
Services Ltd**, not the developer. It is also exactly the failure mode of AI-generated
site content, and this site came out of an AI builder.

**Rule for this project: no trust badge, rating, warranty, year or statistic goes on the
site unless the client has confirmed it is true and can evidence it.** Leave the slot out
entirely rather than filling it with something that "sounds about right".

### Ask the client (Eugene) for these before building the trust sections

1. What year did Hynson Roofing start trading?
2. Roughly how many roofs completed — a defensible number, not a guess
3. Any memberships or accreditations? (RANZ, Site Safe, LBP, Master Builders)
4. Is anyone a Licensed Building Practitioner? Licence number?
5. Public liability insurance — insurer and cover amount?
6. Any manufacturer approvals? (Colorsteel, Dimond, Viking, Nuralite)
7. What warranty is actually offered — workmanship years, and material warranty?
8. Is there a Google Business Profile? Link and current rating/review count?
9. Health & safety certification?
10. For 5–6 real jobs: suburb, roof type, and permission to use the photos

Anything unanswered = that element does not ship. Better a clean site with three true
facts than a busy one with ten unverifiable claims.

---

## PART 3 — What to actually borrow from the reference

Solution Roofing's homepage, in order: hero carousel with an immediate quote form →
trust block (year, rating, badges) → four metric cards → interactive tools (roof
visualiser, instant cost estimator) → five numbered services → industry recognition +
a "cheap approach vs our approach" comparison table → recent work with locations →
four-step process timeline → aggregated reviews → FAQ accordion → closing CTA.

Design: blue (#3096DB) on white, generous whitespace, modern sans-serif, hierarchy by
size not decoration, strong project photography, CTAs repeated consistently, quote form
showing "Avg. response · 3 hrs".

### Borrow these — they need no invented facts

- **A four-step process timeline** (assessment → quote → install → sign-off). Costs
  nothing to verify and answers the customer's real question: what happens if I call?
- **Numbered service cards** — clearer than the current layout, and there are 12 services
  to organise
- **Repeated, consistent calls to action.** Phone number sticky in the header, quote
  button always reachable. Currently under-used
- **"Average response time" on the quote form** — set it to something Eugene will honestly
  hit. Powerful and free
- **Recent work with suburb labels** — "Re-roof, Onehunga" beats "Residential Re-Roof".
  Local specificity sells in trades
- **FAQ accordion** — already exists, keep and expand
- **A closing CTA block** — currently missing
- **Emergency roofing given its own prominent path.** Solution Roofing doesn't do this
  well; it's an opportunity, and it's a real Hynson service

### Do NOT borrow

- **The blue palette.** Hynson's cream / deep green / clay identity is better and already
  distinctive. The client liked Solution Roofing's *structure and credibility*, not its colour
- Badges, ratings, warranty numbers or "established" dates — see Part 2
- The comparison table, unless the claims in it are ones Eugene will personally stand behind
- The roof visualiser — large build, low payoff at this stage

### The differentiator already in hand

Solution Roofing has an instant cost estimator. **Hynson has the scroll-driven 3D house
build, which no competitor in this market has.** That is the memorable thing. The existing
`QuoteCalculator.jsx` covers the estimator ground.

Lead with the animation, back it with honest trust signals, make the quote path obvious.

---

## PART 4 — Order of work

1. Reconcile `src/data/content.js` against Part 1 — fix contact details, services list
2. Produce the list of every unverified claim currently on the site, for Eugene to confirm
3. Send Eugene the ten questions in Part 2
4. Build the sections that need no verification (process timeline, service cards, CTAs,
   suburb-labelled work)
5. Add trust sections **only** as answers come back
6. Fix the contact form (Part 0 of `HANDOVER-BRIEF.md`) — must point at
   `info@hynsonroofingservices.co.nz`
