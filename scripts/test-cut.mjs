// Verify cutToothGeometry: crown above margin, root below, veneer facial-only.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { cutToothGeometry, isUpper } from "../js/tooth-cut.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buf = fs.readFileSync(path.join(root, "assets/models/jaw.glb"));
const gltf = await new Promise((res, rej) => {
  const l = new GLTFLoader(); l.setMeshoptDecoder(MeshoptDecoder);
  l.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), "", res, rej);
});
gltf.scene.updateMatrixWorld(true);

function yrange(r) {
  const p = r.geometry.attributes.position;
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) + r.origin.y; lo = Math.min(lo, y); hi = Math.max(hi, y); }
  return [lo, hi];
}
let ok = true;
console.log("FDI | occl | margin | crownY[lo,hi] | rootY[lo,hi] | tris crown/root/veneer | crown_h/full");
for (const fdi of ["11", "21", "16", "15", "31", "41", "46"]) {
  const m = gltf.scene.getObjectByName("tooth_" + fdi);
  if (!m) continue;
  const up = isUpper(fdi);
  const c = cutToothGeometry(m, fdi, { frac: 0.42, keep: "crown" });
  const r = cutToothGeometry(m, fdi, { frac: 0.42, keep: "root" });
  const buccal = new THREE.Vector3(0, 0, 1);
  const v = cutToothGeometry(m, fdi, { frac: 0.42, keep: "crown", buccal, facialMin: 0.1 });
  const cy = yrange(c), ry = yrange(r);
  const eps = 1e-4;
  const good = up
    ? cy[1] <= c.marginY + eps && ry[0] >= c.marginY - eps
    : cy[0] >= c.marginY - eps && ry[1] <= c.marginY + eps;
  const frac = Math.abs((up ? cy[1] - cy[0] : cy[1] - cy[0])) / Math.abs(c.fullH);
  if (!good || v.triCount >= c.triCount || v.triCount === 0) ok = false;
  console.log(`${fdi} | ${c.occlusalY.toFixed(3)} | ${c.marginY.toFixed(3)} | [${cy.map((x) => x.toFixed(3))}] | [${ry.map((x) => x.toFixed(3))}] | ${c.triCount}/${r.triCount}/${v.triCount} | ${frac.toFixed(3)} ${good ? "OK" : "BAD"}`);
}
process.exit(ok ? 0 : 1);
