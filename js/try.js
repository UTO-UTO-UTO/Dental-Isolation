// Interactive try-on: aligners, braces, crown/veneer, bridge on Z-Anatomy jaw.glb
import { THREE, OrbitControls, createRenderer, applyStudioEnvironment, loadGLB, fitRenderer } from "./stage.js";
import { cutToothGeometry } from "./tooth-cut.js";

const canvas = document.getElementById("try-canvas");
if (canvas) init().catch((err) => {
  const st = document.getElementById("try-status");
  if (st) st.textContent = "模型加载失败：" + (err && err.message ? err.message : String(err));
  console.error(err);
});

const MODE_COPY = {
  aligner: {
    title: "隐形牙套",
    desc: "透明矫治器薄壳覆盖上、下牙列，便于向患者说明「戴上后大致会是什么样」。",
  },
  braces: {
    title: "固定矫治器",
    desc: "唇颊侧托槽与弓丝示意，托槽位于临床冠唇/颊面中份（FA 点附近），帮助理解固定矫治器在牙面上的大致位置。",
  },
  crown: {
    title: "牙冠 / 贴面",
    desc: "点选牙位后展示预备体与修复体：牙冠为整冠外壳，贴面为唇侧薄层。可拖动「拆解 / 就位」查看牙冠与预备体的结构关系。",
  },
  bridge: {
    title: "固定桥",
    desc: "缺牙区以桥体连接两侧基牙冠，便于说明「固定桥如何跨过缺牙间隙」。默认 14–16，中心为 15。",
  },
};

const ANTERIORS = new Set(["11", "12", "13", "21", "22", "23", "31", "32", "33", "41", "42", "43"]);

function isUpperFdi(fdi) {
  const q = String(fdi)[0];
  return q === "1" || q === "2";
}

function ceramicMaterial(kind = "crown") {
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
  });
}

function alignerMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xd8eef2,
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

function metalMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xc9ced3,
    metalness: 0.92,
    roughness: 0.28,
  });
}

async function init() {
  const statusEl = document.getElementById("try-status");
  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf6f8f8);
  applyStudioEnvironment(renderer, scene, { intensity: 0.95 });
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 600);
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(30, 60, 60);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xcfe6e2, 0.35);
  fill.position.set(-40, 10, 30);
  scene.add(fill);

  const mats = {
    bone: new THREE.MeshPhysicalMaterial({
      color: 0xe7dcc2, roughness: 0.72, metalness: 0,
      transparent: true, opacity: 0.55, side: THREE.DoubleSide,
    }),
    gum: new THREE.MeshPhysicalMaterial({
      color: 0xe0929f, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.5,
      sheen: 0.4, sheenColor: new THREE.Color(0xffb0b8),
      transparent: true, opacity: 0.7, side: THREE.DoubleSide,
    }),
    tongue: new THREE.MeshPhysicalMaterial({
      color: 0xcb6f7c, roughness: 0.55, clearcoat: 0.3, clearcoatRoughness: 0.4,
      transparent: true, opacity: 0.7,
    }),
  };
  const toothBase = {
    color: 0xf6f1e6, roughness: 0.24, clearcoat: 0.7, clearcoatRoughness: 0.15,
    sheen: 0.3, sheenColor: new THREE.Color(0xfff0d8),
  };

  const gltf = await loadGLB("assets/models/jaw.glb");
  const root = gltf.scene;
  scene.add(root);

  const teeth = {};
  const toothMats = {};
  const toothBaseScale = {};
  const nodes = [];
  root.updateMatrixWorld(true);
  root.traverse((o) => { if (o.isMesh) nodes.push(o); });

  for (const o of nodes) {
    const n = o.name;
    if (n.startsWith("tooth_")) {
      const m = new THREE.MeshPhysicalMaterial(toothBase);
      o.material = m;
      const fdi = n.slice(6);
      toothMats[fdi] = m;
      teeth[fdi] = o;
      toothBaseScale[fdi] = o.scale.clone();
    } else if (n.startsWith("bone_")) {
      o.material = mats.bone;
    } else if (n === "tongue") {
      o.material = mats.tongue;
    } else if (n.startsWith("gum_")) {
      o.material = mats.gum;
    }
  }

  // Clip skull base like simulate
  const tbox = new THREE.Box3();
  Object.values(teeth).forEach((t) => tbox.expandByObject(t));
  renderer.localClippingEnabled = true;
  mats.bone.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, -1, 0), tbox.max.y + 1.0)];
  mats.bone.clipShadows = true;

  const box = tbox.clone();
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.x * 1.15, size.y * 1.6, size.z);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = radius * 0.5;
  controls.maxDistance = radius * 3;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.45;
  controls.addEventListener("start", () => { controls.autoRotate = false; });

  const camEase = {
    active: false,
    target: new THREE.Vector3(),
    position: new THREE.Vector3(),
  };

  const home = () => {
    camera.position.set(center.x + radius * 0.2, center.y + radius * 0.18, center.z + radius * 1.85);
    controls.target.copy(center);
    controls.update();
    camEase.active = false;
  };
  home();

  // Overlay groups
  const overlay = new THREE.Group();
  overlay.name = "try_overlay";
  scene.add(overlay);

  const state = {
    mode: "aligner",
    crownKind: "crown",
    selected: "11",
    bridgeCenter: "15",
    crownExplode: 0, // 0 = seated, 1 = exploded
  };

  /** @type {{ shell: THREE.Object3D, seat: THREE.Vector3, explode: THREE.Vector3, leader?: THREE.Line } | null} */
  let crownAnim = null;

  function clearOverlay() {
    while (overlay.children.length) {
      const c = overlay.children.pop();
      c.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material.dispose();
        }
      });
    }
    crownAnim = null;
  }

  function resetToothAppearance() {
    for (const [k, mesh] of Object.entries(teeth)) {
      mesh.visible = true;
      if (toothBaseScale[k]) mesh.scale.copy(toothBaseScale[k]);
      const m = toothMats[k];
      m.color.set(toothBase.color);
      m.emissive.setHex(0x000000);
      m.emissiveIntensity = 0;
      m.transparent = false;
      m.opacity = 1;
      m.transmission = 0;
      m.roughness = toothBase.roughness;
      m.metalness = 0;
      m.clearcoat = toothBase.clearcoat;
      m.clearcoatRoughness = toothBase.clearcoatRoughness;
      m.sheen = toothBase.sheen;
      m.needsUpdate = true;
    }
  }

  function worldBox(mesh) {
    mesh.updateWorldMatrix(true, false);
    return new THREE.Box3().setFromObject(mesh);
  }

  function worldCenter(mesh) {
    return worldBox(mesh).getCenter(new THREE.Vector3());
  }

  function buccalDir(fdi, toothCenter) {
    // Facial/buccal: away from arch midline in XZ; anteriors bias toward +Z (labial)
    const dx = toothCenter.x - center.x;
    const dz = toothCenter.z - center.z;
    const v = new THREE.Vector3(dx, 0, dz);
    if (v.lengthSq() < 1e-6) v.set(0, 0, 1);
    v.normalize();
    if (ANTERIORS.has(fdi)) {
      v.z = Math.max(v.z, 0.55);
      v.normalize();
    }
    return v;
  }

  function occlusalDir(fdi) {
    // Upper: occlusal toward -Y; lower: toward +Y
    return isUpperFdi(fdi) ? new THREE.Vector3(0, -1, 0) : new THREE.Vector3(0, 1, 0);
  }

  function gingivalDir(fdi) {
    return isUpperFdi(fdi) ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, -1, 0);
  }

  /**
   * FA-point on labial/buccal clinical crown.
   * Models include roots → clinical crown ≈ 42% of AABB height from occlusal;
   * FA at mid of that crown (~21% of fullH from occlusal).
   * Facial XY from most-buccal verts near that height (no gum-min sampling).
   */
  function facialAnchor(mesh, fdi) {
    mesh.updateWorldMatrix(true, false);
    const bb = new THREE.Box3().setFromObject(mesh);
    const c = bb.getCenter(new THREE.Vector3());
    const sz = bb.getSize(new THREE.Vector3());
    const buccal = buccalDir(fdi, c);
    const upper = isUpperFdi(fdi);
    const occlusalY = upper ? bb.min.y : bb.max.y;
    const apicalY = upper ? bb.max.y : bb.min.y;
    const fullH = apicalY - occlusalY; // signed: + upper, − lower
    const clinicalCrownH = fullH * 0.42;
    const faY = occlusalY + clinicalCrownH * 0.50;
    const yTol = Math.abs(clinicalCrownH) * 0.08;

    const geo = mesh.geometry;
    const posAttr = geo.attributes.position;
    const norAttr = geo.attributes.normal;
    const mw = mesh.matrixWorld;
    const tmp = new THREE.Vector3();
    const nrm = new THREE.Vector3();

    /** @type {{ p: THREE.Vector3, score: number }[]} */
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
      fa.y = faY; // lock height to mid-clinical
    } else {
      fa = c.clone();
      fa.y = faY;
      fa.add(buccal.clone().multiplyScalar(Math.max(sz.x, sz.z) * 0.38));
    }

    const toothSize = Math.max(sz.x, sz.y, sz.z);
    fa.add(buccal.clone().multiplyScalar(toothSize * 0.025));

    return {
      pos: fa,
      buccal,
      size: sz,
      center: c,
      bb,
      toothSize,
      occlusalY,
      faY,
      fullH,
      clinicalCrownH,
    };
  }

  function orientBracket(obj, pos, buccal, fdi) {
    const z = buccal.clone().normalize();
    let y = gingivalDir(fdi).clone();
    y.sub(z.clone().multiplyScalar(y.dot(z)));
    if (y.lengthSq() < 1e-8) y.set(0, 1, 0);
    y.normalize();
    const x = new THREE.Vector3().crossVectors(y, z).normalize();
    y.crossVectors(z, x).normalize();
    const m = new THREE.Matrix4().makeBasis(x, y, z);
    obj.quaternion.setFromRotationMatrix(m);
    obj.position.copy(pos);
  }

  /** Bracket: base plate + twin wings forming a wire slot (local +Z buccal, +Y gingival). */
  function makeBracket(unit) {
    const metal = metalMaterial();
    const g = new THREE.Group();
    const w = unit * 0.95;
    const h = unit * 0.85;
    const d = unit * 0.42;

    const base = new THREE.Mesh(new THREE.BoxGeometry(w, h, d * 0.45), metal);
    base.position.z = d * 0.22;
    g.add(base);

    const wingW = w * 1.05;
    const wingH = h * 0.28;
    const wingD = d * 0.55;
    const wingY = h * 0.28;
    const top = new THREE.Mesh(new THREE.BoxGeometry(wingW, wingH, wingD), metal);
    top.position.set(0, wingY, d * 0.55);
    g.add(top);
    const bot = new THREE.Mesh(new THREE.BoxGeometry(wingW, wingH, wingD), metal);
    bot.position.set(0, -wingY, d * 0.55);
    g.add(bot);

    // tiny slot floor between wings
    const slot = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, h * 0.12, d * 0.2), metal);
    slot.position.set(0, 0, d * 0.62);
    g.add(slot);

    g.userData.slotOffset = d * 0.75;
    return g;
  }

  /**
   * Shell cut at cervical margin plane (no root). Origin sits at margin-plane centre so
   * uniform scale grows away from the margin and position lerp (explode) just moves the shell.
   */
  const CROWN_FRAC = 0.42;
  const ALIGNER_FRAC = 0.45;

  function cutShell(mesh, fdi, mat, { frac = CROWN_FRAC, scale = 1, keep = "crown", buccal, facialMin, shrinkXZ, shrinkY } = {}) {
    const cut = cutToothGeometry(mesh, fdi, { frac, keep, buccal, facialMin, shrinkXZ, shrinkY });
    if (mat) mat.side = THREE.DoubleSide;
    const shell = new THREE.Mesh(cut.geometry, mat);
    shell.position.copy(cut.origin);
    shell.scale.setScalar(scale);
    shell.userData.cut = cut;
    return shell;
  }

  function buildAligners() {
    const mat = alignerMaterial();
    for (const [fdi, mesh] of Object.entries(teeth)) {
      const shell = cutShell(mesh, fdi, mat, { frac: ALIGNER_FRAC, scale: 1.055 });
      const c = worldCenter(mesh);
      const b = buccalDir(fdi, c);
      shell.position.add(b.multiplyScalar(0.08));
      shell.renderOrder = 2;
      overlay.add(shell);
    }
  }

  function buildBraces() {
    const metal = metalMaterial();
    const orderUpper = ["17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27"];
    const orderLower = ["47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37"];

    function placeArch(order) {
      const pts = [];
      for (const fdi of order) {
        const mesh = teeth[fdi];
        if (!mesh) continue;
        const { pos, buccal, toothSize } = facialAnchor(mesh, fdi);
        const unit = toothSize * 0.16;
        const bracket = makeBracket(unit);
        orientBracket(bracket, pos, buccal, fdi);
        overlay.add(bracket);

        if (debugBraces) {
          const mark = new THREE.Mesh(
            new THREE.SphereGeometry(unit * 0.35, 10, 10),
            new THREE.MeshBasicMaterial({ color: 0xff2244, depthTest: false })
          );
          mark.position.copy(pos);
          mark.renderOrder = 10;
          overlay.add(mark);
        }

        const slotOff = bracket.userData.slotOffset || unit * 0.5;
        pts.push(pos.clone().add(buccal.clone().multiplyScalar(slotOff * 1.15)));
      }
      if (pts.length >= 2) {
        const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
        const tubeR = Math.max(0.035, pts[0].distanceTo(pts[Math.min(1, pts.length - 1)]) * 0.04);
        const tube = new THREE.Mesh(
          new THREE.TubeGeometry(curve, Math.max(48, pts.length * 10), Math.min(0.055, tubeR), 8, false),
          metal
        );
        overlay.add(tube);
      }
      return pts;
    }

    placeArch(orderUpper);
    placeArch(orderLower);
  }

  function applyCrownExplodeVisual() {
    if (!crownAnim) return;
    const t = state.crownExplode;
    crownAnim.shell.position.lerpVectors(crownAnim.seat, crownAnim.explode, t);
    if (crownAnim.leader) {
      const arr = crownAnim.leader.geometry.attributes.position;
      arr.setXYZ(0, crownAnim.seat.x, crownAnim.seat.y, crownAnim.seat.z);
      arr.setXYZ(1, crownAnim.shell.position.x, crownAnim.shell.position.y, crownAnim.shell.position.z);
      arr.needsUpdate = true;
      crownAnim.leader.visible = t > 0.04;
    }
  }

  function buildCrownMode() {
    const fdi = state.selected;
    const mesh = teeth[fdi];
    if (!mesh) return;
    const kind = state.crownKind;
    const c = worldCenter(mesh);
    const buccal = buccalDir(fdi, c);
    const occl = occlusalDir(fdi);
    const bb = worldBox(mesh);
    const sz = bb.getSize(new THREE.Vector3());
    const lift = Math.max(sz.x, sz.y, sz.z);

    if (kind === "veneer") {
      // Keep natural tooth; labial thin shell; explode moves labially
      const mat = ceramicMaterial("veneer");
      const shell = cutShell(mesh, fdi, mat, { frac: CROWN_FRAC, scale: 1.02, buccal, facialMin: 0.1 });
      shell.scale.set(1.02, 1.02, 1.01);
      shell.renderOrder = 3;
      const seat = shell.position.clone().add(buccal.clone().multiplyScalar(0.1));
      shell.position.copy(seat);
      const explode = seat.clone()
        .add(buccal.clone().multiplyScalar(lift * 0.55))
        .add(occl.clone().multiplyScalar(lift * 0.08));
      overlay.add(shell);

      const leaderGeo = new THREE.BufferGeometry().setFromPoints([seat.clone(), seat.clone()]);
      const leader = new THREE.Line(
        leaderGeo,
        new THREE.LineBasicMaterial({ color: 0x5a7a76, transparent: true, opacity: 0.55 })
      );
      leader.visible = false;
      overlay.add(leader);

      crownAnim = { shell, seat, explode, leader };
      toothMats[fdi].emissive.setHex(0x1a3a36);
      toothMats[fdi].emissiveIntensity = 0.08;
    } else {
      // Crown shell = clinical crown only (cut at margin). Original full tooth is hidden and
      // replaced by: natural root (unchanged) + gray reduced prep crown above the margin.
      const mat = ceramicMaterial("crown");
      const shell = cutShell(mesh, fdi, mat, { frac: CROWN_FRAC, scale: 1.03 });
      shell.renderOrder = 3;
      const seatPos = shell.position.clone();
      const explodePos = seatPos.clone()
        .add(buccal.clone().multiplyScalar(lift * 0.35))
        .add(occl.clone().multiplyScalar(lift * 0.55));
      overlay.add(shell);

      const root = cutShell(mesh, fdi, new THREE.MeshPhysicalMaterial(toothBase), { frac: CROWN_FRAC, keep: "root" });
      overlay.add(root);

      const prepMat = new THREE.MeshPhysicalMaterial({
        color: 0xb8b4ae, roughness: 0.8, metalness: 0.05, clearcoat: 0.05, sheen: 0,
      });
      const prep = cutShell(mesh, fdi, prepMat, { frac: CROWN_FRAC, keep: "crown", shrinkXZ: 0.9, shrinkY: 0.92 });
      overlay.add(prep);
      mesh.visible = false;

      const leaderGeo = new THREE.BufferGeometry().setFromPoints([seatPos.clone(), seatPos.clone()]);
      const leader = new THREE.Line(
        leaderGeo,
        new THREE.LineBasicMaterial({ color: 0x5a7a76, transparent: true, opacity: 0.55 })
      );
      leader.visible = false;
      overlay.add(leader);

      crownAnim = { shell, seat: seatPos, explode: explodePos, leader };
    }

    applyCrownExplodeVisual();
  }

  function neighborsOf(fdi) {
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

  function buildBridge() {
    const pontic = state.bridgeCenter;
    let abut = neighborsOf(pontic);
    if (abut.length < 2) {
      state.bridgeCenter = "15";
      abut = ["14", "16"];
    }
    const [a, b] = abut;
    const mat = ceramicMaterial("crown");

    if (teeth[pontic]) teeth[pontic].visible = false;

    for (const fdi of [a, b]) {
      if (!teeth[fdi]) continue;
      // Abutment: ceramic crown portion + natural root portion (original full tooth hidden)
      const shell = cutShell(teeth[fdi], fdi, mat, { frac: CROWN_FRAC, scale: 1.03 });
      overlay.add(shell);
      overlay.add(cutShell(teeth[fdi], fdi, new THREE.MeshPhysicalMaterial(toothBase), { frac: CROWN_FRAC, keep: "root" }));
      teeth[fdi].visible = false;
    }

    const srcFdi = teeth[pontic] ? pontic : a;
    const src = teeth[srcFdi];
    if (src) {
      // Pontic: crown portion only, no root
      const ponticMesh = cutShell(src, srcFdi, mat.clone(), { frac: CROWN_FRAC, scale: 1.02 });
      const ca = teeth[a] ? worldCenter(teeth[a]) : center;
      const cb = teeth[b] ? worldCenter(teeth[b]) : center;
      const mid = ca.clone().add(cb).multiplyScalar(0.5);
      ponticMesh.position.x = mid.x;
      ponticMesh.position.z = mid.z;
      overlay.add(ponticMesh);

      const metal = metalMaterial();
      for (const end of [a, b]) {
        if (!teeth[end]) continue;
        const ce = worldCenter(teeth[end]);
        const dir = mid.clone().sub(ce);
        const len = dir.length();
        if (len < 0.01) continue;
        const rod = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.06, len * 0.85, 8),
          metal
        );
        rod.position.copy(ce).lerp(mid, 0.5);
        rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        overlay.add(rod);
      }
    }
  }

  function rebuild() {
    clearOverlay();
    resetToothAppearance();
    if (state.mode === "aligner") buildAligners();
    else if (state.mode === "braces") buildBraces();
    else if (state.mode === "crown") buildCrownMode();
    else if (state.mode === "bridge") buildBridge();
    highlightSelection();
  }

  function easeCameraToTooth(fdi) {
    const mesh = teeth[fdi];
    if (!mesh) return;
    const c = worldCenter(mesh);
    camEase.target.copy(c);
    const offset = camera.position.clone().sub(controls.target);
    const dist = Math.max(offset.length() * 0.82, radius * 0.7);
    if (offset.lengthSq() < 1e-6) offset.set(0.2, 0.15, 1).normalize();
    else offset.normalize();
    camEase.position.copy(c).add(offset.multiplyScalar(dist));
    camEase.active = true;
    controls.autoRotate = false;
  }

  function highlightSelection() {
    const key = state.mode === "bridge" ? state.bridgeCenter : state.selected;
    document.querySelectorAll(".fdi-grid button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.fdi === key);
    });
    const meta = document.getElementById("fdi-meta");
    if (meta) {
      if (state.mode === "bridge") {
        const abut = neighborsOf(state.bridgeCenter);
        meta.textContent = "桥体中心：FDI " + state.bridgeCenter + (abut.length ? " · 基牙 " + abut.join(" / ") : "");
      } else if (state.mode === "crown") {
        meta.textContent = "当前牙位：FDI " + state.selected + " · " + (state.crownKind === "veneer" ? "贴面" : "牙冠");
      } else {
        meta.textContent = "当前牙位：FDI " + state.selected + "（本模式可点选以便对照）";
      }
    }
  }

  function syncCrownExplodeUI() {
    const el = document.getElementById("crown-explode");
    const val = document.getElementById("val-crown-explode");
    if (el) el.value = String(Math.round(state.crownExplode * 100));
    if (val) val.textContent = Math.round(state.crownExplode * 100) + "%";
  }

  function setMode(mode) {
    state.mode = mode;
    document.querySelectorAll(".try-mode-tabs button").forEach((b) => {
      b.classList.toggle("active", b.dataset.mode === mode);
    });
    const copy = MODE_COPY[mode];
    const title = document.getElementById("try-title");
    const desc = document.getElementById("try-desc");
    if (title) title.textContent = copy.title;
    if (desc) desc.textContent = copy.desc;

    const needFdi = mode === "crown" || mode === "bridge" || mode === "aligner" || mode === "braces";
    const blockFdi = document.getElementById("block-fdi");
    if (blockFdi) blockFdi.hidden = !needFdi;
    const blockCrown = document.getElementById("block-crown-kind");
    if (blockCrown) blockCrown.hidden = mode !== "crown";
    const blockExplode = document.getElementById("block-crown-explode");
    if (blockExplode) blockExplode.hidden = mode !== "crown";
    const blockBridge = document.getElementById("block-bridge");
    if (blockBridge) blockBridge.hidden = mode !== "bridge";

    if (mode === "crown") {
      syncCrownExplodeUI();
      easeCameraToTooth(state.selected);
    }
    rebuild();
  }

  // UI wiring
  document.querySelectorAll(".try-mode-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });
  document.querySelectorAll("[data-crown-kind]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-crown-kind]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.crownKind = btn.dataset.crownKind;
      if (state.mode === "crown") rebuild();
      else highlightSelection();
    });
  });
  document.querySelectorAll(".fdi-grid button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const n = btn.dataset.fdi;
      if (state.mode === "bridge") state.bridgeCenter = n;
      else state.selected = n;
      if (state.mode === "crown") {
        easeCameraToTooth(n);
        rebuild();
      } else if (state.mode === "bridge") {
        rebuild();
      } else {
        highlightSelection();
      }
    });
  });

  const explodeEl = document.getElementById("crown-explode");
  const explodeVal = document.getElementById("val-crown-explode");
  if (explodeEl) {
    explodeEl.addEventListener("input", () => {
      state.crownExplode = Number(explodeEl.value) / 100;
      if (explodeVal) explodeVal.textContent = explodeEl.value + "%";
      applyCrownExplodeVisual();
    });
  }
  document.getElementById("crown-seat")?.addEventListener("click", () => {
    state.crownExplode = 0;
    syncCrownExplodeUI();
    applyCrownExplodeVisual();
  });
  document.getElementById("crown-open")?.addEventListener("click", () => {
    state.crownExplode = 1;
    syncCrownExplodeUI();
    applyCrownExplodeVisual();
  });

  const bindOpacity = (id, valId, apply) => {
    const el = document.getElementById(id);
    const val = document.getElementById(valId);
    if (!el) return;
    const go = () => {
      const v = Number(el.value) / 100;
      if (val) val.textContent = el.value + "%";
      apply(v);
    };
    el.addEventListener("input", go);
    go();
  };
  bindOpacity("opacity-bone", "val-bone", (v) => {
    mats.bone.opacity = v;
    mats.bone.depthWrite = v > 0.6;
    mats.bone.visible = v > 0.01;
  });
  bindOpacity("opacity-soft", "val-soft", (v) => {
    for (const m of [mats.gum, mats.tongue]) {
      m.opacity = v;
      m.depthWrite = v > 0.6;
      m.visible = v > 0.01;
    }
  });

  document.getElementById("reset-try")?.addEventListener("click", () => {
    home();
    controls.autoRotate = true;
    state.selected = "11";
    state.bridgeCenter = "15";
    state.crownKind = "crown";
    state.crownExplode = 0;
    document.querySelectorAll("[data-crown-kind]").forEach((b) => {
      b.classList.toggle("active", b.dataset.crownKind === "crown");
    });
    syncCrownExplodeUI();
    setMode(state.mode);
  });

  // click tooth to select
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let down = null;
  canvas.addEventListener("pointerdown", (e) => { down = [e.clientX, e.clientY]; });
  canvas.addEventListener("pointerup", (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(Object.values(teeth).filter((t) => t.visible), false);
    if (!hits.length) return;
    const fdi = hits[0].object.name.slice(6);
    if (state.mode === "bridge") state.bridgeCenter = fdi;
    else state.selected = fdi;
    if (state.mode === "crown") {
      easeCameraToTooth(fdi);
      rebuild();
    } else if (state.mode === "bridge") {
      rebuild();
    } else {
      highlightSelection();
    }
  });

  const params = new URLSearchParams(location.search);
  const debugBraces = params.get("debug") === "1";
  const startMode = params.get("mode");
  if (params.has("explode")) {
    state.crownExplode = Math.min(1, Math.max(0, Number(params.get("explode")) / 100));
  }
  if (params.get("fdi")) {
    state.selected = params.get("fdi");
  }
  setMode(["aligner", "braces", "crown", "bridge"].includes(startMode) ? startMode : "aligner");
  if (state.mode === "crown") {
    syncCrownExplodeUI();
    applyCrownExplodeVisual();
  }
  if (params.get("still") === "1") {
    controls.autoRotate = false;
    camera.position.set(center.x, center.y + radius * 0.05, center.z + radius * 1.55);
    controls.target.copy(center);
    controls.update();
  }
  if (statusEl) {
    statusEl.textContent = "科普示意 · 拖动查看";
    setTimeout(() => { statusEl.style.opacity = "0"; }, 2200);
  }

  const resize = () => fitRenderer(renderer, camera, canvas, 500);
  window.addEventListener("resize", resize);
  resize();
  (function loop() {
    requestAnimationFrame(loop);
    if (camEase.active) {
      controls.target.lerp(camEase.target, 0.07);
      camera.position.lerp(camEase.position, 0.07);
      if (controls.target.distanceTo(camEase.target) < 0.02 &&
          camera.position.distanceTo(camEase.position) < 0.05) {
        camEase.active = false;
      }
    }
    controls.update();
    renderer.render(scene, camera);
  })();
  canvas.dataset.ready = "1";
  window.__tryOn = { teeth, state, rebuild, setMode, camera, controls, facialAnchor };
}
