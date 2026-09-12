import { useRef, useMemo, useLayoutEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import * as THREE from "three";

/* ------------------------------------------------------------------ *
 * Hynson Roofing — scroll-driven house build
 *
 * Look reference: @elyptwebdesign "Built from the ground up" (VESTA).
 * Modern architectural home on a seamless white studio backdrop —
 * thin charcoal roof edge, warm timber soffit with downlights,
 * floor-to-ceiling glazing, warm interior visible through the glass.
 * The camera barely moves; the building assembles in place.
 *
 * Phases match CHAPTERS in src/data/content.js:
 *   01  0.00 - 0.20   ground & foundation   podium, footings, terrace
 *   02  0.20 - 0.45   steel & timber framing columns, slabs, stair
 *   03  0.45 - 0.70   wrap & wall cladding   glazing, battens, walls
 *   04  0.70 - 0.90   long-run roof assembly THE ROOF — the hero beat
 *   05  0.90 - 1.00   finished               interior, lights, planting
 *
 * All surface detail is generated procedurally at runtime, so there are
 * no texture files to ship or keep in sync.
 * ------------------------------------------------------------------ */

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const segT = (p, a, b) => THREE.MathUtils.smoothstep(clamp01((p - a) / (b - a)), 0, 1);

/* ---------------------------- palette ---------------------------- */

const CHARCOAL = "#2B2B2E";
const CHARCOAL_SOFT = "#3A3A3E";
const TIMBER = "#C79A62";
const TIMBER_DEEP = "#9A6F41";
const CONCRETE = "#C8C4BC";
const CONCRETE_DARK = "#ABA69C";
const PLASTER = "#EDE9E1";
const GLASS = "#D9E4E2";
const STEEL = "#8F9499";
const GLOW = "#FFC98A";

/* ------------------- geometry constants (metres) ------------------ */

const HX = 4.0; // half width
const HZ = 2.6; // half depth
const GF_Y = 0.0; // ground floor level
const GF_H = 2.5;
const MID_Y = GF_Y + GF_H; // 2.5
const SLAB_T = 0.22;
const UF_Y = MID_Y + SLAB_T; // 2.72
const UF_H = 2.5;
const ROOF_Y = UF_Y + UF_H; // 5.22
const ROOF_PITCH = 0.075; // gentle skillion
const BAND_H = 1.25;

/* ------------------------- procedural maps ------------------------ */

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(seed, grid) {
  const rnd = mulberry32(seed);
  const g = new Float32Array((grid + 1) * (grid + 1));
  for (let i = 0; i < g.length; i++) g[i] = rnd();
  return (u, v) => {
    const x = u * grid;
    const y = v * grid;
    const x0 = Math.floor(x) % grid;
    const y0 = Math.floor(y) % grid;
    const x1 = (x0 + 1) % grid;
    const y1 = (y0 + 1) % grid;
    const fx = x - Math.floor(x);
    const fy = y - Math.floor(y);
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const a = g[y0 * (grid + 1) + x0];
    const b = g[y0 * (grid + 1) + x1];
    const c = g[y1 * (grid + 1) + x0];
    const d = g[y1 * (grid + 1) + x1];
    return (a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy;
  };
}

function fbm(seed) {
  const o1 = makeNoise(seed, 4);
  const o2 = makeNoise(seed + 91, 8);
  const o3 = makeNoise(seed + 733, 16);
  const o4 = makeNoise(seed + 2311, 32);
  return (u, v) => o1(u, v) * 0.5 + o2(u, v) * 0.26 + o3(u, v) * 0.16 + o4(u, v) * 0.08;
}

const _texCache = new Map();

function tex(key, draw, opts) {
  if (_texCache.has(key)) return _texCache.get(key);
  const o = opts || {};
  const size = o.size || 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  draw(canvas.getContext("2d"), size);
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(o.repeat ? o.repeat[0] : 1, o.repeat ? o.repeat[1] : 1);
  t.anisotropy = 8;
  if (o.srgb) t.colorSpace = THREE.SRGBColorSpace;
  _texCache.set(key, t);
  return t;
}

function paintNoise(ctx, size, seed, stops, scale) {
  const n = fbm(seed);
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = clamp01(n((x / size) * (scale || 1), (y / size) * (scale || 1)));
      const c = stops(v, x / size, y / size);
      const i = (y * size + x) * 4;
      img.data[i] = c[0];
      img.data[i + 1] = c[1];
      img.data[i + 2] = c[2];
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

const plasterBump = () =>
  tex("plasterBump", (ctx, s) => {
    paintNoise(ctx, s, 77, (v) => {
      const k = 255 * (0.44 + v * 0.4);
      return [k, k, k];
    });
  });

/* --------------------- real PBR textures (Phase B) ----------------- *
 * CC0 photographed material sets (ambientCG), self-hosted under
 * public/textures/<material>/. Loaded with a plain THREE.TextureLoader
 * (not drei's useTexture) so no Suspense boundary is required around
 * the scene — mirrors the same load-once module cache pattern as the
 * procedural tex() helper above.
 * ------------------------------------------------------------------ */

const _fileLoader = new THREE.TextureLoader();
const _fileTexCache = new Map();

function fileTex(url, { srgb = false, repeat = [1, 1], anisotropy = 8 } = {}) {
  const key = `${url}|${repeat[0]}x${repeat[1]}|${srgb}`;
  if (_fileTexCache.has(key)) return _fileTexCache.get(key);
  const t = _fileLoader.load(url);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = anisotropy;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  _fileTexCache.set(key, t);
  return t;
}

/** Photographed board-formed concrete — podium, slabs, steps, planters. */
const realConcreteMat = (repeat, extra) => ({
  map: fileTex("/textures/concrete/albedo.jpg", { srgb: true, repeat }),
  normalMap: fileTex("/textures/concrete/normal.jpg", { repeat }),
  roughnessMap: fileTex("/textures/concrete/roughness.jpg", { repeat }),
  normalScale: new THREE.Vector2(0.7, 0.7),
  color: "#ffffff",
  roughness: 1,
  metalness: 0,
  ...(extra || {}),
});

/** Photographed warm oak — soffit, stair treads, batten screens, interior. */
const realOakMat = (repeat, extra) => ({
  map: fileTex("/textures/oak/albedo.jpg", { srgb: true, repeat }),
  normalMap: fileTex("/textures/oak/normal.jpg", { repeat }),
  roughnessMap: fileTex("/textures/oak/roughness.jpg", { repeat }),
  normalScale: new THREE.Vector2(0.6, 0.6),
  color: "#ffffff",
  roughness: 1,
  metalness: 0,
  ...(extra || {}),
});

/** Photographed powder-coated black steel — the roof, the hero material. */
const realRoofMetalMat = (repeat, extra) => ({
  map: fileTex("/textures/roof-metal/albedo.jpg", { srgb: true, repeat }),
  normalMap: fileTex("/textures/roof-metal/normal.jpg", { repeat }),
  roughnessMap: fileTex("/textures/roof-metal/roughness.jpg", { repeat }),
  normalScale: new THREE.Vector2(0.8, 0.8),
  color: "#3A3A3E",
  roughness: 1,
  metalness: 0.6,
  envMapIntensity: 1.2,
  ...(extra || {}),
});

/** Photographed lawn grass — the final-phase ground plane. */
const realGrassMat = (repeat, extra) => ({
  map: fileTex("/textures/grass/albedo.jpg", { srgb: true, repeat }),
  normalMap: fileTex("/textures/grass/normal.jpg", { repeat }),
  roughnessMap: fileTex("/textures/grass/roughness.jpg", { repeat }),
  normalScale: new THREE.Vector2(0.8, 0.8),
  color: "#ffffff",
  roughness: 1,
  metalness: 0,
  ...(extra || {}),
});

/* ------------------------ material helpers ------------------------ */

const timberMat = (extra) => realOakMat([1.4, 1.4], extra);

const battenMat = (extra) => realOakMat([0.6, 1.6], extra);

const concreteMat = (extra) => realConcreteMat([1.6, 1.6], extra);

const charcoalMat = (extra) => ({
  color: CHARCOAL,
  roughness: 0.42,
  metalness: 0.55,
  envMapIntensity: 1.15,
  ...(extra || {}),
});

/* ----------------------------- Rise ------------------------------- */
/**
 * Fades + lifts a group into place across a scroll range.
 * Remembers each material's own opacity so glass stays glass, and returns
 * to fully opaque rendering once the stage has landed.
 */
export function Rise({ progress, range, drop = 2.5, children }) {
  const ref = useRef();
  const mats = useRef(null);
  const settled = useRef(null);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;

    if (mats.current === null) {
      const found = [];
      g.traverse((o) => {
        if (!o.isMesh) return;
        const list = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of list) {
          if (m) found.push({ m, base: m.opacity, tr: m.transparent, dw: m.depthWrite });
        }
      });
      mats.current = found;
    }

    const t = segT(progress.current, range[0], range[1]);
    g.visible = t > 0.002;
    g.position.y = -(1 - t) * drop;

    const done = t > 0.999;
    if (done && settled.current === true) return;
    settled.current = done;

    for (const e of mats.current) {
      e.m.transparent = done ? e.tr : true;
      e.m.opacity = done ? e.base : e.base * t;
      e.m.depthWrite = done ? e.dw : false;
    }
  });

  return <group ref={ref}>{children}</group>;
}

/* --------------------------- camera rig --------------------------- */
/**
 * A deliberate journey in four waypoints (angle, radius, height, lookY),
 * not one continuous formula:
 *   START  — low and close, following the early build
 *   MID    — still low, pulled back slightly as cladding finishes
 *   ROOF   — rises up and angles down onto the roof, the hero moment
 *   FINAL  — pulls back wide to a proper three-quarter architectural shot
 *
 * Framed wider throughout than the old rig (larger radius) so there's air
 * around the house, not a close product shot.
 */
const CAM_START = { angle: 0.6, radius: 14.5, height: 3.2, lookY: 1.2 };
const CAM_MID = { angle: 0.82, radius: 16.5, height: 4.4, lookY: 2.2 };
const CAM_ROOF = { angle: 0.95, radius: 13.5, height: 10.8, lookY: ROOF_Y + 0.2 };
const CAM_FINAL = { angle: 1.05, radius: 23, height: 7.2, lookY: 2.6 };

function lerpWaypoint(a, b, t) {
  return {
    angle: THREE.MathUtils.lerp(a.angle, b.angle, t),
    radius: THREE.MathUtils.lerp(a.radius, b.radius, t),
    height: THREE.MathUtils.lerp(a.height, b.height, t),
    lookY: THREE.MathUtils.lerp(a.lookY, b.lookY, t),
  };
}

function CameraRig({ progress }) {
  const want = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  const lookNow = useRef(new THREE.Vector3(0, 1.2, 0));

  useFrame(({ camera, clock }, delta) => {
    const p = clamp01(progress.current);
    const t = clock.getElapsedTime();

    let wp;
    if (p < 0.65) wp = lerpWaypoint(CAM_START, CAM_MID, segT(p, 0, 0.65));
    else if (p < 0.85) wp = lerpWaypoint(CAM_MID, CAM_ROOF, segT(p, 0.65, 0.85));
    else wp = lerpWaypoint(CAM_ROOF, CAM_FINAL, segT(p, 0.85, 1.0));

    const angle = wp.angle + Math.sin(t * 0.1) * 0.018;
    const height = wp.height + Math.sin(t * 0.14) * 0.04;

    want.current.set(Math.sin(angle) * wp.radius, height, Math.cos(angle) * wp.radius);
    camera.position.lerp(want.current, 1 - Math.pow(0.0015, delta));

    look.current.set(0, wp.lookY, 0);
    lookNow.current.lerp(look.current, 1 - Math.pow(0.003, delta));
    camera.lookAt(lookNow.current);
  });
  return null;
}

/* ------------------------- render settings ------------------------ */

function RenderSettings() {
  const gl = useThree((s) => s.gl);
  useLayoutEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.0;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [gl]);
  return null;
}

/* ------------------------------ lighting ----------------------------- *
 * Flat, static, soft and even on purpose — the client explicitly does not
 * want photorealism, dusk/golden-hour, or harsh contrast here. One clean
 * light rig, no per-frame colour animation, no useFrame needed at all.
 * ---------------------------------------------------------------------- */
function Lighting() {
  return (
    <>
      <hemisphereLight args={["#FFFFFF", "#E4E1D8", 0.55]} />
      <ambientLight intensity={0.35} color="#FFFFFF" />
      <directionalLight
        castShadow
        position={[10, 14, 8]}
        intensity={1.5}
        color="#FFFFFF"
        shadow-mapSize={[1024, 1024]}
        shadow-radius={5}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-9, 8, -6]} intensity={0.6} color="#FFFFFF" />
    </>
  );
}

/* ----------------------------- grass field ---------------------------- *
 * Minimal on purpose — "just a subtle hint at the base of the house," not
 * a lawn. Small count, tight radius, cheap.
 * ------------------------------------------------------------------ */
const GRASS_COUNT = 650;
// Clears the podium/terrace footprint (it extends to ~6.7 units out) so
// blades start beyond the concrete edge, not through it.
const GRASS_INNER = 7.3;
const GRASS_OUTER = 12;
const GRASS_Y = -0.7; // matches GrassGround — well below every terrace step

function GrassField() {
  const meshRef = useRef();
  const shaderRef = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const blades = useMemo(() => {
    const rnd = mulberry32(9001);
    const out = [];
    for (let i = 0; i < GRASS_COUNT; i++) {
      const a = rnd() * Math.PI * 2;
      const r = GRASS_INNER + Math.pow(rnd(), 1.7) * (GRASS_OUTER - GRASS_INNER);
      out.push({
        x: Math.sin(a) * r,
        z: Math.cos(a) * r,
        h: 0.16 + rnd() * 0.16,
        tilt: (rnd() - 0.5) * 0.55,
        rot: rnd() * Math.PI * 2,
        shade: 0.72 + rnd() * 0.5,
      });
    }
    return out;
  }, []);

  const bladeGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.055, 1, 1, 3);
    g.translate(0, 0.5, 0);
    return g;
  }, []);

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.7, metalness: 0, side: THREE.DoubleSide });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.vertexShader =
        `uniform float uTime;\n` +
        shader.vertexShader.replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          float sway = sin(uTime * 0.9 + instanceMatrix[3].x * 0.35) * 0.035 * position.y;
          transformed.x += sway;`
        );
      shaderRef.current = shader;
    };
    return m;
  }, []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const grassColor = new THREE.Color("#69974A");
    const c = new THREE.Color();
    for (let i = 0; i < blades.length; i++) {
      const b = blades[i];
      dummy.position.set(b.x, GRASS_Y, b.z);
      dummy.rotation.set(0, b.rot, b.tilt);
      dummy.scale.set(1, b.h, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      c.copy(grassColor).multiplyScalar(b.shade * 0.9 + 0.25);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [blades, dummy]);

  useFrame(({ clock }) => {
    if (shaderRef.current) shaderRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return <instancedMesh ref={meshRef} args={[bladeGeo, material, GRASS_COUNT]} castShadow receiveShadow />;
}

/* ------------------------- ground plane + path ------------------------- */

const _fadeTexCache = new Map();
/** A soft white-to-black radial gradient used as an alphaMap so the grass
 *  disc dissolves gradually into the haze at its edge instead of ending
 *  in a hard circle. The fade starts early (0.22 of the radius) and
 *  finishes late (0.5), a much longer transition than a typical vignette,
 *  so the edge reads as an open field trailing off rather than a coin. */
function radialFadeTex() {
  if (_fadeTexCache.has("ground")) return _fadeTexCache.get("ground");
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size * 0.5);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(1, "#000000");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(canvas);
  _fadeTexCache.set("ground", t);
  return t;
}

/** A hint of grass at the base of the house, faded softly at the edges —
 *  wider than the original tight little disc (which read as an obvious
 *  circular "coin" of turf) but still finite, not a wide lawn stretching
 *  to a false horizon. */
function GrassGround() {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
      <circleGeometry args={[13.5, 48]} />
      <meshStandardMaterial {...realGrassMat([6.75, 6.75], { color: "#A9C286", alphaMap: radialFadeTex(), transparent: true })} />
    </mesh>
  );
}

const SITE_START = 0.0;
const SITE_END = 0.12;

function LandscapeReveal({ progress }) {
  return (
    <Rise progress={progress} range={[SITE_START, SITE_END]} drop={0}>
      <GrassGround />
      <GrassField />
    </Rise>
  );
}

/* --------------------------- phase 01 ----------------------------- */

function Podium({ progress }) {
  const footings = useMemo(() => {
    const out = [];
    [-HX + 0.3, 0, HX - 0.3].forEach((x) => [-HZ + 0.3, HZ - 0.3].forEach((z) => out.push([x, z])));
    return out;
  }, []);

  return (
    <Rise progress={progress} range={[0.02, 0.18]} drop={0.9}>
      {/* stepped terrace the whole house sits on */}
      <mesh receiveShadow castShadow position={[0, -0.62, 0.9]}>
        <boxGeometry args={[13.4, 0.22, 10.4]} />
        <meshStandardMaterial {...concreteMat({ color: CONCRETE_DARK })} />
      </mesh>
      <mesh receiveShadow castShadow position={[0, -0.4, 0.6]}>
        <boxGeometry args={[12.0, 0.22, 9.2]} />
        <meshStandardMaterial {...concreteMat({ color: "#BFBAB1" })} />
      </mesh>
      <mesh receiveShadow castShadow position={[0, -0.18, 0.3]}>
        <boxGeometry args={[10.8, 0.22, 8.2]} />
        <meshStandardMaterial {...concreteMat()} />
      </mesh>

      {/* ground floor slab */}
      <mesh receiveShadow castShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[HX * 2 + 1.2, 0.28, HZ * 2 + 1.2]} />
        <meshStandardMaterial {...concreteMat({ color: "#D2CEC6" })} />
      </mesh>

      {/* dark riser trim on each terrace tier's front edge — a real
          shadow-gap reveal so each level reads as a distinct step you'd
          walk down, not a stack of same-toned flat tiles */}
      {[
        { z: 3.1, w: HX * 2 + 1.2, cy: 0.01, h: 0.16 },
        { z: 4.4, w: 10.8, cy: -0.18, h: 0.22 },
        { z: 5.2, w: 12.0, cy: -0.4, h: 0.22 },
        { z: 6.1, w: 13.4, cy: -0.605, h: 0.19 },
      ].map((r, i) => (
        <mesh key={`riser${i}`} position={[0, r.cy, r.z + 0.01]}>
          <boxGeometry args={[r.w, r.h, 0.03]} />
          <meshStandardMaterial {...charcoalMat({ color: "#2A2825", metalness: 0.1, roughness: 0.8 })} />
        </mesh>
      ))}

      {/* pad footings + starter bars */}
      {footings.map((f, i) => (
        <group key={`ft${i}`}>
          <mesh receiveShadow position={[f[0], -0.3, f[1]]}>
            <boxGeometry args={[0.7, 0.3, 0.7]} />
            <meshStandardMaterial {...concreteMat({ color: CONCRETE_DARK })} />
          </mesh>
          <mesh castShadow position={[f[0], 0.2, f[1]]}>
            <cylinderGeometry args={[0.02, 0.02, 0.42, 6]} />
            <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.35} />
          </mesh>
        </group>
      ))}
    </Rise>
  );
}

/* --------------------------- phase 02 ----------------------------- */

function Structure({ progress }) {
  const cols = useMemo(() => {
    const out = [];
    [-HX, -1.35, 1.35, HX].forEach((x) => [-HZ, HZ].forEach((z) => out.push([x, z])));
    return out;
  }, []);

  const treads = useMemo(() => Array.from({ length: 13 }, (_, i) => i), []);

  return (
    <Rise progress={progress} range={[0.2, 0.45]} drop={2.4}>
      {/* full-height structural columns */}
      {cols.map((c, i) => (
        <mesh key={`col${i}`} castShadow receiveShadow position={[c[0], GF_Y + (ROOF_Y - GF_Y) / 2, c[1]]}>
          <boxGeometry args={[0.2, ROOF_Y - GF_Y, 0.2]} />
          <meshStandardMaterial {...charcoalMat({ color: CHARCOAL_SOFT, metalness: 0.35, roughness: 0.5 })} />
        </mesh>
      ))}

      {/* intermediate floor slab, cantilevered slightly */}
      <mesh castShadow receiveShadow position={[0, MID_Y + SLAB_T / 2, 0]}>
        <boxGeometry args={[HX * 2 + 0.9, SLAB_T, HZ * 2 + 0.9]} />
        <meshStandardMaterial {...concreteMat({ color: "#D2CEC6" })} />
      </mesh>
      {/* dark shadow-line under the slab edge */}
      <mesh position={[0, MID_Y - 0.02, 0]}>
        <boxGeometry args={[HX * 2 + 0.94, 0.05, HZ * 2 + 0.94]} />
        <meshStandardMaterial {...charcoalMat({ metalness: 0.2, roughness: 0.7 })} />
      </mesh>

      {/* roof-bearing beams */}
      {[-HZ, HZ].map((z, i) => (
        <mesh key={`bm${i}`} castShadow position={[0, ROOF_Y - 0.16, z]}>
          <boxGeometry args={[HX * 2 + 0.4, 0.28, 0.18]} />
          <meshStandardMaterial {...charcoalMat({ color: CHARCOAL_SOFT, metalness: 0.35, roughness: 0.5 })} />
        </mesh>
      ))}

      {/* the open stair — a signature of the reference */}
      <group position={[-2.55, 0, 0.45]}>
        {treads.map((i) => (
          <mesh key={`tr${i}`} castShadow receiveShadow position={[0, 0.22 + i * 0.19, 1.5 - i * 0.19]}>
            <boxGeometry args={[1.25, 0.07, 0.32]} />
            <meshStandardMaterial {...timberMat({ color: TIMBER })} />
          </mesh>
        ))}
        <mesh castShadow position={[0.66, 1.42, 0.32]} rotation={[-0.785, 0, 0]}>
          <boxGeometry args={[0.06, 0.3, 3.5]} />
          <meshStandardMaterial {...charcoalMat({ metalness: 0.3, roughness: 0.55 })} />
        </mesh>
        <mesh castShadow position={[-0.66, 1.42, 0.32]} rotation={[-0.785, 0, 0]}>
          <boxGeometry args={[0.06, 0.3, 3.5]} />
          <meshStandardMaterial {...charcoalMat({ metalness: 0.3, roughness: 0.55 })} />
        </mesh>
      </group>
    </Rise>
  );
}

/* --------------------------- phase 03 ----------------------------- */

/**
 * One horizontal band of finished wall: glazing to the front, timber
 * batten screen and plaster elsewhere. Named export — MiniBuilding.jsx
 * reuses it for the little spinning house widget, so it has to stand on
 * its own without the scene's lighting.
 */
export function WallLevel({ y, rightAccent, shadows = true }) {
  const mullions = useMemo(() => [-3.0, -1.5, 0, 1.5, 3.0], []);

  return (
    <group>
      {/* rear + left solid walls only — the right side is deliberately
          open (no wall), a doll-house cutaway so the interior, stair and
          furniture read through from the camera's side */}
      <mesh castShadow={shadows} receiveShadow={shadows} position={[0, y, -HZ + 0.05]}>
        <boxGeometry args={[HX * 2 - 0.2, BAND_H, 0.14]} />
        <meshStandardMaterial color={PLASTER} bumpMap={plasterBump()} bumpScale={0.006} roughness={0.82} metalness={0.02} />
      </mesh>
      <mesh castShadow={shadows} receiveShadow={shadows} position={[-HX + 0.05, y, 0]}>
        <boxGeometry args={[0.14, BAND_H, HZ * 2 - 0.2]} />
        <meshStandardMaterial {...battenMat()} />
      </mesh>

      {/* front glazing — real transmission, kept very clear on purpose so
          you can genuinely see the interior through it, not just reflect */}
      <mesh position={[0, y, HZ]}>
        <boxGeometry args={[HX * 2 - 0.16, BAND_H - 0.04, 0.03]} />
        <meshPhysicalMaterial
          color={GLASS}
          roughness={0.03}
          metalness={0}
          transmission={1}
          thickness={0.015}
          ior={1.5}
          envMapIntensity={0.9}
          clearcoat={0.3}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* slim charcoal mullions + head and sill rails */}
      {mullions.map((x, i) => (
        <mesh key={`ml${i}`} castShadow={shadows} position={[x, y, HZ + 0.015]}>
          <boxGeometry args={[0.05, BAND_H, 0.06]} />
          <meshStandardMaterial {...charcoalMat()} />
        </mesh>
      ))}
      {[BAND_H / 2 - 0.03, -BAND_H / 2 + 0.03].map((dy, i) => (
        <mesh key={`rail${i}`} position={[0, y + dy, HZ + 0.015]}>
          <boxGeometry args={[HX * 2 - 0.16, 0.06, 0.07]} />
          <meshStandardMaterial {...charcoalMat()} />
        </mesh>
      ))}

      {/* timber batten screen to one side of the glazing */}
      <mesh castShadow={shadows} position={[HX - 0.55, y, HZ + 0.02]}>
        <boxGeometry args={[0.85, BAND_H, 0.09]} />
        <meshStandardMaterial {...battenMat()} />
      </mesh>

      {rightAccent && (
        <mesh position={[-HX + 0.02, y, HZ - 0.9]}>
          <boxGeometry args={[0.05, BAND_H, 1.5]} />
          <meshStandardMaterial {...battenMat({ color: TIMBER_DEEP })} />
        </mesh>
      )}
    </group>
  );
}

function Cladding({ progress }) {
  return (
    <Rise progress={progress} range={[0.45, 0.7]} drop={2.0}>
      <WallLevel y={GF_Y + 0.68} rightAccent={false} />
      <WallLevel y={GF_Y + 1.9} rightAccent />
      <WallLevel y={UF_Y + 0.68} rightAccent={false} />
      <WallLevel y={UF_Y + 1.9} rightAccent />
    </Rise>
  );
}

/* --------------------------- phase 04 ----------------------------- */
/* The roof is the hero beat — this is a roofing company, after all.   */

const ROOF_W = HX * 2 + 2.4; // deep overhangs all round
const ROOF_D = HZ * 2 + 2.6;

/**
 * The roof: thin charcoal fascia edge, warm timber soffit lit by recessed
 * downlights, long-run tray deck on top. Named export — MiniBuilding
 * reuses it.
 */
export function RoofShell({ shadows = true }) {
  const downlights = useMemo(() => {
    const out = [];
    for (let i = 0; i < 7; i++) out.push([-3.6 + i * 1.2, HZ + 0.95]);
    for (let i = 0; i < 4; i++) out.push([-HX - 0.85, -1.4 + i * 1.1]);
    return out;
  }, []);

  /** Shallow standing-seam trays running the length of the roof. */
  const trayGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(ROOF_W, ROOF_D, Math.round(ROOF_W * 12), 1);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const seam = Math.abs(((x + 100) % 0.42) - 0.21);
      pos.setZ(i, seam < 0.035 ? 0.03 : 0);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group position={[0, ROOF_Y, 0]} rotation={[ROOF_PITCH, 0, 0]}>
      {/* timber soffit — the glowing underside */}
      <mesh receiveShadow={shadows} position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOF_W, ROOF_D]} />
        <meshStandardMaterial {...realOakMat([2.4, 1.6], { emissive: GLOW, emissiveIntensity: 0.12 })} />
      </mesh>

      {/* roof plate */}
      <mesh castShadow={shadows} receiveShadow={shadows} position={[0, 0.17, 0]}>
        <boxGeometry args={[ROOF_W, 0.3, ROOF_D]} />
        <meshStandardMaterial {...realRoofMetalMat([2.4, 0.4])} />
      </mesh>

      {/* long-run tray deck on top */}
      <mesh geometry={trayGeo} castShadow={shadows} position={[0, 0.325, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial {...realRoofMetalMat([2.4, 1.8], { side: THREE.DoubleSide })} />
      </mesh>

      {/* crisp fascia band around the whole edge */}
      {[
        [0, ROOF_D / 2, ROOF_W, 0.1],
        [0, -ROOF_D / 2, ROOF_W, 0.1],
      ].map((f, i) => (
        <mesh key={`fz${i}`} castShadow={shadows} position={[f[0], 0.17, f[1]]}>
          <boxGeometry args={[f[2] + 0.02, 0.36, f[3]]} />
          <meshStandardMaterial {...realRoofMetalMat([2.4, 0.3])} />
        </mesh>
      ))}
      {[-ROOF_W / 2, ROOF_W / 2].map((x, i) => (
        <mesh key={`fx${i}`} castShadow={shadows} position={[x, 0.17, 0]}>
          <boxGeometry args={[0.1, 0.36, ROOF_D + 0.02]} />
          <meshStandardMaterial {...realRoofMetalMat([0.3, 1.8])} />
        </mesh>
      ))}

      {/* barge flashing along both raking (side) edges — a slightly
          proud cap distinct from the eave fascia */}
      {[-ROOF_W / 2 - 0.05, ROOF_W / 2 + 0.05].map((x, i) => (
        <mesh key={`barge${i}`} castShadow={shadows} position={[x, 0.32, 0]}>
          <boxGeometry args={[0.06, 0.14, ROOF_D + 0.1]} />
          <meshStandardMaterial {...realRoofMetalMat([0.2, 1.8], { roughness: 0.5 })} />
        </mesh>
      ))}

      {/* spouting (gutter) along the low front eave, tucked under the
          fascia — a shallow open channel, not just a flat band */}
      <mesh castShadow={shadows} position={[0, -0.04, ROOF_D / 2 + 0.13]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[ROOF_W - 0.3, 0.18, 0.16]} />
        <meshStandardMaterial {...realRoofMetalMat([2.4, 0.15], { roughness: 0.4 })} />
      </mesh>

      {/* recessed downlights washing the soffit */}
      {downlights.map((d, i) => (
        <mesh key={`dl${i}`} position={[d[0], 0.0, d[1]]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.075, 14]} />
          <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={2.6} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Downpipes — kept outside RoofShell's pitched group so they stay
 *  genuinely vertical in world space. Run tight against the front corner
 *  columns (real columns sit at exactly x=±HX, z=HZ) so each pipe reads
 *  as attached to the building, not floating loose in front of the
 *  glazing — and end on a small spreader block where they meet the
 *  ground instead of just stopping mid-air. */
const DP_TOP = ROOF_Y - 0.05;
const DP_BOTTOM = -0.06;
function Downpipes() {
  const xs = [HX + 0.16, -HX - 0.16];
  return (
    <>
      {xs.map((x, i) => (
        <group key={i}>
          <mesh castShadow position={[x, (DP_TOP + DP_BOTTOM) / 2, HZ + 0.16]}>
            <cylinderGeometry args={[0.045, 0.045, DP_TOP - DP_BOTTOM, 10]} />
            <meshStandardMaterial {...realRoofMetalMat([1, 1], { roughness: 0.4 })} />
          </mesh>
          <mesh castShadow receiveShadow position={[x, DP_BOTTOM - 0.03, HZ + 0.16]}>
            <boxGeometry args={[0.14, 0.06, 0.14]} />
            <meshStandardMaterial {...realRoofMetalMat([1, 1], { roughness: 0.5 })} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Roof({ progress }) {
  return (
    <Rise progress={progress} range={[0.7, 0.9]} drop={2.6}>
      <RoofShell />
      <Downpipes />
    </Rise>
  );
}

/* --------------------------- phase 05 ----------------------------- */

/** A soft alpha-cutout clump of leaves painted onto a canvas — used on
 *  crossed billboard planes for the planter shrubs. The earlier attempt
 *  (a low-poly icosahedron "shrub") read as a fake spiky cactus no
 *  matter how it was tuned and was cut per the client's own rule: don't
 *  ship a detail that can't be made to look genuinely good. Textured
 *  foliage cards are the standard arch-viz trick for a convincing bush
 *  at this scale, and — unlike the icosahedron — actually look like
 *  leaves instead of geometry. */
const _leafTexCache = new Map();
function leafClumpTex() {
  if (_leafTexCache.has("clump")) return _leafTexCache.get("clump");
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const rnd = mulberry32(42);
  const cx = size / 2;
  const cy = size * 0.6;
  for (let i = 0; i < 150; i++) {
    const a = rnd() * Math.PI * 2;
    const r = Math.pow(rnd(), 0.6) * size * 0.42;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r * 0.85 - r * 0.28;
    const w = 9 + rnd() * 15;
    const h = w * (1.5 + rnd() * 0.8);
    const shade = 80 + rnd() * 80;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rnd() * Math.PI * 2);
    ctx.fillStyle = `rgb(${Math.round(35 + shade * 0.3)}, ${Math.round(65 + shade * 0.7)}, ${Math.round(32 + shade * 0.25)})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  _leafTexCache.set("clump", t);
  return t;
}

function Planter({ position, rotationY = 0 }) {
  const leafTex = leafClumpTex();
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[0.7, 0.44, 0.7]} />
        <meshStandardMaterial {...concreteMat({ color: CONCRETE_DARK })} />
      </mesh>
      {[0, Math.PI / 2].map((ry, i) => (
        <mesh key={i} castShadow receiveShadow position={[0, 0.76, 0]} rotation={[0, ry, 0]}>
          <planeGeometry args={[0.82, 0.92]} />
          <meshStandardMaterial map={leafTex} alphaTest={0.35} side={THREE.DoubleSide} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function Finishing({ progress }) {
  return (
    <Rise progress={progress} range={[0.9, 1.0]} drop={1.1}>
      {/* upper terrace deck — cantilevers out from the floor slab so the
          balustrade actually has something to stand on */}
      <mesh castShadow receiveShadow position={[0, UF_Y - 0.05, HZ + 0.6]}>
        <boxGeometry args={[HX * 2 + 0.2, 0.1, 1.3]} />
        <meshStandardMaterial {...concreteMat({ color: "#D2CEC6" })} />
      </mesh>
      {/* glass balustrade along the terrace edge */}
      <mesh position={[0, UF_Y + 0.5, HZ + 1.15]}>
        <boxGeometry args={[HX * 2 + 0.6, 1.0, 0.025]} />
        <meshPhysicalMaterial color="#CFE0E4" roughness={0.05} transparent opacity={0.3} metalness={0} clearcoat={1} />
      </mesh>
      <mesh castShadow position={[0, UF_Y + 1.02, HZ + 1.15]}>
        <boxGeometry args={[HX * 2 + 0.64, 0.05, 0.06]} />
        <meshStandardMaterial {...charcoalMat({ metalness: 0.7, roughness: 0.3 })} />
      </mesh>

      {/* interior furniture, read as warm blocks through the glass — a
          few extra pieces so each level reads as a real lived-in room */}
      <mesh castShadow position={[1.6, GF_Y + 0.28, 0.4]}>
        <boxGeometry args={[2.2, 0.56, 0.95]} />
        <meshStandardMaterial color="#8C7A63" roughness={0.85} />
      </mesh>
      <mesh receiveShadow position={[1.6, GF_Y + 0.02, 1.3]}>
        <boxGeometry args={[2.6, 0.03, 1.6]} />
        <meshStandardMaterial color="#B7A98C" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[1.5, GF_Y + 0.14, 1.35]}>
        <boxGeometry args={[0.7, 0.22, 0.5]} />
        <meshStandardMaterial {...timberMat({ color: TIMBER })} />
      </mesh>
      <mesh castShadow position={[-0.4, GF_Y + 0.22, 1.5]}>
        <boxGeometry args={[1.3, 0.44, 0.7]} />
        <meshStandardMaterial color="#6E6357" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[-2.1, GF_Y + 0.45, -0.6]}>
        <boxGeometry args={[1.1, 0.9, 0.6]} />
        <meshStandardMaterial {...concreteMat({ color: "#D8D3C8" })} />
      </mesh>
      {/* bed, upper floor — mattress, folded throw, two pillows, headboard */}
      <mesh castShadow position={[2.1, UF_Y + 0.22, 0.2]}>
        <boxGeometry args={[1.9, 0.44, 2.2]} />
        <meshStandardMaterial color="#DCD3C2" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[2.1, UF_Y + 0.46, 0.85]}>
        <boxGeometry args={[1.86, 0.1, 0.5]} />
        <meshStandardMaterial color="#8C7A63" roughness={0.9} />
      </mesh>
      {/* pillows — squashed spheres read as soft and plump, a box just
          reads as a box no matter how it's lit */}
      <mesh castShadow scale={[1, 0.55, 0.7]} position={[1.55, UF_Y + 0.5, -0.55]}>
        <sphereGeometry args={[0.32, 14, 10]} />
        <meshStandardMaterial color="#F2EDE3" roughness={0.85} />
      </mesh>
      <mesh castShadow scale={[1, 0.55, 0.7]} position={[2.65, UF_Y + 0.5, -0.55]}>
        <sphereGeometry args={[0.32, 14, 10]} />
        <meshStandardMaterial color="#F2EDE3" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[2.1, UF_Y + 0.5, -0.75]}>
        <boxGeometry args={[1.9, 0.5, 0.12]} />
        <meshStandardMaterial {...timberMat({ color: TIMBER_DEEP })} />
      </mesh>
      {/* bedside rug + wall art — the small touches that make a room read
          as lived-in rather than a single bed dropped into an empty box */}
      <mesh receiveShadow position={[3.35, UF_Y + 0.015, 0.5]}>
        <boxGeometry args={[0.9, 0.02, 1.3]} />
        <meshStandardMaterial color="#B7A98C" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0.4, UF_Y + 1.55, -HZ + 0.14]}>
        <boxGeometry args={[0.9, 0.6, 0.03]} />
        <meshStandardMaterial {...timberMat({ color: TIMBER_DEEP })} />
      </mesh>
      <mesh position={[0.4, UF_Y + 1.55, -HZ + 0.16]}>
        <boxGeometry args={[0.76, 0.46, 0.01]} />
        <meshStandardMaterial color="#E7E1D4" roughness={0.9} />
      </mesh>
      {/* bedside lamp — small warm accent light */}
      <mesh position={[3.15, UF_Y + 0.36, -0.5]}>
        <cylinderGeometry args={[0.02, 0.03, 0.3, 8]} />
        <meshStandardMaterial {...charcoalMat({ metalness: 0.4, roughness: 0.5 })} />
      </mesh>
      <mesh position={[3.15, UF_Y + 0.54, -0.5]}>
        <coneGeometry args={[0.12, 0.16, 12, 1, true]} />
        <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={1.6} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh castShadow position={[-2.0, UF_Y + 0.72, -0.4]}>
        <boxGeometry args={[0.9, 1.5, 0.35]} />
        <meshStandardMaterial {...timberMat({ color: TIMBER_DEEP })} />
      </mesh>

      {/* ground-floor bathroom — toilet, vanity with basin, tap, mirror
          and soap. "A house" needs more than one bed in an empty box. */}
      <group position={[0, 0, 0]}>
        {/* toilet */}
        <mesh castShadow receiveShadow position={[2.55, GF_Y + 0.19, -2.25]}>
          <cylinderGeometry args={[0.16, 0.13, 0.38, 16]} />
          <meshStandardMaterial color="#F5F3EE" roughness={0.25} />
        </mesh>
        <mesh castShadow position={[2.55, GF_Y + 0.35, -2.28]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.155, 0.02, 8, 20]} />
          <meshStandardMaterial color="#F5F3EE" roughness={0.2} />
        </mesh>
        <mesh castShadow position={[2.55, GF_Y + 0.46, -2.42]}>
          <boxGeometry args={[0.34, 0.32, 0.14]} />
          <meshStandardMaterial color="#F5F3EE" roughness={0.25} />
        </mesh>

        {/* vanity + basin + tap */}
        <mesh castShadow receiveShadow position={[3.25, GF_Y + 0.22, -2.32]}>
          <boxGeometry args={[0.56, 0.44, 0.4]} />
          <meshStandardMaterial {...timberMat({ color: TIMBER_DEEP })} />
        </mesh>
        <mesh castShadow receiveShadow position={[3.25, GF_Y + 0.46, -2.32]}>
          <boxGeometry args={[0.6, 0.05, 0.44]} />
          <meshStandardMaterial color="#EDEAE2" roughness={0.3} />
        </mesh>
        <mesh castShadow position={[3.25, GF_Y + 0.5, -2.32]}>
          <cylinderGeometry args={[0.13, 0.15, 0.06, 16]} />
          <meshStandardMaterial color="#F5F3EE" roughness={0.15} />
        </mesh>
        <mesh castShadow position={[3.25, GF_Y + 0.62, -2.46]}>
          <cylinderGeometry args={[0.014, 0.014, 0.16, 8]} />
          <meshStandardMaterial {...charcoalMat({ metalness: 0.85, roughness: 0.15 })} />
        </mesh>
        {/* soap on the vanity edge */}
        <mesh castShadow position={[3.46, GF_Y + 0.5, -2.2]}>
          <boxGeometry args={[0.07, 0.035, 0.05]} />
          <meshStandardMaterial color="#E8D9BE" roughness={0.5} />
        </mesh>
        {/* mirror, flush on the rear wall above the vanity — real mirror
            look: near-zero roughness, full metalness, reflecting the HDRI */}
        <mesh position={[3.25, GF_Y + 1.05, -2.53]}>
          <boxGeometry args={[0.5, 0.6, 0.015]} />
          <meshStandardMaterial color="#DCE8EA" roughness={0.04} metalness={1} envMapIntensity={1.4} />
        </mesh>
        <pointLight position={[3.25, GF_Y + 1.35, -2.3]} intensity={2.2} distance={3} decay={2} color={GLOW} />
      </group>

      {/* concealed cove lighting on each floor */}
      {[GF_Y + 2.3, UF_Y + 2.3].map((y, i) => (
        <mesh key={`cove${i}`} position={[0, y, HZ - 0.5]}>
          <boxGeometry args={[HX * 2 - 0.6, 0.05, 0.05]} />
          <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      ))}
      <pointLight position={[0, GF_Y + 1.5, 0.6]} intensity={6} distance={10} decay={2} color={GLOW} />
      <pointLight position={[0, UF_Y + 1.5, 0.6]} intensity={5} distance={10} decay={2} color={GLOW} />

      {/* front door — a distinct framed entry rather than plain glazing.
          The dark riser trim added to Podium's terrace tiers is what
          makes the steps down from here read as stairs, not tiles. */}
      <mesh castShadow position={[0, GF_Y + 0.68, HZ + 0.03]}>
        <boxGeometry args={[2.9, BAND_H - 0.02, 0.05]} />
        <meshStandardMaterial {...charcoalMat({ metalness: 0.5, roughness: 0.4 })} />
      </mesh>
      <mesh position={[0, GF_Y + 0.68, HZ + 0.055]}>
        <boxGeometry args={[2.7, BAND_H - 0.2, 0.03]} />
        <meshPhysicalMaterial color={GLASS} roughness={0.05} metalness={0} transmission={1} thickness={0.015} ior={1.5} envMapIntensity={0.9} clearcoat={0.3} />
      </mesh>
      <mesh castShadow position={[-0.03, GF_Y + 0.68, HZ + 0.07]}>
        <boxGeometry args={[0.04, 0.7, 0.04]} />
        <meshStandardMaterial {...charcoalMat({ metalness: 0.7, roughness: 0.3 })} />
      </mesh>
      <mesh castShadow position={[0.03, GF_Y + 0.68, HZ + 0.07]}>
        <boxGeometry args={[0.04, 0.7, 0.04]} />
        <meshStandardMaterial {...charcoalMat({ metalness: 0.7, roughness: 0.3 })} />
      </mesh>

      <Planter position={[HX + 1.0, -0.07, HZ + 0.6]} />
      <Planter position={[-HX - 1.0, -0.07, HZ + 1.4]} />
    </Rise>
  );
}

/* ------------------------------ scene ----------------------------- */

export default function BuildingScene({ progress }) {
  return (
    <>
      <RenderSettings />

      {/* very light, static haze — keeps the grass edge and distance soft
          without any colour animation or per-frame cost */}
      <fog attach="fog" args={["#F7F5F0", 20, 42]} />

      {/* auto-drops resolution under load and skips raycasting while the
          camera is moving fast — free perf headroom during the pinned scroll */}
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      {/* self-hosted outdoor HDRI — real image-based lighting instead of flat lightformer cards */}
      <Environment files="/hdri/kloofendal_43d_clear_1k.hdr" background={false} environmentIntensity={0.7} />

      <Lighting />

      <LandscapeReveal progress={progress} />
      <Podium progress={progress} />
      <Structure progress={progress} />
      <Cladding progress={progress} />
      <Roof progress={progress} />
      <Finishing progress={progress} />

      <CameraRig progress={progress} />

      {/* Full postprocessing stack (N8AO/Bloom/Vignette/SMAA) removed —
          it was the source of a per-frame glBlitFramebuffer GL warning and
          the main cause of scroll lag during the pinned build. Renderer's
          plain output is a hair less polished but genuinely smooth. */}
    </>
  );
}

