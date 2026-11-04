// Procedural dental implant parts (original geometry, units: millimetres, +Y up, platform at y=0).
import * as THREE from "three";

// Threaded fixture: true helical thread (trapezoidal profile), micro-threaded collar,
// tapered rounded apex, internal hex socket. Radius profile r(y, theta) displaced on a (theta,y) grid.
export function makeFixtureGeometry({ length = 10, radius = 2.0, pitch = 0.8, depth = 0.32, collar = 1.3, taperLen = 3.0, hexR = 1.35, socketDepth = 2.6 } = {}) {
  const NT = 128, NY = 520;
  const pos = [], idx = [];
  const trap = (p) => { // p in [0,1): flat root / flank / flat crest / flank
    const q = p < 0 ? p + 1 : p;
    if (q < 0.18) return q / 0.18;
    if (q < 0.38) return 1;
    if (q < 0.56) return 1 - (q - 0.38) / 0.18;
    return 0;
  };
  const radiusAt = (y, th) => { // y in [0,-length]
    const d = -y; // depth below platform
    let r = radius - depth * 0.55;
    if (d < collar) { // micro-threads on the neck
      const p = (d / 0.28 - th / (2 * Math.PI)) % 1;
      r = radius - 0.05 + 0.05 * trap(p);
    } else {
      const k = Math.min(1, (d - collar) / 0.5); // thread run-in
      const p = ((d - collar) / pitch - th / (2 * Math.PI)) % 1;
      let a = depth * trap(p) * k;
      const tp = Math.max(0, (d - (length - taperLen)) / taperLen); // taper to apex
      const taper = 1 - 0.30 * tp;
      r = (radius - depth + a) * taper + depth * 0.45 * (1 - taper);
      r = (radius - depth * 0.55 + (a - depth * 0.45)) * taper;
    }
    // rounded apex
    const e = Math.max(0, d - (length - 0.9)) / 0.9;
    if (e > 0) r *= Math.sqrt(Math.max(0, 1 - e * e)) * 0.98 + 0.02 * (1 - e);
    return r;
  };
  for (let j = 0; j <= NY; j++) {
    const y = -(j / NY) * length;
    for (let i = 0; i <= NT; i++) {
      const th = (i / NT) * Math.PI * 2;
      const r = radiusAt(y, th);
      pos.push(Math.cos(th) * r, y, Math.sin(th) * r);
    }
  }
  const W = NT + 1;
  for (let j = 0; j < NY; j++) for (let i = 0; i < NT; i++) {
    const a = j * W + i, b = a + 1, c = a + W, d = c + 1;
    idx.push(a, b, c, b, d, c); // winding: outward
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  // seam normals
  const n = g.attributes.normal;
  for (let j = 0; j <= NY; j++) {
    const a = j * W, b = a + NT;
    const x = n.getX(a) + n.getX(b), y = n.getY(a) + n.getY(b), z = n.getZ(a) + n.getZ(b);
    const l = Math.hypot(x, y, z) || 1;
    n.setXYZ(a, x / l, y / l, z / l); n.setXYZ(b, x / l, y / l, z / l);
  }
  return { body: g, socket: makeHexSocket(radius - 0.05, hexR, socketDepth) };
}

function hexPts(R, rot = 0) {
  return Array.from({ length: 6 }, (_, k) => { const a = rot + (k * Math.PI) / 3; return new THREE.Vector2(Math.cos(a) * R, Math.sin(a) * R); });
}

// Top platform annulus with hex hole + hex wells + floor.
function makeHexSocket(outerR, hexR, depth) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  const hp = hexPts(hexR);
  hole.moveTo(hp[0].x, hp[0].y);
  for (let k = 1; k < 6; k++) hole.lineTo(hp[k].x, hp[k].y);
  hole.closePath();
  shape.holes.push(hole);
  const top = new THREE.ShapeGeometry(shape, 48);
  top.rotateX(-Math.PI / 2); // faces +Y
  const pos = [], nor = [], idx = [];
  for (let k = 0; k < 6; k++) {
    const a = hp[k], b = hp[(k + 1) % 6];
    const base = pos.length / 3;
    pos.push(a.x, 0, -a.y, b.x, 0, -b.y, b.x, -depth, -b.y, a.x, -depth, -a.y);
    const mx = -(a.x + b.x) / 2, mz = (a.y + b.y) / 2; // inward normal (towards axis), xz of mid in the rotated frame
    const l = Math.hypot(mx, mz);
    for (let q = 0; q < 4; q++) nor.push(mx / l * -1 * -1 * -1, 0, mz / l * -1 * -1);
    idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
  }
  const walls = new THREE.BufferGeometry();
  walls.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  walls.setIndex(idx);
  walls.computeVertexNormals();
  // floor
  const fl = new THREE.CircleGeometry(hexR * 0.98, 6); fl.rotateX(-Math.PI / 2); fl.translate(0, -depth, 0);
  return { top, walls, floor: fl };
}

// Abutment profile (lathe) with hex connection stub below the platform.
export function makeAbutmentGeometry() {
  const pts = [
    [0.0, -0.001], [1.9, -0.001], [1.9, 0.0], [2.12, 0.25], [2.2, 0.9], [2.0, 1.55], [1.78, 2.3],
    [1.72, 3.0], [1.58, 3.45], [1.3, 3.62], [0.8, 3.7], [0.0, 3.7],
  ];
  const v = pts.map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(v, 96);
  return g;
}
export function makeAbutmentHexStub() {
  const s = new THREE.Shape(hexPts(1.3));
  const g = new THREE.ExtrudeGeometry(s, { depth: 2.4, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2 });
  g.rotateX(Math.PI / 2); // extrude along -Y: from y=0 down to -2.4
  g.translate(0, 0, 0);
  g.computeVertexNormals();
  return g;
}

// Retention screw with fine thread.
export function makeScrewGeometry() {
  const NT = 48, NY = 160, L = 7.0, R = 0.72;
  const pos = [], idx = [];
  for (let j = 0; j <= NY; j++) {
    const y = -(j / NY) * L;
    for (let i = 0; i <= NT; i++) {
      const th = (i / NT) * Math.PI * 2;
      const p = ((-y) / 0.35 - th / (2 * Math.PI)) % 1; const q = p < 0 ? p + 1 : p;
      const t = q < 0.5 ? 1 - Math.abs(q - 0.25) * 4 : 0;
      let r = R - 0.1 + 0.1 * t;
      const e = Math.max(0, -y - (L - 0.5)) / 0.5; r *= Math.sqrt(Math.max(0.0001, 1 - e * e));
      pos.push(Math.cos(th) * r, y, Math.sin(th) * r);
    }
  }
  const W = NT + 1;
  for (let j = 0; j < NY; j++) for (let i = 0; i < NT; i++) { const a = j * W + i; idx.push(a, a + 1, a + W, a + 1, a + W + 1, a + W); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const head = new THREE.LatheGeometry([[0, 0.7], [0.9, 0.7], [1.2, 0.55], [1.2, 0.1], [0.72, 0], [0, 0]].map(([r, y]) => new THREE.Vector2(r, y)), 48);
  head.computeVertexNormals();
  return { shaft: g, head };
}
