// Cut a tooth mesh at the cervical margin plane (world-space Y), returning a baked BufferGeometry.
// Tooth GLB meshes include roots; clinical crown ≈ occlusal 42% of AABB height (same as facialAnchor).
import * as THREE from "three";

export function isUpper(fdi) {
  const q = String(fdi)[0];
  return q === "1" || q === "2";
}

/**
 * @param {THREE.Mesh} mesh tooth mesh
 * @param {string} fdi
 * @param {object} o
 * @param {number} o.frac margin as fraction of fullH from occlusal (0.42 crown, 0.45 aligner)
 * @param {"crown"|"root"} [o.keep="crown"]
 * @param {THREE.Vector3} [o.buccal] with facialMin: keep only tris whose avg normal·buccal > facialMin
 * @param {number} [o.facialMin]
 * @param {number} [o.shrinkXZ=1] bake XZ shrink about margin-centre axis
 * @param {number} [o.shrinkY=1] bake Y shrink about margin plane
 * @returns {{ geometry: THREE.BufferGeometry, origin: THREE.Vector3, marginY: number, occlusalY: number, fullH: number, triCount: number }}
 * Geometry is expressed relative to `origin` = (bbCentre.x, marginY, bbCentre.z); put mesh.position = origin.
 */
export function cutToothGeometry(mesh, fdi, o = {}) {
  const frac = o.frac ?? 0.42;
  const keepCrown = (o.keep ?? "crown") === "crown";
  const shrinkXZ = o.shrinkXZ ?? 1;
  const shrinkY = o.shrinkY ?? 1;
  const upper = isUpper(fdi);

  mesh.updateWorldMatrix(true, false);
  const bb = new THREE.Box3().setFromObject(mesh);
  const occlusalY = upper ? bb.min.y : bb.max.y;
  const apicalY = upper ? bb.max.y : bb.min.y;
  const fullH = apicalY - occlusalY;
  const marginY = occlusalY + fullH * frac;
  const cen = bb.getCenter(new THREE.Vector3());
  const origin = new THREE.Vector3(cen.x, marginY, cen.z);

  const geo = mesh.geometry;
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  const index = geo.index;
  const mw = mesh.matrixWorld;
  const nm = new THREE.Matrix3().getNormalMatrix(mw);
  const n = pos.count;

  const P = new Array(n);
  const N = new Array(n);
  const tmp = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    P[i] = tmp.fromBufferAttribute(pos, i).applyMatrix4(mw).clone();
    N[i] = nor
      ? new THREE.Vector3().fromBufferAttribute(nor, i).applyMatrix3(nm).normalize()
      : new THREE.Vector3(0, 0, 0);
  }

  // signed distance: >=0 on kept side
  const sgn = (upper === keepCrown) ? -1 : 1; // upper+crown: keep y<margin → d=margin-y
  const dist = (p) => sgn * (p.y - marginY);

  const outP = [];
  const outN = [];
  const triCount = index ? index.count / 3 : n / 3;

  const lerpV = (a, b, t) => a.clone().lerp(b, t);

  for (let t = 0; t < triCount; t++) {
    const ia = index ? index.getX(t * 3) : t * 3;
    const ib = index ? index.getX(t * 3 + 1) : t * 3 + 1;
    const ic = index ? index.getX(t * 3 + 2) : t * 3 + 2;
    const vs = [
      { p: P[ia], n: N[ia], d: dist(P[ia]) },
      { p: P[ib], n: N[ib], d: dist(P[ib]) },
      { p: P[ic], n: N[ic], d: dist(P[ic]) },
    ];
    // Sutherland–Hodgman against plane d>=0
    const poly = [];
    for (let k = 0; k < 3; k++) {
      const a = vs[k];
      const b = vs[(k + 1) % 3];
      const aIn = a.d >= 0;
      const bIn = b.d >= 0;
      if (aIn) poly.push(a);
      if (aIn !== bIn) {
        const tt = a.d / (a.d - b.d);
        poly.push({
          p: lerpV(a.p, b.p, tt),
          n: lerpV(a.n, b.n, tt).normalize(),
          d: 0,
        });
      }
    }
    if (poly.length < 3) continue;
    for (let k = 1; k < poly.length - 1; k++) {
      const tri = [poly[0], poly[k], poly[k + 1]];
      if (o.buccal && o.facialMin != null) {
        const avg = tri[0].n.clone().add(tri[1].n).add(tri[2].n);
        if (avg.dot(o.buccal) / 3 <= o.facialMin) continue;
      }
      for (const v of tri) {
        outP.push(
          (v.p.x - origin.x) * shrinkXZ,
          (v.p.y - origin.y) * shrinkY,
          (v.p.z - origin.z) * shrinkXZ
        );
        outN.push(v.n.x, v.n.y, v.n.z);
      }
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(outP, 3));
  if (nor) g.setAttribute("normal", new THREE.Float32BufferAttribute(outN, 3));
  else g.computeVertexNormals();
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return { geometry: g, origin, marginY, occlusalY, fullH, triCount: outP.length / 9 };
}
