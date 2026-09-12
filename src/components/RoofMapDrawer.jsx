import { useEffect, useRef, useState, useCallback } from "react";
import { Undo2, Trash2, Check, Crosshair, Loader2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Trace your own roof on an aerial photo.
 *
 * WHY THIS EXISTS
 * ---------------
 * Looking a roof up from an address is fast and it is usually right, but it is
 * not always right — a shared driveway, a block of flats or an odd title can
 * return a footprint that is plainly not one house. When that happens, an
 * automatic number is worse than no number, because the person reading it has
 * no way to tell it is wrong and no way to fix it.
 *
 * Letting someone click the corners of their own roof solves both halves of
 * that. It is easy — everyone can find their own house from the air — and the
 * number that comes out is theirs. They chose it, so they believe it, and
 * nobody has to defend a figure a computer produced.
 *
 * THE IMAGERY is LINZ aerial, the same public source as the building outlines,
 * proxied through our own function so the key stays on the server. Free, New
 * Zealand government, and sharp enough over Auckland to count roof planes.
 */

// Auckland, for when we have no better idea where to start.
const AUCKLAND = [-36.8509, 174.7645];

/**
 * Area of a polygon on the earth's surface, in m².
 *
 * The same spherical-excess method the server uses on LINZ's own building
 * outlines, so a traced roof and a looked-up roof are measured identically and
 * can be compared like for like.
 */
const EARTH_R = 6378137;
function polygonArea(latlngs) {
  if (!latlngs || latlngs.length < 3) return 0;
  let total = 0;
  for (let i = 0; i < latlngs.length; i++) {
    const a = latlngs[i];
    const b = latlngs[(i + 1) % latlngs.length];
    const x1 = (a.lng * Math.PI) / 180;
    const y1 = (a.lat * Math.PI) / 180;
    const x2 = (b.lng * Math.PI) / 180;
    const y2 = (b.lat * Math.PI) / 180;
    total += (x2 - x1) * (2 + Math.sin(y1) + Math.sin(y2));
  }
  return Math.abs((total * EARTH_R * EARTH_R) / 2);
}

export default function RoofMapDrawer({ centre, onArea, pitchFactor = 1 }) {
  const holder = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const markers = useRef([]);
  const [points, setPoints] = useState([]);
  const [ready, setReady] = useState(false);

  const footprint = Math.round(polygonArea(points));
  const roof = Math.round(footprint * pitchFactor);

  /** Redraws the outline and its corner handles from `points`. */
  const redraw = useCallback((pts) => {
    if (!map.current) return;
    markers.current.forEach((m) => m.remove());
    markers.current = [];
    if (layer.current) {
      layer.current.remove();
      layer.current = null;
    }

    if (pts.length >= 2) {
      layer.current = (pts.length >= 3 ? L.polygon : L.polyline)(pts, {
        color: "#E27614",
        weight: 3,
        fillColor: "#E27614",
        fillOpacity: pts.length >= 3 ? 0.28 : 0,
      }).addTo(map.current);
    }

    pts.forEach((p) => {
      markers.current.push(
        L.circleMarker(p, {
          radius: 6,
          color: "#fff",
          weight: 2,
          fillColor: "#E27614",
          fillOpacity: 1,
        }).addTo(map.current)
      );
    });
  }, []);

  // Build the map once.
  useEffect(() => {
    if (!holder.current || map.current) return undefined;

    const m = L.map(holder.current, {
      center: centre || AUCKLAND,
      zoom: centre ? 19 : 12,
      maxZoom: 21,
      zoomControl: true,
      // The page scrolls; the map should not steal the wheel as you pass over
      // it. Ctrl+wheel and the +/- buttons still zoom.
      scrollWheelZoom: false,
      attributionControl: true,
    });

    L.tileLayer("/api/tile?z={z}&x={x}&y={y}", {
      maxZoom: 21,
      maxNativeZoom: 21,
      // LINZ ask for attribution and it is the right thing to do anyway.
      attribution:
        'Aerial imagery <a href="https://www.linz.govt.nz/" target="_blank" rel="noopener noreferrer">LINZ</a> CC BY 4.0',
    }).addTo(m);

    m.on("click", (e) => {
      setPoints((prev) => [...prev, e.latlng]);
    });

    map.current = m;
    setReady(true);

    // Leaflet measures the container on creation. Inside a tab that was
    // hidden a moment ago it can read zero and paint a grey box, so it is
    // told to re-measure once the browser has laid everything out.
    const t = setTimeout(() => m.invalidateSize(), 120);

    return () => {
      clearTimeout(t);
      m.remove();
      map.current = null;
    };
    // Centre is applied on change by the effect below, not by rebuilding.
    // eslint-disable-next-line
  }, []);

  // Re-centre when the address step hands us a coordinate.
  useEffect(() => {
    if (map.current && centre) map.current.setView(centre, 19);
  }, [centre]);

  useEffect(() => {
    redraw(points);
  }, [points, redraw]);

  // Hand the finished figure up. Only once the shape is actually a shape.
  useEffect(() => {
    if (points.length >= 3 && footprint > 0) {
      onArea({ footprint, roof, points: points.length });
    } else {
      onArea(null);
    }
    // onArea is recreated by the parent on every render; depending on it here
    // would loop.
    // eslint-disable-next-line
  }, [footprint, roof, points.length]);

  const undo = () => setPoints((p) => p.slice(0, -1));
  const clear = () => setPoints([]);

  return (
    <div data-testid="roof-map-drawer">
      <p className="t-small text-content-muted">
        Find your house, then click each corner of the roof. Click the first corner again
        when you're done — or just close the shape roughly, it doesn't need to be perfect.
      </p>

      <div className="relative mt-4 overflow-hidden border border-line">
        <div
          ref={holder}
          className="h-[340px] w-full sm:h-[420px]"
          // The map handles its own wheel and touch gestures inside this box.
          data-lenis-prevent
        />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-sunken">
            <Loader2 className="h-5 w-5 animate-spin text-content-faint" />
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={undo}
          disabled={!points.length}
          className="btn-lift inline-flex items-center gap-2 border border-line-strong bg-surface px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-content-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
          data-testid="map-undo"
        >
          <Undo2 className="h-3.5 w-3.5" /> Undo corner
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={!points.length}
          className="btn-lift inline-flex items-center gap-2 border border-line-strong bg-surface px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-content-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
          data-testid="map-clear"
        >
          <Trash2 className="h-3.5 w-3.5" /> Start again
        </button>
        <span className="ml-auto inline-flex items-center gap-1.5 t-label text-content-faint">
          <Crosshair className="h-3.5 w-3.5" />
          {points.length} {points.length === 1 ? "corner" : "corners"}
        </span>
      </div>

      {points.length > 0 && points.length < 3 && (
        <p className="mt-3 t-small text-content-faint">
          Keep going — three corners is the minimum, four for a simple rectangular roof.
        </p>
      )}

      {points.length >= 3 && (
        <div
          className="mt-4 flex items-start gap-3 border border-accent/40 bg-accent/10 p-5"
          data-testid="map-result"
        >
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <p className="font-display text-xl font-bold text-content">
              Roof approx. {roof} m²
            </p>
            <p className="mt-1 t-label text-content-faint">
              You traced {footprint} m² on the ground · pitch allowance ×{pitchFactor}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
