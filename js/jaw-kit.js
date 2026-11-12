/**
 * Shared Z-Anatomy jaw loader and placement helpers for atlas topic scenes.
 * Patterns follow js/try.js (FA points, cutShell, brackets, aligners, veneers)
 * without changing try.js / simulate.js public behavior.
 *
 * Jaw units ≈ 10 mm (first-molar width ~1 unit). Implant geometry is in mm.
 */
import { THREE, loadGLB } from "./stage.js";
import { cutToothGeometry, isUpper as isUpperFdi } from "./tooth-cut.js";

export { isUpperFdi };

export const JAW_MM = 10;
export const IMPLANT_SCALE = 1 / JAW_MM;

export const ANTERIORS = new Set([
  "11", "12", "13", "21", "22", "23",
  "31", "32", "33", "41", "42", "43",
]);

export const UPPER_ORDER = ["17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27"];
export const LOWER_ORDER = ["47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37"];

export const TOOTH_BASE = {
  color: 0xf6f1e6,
  roughness: 0.24,
  clearcoat: 0.7,
  clearcoatRoughness: 0.15,
  sheen: 0.3,
  sheenColor: new THREE.Color(0xfff0d8),
};

const CROWN_FRAC = 0.42;
const ALIGNER_FRAC = 0.45;

let _jawPromise = null;

export function loadJawGltf(base = "") {
  if (!_jawPromise) {
    _jawPromise = loadGLB(`${base}assets/models/jaw.glb`);
  }
  return _jawPromise;
}

export function ceramicMaterial(kind = "crown") {
  if (kind === "veneer") {
    return new THREE.MeshPhysicalMaterial({
      color: 0xfaf6ef,
      roughness: 0.18,
      metalness: 0,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
      transmission: 0.22,
      thickness: 0.4,
      ior: 1.5,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    });
  }
  return new THREE.MeshPhysicalMaterial({
    color: 0xf7f2e8,
    roughness: 0.22,
    metalness: 0,
    clearcoat: 0.75,
    clearcoatRoughness: 0.14,
    sheen: 0.25,
    sheenColor: new THREE.Color(0xfff0d8),
    transmission: 0.08,
    thickness: 0.6,
    ior: 1.45,
    side: THREE.DoubleSide,
  });
}

export function alignerMaterial(color = 0xd8eef2) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.12,
    metalness: 0,
    transmission: 0.78,
    thickness: 0.35,
    ior: 1.42,
    transparent: true,
    opacity: 0.55,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

export function metalMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xc9ced3,
    metalness: 0.92,
    roughness: 0.28,
  });
}

export function enamelMaterial() {
  return new THREE.MeshPhysicalMaterial({ ...TOOTH_BASE, side: THREE.DoubleSide });
}

export function dentinMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xe8c99a,
    roughness: 0.55,
    metalness: 0,
    side: THREE.DoubleSide,
  });
}

export function boneMaterial({ opacity = 0.7, clip = true } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: 0xe7dcc2,
    roughness: 0.72,
    metalness: 0,
    transparent: opacity < 0.98,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: opacity > 0.6,
  });
}

export function gumMaterial({ opacity = 0.85 } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: 0xe0929f,
    roughness: 0.5,
    clearcoat: 0.25,
    clearcoatRoughness: 0.5,
    sheen: 0.4,
    sheenColor: new THREE.Color(0xffb0b8),
    transparent: opacity < 0.98,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: opacity > 0.6,
  });
}

export function tongueMaterial({ opacity = 0.75 } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: 0xcb6f7c,
    roughness: 0.55,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4,
    transparent: opacity < 0.98,
    opacity,
    depthWrite: opacity > 0.6,
  });
}

export function worldBox(mesh) {
  mesh.updateWorldMatrix(true, false);
  return new THREE.Box3().setFromObject(mesh);
}

export function worldCenter(mesh) {
  return worldBox(mesh).getCenter(new THREE.Vector3());
}

/** Axis-aligned box of currently visible meshes only (hidden teeth do not inflate it). */
export function visibleBox(object) {
  const box = new THREE.Box3();
  let found = false;
  object.updateWorldMatrix(true, true);
  object.traverse((o) => {
    if (!o.isMesh || !o.visible || !o.geometry) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    const b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
    if (!found) {
      box.copy(b);
      found = true;
    } else {
      box.union(b);
    }
  });
  if (!found) box.setFromObject(object);
  return box;
}

export function buccalDir(fdi, toothCenter, archCenter) {
  const dx = toothCenter.x - archCenter.x;
  const dz = toothCenter.z - archCenter.z;
  const v = new THREE.Vector3(dx, 0, dz);
  if (v.lengthSq() < 1e-6) v.set(0, 0, 1);
  v.normalize();
  if (ANTERIORS.has(fdi)) {
    v.z = Math.max(v.z, 0.55);
    v.normalize();
  }
  return v;
}

export function occlusalDir(fdi) {
  return isUpperFdi(fdi) ? new THREE.Vector3(0, -1, 0) : new THREE.Vector3(0, 1, 0);
}

export function gingivalDir(fdi) {
  return isUpperFdi(fdi) ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, -1, 0);
}

/**
 * FA-point on labial/buccal (or lingual) clinical crown.
 * Clinical crown ≈ 42% of AABB height from occlusal; FA at mid-crown.
 */
export function facialAnchor(mesh, fdi, archCenter, { lingual = false } = {}) {
  mesh.updateWorldMatrix(true, false);
  const bb = new THREE.Box3().setFromObject(mesh);
  const c = bb.getCenter(new THREE.Vector3());
  const sz = bb.getSize(new THREE.Vector3());
  const buccal = buccalDir(fdi, c, archCenter);
  const outward = lingual ? buccal.clone().negate() : buccal;
  const upper = isUpperFdi(fdi);
  const occlusalY = upper ? bb.min.y : bb.max.y;
  const apicalY = upper ? bb.max.y : bb.min.y;
  const fullH = apicalY - occlusalY;
  const clinicalCrownH = fullH * CROWN_FRAC;
  const faY = occlusalY + clinicalCrownH * 0.5;
  const yTol = Math.abs(clinicalCrownH) * 0.08;

  const geo = mesh.geometry;
  const posAttr = geo.attributes.position;
  const norAttr = geo.attributes.normal;
  const mw = mesh.matrixWorld;
  const tmp = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  const candidates = [];
  for (let i = 0; i < posAttr.count; i++) {
    tmp.fromBufferAttribute(posAttr, i).applyMatrix4(mw);
    if (Math.abs(tmp.y - faY) > yTol) continue;
    let score;
    if (norAttr) {
      nrm.fromBufferAttribute(norAttr, i).transformDirection(mw);
      score = nrm.dot(outward);
    } else {
      score = tmp.clone().sub(c).dot(outward);
    }
    candidates.push({ p: tmp.clone(), score });
  }

  let fa;
  if (candidates.length >= 8) {
    candidates.sort((a, b) => b.score - a.score);
    const take = Math.max(8, Math.ceil(candidates.length * 0.25));
    const top = candidates.slice(0, take);
    fa = new THREE.Vector3();
    for (const s of top) fa.add(s.p);
    fa.multiplyScalar(1 / top.length);
    fa.y = faY;
  } else {
    fa = c.clone();
    fa.y = faY;
    fa.add(outward.clone().multiplyScalar(Math.max(sz.x, sz.z) * 0.38));
  }
  const toothSize = Math.max(sz.x, sz.y, sz.z);
  fa.add(outward.clone().multiplyScalar(toothSize * 0.025));

  const marginY = occlusalY + fullH * CROWN_FRAC;
  const origin = new THREE.Vector3(c.x, marginY, c.z);

  return {
    pos: fa,
    buccal,
    outward,
    size: sz,
    center: c,
    bb,
    toothSize,
    occlusalY,
    faY,
    fullH,
    clinicalCrownH,
    marginY,
    origin,
  };
}

export function orientOnSurface(obj, pos, outward, fdi) {
  const z = outward.clone().normalize();
  let y = gingivalDir(fdi).clone();
  y.sub(z.clone().multiplyScalar(y.dot(z)));
  if (y.lengthSq() < 1e-8) y.set(0, 1, 0);
  y.normalize();
  const x = new THREE.Vector3().crossVectors(y, z).normalize();
  y.crossVectors(z, x).normalize();
  obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  obj.position.copy(pos);
}

/** Bracket: base plate + twin wings (local +Z outward, +Y gingival). */
export function makeBracket(unit, style = "metal") {
  const mat =
    style === "ceramic"
      ? new THREE.MeshPhysicalMaterial({
          color: 0xf4f1ea,
          roughness: 0.28,
          metalness: 0.05,
          clearcoat: 0.55,
          clearcoatRoughness: 0.2,
        })
      : metalMaterial();
  const g = new THREE.Group();
  const w = unit * 0.95;
  const h = unit * 0.85;
  const d = unit * 0.42;

  const base = new THREE.Mesh(new THREE.BoxGeometry(w, h, d * 0.45), mat);
  base.position.z = d * 0.22;
  g.add(base);

  const wingW = w * 1.05;
  const wingH = h * 0.28;
  const wingD = d * 0.55;
  const wingY = h * 0.28;
  const top = new THREE.Mesh(new THREE.BoxGeometry(wingW, wingH, wingD), mat);
  top.position.set(0, wingY, d * 0.55);
  g.add(top);
  const bot = new THREE.Mesh(new THREE.BoxGeometry(wingW, wingH, wingD), mat);
  bot.position.set(0, -wingY, d * 0.55);
  g.add(bot);

  const slot = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, h * 0.12, d * 0.2), mat);
  slot.position.set(0, 0, d * 0.62);
  g.add(slot);

  if (style === "selfLigating" || style === "self-ligating") {
    const door = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, h * 0.16, d * 0.12), mat);
    door.position.set(0, 0, d * 0.82);
    g.add(door);
  }

  g.userData.slotOffset = d * 0.75;
  return g;
}

export function cutShell(mesh, fdi, mat, { frac = CROWN_FRAC, scale = 1, keep = "crown", buccal, facialMin, shrinkXZ, shrinkY } = {}) {
  const cut = cutToothGeometry(mesh, fdi, { frac, keep, buccal, facialMin, shrinkXZ, shrinkY });
  if (mat) mat.side = THREE.DoubleSide;
  const shell = new THREE.Mesh(cut.geometry, mat);
  shell.position.copy(cut.origin);
  shell.scale.setScalar(scale);
  shell.userData.cut = cut;
  shell.castShadow = true;
  return shell;
}

export function tubeAlong(points, radius, material, { closed = false, tubular = 0 } = {}) {
  if (!points || points.length < 2) return null;
  const curve = new THREE.CatmullRomCurve3(points, closed, "centripetal");
  const segs = tubular || Math.max(48, points.length * 10);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, radius, 8, closed), material);
  mesh.castShadow = true;
  return mesh;
}

export function makeOrganicBlob(radius, material, { flatten = 0.7, distort = 0.22 } = {}) {
  const geo = new THREE.IcosahedronGeometry(radius, 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const n = 1 + distort * Math.sin(x * 5.1 + y * 3.3) * Math.cos(z * 4.2 + x);
    pos.setXYZ(i, x * n, y * n * flatten, z * n);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, material);
}

/**
 * Place an implant stack (mm units, +Y occlusal / platform at 0, fixture −Y)
 * at a missing tooth site, scaled into jaw units and aligned to the tooth axis.
 */
export function placeImplantAtTooth(kit, fdi, stack, { scale = IMPLANT_SCALE, tiltDeg = 0, sink = 0.02 } = {}) {
  const mesh = kit.teeth[fdi];
  if (!mesh || !stack) return stack;
  mesh.visible = false;
  const fa = facialAnchor(mesh, fdi, kit.archCenter);
  const occl = occlusalDir(fdi);
  stack.scale.setScalar(scale);
  // +Y (platform / crown) → occlusal
  stack.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), occl);
  if (tiltDeg) {
    const tilt = THREE.MathUtils.degToRad(tiltDeg);
    // Distal tilt: rotate around buccal axis
    const buccal = fa.buccal.clone();
    const q = new THREE.Quaternion().setFromAxisAngle(buccal, isUpperFdi(fdi) ? -tilt : tilt);
    // Distal is away from midline along the arch (roughly ±X for posteriors)
    const distal = new THREE.Vector3().crossVectors(occl, buccal).normalize();
    // For Q1/Q4 (right side, negative X) distal is +X? Right posterior distal is more negative X (toward 18).
    // Simpler: tilt the fixture apex away from the midline in X.
    const away = new THREE.Vector3(Math.sign(fa.center.x) || 1, 0, 0);
    const axis = new THREE.Vector3().crossVectors(occl, away).normalize();
    if (axis.lengthSq() > 0.2) {
      stack.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis, tilt));
    } else {
      stack.quaternion.premultiply(q);
    }
  }
  // Platform at the cervical margin, slightly apical so it sits in the ridge
  const platform = fa.origin.clone().add(occlusalDir(fdi).multiplyScalar(-sink));
  // After quaternion, local 0 is platform
  stack.position.copy(platform);
  return stack;
}

export function placeAligners(kit, overlay, { fdis = null, scale = 1.055, frac = ALIGNER_FRAC, material = null } = {}) {
  const mat = material || alignerMaterial();
  const list = fdis || Object.keys(kit.teeth);
  const shells = [];
  for (const fdi of list) {
    const mesh = kit.teeth[fdi];
    if (!mesh || !mesh.visible) continue;
    const shell = cutShell(mesh, fdi, mat, { frac, scale });
    const c = worldCenter(mesh);
    const b = buccalDir(fdi, c, kit.archCenter);
    shell.position.add(b.multiplyScalar(0.06));
    shell.position.add(occlusalDir(fdi).multiplyScalar(0.03));
    shell.renderOrder = 2;
    overlay.add(shell);
    shells.push(shell);
  }
  return shells;
}

export function placeBrackets(kit, overlay, { style = "metal", selfLigating = false, lingual = false, arch = "both" } = {}) {
  const metal = metalMaterial();
  const bracketStyle = selfLigating ? "selfLigating" : style === "ceramic" ? "ceramic" : "metal";
  const arches = [];
  if (arch === "both" || arch === "upper") arches.push(UPPER_ORDER);
  if (arch === "both" || arch === "lower") arches.push(LOWER_ORDER);
  const brackets = [];
  for (const order of arches) {
    const pts = [];
    for (const fdi of order) {
      const mesh = kit.teeth[fdi];
      if (!mesh || !mesh.visible) continue;
      const fa = facialAnchor(mesh, fdi, kit.archCenter, { lingual });
      const unit = fa.toothSize * 0.16;
      const bracket = makeBracket(unit, bracketStyle);
      orientOnSurface(bracket, fa.pos, fa.outward, fdi);
      overlay.add(bracket);
      brackets.push(bracket);
      const slotOff = bracket.userData.slotOffset || unit * 0.5;
      pts.push(fa.pos.clone().add(fa.outward.clone().multiplyScalar(slotOff * 1.15)));
    }
    if (pts.length >= 2) {
      const tubeR = Math.max(0.035, Math.min(0.055, pts[0].distanceTo(pts[1]) * 0.04));
      const tube = tubeAlong(pts, tubeR, metal);
      if (tube) overlay.add(tube);
    }
  }
  return brackets;
}

export function placeVeneer(kit, overlay, fdi, { kind = "porcelain", explode = 0.35 } = {}) {
  const mesh = kit.teeth[fdi];
  if (!mesh) return null;
  const c = worldCenter(mesh);
  const buccal = buccalDir(fdi, c, kit.archCenter);
  const occl = occlusalDir(fdi);
  const bb = worldBox(mesh);
  const sz = bb.getSize(new THREE.Vector3());
  const lift = Math.max(sz.x, sz.y, sz.z);
  const mat = kind === "resin"
    ? new THREE.MeshPhysicalMaterial({
        color: 0xe8dcc0,
        roughness: 0.35,
        metalness: 0,
        clearcoat: 0.4,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
      })
    : ceramicMaterial("veneer");
  const shell = cutShell(mesh, fdi, mat, { frac: CROWN_FRAC, scale: 1.02, buccal, facialMin: 0.1 });
  shell.scale.set(1.02, 1.02, 1.01);
  shell.renderOrder = 3;
  const seat = shell.position.clone().add(buccal.clone().multiplyScalar(0.1));
  const exploded = seat.clone()
    .add(buccal.clone().multiplyScalar(lift * 0.45 * explode))
    .add(occl.clone().multiplyScalar(lift * 0.06 * explode));
  shell.position.copy(exploded);
  overlay.add(shell);
  mesh.material.emissive = new THREE.Color(0x1a3a36);
  mesh.material.emissiveIntensity = 0.08;
  return shell;
}

export function placeCrownRestore(kit, overlay, fdi, { kind = "ceramic", explode = 0 } = {}) {
  const mesh = kit.teeth[fdi];
  if (!mesh) return null;
  let mat;
  if (kind === "metal") mat = metalMaterial();
  else if (kind === "gold") {
    mat = new THREE.MeshPhysicalMaterial({ color: 0xd4af37, metalness: 1, roughness: 0.25 });
  } else if (kind === "pfm") {
    mat = new THREE.MeshPhysicalMaterial({ color: 0xf0ebe0, roughness: 0.25, metalness: 0.15, clearcoat: 0.5, side: THREE.DoubleSide });
  } else if (kind === "zirconia") {
    mat = new THREE.MeshPhysicalMaterial({ color: 0xf5f2eb, roughness: 0.18, metalness: 0, clearcoat: 0.85, side: THREE.DoubleSide });
  } else if (kind === "temp") {
    mat = new THREE.MeshPhysicalMaterial({ color: 0xf0c989, roughness: 0.45, metalness: 0.05, clearcoat: 0.3, side: THREE.DoubleSide });
  } else {
    mat = ceramicMaterial("crown");
  }
  const shell = cutShell(mesh, fdi, mat, { frac: CROWN_FRAC, scale: 1.03 });
  shell.renderOrder = 3;
  overlay.add(shell);
  overlay.add(cutShell(mesh, fdi, enamelMaterial(), { frac: CROWN_FRAC, keep: "root" }));
  const prepMat = new THREE.MeshPhysicalMaterial({
    color: 0xb8b4ae, roughness: 0.8, metalness: 0.05, clearcoat: 0.05, sheen: 0, side: THREE.DoubleSide,
  });
  overlay.add(cutShell(mesh, fdi, prepMat, { frac: CROWN_FRAC, keep: "crown", shrinkXZ: 0.9, shrinkY: 0.92 }));
  mesh.visible = false;
  if (explode) {
    const fa = facialAnchor(mesh, fdi, kit.archCenter);
    shell.position.add(occlusalDir(fdi).multiplyScalar(fa.toothSize * 0.35 * explode));
  }
  return shell;
}

export function placeBridge(kit, overlay, pontic, { maryland = false } = {}) {
  const neighbors = neighborsOf(pontic);
  const abut = neighbors.length >= 2 ? neighbors : ["14", "16"];
  const [a, b] = abut;
  const mat = ceramicMaterial("crown");
  if (kit.teeth[pontic]) kit.teeth[pontic].visible = false;

  for (const fdi of [a, b]) {
    if (!kit.teeth[fdi]) continue;
    if (maryland) {
      const fa = facialAnchor(kit.teeth[fdi], fdi, kit.archCenter, { lingual: true });
      const wing = cutShell(kit.teeth[fdi], fdi, metalMaterial(), {
        frac: CROWN_FRAC, scale: 1.01, buccal: fa.outward, facialMin: 0.15,
      });
      overlay.add(wing);
    } else {
      overlay.add(cutShell(kit.teeth[fdi], fdi, mat, { frac: CROWN_FRAC, scale: 1.03 }));
      overlay.add(cutShell(kit.teeth[fdi], fdi, enamelMaterial(), { frac: CROWN_FRAC, keep: "root" }));
      kit.teeth[fdi].visible = false;
    }
  }

  const srcFdi = kit.teeth[pontic] ? pontic : a;
  const src = kit.teeth[srcFdi];
  if (!src) return;
  const ponticMesh = cutShell(src, srcFdi, mat.clone(), { frac: CROWN_FRAC, scale: 1.02 });
  const ca = kit.teeth[a] ? worldCenter(kit.teeth[a]) : kit.archCenter;
  const cb = kit.teeth[b] ? worldCenter(kit.teeth[b]) : kit.archCenter;
  const mid = ca.clone().add(cb).multiplyScalar(0.5);
  ponticMesh.position.x = mid.x;
  ponticMesh.position.z = mid.z;
  overlay.add(ponticMesh);

  const metal = metalMaterial();
  for (const end of [a, b]) {
    if (!kit.teeth[end]) continue;
    const ce = worldCenter(kit.teeth[end]);
    const dir = mid.clone().sub(ce);
    const len = dir.length();
    if (len < 0.01) continue;
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, len * 0.85, 8), metal);
    rod.position.copy(ce).lerp(mid, 0.5);
    rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    overlay.add(rod);
  }
  return ponticMesh;
}

export function neighborsOf(fdi) {
  const map = {
    "15": ["14", "16"], "14": ["13", "15"], "16": ["15", "17"],
    "25": ["24", "26"], "24": ["23", "25"], "26": ["25", "27"],
    "35": ["34", "36"], "34": ["33", "35"], "36": ["35", "37"],
    "45": ["44", "46"], "44": ["43", "45"], "46": ["45", "47"],
    "12": ["11", "13"], "22": ["21", "23"], "32": ["31", "33"], "42": ["41", "43"],
    "11": ["21", "12"], "21": ["11", "22"], "31": ["41", "32"], "41": ["31", "42"],
    "13": ["12", "14"], "23": ["22", "24"], "33": ["32", "34"], "43": ["42", "44"],
    "17": ["16"], "27": ["26"], "37": ["36"], "47": ["46"],
  };
  return map[fdi] || [];
}

export function fdisOfArch(which) {
  if (which === "upper") return UPPER_ORDER.slice();
  if (which === "lower") return LOWER_ORDER.slice();
  return UPPER_ORDER.concat(LOWER_ORDER);
}

/**
 * Full-arch prosthesis: clinical crowns of the (usually hidden) teeth as pontics
 * sitting on a gingiva-colored flange extruded along the arch curve.
 */
export function makeFullArchProsthesis(kit, { arch = "upper", lift = 0.12, flangeRadius = 0.38 } = {}) {
  const group = new THREE.Group();
  group.name = "archProsthesis";
  const fdis = fdisOfArch(arch);
  const mat = ceramicMaterial("crown");
  const gumMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0909a,
    roughness: 0.45,
    metalness: 0,
    clearcoat: 0.2,
    sheen: 0.35,
    sheenColor: new THREE.Color(0xffb0b8),
  });
  const marginPts = [];
  const occl = arch === "upper" ? new THREE.Vector3(0, -1, 0) : new THREE.Vector3(0, 1, 0);
  for (const fdi of fdis) {
    const mesh = kit.teeth[fdi];
    if (!mesh) continue;
    const shell = cutShell(mesh, fdi, mat.clone(), { frac: CROWN_FRAC, scale: 1.0 });
    shell.position.add(occl.clone().multiplyScalar(lift));
    group.add(shell);
    const fa = facialAnchor(mesh, fdi, kit.archCenter);
    marginPts.push(fa.origin.clone().add(occl.clone().multiplyScalar(lift * 0.35)));
  }
  if (marginPts.length >= 3) {
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, flangeRadius * 1.4, flangeRadius * 0.55, 0, Math.PI * 2, false, 0);
    const curve = new THREE.CatmullRomCurve3(marginPts, false, "centripetal");
    const geo = new THREE.ExtrudeGeometry(shape, {
      extrudePath: curve,
      steps: 80,
      bevelEnabled: false,
      curveSegments: 8,
    });
    const flange = new THREE.Mesh(geo, gumMat);
    group.add(flange);
  }
  return group;
}


/** Rotate the jaw so a tooth's buccal (or lingual) faces the camera (+Z). amount=1 is a full turn. */
export function faceOutward(kit, fdi, { lingual = false, amount = 1 } = {}) {
  const mesh = kit.teeth[fdi];
  if (!mesh) return;
  const fa = facialAnchor(mesh, fdi, kit.archCenter, { lingual });
  const out = fa.outward.clone();
  out.y = 0;
  if (out.lengthSq() < 1e-8) return;
  out.normalize();
  const yaw = Math.atan2(out.x, out.z);
  kit.root.rotation.y += -yaw * amount;
}

export function setToothScale(kit, fdis, scalar) {
  for (const fdi of fdis) {
    const mesh = kit.teeth[fdi];
    if (!mesh) continue;
    mesh.scale.multiplyScalar(scalar);
  }
}

export function applyCrowding(kit, amount = 0.35) {
  // Slight rotation / overlap of anteriors — illustration only
  const pairs = [
    ["11", 0.12], ["21", -0.12], ["12", -0.18], ["22", 0.18],
    ["31", -0.1], ["41", 0.1], ["32", 0.16], ["42", -0.16],
  ];
  for (const [fdi, rot] of pairs) {
    const mesh = kit.teeth[fdi];
    if (!mesh) continue;
    mesh.rotation.y += rot * amount;
    const c = worldCenter(mesh);
    const inward = kit.archCenter.clone().sub(c);
    inward.y = 0;
    if (inward.lengthSq() > 1e-6) {
      inward.normalize();
      mesh.position.add(inward.multiplyScalar(0.08 * amount));
    }
  }
}

export function applySpacing(kit, amount = 0.35) {
  const list = ["12", "11", "21", "22", "32", "31", "41", "42"];
  for (const fdi of list) {
    const mesh = kit.teeth[fdi];
    if (!mesh) continue;
    const c = worldCenter(mesh);
    const outward = new THREE.Vector3(c.x - kit.archCenter.x, 0, 0);
    if (outward.lengthSq() < 1e-6) outward.set(fdi.endsWith("1") ? (fdi[0] === "1" || fdi[0] === "4" ? -1 : 1) : 1, 0, 0);
    outward.normalize();
    mesh.position.add(outward.multiplyScalar(0.12 * amount));
  }
}

/**
 * Clone jaw.glb, apply PBR materials, optionally hide teeth / soft tissue / bone,
 * clip the skull base, and slightly open the mouth.
 *
 * @returns {Promise<{
 *   root: THREE.Group,
 *   overlay: THREE.Group,
 *   teeth: Record<string, THREE.Mesh>,
 *   bones: THREE.Mesh[],
 *   gums: THREE.Mesh[],
 *   tongue: THREE.Mesh|null,
 *   archCenter: THREE.Vector3,
 *   teethBox: THREE.Box3,
 *   clippingPlane: THREE.Plane|null,
 *   syncClip: Function,
 *   mats: object
 * }>}
 */
export async function cloneJaw(base, opts = {}) {
  const {
    teeth = "all", // 'all' | 'upper' | 'lower' | string[]
    hideTeeth = [],
    missingTeeth = [],
    showGingiva = true,
    showBone = true,
    showTongue = false,
    boneOpacity = 0.62,
    gumOpacity = 0.82,
    tongueOpacity = 0.7,
    clipSkull = true,
    openMouth = 0,
    isolateTeeth = null, // string[] — hide every other tooth
    keepSoftOnIsolate = true,
    keepBoneOnIsolate = true,
    clipToFocus = false,
  } = opts;

  const gltf = await loadJawGltf(base);
  const root = gltf.scene.clone(true);
  root.name = "jawClone";

  const toothMap = {};
  const bones = [];
  const gums = [];
  let tongue = null;
  const boneMat = boneMaterial({ opacity: boneOpacity });
  const gumMat = gumMaterial({ opacity: gumOpacity });
  const tongMat = tongueMaterial({ opacity: tongueOpacity });
  const lowerNodes = [];

  root.updateMatrixWorld(true);
  const meshes = [];
  root.traverse((o) => { if (o.isMesh) meshes.push(o); });

  for (const o of meshes) {
    const n = o.name;
    if (n.startsWith("tooth_")) {
      const m = new THREE.MeshPhysicalMaterial(TOOTH_BASE);
      o.material = m;
      o.castShadow = true;
      toothMap[n.slice(6)] = o;
      if (Number(n[6]) >= 3) lowerNodes.push(o);
    } else if (n.startsWith("bone_")) {
      o.material = boneMat;
      bones.push(o);
      if (n.includes("mandible")) lowerNodes.push(o);
    } else if (n === "tongue") {
      o.material = tongMat;
      tongue = o;
      lowerNodes.push(o);
    } else if (n.startsWith("gum_")) {
      o.material = gumMat;
      gums.push(o);
      if (n === "gum_lower") lowerNodes.push(o);
    }
  }

  const tbox = new THREE.Box3();
  Object.values(toothMap).forEach((t) => tbox.expandByObject(t));
  const archCenter = tbox.getCenter(new THREE.Vector3());

  // Visibility: arch filter
  const allowed = new Set(
    teeth === "all" ? Object.keys(toothMap)
      : teeth === "upper" ? UPPER_ORDER
      : teeth === "lower" ? LOWER_ORDER
      : Array.isArray(teeth) ? teeth : Object.keys(toothMap)
  );
  const hidden = new Set([...(hideTeeth || []), ...(missingTeeth || [])]);
  if (isolateTeeth && isolateTeeth.length) {
    const iso = new Set(isolateTeeth);
    for (const fdi of Object.keys(toothMap)) {
      if (!iso.has(fdi)) hidden.add(fdi);
    }
  }
  for (const [fdi, mesh] of Object.entries(toothMap)) {
    mesh.visible = allowed.has(fdi) && !hidden.has(fdi);
  }

  for (const g of gums) g.visible = !!showGingiva && (keepSoftOnIsolate || !isolateTeeth);
  for (const b of bones) b.visible = !!showBone && (keepBoneOnIsolate || !isolateTeeth);
  if (tongue) tongue.visible = !!showTongue;

  // Open mouth: hinge the mandible
  let lowerGroup = null;
  if (openMouth) {
    const mand = meshes.find((n) => n.name === "bone_mandible");
    lowerGroup = new THREE.Group();
    lowerGroup.name = "mandibleHinge";
    root.add(lowerGroup);
    if (mand) {
      const mb = new THREE.Box3().setFromObject(mand);
      const hinge = new THREE.Vector3(
        0,
        mb.max.y - (mb.max.y - mb.min.y) * 0.08,
        mb.min.z + (mb.max.z - mb.min.z) * 0.12
      );
      lowerGroup.position.copy(hinge);
    }
    lowerNodes.forEach((o) => lowerGroup.attach(o));
    lowerGroup.rotation.x = openMouth;
  }

  const clippingPlane = clipSkull
    ? new THREE.Plane(new THREE.Vector3(0, -1, 0), tbox.max.y + 1.0)
    : null;
  const focusPlanes = [];

  if (clipToFocus && isolateTeeth && isolateTeeth.length) {
    const fb = new THREE.Box3();
    isolateTeeth.forEach((fdi) => {
      if (toothMap[fdi]) fb.expandByObject(toothMap[fdi]);
    });
    fb.expandByScalar(1.15);
    const min = fb.min;
    const max = fb.max;
    focusPlanes.push(
      new THREE.Plane(new THREE.Vector3(1, 0, 0), -min.x),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), max.x),
      new THREE.Plane(new THREE.Vector3(0, 1, 0), -min.y),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), max.y),
      new THREE.Plane(new THREE.Vector3(0, 0, 1), -min.z),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), max.z)
    );
  }

  const allPlanes = [...(clippingPlane ? [clippingPlane] : []), ...focusPlanes];
  if (allPlanes.length) {
    for (const m of [boneMat, gumMat, tongMat]) {
      m.clippingPlanes = allPlanes;
      m.clipShadows = true;
    }
  }

  // Local-space planes so we can rewrite them after the holder is scaled/rotated.
  const localPlanes = allPlanes.map((p) => ({
    plane: p,
    localNormal: p.normal.clone(),
    localConstant: p.constant,
  }));

  function trackPlane(plane) {
    // Snapshot in current root-local space (identity at clone time).
    localPlanes.push({
      plane,
      localNormal: plane.normal.clone(),
      localConstant: plane.constant,
    });
  }

  function syncClip() {
    if (!localPlanes.length) return;
    root.updateWorldMatrix(true, true);
    const nm = new THREE.Matrix3().getNormalMatrix(root.matrixWorld);
    const tmpN = new THREE.Vector3();
    const tmpP = new THREE.Vector3();
    for (const lp of localPlanes) {
      // A point on the local plane: n·x + c = 0 → pick point = -c * n (if |n|=1)
      tmpN.copy(lp.localNormal).normalize();
      tmpP.copy(tmpN).multiplyScalar(-lp.localConstant);
      tmpP.applyMatrix4(root.matrixWorld);
      tmpN.applyMatrix3(nm).normalize();
      lp.plane.normal.copy(tmpN);
      lp.plane.constant = -tmpN.dot(tmpP);
    }
  }

  const overlay = new THREE.Group();
  overlay.name = "topicOverlay";
  root.add(overlay);

  return {
    root,
    overlay,
    teeth: toothMap,
    bones,
    gums,
    tongue,
    lowerGroup,
    archCenter,
    teethBox: tbox,
    clippingPlane,
    needsClip: allPlanes.length > 0,
    trackPlane,
    syncClip,
    mats: { bone: boneMat, gum: gumMat, tongue: tongMat },
  };
}
