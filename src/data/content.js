export const PHONE_DISPLAY = "020 4028 1926";
export const PHONE_TEL = "+642040281926";
export const EMAIL = "info@hynsonroofingservices.co.nz";
export const LEGAL_NAME = "Hynson Roofing Services Limited";
export const ADDRESS = "13 Hardington Street, Onehunga, Auckland 1061";

// Tried dissolving the 3D scene into a single real photo at the end —
// client feedback was that it read as confusing/unclear rather than a
// satisfying payoff. Reverted: the build now hands off to the emergency
// band and then the horizontal work gallery instead. Left empty on
// purpose; see LAUNCH-BLOCKERS.md.
export const FINAL_PHOTO_SRC = "";

// 7 curated service cards for the homepage — simpler to scan than a wall of
// 12 tiles (client feedback: fewer, cleaner). All 12 real services confirmed
// from the client's live site (CONTENT-AND-REFERENCE-BRIEF.md Part 1) are
// still present, folded into the bullet points below — nothing dropped,
// just organised. Re-roofing, long-run and membrane roofing sit under
// Residential/Commercial/New Install; leak repairs and flashings sit under
// Roof Repairs.
export const SERVICES = [
  {
    id: "residential",
    num: "01",
    title: "Residential Roofing",
    tag: "Homes",
    desc: "Professional residential roofing tailored to protect and enhance your home — from re-roofing and repairs to ongoing maintenance, built for long-term performance in New Zealand conditions.",
    points: ["Re-roofing & long-run iron", "Membrane systems", "Ongoing maintenance"],
  },
  {
    id: "commercial",
    num: "02",
    title: "Commercial Roofing",
    tag: "Business",
    desc: "Durable roofing systems for offices, warehouses, retail spaces and industrial properties — delivered with efficient project management and minimal disruption to your operations.",
    points: ["Offices, warehouses & retail", "Membrane & long-run systems", "Minimal disruption"],
  },
  {
    id: "emergency",
    num: "03",
    title: "Emergency Roofing",
    tag: "Rapid response",
    desc: "Leaks, storm damage and urgent repairs — prompt, reliable emergency support before small issues turn into major property damage.",
    points: ["Leak & storm response", "Urgent repairs handled fast"],
  },
  {
    id: "repair",
    num: "04",
    title: "Roof Repairs",
    tag: "Extend roof life",
    desc: "We identify and resolve roofing issues before they become major problems — leak repairs, flashings and general upkeep that extend the lifespan of your roof.",
    points: ["Leak repairs", "Flashings maintenance"],
  },
  {
    id: "new-install",
    num: "05",
    title: "New Roof Installation",
    tag: "New builds",
    desc: "New build or complete roof replacement — high-quality installations completed with precision, using trusted materials and proven techniques for a durable, long-lasting finish.",
    points: ["New builds & replacements", "Long-run & membrane systems"],
  },
  {
    id: "gutters",
    num: "06",
    title: "Gutter Services",
    tag: "Drainage",
    desc: "Gutter and spouting repairs, replacements and maintenance — proper drainage that protects your property from water damage all year round.",
    points: ["Repairs & replacements", "Year-round protection"],
  },
  {
    id: "painting",
    num: "07",
    title: "Roof Painting",
    tag: "Protect & refresh",
    desc: "Roof painting and recoating that protects the substrate from Auckland's weather while refreshing the look of your property.",
    points: ["Protective recoating", "Colour refresh"],
  },
];

// The desktop 3D build (RoofScene.jsx). Each chapter is a real stage of a
// re-roof, named the way a roofer would name it, in the order it actually
// happens. Ranges must stay in step with the Layer ranges in RoofScene.jsx.
//
// The previous version of this list described a house going up — foundations,
// framing, wall cladding — which is what prompted the client's "doesn't show
// the company is a good roofing company" feedback. Keep this roof-only.
export const CHAPTERS = [
  {
    step: "01",
    title: "TRUSSES",
    desc: "Trusses lifted, lined up and fixed. Straight and square here means straight lines all the way to the ridge.",
    range: [0, 0.12],
  },
  {
    step: "02",
    title: "PURLINS",
    desc: "Purlins run across the rafters at set centres — the fixing line every sheet above depends on.",
    range: [0.12, 0.24],
  },
  {
    step: "03",
    title: "ROOFING UNDERLAY",
    desc: "Underlay laid and lapped down the fall. The second line of defence if wind-driven rain ever gets past the iron.",
    range: [0.24, 0.36],
  },
  {
    step: "04",
    title: "LONG-RUN IRON",
    desc: "Full-length sheets run ridge to gutter, pulled straight and fixed off on the ribs. No end laps to leak.",
    range: [0.36, 0.52],
  },
  {
    step: "05",
    title: "RIDGE CAP",
    desc: "Ridge capping set down over both sheet runs and fixed square — the line everyone sees from the street.",
    range: [0.52, 0.62],
  },
  {
    step: "06",
    title: "BARGE & APRON FLASHINGS",
    desc: "Barge flashings close the gable edge; the apron and soakers seal where the roof meets the chimney.",
    range: [0.62, 0.74],
  },
  {
    step: "07",
    title: "FASCIA & SPOUTING",
    desc: "Fascia hung off the rafter ends, spouting set to fall and the downpipe taken off the corner.",
    range: [0.74, 0.84],
  },
  {
    step: "08",
    title: "FINISHED ROOF",
    desc: "Watertight, tidy and signed off — the standard we want every Auckland roof we touch to be left at.",
    range: [0.84, 0.92],
  },
  // The closing argument, and the reason this animation exists at all. Anyone
  // can show a photo of a finished roof; almost nobody shows the laps and
  // flashings underneath it, which are the only parts that decide whether it
  // survives a southerly. No rainfall figures or warranty claims here — none
  // have been confirmed. See the honesty rule in CLAUDE.md.
  {
    step: "09",
    title: "WHAT IT'S BUILT FOR",
    desc: "Auckland doesn't do gentle. Sideways rain, salt air, and a southerly that finds every gap. Every lap, flashing and ridge line you just watched go on is there for this day.",
    range: [0.92, 1.01],
  },
];

// The 6 real portfolio projects from the client's live site, with their
// verbatim titles and descriptions (portfolio-collections pages). Real
// full-resolution photos — see LAUNCH-BLOCKERS.md #3 re: photo permission.
export const PROJECTS = [
  {
    id: "residential-roof-replacement",
    title: "Residential Roof Replacement",
    desc: "Complete tear-off and replacement of existing residential roofing systems. Focus on durable materials and expert installation to ensure long-term protection and aesthetic appeal for homeowners.",
    location: "Auckland",
    category: "Residential",
    image: "/img/proj-residential-roof-replacement.webp",
  },
  {
    id: "emergency-roof-repair",
    title: "Emergency Roof Repair",
    desc: "Rapid response service for urgent roofing issues such as leaks, storm damage, or structural problems. Aims to mitigate further damage and restore integrity to affected roofs quickly and efficiently.",
    location: "Auckland",
    category: "Residential",
    image: "/img/proj-emergency-roof-repair.webp",
  },
  {
    id: "commercial-flat-roof-installation",
    title: "Commercial Flat Roof Installation",
    desc: "Installation of new flat roofing systems for commercial properties. Emphasis on weather resistance, energy efficiency, and adherence to commercial building codes for various membrane types.",
    location: "Auckland",
    category: "Commercial",
    image: "/img/proj-commercial-flat-roof-installation.webp",
  },
  {
    id: "roof-maintenance-and-inspection",
    title: "Roof Maintenance and Inspection",
    desc: "Comprehensive roof inspection and preventative maintenance services. Identify potential issues early, prolong roof lifespan, and maintain optimal performance through regular check-ups and minor repairs.",
    location: "Auckland",
    category: "Residential",
    image: "/img/proj-roof-maintenance-and-inspection.webp",
  },
  {
    id: "gutter-and-downspout-installation",
    title: "Gutter and Downspout Installation",
    desc: "Installation and seamless integration of high-quality gutter and downspout systems. Designed to effectively manage rainwater runoff, protect foundations, and prevent water damage to the building exterior.",
    location: "Auckland",
    category: "Residential",
    image: "/img/proj-gutter-and-downspout-installation.webp",
  },
  {
    id: "skylight-installation-and-repair",
    title: "Skylight Installation and Repair",
    desc: "Professional installation and repair of various types of skylights. Enhances natural light within a property while ensuring watertight seals and proper ventilation to prevent leaks and drafts.",
    location: "Auckland",
    category: "Residential",
    image: "/img/proj-skylight-installation-and-repair.webp",
  },
];

// ---------------------------------------------------------------------------
// Horizontal "Our recent work" gallery (WorkGallery.jsx).
//
// These are the client's own on-the-job photos — long-run iron going down
// under scaffold and shrinkwrap, flashings, capping, penetrations. They are
// deliberately used instead of the polished portfolio set in PROJECTS below:
// a roofer looking at these can tell the work is real.
//
// HONESTY NOTES — read before editing:
//  * `job` describes only what is visibly happening in the photograph. No
//    claim is made about when it was done, what it cost, or how big it was.
//  * `suburb` is null on every entry because no suburb has been confirmed by
//    the client (LAUNCH-BLOCKERS.md #3, question 10). The component shows the
//    verified region, "Auckland", and prints a visible placeholder notice
//    rather than inventing suburb names. Fill these in only from Eugene.
//  * Source files are 480×360 — the largest available from the client so far.
//    Originals have been requested; see LAUNCH-BLOCKERS.md.
// ---------------------------------------------------------------------------
export const GALLERY = [
  {
    id: "long-run-under-scaffold",
    image: "/img/proj-7144ddd464364bb0bdc922953adcba3d.webp",
    job: "Long-run iron, valley and ridge",
    suburb: null,
  },
  {
    id: "roof-vents",
    image: "/img/proj-88b691af2941477d98f4ebf6b6becbe8.webp",
    job: "Roof vents set into new long-run",
    suburb: null,
  },
  {
    id: "flue-flashing",
    image: "/img/proj-dd45718e0c904c18a490dbc15b729ba1.webp",
    job: "Flue penetration flashed and sealed",
    suburb: null,
  },
  {
    id: "sheets-laid",
    image: "/img/proj-8bdbe118b64d4bd39b8d17d036ad6070.webp",
    job: "Sheets laid out and fixed off",
    suburb: null,
  },
  {
    id: "hatch-flashing",
    image: "/img/proj-0b2e36224da04162a8bb6ff17f4b9ff7.webp",
    job: "Custom flashing over a roof hatch",
    suburb: null,
  },
  {
    id: "barge-capping",
    image: "/img/proj-b5516c29f9da4b9fa3279d6dfd5d1634.webp",
    job: "Barge capping along the roof edge",
    suburb: null,
  },
  {
    id: "ridge-capping",
    image: "/img/proj-788371d15a4d4ab5b7bb5d055761c519.webp",
    job: "Ridge capping run out straight",
    suburb: null,
  },
  {
    id: "commercial-long-run",
    image: "/img/proj-f8c1f1da08ca49afb0953d6fb1236537.webp",
    job: "Commercial long-run roof, finished",
    suburb: null,
  },
];

export const TESTIMONIALS = [
  {
    name: "Nolan L.",
    suburb: "Auckland",
    job: "Canopy refurbishment project",
    text: "We approached Hynson Roofing, who were highly recommended by a friend, for a complex canopy refurbishment project. Eugene and his team were efficient and committed to ensuring the job was done to a high standard. The new solution is higher quality than the original installation. Although we encountered some administrative hurdles, we were able to resolve them. We are happy with the result, have plans for future work with them, and would recommend them to anyone.",
  },
  { cta: true },
];

export const MARQUEE_ITEMS = [
  "Long-Run Roofing",
  "Re-Roofing",
  "Roof Repairs",
  "Membrane Systems",
  "Roof Painting",
  "Gutters & Spouting",
  "Auckland Wide",
  "Free Quotes",
];

export const REGIONS = ["Central Auckland", "North Shore", "South Auckland", "East Auckland", "West Auckland", "Other"];

export const FAQS = [
  {
    q: "What roofing services do you provide?",
    a: "We offer a wide range of residential and commercial roofing services across Auckland, including long-run roofing, re-roofing, roof repairs, membrane roofing systems, roof painting, leak repairs, flashings, gutter services, and ongoing roof maintenance. Our team focuses on delivering reliable workmanship and long-lasting roofing solutions tailored to your property.",
  },
  {
    q: "How do I know if my roof needs repairs or replacement?",
    a: "Signs such as leaks, rust, cracked roofing materials, loose flashings, water stains, or recurring issues may indicate that your roof requires attention. Our team can carry out a professional roof inspection and provide honest recommendations on whether repairs, maintenance, or a full replacement would be the most suitable solution for your property.",
  },
  {
    q: "Do you provide free quotes and site inspections?",
    a: "Yes, we provide free quotations and site assessments for residential and commercial roofing projects. We take the time to understand your roofing requirements, inspect the condition of the roof, and provide clear recommendations along with a detailed quotation for the proposed work.",
  },
];

export const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;
