/**
 * Realistic atlas topic scenes built on jaw.glb + procedural appliances.
 * Box/block teeth are not used. Implant fixtures stay the original
 * procedural titanium from implant-geometry / topic-parts.
 */
import { THREE } from "./stage.js";
import * as P from "./topic-parts.js";
import * as J from "./jaw-kit.js";

const PEDO_NOTE = "（模型无乳牙，以缩小的恒牙示意）";

function wantsImplantCloseup(preset) {
  const explode = preset.explode ?? 0;
  if (preset.highlight) return true;
  if (explode >= 0.45) return true;
  return false;
}

export async function composeTopicModel(preset, { base, crownMesh } = {}) {
  const kind = preset.kind || "tooth";
  switch (kind) {
    case "implant":
      if (wantsImplantCloseup(preset)) return null; // topic-viewer keeps the close-up stack
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
      return composeCompare(preset, { crownMesh });
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
    openMouth: 0.12,
    missingTeeth: [fdi],
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
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
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

  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
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
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
}

async function composeSinus(preset, { base, crownMesh }) {
  const fdi = "16";
  const kit = await J.cloneJaw(base, {
    teeth: "upper",
    showTongue: false,
    showBone: true,
    showGingiva: true,
    boneOpacity: 0.42,
    gumOpacity: 0.55,
    clipSkull: true,
    missingTeeth: [fdi],
  });
  const stack = implantStack({ crown: true, screw: true, abutment: true }, crownMesh);
  J.placeImplantAtTooth(kit, fdi, stack, { sink: 0.02 });
  kit.overlay.add(stack);
  J.faceOutward(kit, fdi, { amount: 0.8 });

  const fa = J.facialAnchor(kit.teeth[fdi], fdi, kit.archCenter);
  const sinusMat = new THREE.MeshPhysicalMaterial({
    color: 0xc8d8e0,
    roughness: 0.35,
    metalness: 0,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const sinus = new THREE.Mesh(new THREE.SphereGeometry(0.95, 32, 24), sinusMat);
  sinus.scale.set(1.35, 0.85, 1.1);
  // Upper molar roots point +Y; sinus sits apical (above) the site, slightly inward
  sinus.position.copy(fa.origin).add(new THREE.Vector3(0, 1.05, -0.1)).add(fa.buccal.clone().multiplyScalar(-0.15));
  kit.overlay.add(sinus);

  const graft = J.makeOrganicBlob(0.5, P.mats.graft(), { flatten: 0.55, distort: 0.2 });
  graft.position.copy(fa.origin).add(new THREE.Vector3(0, 0.5, 0));
  kit.overlay.add(graft);

  if (preset.external) {
    const membrane = new THREE.Mesh(
      new THREE.CircleGeometry(0.55, 24),
      P.mats.membrane()
    );
    // Window on the buccal wall of the sinus
    const buccal = fa.buccal.clone();
    membrane.position.copy(sinus.position).add(buccal.clone().multiplyScalar(0.95));
    membrane.lookAt(membrane.position.clone().add(buccal));
    kit.overlay.add(membrane);
    const frame = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.035, 8, 24),
      P.mats.titaniumLight()
    );
    frame.position.copy(membrane.position);
    frame.quaternion.copy(membrane.quaternion);
    kit.overlay.add(frame);
  }

  kit.root.userData.parts = stack.userData.parts;
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
}

async function composeGbr(preset, { base, crownMesh }) {
  const fdi = "16";
  const isSocket = (preset.caption || "").includes("拔牙") || (preset.labels || []).some((l) => l.includes("拔牙"));
  const kit = await J.cloneJaw(base, {
    showTongue: false,
    showBone: true,
    showGingiva: true,
    boneOpacity: 0.5,
    gumOpacity: 0.55,
    clipSkull: true,
    openMouth: 0.08,
    missingTeeth: [fdi],
  });

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

  J.faceOutward(kit, fdi, { amount: 0.85 });
  const fa = J.facialAnchor(kit.teeth[fdi], fdi, kit.archCenter);
  const buccal = fa.buccal.clone();

  if (preset.block) {
    const blk = J.makeOrganicBlob(0.62, P.mats.graft(), { flatten: 0.55, distort: 0.12 });
    blk.scale.set(1.3, 0.85, 0.7);
    blk.position.copy(fa.origin).add(buccal.clone().multiplyScalar(0.55));
    kit.overlay.add(blk);
    // tiny fixation screws
    for (const dy of [-0.18, 0.18]) {
      const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.45, 10), P.mats.titanium());
      sc.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), buccal);
      sc.position.copy(blk.position).add(new THREE.Vector3(0, dy, 0)).add(buccal.clone().multiplyScalar(0.1));
      kit.overlay.add(sc);
    }
  } else {
    const graft = J.makeOrganicBlob(isSocket ? 0.55 : 0.72, P.mats.graft(), { flatten: 0.65, distort: 0.25 });
    graft.position.copy(fa.origin).add(buccal.clone().multiplyScalar(isSocket ? 0.2 : 0.55)).add(new THREE.Vector3(0, isSocket ? 0.08 : 0.12, 0));
    kit.overlay.add(graft);
  }

  const mem = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
    P.mats.membrane()
  );
  mem.scale.set(1.15, 0.75, 1);
  mem.position.copy(fa.origin).add(buccal.clone().multiplyScalar(0.5)).add(new THREE.Vector3(0, 0.2, 0));
  mem.lookAt(mem.position.clone().add(buccal.clone().add(new THREE.Vector3(0, 0.4, 0))));
  kit.overlay.add(mem);

  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
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
  const graft = J.makeOrganicBlob(0.28, P.mats.graft(), { flatten: 0.8, distort: 0.15 });
  graft.scale.set(0.6, 1.1, 1.3);
  graft.position.copy(fa.origin);
  kit.overlay.add(graft);
  const stack = implantStack({ crown: false, healing: true, abutment: false, screw: false }, crownMesh);
  J.placeImplantAtTooth(kit, fdi, stack, { sink: 0.04 });
  kit.overlay.add(stack);
  kit.root.userData.parts = stack.userData.parts;
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
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
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
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
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
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
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
}

function composeCompare(preset, { crownMesh }) {
  // Two realistic implant stacks (real crown + procedural fixture) — no box teeth
  const root = new THREE.Group();
  const a = implantStack({}, crownMesh);
  a.position.x = -8;
  const b = implantStack({}, crownMesh);
  b.position.x = 8;
  b.traverse((o) => {
    if (o.isMesh && o.material && o.material.metalness > 0.5) {
      o.material = o.material.clone();
      o.material.color.setHex(0xb8c4cc);
    }
  });
  root.add(a, b);
  if (a.userData.parts) root.userData.parts = a.userData.parts;
  return root;
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
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
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

  kit.root.userData.syncClip = () => {
    kit.syncClip();
  };
  kit.root.userData.needsClip = kit.needsClip || !!kit.root.userData.extraPlanes;
  return kit.root;
}

async function composeArch(preset, { base }) {
  const kit = await J.cloneJaw(base, {
    showTongue: false,
    showBone: false,
    showGingiva: true,
    gumOpacity: 0.88,
    clipSkull: true,
    openMouth: preset.aligner || preset.brackets ? 0.06 : 0.1,
  });
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
    const mat = J.alignerMaterial(0xc5e8ee);
    mat.opacity = 0.72;
    mat.transmission = 0.4;
    J.placeAligners(kit, kit.overlay, { scale: 1.08, material: mat });
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
  if (preset.hawley) {
    // Palatal acrylic plate from lingual points of upper teeth
    const lingual = J.UPPER_ORDER.map((fdi) => {
      const mesh = kit.teeth[fdi];
      if (!mesh) return null;
      const fa = J.facialAnchor(mesh, fdi, kit.archCenter, { lingual: true });
      return fa.pos.clone().add(new THREE.Vector3(0, 0.15, 0));
    }).filter(Boolean);
    if (lingual.length >= 4) {
      const shape = new THREE.Shape();
      shape.absellipse(0, 0, 0.7, 0.12, 0, Math.PI * 2, false, 0);
      // A simple palatal plate: flattened sphere in the palatal vault
      const plate = new THREE.Mesh(
        new THREE.SphereGeometry(1.6, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
        P.mats.acrylic()
      );
      plate.scale.set(1.15, 0.28, 1.0);
      plate.position.set(0, 0.15, 0.2);
      kit.overlay.add(plate);
    }
    const bow = ["13", "12", "11", "21", "22", "23"].map((fdi) => {
      const mesh = kit.teeth[fdi];
      if (!mesh) return null;
      const fa = J.facialAnchor(mesh, fdi, kit.archCenter);
      return fa.pos.clone().add(fa.buccal.clone().multiplyScalar(0.08));
    }).filter(Boolean);
    const labial = J.tubeAlong(bow, 0.03, J.metalMaterial());
    if (labial) kit.overlay.add(labial);
  }

  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
}

async function composeSpace(preset, { base }) {
  const kind = preset.kindSpace || "band-loop";
  // Band on first permanent molar 36, gap at 35 (stand-in for lost primary 2nd molar), mesial 34.
  const kit = await J.cloneJaw(base, {
    teeth: "lower",
    showTongue: false,
    showBone: false,
    showGingiva: true,
    gumOpacity: 0.88,
    clipSkull: true,
    isolateTeeth: kind === "lingual-arch" || kind === "nance"
      ? J.LOWER_ORDER.slice()
      : ["33", "34", "35", "36", "37"],
    keepSoftOnIsolate: true,
    keepBoneOnIsolate: false,
    clipToFocus: false,
  });
  J.setToothScale(kit, ["33", "34", "35", "36", "37", "44", "45", "46"], 0.88);
  for (const g of kit.gums) {
    if (g.name === "gum_upper") g.visible = false;
  }
  for (const b of kit.bones) b.visible = false;

  if (kind === "band-loop" || kind === "space") {
    if (kit.teeth["35"]) kit.teeth["35"].visible = false;
    const molar = kit.teeth["36"];
    const mesial = kit.teeth["34"];
    if (molar) {
      const fa = J.facialAnchor(molar, "36", kit.archCenter);
      const bandR = Math.max(fa.size.x, fa.size.z) * 0.42;
      const band = new THREE.Mesh(new THREE.TorusGeometry(bandR, 0.055, 10, 28), J.metalMaterial());
      band.rotation.x = Math.PI / 2;
      band.position.copy(fa.origin);
      kit.overlay.add(band);
      if (mesial) {
        const fm = J.facialAnchor(mesial, "34", kit.archCenter);
        // Loop along the ridge, slightly buccal/occlusal so it reads from the front
        const mid = fa.origin.clone().lerp(fm.origin, 0.5);
        mid.add(fa.buccal.clone().multiplyScalar(0.12));
        mid.add(J.occlusalDir("36").multiplyScalar(0.18));
        const pts = [
          fa.origin.clone().add(J.occlusalDir("36").multiplyScalar(0.08)).add(fa.buccal.clone().multiplyScalar(0.06)),
          mid,
          fm.origin.clone().add(J.occlusalDir("34").multiplyScalar(0.08)).add(fm.buccal.clone().multiplyScalar(0.04)),
        ];
        const loop = J.tubeAlong(pts, 0.045, J.metalMaterial(), { tubular: 40 });
        if (loop) kit.overlay.add(loop);
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
    const wire = J.tubeAlong(pts, 0.03, J.metalMaterial(), { tubular: 80 });
    if (wire) kit.overlay.add(wire);
    for (const fdi of ["36", "46"]) {
      const mesh = kit.teeth[fdi];
      if (!mesh) continue;
      const fa = J.facialAnchor(mesh, fdi, kit.archCenter);
      const bandR = Math.max(fa.size.x, fa.size.z) * 0.38;
      const band = new THREE.Mesh(new THREE.TorusGeometry(bandR, 0.035, 10, 28), J.metalMaterial());
      band.rotation.x = Math.PI / 2;
      band.position.copy(fa.origin);
      kit.overlay.add(band);
    }
  } else if (kind === "nance") {
    // Palatal nance is an upper appliance — switch visual to upper molars
    // (we built a lower jaw; rebuild would be cleaner, but add upper via a second clone is heavy).
    // Use lower as a stand-in? Better clone upper. Let's just put a palatal button on lower? No.
    // Rebuild isn't possible here without another load — the kit already has all teeth, we isolated lower.
    // Show upper instead: unhide upper molars, hide lower, build nance on 16-26.
    for (const fdi of Object.keys(kit.teeth)) {
      kit.teeth[fdi].visible = J.UPPER_ORDER.includes(fdi);
    }
    for (const g of kit.gums) g.visible = g.name === "gum_upper";
    const pts = ["16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26"].map((fdi) => {
      const mesh = kit.teeth[fdi];
      if (!mesh) return null;
      const fa = J.facialAnchor(mesh, fdi, kit.archCenter, { lingual: true });
      return fa.pos.clone();
    }).filter(Boolean);
    const wire = J.tubeAlong(pts, 0.03, J.metalMaterial(), { tubular: 80 });
    if (wire) kit.overlay.add(wire);
    const button = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 20, 14),
      P.mats.acrylic()
    );
    button.scale.set(1.2, 0.35, 1.0);
    button.position.set(0, 0.2, 0.35);
    kit.overlay.add(button);
    for (const fdi of ["16", "26"]) {
      const mesh = kit.teeth[fdi];
      if (!mesh) continue;
      const fa = J.facialAnchor(mesh, fdi, kit.archCenter);
      const bandR = Math.max(fa.size.x, fa.size.z) * 0.38;
      const band = new THREE.Mesh(new THREE.TorusGeometry(bandR, 0.035, 10, 28), J.metalMaterial());
      band.rotation.x = Math.PI / 2;
      band.position.copy(fa.origin);
      kit.overlay.add(band);
    }
  }

  kit.root.userData.captionSuffix = PEDO_NOTE;
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
}

async function composeDenture(preset, { base }) {
  const complete = preset.complete !== false;
  const arch = "upper";
  const kit = await J.cloneJaw(base, {
    teeth: complete ? "lower" : "all",
    showTongue: false,
    showBone: true,
    showGingiva: true,
    boneOpacity: 0.45,
    gumOpacity: 0.8,
    clipSkull: true,
    openMouth: 0.18,
    missingTeeth: complete ? J.UPPER_ORDER.slice() : ["15", "16", "14"],
  });
  const lift = complete ? 0.35 : 0.2;
  if (complete) {
    const denture = J.makeFullArchProsthesis(kit, { arch, lift, flangeRadius: 0.45 });
    if (preset.flexible) {
      denture.traverse((o) => {
        if (o.isMesh && o.material && o.material.color) {
          const hex = o.material.color.getHex();
          if (hex > 0xe00000 || (o.material.roughness || 0) > 0.4) {
            o.material = new THREE.MeshPhysicalMaterial({
              color: 0xe8b0b8, roughness: 0.4, transparent: true, opacity: 0.88, side: THREE.DoubleSide,
            });
          }
        }
      });
    }
    kit.overlay.add(denture);
  } else {
    // Partial: hide 14-16, pontics + clasp on 13 and 17
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
      return J.facialAnchor(m, fdi, kit.archCenter).origin.clone().add(J.occlusalDir(fdi).multiplyScalar(lift * 0.4));
    }).filter(Boolean);
    if (saddlePts.length >= 3) {
      const shape = new THREE.Shape();
      shape.absellipse(0, 0, 0.42, 0.16, 0, Math.PI * 2, false, 0);
      const saddle = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, {
          extrudePath: new THREE.CatmullRomCurve3(saddlePts, false, "centripetal"),
          steps: 40,
          bevelEnabled: false,
        }),
        preset.flexible
          ? new THREE.MeshPhysicalMaterial({ color: 0xe8b0b8, roughness: 0.4, transparent: true, opacity: 0.88 })
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
          new THREE.TorusGeometry(Math.max(fa.size.x, fa.size.z) * 0.36, 0.025, 8, 20, Math.PI * 1.3),
          J.metalMaterial()
        );
        clasp.rotation.x = Math.PI / 2;
        clasp.position.copy(fa.origin);
        kit.overlay.add(clasp);
      }
    }
  }
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
}

async function composeBridge(preset, { base }) {
  const pontic = "15";
  const kit = await J.cloneJaw(base, {
    showTongue: false,
    showBone: true,
    showGingiva: true,
    boneOpacity: 0.45,
    gumOpacity: 0.85,
    clipSkull: true,
    openMouth: 0.08,
    isolateTeeth: ["14", "15", "16", "13", "17"],
    keepSoftOnIsolate: true,
    keepBoneOnIsolate: true,
    clipToFocus: true,
  });
  J.placeBridge(kit, kit.overlay, pontic, { maryland: !!preset.maryland });
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
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
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
}

async function composeScan(preset, { base }) {
  const kit = await J.cloneJaw(base, {
    teeth: "upper",
    showTongue: false,
    showBone: false,
    showGingiva: true,
    gumOpacity: 0.88,
    clipSkull: true,
  });
  const fa = kit.teeth["11"] ? J.facialAnchor(kit.teeth["11"], "11", kit.archCenter) : { pos: new THREE.Vector3(0, 0, 2), buccal: new THREE.Vector3(0, 0, 1) };
  const wand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.14, 1.4, 16),
    new THREE.MeshStandardMaterial({ color: 0x4a5560, metalness: 0.4, roughness: 0.4 })
  );
  const tip = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.16, 0.36),
    new THREE.MeshStandardMaterial({ color: 0x88ccee, emissive: 0x226688, emissiveIntensity: 0.4 })
  );
  const g = new THREE.Group();
  tip.position.y = 0.75;
  g.add(wand, tip);
  g.position.copy(fa.pos).add(fa.buccal.clone().multiplyScalar(1.1)).add(new THREE.Vector3(0.4, 0.3, 0));
  g.lookAt(fa.pos);
  kit.overlay.add(g);
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
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
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
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
  // Jackscrew in the palatal midline
  const screw = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.35), metal);
  screw.position.set(0, 0.05, 0.15);
  kit.overlay.add(screw);
  const midL = new THREE.Vector3(-0.28, 0.05, 0.15);
  const midR = new THREE.Vector3(0.28, 0.05, 0.15);
  for (const fdi of ["16", "14"]) {
    const mesh = kit.teeth[fdi];
    if (!mesh) continue;
    const fa = J.facialAnchor(mesh, fdi, kit.archCenter, { lingual: true });
    const arm = J.tubeAlong([midL, fa.pos], 0.025, metal);
    if (arm) kit.overlay.add(arm);
  }
  for (const fdi of ["26", "24"]) {
    const mesh = kit.teeth[fdi];
    if (!mesh) continue;
    const fa = J.facialAnchor(mesh, fdi, kit.archCenter, { lingual: true });
    const arm = J.tubeAlong([midR, fa.pos], 0.025, metal);
    if (arm) kit.overlay.add(arm);
  }
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
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
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
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
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
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
  kit.root.userData.captionSuffix = PEDO_NOTE;
  kit.root.userData.syncClip = kit.syncClip;
  kit.root.userData.needsClip = kit.needsClip;
  return kit.root;
}
