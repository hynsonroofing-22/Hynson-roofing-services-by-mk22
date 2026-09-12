import { PHONE_DISPLAY, EMAIL, ADDRESS, LEGAL_NAME } from "./content";

/* ==========================================================================
 * WHAT THE ASSISTANT IS ALLOWED TO SAY — read this before adding anything.
 *
 * Every sentence in this file has to be traceable to something Hynson
 * publishes about itself: the services list, the contact details, the service
 * area, and the three FAQs, all taken from hynsonroofingservices.co.nz.
 *
 * The assistant has NO ability to reason, invent or infer. It matches what
 * someone typed against the entries below and prints the matching answer
 * verbatim. That is the whole point: an answer it cannot find is an answer it
 * does not give. It says so and offers a callback instead.
 *
 * NEVER add an entry containing:
 *   - a price, rate, deposit or "from $X"
 *   - a warranty or guarantee length
 *   - a number of years trading, jobs completed, or staff
 *   - a licence, certification, membership or insurance claim
 *   - a response time, lead time or "same day"
 *   - a star rating or review count
 *
 * Every one of those is on the blocked list in LAUNCH-BLOCKERS.md and none has
 * been confirmed by Eugene. The GUARDED entries at the bottom exist precisely
 * so that being asked about them produces an honest "I can't tell you that,
 * here's who can" rather than a plausible-sounding invention.
 * ========================================================================== */

export const CONTACT_LINE = `Call ${PHONE_DISPLAY} or email ${EMAIL}.`;

/**
 * `k` is the match vocabulary — every word or phrase a real person might use
 * for this topic, including the informal ones. It is never shown on screen, so
 * it can be as long as it needs to be. Typos are handled by the matcher, not
 * by listing misspellings here.
 */
export const KNOWLEDGE = [
  // ---- what they do -----------------------------------------------------
  {
    id: "services",
    q: "What roofing services do you offer?",
    k: "services service offer provide jobs types type kind sort help roofing guys specialise specialize doing everything list",
    a: `Hynson Roofing covers residential and commercial roofing across Auckland: re-roofing, long-run steel roofing, membrane systems, new roof installation, roof repairs, leak repairs, flashings, roof painting and recoating, gutter and spouting work, roof maintenance and inspections, and emergency roofing.`,
    chips: ["Do you do roof painting?", "What about gutters?", "Emergency repairs?"],
  },
  {
    id: "reroof",
    q: "Do you do re-roofing?",
    k: "reroof re-roof reroofing replace replacement new roof old roof strip tear off remove existing whole roof",
    a: `Yes. Re-roofing and complete roof replacement are core work — the old roof comes off and a new system goes on, usually long-run steel or a membrane depending on the roof's shape and pitch. Hynson quotes it after a free site inspection, because what's underneath the old roof is what decides the job.`,
    chips: ["Book a site inspection", "What is long-run steel?"],
  },
  {
    id: "longrun",
    q: "What is long-run roofing?",
    k: "long run longrun steel iron colorsteel corrugated sheet metal profile tin",
    a: `Long-run steel is the standard New Zealand roof: full-length sheets running from the ridge straight down to the gutter, with no end laps to leak. Hynson installs it on both new builds and re-roofs.`,
    chips: ["Do you do membrane roofs?", "Get a quote"],
  },
  {
    id: "membrane",
    q: "Do you do flat or membrane roofs?",
    k: "membrane flat lowslope butynol torchon tpo waterproofing waterproof balcony",
    a: `Yes — membrane systems, for flat and low-slope roofs where sheet steel won't shed water properly. Hynson installs them on both homes and commercial buildings.`,
    chips: ["Commercial roofing", "Book a site inspection"],
  },
  {
    id: "repairs",
    q: "Can you fix a leak?",
    k: "leak leaking leaks drip dripping water coming in ceiling stain repair fix patch hole rust broken damaged problem wet",
    a: `Yes — leak repairs are one of the main things Hynson does, along with flashings and general roof repairs. The usual approach is to find and fix the problem before it turns into a bigger one, and a site inspection is free.`,
    chips: ["It's urgent", "Book a site inspection"],
  },
  {
    id: "emergency",
    q: "Do you do emergency roofing?",
    k: "emergency urgent today asap storm damage wind blown blew tarp quick fast flooding repair immediately straight away crisis off",
    a: `Yes, Hynson does emergency roofing — leaks, storm damage and urgent repairs. If water is coming in right now, ringing is much faster than filling in a form: ${PHONE_DISPLAY}.`,
    chips: ["Call now", "Send an enquiry"],
    urgent: true,
  },
  {
    id: "painting",
    q: "Do you paint roofs?",
    k: "paint painting repaint recoat recoating coating colour color spray faded chalky refresh restore roof",
    a: `Yes. Roof painting and recoating protects the roof from Auckland's weather and freshens up how the property looks. It's quoted after a look at the roof's condition.`,
    chips: ["Book a site inspection", "Get a quote"],
  },
  {
    id: "gutters",
    q: "Do you do gutters and spouting?",
    k: "gutter gutters guttering spouting downpipe downpipes drainage overflowing blocked fascia replace replacement",
    a: `Yes — gutter and spouting repairs, replacements and maintenance, so water actually gets away from the building instead of down the walls.`,
    chips: ["Book a site inspection", "Get a quote"],
  },
  {
    id: "commercial",
    q: "Do you work on commercial buildings?",
    k: "commercial business office warehouse factory industrial retail shop building body corporate apartment strata school church",
    a: `Yes. Hynson does commercial roofing as well as residential — offices, warehouses, retail and industrial properties — using membrane and long-run systems, and works to keep disruption to your operations down.`,
    chips: ["Book a site inspection", "What areas do you cover?"],
  },
  {
    id: "newbuild",
    q: "Do you roof new builds?",
    k: "newbuild construction extension addition builder architect roof builds installation install",
    a: `Yes — new roof installation on new builds as well as full replacements on existing buildings.`,
    chips: ["Get a quote", "What is long-run steel?"],
  },
  {
    id: "maintenance",
    q: "Do you do roof inspections and maintenance?",
    k: "inspection inspect check look survey report maintenance maintain service clean moss lichen condition assess",
    a: `Yes — roof inspections and preventative maintenance, to catch problems early rather than after the ceiling is stained. Site inspections are free.`,
    chips: ["Book a site inspection", "How do I know if I need a new roof?"],
  },
  {
    id: "skylights",
    q: "Do you do skylights?",
    k: "skylight skylights velux roof window flashing penetration vent flue chimney",
    a: `Yes — skylight installation and repair, and flashing around penetrations like flues, vents and chimneys so they stay watertight.`,
    chips: ["Book a site inspection"],
  },

  // ---- the questions from the client's own FAQ ---------------------------
  {
    id: "need-new-roof",
    q: "How do I know if I need a repair or a new roof?",
    k: "need new roof repair or replace worth repairing how do i know old should i tell whether replacement time",
    a: `Signs like leaks, rust, cracked roofing materials, loose flashings, water stains or problems that keep coming back all mean the roof needs attention. Hynson will inspect it and give an honest recommendation on whether a repair, maintenance or a full replacement is the right answer — that's what the free site inspection is for.`,
    chips: ["Book a site inspection", "Can you fix a leak?"],
  },
  {
    id: "free-quote",
    q: "Are quotes free?",
    k: "free quotes quotation quotations estimate assessment anything charge callout fee obligation cost nothing",
    a: `Yes — free quotations and free site assessments, residential and commercial. Hynson looks at the roof, talks through what you need, and gives you a clear recommendation with a written quotation for the work.`,
    chips: ["Book a site inspection", "Try the instant estimator"],
  },

  // ---- practical -------------------------------------------------------
  {
    id: "areas",
    q: "What areas do you cover?",
    k: "area areas cover covers serve serving servicing region located based location travel suburb suburbs work working near nearby local auckland north shore southern west east central manukau papakura albany henderson takapuna onehunga botany howick pakuranga waitakere wellington hamilton tauranga christchurch dunedin whangarei",
    a: `Auckland. Hynson Roofing is based at ${ADDRESS} and works across the Auckland region — that's the whole service area, so if you're outside Auckland it's worth ringing first to check.`,
    chips: ["Get in touch", "Book a site inspection"],
  },
  {
    id: "contact",
    q: "How do I get in touch?",
    k: "contact phone number call email address reach touch ring speak talk get hold message enquire enquiry",
    a: `${CONTACT_LINE} The office is at ${ADDRESS}. You can also send an enquiry through the form on this page and it comes straight through.`,
    chips: ["Send an enquiry", "What are your hours?"],
  },
  {
    id: "quote-how",
    q: "How do I get a quote?",
    k: "get quote quoted book booking arrange organise organize appointment visit someone come out look request process next step apply sign up",
    a: `Two ways. Send an enquiry through the form on this page with a bit about the roof, or ring ${PHONE_DISPLAY} directly. Either way the next step is a free site inspection, and the written quotation follows that.`,
    chips: ["Send an enquiry", "Try the instant estimator"],
  },
  {
    id: "estimator",
    q: "Is there a way to get a rough idea online?",
    k: "estimator calculator instant online rough ballpark idea tool estimate myself measure square metres m2 area size how big",
    a: `There's an instant estimator further up this page. It takes your roof area — and it can work that out from your address using public building outline data — and gives a ballpark range. It uses demo rates that Hynson hasn't confirmed yet, so treat it as a rough shape rather than a price. A real figure comes from the site inspection.`,
    chips: ["Try the instant estimator", "Book a site inspection"],
  },
  {
    id: "who",
    q: "Who are Hynson Roofing?",
    k: "who are you about company business eugene owner team history background story family local",
    a: `${LEGAL_NAME} is an Auckland roofing company based in Onehunga, run by Eugene, doing residential and commercial roofing across the region. Their line is "Built on Quality. Backed by Experience."`,
    chips: ["What areas do you cover?", "What services do you offer?"],
  },
  {
    id: "hours",
    q: "What are your opening hours?",
    k: "hours open opening close closed time when weekend saturday sunday after hours",
    a: `I don't have confirmed opening hours to give you, so I'd rather not guess. Ring ${PHONE_DISPLAY} or email ${EMAIL} and you'll get a straight answer.`,
    chips: ["Send an enquiry"],
  },

  // ---- GUARDED: things nobody has confirmed, so nobody gets told them ----
  {
    id: "price",
    q: "How much does a new roof cost?",
    k: "cost costs price pricing much expensive cheap dollars budget rate rates per square metre m2 charge afford figure ballpark deposit payment finance pay roof reroof job",
    a: `I can't give you a price, and I'd be making it up if I did — no two roofs cost the same, and it depends on size, pitch, access, and the state of what's underneath. Hynson quotes in writing after a free site inspection. There's an instant estimator on this page for a rough shape, but it uses demo rates, not Hynson's real ones.`,
    chips: ["Book a site inspection", "Try the instant estimator"],
    guarded: true,
  },
  {
    id: "warranty",
    q: "What warranty do you offer?",
    k: "warranty guarantee guaranteed workmanship years cover backed insurance insured liability claim promise",
    a: `I'm not going to quote you a warranty figure I can't stand behind. Ask Eugene directly — ${PHONE_DISPLAY} — and you'll get the real answer in writing rather than a number off a website.`,
    chips: ["Send an enquiry"],
    guarded: true,
  },
  {
    id: "credentials",
    q: "Are you licensed and insured?",
    k: "licensed licence license certified accredited qualified registered lbp member association ranz site safe master builders health safety insured insurance liability credentials",
    a: `That's a fair question and one I won't answer from guesswork. Ring ${PHONE_DISPLAY} or email ${EMAIL} and ask for it in writing — that's the only version worth having.`,
    chips: ["Send an enquiry"],
    guarded: true,
  },
  {
    id: "timing",
    q: "How long will it take / how soon can you come?",
    k: "long take takes soon quickly start started finish days weeks lead booked busy availability available schedule wait turnaround someone come out visit round today tomorrow",
    a: `I don't have confirmed timings and I won't invent one. It depends on the job and on what's already booked in — ring ${PHONE_DISPLAY} and you'll find out in a minute what a form can't tell you.`,
    chips: ["Send an enquiry", "It's urgent"],
    guarded: true,
  },
  {
    id: "reviews",
    q: "Do you have reviews?",
    k: "review reviews rating rated stars google testimonial testimonials feedback reputation recommend references",
    a: `There's one published review on this page, from Nolan L. about a canopy refurbishment, quoted in full. I'm not going to claim a rating or a review count that hasn't been verified.`,
    chips: ["Read the review", "Send an enquiry"],
    guarded: true,
  },
];

/**
 * Openers. Not knowledge — just enough manners that saying hello doesn't get
 * answered with a roofing FAQ.
 */
export const SMALL_TALK = [
  {
    id: "greeting",
    k: "hi hello hey gday kia ora good morning afternoon evening howdy yo sup hiya",
    a: `Hi. I can answer questions about what Hynson Roofing does, where they work and how to get a quote. What do you need?`,
    chips: ["What services do you offer?", "What areas do you cover?", "How do I get a quote?"],
    exactish: true,
  },
  {
    id: "thanks",
    k: "thanks thank you cheers ta appreciate great awesome perfect nice good stuff",
    a: `No problem. If you want someone to actually look at the roof, the enquiry form on this page is the quickest way to start.`,
    chips: ["Send an enquiry"],
    exactish: true,
  },
  {
    id: "bye",
    k: "bye goodbye see ya later cya night",
    a: `See you. ${CONTACT_LINE}`,
    chips: [],
    exactish: true,
  },
  {
    id: "human",
    k: "human person real speak someone talk agent operator manager owner eugene call me callback ring me phone me",
    a: `Best thing is to ring ${PHONE_DISPLAY} and talk to Eugene directly. If you'd rather he called you, send an enquiry through the form on this page with your number on it.`,
    chips: ["Send an enquiry"],
  },
];

/**
 * What gets said when nothing matched well enough.
 *
 * This is the most important string in the file. Anything the assistant does
 * not actually know has to land here, not in a confident-sounding guess.
 */
export const FALLBACK = `I don't know that one, and I'd rather say so than guess. I'll get Eugene to call you — send an enquiry with your number and what's happening with the roof, or ring ${PHONE_DISPLAY} now.`;

export const OPENING = `Hi — I can answer questions about Hynson's roofing services, the areas they cover, and how to get a quote. I only work from what Hynson has actually published, so if I don't know something I'll say so and put you on to Eugene.`;

export const OPENING_CHIPS = [
  "What services do you offer?",
  "What areas do you cover?",
  "Can you fix a leak?",
  "How much does it cost?",
];
