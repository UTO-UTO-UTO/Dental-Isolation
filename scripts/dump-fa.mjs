// Dump FA placement math for braces (matches js/try.js facialAnchor heuristic).
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const glbPath = path.join(rootDir, "assets/models/jaw.glb");

const ANTERIORS = new Set(["11", "12", "13", "21", "22", "23", "31", "32", "33", "41", "42", "43"]);

function isUpperFdi(fdi) {
  const q = String(fdi)[0];
  return q === "1" || q === "2";
}

function buccalDir(fdi, toothCenter, archCenter) {
  const v = new THREE.Vector3(toothCenter.x - archCenter.x, 0, toothCenter.z - archCenter.z);
  if (v.lengthSq() < 1e-6) v.set(0, 0, 1);
  v.normalize();
  if (ANTERIORS.has(fdi)) {
    v.z = Math.max(v.z, 0.55);
    v.normalize();
  }
  return v;
}

function facialAnchor(mesh, fdi, archCenter) {
  mesh.updateWorldMatrix(true, false);
  const bb = new THREE.Box3().setFromObject(mesh);
  const c = bb.getCenter(new THREE.Vector3());
  const sz = bb.getSize(new THREE.Vector3());
  const buccal = buccalDir(fdi, c, archCenter);
  const upper = isUpperFdi(fdi);
  const occlusalY = upper ? bb.min.y : bb.max.y;
  const apicalY = upper ? bb.max.y : bb.min.y;
  const fullH = apicalY - occlusalY;
  const clinicalCrownH = fullH * 0.42;
  const faY = occlusalY + clinicalCrownH * 0.50;
  const yTol = Math.abs(clinicalCrownH) * 0.08;

  const posAttr = mesh.geometry.attributes.position;
  const norAttr = mesh.geometry.attributes.normal;
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
      score = nrm.dot(buccal);
    } else {
      score = tmp.clone().sub(c).dot(buccal);
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
    fa.add(buccal.clone().multiplyScalar(Math.max(sz.x, sz.z) * 0.38));
  }
  const toothSize = Math.max(sz.x, sz.y, sz.z);
  fa.add(buccal.clone().multiplyScalar(toothSize * 0.025));

  const t = (fa.y - occlusalY) / fullH;
  return { bb, occlusalY, apicalY, fullH, faY: fa.y, t, nCand: candidates.length, pos: fa };
}

const buf = fs.readFileSync(glbPath);
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const gltf = await new Promise((resolve, reject) => {
  loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), "", resolve, reject);
});
const root = gltf.scene;
root.updateMatrixWorld(true);

const tbox = new THREE.Box3();
root.traverse((o) => {
  if (o.isMesh && o.name.startsWith("tooth_")) tbox.expandByObject(o);
});
const archCenter = tbox.getCenter(new THREE.Vector3());

const fdis = ["11", "21", "16", "31", "41"];
console.log("FDI | ymin | ymax | occlusalY | faY | t=(faY-occ)/fullH | nCand");
let allOk = true;
for (const fdi of fdis) {
  const mesh = root.getObjectByName("tooth_" + fdi);
  if (!mesh) {
    console.log(fdi, "MISSING");
    allOk = false;
    continue;
  }
  const r = facialAnchor(mesh, fdi, archCenter);
  const ok = r.t >= 0.18 && r.t <= 0.28;
  if (!ok) allOk = false;
  console.log(
    `${fdi} | ${r.bb.min.y.toFixed(3)} | ${r.bb.max.y.toFixed(3)} | ${r.occlusalY.toFixed(3)} | ${r.faY.toFixed(3)} | t=${r.t.toFixed(3)} ${ok ? "OK" : "OUT"} | n=${r.nCand}`
  );
}
process.exit(allOk ? 0 : 1);
