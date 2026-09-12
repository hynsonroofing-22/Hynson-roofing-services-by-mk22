/**
 * Address → roof area.
 *
 * Turns a typed street address into the building footprints on that section,
 * using free open data only:
 *
 *   1. Geocode the address to a coordinate.
 *   2. Ask LINZ's NZ Building Outlines (layer 101290) which buildings sit at
 *      that coordinate.
 *   3. Measure each footprint polygon.
 *
 * The browser never talks to LINZ directly, because that would put the API key
 * in the published bundle where anyone could read it. It calls this function,
 * and only this function knows the key.
 *
 * PRIVACY: the address someone types is personal data. It is used to make the
 * lookup and then discarded — it is never logged, never stored, and never put
 * in a URL the browser can see. There is deliberately NO server-side cache of
 * query strings here, even though one would be faster: a cache is storage.
 * Only the browser tab caches, and that dies with the tab.
 *
 * A footprint is NOT a roof area: it is the flat outline seen from above. The
 * pitch multiplier is applied on the client, where the pitch buttons live, so
 * that the working can be shown to the customer.
 */

// LINZ layer IDs. 101290 is verified working with our key.
const BUILDINGS_LAYER = "101290";

// LINZ's official address layer.
//
// This was previously 105689, taken from a web search. That was WRONG: the WFS
// answers "Feature type layer-105689 unknown" for it, and an earlier comment
// here blamed an unaccepted licence, which was a guess and also wrong.
// 105689 is the retired pilot dataset.
//
// The live ID was confirmed empirically from the service's own GetCapabilities
// (1842 feature types, filtered by title): layer-123113 = "NZ Addresses".
//
// If this ever breaks again, list the real names rather than guessing:
//   GET https://data.linz.govt.nz/services;key=KEY/wfs?service=WFS&version=2.0.0&request=GetCapabilities
const ADDRESS_LAYER = "123113";

const MAX_ADDRESS_LEN = 200;

// 30m, not the 55m this used to be.
//
// At 55m a suburban lookup came back with about twenty buildings — the whole
// neighbourhood, including four or five houses either side. The visitor then
// had to pick their own house out of a list long enough to push the Next
// button off the screen. Measured against real Auckland sections, 30m reaches
// the house, its garage and its sleepout and stops roughly at the fence.
const SEARCH_RADIUS_M = 30;
const MAX_BUILDINGS = 12;

// Anything smaller than this is a shed, tank or bin store, not a roof worth
// quoting. Keeps the picker list short and relevant.
const MIN_AREA_M2 = 8;

const EARTH_R = 6378137;

/** Area of one linear ring in m², via the spherical excess of its segments. */
function ringArea(ring) {
  if (!Array.isArray(ring) || ring.length < 4) return 0;
  let total = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [lon1, lat1] = ring[i];
    const [lon2, lat2] = ring[i + 1];
    const x1 = (lon1 * Math.PI) / 180;
    const y1 = (lat1 * Math.PI) / 180;
    const x2 = (lon2 * Math.PI) / 180;
    const y2 = (lat2 * Math.PI) / 180;
    total += (x2 - x1) * (2 + Math.sin(y1) + Math.sin(y2));
  }
  return Math.abs((total * EARTH_R * EARTH_R) / 2);
}

/** Footprint area of a GeoJSON Polygon / MultiPolygon, holes subtracted. */
function polygonArea(geometry) {
  if (!geometry) return 0;
  const polys =
    geometry.type === "MultiPolygon" ? geometry.coordinates : [geometry.coordinates];
  return polys.reduce((sum, rings) => {
    if (!Array.isArray(rings) || !rings.length) return sum;
    const outer = ringArea(rings[0]);
    const holes = rings.slice(1).reduce((h, r) => h + ringArea(r), 0);
    return sum + Math.max(0, outer - holes);
  }, 0);
}

async function getJson(url, headers, timeoutMs) {
  // Every upstream call is bounded. Without this a slow LINZ or Photon can sit
  // there until Netlify's own 10s limit kills the whole function, and the
  // visitor watches a spinner the entire time.
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs || 6000);
  try {
    const res = await fetch(url, { headers: headers || {}, signal: ctl.signal });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** CQL string literals escape a single quote by doubling it. */
const esc = (s) => String(s).replace(/'/g, "''");

/** "halsey drive" → "Halsey Drive". Used only where a case-sensitive index helps. */
function titleCase(s) {
  return s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

/**
 * Builds the CQL filter for a typed address, and this is where the speed came
 * from — it is worth understanding before changing it.
 *
 * The old filter was `full_address_ascii ILIKE '72 hals%'`. Measured against
 * the live service that takes ~3000ms, every time, because ILIKE is
 * case-insensitive and therefore cannot use the column's index: the database
 * scans every address in New Zealand.
 *
 * Splitting the query into its number and its road name instead —
 * `address_number=72 AND full_road_name_ascii ILIKE 'hals%'` — measured
 * ~120ms. The integer column is indexed and hugely selective, so the
 * case-insensitive part is then only filtering a handful of rows.
 *
 * Measured on the real service, same query, same machine:
 *   full_address_ascii ILIKE '72 hals%'                     3038 ms
 *   full_address_ascii LIKE  '72 Hals%'                       958 ms
 *   address_number=72 AND full_road_name_ascii ILIKE 'hals%'  103 ms
 *
 * For a road name typed with no street number there is no integer to lean on,
 * so we title-case it and use case-sensitive LIKE, which does use the index
 * (~580ms vs ~980ms). NZ road names are stored in title case.
 */
function buildAddressCql(q, aucklandOnly) {
  // "72 Halsey Drive, Lynfield, Auckland" — everything after the first comma
  // is suburb/city, which lives in different columns.
  const parts = q
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const street = parts[0] || "";
  if (!street) return null;

  const clauses = [];

  // Optional unit prefix ("2/72 Halsey"), then the street number, an optional
  // letter suffix ("13a"), then the road name.
  const m = street.match(/^\s*(?:\S+\s*\/\s*)?(\d{1,6})\s*[A-Za-z]?\s+(.+)$/);
  if (m) {
    clauses.push(`address_number=${Number(m[1])}`);
    const road = m[2].trim();
    if (road) clauses.push(`full_road_name_ascii ILIKE '${esc(road)}%'`);
  } else if (/^\d+$/.test(street.trim())) {
    // Just a number so far. Matching every "72" in the country is useless
    // noise, so we wait for a letter of the road name.
    return null;
  } else {
    clauses.push(`full_road_name_ascii LIKE '${esc(titleCase(street))}%'`);
  }

  // A suburb or city typed after a comma narrows things further.
  for (const extra of parts.slice(1, 3)) {
    clauses.push(
      `(suburb_locality_ascii ILIKE '${esc(extra)}%' OR town_city_ascii ILIKE '${esc(extra)}%')`
    );
  }

  // The service area is Auckland. Restricting to it is both faster and more
  // useful — nobody typing here wants a Christchurch street offered to them.
  // The caller retries without this if it finds nothing.
  if (aucklandOnly) clauses.push(`territorial_authority='Auckland'`);

  return clauses.join(" AND ");
}

/** Runs one address query. Returns [] on anything unexpected. */
async function queryLinzAddresses(q, key, count, aucklandOnly) {
  const cql = buildAddressCql(q, aucklandOnly);
  if (!cql) return [];
  const url =
    `https://data.linz.govt.nz/services;key=${key}/wfs?service=WFS&version=2.0.0` +
    `&request=GetFeature&typeNames=layer-${ADDRESS_LAYER}&outputFormat=application/json` +
    `&count=${count}&cql_filter=${encodeURIComponent(cql)}`;
  const json = await getJson(url, {}, 6000);
  return (json.features || [])
    .filter((f) => f.geometry && f.properties && Array.isArray(f.geometry.coordinates))
    .map((f) => ({
      label: f.properties.full_address,
      lon: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      city: f.properties.town_city || "",
    }))
    .filter((r) => r.label);
}

/** De-duplicates by label and keeps the first of each. */
function dedupe(rows) {
  const seen = new Set();
  return rows.filter((r) => {
    const k = r.label.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** LINZ suggestions, Auckland first. Returns [] rather than throwing. */
async function suggestViaLinz(q, key) {
  try {
    let rows = await queryLinzAddresses(q, key, 25, true);
    if (!rows.length) {
      // Rare: a road that genuinely isn't in Auckland. Costs a second round
      // trip, but only when the first one found nothing at all.
      rows = await queryLinzAddresses(q, key, 25, false);
    }
    return dedupe(rows).slice(0, 6);
  } catch {
    return [];
  }
}

/** LINZ's own address layer for a full address. Null if unavailable. */
async function geocodeViaLinz(address, key) {
  try {
    let rows = await queryLinzAddresses(address, key, 4, true);
    if (!rows.length) rows = await queryLinzAddresses(address, key, 4, false);
    return rows[0] || null;
  } catch {
    return null;
  }
}

// New Zealand's bounding box, and a bias point over central Auckland — the
// entire service area. Together these keep suggestions local instead of
// offering the visitor a street in Ohio.
const NZ_BBOX = "166.0,-47.5,179.2,-34.0";
const AKL = { lat: -36.85, lon: 174.76 };

const UA =
  "HynsonRoofingServices/1.0 (roof area estimator; info@hynsonroofingservices.co.nz)";

/** Turns a Photon feature into one readable line, e.g. "15 Hardington Street, Onehunga, Auckland". */
function photonLabel(p) {
  const street = [p.housenumber, p.street || p.name].filter(Boolean).join(" ");
  return [street, p.district, p.city, p.state]
    .filter(Boolean)
    .filter((part, i, arr) => arr.indexOf(part) === i) // Auckland, Auckland
    .join(", ");
}

/**
 * Address suggestions from OpenStreetMap, used ONLY when LINZ found nothing.
 *
 * Uses Photon rather than Nominatim: Nominatim's usage policy explicitly
 * forbids using it for autocomplete, and we are not going to breach someone's
 * terms to save a step. Photon is the same OpenStreetMap data, open source,
 * free, no key, and purpose-built for exactly this.
 *
 * It is a fallback and not the main path because it measures ~2000ms against
 * LINZ's ~120ms, and because it is a free public service run by volunteers —
 * firing it on every keystroke would be taking the mickey.
 */
async function suggestAddresses(q) {
  const url =
    `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=en` +
    `&lat=${AKL.lat}&lon=${AKL.lon}&zoom=11&location_bias_scale=0.6&bbox=${NZ_BBOX}`;
  const json = await getJson(url, { "User-Agent": UA }, 3000);
  return (json.features || [])
    .filter((f) => f.properties && f.properties.countrycode === "NZ" && f.geometry)
    .map((f) => ({
      label: photonLabel(f.properties),
      lon: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
    }))
    .filter((s) => s.label.length > 2);
}

/**
 * OpenStreetMap's free geocoder. No key and no signup, which is why it is here.
 * Their usage policy asks for an identifying User-Agent, so we send one; the
 * call is made from the server, never the browser, so the address stays out of
 * the visitor's URL bar and out of any referrer header.
 *
 * Only used for a whole typed address, never for type-ahead — see above.
 */
async function geocodeViaNominatim(address) {
  const q = encodeURIComponent(`${address}, New Zealand`);
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=nz&q=${q}`;
  const json = await getJson(
    url,
    { "User-Agent": UA, "Accept-Language": "en-NZ" },
    5000
  );
  const hit = json && json[0];
  if (!hit) return null;
  return { lon: Number(hit.lon), lat: Number(hit.lat), label: hit.display_name || null };
}

/**
 * Sorts the buildings on a section into the order a person would.
 *
 * LINZ's vector query gives us `distance` in metres from the queried point to
 * each polygon, and it is 0 for the polygon the point falls inside. The
 * address point sits on the house, so distance 0 is almost always the house
 * itself — that is what gets auto-selected.
 *
 * After that: nearest first, and where two are the same distance, the larger
 * one first. A garage sitting the same distance away as the house should not
 * outrank it.
 */
function rankBuildings(list) {
  return list.slice().sort((a, b) => {
    const onSiteA = a.distance === 0 ? 0 : 1;
    const onSiteB = b.distance === 0 ? 0 : 1;
    if (onSiteA !== onSiteB) return onSiteA - onSiteB;
    if (a.distance !== b.distance) return (a.distance ?? 999) - (b.distance ?? 999);
    return b.footprint - a.footprint;
  });
}

exports.handler = async (event) => {
  const started = Date.now();
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };

  if (event.httpMethod !== "POST") {
    // POST only, deliberately: a GET would put the address in the URL, and
    // URLs end up in logs, history and referrer headers.
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, reason: "method" }) };
  }

  const key = process.env.LINZ_API_KEY;
  if (!key) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: false,
        reason: "not_configured",
        message: "Address lookup isn't switched on yet.",
      }),
    };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    body = {};
  }

  // ---- connection warm-up ------------------------------------------------
  // Fired when the address box is focused, before a single key is pressed.
  // It does no lookup at all; it exists so the DNS, TLS handshake and (on
  // Netlify) the function's cold start have already happened by the time the
  // first real keystroke arrives. Nothing is sent and nothing is stored.
  if (body.mode === "warm") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, warm: true, ms: Date.now() - started }),
    };
  }

  // ---- type-ahead suggestions -------------------------------------------
  if (body.mode === "suggest") {
    const q = String(body.q || "").trim();
    if (q.length < 3 || q.length > MAX_ADDRESS_LEN) {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, suggestions: [] }) };
    }
    try {
      // LINZ only, in the normal case — it is the country's official address
      // data and, queried the way buildAddressCql queries it, the fast one.
      // Photon runs only when LINZ has nothing, because it is ~15x slower.
      let suggestions = await suggestViaLinz(q, key);
      let source = "LINZ NZ Addresses";
      if (!suggestions.length) {
        try {
          suggestions = await suggestAddresses(q);
          source = "OpenStreetMap";
        } catch {
          suggestions = [];
        }
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, suggestions, source, ms: Date.now() - started }),
      };
    } catch {
      // A failed suggestion is not an error worth showing — the visitor can
      // still type the address in full and press Find.
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, suggestions: [] }) };
    }
  }

  // ---- full lookup -------------------------------------------------------
  // A suggestion that was picked already carries its coordinate, so we skip
  // geocoding entirely in that case.
  const picked =
    Number.isFinite(body.lat) && Number.isFinite(body.lon)
      ? { lat: Number(body.lat), lon: Number(body.lon), label: body.label || null }
      : null;

  const address = String(body.address || "").trim();
  if (!picked && (address.length < 5 || address.length > MAX_ADDRESS_LEN)) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: false, reason: "bad_address", message: "Enter a street address." }),
    };
  }

  try {
    const point =
      picked || (await geocodeViaLinz(address, key)) || (await geocodeViaNominatim(address));
    if (!point) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: false,
          reason: "no_address",
          message: "We couldn't find that address.",
        }),
      };
    }

    const url =
      `https://data.linz.govt.nz/services/query/v1/vector.json?key=${key}` +
      `&layer=${BUILDINGS_LAYER}&x=${point.lon}&y=${point.lat}` +
      `&max_results=${MAX_BUILDINGS}&radius=${SEARCH_RADIUS_M}&geometry=true`;
    const json = await getJson(url, {}, 6000);
    const layer = json.vectorQuery && json.vectorQuery.layers && json.vectorQuery.layers[BUILDINGS_LAYER];
    const features = (layer && layer.features) || [];

    const buildings = rankBuildings(
      features
        .map((f) => ({
          id: String(f.id || (f.properties && f.properties.building_id) || ""),
          footprint: Math.round(polygonArea(f.geometry)),
          use: (f.properties && f.properties.use) || null,
          suburb: (f.properties && f.properties.suburb_locality) || null,
          // LINZ's own distance, in metres, from the address point to the
          // polygon — 0 when the point is inside it. More reliable than
          // measuring to a centroid, which the previous version did and which
          // made a long thin building look further away than it is.
          distance: Number.isFinite(f.distance) ? Math.round(f.distance) : null,
        }))
        .filter((b) => b.footprint >= MIN_AREA_M2)
    );

    if (!buildings.length) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: false,
          reason: "no_building",
          message: "We found the address but no building outline for it.",
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        // The matched label is echoed so the visitor can confirm we found the
        // right place. It is not stored anywhere.
        matched: point.label,
        buildings,
        // How confident we are that buildings[0] is the visitor's own house:
        // "high" when the address point falls inside it, "low" when the
        // nearest outline is merely nearby. The client words the screen
        // differently for each rather than pretending to be sure.
        confidence: buildings[0].distance === 0 ? "high" : "low",
        source: "LINZ NZ Building Outlines",
        ms: Date.now() - started,
      }),
    };
  } catch {
    // Deliberately no error detail and no address in the log.
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: false,
        reason: "lookup_failed",
        message: "The address lookup service didn't respond.",
      }),
    };
  }
};
