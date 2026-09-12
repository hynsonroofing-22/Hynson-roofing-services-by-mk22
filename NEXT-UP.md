# Next up — work that needs nothing from the client

The client (Eugene) hasn't come back yet with photos, pricing or credentials.
Everything below can be built now without any of that. Work top to bottom.

---

## 1. Fix the contact form ★ highest priority

**This is the single biggest launch blocker and it is fully unblocked.** Right now a
quote request goes nowhere — Emergent hosted the backend and it didn't survive the
migration. A roofing site that silently swallows enquiries is worse than no site.

Full spec is in `HANDOVER-BRIEF.md` Part 0.1. Short version:

- Netlify Function to receive the form, store to Netlify Blobs, and email the business
- Second function to serve stored enquiries to `/admin`, behind `ADMIN_SECRET`
- Send to **info@hynsonroofingservices.co.nz** — this is confirmed and correct
- Honeypot field for spam
- `netlify.toml` with build command, `publish = "build"`, and an SPA redirect
  (`/* -> /index.html`, 200) so `/admin` survives a refresh

**Test it end to end.** Submit a real enquiry, confirm the email lands, confirm it shows
in the admin page. Do not mark done from reading the code.

---

## 2. Hero quote panel + trust line

From the reference site the client screenshotted and liked. His observation was that it
"looks good with even nothing special" — correct, and the reasons are structural.

What makes their hero work:
- One huge real photograph, edge to edge
- One short headline in very large type
- A thin proof line high on the page
- **The quote form itself is in the hero** — not a button to a contact page
- Two colours and nothing else

**The problem this exposes on our site:** our hero is a five-screen-tall pinned scroll
animation. A visitor has to scroll the entire house build before they can do anything.
The reference puts a form in front of you in zero seconds. The animation is a far better
showpiece than anything they have — but showpieces don't book jobs, easy quote forms do.

Build:

- A **compact quote panel** visible from the first frame of the hero, without covering the
  animation. Corner card on desktop, collapsing to a sticky "Get a quote" bar on mobile.
  Fields: name, address, mobile, email, then tap-to-select chips
  (**Roof replacement · New roof · Leaks & repairs · Emergency**), optional message.
  Same backend as item 1.
- **Phone number sticky in the header** on every page, tap-to-call on mobile.
  `020 4028 1926`.
- A **thin trust line** under the nav — built as a component now, populated later.
  Leave it out of the render until there are real facts to put in it. **Do not fill it with
  placeholders**; that is exactly the failure mode already found four times in this codebase.

---

## 3. "What happens when you call" — four-step timeline

Needs no facts, answers the customer's actual question, and builds trust for free:

1. Get in touch — call or send the form
2. Free on-site assessment
3. Written quote, no obligation
4. Job done and signed off

Wording can be confirmed with Eugene later, but the section can be built now.

---

## 4. Image presentation

Partly unblocked. Do the parts that don't need his photos:

- **One aspect ratio** across every project card, `object-fit: cover`. Mismatched crops are
  the biggest single cause of a site looking untidy
- **Lightbox** on click, with keyboard and swipe support
- **Lazy loading + WebP**, correctly sized. Phone photos are enormous and a slow site reads
  as unprofessional
- **Real alt text** on every image
- Build the card so it can display a **suburb label** ("Re-roof — Onehunga"), with the label
  hidden until the data exists

Wait on: actual photos, suburb names, before/after pairs, case studies.

---

## 5. Roof colour picker on the 3D house

The client wants something like the reference's "generate your new roof" tool. The version
that needs no paid APIs and no client input: let visitors **change the roof colour and
profile on the 3D house that already exists**.

- Swatch row for the colour range, plus long-run vs membrane
- Updates the live 3D model instantly
- Feeds the quote panel: "You picked [colour] long-run — get a quote for it"
- Include a note that on-screen colour is indicative and to check a physical sample
- Only name a manufacturer's range if that is genuinely what Hynson installs — naming a
  range is fine, implying approved-installer status is not

See `FEATURES-BRIEF.md` section 2 for why this beats the address-lookup version.

---

## 6. Whitespace and consistency pass

The "clean and neat" quality is restraint, not additions:

- Generous, consistent section padding — more than feels necessary
- One type scale, three or four sizes total
- One corner radius, one shadow, one border treatment, repeated everywhere
- Everything on a shared grid
- One primary action per section, usually "Get a quote"
- Keep the cream / deep green / clay palette. The client liked the reference's
  *credibility*, not its blue

---

## Rules that still apply

- No number, year, rating, guarantee, certification or price ships unless Eugene has
  confirmed it. Leave the element out rather than filling it in
- Keep adding anything unresolved to `LAUNCH-BLOCKERS.md`
- Explain progress in plain language — the developer is non-technical
- Never leave the site broken at the end of a step
