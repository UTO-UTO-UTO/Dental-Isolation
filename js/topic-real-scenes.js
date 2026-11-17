/**
 * Realistic atlas topic scenes built on jaw.glb + procedural appliances.
 * Box/block teeth are not used. Implant fixtures stay the original
 * procedural titanium from implant-geometry / topic-parts.
 */
import { THREE } from "./stage.js";
import * as P from "./topic-parts.js";
import * as J from "./jaw-kit.js";

const PEDO_NOTE = "（模型无乳牙，以缩小的恒牙示意）";

function visibleGraftMat() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xe39a3c,
    roughness: 0.55,
    metalness: 0.05,
  });
}
function visibleMembraneMat() {
  return new THREE.MeshPhysicalMaterial({
    color: 0x3f8f88,
    roughness: 0.28,
    metalness: 0,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}
function addEdges(mesh, color = 0x2f7772, threshold = 28) {
  if (!mesh || !mesh.geometry) return;
  const eg = new THREE.EdgesGeometry(mesh.geometry, threshold);
  const lines = new THREE.LineSegments(
    eg,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 })
  );
  mesh.add(lines);
}


function hash01(i, salt) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Packed graft granules (deterministic) so patients see particles, not one blob. */
function addParticulateGraft(parent, origin, buccal, along, opts = {}) {
  const {
    count = 42,
    alongSpan = 0.42,
    buccalMin = 0.06,
    buccalMax = 0.18,
    lateral = 0.14,
    rMin = 0.04,
    rMax = 0.07,
    salt = 1,
  } = opts;
  const mat = visibleGraftMat();
  const group = new THREE.Group();
  group.name = "particulateGraft";
  const uB = buccal.clone().normalize();
  const uA = along.clone().normalize();
  const side = new THREE.Vector3().crossVectors(uB, uA);
  if (side.lengthSq() < 1e-8) side.set(1, 0, 0);
  side.normalize();
  for (let i = 0; i < count; i++) {
    const r = rMin + hash01(i, salt) * (rMax - rMin);
    const grain = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), mat);
    const a = (hash01(i, salt + 1) - 0.08) * alongSpan;
    const b = buccalMin + hash01(i, salt + 2) * (buccalMax - buccalMin);
    const s = (hash01(i, salt + 3) - 0.5) * 2 * lateral;
    grain.position.copy(origin)
      .add(uA.clone().multiplyScalar(a))
      .add(uB.clone().multiplyScalar(b))
      .add(side.clone().multiplyScalar(s));
    grain.castShadow = true;
    group.add(grain);
  }
  parent.add(group);
  return group;
}

/** Thin covering membrane sheet, not a featureless dome. */
function addMembraneSheet(parent, origin, buccal, along, opts = {}) {
  const { radius = 0.34, bulge = 0.55, buccalOff = 0.13, alongOff = 0.1 } = opts;
  const mat = visibleMembraneMat();
  const mem = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 18, 12, 0, Math.PI, Math.PI * 0.18, Math.PI * 0.64),
    mat
  );
  mem.scale.set(1.15, 0.95, bulge);
  mem.position.copy(origin)
    .add(buccal.clone().normalize().multiplyScalar(buccalOff))
    .add(along.clone().normalize().multiplyScalar(alongOff));
  mem.lookAt(mem.position.clone().add(buccal.clone().normalize()));
  mem.name = "membrane";
  addEdges(mem, 0x2f7772, 22);
  parent.add(mem);
  return mem;
}



function applianceOf(preset) {
  if (preset.appliance) return preset.appliance;
  const cap = preset.caption || "";
  const id = preset.id || "";
  if (/twin-?block/i.test(cap) || /twinblock/i.test(id)) return "twinblock";
  if (/frankel/i.test(cap) || /frankel/i.test(id)) return "frankel";
  if (preset.hawley) return "hawley";
  return "";
}

function addBuccalCutaway(kit, fdi, { inset = 0.08 } = {}) {
  const mesh = kit.teeth[fdi];
  if (!mesh) return null;
  const fa = J.facialAnchor(mesh, fdi, kit.archCenter);
  const origin = fa.origin.clone().add(fa.buccal.clone().multiplyScalar(-inset));
  const plane = new THREE.Plane();
  plane.setFromNormalAndCoplanarPoint(fa.buccal.clone().negate(), origin);
  for (const m of [kit.mats.bone, kit.mats.gum]) {
    if (!m) continue;
    const planes = m.clippingPlanes ? m.clippingPlanes.slice() : [];
    planes.push(plane);
    m.clippingPlanes = planes;
    m.clipShadows = true;
    m.transparent = true;
    if (m.opacity > 0.7) m.opacity = 0.7;
  }
  kit.trackPlane(plane);
  return plane;
}

function setFocus(kit, fdis, { includeOverlay = true, pad = 0.5 } = {}) {
  const box = new THREE.Box3();
  let any = false;
  for (const fdi of fdis || []) {
    const mesh = kit.teeth[fdi];
    if (!mesh) continue;
    box.expandByObject(mesh);
    any = true;
  }
  if (includeOverlay && kit.overlay) {
    kit.overlay.updateWorldMatrix(true, true);
    const ob = new THREE.Box3().setFromObject(kit.overlay);
    if (!ob.isEmpty()) {
      box.union(ob);
      any = true;
    }
  }
  if (!any) return;
  box.expandByScalar(pad);
  kit.root.userData.focus = box;
}

function finish(kit, fdis, extra = {}) {
  if (extra.cutaway) addBuccalCutaway(kit, extra.cutaway, extra.cutawayOpts || {});
  const focusOpts = { pad: 0.28, ...(extra.focusOpts || {}) };
  setFocus(kit, fdis, focusOpts);
  if (extra.camDir) {
    kit.root.userData.camDir = extra.camDir;
  } else if (extra.cutaway && kit.teeth[extra.cutaway]) {
    const fa = J.facialAnchor(kit.teeth[extra.cutaway], extra.cutaway, kit.archCenter);
    const cam = fa.buccal.clone().multiplyScalar(1.0).add(new THREE.Vector3(0, 0.35, 0.2));
    kit.root.userData.camDir = cam.normalize();
  }
  if (extra.captionSuffix) kit.root.userData.captionSuffix = extra.captionSuffix;
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = !!(kit.needsClip || (kit.mats.bone && kit.mats.bone.clippingPlanes && kit.mats.bone.clippingPlanes.length));
  return kit.root;
}

function palatalMid(kit, fdis) {
  const pts = [];
  for (const fdi of fdis) {
    const mesh = kit.teeth[fdi];
    if (!mesh) continue;
    const fa = J.facialAnchor(mesh, fdi, kit.archCenter, { lingual: true });
    pts.push(fa.pos.clone().add(fa.buccal.clone().multiplyScalar(-0.28)));
  }
  if (!pts.length) return new THREE.Vector3(0, 0.15, 0.2);
  const mid = pts.reduce((a, p) => a.add(p), new THREE.Vector3()).multiplyScalar(1 / pts.length);
  return mid;
}

function placeBiteBlock(kit, fdis, { up = true, height = 0.28 } = {}) {
  const mat = P.mats.acrylic();
  for (const fdi of fdis) {
    const mesh = kit.teeth[fdi];
    if (!mesh) continue;
    const fa = J.facialAnchor(mesh, fdi, kit.archCenter);
    const blk = new THREE.Mesh(
      new THREE.BoxGeometry(Math.max(fa.size.x, 0.35) * 0.95, height, Math.max(fa.size.z, 0.4) * 0.9),
      mat
    );
    const oc = J.occlusalDir(fdi);
    blk.position.copy(fa.center).add(oc.clone().multiplyScalar(fa.toothSize * 0.22 + height * 0.35));
    kit.overlay.add(blk);
  }
}

export async function composeTopicModel(preset, { base, crownMesh } = {}) {
  const kind = preset.kind || "tooth";
  switch (kind) {
    case "implant":
      return composeSeatedImplant(preset, { base, crownMesh });
    case "multi":
      return composeMulti(preset, { base, crownMesh });
    case "implantRow":
      return composeImplantRow(preset, { base, crownMesh });
    case "sinus":
      return composeSinus(preset, { base, crownMesh });
    case "gbr":
      return composeGbr(preset, { base, crownMesh });
    case "split":
      return composeSplit(preset, { base, crownMesh });
    case "softTissue":
      return composeSoftTissue(preset, { base, crownMesh });
    case "guided":
      return composeGuided(preset, { base, crownMesh });
    case "impression":
      return composeImpression(preset, { base, crownMesh });
    case "compare":
      return composeCompare(preset, { base, crownMesh });
    case "boneQuality":
      return composeBoneQuality(preset, { base, crownMesh });
    case "tooth":
      return composeTooth(preset, { base });
    case "arch":
      return composeArch(preset, { base });
    case "space":
      return composeSpace(preset, { base });
    case "denture":
      return composeDenture(preset, { base });
    case "bridge":
      return composeBridge(preset, { base });
    case "hygiene":
      return composeHygiene(preset, { base });
    case "scan":
      return composeScan(preset, { base });
    case "tad":
      return composeTad(preset, { base });
    case "expander":
      return composeExpander(preset, { base });
    case "mouthguard":
      return composeMouthguard(preset, { base });
    case "sealant":
      return composeSealant(preset, { base });
    case "ssc":
      return composeSsc(preset, { base });
    default:
      return composeTooth(preset, { base });
  }
}

function implantStack(opts, crownMesh) {
  return P.makeImplantStack({
    crown: opts.crown !== false && !opts.healing,
    screw: opts.screw !== false && !opts.healing,
    abutment: opts.abutment !== false && !opts.healing,
    healing: !!opts.healing,
    tempCrown: !!opts.tempCrown,
    customAbutment: !!opts.customAbutment,
    fixture: opts.fixture !== false,
    crownMesh: opts.crown === false || opts.healing ? null : (crownMesh ? crownMesh.clone(true) : null),
  });
}

function siteOf(preset, fallback = "16") {
  return preset.site || preset.fdi || fallback;
}

async function composeSeatedImplant(preset, { base, crownMesh }) {
  const fdi = siteOf(preset, preset.anterior ? "11" : "16");
  const kit = await J.cloneJaw(base, {
    showTongue: false,
    showBone: true,
    showGingiva: true,
    boneOpacity: 0.5,
    gumOpacity: 0.78,
    clipSkull: true,
    openMouth: 0.08,
    missingTeeth: [fdi],
    isolateTeeth: [fdi].concat(J.neighborsOf(fdi)),
    keepSoftOnIsolate: true,
    keepBoneOnIsolate: true,
    clipToFocus: true,
    clipPad: 0.7,
  });
  const stack = implantStack({
    healing: !!preset.healing,
    tempCrown: !!preset.tempCrown,
    customAbutment: !!preset.customAbutment,
  }, crownMesh);
  J.placeImplantAtTooth(kit, fdi, stack, { sink: 0.04 });
  J.faceOutward(kit, fdi, { amount: 0.45 });
  if (preset.explode) P.applyExplode(stack.userData.parts, preset.explode);
  if (preset.highlight) P.highlightPart(stack.userData.parts, preset.highlight);
  kit.overlay.add(stack);
  kit.root.userData.parts = stack.userData.parts;
  return finish(kit, [fdi], { cutaway: fdi, cutawayOpts: { inset: preset.explode >= 0.4 ? 0.05 : 0.12 }, focusOpts: { pad: 0.32 } });
}

function allOnSites(count) {
  if (count <= 2) return [{ fdi: "13", tilt: 0 }, { fdi: "23", tilt: 0 }];
  if (count <= 4) {
    return [
      { fdi: "15", tilt: 28 },
      { fdi: "12", tilt: 0 },
      { fdi: "22", tilt: 0 },
      { fdi: "25", tilt: 28 },
    ];
  }
  return [
    { fdi: "16", tilt: 22 },
    { fdi: "14", tilt: 0 },
    { fdi: "12", tilt: 0 },
    { fdi: "22", tilt: 0 },
    { fdi: "24", tilt: 0 },
    { fdi: "26", tilt: 22 },
  ];
}

async function composeMulti(preset, { base, crownMesh }) {
  const count = preset.count || 4;
  const sites = allOnSites(count);
  const missing = J.UPPER_ORDER.slice();
  const kit = await J.cloneJaw(base, {
    teeth: "lower",
    showTongue: false,
    showBone: true,
    showGingiva: true,
    boneOpacity: 0.55,
    gumOpacity: 0.7,
    clipSkull: true,
    openMouth: 0.22,
    missingTeeth: missing,
  });
  // Hide upper teeth (edentulous maxilla) — already hidden via teeth:'lower'
  // but we still need upper tooth transforms for implant sites; they're present, just not visible? 
  // teeth:'lower' sets upper mesh.visible=false but keeps the meshes. Good.

  const stacks = [];
  const platformPts = [];
  for (const s of sites) {
    const stack = implantStack({
      crown: false,
      screw: false,
      abutment: !preset.locators,
      healing: false,
      fixture: true,
    }, crownMesh);
    J.placeImplantAtTooth(kit, s.fdi, stack, { tiltDeg: preset.angled === false ? 0 : s.tilt, sink: 0.05 });
    kit.overlay.add(stack);
    stacks.push(stack);
    // platform world position
    stack.updateWorldMatrix(true, true);
    const p = new THREE.Vector3();
    stack.getWorldPosition(p);
    platformPts.push(p);
  }

  if (preset.zygoma) {
    for (const fdi of ["16", "26"]) {
      const mesh = kit.teeth[fdi];
      if (!mesh) continue;
      const fa = J.facialAnchor(mesh, fdi, kit.archCenter);
      const long = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.12, 2.4, 20),
        P.mats.titanium()
      );
      const dir = fa.buccal.clone().multiplyScalar(0.6).add(new THREE.Vector3(0, 1, 0)).normalize();
      long.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      long.position.copy(fa.origin).add(dir.multiplyScalar(0.9));
      kit.overlay.add(long);
    }
  }

  if ((preset.bar || preset.locators) && platformPts.length >= 2) {
    const bar = J.tubeAlong(platformPts, 0.07, P.mats.titaniumLight(), { tubular: 64 });
    if (bar) kit.overlay.add(bar);
  }

  if (preset.locators) {
    for (const stack of stacks) {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.22, 20), P.mats.titanium());
      const nub = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), P.mats.titaniumLight());
      cap.position.y = 0.18;
      nub.position.y = 0.32;
      stack.add(cap, nub);
    }
    const denture = J.makeFullArchProsthesis(kit, { arch: "upper", lift: 0.42, flangeRadius: 0.42 });
    kit.overlay.add(denture);
  } else if (preset.bridge !== false) {
    const pros = J.makeFullArchProsthesis(kit, { arch: "upper", lift: 0.28, flangeRadius: 0.4 });
    kit.overlay.add(pros);
  }

  return finish(kit, J.UPPER_ORDER.slice(), { focusOpts: { pad: 0.7 } });
}

async function composeImplantRow(preset, { base, crownMesh }) {
  const n = preset.count || 2;
  // Two or three adjacent upper posteriors, e.g. 15-16 or 14-15-16
  const row = n >= 3 ? ["14", "15", "16"] : ["15", "16"];
  const kit = await J.cloneJaw(base, {
    showTongue: false,
    showBone: true,
    showGingiva: true,
    boneOpacity: 0.5,
    gumOpacity: 0.8,
    clipSkull: true,
    openMouth: 0.1,
    missingTeeth: row,
  });
  const stacks = [];
  for (const fdi of row) {
    const stack = implantStack({ crown: !preset.bridge, screw: !preset.bridge, abutment: true }, crownMesh);
    J.placeImplantAtTooth(kit, fdi, stack, { sink: 0.04 });
    kit.overlay.add(stack);
    stacks.push(stack);
  }
  if (preset.bridge) {
    // Crown shells of the missing teeth as a connected bridge
    const mat = J.ceramicMaterial("crown");
    const pts = [];
    for (const fdi of row) {
      const mesh = kit.teeth[fdi];
      if (!mesh) continue;
      const shell = J.cutShell(mesh, fdi, mat.clone(), { frac: 0.42, scale: 1.0 });
      kit.overlay.add(shell);
      pts.push(J.worldCenter(mesh));
    }
    if (pts.length >= 2) {
      const rod = J.tubeAlong(pts, 0.08, P.mats.zirconia());
      if (rod) kit.overlay.add(rod);
    }
    if (stacks[0] && stacks[0].userData.parts) {
      kit.root.userData.parts = stacks[0].userData.parts;
    }
  }
  return finish(kit, ["14", "15", "16", "17"], { cutaway: "15", cutawayOpts: { inset: 0.08 }, focusOpts: { pad: 0.7 } });
}

async function composeSinus(preset, { base, crownMesh }) {
  const fdi = "16";
  const kit = await J.cloneJaw(base, {
    teeth: "upper",
    showTongue: false,
    showBone: true,
    showGingiva: true,
    boneOpacity: 0.55,
    gumOpacity: 0.55,
    clipSkull: true,
    missingTeeth: [fdi],
    isolateTeeth: [fdi].concat(J.neighborsOf(fdi)),
    keepSoftOnIsolate: true,
    keepBoneOnIsolate: true,
    clipToFocus: true,
    clipPad: 0.75,
  });
  const stack = implantStack({
    crown: false,
    screw: false,
    abutment: false,
    fixture: true,
    healing: true,
  }, crownMesh);
  J.placeImplantAtTooth(kit, fdi, stack, { sink: 0.02 });
  kit.overlay.add(stack);
  J.faceOutward(kit, fdi, { amount: 0.6 });
  const fa = J.facialAnchor(kit.teeth[fdi], fdi, kit.archCenter);
  const origin = stack.position.clone();
  const apical = J.gingivalDir(fdi);
  const buccal = fa.buccal.clone();

  const floorMat = new THREE.MeshPhysicalMaterial({
    color: 0xe6d4c8,
    roughness: 0.42,
    metalness: 0,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const lifted = new THREE.Mesh(
    new THREE.SphereGeometry(0.52, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
    floorMat
  );
  lifted.scale.set(1.15, 0.5, 1.0);
  lifted.position.copy(origin).add(apical.clone().multiplyScalar(0.72));
  lifted.name = "sinusFloor";
  addEdges(lifted, 0xb89888, 24);
  kit.overlay.add(lifted);

  addParticulateGraft(
    kit.overlay,
    origin.clone().add(apical.clone().multiplyScalar(0.48)),
    buccal,
    apical,
    { count: 56, alongSpan: 0.4, buccalMin: -0.06, buccalMax: 0.2, lateral: 0.16, salt: 7 }
  );

  if (preset.external) {
    const windowPos = origin.clone()
      .add(apical.clone().multiplyScalar(0.58))
      .add(buccal.clone().multiplyScalar(0.28));
    const window = new THREE.Mesh(new THREE.CircleGeometry(0.26, 24), P.mats.membrane());
    window.position.copy(windowPos);
    window.lookAt(windowPos.clone().add(buccal));
    kit.overlay.add(window);
    const frame = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.024, 8, 24), P.mats.titaniumLight());
    frame.position.copy(window.position);
    frame.quaternion.copy(window.quaternion);
    kit.overlay.add(frame);
  }

  kit.root.userData.parts = stack.userData.parts;
  return finish(kit, [fdi, "15", "17"], {
    cutaway: fdi,
    cutawayOpts: { inset: 0.08 },
    focusOpts: { pad: 0.34 },
  });
}

async function composeGbr(preset, { base, crownMesh }) {
  const fdi = "16";
  const isSocket = (preset.caption || "").includes("拔牙") || (preset.labels || []).some((l) => l.includes("拔牙"));
  const kit = await J.cloneJaw(base, {
    showTongue: false,
    showBone: true,
    showGingiva: true,
    boneOpacity: 0.55,
    gumOpacity: 0.55,
    clipSkull: true,
    openMouth: 0.06,
    missingTeeth: [fdi],
    isolateTeeth: [fdi].concat(J.neighborsOf(fdi)),
    keepSoftOnIsolate: true,
    keepBoneOnIsolate: true,
    clipToFocus: true,
    clipPad: 0.75,
  });

  const apical = J.gingivalDir(fdi);
  if (!isSocket) {
    const stack = implantStack({
      crown: false,
      screw: false,
      abutment: false,
      healing: true,
    }, crownMesh);
    J.placeImplantAtTooth(kit, fdi, stack, { sink: 0.05 });
    kit.overlay.add(stack);
    kit.root.userData.parts = stack.userData.parts;
  }

  J.faceOutward(kit, fdi, { amount: 0.6 });
  const fa = J.facialAnchor(kit.teeth[fdi], fdi, kit.archCenter);
  const buccal = fa.buccal.clone();
  const origin = fa.origin.clone();
  const placed = kit.overlay.children.find((c) => c.userData && c.userData.parts);
  if (placed && placed.position) origin.copy(placed.position);

  if (preset.block) {
    const blk = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.34, 0.16),
      visibleGraftMat()
    );
    addEdges(blk, 0xc9905e, 18);
    blk.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), buccal);
    blk.position.copy(origin)
      .add(buccal.clone().multiplyScalar(0.16))
      .add(apical.clone().multiplyScalar(0.12));
    kit.overlay.add(blk);
    for (const dy of [-0.1, 0.1]) {
      const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.022, 0.36, 10), P.mats.titanium());
      sc.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), buccal);
      sc.position.copy(blk.position).add(new THREE.Vector3(0, dy, 0)).add(buccal.clone().multiplyScalar(0.02));
      kit.overlay.add(sc);
    }
  } else {
    addParticulateGraft(
      kit.overlay,
      origin.clone().add(apical.clone().multiplyScalar(isSocket ? 0.02 : 0.08)),
      buccal,
      apical,
      {
        count: isSocket ? 36 : 46,
        alongSpan: isSocket ? 0.28 : 0.4,
        buccalMin: isSocket ? 0.02 : 0.07,
        buccalMax: isSocket ? 0.14 : 0.18,
        lateral: 0.13,
        salt: isSocket ? 3 : 11,
      }
    );
  }

  addMembraneSheet(
    kit.overlay,
    origin,
    buccal,
    apical,
    { radius: isSocket ? 0.28 : 0.32, bulge: 0.5, buccalOff: 0.16, alongOff: 0.08 }
  );

  return finish(kit, [fdi, "15", "17"], {
    cutaway: fdi,
    cutawayOpts: { inset: 0.08 },
    focusOpts: { pad: 0.34 },
  });
}

async function composeSplit(preset, { base, crownMesh }) {
  const fdi = "14";
  const kit = await J.cloneJaw(base, {
    showTongue: false,
    showBone: true,
    showGingiva: false,
    boneOpacity: 0.7,
    clipSkull: true,
    missingTeeth: [fdi],
  });
  const fa = J.facialAnchor(kit.teeth[fdi], fdi, kit.archCenter);
  const graft = J.makeOrganicBlob(0.34, visibleGraftMat(), { flatten: 0.8, distort: 0.15 });
  addEdges(graft, 0xc9905e, 30);
  graft.scale.set(0.6, 1.1, 1.3);
  graft.position.copy(fa.origin);
  kit.overlay.add(graft);
  const stack = implantStack({ crown: false, healing: true, abutment: false, screw: false }, crownMesh);
  J.placeImplantAtTooth(kit, fdi, stack, { sink: 0.04 });
  kit.overlay.add(stack);
  kit.root.userData.parts = stack.userData.parts;
  return finish(kit, [fdi, "13", "15"], { cutaway: fdi, cutawayOpts: { inset: 0.12 }, focusOpts: { pad: 0.7 } });
}

async function composeSoftTissue(preset, { base, crownMesh }) {
  const fdi = "11";
  const kit = await J.cloneJaw(base, {
    teeth: "upper",
    showTongue: false,
    showBone: true,
    showGingiva: true,
    boneOpacity: 0.45,
    gumOpacity: 0.7,
    clipSkull: true,
    missingTeeth: [fdi],
  });
  const stack = implantStack({ healing: true, crown: false, abutment: false, screw: false }, crownMesh);
  J.placeImplantAtTooth(kit, fdi, stack, { sink: 0.03 });
  kit.overlay.add(stack);
  const fa = J.facialAnchor(kit.teeth[fdi], fdi, kit.archCenter);
  const graft = J.makeOrganicBlob(0.35, P.mats.gingiva(), { flatten: 0.45, distort: 0.2 });
  graft.position.copy(fa.origin).add(fa.buccal.clone().multiplyScalar(0.28));
  kit.overlay.add(graft);
  kit.root.userData.parts = stack.userData.parts;
  return finish(kit, [fdi, "12", "21"], { cutaway: fdi, cutawayOpts: { inset: 0.06 }, focusOpts: { pad: 0.7 } });
}

async function composeGuided(preset, { base, crownMesh }) {
  const fdi = "16";
  const kit = await J.cloneJaw(base, {
    showTongue: false,
    showBone: true,
    showGingiva: true,
    boneOpacity: 0.45,
    gumOpacity: 0.7,
    clipSkull: true,
    openMouth: 0.1,
    missingTeeth: [fdi],
  });
  const stack = implantStack({ crown: false, healing: false, abutment: false, screw: false }, crownMesh);
  J.placeImplantAtTooth(kit, fdi, stack, { sink: 0.02 });
  kit.overlay.add(stack);

  // Surgical guide: offset clinical crowns of neighbors + a connecting plate
  const guideMat = new THREE.MeshPhysicalMaterial({
    color: 0x88b0c8,
    roughness: 0.3,
    metalness: 0.05,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const neighbors = ["17", "15", "14"];
  const pts = [];
  for (const n of neighbors) {
    const mesh = kit.teeth[n];
    if (!mesh) continue;
    const shell = J.cutShell(mesh, n, guideMat, { frac: 0.45, scale: 1.08 });
    shell.renderOrder = 2;
    kit.overlay.add(shell);
    pts.push(J.facialAnchor(mesh, n, kit.archCenter).origin);
  }
  const site = J.facialAnchor(kit.teeth[fdi], fdi, kit.archCenter);
  pts.splice(1, 0, site.origin);
  if (pts.length >= 2) {
    const plate = J.tubeAlong(pts, 0.18, guideMat, { tubular: 48 });
    if (plate) kit.overlay.add(plate);
  }
  const sleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.45, 20, 1, true),
    P.mats.titanium()
  );
  sleeve.quaternion.copy(stack.quaternion);
  sleeve.position.copy(stack.position).add(J.occlusalDir(fdi).multiplyScalar(0.25));
  kit.overlay.add(sleeve);

  kit.root.userData.parts = stack.userData.parts;
  return finish(kit, [fdi, "15", "17"], { focusOpts: { pad: 0.75 } });
}

async function composeImpression(preset, { base, crownMesh }) {
  const fdi = "16";
  const kit = await J.cloneJaw(base, {
    teeth: "upper",
    showTongue: false,
    showBone: false,
    showGingiva: true,
    gumOpacity: 0.85,
    clipSkull: true,
    missingTeeth: [fdi],
  });
  const stack = implantStack({ healing: false, crown: false, screw: false, abutment: true }, crownMesh);
  J.placeImplantAtTooth(kit, fdi, stack, { sink: 0.02 });
  kit.overlay.add(stack);

  // Curved tray following the upper arch (not a box)
  const pts = J.UPPER_ORDER.map((id) => {
    const m = kit.teeth[id];
    if (!m) return null;
    const fa = J.facialAnchor(m, id, kit.archCenter);
    return fa.origin.clone().add(J.occlusalDir(id).multiplyScalar(0.45));
  }).filter(Boolean);
  if (pts.length >= 3) {
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, 0.55, 0.18, 0, Math.PI * 2, false, 0);
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    const tray = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, { extrudePath: curve, steps: 64, bevelEnabled: false }),
      new THREE.MeshStandardMaterial({ color: 0xb0b8c0, metalness: 0.3, roughness: 0.4 })
    );
    kit.overlay.add(tray);
    const putty = new THREE.Mesh(
      new THREE.ExtrudeGeometry(
        (() => { const s = new THREE.Shape(); s.absellipse(0, 0, 0.4, 0.12, 0, Math.PI * 2, false, 0); return s; })(),
        { extrudePath: curve, steps: 64, bevelEnabled: false }
      ),
      new THREE.MeshPhysicalMaterial({ color: 0xc4a060, roughness: 0.6 })
    );
    putty.position.y -= 0.02;
    kit.overlay.add(putty);
  }
  kit.root.userData.parts = stack.userData.parts;
  return finish(kit, [fdi, "15", "17"], { focusOpts: { pad: 0.7 } });
}

async function composeCompare(preset, { base, crownMesh }) {
  // Full-arch implant bridge as a realistic stand-in for “options” topics.
  return composeMulti({ ...preset, count: preset.count || 4, bridge: true, angled: true }, { base, crownMesh });
}

async function composeBoneQuality(preset, { base, crownMesh }) {
  // Real mandible with 4 implants at 44-47, bone opacity varying per site via local blobs
  const sites = ["44", "45", "46", "47"];
  const kit = await J.cloneJaw(base, {
    teeth: "lower",
    showTongue: false,
    showBone: true,
    showGingiva: false,
    boneOpacity: 0.55,
    clipSkull: true,
    missingTeeth: sites,
  });
  const opac = [0.9, 0.7, 0.5, 0.32];
  const colors = [0xd0c8b4, 0xe0d8c8, 0xe8e0d0, 0xf0eae0];
  sites.forEach((fdi, i) => {
    const stack = implantStack({ crown: false, healing: true, abutment: false, screw: false }, crownMesh);
    J.placeImplantAtTooth(kit, fdi, stack, { sink: 0.04 });
    kit.overlay.add(stack);
    const fa = J.facialAnchor(kit.teeth[fdi], fdi, kit.archCenter);
    const halo = J.makeOrganicBlob(0.55, new THREE.MeshPhysicalMaterial({
      color: colors[i],
      roughness: 0.7,
      transparent: true,
      opacity: opac[i],
      depthWrite: false,
    }), { flatten: 0.85, distort: 0.1 });
    halo.position.copy(fa.origin).add(J.gingivalDir(fdi).multiplyScalar(0.3));
    kit.overlay.add(halo);
  });
  return finish(kit, sites, { cutaway: "46", cutawayOpts: { inset: 0.12 }, focusOpts: { pad: 0.75 } });
}

async function composeTooth(preset, { base }) {
  const primary = !!preset.primary;
  let fdi = preset.fdi || (preset.veneer ? "11" : preset.crownRestore ? "16" : primary ? "75" : "14");
  // No primary mesh — use a nearby adult tooth
  if (fdi[1] === "8" || fdi[0] === "5" || fdi[0] === "6" || fdi[0] === "7" || fdi[0] === "8") {
    fdi = ({ "55": "15", "65": "25", "75": "35", "85": "45", "54": "14", "64": "24", "74": "34", "84": "44" }[fdi]) || (primary ? "35" : "14");
  }
  if (preset.veneer) fdi = "11";
  if (preset.inlay || preset.filling) fdi = fdi || "16";

  const neighbors = J.neighborsOf(fdi);
  const isolate = preset.cutaway || preset.showPulp || preset.veneer || preset.crownRestore || preset.post || preset.inlay || preset.filling || preset.caries || primary
    ? (preset.veneer ? ["12", "11", "21", "22"] : [fdi, ...neighbors.slice(0, 2)])
    : null;

  const kit = await J.cloneJaw(base, {
    showTongue: false,
    showBone: !preset.veneer && !preset.cutaway,
    showGingiva: !preset.cutaway,
    boneOpacity: preset.cutaway ? 0.28 : 0.5,
    gumOpacity: 0.85,
    clipSkull: true,
    isolateTeeth: isolate,
    keepSoftOnIsolate: !preset.cutaway,
    keepBoneOnIsolate: !preset.veneer && !preset.cutaway,
    clipToFocus: false,
    openMouth: isolate && !preset.veneer && !preset.cutaway ? 0 : (isolate ? 0 : 0.08),
  });

  if (primary) {
    J.setToothScale(kit, isolate || [fdi], 0.82);
    kit.root.userData.captionSuffix = PEDO_NOTE;
  }

  if (preset.veneer) {
    J.placeVeneer(kit, kit.overlay, fdi, { kind: preset.veneer === "resin" ? "resin" : "porcelain", explode: 0.85 });
  }
  if (preset.crownRestore) {
    J.placeCrownRestore(kit, kit.overlay, fdi, { kind: preset.crownRestore, explode: 0.25 });
  }
  if (preset.cutaway || preset.showPulp) {
    const mesh = kit.teeth[fdi];
    if (mesh) {
      const crown = J.cutShell(mesh, fdi, J.enamelMaterial(), { keep: "crown" });
      const root = J.cutShell(mesh, fdi, J.dentinMaterial(), { keep: "root" });
      // Half-cut: clip with a mid-sagittal plane so pulp can be seen
      const fa = J.facialAnchor(mesh, fdi, kit.archCenter);
      const midN = new THREE.Vector3().crossVectors(fa.buccal, J.occlusalDir(fdi)).normalize();
      const plane = new THREE.Plane();
      plane.setFromNormalAndCoplanarPoint(midN, fa.center);
      crown.material = crown.material.clone();
      root.material = root.material.clone();
      crown.material.clippingPlanes = [plane];
      root.material.clippingPlanes = [plane];
      crown.material.clipShadows = true;
      root.material.clipShadows = true;
      crown.material.transparent = true;
      crown.material.opacity = 0.85;
      kit.overlay.add(crown, root);
      mesh.visible = false;

      const pulp = new THREE.Mesh(
        new THREE.SphereGeometry(fa.toothSize * 0.08, 16, 12),
        P.mats.pulp()
      );
      pulp.position.copy(fa.origin).add(J.occlusalDir(fdi).multiplyScalar(fa.toothSize * 0.08));
      const canal = new THREE.Mesh(
        new THREE.CylinderGeometry(fa.toothSize * 0.03, fa.toothSize * 0.02, fa.toothSize * 0.45, 12),
        P.mats.pulp()
      );
      canal.position.copy(fa.origin).add(J.gingivalDir(fdi).multiplyScalar(fa.toothSize * 0.18));
      kit.overlay.add(pulp, canal);
      kit.trackPlane(plane);
      kit.needsClip = true;
      // Turn the cut face toward the camera
      const cutYaw = Math.atan2(midN.x, midN.z);
      kit.root.rotation.y += -cutYaw;
    }
  }
  if (preset.caries && kit.teeth[fdi]) {
    const fa = J.facialAnchor(kit.teeth[fdi], fdi, kit.archCenter);
    const lesion = new THREE.Mesh(
      new THREE.SphereGeometry(fa.toothSize * 0.08, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.8 })
    );
    lesion.position.copy(fa.pos).add(fa.buccal.clone().multiplyScalar(fa.toothSize * 0.02)).add(J.occlusalDir(fdi).multiplyScalar(fa.toothSize * 0.06));
    kit.overlay.add(lesion);
  }
  if (preset.filling && kit.teeth[fdi]) {
    const fa = J.facialAnchor(kit.teeth[fdi], fdi, kit.archCenter);
    const fillMat = preset.filling === "amalgam" ? P.mats.amalgam() : P.mats.resin();
    if (preset.filling === "gi") fillMat.color.setHex(0xc5e0d0);
    const fill = new THREE.Mesh(new THREE.SphereGeometry(fa.toothSize * 0.09, 12, 10), fillMat);
    fill.position.copy(fa.center).add(J.occlusalDir(fdi).multiplyScalar(fa.toothSize * 0.16));
    kit.overlay.add(fill);
  }
  if (preset.inlay && kit.teeth[fdi]) {
    const fa = J.facialAnchor(kit.teeth[fdi], fdi, kit.archCenter);
    const inl = new THREE.Mesh(
      new THREE.BoxGeometry(fa.size.x * 0.45, fa.size.y * 0.08, fa.size.z * 0.4),
      P.mats.ceramic(0xf2ebe0)
    );
    inl.position.copy(fa.center).add(J.occlusalDir(fdi).multiplyScalar(fa.toothSize * 0.18));
    kit.overlay.add(inl);
  }
  if (preset.post && kit.teeth[fdi]) {
    const fa = J.facialAnchor(kit.teeth[fdi], fdi, kit.archCenter);
    const axis = J.gingivalDir(fdi);
    const p = new THREE.Mesh(
      new THREE.CylinderGeometry(fa.toothSize * 0.05, fa.toothSize * 0.04, fa.toothSize * 0.4, 12),
      preset.post === "metal" ? P.mats.metal() : P.mats.resin()
    );
    p.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis);
    p.position.copy(fa.origin).add(axis.clone().multiplyScalar(fa.toothSize * 0.15));
    kit.overlay.add(p);
  }
  if (preset.boneLoss && kit.gums) {
    const drop = (preset.boneLoss || 0) * 0.25;
    for (const g of kit.gums) g.position.y -= drop;
    for (const b of kit.bones) b.position.y -= drop * 0.5;
  }

  const focusTeeth = (isolate || [fdi]).slice();
  return finish(kit, focusTeeth, { focusOpts: { pad: (preset.cutaway || preset.showPulp || preset.veneer || preset.post) ? 0.4 : 0.55 } });
}

async function composeArch(preset, { base }) {
  const palatal = !!(preset.hawley || applianceOf(preset));
  const kit = await J.cloneJaw(base, {
    teeth: palatal ? "upper" : "all",
    showTongue: false,
    showBone: false,
    showGingiva: true,
    gumOpacity: 0.88,
    clipSkull: true,
    openMouth: palatal ? 0 : (preset.aligner || preset.brackets ? 0.06 : 0.1),
  });
  if (palatal) {
    for (const g of kit.gums) {
      if (g.name === "gum_lower") g.visible = false;
    }
  }
  if (preset.crowding) J.applyCrowding(kit, preset.crowding);
  if (preset.spacing) J.applySpacing(kit, preset.spacing);

  if (preset.brackets) {
    J.placeBrackets(kit, kit.overlay, {
      style: preset.brackets === "ceramic" ? "ceramic" : "metal",
      selfLigating: !!preset.selfLigating,
      lingual: preset.brackets === "lingual",
      arch: "both",
    });
  }
  if (preset.aligner) {
    const mat = J.alignerMaterial(0x7eb8be);
    mat.opacity = 0.88;
    mat.transmission = 0.16;
    mat.thickness = 0.55;
    mat.depthWrite = false;
    J.placeAligners(kit, kit.overlay, { scale: 1.14, material: mat });
  }
  if (preset.attachments) {
    for (const fdi of ["13", "23", "14", "24", "33", "43"]) {
      const mesh = kit.teeth[fdi];
      if (!mesh) continue;
      const fa = J.facialAnchor(mesh, fdi, kit.archCenter);
      const att = new THREE.Mesh(
        new THREE.BoxGeometry(fa.toothSize * 0.12, fa.toothSize * 0.16, fa.toothSize * 0.07),
        P.mats.resin()
      );
      J.orientOnSurface(att, fa.pos, fa.buccal, fdi);
      att.position.add(fa.buccal.clone().multiplyScalar(fa.toothSize * 0.02));
      kit.overlay.add(att);
    }
  }
  if (preset.retainer) {
    const pts = ["33", "32", "31", "41", "42", "43"].map((fdi) => {
      const mesh = kit.teeth[fdi];
      if (!mesh) return null;
      const fa = J.facialAnchor(mesh, fdi, kit.archCenter, { lingual: true });
      return fa.pos.clone();
    }).filter(Boolean);
    const wire = J.tubeAlong(pts, 0.03, J.metalMaterial());
    if (wire) kit.overlay.add(wire);
  }
  const appliance = applianceOf(preset);
  if (appliance === "hawley" || appliance === "twinblock" || appliance === "frankel" || preset.hawley) {
    const acrylic = P.mats.acrylic();
    const metal = J.metalMaterial();
    const bowFdis = ["13", "12", "11", "21", "22", "23"];
    const bow = bowFdis.map((fdi) => {
      const mesh = kit.teeth[fdi];
      if (!mesh) return null;
      const fa = J.facialAnchor(mesh, fdi, kit.archCenter);
      return fa.pos.clone().add(fa.buccal.clone().multiplyScalar(0.1));
    }).filter(Boolean);
    if (appliance !== "frankel") {
      const pts = ["16", "14", "11", "21", "24", "26"].map((id) => {
        const mesh = kit.teeth[id];
        if (!mesh) return null;
        return J.facialAnchor(mesh, id, kit.archCenter, { lingual: true }).pos.clone();
      }).filter(Boolean);
      const mid = pts.reduce((a, p) => a.add(p), new THREE.Vector3()).multiplyScalar(1 / Math.max(pts.length, 1));
      mid.x = kit.archCenter.x;
      mid.add(J.occlusalDir("11").multiplyScalar(0.18));
      const plateMat = new THREE.MeshPhysicalMaterial({
        color: 0xc94e68,
        roughness: 0.32,
        metalness: 0,
        clearcoat: 0.45,
        clearcoatRoughness: 0.3,
      });
      const plate = new THREE.Mesh(new THREE.SphereGeometry(1.55, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.55), plateMat);
      plate.scale.set(1.05, 0.22, 0.9);
      plate.position.copy(mid);
      kit.overlay.add(plate);
    }
    if (appliance !== "twinblock") {
      const labial = J.tubeAlong(bow, 0.055, metal, { tubular: 40 });
      if (labial) kit.overlay.add(labial);
    }
    for (const fdi of ["16", "26"]) {
      const mesh = kit.teeth[fdi];
      if (!mesh) continue;
      const fa = J.facialAnchor(mesh, fdi, kit.archCenter);
      const fl = J.facialAnchor(mesh, fdi, kit.archCenter, { lingual: true });
      const oc = J.occlusalDir(fdi);
      const pts = [
        fl.pos.clone().add(oc.clone().multiplyScalar(0.02)),
        fa.origin.clone().add(oc.clone().multiplyScalar(0.24)).add(fa.buccal.clone().multiplyScalar(0.18)),
        fa.pos.clone().add(fa.buccal.clone().multiplyScalar(0.1)),
      ];
      const clasp = J.tubeAlong(pts, 0.052, metal, { tubular: 28 });
      if (clasp) kit.overlay.add(clasp);
    }
    if (appliance === "twinblock") {
      placeBiteBlock(kit, ["16", "15", "26", "25"], { height: 0.32 });
      placeBiteBlock(kit, ["36", "35", "46", "45"], { height: 0.26 });
      const lowerMid = palatalMid(kit, ["33", "32", "31", "41", "42", "43"]);
      const lowerPlate = J.makeOrganicBlob(0.95, acrylic, { flatten: 0.22, distort: 0.08 });
      lowerPlate.scale.set(1.2, 0.22, 0.7);
      lowerPlate.position.copy(lowerMid);
      kit.overlay.add(lowerPlate);
    }
    if (appliance === "frankel") {
      for (const side of [["13", "14", "15", "16"], ["23", "24", "25", "26"]]) {
        const pts = [];
        for (const fdi of side) {
          const mesh = kit.teeth[fdi];
          if (!mesh) continue;
          const fa = J.facialAnchor(mesh, fdi, kit.archCenter);
          pts.push(fa.pos.clone().add(fa.buccal.clone().multiplyScalar(0.38)));
        }
        if (pts.length < 2) continue;
        const mid = pts.reduce((a, v) => a.add(v), new THREE.Vector3()).multiplyScalar(1 / pts.length);
        const shield = J.makeOrganicBlob(0.85, acrylic, { flatten: 0.35, distort: 0.1 });
        shield.scale.set(0.55, 0.7, 1.35);
        shield.position.copy(mid);
        kit.overlay.add(shield);
      }
    }
  }

  const focusFdis = preset.brackets || preset.aligner || preset.retainer || preset.hawley || applianceOf(preset)
    ? ["13", "12", "11", "21", "22", "23", "14", "24", "16", "26", "33", "32", "31", "41", "42", "43"]
    : J.UPPER_ORDER.concat(J.LOWER_ORDER);
  let cam = null;
  if (preset.hawley || applianceOf(preset) || preset.retainer) cam = new THREE.Vector3(0.15, -1.2, 0.5);
  else if (preset.aligner) cam = new THREE.Vector3(0.12, 0.18, 1.25);
  else if (preset.brackets) cam = new THREE.Vector3(0.12, 0.16, 1.22);
  return finish(kit, focusFdis, { camDir: cam, focusOpts: { pad: 0.35 } });
}

async function composeSpace(preset, { base }) {
  const kind = preset.kindSpace || "band-loop";
  const isNance = kind === "nance";
  const kit = await J.cloneJaw(base, {
    teeth: isNance ? "upper" : "lower",
    showTongue: false,
    showBone: false,
    showGingiva: true,
    gumOpacity: 0.88,
    clipSkull: true,
    isolateTeeth: kind === "lingual-arch"
      ? J.LOWER_ORDER.slice()
      : isNance
        ? J.UPPER_ORDER.slice()
        : ["33", "34", "35", "36", "37"],
    keepSoftOnIsolate: true,
    keepBoneOnIsolate: false,
    clipToFocus: false,
  });
  if (!isNance) {
    J.setToothScale(kit, ["33", "34", "35", "36", "37", "44", "45", "46"], 0.88);
    for (const g of kit.gums) {
      if (g.name === "gum_upper") g.visible = false;
    }
  } else {
    J.setToothScale(kit, J.UPPER_ORDER.slice(), 0.92);
    for (const g of kit.gums) {
      if (g.name === "gum_lower") g.visible = false;
    }
  }
  for (const b of kit.bones) b.visible = false;

  if (kind === "band-loop" || kind === "space") {
    if (kit.teeth["35"]) kit.teeth["35"].visible = false;
    const molar = kit.teeth["36"];
    const mesial = kit.teeth["34"];
    if (molar) {
      const fa = J.facialAnchor(molar, "36", kit.archCenter);
      const bandR = Math.max(fa.size.x, fa.size.z) * 0.44;
      const band = new THREE.Mesh(new THREE.TorusGeometry(bandR, 0.1, 12, 28), J.metalMaterial());
      band.rotation.x = Math.PI / 2;
      band.position.copy(fa.origin);
      kit.overlay.add(band);
      if (mesial) {
        const fm = J.facialAnchor(mesial, "34", kit.archCenter);
        const mid = fa.origin.clone().lerp(fm.origin, 0.5);
        mid.add(fa.buccal.clone().multiplyScalar(0.14));
        mid.add(J.occlusalDir("36").multiplyScalar(0.32));
        const pts = [
          fa.origin.clone().add(J.occlusalDir("36").multiplyScalar(0.08)).add(fa.buccal.clone().multiplyScalar(0.06)),
          mid,
          fm.origin.clone().add(J.occlusalDir("34").multiplyScalar(0.08)).add(fm.buccal.clone().multiplyScalar(0.04)),
        ];
        const loop = J.tubeAlong(pts, 0.08, J.metalMaterial(), { tubular: 48 });
        if (loop) kit.overlay.add(loop);
        // Soft marker for the reserved gap
        const gap = new THREE.Mesh(
          new THREE.TorusGeometry(0.22, 0.018, 8, 20),
          new THREE.MeshBasicMaterial({ color: 0x2f7772, transparent: true, opacity: 0.55 })
        );
        gap.rotation.x = Math.PI / 2;
        gap.position.copy(fa.origin.clone().lerp(fm.origin, 0.5)).add(J.occlusalDir("35").multiplyScalar(0.02));
        kit.overlay.add(gap);
      }
      J.faceOutward(kit, "36", { amount: 0.7 });
    }
  } else if (kind === "lingual-arch") {
    const pts = ["36", "35", "34", "33", "32", "31", "41", "42", "43", "44", "45", "46"].map((fdi) => {
      const mesh = kit.teeth[fdi];
      if (!mesh) return null;
      const fa = J.facialAnchor(mesh, fdi, kit.archCenter, { lingual: true });
      return fa.pos.clone();
    }).filter(Boolean);
    const wire = J.tubeAlong(pts, 0.04, J.metalMaterial(), { tubular: 80 });
    if (wire) kit.overlay.add(wire);
    for (const fdi of ["36", "46"]) {
      const mesh = kit.teeth[fdi];
      if (!mesh) continue;
      const fa = J.facialAnchor(mesh, fdi, kit.archCenter);
      const bandR = Math.max(fa.size.x, fa.size.z) * 0.4;
      const band = new THREE.Mesh(new THREE.TorusGeometry(bandR, 0.05, 10, 28), J.metalMaterial());
      band.rotation.x = Math.PI / 2;
      band.position.copy(fa.origin);
      kit.overlay.add(band);
    }
  } else if (kind === "nance") {
    const pts = ["16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26"].map((fdi) => {
      const mesh = kit.teeth[fdi];
      if (!mesh) return null;
      const fa = J.facialAnchor(mesh, fdi, kit.archCenter, { lingual: true });
      return fa.pos.clone();
    }).filter(Boolean);
    const wire = J.tubeAlong(pts, 0.04, J.metalMaterial(), { tubular: 80 });
    if (wire) kit.overlay.add(wire);
    const button = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 22, 16),
      P.mats.acrylic()
    );
    button.scale.set(1.15, 0.28, 0.95);
    button.position.set(0, 0.12, 0.55);
    kit.overlay.add(button);
    for (const fdi of ["16", "26"]) {
      const mesh = kit.teeth[fdi];
      if (!mesh) continue;
      const fa = J.facialAnchor(mesh, fdi, kit.archCenter);
      const bandR = Math.max(fa.size.x, fa.size.z) * 0.4;
      const band = new THREE.Mesh(new THREE.TorusGeometry(bandR, 0.05, 10, 28), J.metalMaterial());
      band.rotation.x = Math.PI / 2;
      band.position.copy(fa.origin);
      kit.overlay.add(band);
    }
    J.faceOutward(kit, "11", { amount: 0.15 });
  }

  const spaceFocus = isNance ? J.UPPER_ORDER.slice() : (kind === "lingual-arch" ? J.LOWER_ORDER.slice() : ["33", "34", "35", "36", "37"]);
  return finish(kit, spaceFocus, {
    captionSuffix: PEDO_NOTE,
    camDir: isNance ? new THREE.Vector3(0.1, -1.25, 0.5) : new THREE.Vector3(0.1, 1.25, 0.55),
    focusOpts: { pad: 0.45 },
  });
}

async function composeDenture(preset, { base }) {
  const complete = preset.complete !== false;
  const arch = "upper";
  const kit = await J.cloneJaw(base, {
    teeth: complete ? "lower" : "all",
    showTongue: false,
    showBone: false,
    showGingiva: true,
    gumOpacity: 0.92,
    clipSkull: true,
    openMouth: complete ? 0.28 : 0.16,
    missingTeeth: complete ? J.UPPER_ORDER.slice() : ["15", "16", "14"],
  });
  const lift = complete ? 0.38 : 0.26;
  if (complete) {
    const denture = J.makeFullArchProsthesis(kit, { arch, lift, flangeRadius: 0.22 });
    const plateMat = new THREE.MeshPhysicalMaterial({
      color: 0xd46a7a,
      roughness: 0.38,
      metalness: 0,
      clearcoat: 0.28,
      sheen: 0.25,
      sheenColor: new THREE.Color(0xffb0b8),
    });
    if (preset.flexible) {
      plateMat.color.setHex(0xe8b0b8);
      plateMat.transparent = true;
      plateMat.opacity = 0.92;
      denture.traverse((o) => {
        if (o.isMesh && o.material && o.material.color) {
          const hex = o.material.color.getHex();
          if (hex > 0xe00000 || (o.material.roughness || 0) > 0.4) {
            o.material = plateMat;
          }
        }
      });
    }
    kit.overlay.add(denture);
    for (const g of kit.gums) {
      if (g.name === "gum_upper") g.visible = false;
    }
  } else {
    const mat = J.ceramicMaterial("crown");
    for (const fdi of ["14", "15", "16"]) {
      const mesh = kit.teeth[fdi];
      if (!mesh) continue;
      mesh.visible = false;
      const shell = J.cutShell(mesh, fdi, mat.clone(), { frac: 0.42, scale: 1.0 });
      shell.position.add(J.occlusalDir(fdi).multiplyScalar(lift));
      kit.overlay.add(shell);
    }
    const saddlePts = ["13", "14", "15", "16", "17"].map((fdi) => {
      const m = kit.teeth[fdi];
      if (!m) return null;
      return J.facialAnchor(m, fdi, kit.archCenter).origin.clone().add(J.occlusalDir(fdi).multiplyScalar(lift * 0.45));
    }).filter(Boolean);
    if (saddlePts.length >= 3) {
      const shape = new THREE.Shape();
      shape.absellipse(0, 0, 0.36, 0.2, 0, Math.PI * 2, false, 0);
      const saddle = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, {
          extrudePath: new THREE.CatmullRomCurve3(saddlePts, false, "centripetal"),
          steps: 40,
          bevelEnabled: false,
        }),
        preset.flexible
          ? new THREE.MeshPhysicalMaterial({ color: 0xe8b0b8, roughness: 0.4, transparent: true, opacity: 0.92 })
          : P.mats.acrylic()
      );
      kit.overlay.add(saddle);
    }
    if (!preset.flexible) {
      for (const fdi of ["13", "17"]) {
        const mesh = kit.teeth[fdi];
        if (!mesh) continue;
        const fa = J.facialAnchor(mesh, fdi, kit.archCenter);
        const clasp = new THREE.Mesh(
          new THREE.TorusGeometry(Math.max(fa.size.x, fa.size.z) * 0.36, 0.045, 8, 20, Math.PI * 1.3),
          J.metalMaterial()
        );
        clasp.rotation.x = Math.PI / 2;
        clasp.position.copy(fa.origin).add(J.occlusalDir(fdi).multiplyScalar(0.04));
        kit.overlay.add(clasp);
      }
    }
  }
  return finish(kit, complete ? [] : ["14", "15", "16", "13", "17"], {
    camDir: complete ? new THREE.Vector3(0.42, 0.16, 1.1) : new THREE.Vector3(0.85, 0.35, 0.9),
    focusOpts: { pad: 0.32, includeOverlay: true },
  });
}

async function composeBridge(preset, { base }) {
  const pontic = "15";
  const kit = await J.cloneJaw(base, {
    teeth: "upper",
    showTongue: false,
    showBone: false,
    showGingiva: true,
    gumOpacity: 0.9,
    clipSkull: true,
    openMouth: 0,
    isolateTeeth: ["13", "14", "15", "16", "17"],
    keepSoftOnIsolate: true,
    keepBoneOnIsolate: false,
    clipToFocus: true,
    clipPad: 0.8,
  });
  for (const g of kit.gums) {
    if (g.name === "gum_lower") g.visible = false;
  }
  J.placeBridge(kit, kit.overlay, pontic, { maryland: !!preset.maryland, lift: preset.maryland ? 0.04 : 0.18 });
  J.faceOutward(kit, pontic, { amount: 1 });
  const fa = J.facialAnchor(kit.teeth[pontic], pontic, kit.archCenter);
  const cam = fa.buccal.clone().multiplyScalar(1)
    .add(J.occlusalDir(pontic).multiplyScalar(0.35))
    .add(new THREE.Vector3(0, 0, 0.25));
  return finish(kit, [], {
    camDir: cam.normalize(),
    focusOpts: { pad: 0.45, includeOverlay: true },
  });
}

async function composeHygiene(preset, { base }) {
  const fdi = "16";
  const kit = await J.cloneJaw(base, {
    showTongue: false,
    showBone: false,
    showGingiva: true,
    gumOpacity: 0.88,
    clipSkull: true,
    isolateTeeth: ["15", "16", "17", "14"],
    keepSoftOnIsolate: true,
    keepBoneOnIsolate: false,
    clipToFocus: true,
  });
  const mesh = kit.teeth[fdi];
  if (mesh) {
    const fa = J.facialAnchor(mesh, fdi, kit.archCenter);
    const tool = preset.tool || "brush";
    if (tool === "brush") {
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.07, 1.6, 12),
        new THREE.MeshStandardMaterial({ color: 0x3a8f88 })
      );
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.12, 0.18),
        new THREE.MeshStandardMaterial({ color: 0xe8f4f2 })
      );
      const bristles = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.1, 0.12),
        new THREE.MeshStandardMaterial({ color: 0xf5faf9 })
      );
      const g = new THREE.Group();
      handle.position.y = -0.85;
      head.position.y = 0.05;
      bristles.position.set(0, 0.14, 0);
      g.add(handle, head, bristles);
      g.position.copy(fa.pos).add(fa.buccal.clone().multiplyScalar(0.25)).add(J.occlusalDir(fdi).multiplyScalar(0.15));
      g.lookAt(fa.pos);
      kit.overlay.add(g);
    } else if (tool === "floss") {
      const floss = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 1.2, 6),
        new THREE.MeshBasicMaterial({ color: 0xf5f5f5 })
      );
      floss.position.copy(fa.pos).add(fa.buccal.clone().multiplyScalar(0.15));
      kit.overlay.add(floss);
    } else if (tool === "water") {
      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.03, 0.9, 10), P.mats.metal());
      tip.position.copy(fa.pos).add(fa.buccal.clone().multiplyScalar(0.35));
      tip.lookAt(fa.pos);
      tip.rotateX(Math.PI / 2);
      kit.overlay.add(tip);
    }
  }
  return finish(kit, [fdi, "15", "17"], { camDir: new THREE.Vector3(0.7, 0.85, 0.7), focusOpts: { pad: 0.55 } });
}

async function composeScan(preset, { base }) {
  const cap = (preset.caption || "") + " " + (preset.id || "");
  const isCbct = !!preset.cbct || /CBCT|三维牙片|三维扫描|骨量/.test(cap);
  const kit = await J.cloneJaw(base, {
    showTongue: false,
    showBone: isCbct,
    showGingiva: true,
    boneOpacity: isCbct ? 0.78 : 0.0,
    gumOpacity: 0.92,
    clipSkull: true,
    openMouth: isCbct ? 0.06 : 0.1,
  });

  if (isCbct) {
    const tbox = new THREE.Box3();
    Object.values(kit.teeth).forEach((t) => { if (t.visible) tbox.expandByObject(t); });
    kit.gums.forEach((g) => { if (g && g.visible) tbox.expandByObject(g); });
    const size = tbox.getSize(new THREE.Vector3());
    const center = tbox.getCenter(new THREE.Vector3());
    const volume = new THREE.Mesh(
      new THREE.BoxGeometry(size.x * 1.08, size.y * 1.12, size.z * 1.08),
      new THREE.MeshPhysicalMaterial({
        color: 0x8ec5d4,
        roughness: 0.18,
        metalness: 0,
        transparent: true,
        opacity: 0.11,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    volume.position.copy(center);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(volume.geometry),
      new THREE.LineBasicMaterial({ color: 0x2f7772, transparent: true, opacity: 0.7 })
    );
    volume.add(edges);
    kit.overlay.add(volume);
    const slice = new THREE.Mesh(
      new THREE.PlaneGeometry(size.z * 1.0, size.y * 1.06),
      new THREE.MeshPhysicalMaterial({
        color: 0xd5ecec,
        roughness: 0.4,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    slice.rotation.y = Math.PI / 2;
    slice.position.copy(center);
    kit.overlay.add(slice);
    return finish(kit, J.UPPER_ORDER.concat(J.LOWER_ORDER), {
      camDir: new THREE.Vector3(0.55, 0.32, 1.05),
      focusOpts: { pad: 0.18, includeOverlay: false },
    });
  }

  const fa = kit.teeth["11"]
    ? J.facialAnchor(kit.teeth["11"], "11", kit.archCenter)
    : { pos: new THREE.Vector3(0, 0, 2), buccal: new THREE.Vector3(0, 0, 1) };
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3d4a52, metalness: 0.45, roughness: 0.35 });
  const wand = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 1.15, 18), bodyMat);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.45, 18), bodyMat);
  handle.position.y = -0.7;
  const tip = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.14, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x9fd4e8, emissive: 0x1a5a70, emissiveIntensity: 0.45, roughness: 0.25 })
  );
  tip.position.y = 0.62;
  const window = new THREE.Mesh(
    new THREE.PlaneGeometry(0.22, 0.28),
    new THREE.MeshBasicMaterial({ color: 0x7fe0ff, transparent: true, opacity: 0.7 })
  );
  window.position.set(0, 0.62, 0.22);
  const g = new THREE.Group();
  g.add(wand, handle, tip, window);
  g.position.copy(fa.pos).add(fa.buccal.clone().multiplyScalar(0.95)).add(new THREE.Vector3(0.35, 0.25, 0.05));
  g.lookAt(fa.pos);
  kit.overlay.add(g);
  return finish(kit, ["11", "12", "21", "13", "23"], { focusOpts: { pad: 0.7 } });
}

async function composeTad(preset, { base }) {
  const kit = await J.cloneJaw(base, {
    teeth: "upper",
    showTongue: false,
    showBone: true,
    showGingiva: true,
    boneOpacity: 0.55,
    gumOpacity: 0.5,
    clipSkull: true,
    isolateTeeth: ["15", "16", "14", "13"],
    keepSoftOnIsolate: true,
    keepBoneOnIsolate: true,
    clipToFocus: true,
  });
  const a = kit.teeth["15"];
  const b = kit.teeth["16"];
  if (a && b) {
    const ca = J.worldCenter(a);
    const cb = J.worldCenter(b);
    const mid = ca.clone().add(cb).multiplyScalar(0.5);
    const fa = J.facialAnchor(a, "15", kit.archCenter);
    const dir = fa.buccal.clone().multiplyScalar(0.3).add(J.gingivalDir("15").multiplyScalar(0.7)).normalize();
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.7, 12), P.mats.titanium());
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), P.mats.titaniumLight());
    screw.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    // Place between roots, slightly apical and buccal
    const pos = mid.clone().add(J.gingivalDir("15").multiplyScalar(0.35)).add(fa.buccal.clone().multiplyScalar(0.15));
    screw.position.copy(pos);
    head.position.copy(pos).add(dir.clone().multiplyScalar(0.38));
    kit.overlay.add(screw, head);
  }
  return finish(kit, ["13", "14", "15", "16"], { cutaway: "15", cutawayOpts: { inset: 0.04 }, focusOpts: { pad: 0.55 } });
}

async function composeExpander(preset, { base }) {
  const kit = await J.cloneJaw(base, {
    teeth: "upper",
    showTongue: false,
    showBone: false,
    showGingiva: true,
    gumOpacity: 0.85,
    clipSkull: true,
  });
  const metal = J.metalMaterial();
  for (const fdi of ["16", "26", "14", "24"]) {
    const mesh = kit.teeth[fdi];
    if (!mesh) continue;
    const fa = J.facialAnchor(mesh, fdi, kit.archCenter);
    const bandR = Math.max(fa.size.x, fa.size.z) * 0.38;
    const band = new THREE.Mesh(new THREE.TorusGeometry(bandR, 0.035, 10, 28), metal);
    band.rotation.x = Math.PI / 2;
    band.position.copy(fa.origin);
    kit.overlay.add(band);
  }
  const mid = palatalMid(kit, ["16", "14", "12", "11", "21", "22", "24", "26"]);
  mid.y += 0.04;
  const screw = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.35), metal);
  screw.position.copy(mid);
  kit.overlay.add(screw);
  const midL = mid.clone(); midL.x -= 0.28;
  const midR = mid.clone(); midR.x += 0.28;
  for (const fdi of ["16", "14"]) {
    const mesh = kit.teeth[fdi];
    if (!mesh) continue;
    const fa = J.facialAnchor(mesh, fdi, kit.archCenter, { lingual: true });
    const arm = J.tubeAlong([midL, fa.pos], 0.028, metal);
    if (arm) kit.overlay.add(arm);
  }
  for (const fdi of ["26", "24"]) {
    const mesh = kit.teeth[fdi];
    if (!mesh) continue;
    const fa = J.facialAnchor(mesh, fdi, kit.archCenter, { lingual: true });
    const arm = J.tubeAlong([midR, fa.pos], 0.028, metal);
    if (arm) kit.overlay.add(arm);
  }
  return finish(kit, J.UPPER_ORDER.slice(), { camDir: new THREE.Vector3(0.12, -1.2, 0.5), focusOpts: { pad: 0.4 } });
}

async function composeMouthguard(preset, { base }) {
  const kit = await J.cloneJaw(base, {
    teeth: "upper",
    showTongue: false,
    showBone: false,
    showGingiva: true,
    gumOpacity: 0.88,
    clipSkull: true,
  });
  const mat = J.alignerMaterial(0x4ecdc4);
  mat.opacity = 0.72;
  mat.transmission = 0.35;
  J.placeAligners(kit, kit.overlay, { fdis: J.UPPER_ORDER, scale: 1.1, frac: 0.5, material: mat });
  return finish(kit, J.UPPER_ORDER.slice(), { focusOpts: { pad: 0.45 } });
}

async function composeSealant(preset, { base }) {
  const fdi = "16";
  const kit = await J.cloneJaw(base, {
    showTongue: false,
    showBone: false,
    showGingiva: true,
    isolateTeeth: ["16", "15", "17"],
    keepSoftOnIsolate: true,
    keepBoneOnIsolate: false,
    clipToFocus: true,
    clipSkull: true,
  });
  const mesh = kit.teeth[fdi];
  if (mesh) {
    const fa = J.facialAnchor(mesh, fdi, kit.archCenter);
    const seal = new THREE.Mesh(
      new THREE.SphereGeometry(fa.size.x * 0.22, 16, 12),
      new THREE.MeshPhysicalMaterial({ color: 0xd8f0e8, transparent: true, opacity: 0.7, roughness: 0.3 })
    );
    seal.scale.set(1, 0.25, 0.9);
    seal.position.copy(fa.center).add(J.occlusalDir(fdi).multiplyScalar(fa.toothSize * 0.18));
    kit.overlay.add(seal);
  }
  return finish(kit, ["15", "16", "17"], { camDir: new THREE.Vector3(0.35, 1.15, 0.5), focusOpts: { pad: 0.4 } });
}

async function composeSsc(preset, { base }) {
  const fdi = "36";
  const kit = await J.cloneJaw(base, {
    showTongue: false,
    showBone: false,
    showGingiva: true,
    isolateTeeth: ["35", "36", "37", "34"],
    keepSoftOnIsolate: true,
    keepBoneOnIsolate: false,
    clipToFocus: true,
    clipSkull: true,
  });
  J.setToothScale(kit, ["35", "36", "37", "34"], 0.85);
  J.placeCrownRestore(kit, kit.overlay, fdi, { kind: "metal", explode: 0.2 });
  return finish(kit, ["34", "35", "36", "37"], { captionSuffix: PEDO_NOTE, focusOpts: { pad: 0.45 } });
}
