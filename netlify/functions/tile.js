/**
 * Aerial map tiles, proxied.
 *
 * The roof drawing tool needs aerial imagery — you cannot point at your own
 * roof on a street map. LINZ Basemaps publishes New Zealand aerial imagery,
 * it is free, it is the same organisation whose building outlines the address
 * lookup already uses, and it is far sharper over Auckland than any global
 * provider.
 *
 * It needs the LINZ key, and the key may never reach the browser — CRA would
 * bake a REACT_APP_ variable straight into the published bundle where anyone
 * could read it (see CLAUDE.md). So the browser asks this function for a tile
 * and this function, which is the only thing that knows the key, fetches it.
 *
 * Tiles are immutable: the aerial photography for a given z/x/y does not
 * change between page loads. They are therefore cached hard, both by the
 * browser and by Netlify's CDN, so a second visit to the same area costs no
 * function invocations at all.
 */

const MAX_ZOOM = 21;

/** Standard XYZ tile bounds check — keeps the function from proxying nonsense. */
function validTile(z, x, y) {
  if (!Number.isInteger(z) || !Number.isInteger(x) || !Number.isInteger(y)) return false;
  if (z < 0 || z > MAX_ZOOM) return false;
  const n = 2 ** z;
  return x >= 0 && x < n && y >= 0 && y < n;
}

exports.handler = async (event) => {
  const key = process.env.LINZ_API_KEY;
  if (!key) {
    return { statusCode: 503, body: "Imagery not configured" };
  }

  const q = event.queryStringParameters || {};
  const z = Number(q.z);
  const x = Number(q.x);
  const y = Number(q.y);

  if (!validTile(z, x, y)) {
    return { statusCode: 400, body: "Bad tile" };
  }

  const url =
    `https://basemaps.linz.govt.nz/v1/tiles/aerial/EPSG:3857/${z}/${x}/${y}.webp?api=${key}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      // Off the edge of the imagery, or above its resolution. A transparent
      // 1x1 is friendlier than an error square in the middle of the map.
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "public, max-age=3600",
        },
        body: "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        isBase64Encoded: true,
      };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/webp",
        // A year in the browser, a year on the CDN. Aerial photography for a
        // given tile is fixed until LINZ reflies the area.
        "Cache-Control": "public, max-age=31536000, immutable",
        "Netlify-CDN-Cache-Control": "public, max-age=31536000, immutable",
      },
      body: buf.toString("base64"),
      isBase64Encoded: true,
    };
  } catch {
    return { statusCode: 502, body: "Imagery unavailable" };
  }
};
