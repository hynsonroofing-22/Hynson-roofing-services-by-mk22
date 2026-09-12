import { useRef, useMemo, useLayoutEffect, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import * as THREE from "three";

/* ------------------------------------------------------------------ *
 * Hynson Roofing — scroll-driven ROOF build
 *
 * Client feedback on the original scene was that it "doesn't show the company
 * is a good roofing company" — it sold glazing, stairs and timber soffits.
 * This scene is only ever about the roof.
 *
 * It builds from nothing: bare wall plates, then trusses craned up one at a
 * time, purlins, underlay, long-run sheets laid one sheet at a time, ridge
 * cap, flashings, fascia and spouting. Eight stages, each named the way a
 * roofer would name it, in the order the work actually happens.
 *
 *   01  trusses            05  ridge cap
 *   02  purlins            06  barge + apron flashings
 *   03  roofing underlay   07  fascia + spouting
 *   04  long-run iron      08  finished (the only wide shot)
 *
 * Ranges here must stay in step with CHAPTERS in src/data/content.js.
 *
 * The backdrop is deliberately restrained: a graded sky and a low band of
 * distant roof silhouettes. It exists so the roof is not floating on a blank
 * page — not to be looked at. Anything busier competes with the subject.
 * ------------------------------------------------------------------ */

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const segT = (p, a, b) => THREE.MathUtils.smoothstep(clamp01((p - a) / (b - a)), 0, 1);

/* ----------------------------- palettes --------------------------- */
// three.js paints the canvas, so it cannot inherit the CSS theme. Both
// palettes are defined here and swapped whenever the site theme changes.

/**
 * Retuned when the page ground moved from warm cream to cool off-white.
 *
 * Two things were wrong with the old warm palette once the ground changed.
 * The obvious one is that it no longer matched the page — a cream scene inside
 * a cool grey page reads as a mistake. The less obvious and more damaging one
 * is that every tone in it sat within a few percent of every other: sky
 * #FBF6EC, ground #EDE8DE, wall #E4DED4. At stage one, when all that exists is
 * a few timber trusses, there was nothing for them to be seen against and the
 * scene looked broken rather than early.
 *
 * So this is cooler AND further apart. The sky and ground stay pale (they have
 * to — the headline is dark text sitting on top of them), the neighbouring
 * houses drop back, and the iron and flashings go properly dark so the roof
 * itself is unmistakably the subject. Timber stays warm, because timber is
 * warm and it is the only colour in the early stages.
 */
const LIGHT = {
  skyTop: "#D7DCE3",
  skyHorizon: "#F3F4F6", // the page's own ground, so the canvas has no seam
  ground: "#E2E6EB",
  distant: "#C3CAD3",
  wall: "#DADFE6",
  wallShade: "#C2C9D2",
  chimney: "#AEB6C1",
  timber: "#C08F5E",
  timberDeep: "#986E43",
  underlay: "#78848F",
  iron: "#39414A",
  flashing: "#464F59",
  fascia: "#272D34",
  rain: "#8EA3B6",
  fog: "#EDEFF3",
  ambient: 0.58,
  sun: 2.0,
  fill: 0.45,
  env: 0.5,
};

const DARK = {
  skyTop: "#101317",
  // A warm ember horizon rather than a neutral grey one — it ties the scene
  // to the brand orange without putting orange on the roof itself.
  skyHorizon: "#2E2117",
  ground: "#15171A",
  distant: "#1B1E22",
  wall: "#2B2E33",
  wallShade: "#232629",
  chimney: "#31343A",
  timber: "#A8845E",
  timberDeep: "#8A6A45",
  // Kept deliberately darker than it "should" be: lit by the sun and the
  // ambient together, a mid-grey underlay became the brightest thing in the
  // whole dark scene and pulled the eye off the iron going on above it.
  underlay: "#3E464C",
  // Lifted well above the light-mode value: near-black iron on a near-black
  // sky loses its edges entirely.
  iron: "#6B747D",
  flashing: "#7A838C",
  fascia: "#565E66",
  rain: "#BFD2E2",
  fog: "#1A1C20",
  ambient: 0.32,
  sun: 1.15,
  fill: 0.3,
  env: 0.22,
};

/* ------------------------- roof geometry -------------------------- */
// One gable roof. Everything is derived from these numbers, so the trusses,
// sheets, flashings, fascia and spouting can never drift apart.

const HX = 5.0; // half length, along the ridge
const HZ = 3.4; // half span, ridge to wall
const WALL_TOP = 2.6;
const PITCH = THREE.MathUtils.degToRad(22);
const EAVE_OVER = 0.55;
const BARGE_OVER = 0.35;

const RIDGE_Y = WALL_TOP + HZ * Math.tan(PITCH);
const EAVE_Z = HZ + EAVE_OVER;
const EAVE_Y = WALL_TOP - EAVE_OVER * Math.tan(PITCH);
const SLOPE_LEN = EAVE_Z / Math.cos(PITCH);
const ROOF_HALF_X = HX + BARGE_OVER;

// Sheets run past both ends of the rafters the way they actually do: over the
// apex so the ridge closes up, and past the fascia so water discharges into
// the spouting.
const SHEET_UP = 0.05;
const SHEET_DOWN = 0.09;
const SHEET_LEN = SLOPE_LEN + SHEET_UP + SHEET_DOWN;
const SHEET_MID = SLOPE_LEN / 2 - SHEET_UP / 2 + SHEET_DOWN / 2;

// Long-run is laid sheet by sheet, so the sheets are real objects rather than
// one big plane with ribs drawn on it.
const SHEET_COUNT = 12;
const SHEET_W = (ROOF_HALF_X * 2) / SHEET_COUNT;
const RIBS_PER_SHEET = 4;

const CH_X = 2.3;
const CH_Z = -1.35;
const CH_W = 0.85;
const CH_D = 0.7;

const TRUSS_X = [-4.4, -3.3, -2.2, -1.1, 0, 1.1, 2.2, 3.3, 4.4];
const PURLIN_D = [0.35, 1.15, 1.95, 2.75, 3.55, 4.2];

// Web brace, solved so both ends land on real members and it stays inside the
// truss triangle. An eyeballed length here pushed the brace straight through
// the roof and left timber sticking out of the finished iron.
const WEB = (() => {
  const footZ = HZ * 0.55;
  const headZ = HZ * 0.28;
  const footY = WALL_TOP;
  const headY = RIDGE_Y - headZ * Math.tan(PITCH);
  return {
    z: (footZ + headZ) / 2,
    y: (footY + headY) / 2,
    len: Math.hypot(footZ - headZ, headY - footY),
    tilt: Math.atan2(footZ - headZ, headY - footY),
  };
})();

/* --------------------------- materials ---------------------------- */

function useIronMaps() {
  return useMemo(() => {
    const loader = new THREE.TextureLoader();
    const load = (file, srgb) => {
      const t = loader.load(file);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1, 3);
      t.anisotropy = 8;
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    // Re-uses the metal maps already in public/textures — no new assets.
    return {
      map: load("/textures/roof-metal/albedo.jpg", true),
      normalMap: load("/textures/roof-metal/normal.jpg", false),
      roughnessMap: load("/textures/roof-metal/roughness.jpg", false),
    };
  }, []);
}

// Metalness stays well under 1. At 0.85 the sheets mirrored the sky and read
// as blue-black glass rather than Colorsteel.
const METAL = { metalness: 0.55, roughness: 0.42 };

/* ------------------------ reveal machinery ------------------------ */

function collectMaterials(root) {
  const found = [];
  root.traverse((o) => {
    if (!o.material) return;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      if (!found.includes(m)) found.push(m);
    });
  });
  return found;
}

function applyReveal(obj, mats, t, lift) {
  obj.visible = t > 0.002;
  if (!obj.visible) return;
  obj.position.y = obj.userData.baseY + (1 - t) * lift;
  for (let i = 0; i < mats.length; i++) {
    const m = mats[i];
    m.opacity = t;
    m.transparent = t < 0.995;
    m.depthWrite = t > 0.995;
  }
}


/**
 * Reveals a stage piece by piece — truss after truss, sheet after sheet.
 *
 * This is what makes the build read as work rather than as things switching
 * on. Each direct child gets its own window inside the stage, offset in order,
 * with the windows overlapping so the run stays continuous instead of ticking.
 *
 * Children are driven imperatively from one useFrame rather than each being a
 * component with its own hooks: there can be ~150 of them and a per-child
 * subscription each would cost far more than one loop.
 */
function StaggerLayer({ progress, from, to, lift = 0.7, windowFrac = 0.42, children }) {
  const ref = useRef(null);
  const items = useRef([]);

  useLayoutEffect(() => {
    items.current = ref.current.children.map((child) => {
      child.userData.baseY = child.position.y;
      return { obj: child, mats: collectMaterials(child) };
    });
  }, []);

  useFrame(() => {
    const list = items.current;
    const n = list.length;
    if (!n) return;
    const span = to - from;
    const win = span * windowFrac;
    const step = n > 1 ? (span - win) / (n - 1) : 0;
    const p = progress.current;
    for (let i = 0; i < n; i++) {
      const a = from + i * step;
      applyReveal(list[i].obj, list[i].mats, segT(p, a, a + win), lift);
    }
  });

  return <group ref={ref}>{children}</group>;
}

/**
 * Puts its children on one roof plane. A child at local (x, h, side * d) sits
 * `d` down the slope from the ridge and `h` clear of the roof surface.
 */
function RoofPlane({ side, children }) {
  return (
    <group position={[0, RIDGE_Y, 0]} rotation={[side * PITCH, 0, 0]}>
      {children}
    </group>
  );
}

/* ------------------------------ backdrop -------------------------- */

/**
 * Graded sky on the inside of a large sphere.
 *
 * A flat clear colour left the roof floating on a blank page. This gives the
 * scene a horizon to sit against and, in dark mode, a warm ember band that
 * ties back to the brand without putting orange anywhere near the roof.
 */
function SkyDome({ palette }) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 256;
    const ctx = c.getContext("2d");
    // Canvas row 0 maps to the top of the sphere.
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, palette.skyTop);
    g.addColorStop(0.42, palette.skyTop);
    g.addColorStop(0.52, palette.skyHorizon);
    g.addColorStop(0.58, palette.skyHorizon);
    g.addColorStop(1, palette.ground);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [palette]);

  useLayoutEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh scale={[-1, 1, 1]} renderOrder={-1}>
      <sphereGeometry args={[70, 24, 16]} />
      {/* Basic, not standard: the sky is a backdrop, it must not respond to
          the scene lights or it goes muddy. `fog={false}` keeps the fog from
          washing the gradient out at the horizon, which is the one place the
          gradient is doing work. */}
      <meshBasicMaterial map={texture} side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}

/**
 * A low band of simple gabled silhouettes on the horizon — the suburb the roof
 * sits in. Flat-shaded and fog-faded on purpose: it should read as depth at a
 * glance and survive no closer inspection than that.
 */
function DistantRoofs({ palette }) {
  const geometry = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1, 0);
    s.lineTo(1, 0);
    s.lineTo(1, 1.05);
    s.lineTo(0, 1.75);
    s.lineTo(-1, 1.05);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 2, bevelEnabled: false });
  }, []);

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);

  // Deterministic placement — a fixed skyline reads as a place, and a random
  // one would reshuffle on every mount.
  const houses = useMemo(() => {
    const out = [];
    const N = 22;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 + 0.21;
      const wobble = Math.sin(i * 12.9898) * 0.5;
      const r = 30 + wobble * 7;
      out.push({
        key: i,
        pos: [Math.sin(a) * r, 0, Math.cos(a) * r],
        rot: a + wobble * 0.6,
        scale: 1.5 + Math.abs(wobble) * 1.5,
      });
    }
    return out;
  }, []);

  return (
    <group>
      {houses.map((h) => (
        <mesh
          key={h.key}
          geometry={geometry}
          position={h.pos}
          rotation={[0, h.rot, 0]}
          scale={h.scale}
        >
          <meshBasicMaterial color={palette.distant} />
        </mesh>
      ))}
    </group>
  );
}

function Ground({ palette }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <circleGeometry args={[46, 48]} />
      <meshStandardMaterial color={palette.ground} roughness={1} />
    </mesh>
  );
}

/* ------------------------------ stages ---------------------------- */

function Trusses({ progress, palette }) {
  return (
    // Starts at exactly 0 — the build genuinely begins from nothing but wall
    // plates, and the trusses go up one at a time from one end.
    <StaggerLayer progress={progress} from={0} to={0.12} lift={1.6} windowFrac={0.34}>
      {TRUSS_X.map((x) => (
        <group key={x}>
          {/* bottom chord — the ceiling line */}
          <mesh position={[x, WALL_TOP + 0.07, 0]} castShadow>
            <boxGeometry args={[0.09, 0.14, HZ * 2]} />
            <meshStandardMaterial color={palette.timberDeep} roughness={0.85} />
          </mesh>
          {/* king post */}
          <mesh position={[x, (WALL_TOP + RIDGE_Y) / 2 + 0.07, 0]}>
            <boxGeometry args={[0.08, RIDGE_Y - WALL_TOP, 0.09]} />
            <meshStandardMaterial color={palette.timberDeep} roughness={0.85} />
          </mesh>
          {[1, -1].map((s) => (
            <group key={s}>
              <RoofPlane side={s}>
                {/* Stops short of the eave so the fascia covers the cut ends. */}
                <mesh position={[x, -0.08, s * ((SLOPE_LEN - 0.1) / 2)]} castShadow>
                  <boxGeometry args={[0.09, 0.16, SLOPE_LEN - 0.1]} />
                  <meshStandardMaterial color={palette.timber} roughness={0.8} />
                </mesh>
              </RoofPlane>
              <mesh position={[x, WEB.y, s * WEB.z]} rotation={[-s * WEB.tilt, 0, 0]}>
                <boxGeometry args={[0.07, WEB.len, 0.1]} />
                <meshStandardMaterial color={palette.timberDeep} roughness={0.85} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </StaggerLayer>
  );
}

function Purlins({ progress, palette }) {
  // Ordered ridge-downwards on both planes so the rows march down the roof.
  const rows = [];
  PURLIN_D.forEach((d) => {
    [1, -1].forEach((s) => rows.push({ d, s }));
  });
  return (
    <StaggerLayer progress={progress} from={0.12} to={0.24} lift={0.8} windowFrac={0.45}>
      {rows.map(({ d, s }) => (
        <group key={`${d}-${s}`}>
          <RoofPlane side={s}>
            <mesh position={[0, 0.09, s * d]} castShadow>
              <boxGeometry args={[ROOF_HALF_X * 2, 0.09, 0.07]} />
              <meshStandardMaterial color={palette.timber} roughness={0.8} />
            </mesh>
          </RoofPlane>
        </group>
      ))}
    </StaggerLayer>
  );
}

function Underlay({ progress, palette }) {
  // Four bands per plane, lapped down the fall, so it unrolls rather than
  // appearing all at once.
  const bands = [];
  [1, -1].forEach((s) => {
    for (let i = 0; i < 4; i++) bands.push({ s, i });
  });
  const bandLen = SLOPE_LEN / 4;
  return (
    <StaggerLayer progress={progress} from={0.24} to={0.36} lift={0.5} windowFrac={0.5}>
      {bands.map(({ s, i }) => (
        <group key={`${s}-${i}`}>
          <RoofPlane side={s}>
            <mesh
              position={[0, 0.15, s * (bandLen * i + bandLen / 2)]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[ROOF_HALF_X * 2, bandLen * 1.04]} />
              <meshStandardMaterial
                color={palette.underlay}
                roughness={0.95}
                metalness={0}
                side={THREE.DoubleSide}
              />
            </mesh>
          </RoofPlane>
        </group>
      ))}
    </StaggerLayer>
  );
}

function LongRunIron({ progress, palette }) {
  const maps = useIronMaps();
  // Interleave the two planes so sheets go down alternately either side of the
  // ridge, which is both how it is done and more interesting to watch.
  const sheets = [];
  for (let i = 0; i < SHEET_COUNT; i++) {
    [1, -1].forEach((s) => sheets.push({ i, s }));
  }
  return (
    <StaggerLayer progress={progress} from={0.36} to={0.52} lift={0.6} windowFrac={0.34}>
      {sheets.map(({ i, s }) => {
        const x0 = -ROOF_HALF_X + SHEET_W * (i + 0.5);
        return (
          <group key={`${i}-${s}`}>
            <RoofPlane side={s}>
              <mesh position={[x0, 0.19, s * SHEET_MID]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[SHEET_W, SHEET_LEN]} />
                <meshStandardMaterial
                  {...maps}
                  color={palette.iron}
                  {...METAL}
                  side={THREE.DoubleSide}
                />
              </mesh>
              {Array.from({ length: RIBS_PER_SHEET }, (_, r) => (
                <mesh
                  key={r}
                  position={[
                    x0 - SHEET_W / 2 + (SHEET_W / RIBS_PER_SHEET) * (r + 0.5),
                    0.215,
                    s * SHEET_MID,
                  ]}
                  castShadow
                >
                  <boxGeometry args={[0.05, 0.05, SHEET_LEN]} />
                  <meshStandardMaterial color={palette.iron} {...METAL} />
                </mesh>
              ))}
            </RoofPlane>
          </group>
        );
      })}
    </StaggerLayer>
  );
}

function RidgeCap({ progress, palette }) {
  // Six lengths of capping run out along the ridge, end to end.
  const lengths = [];
  for (let i = 0; i < 6; i++) [1, -1].forEach((s) => lengths.push({ i, s }));
  const capW = (ROOF_HALF_X * 2) / 6;
  return (
    <StaggerLayer progress={progress} from={0.52} to={0.62} lift={0.45} windowFrac={0.5}>
      {lengths.map(({ i, s }) => (
        <group key={`${i}-${s}`}>
          <RoofPlane side={s}>
            <mesh
              position={[-ROOF_HALF_X + capW * (i + 0.5), 0.26, s * 0.2]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[capW * 1.02, 0.42]} />
              <meshStandardMaterial
                color={palette.flashing}
                {...METAL}
                side={THREE.DoubleSide}
              />
            </mesh>
          </RoofPlane>
        </group>
      ))}
    </StaggerLayer>
  );
}

function Flashings({ progress, palette }) {
  const parts = [];
  [1, -1].forEach((s) =>
    [1, -1].forEach((ex) => parts.push({ kind: "barge", s, ex }))
  );
  parts.push({ kind: "apron" });

  return (
    <StaggerLayer progress={progress} from={0.62} to={0.74} lift={0.4} windowFrac={0.55}>
      {parts.map((p) =>
        p.kind === "barge" ? (
          <group key={`barge-${p.s}-${p.ex}`}>
            <RoofPlane side={p.s}>
              {/* Runs the full length of the sheets it caps, not the rafters. */}
              <group position={[p.ex * ROOF_HALF_X, 0.24, p.s * SHEET_MID]}>
                <mesh>
                  <boxGeometry args={[0.16, 0.03, SHEET_LEN]} />
                  <meshStandardMaterial color={palette.flashing} {...METAL} />
                </mesh>
                {/* the turned-down return */}
                <mesh position={[p.ex * 0.075, -0.09, 0]}>
                  <boxGeometry args={[0.03, 0.18, SHEET_LEN]} />
                  <meshStandardMaterial color={palette.flashing} {...METAL} />
                </mesh>
              </group>
            </RoofPlane>
          </group>
        ) : (
          // Apron across the upslope face of the chimney with soakers returning
          // up each side — the detail a roofer looks for first.
          <group key="apron">
            <RoofPlane side={-1}>
              <group
                position={[CH_X, 0.24, -(Math.abs(CH_Z) + CH_D / 2) / Math.cos(PITCH)]}
              >
                <mesh>
                  <boxGeometry args={[CH_W + 0.34, 0.03, 0.3]} />
                  <meshStandardMaterial color={palette.flashing} {...METAL} />
                </mesh>
                <mesh position={[0, 0.11, -0.14]}>
                  <boxGeometry args={[CH_W + 0.34, 0.22, 0.03]} />
                  <meshStandardMaterial color={palette.flashing} {...METAL} />
                </mesh>
              </group>
            </RoofPlane>
          </group>
        )
      )}
    </StaggerLayer>
  );
}

function FasciaAndSpouting({ progress, palette }) {
  const parts = [];
  [1, -1].forEach((s) => parts.push({ kind: "fascia", s }));
  [1, -1].forEach((s) => parts.push({ kind: "spout", s }));
  parts.push({ kind: "downpipe" });

  return (
    <StaggerLayer progress={progress} from={0.74} to={0.84} lift={0.55} windowFrac={0.5}>
      {parts.map((p) => {
        if (p.kind === "fascia") {
          return (
            <group key={`fascia-${p.s}`}>
              {/* Deep enough to close the eave off completely from below. */}
              <mesh position={[0, EAVE_Y - 0.15, p.s * (EAVE_Z + 0.02)]} castShadow>
                <boxGeometry args={[ROOF_HALF_X * 2, 0.3, 0.05]} />
                <meshStandardMaterial color={palette.fascia} roughness={0.55} metalness={0.1} />
              </mesh>
            </group>
          );
        }
        if (p.kind === "spout") {
          return (
            <group key={`spout-${p.s}`}>
              <mesh
                position={[0, EAVE_Y - 0.2, p.s * (EAVE_Z + 0.09)]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry
                  args={[0.085, 0.085, ROOF_HALF_X * 2, 18, 1, true, 0, Math.PI]}
                />
                <meshStandardMaterial
                  color={palette.fascia}
                  roughness={0.5}
                  metalness={0.2}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          );
        }
        return (
          <group key="downpipe">
            <mesh position={[ROOF_HALF_X - 0.18, (EAVE_Y - 0.2) / 2, EAVE_Z + 0.09]}>
              <cylinderGeometry args={[0.055, 0.055, EAVE_Y - 0.2, 14]} />
              <meshStandardMaterial color={palette.fascia} roughness={0.5} metalness={0.2} />
            </mesh>
          </group>
        );
      })}
    </StaggerLayer>
  );
}

/* --------------------------- the house ---------------------------- */

function GableEnd({ x, palette }) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-HZ, 0);
    shape.lineTo(HZ, 0);
    shape.lineTo(0, HZ * Math.tan(PITCH));
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: 0.18, bevelEnabled: false });
  }, []);
  useLayoutEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} position={[x, WALL_TOP, 0]} rotation={[0, Math.PI / 2, 0]}>
      <meshStandardMaterial color={palette.wallShade} roughness={0.9} />
    </mesh>
  );
}

/** Deliberately plain. The house is context; the roof is the subject. */
function House({ palette }) {
  return (
    <group>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, WALL_TOP / 2, s * HZ]} receiveShadow>
          <boxGeometry args={[HX * 2, WALL_TOP, 0.2]} />
          <meshStandardMaterial color={palette.wall} roughness={0.9} />
        </mesh>
      ))}
      {[1, -1].map((s) => (
        <mesh key={s} position={[s * HX, WALL_TOP / 2, 0]} receiveShadow>
          <boxGeometry args={[0.2, WALL_TOP, HZ * 2]} />
          <meshStandardMaterial color={palette.wallShade} roughness={0.9} />
        </mesh>
      ))}
      <GableEnd x={HX} palette={palette} />
      <GableEnd x={-HX} palette={palette} />

      {/* Wall plates. Present from the very first frame so "zero" still reads
          as a roof about to be built rather than an empty box. */}
      {[1, -1].map((s) => (
        <mesh key={`plate${s}`} position={[0, WALL_TOP + 0.05, s * HZ]} castShadow>
          <boxGeometry args={[HX * 2, 0.1, 0.22]} />
          <meshStandardMaterial color={palette.timberDeep} roughness={0.85} />
        </mesh>
      ))}

      {/* Chimney — exists so the apron flashing has something to flash to.
          Kept low and muted: taller and lighter, it read as a floating white
          box competing with the roof. */}
      <mesh position={[CH_X, WALL_TOP + 0.95, CH_Z]} castShadow>
        <boxGeometry args={[CH_W, 2.0, CH_D]} />
        <meshStandardMaterial color={palette.chimney} roughness={0.95} />
      </mesh>
    </group>
  );
}

/* --------------------------- weather beat ------------------------- */

const RAIN_COUNT = 420;
const RAIN_BOX = { x: 15, y: 15, z: 15 };
const RAIN_LEN = 0.9;
const RAIN_SLANT = 0.34; // wind, so it reads as a southerly rather than drizzle

/**
 * The closing beat: the finished roof takes Auckland weather.
 *
 * This is the argument the rest of the animation is building to — anyone can
 * photograph a finished roof, but the laps, the flashings and the ridge line
 * are what decide whether it still works in a southerly. Showing the roof
 * being tested says that faster than a paragraph of copy.
 *
 * Built as ONE LineSegments so it is a single draw call, and the position
 * buffer is written in place each frame — no per-drop objects, no allocation
 * in the loop. It is also fully skipped (visible = false, no buffer work)
 * outside its own slice of the scroll, so it costs nothing for the other 90%
 * of the build. Rain that stutters would argue the opposite of the point.
 */
function WeatherBeat({ progress, from, to, palette }) {
  const lines = useRef(null);
  const mat = useRef(null);

  const { geometry, seeds } = useMemo(() => {
    const positions = new Float32Array(RAIN_COUNT * 6);
    const s = new Float32Array(RAIN_COUNT * 3);
    for (let i = 0; i < RAIN_COUNT; i++) {
      s[i * 3] = (Math.random() - 0.5) * RAIN_BOX.x * 2;
      s[i * 3 + 1] = Math.random() * RAIN_BOX.y;
      s[i * 3 + 2] = (Math.random() - 0.5) * RAIN_BOX.z * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geometry: g, seeds: s };
  }, []);

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    const t = segT(progress.current, from, to);
    const obj = lines.current;
    if (!obj) return;
    obj.visible = t > 0.01;
    if (!obj.visible) return;

    mat.current.opacity = t * 0.55;

    const pos = geometry.attributes.position.array;
    // Cap the step so a tab that was backgrounded doesn't teleport the rain.
    const fall = Math.min(delta, 0.05) * 16;
    for (let i = 0; i < RAIN_COUNT; i++) {
      let y = seeds[i * 3 + 1] - fall;
      if (y < 0) y += RAIN_BOX.y;
      seeds[i * 3 + 1] = y;

      const x = seeds[i * 3];
      const z = seeds[i * 3 + 2];
      const o = i * 6;
      pos[o] = x;
      pos[o + 1] = y;
      pos[o + 2] = z;
      pos[o + 3] = x + RAIN_LEN * RAIN_SLANT;
      pos[o + 4] = y - RAIN_LEN;
      pos[o + 5] = z;
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={lines} geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial
        ref={mat}
        color={palette.rain}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </lineSegments>
  );
}

/* ------------------------------ camera ---------------------------- */
// Close for the whole build so the roof fills the frame, then one wide shot at
// the end. `lookY` stays up near the roof so the house never becomes the
// subject.

const SHOTS = [
  { at: 0.0, angle: 0.55, radius: 11.2, height: 5.9, lookY: 3.3 },
  { at: 0.2, angle: 0.85, radius: 10.5, height: 6.1, lookY: 3.3 },
  { at: 0.36, angle: 1.15, radius: 9.9, height: 6.4, lookY: 3.4 },
  { at: 0.52, angle: 1.5, radius: 9.2, height: 6.4, lookY: 3.4 },
  { at: 0.64, angle: 1.85, radius: 8.7, height: 6.9, lookY: 3.7 }, // ridge
  { at: 0.76, angle: 2.25, radius: 8.9, height: 6.2, lookY: 3.4 }, // flashings
  { at: 0.84, angle: 2.6, radius: 9.2, height: 3.8, lookY: 2.8 }, // eave line
  { at: 0.92, angle: 2.95, radius: 18.0, height: 8.0, lookY: 2.7 }, // wide
  { at: 1.0, angle: 3.25, radius: 15.5, height: 6.8, lookY: 2.9 }, // weather
];

function CameraRig({ progress }) {
  const target = useRef(new THREE.Vector3(0, 3.3, 0));
  const want = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());

  useFrame(({ camera }, delta) => {
    const p = clamp01(progress.current);
    let i = 0;
    while (i < SHOTS.length - 2 && p > SHOTS[i + 1].at) i++;
    const a = SHOTS[i];
    const b = SHOTS[i + 1];
    const e = THREE.MathUtils.smoothstep(clamp01((p - a.at) / (b.at - a.at)), 0, 1);

    const angle = THREE.MathUtils.lerp(a.angle, b.angle, e);
    const radius = THREE.MathUtils.lerp(a.radius, b.radius, e);
    const height = THREE.MathUtils.lerp(a.height, b.height, e);
    const lookY = THREE.MathUtils.lerp(a.lookY, b.lookY, e);

    want.current.set(Math.sin(angle) * radius, height, Math.cos(angle) * radius);
    lookAt.current.set(0, lookY, 0);

    // Frame-rate independent easing: smooth without letting the camera snap
    // when the scroll jumps (skip intro, anchor links).
    const k = 1 - Math.pow(0.0015, delta);
    camera.position.lerp(want.current, k);
    target.current.lerp(lookAt.current, k);
    camera.lookAt(target.current);
  });

  return null;
}

/* ---------------------------- lighting ---------------------------- */

function Lighting({ palette }) {
  const sun = useRef(null);
  useLayoutEffect(() => {
    const l = sun.current;
    if (!l) return;
    l.shadow.mapSize.set(1024, 1024);
    const c = l.shadow.camera;
    c.left = -14;
    c.right = 14;
    c.top = 14;
    c.bottom = -14;
    c.near = 1;
    c.far = 40;
    c.updateProjectionMatrix();
  }, []);

  return (
    <>
      <ambientLight intensity={palette.ambient} />
      <directionalLight
        ref={sun}
        position={[7, 12, 6]}
        intensity={palette.sun}
        castShadow
        shadow-bias={-0.0006}
      />
      {/* soft fill from the opposite side so the shaded roof plane still reads */}
      <directionalLight position={[-8, 6, -5]} intensity={palette.fill} />
    </>
  );
}

/* ------------------------------ scene ----------------------------- */

export default function RoofScene({ progress, dark = false }) {
  const palette = dark ? DARK : LIGHT;

  return (
    <>
      {/* Fog matches the sky's horizon band, so the distant roofline dissolves
          into it instead of ending on a hard edge. */}
      <fog attach="fog" args={[palette.fog, 34, 78]} />
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      {/* Image-based lighting is what stops the long-run iron reading as flat
          grey plastic. It MUST have its own Suspense boundary: the HDRI is
          ~1.4MB and suspends whatever boundary contains it, and without this
          the whole scene — including the background — was suspended and the
          canvas cleared to black before snapping in. */}
      <Suspense fallback={null}>
        <Environment
          files="/hdri/kloofendal_43d_clear_1k.hdr"
          background={false}
          environmentIntensity={palette.env}
        />
      </Suspense>

      <Lighting palette={palette} />
      <SkyDome palette={palette} />
      <DistantRoofs palette={palette} />
      <Ground palette={palette} />
      <House palette={palette} />

      <Trusses progress={progress} palette={palette} />
      <Purlins progress={progress} palette={palette} />
      <Underlay progress={progress} palette={palette} />
      <LongRunIron progress={progress} palette={palette} />
      <RidgeCap progress={progress} palette={palette} />
      <Flashings progress={progress} palette={palette} />
      <FasciaAndSpouting progress={progress} palette={palette} />

      <WeatherBeat progress={progress} from={0.92} to={0.99} palette={palette} />

      <CameraRig progress={progress} />
    </>
  );
}
