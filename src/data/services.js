/* ==========================================================================
 * THE 12 SERVICES, AND THE SIX THAT GET A FULL PAGE.
 *
 * WHERE THE WORDS COME FROM — this matters, so it is recorded per service.
 *
 *   source: "client"  — the description is the client's own copy, word for
 *                       word from hynsonroofingservices.co.nz. Do not reword
 *                       these. They are his voice and they are verified.
 *   source: "written" — Hynson has not published a description for this one.
 *                       The copy here explains THE WORK ITSELF in plain
 *                       English — what long-run roofing is, what a flashing
 *                       does — and makes no claim about Hynson beyond the
 *                       verified ones: Auckland, residential and commercial,
 *                       free quotes and site inspections.
 *
 * WHAT IS NOT IN HERE, AND MUST NEVER BE ADDED WITHOUT EUGENE CONFIRMING IT:
 * prices, per-m² rates, timeframes, lead times, warranty or guarantee lengths,
 * licences, insurance, memberships, years trading, job counts, star ratings.
 * Every one of those is on the list in LAUNCH-BLOCKERS.md. Leave the element
 * out rather than fill it with something plausible — see CLAUDE.md.
 * ========================================================================== */

/**
 * The process, shared by every service page.
 *
 * Every step is traceable to the client's own words: "we provide free
 * quotations and site assessments", "provide clear recommendations along with
 * a detailed quotation for the proposed work", "completing every job to a high
 * standard from start to finish". Deliberately carries NO timings — how long
 * any of it takes has never been confirmed.
 */
export const PROCESS = [
  {
    step: "01",
    title: "Get in touch",
    body: "Ring, or send an enquiry with the address and a bit about the roof.",
  },
  {
    step: "02",
    title: "Free site inspection",
    body: "Hynson looks at the roof properly. Free, and no obligation.",
  },
  {
    step: "03",
    title: "A written quote",
    body: "A clear recommendation — repair or replace — and a detailed quote for it.",
  },
  {
    step: "04",
    title: "The work",
    body: "Done start to finish, with Eugene as your single point of contact.",
  },
];

/** Real Hynson photographs, with captions describing only what is visible. */
const PHOTO = {
  longRun: {
    src: "/img/proj-7144ddd464364bb0bdc922953adcba3d.webp",
    alt: "Long-run steel roofing being laid on an Auckland job, with the valley and ridge visible",
    caption: "Long-run iron, valley and ridge",
  },
  vents: {
    src: "/img/proj-88b691af2941477d98f4ebf6b6becbe8.webp",
    alt: "Roof vents set into a new long-run steel roof",
    caption: "Roof vents set into new long-run",
  },
  flue: {
    src: "/img/proj-dd45718e0c904c18a490dbc15b729ba1.webp",
    alt: "A flue penetration flashed and sealed where it passes through the roof",
    caption: "Flue penetration flashed and sealed",
  },
  sheets: {
    src: "/img/proj-8bdbe118b64d4bd39b8d17d036ad6070.webp",
    alt: "Roofing sheets laid out and fixed off across a roof plane",
    caption: "Sheets laid out and fixed off",
  },
  hatch: {
    src: "/img/proj-0b2e36224da04162a8bb6ff17f4b9ff7.webp",
    alt: "A custom flashing fabricated and fitted over a roof hatch",
    caption: "Custom flashing over a roof hatch",
  },
  barge: {
    src: "/img/proj-b5516c29f9da4b9fa3279d6dfd5d1634.webp",
    alt: "Barge capping running along the edge of a roof",
    caption: "Barge capping along the roof edge",
  },
  ridge: {
    src: "/img/proj-788371d15a4d4ab5b7bb5d055761c519.webp",
    alt: "Ridge capping run out straight along the top of a roof",
    caption: "Ridge capping run out straight",
  },
  commercial: {
    src: "/img/proj-f8c1f1da08ca49afb0953d6fb1236537.webp",
    alt: "A finished commercial long-run steel roof on an Auckland building",
    caption: "Commercial long-run roof, finished",
  },
  coating: {
    src: "/img/about.webp",
    alt: "A Hynson Roofing crew applying a protective coating along a commercial walkway in Auckland",
    caption: "Protective coating going down on a commercial job",
  },
  reroof: {
    src: "/img/hero-bg-original.webp",
    alt: "A re-roof in progress on an Auckland home with scaffolding still standing",
    caption: "A re-roof in progress, scaffold still up",
  },
};

export const SERVICE_PAGES = [
  /* ---------------------------------------------------------------- 1 */
  {
    slug: "roof-repairs",
    name: "Roof Repairs",
    tag: "Extend roof life",
    hero: PHOTO.flue,
    source: "client",
    blurb:
      "We specialise in identifying and resolving roofing issues before they become major problems. From leak repairs and damaged flashings to general roof maintenance, we help extend the lifespan and reliability of your roof.",
    lead:
      "Most roofs don't fail all at once. They fail at one lap, one flashing, one fixing — and then quietly keep failing until the ceiling shows it.",
    whatItIs: [
      "A roof repair is targeted work on the part of the roof that has actually gone wrong, rather than replacing everything around it. On a steel roof that usually means a flashing that has lifted, a fixing that has backed out, a lap that no longer sheds water, or corrosion starting somewhere the water sits.",
      "The hard part is rarely the repair. It is finding the real source. Water travels: it can enter at a ridge and appear in a ceiling several metres away, which is why a stain on the plasterboard almost never marks the hole.",
    ],
    whenYouNeed: [
      "A stain spreading on a ceiling or down an internal wall",
      "Drips during driving rain, but not in ordinary rain — a wind-driven entry point",
      "Rust showing at fixings, laps or cut edges",
      "Flashings that have lifted, split or pulled away from the wall",
      "Cracked or missing roofing material after a storm",
      "A leak that was patched before and has come back",
    ],
    whatWeDo: [
      "Find where the water is actually getting in, not where it is showing up",
      "Leak repairs, and repairs to damaged or lifted flashings",
      "Re-flashing around penetrations — flues, vents, hatches and chimneys",
      "General maintenance to keep a sound roof sound",
      "An honest call on whether a repair is worth doing, or whether the money is better spent on a re-roof",
    ],
    faqs: [
      {
        q: "Can a leak be fixed, or does the whole roof have to come off?",
        a: "It depends entirely on what's underneath. A single failed flashing on an otherwise sound roof is a repair. Widespread corrosion, or a roof where one patch has followed another, usually isn't worth chasing. That's the judgement the free site inspection exists to make — and you'll get it straight.",
      },
      {
        q: "The stain is in the middle of the room. Is the hole above it?",
        a: "Usually not. Water runs along purlins, rafters and the underside of sheets before it drops, so the entry point is often well away from where it shows. Finding it is most of the work in a leak repair.",
      },
    ],
    related: ["emergency-roofing", "re-roofing", "long-run-roofing"],
    photos: [PHOTO.flue, PHOTO.hatch, PHOTO.barge],
  },

  /* ---------------------------------------------------------------- 2 */
  {
    slug: "re-roofing",
    name: "Re-Roofing",
    tag: "Replace the lot",
    hero: PHOTO.reroof,
    source: "written",
    blurb:
      "Taking the old roof off and putting a new system on — the option when a roof has stopped being worth repairing. Residential and commercial, across Auckland.",
    lead:
      "There comes a point where every repair is money spent on a roof that is going to need replacing anyway. Re-roofing is the other side of that line.",
    whatItIs: [
      "Re-roofing means removing the existing roof covering entirely and installing a new system in its place — usually long-run steel or a membrane, depending on the shape and pitch of the roof.",
      "It is not only the visible surface. Taking the old roof off is the only time anyone gets to see the structure underneath: the purlins, the battens, the rafter ends, and whatever water has been doing to them. Rot and rusted purlins found at that point get dealt with then, while they are reachable.",
      "Because of that, a re-roof is quoted after a proper look rather than off a floor area. Two identical-looking houses can be very different jobs once the covering is off.",
    ],
    whenYouNeed: [
      "Repairs are becoming regular rather than occasional",
      "Corrosion across the roof rather than in one spot",
      "The roof is at the end of its service life and you'd rather choose the timing than have a storm choose it",
      "You're renovating and the roof is the sensible thing to do while there is scaffold up",
      "A pre-sale or pre-purchase inspection has flagged the roof",
    ],
    whatWeDo: [
      "Strip the existing roof covering",
      "Check what's underneath and deal with anything found",
      "Install the new system — long-run steel or membrane",
      "New underlay, flashings, ridge and barge capping as part of the job",
      "Spouting and downpipes at the same time, if that makes sense while access is there",
    ],
    faqs: [
      {
        q: "Can spouting or roof painting be done at the same time?",
        a: "Yes, and it usually makes sense to. The expensive part of any roof work is safe access — scaffold, edge protection, getting materials up there. Anything done while that access already exists costs less than doing it as a separate job later.",
      },
      {
        q: "How is a re-roof quoted?",
        a: "After a free site inspection, in writing. It can't be done honestly from a floor plan, because the condition of the structure under the old roof is what moves the number most, and nobody can see that from the ground.",
      },
    ],
    related: ["long-run-roofing", "membrane-roofing", "roof-repairs"],
    photos: [PHOTO.reroof, PHOTO.longRun, PHOTO.sheets],
  },

  /* ---------------------------------------------------------------- 3 */
  {
    slug: "long-run-roofing",
    name: "Long-Run Roofing",
    tag: "New Zealand's standard",
    hero: PHOTO.longRun,
    source: "written",
    blurb:
      "Full-length steel sheets running ridge to gutter with no end laps to leak — the standard New Zealand roof, on new builds and re-roofs alike.",
    lead:
      "Long-run is what most New Zealand roofs are, and the reason is simple: fewer joins means fewer places for water to get in.",
    whatItIs: [
      "Long-run steel roofing is made of sheets rolled to the exact length of the roof plane, so each one runs in a single piece from the ridge down to the gutter. A shorter-sheet roof has to lap sheets end to end on the way down, and every one of those end laps is a horizontal join sitting in the path of running water.",
      "The sheets are fixed off on the ribs — the high points of the profile — so the fixings sit above the water rather than in it. Underlay goes down first as a second line of defence, and the flashings, ridge cap and barge cap close the edges where the roof meets everything else.",
      "It suits pitched roofs. Below about a 3° pitch, water stops shedding properly and a membrane system is the right answer instead.",
    ],
    whenYouNeed: [
      "A new build that needs its first roof",
      "A re-roof on a pitched roof",
      "Replacing an older short-sheet or tile roof",
      "A commercial building where a long, simple roof plane suits full-length sheets",
    ],
    whatWeDo: [
      "Long-run steel installation on new builds and replacements",
      "Underlay laid and lapped down the fall",
      "Sheets run full length, pulled straight, fixed off on the ribs",
      "Ridge capping, barge and apron flashings",
      "Flashing around every penetration — flues, vents, hatches, chimneys",
    ],
    faqs: [
      {
        q: "What actually makes one long-run roof better than another?",
        a: "The parts you can't see from the street. Whether the sheets were pulled straight, whether the fixings went into the ribs, whether the underlay was lapped the right way down the fall, and whether the flashings were made to fit rather than forced. A roof survives a southerly on its detailing, not its colour.",
      },
      {
        q: "Can long-run go on a flat roof?",
        a: "No. Below roughly a 3° pitch water stops running off properly and starts sitting in the pans, and no profile is designed for that. A membrane system is the right choice for a flat or very low-slope roof.",
      },
    ],
    related: ["re-roofing", "membrane-roofing", "roof-repairs"],
    photos: [PHOTO.longRun, PHOTO.ridge, PHOTO.commercial],
  },

  /* ---------------------------------------------------------------- 4 */
  {
    slug: "membrane-roofing",
    name: "Membrane Roofing",
    tag: "Flat & low-slope",
    hero: PHOTO.coating,
    source: "written",
    blurb:
      "Waterproofing systems for flat and low-slope roofs, decks and balconies — where sheet steel can't shed water and a continuous surface is needed instead.",
    lead:
      "A flat roof doesn't shed water, it holds it. That calls for a different answer entirely: not sheets that overlap, but one continuous waterproof surface.",
    whatItIs: [
      "A membrane roof is a single continuous waterproof layer bonded across the whole roof surface, taken up the edges and sealed around every penetration. Because there are no laps and no fixings through the surface, there is nothing for standing water to find.",
      "It is the right system for flat roofs, low-slope roofs, decks and balconies — anywhere the pitch is too shallow for steel sheets to work as intended. It is common on commercial buildings, and on the flat-roofed sections of houses.",
      "The detailing at the upstands and around penetrations is what decides how long it lasts. That is where flat roofs fail, not in the middle of the field.",
    ],
    whenYouNeed: [
      "A flat or very low-slope roof",
      "A deck or balcony over a habitable space below",
      "A commercial building with a large flat roof area",
      "An existing membrane that has reached the end of its life or is ponding water",
    ],
    whatWeDo: [
      "Membrane systems on both residential and commercial buildings",
      "Flat and low-slope roofs, decks and balconies",
      "Upstands and edge detailing taken up and sealed properly",
      "Waterproofing around penetrations and drainage outlets",
    ],
    faqs: [
      {
        q: "Why do flat roofs get a reputation for leaking?",
        a: "Because water sits on them, so any weakness gets tested constantly rather than occasionally. A pitched roof drains a mistake away; a flat roof parks water on top of it. That's why the edges, upstands and outlets matter more than the middle.",
      },
      {
        q: "Can a membrane go over an existing flat roof?",
        a: "Sometimes, and sometimes the existing surface has to come off first — it depends on what's under there and how wet it already is. It's a decision that has to be made on the roof, which is what the free site inspection is for.",
      },
    ],
    related: ["commercial-roofing", "re-roofing", "roof-repairs"],
    photos: [PHOTO.coating, PHOTO.commercial, PHOTO.hatch],
  },

  /* ---------------------------------------------------------------- 5 */
  {
    slug: "roof-painting",
    name: "Roof Painting",
    tag: "Protect & refresh",
    // No verified photograph of a Hynson roof-painting job exists yet, so this
    // page opens on a real photo of a Hynson roof captioned for what it
    // actually shows, rather than a stock image of someone painting.
    // Requested from Eugene — see LAUNCH-BLOCKERS.md.
    hero: PHOTO.ridge,
    source: "written",
    blurb:
      "Roof painting and recoating that protects the substrate from Auckland's weather while refreshing how the property looks.",
    lead:
      "Roof paint is not decoration with a side benefit. On a steel roof the coating is the part doing the protecting — the steel underneath is only as safe as what's on top of it.",
    whatItIs: [
      "Roof painting means preparing the existing roof surface and applying a new protective coating system to it. Preparation is most of the job: the surface has to be clean, sound and free of loose material, or the new coating has nothing to hold on to and will fail early no matter how good it is.",
      "It is worth doing when the roof itself is still structurally sound but its coating has weathered — gone chalky, faded, or started letting corrosion get a foothold. It is not a way of putting off a re-roof on a roof that has already gone.",
      "Auckland is hard on coatings: strong UV, salt in the air near the coast, and long damp spells that favour moss and lichen.",
    ],
    whenYouNeed: [
      "The roof colour has faded badly or gone chalky to the touch",
      "Moss or lichen is establishing on the surface",
      "Surface corrosion is beginning, but the roof is otherwise sound",
      "You are selling, and the roof is the first thing anyone sees from the street",
      "The roof is sound but dated, and you'd rather recoat than replace",
    ],
    whatWeDo: [
      "Assess whether the roof is genuinely worth coating, or whether it's past it",
      "Surface preparation — the part that decides whether the coating lasts",
      "Protective recoating of the roof surface",
      "Colour refresh across residential and commercial properties",
    ],
    faqs: [
      {
        q: "Will painting fix a leaking roof?",
        a: "No, and anyone who says otherwise is selling you something. Paint is a coating, not a repair. A leak has to be found and fixed first; painting over it hides the evidence and leaves the water doing exactly what it was doing before.",
      },
      {
        q: "Is my roof worth painting, or should it be replaced?",
        a: "That depends on the condition of the steel under the coating, which needs looking at rather than guessing at. If the substrate has gone, paint is money thrown at a roof that still needs replacing — and you'll be told that rather than sold a coating.",
      },
    ],
    related: ["roof-repairs", "re-roofing", "maintenance"],
    photos: [PHOTO.ridge, PHOTO.barge, PHOTO.commercial],
  },

  /* ---------------------------------------------------------------- 6 */
  {
    slug: "emergency-roofing",
    name: "Emergency Roofing",
    tag: "Rapid response",
    hero: PHOTO.hatch,
    source: "client",
    urgent: true,
    blurb:
      "Unexpected roofing issues can quickly lead to further property damage if left untreated. Our team provides prompt and reliable emergency roofing support to address leaks, storm damage, and urgent repairs efficiently and professionally.",
    lead:
      "If water is coming in right now, ring 020 4028 1926. A phone call gets a roofer moving; a form sits in an inbox.",
    whatItIs: [
      "Emergency roofing is the work that can't wait for a quote and a booking — active leaks, storm damage, something lifted or torn off in a southerly. The point of it is to stop the damage getting worse while a proper repair is arranged.",
      "Water inside a building does its real damage slowly and out of sight: insulation, ceiling linings, framing, wiring, and everything stored in the roof space. The cost of the roof problem is usually smaller than the cost of what the water reaches while nobody is dealing with it.",
    ],
    whenYouNeed: [
      "Water actively coming through a ceiling",
      "Roofing lifted, torn or blown off in high wind",
      "Storm damage — a branch through the roof, or debris impact",
      "A ceiling sagging or bulging, which means water is pooling above it",
      "A commercial building where a leak is threatening stock or equipment",
    ],
    whatWeDo: [
      "Prompt response to leaks, storm damage and urgent repairs",
      "Stop the immediate ingress and limit what the water can reach",
      "Assess what actually failed, once it is safe to be up there",
      "Arrange the permanent repair or replacement afterwards",
    ],
    faqs: [
      {
        q: "What should I do before the roofer gets here?",
        a: "Move what you can out of the way and get a container under the drip. If a ceiling is bulging, keep out from under it — that's water pooling above the plasterboard and it can come down all at once. Don't go up on a wet roof to look.",
      },
      {
        q: "Should I ring or fill in the form?",
        a: "Ring. 020 4028 1926. For anything urgent the phone is faster than anything else on this website, and it always will be.",
      },
    ],
    related: ["roof-repairs", "re-roofing", "gutter-services"],
    photos: [PHOTO.hatch, PHOTO.flue, PHOTO.longRun],
  },
];

/**
 * The remaining six. Real services, listed in full on the hub page with the
 * client's own descriptions where he has published one, but without a
 * dedicated page of their own yet — the six above were prioritised because
 * they are what people actually search for.
 */
export const SERVICE_LIST_EXTRA = [
  {
    slug: null,
    name: "Residential Roofing",
    tag: "Homes",
    source: "client",
    blurb:
      "We provide professional residential roofing services tailored to protect and enhance your home. From re-roofing and repairs to ongoing maintenance, our team delivers dependable solutions designed for long-term performance in New Zealand conditions.",
    related: ["re-roofing", "roof-repairs", "long-run-roofing"],
  },
  {
    slug: null,
    name: "Commercial Roofing",
    tag: "Business",
    source: "client",
    blurb:
      "Our commercial roofing services are designed to meet the demands of offices, warehouses, retail spaces, and industrial properties. We focus on delivering durable roofing systems with efficient project management and minimal disruption to your operations.",
    related: ["membrane-roofing", "long-run-roofing", "roof-repairs"],
  },
  {
    slug: null,
    name: "New Roof Installation",
    tag: "New builds",
    source: "client",
    blurb:
      "Whether it's a new build or a complete roof replacement, we deliver high-quality roofing installations completed with precision and attention to detail. We use trusted materials and proven techniques to ensure a durable, long-lasting finish.",
    related: ["long-run-roofing", "membrane-roofing", "re-roofing"],
  },
  {
    slug: null,
    name: "Gutter Services",
    tag: "Drainage",
    source: "client",
    blurb:
      "Proper drainage is essential for protecting your property from water damage. We provide gutter and spouting repairs, replacements, and maintenance services to keep your roofing system functioning efficiently throughout the year.",
    related: ["roof-repairs", "re-roofing", "emergency-roofing"],
  },
  {
    slug: null,
    name: "Leak Repairs",
    tag: "Find it, fix it",
    source: "written",
    blurb:
      "Tracing a leak back to where the water is actually getting in — which is rarely where it shows up inside — and fixing that, rather than patching the symptom.",
    related: ["roof-repairs", "emergency-roofing", "re-roofing"],
  },
  {
    slug: null,
    name: "Flashings Maintenance",
    tag: "The joins",
    source: "written",
    blurb:
      "Flashings close every join a roof has — ridges, barges, valleys, walls, chimneys and every penetration. They are where roofs leak, and where maintenance pays for itself.",
    related: ["roof-repairs", "long-run-roofing", "re-roofing"],
  },
];

/** All twelve, in the order they appear on the hub. */
export const ALL_SERVICES = [
  SERVICE_PAGES[0], // roof repairs
  SERVICE_PAGES[1], // re-roofing
  SERVICE_PAGES[2], // long-run
  SERVICE_PAGES[3], // membrane
  SERVICE_PAGES[4], // roof painting
  SERVICE_PAGES[5], // emergency
  ...SERVICE_LIST_EXTRA,
];

export const getService = (slug) => SERVICE_PAGES.find((s) => s.slug === slug) || null;

/** Everything with a page of its own, for the nav dropdown and the sitemap. */
export const SERVICE_NAV = SERVICE_PAGES.map((s) => ({ slug: s.slug, name: s.name }));
