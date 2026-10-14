# BUILD BRIEF — Hynson Roofing

Read CLAUDE.md first, then LAUNCH-BLOCKERS.md, FEATURES-BRIEF.md,
CONTENT-AND-REFERENCE-BRIEF.md and HANDOVER-BRIEF.md before you touch anything.
They carry decisions and rules from months of work. Do not contradict them.

## SETUP

Windows blocks .bat files on this machine, so ignore START-HERE.bat and
START-HERE-FULL.bat.

1. `node -v`. If Node isn't installed, stop and tell me.
2. `npm install`
3. Confirm `.env` exists in the project root with `LINZ_API_KEY` set. Don't print it.
4. `npx netlify dev` when you need the address lookup, `npm start` otherwise.
   Give me the local address.

## HOW TO WORK

Go through the stages in order. **STOP after each one** so I can push to GitHub
before you continue. At the end of every stage list every file changed, added or
deleted. Deleted files especially, they don't disappear from GitHub on their own.

Think hard before you act. For anything structural, tell me WHY your approach is
better than the obvious alternative. I'd rather you questioned a decision than
implemented it badly.

## THE FOUR RULES THAT OVERRIDE EVERYTHING

1. **SIMPLER IS BETTER.** If something can be cut, cut it.
2. **BIGGER IS BETTER.** Many customers are older homeowners. Small text loses jobs.
3. **NOTHING MAY BE BROKEN OR CONFUSING.** A broken feature is worse than no feature.
4. **IT MUST NOT FEEL DULL.** Simple and calm, never plain and lifeless. There has to
   be a moment that makes someone say "this is a proper company".

## WHO USES THIS SITE

- **A. LEAK.** Water through the ceiling right now. On a phone, one-handed, maybe
  outside in the rain. Wants a human in seconds. Every obstacle loses this job.
- **B. RE-ROOF.** Researching for weeks, comparing quotes. Wants confidence, evidence
  of real work, and a sense of cost before making contact.

Serve both without compromising either. Say how each major decision serves each one.

---

# STAGE 1 — WHAT IS BROKEN

**1. DRAW ON MAP IS BLANK GREY.** Diagnose properly: is the Leaflet CSS loaded
(loading the JS but not the stylesheet gives exactly this), does the container have
real height, do tiles load, does it initialise after the element exists.

It must GENUINELY work, not merely render without errors. A real person traces their
own roof and gets a sensible number. It needs: a map that loads every time,
instructions in plain words, obvious click points, undo a point, start over, a live
area figure as they draw, and finger control on a phone as well as a mouse.

Test it yourself on at least five real Auckland addresses. If it cannot be made
genuinely reliable, say so plainly and remove it.

**2. ROOF SIZE FORM DOES NOT SUBMIT.** Finish it, click send, nothing happens. Fix it
so it submits and moves to a clear confirmation. Test end to end.

**3. NO WAY TO TYPE A SIZE YOU ALREADY KNOW.** Before any address or map, offer
"I already know my roof size" with a plain number input.

**STOP. List what changed.**

---

# STAGE 2 — LIGHT MODE, TYPE, COLOUR

**4. LIGHT MODE IS THE DEFAULT.** First-time visitors open in light. Someone who has
explicitly chosen dark keeps dark. The toggle works both ways.

No flash on load: set the theme on `<html>` from an inline script in
`public/index.html` BEFORE React mounts. Update the theme-color meta tag.

Then check EVERY section in light properly: the 3D scenes (they carry their own
palettes and can't inherit CSS), photo overlays, the estimator, form fields, the chat
bot, the moving strip. Anything that only works in dark gets fixed.

**5. TYPE.** Body text large enough to read without zooming or leaning in. Headings
clearly larger again with real weight contrast. One type scale, four or five sizes
total, used consistently. Headings get `text-wrap: balance`. Running text capped near
65 characters wide. Bigger tap targets everywhere, especially on phones.

Big and legible does NOT mean boring. Use scale, weight and spacing to create drama in
the headlines while keeping body text calm and readable.

**6. COLOUR, PROPERLY.** Build a real palette and justify it to me:

- One accent, used only for actions. The brand orange.
- Neutrals chosen to make that accent sit well rather than fight it. Warm accents
  usually want slightly cool neutrals so the accent is the only warm thing.
- The black/near-black matters. A flat `#000` looks cheap. Pick a near-black with a
  slight hue bias that agrees with the accent, and say why you chose it.
- Semantic colours (success, warning, error) separate from the brand colour.
- Every colour a token with a value for BOTH modes. Nothing hardcoded anywhere.
- Contrast tested and passing in both modes, not assumed.

Show me the palette and your reasoning before applying it everywhere.

**STOP. List what changed.**

---

# STAGE 3 — THE MONEY PATH

**7. THE ENQUIRY FORM MUST ACTUALLY SEND.** `netlify/functions/` has only
`roof-area.js`. Build `enquiry.js` (accepts the POST, stores to Netlify Blobs, emails
info@hynsonroofingservices.co.nz) and `enquiries.js` (serves them to `/admin` behind an
`ADMIN_SECRET` env var). Honeypot and basic rate limiting. If sending fails, still
STORE it and tell the visitor to ring instead. Never lose a lead.

Tell me exactly what to set in Netlify. Ask before anything that costs money.
Test end to end on the live site.

**8. DESIGN THE FORM TO BE COMPLETED, NOT ADMIRED.**

- Ask the least that allows a callback. Name and phone is a lead.
- Progressive: contact details FIRST, job details after, so an abandoned form still
  leaves something usable. This matters more than any styling.
- PHOTO UPLOAD. Customers can photograph the problem, which lets it be triaged without
  a site visit. Compress client-side, allow several, show thumbnails.
- Address field uses the same NZ autocomplete as the roof-size finder.
- One early urgency question: emergency / soon / just planning. Emergency shows the
  phone number immediately, because a form is the wrong tool for them.
- Preferred contact method and best time to call.
- `type="tel"`, autocomplete attributes, 16px minimum on inputs so iOS doesn't zoom,
  inline validation that helps rather than scolds.
- Confirmation says what was received and what happens next. No response-time promise
  until confirmed; add it to LAUNCH-BLOCKERS.md.

**9. COST ESTIMATE OPENS IN PLACE.** Any button whose job is a cost estimate opens the
calculator in a modal, never navigates to `/roof-cost`. Someone wanting a number in ten
seconds shouldn't lose their place. `QuoteCalculator.jsx` line ~217 links to
`/roof-cost`; review it. The nav item "Roof Cost" STAYS a page link, different intent.

**10. CONTACT PAGE: FORM AT THE TOP.** It's buried below a lot of content. Reorder:
short heading, THE FORM, phone and email, then everything else. Desktop can run form
left, contact details right.

**11. CONSISTENT LABELS.** One wording for the estimator action, one for the contact
action, used everywhere, visibly different from each other.

**12. ALWAYS ABLE TO REACH A HUMAN.** Phone sticky in the header on every page,
tap-to-call on mobile. On mobile a persistent bottom bar: Call, and Get a quote. Every
service page ends with a quote path pre-filled with what they were reading.

During the hero animation, a visible way to call and a visible way to get a quote from
the very first frame. Nobody should scroll through a building assembling itself to find
a phone number.

**STOP. List what changed.**

---

# STAGE 4 — THE ROOF AREA, HONESTLY

**13. THREE WAYS IN, in this order:**

a. Address lookup for speed, clearly an estimate
b. Draw it on the map to confirm or correct. The number becomes THEIRS, so they trust
   it and we aren't the ones who got it wrong
c. Describe your house: bedrooms, single or two storey, roughly when built

Always show which method produced the current number. Switching must be easy and must
never lose what they entered.

**14. HELP THEM JUDGE WHICH BUILDING IS THEIRS.** Real example: 101 Trafalgar Street,
Onehunga returned 748 m² (footprint 680) and 14 m². 680 m² is not a house; a
three-bedroom single storey Auckland home is roughly 120-160 m².

- Show each building outline on a small map with the address point marked
- Plain-language size context beside each figure
- Flag implausible results; over roughly 400 m² is not a standard house
- Keep "your address is on this one" and "17m from your address", they're good
- Always offer "none of these are mine" leading to manual entry
- Never auto-select an implausible result
- Show at most 3, rest behind an expander, so Next never gets pushed off screen

**15. STOP IMPLYING CERTAINTY.** The disclaimer sits WITH the number in readable text,
not small grey print. Say plainly it's an estimate from government building-outline data
that can be out of date and cannot see roof shape, pitch or complexity. Never use the
word "accurate".

**16. LINZ ATTRIBUTION IS A LICENCE REQUIREMENT** and we have none. We adapt the data,
so use this wording exactly:

> Contains data sourced from the LINZ Data Service licensed for reuse under CC BY 4.0

with "LINZ Data Service" and "CC BY 4.0" linked to https://data.linz.govt.nz and
https://creativecommons.org/licenses/by/4.0/. Show it where the data appears and in the
footer. Add OpenStreetMap attribution too if map tiles are used.

**17. UPDATE THE LEGAL PAGES.** Privacy policy must cover typed addresses (used once,
not stored unless they submit, never in a URL, LINZ receives a lookup) and photo
uploads. Add a clear estimator disclaimer. Fix leftover placeholders such as
"[Email address of the accessibility coordinator]" in AccessibilityStatement.jsx. Link
legal pages from the footer on every page. Anything needing the owner's sign-off goes
in LAUNCH-BLOCKERS.md rather than being invented.

**STOP. List what changed.**

---

# STAGE 5 — NOTHING THAT LOOKS UNFINISHED

**18.** A real example that was live on `/roof-cost`:

> "DEMO RATES, NOT HYNSON'S PRICES — The roof area it finds from your address is real.
> The money attached to it is a placeholder Eugene hasn't reviewed."

That is a note to ME on a public website. Sweep the ENTIRE site — pages, components,
alt text, meta descriptions, page titles, form labels, error messages, empty states,
confirmations, admin page — and remove anything that:

- says demo, placeholder, mockup, preview, sample, TODO, coming soon, in progress
- refers to the client as someone who hasn't reviewed things
- explains our build process or data sources as though to a developer
- reads like an internal note or an apology for being unfinished
- is lorem ipsum or generated filler

KEEP the human touches. Naming the owner in customer-facing copy builds trust in
trades. The problem is notes addressed to me.

**19. REMOVE THE INVENTED PRICES**, not just the warning about them. Show the roof area
and what actually drives cost: access, pitch, two storey, condition of the existing
roof, scaffolding, spouting, asbestos. All true, all useful, needs nothing from the
owner. No dollar figures until real numbers arrive. Build the display so figures drop
in later; note what to ask for in LAUNCH-BLOCKERS.md.

This is a competitive win: solutionroofing.co.nz's "instant estimator" is a contact form
in a costume. Ours genuinely measures a roof. Lead with that.

**20. REMOVE** the "content and design in progress" banner at the top of the site.

**STOP. List what changed.**

---

# STAGE 6 — THE MAIN PAGE

**21. ANIMATION SLIGHTLY QUICKER.** Shorten the scroll distance by roughly 20-25
percent. Keep every stage and keep it smooth, just less work to get past.

**22. SKIP CONTROL:** noticeably bigger, clear of the navbar, wording "Click anywhere
to skip", and clicking anywhere on the animation actually skips it. Someone who skips is
often the most motivated buyer on the site.

**23.** The scroll percentage indicator is hidden behind the chat bot. Move it.

**24. WHY CHOOSE US:** delete the paragraphs. Icon and a short label only, e.g.
"Quality craftsmanship". Nothing else.

**25.** Cut writing across the main page that isn't earning its place. Scannable in
fifteen seconds. Detail lives on the other pages, reachable from the nav.

**26. THE MOVING TOOLS/AUCKLAND STRIP:** vertical page scrolling must never be captured
by it. Only move horizontally when the pointer is over the images. On touch, never
hijack a vertical swipe.

**27. WRITING STYLE.** Stop using the dash "—" so much; full stops instead. Short
sentences. Barely use the owner's first name, and only where his current site already
does. Plain words a homeowner uses, no jargon, no marketing padding.

**28. BUTTONS.** Brighter and more confident, matching the call button styling on the
roofers Q and A page. That one reads right; bring the rest up to it.

**29.** Next to the light/dark toggle, add a search icon that expands into a search box.

**30.** Rename the chat bot. "Ask us" is weak. Something like "Roofing Q and A". Tell me
what you picked and why.

**31. ADD LIFE WITHOUT ADDING NOISE.** The site must not feel dull. Add a small number
of genuinely good interactive moments, each earning its place:

- sections assembling on scroll, calm and quick, never blocking reading
- the reviews writing in line by line as you scroll, fast not slow
- the estimate number counting up when it lands, so it feels like a result
- considered hover and focus states on everything interactive
- circles on the moving strip that grow and shrink as they travel

Rules for all of it: fast (200-300ms), never bouncy, respects
`prefers-reduced-motion`, never delays anything being readable, never hides information
behind an interaction, and runs at 60fps. If an effect doesn't make the site better,
don't build it.

**STOP. List what changed.**

---

# STAGE 7 — RESEARCH, REVIEWS, AND THE LOOK

**32. FULL COMPETITOR AND SOURCE AUDIT.** Go and actually read:

- hynsonroofingservices.co.nz (the client's current site)
- solutionroofing.co.nz (the competitor he chose as reference)
- the best roofing company sites you can find, NZ and overseas

Produce a written comparison covering:

a. Anything on the client's CURRENT site that is missing from ours. Every service,
   every fact, every photo, every page. Nothing may be lost in the move.
b. Anything the competitor does BETTER than us. Be honest. If their layout, copy,
   trust signals or tools beat ours somewhere, say so and fix it.
c. Anything either of them has that we don't, ranked by what would actually win jobs.
   Build everything that needs no invented facts. Everything else goes to
   LAUNCH-BLOCKERS.md as a question for the owner.

Candidates worth checking: before and after sliders, case studies with real suburbs, a
"what happens when you call" timeline, emergency work given its own obvious path,
warranty and insurance info, finance options, service-area map, seasonal advice content,
per-service photo galleries, FAQ depth.

I want the comparison written out, not just the fixes.

**33. REVIEWS.** hynsonroofingservices.co.nz now has more reviews than when we last
checked, and there may be a Google Business Profile with more. Read what's publicly
there, bring across every real review word for word with the name as shown, and rebuild
the reviews section so it's genuinely good to read and easy to move through.

Real reviews only. Never invent one. Never add a star rating or review count that isn't
actually published. If a Google profile exists, link to it rather than retyping a rating
we can't verify.

**34. SPECIALISTS NOT GENERALISTS PAGE.** "Enquire" opens the quote form with an example
message pre-filled, matching the service they clicked. Also simplify that page. Too much
is happening on it.

**35. QUIET LUXURY WITH A WOW FACTOR.** Study these, work out WHY they feel premium, and
write the principles down before applying anything:

- https://horizonx.so/
- https://www.getlayers.ai/
- https://threeui.com/browseuse

Look at: generous, consistent empty space; very few colours with the accent saved for
what matters; hierarchy from type alone rather than boxes and borders; motion that is
slow, small and rare; each section saying one thing and stopping; images given room.

Apply the PRINCIPLES, never their layouts, colours, fonts or wording. They are tech
products; this is an Auckland roofing business. Calm and established, not startup.

What must NOT carry over: small, thin or pale grey text — item 5 WINS over anything
these references do; hidden navigation or mystery icons; dark moody styling that makes
real roof photos hard to see.

The test: a 65 year old finds it easier than before, AND a design-savvy business owner
finds it more impressive. If a change helps one and hurts the other, the older homeowner
wins.

**36. NAVIGATION.** Every page reachable in two clicks from anywhere. Clear header nav
with a Services dropdown. Breadcrumbs on inner pages. Related links at the foot of each
service page. Footer as a proper sitemap. A mobile menu comfortable one-handed. Nothing
hidden behind an icon nobody recognises.

Then QUESTION the structure rather than just implementing it. Is the current arrangement
of pages and sections actually the easiest for a homeowner, or is there a better one? If
there is, tell me what and why before you change it.

---

# FINALLY — THE FULL SWEEP

**37. NOTHING BROKEN, NOTHING CONFUSING.** Every page, button, form, link and state.

- Every button does what its label says
- Every form submits and confirms
- Every link resolves, no dead ends
- Every error message explains what went wrong and what to do
- Nothing loads slowly, jumps about, or flickers
- No horizontal scrolling anywhere, at any width
- Nothing depends on hovering, because phones can't hover
- Works at 375px and on desktop, in both colour modes

Assume the person is 70, not confident with computers, and will give up and ring a
competitor the moment something confuses them. That is the standard.

**38. SPEED.** Page usable in under two seconds. No layout shift. 60fps scrolling.
Images WebP, correctly sized, lazy loaded, with explicit width and height and real alt
text. Code-split the 3D scene so it never blocks first paint. Test on a throttled
connection and give me the before and after numbers.

**39. REVIEW IT TWICE, PROPERLY, AND WRITE BOTH OUT.**

FIRST as a customer: a 65 year old Auckland homeowner with water coming through the
ceiling, on a phone, one-handed. How fast can they reach a person? How fast can they get
a number? Does anything make them hesitate? Is anything hard to read? Would they give up?

THEN as the business owner: someone deciding whether this website is worth paying real
money for. Does it look established and trustworthy? Better than the competition? Does
anything look unfinished, generated or careless? Is there a moment that makes them want it?

Then tell me every single thing that still falls short, including things I never asked
about. I want your judgement, not a checklist. Don't tell me it's done until you'd be
happy putting your own name on it.

---

# STANDING RULES

- No invented facts, prices, reviews, ratings, guarantees or credentials. If the owner
  hasn't confirmed it, leave the element out and add it to LAUNCH-BLOCKERS.md.
- No paid APIs or services without asking me first.
- Every photo on the site is a real job.
- Keep all existing content and features unless I've said to remove them.
- Explain in plain language, I'm not a developer.
- Never leave the site broken at the end of a stage.
