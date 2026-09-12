# Brief: make the site premium and unique, not generic

The developer compared our site side by side with `solutionroofing.co.nz`
(the client's chosen reference) and named exactly what's wrong. In his words:

> "the competitor website is not of too much writing and wasted things"
> "these pages are neat"
> "mine has some info like why trust us at the start that would be good at the end
>  and doesn't look that persuasive in mine"
> "their whole site feels unique and not ai generic"
> "love how they have just put all projects together but look at latest work and said
>  a page to look at more so they don't waste main page space"
> "site still feels a little dead"
> "use the photos better since right now not much of them being used"
> "i want this site premium and unique like competitors"

Five separate problems. Fix all of them.

---

## 1. TOO MUCH WRITING — cut it hard

The reference uses almost no body copy. A typical section is:

- a tiny eyebrow label — `— RECENT WORK`
- a huge headline with one phrase in the accent colour
- **one sentence** of supporting text, and often none
- an image doing the actual work

Our homepage is text-heavy by comparison, and that's most of why it feels generic.

**Rule: every homepage section gets an eyebrow, a headline, and at most two
sentences.** No paragraphs. If something genuinely needs explaining, it belongs on
its own page, not the homepage.

Cut existing homepage copy by roughly half. Ruthlessly.

---

## 2. PHOTOS ARE BARELY USED — this is the biggest visual win

There are 9 photos in `public/img/` doing almost nothing. The reference is carried
almost entirely by photography.

### Full-bleed image bands
Their "We're proud of our work" section is a **dark navy block** with three aerial
photos running **edge to edge, touching, no gaps, no container padding, no rounded
corners.** It's the strongest thing on their page.

Build the same: a full-width row of 3 project photos, flush to the browser edges.

### Headline text over images
Their service cards put the headline *on* the photo, bottom-left, white, large —
with a small number label top-left (`01 / MOST POPULAR`, `02`) and a circled arrow
button top-right. Do that.

### Everywhere else
- Bigger images, fewer of them
- Consistent aspect ratios
- Hover: slow zoom, caption slide

---

## 3. SECTION ORDER IS WRONG

"Why trust us" currently sits near the top and isn't persuasive there — nobody has
been given a reason to care yet. **Move credibility to the end**, once the work has
already spoken.

Target homepage order:

1. **Hero** — 3D build animation, compact quote panel, sticky phone, skip button
2. **Recent work** — full-bleed band of 3 photos → "Browse all our work →"
3. **Services** — numbered cards, headline over image
4. **Visualise your roof** — the 3D colour picker, split layout, text left / demo right
5. **What a new roof costs** — short teaser → its own page
6. **How it works** — four-step process timeline
7. **Reviews**
8. **Why Hynson** — credentials and trust, *at the end*
9. **FAQ** — accordion
10. **Final CTA** — "Ready when you are", phone + quote button

---

## 4. DON'T WASTE HOMEPAGE SPACE ON EVERY PROJECT

The reference shows **only the latest few** projects on the homepage, then links to
a full `/our-work` page. Do the same:

- Homepage: 3 recent projects, full-bleed, with suburb labels
- `/our-work`: the complete gallery with the All / Residential / Commercial filters
- Best 3–5 jobs get their own case-study pages

Same pattern for services and reviews — show the best few, link to the rest.

---

## 5. IT FEELS DEAD — give it rhythm

The reference alternates: white → off-white → **dark navy** → off-white. That
contrast is what stops a page feeling flat. Ours is uniformly light.

- Introduce **one or two dark sections** using the deep green from our palette —
  ideally the Recent Work band and the final CTA
- Never pure white; use warm off-white for the light sections
- Vary section shapes: full-bleed, then contained, then split two-column
- Scroll-reveal fades, slow image zooms on hover, counters where there are real
  numbers to count

---

## Layout rules to apply everywhere

- **Asymmetric**, never centred. Headline hard left, supporting sentence right
- **Eyebrow labels**: short dash + small caps + wide letter-spacing + accent colour
- **Huge headlines**: tight line-height (~0.95–1.05), slightly negative tracking,
  one phrase in the accent colour
- **Numbered items** — `01`, `02` — on services and process steps
- **Circled arrow buttons** for "go deeper" links
- **Full-bleed** for hero images and the work band; contained for text
- **One accent colour**, used sparingly. Keep cream / deep green / clay — the
  reference's credibility is what's wanted, not its blue
- Cabinet Grotesk large for display, Plus Jakarta for body. Three or four sizes total

Avoid, because these read as AI-generated: centred everything, equal three-column
grids, pure white backgrounds, uniform spacing, gradient buttons, emoji icons,
heavy rounded corners, the same size gap between every element.

---

## ⚠️ The honest constraint

Full-bleed photography **exposes photo quality**. Blown up edge to edge, a weak
image looks far worse than it does in a small card.

There are only 9 photos, and they came from an AI site builder — they may not be
real Hynson jobs at all. Before this layout can truly land, the client needs to
supply **real, high-resolution photos of real jobs, with suburb names**. Aerial
and drone shots especially — that is what the reference is built on, and it's why
their pages look expensive.

Build the layout now so the photos drop straight in. But flag clearly in
`LAUNCH-BLOCKERS.md` that the current images are placeholders and the design is
only as good as what replaces them.
