// Oral simulator: real anatomy (Z-Anatomy, CC BY-SA 4.0 — see credits.html) with layer opacity + FDI highlight.
import { THREE, OrbitControls, createRenderer, applyStudioEnvironment, loadGLB, fitRenderer } from "./stage.js";

const canvas = document.getElementById("sim-canvas");
if (canvas) init();

function wireUi(api) {
  const fdiMeta = document.getElementById("fdi-meta");
  const fdiSelect = document.getElementById("fdi-select");
  const select = (n) => {
    document.querySelectorAll(".fdi-grid button").forEach((b) => b.classList.toggle("active", b.dataset.fdi === String(n)));
    const shown = api.select(n);
    if (fdiMeta) {
      const mapped = shown !== String(n);
      fdiMeta.textContent = "当前牙位：FDI " + n + (mapped ? "（模型无第三磨牙，已高亮" + shown + "）" : "");
    }
    if (fdiSelect) fdiSelect.value = String(n);
  };
  document.querySelectorAll(".fdi-grid button").forEach((btn) => btn.addEventListener("click", () => select(btn.dataset.fdi)));
  if (fdiSelect) fdiSelect.addEventListener("change", () => select(fdiSelect.value));
  api.onPick = select;

  [["mouth-open", api.setMouth], ["opacity-bone", api.setBone], ["opacity-soft", api.setSoft], ["opacity-tooth", api.setTooth]].forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const apply = () => {
      const row = el.closest(".slider-row");
      const val = row && row.querySelector(".val");
      if (val) val.textContent = el.value + "%";
      fn(Number(el.value) / 100);
    };
    el.addEventListener("input", apply);
    apply();
  });

  document.querySelectorAll(".sim-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".sim-tabs button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll("[data-panel]").forEach((p) => { p.hidden = p.getAttribute("data-panel") !== btn.dataset.tab; });
    });
  });
  const reset = document.getElementById("reset-view");
  if (reset) reset.addEventListener("click", () => api.resetView());
}

async function init() {
  const renderer = createRenderer(canvas);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf6f8f8);
  applyStudioEnvironment(renderer, scene, { intensity: 0.95 });
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 600);
  const key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(30, 60, 60); scene.add(key);
  const fill = new THREE.DirectionalLight(0xcfe6e2, 0.35); fill.position.set(-40, 10, 30); scene.add(fill);

  const mats = {
    bone: new THREE.MeshPhysicalMaterial({ color: 0xe7dcc2, roughness: 0.72, metalness: 0, transparent: true, opacity: 0.92, side: THREE.DoubleSide }),
    gum: new THREE.MeshPhysicalMaterial({ color: 0xe0929f, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.5, sheen: 0.4, sheenColor: new THREE.Color(0xffb0b8), transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
    tongue: new THREE.MeshPhysicalMaterial({ color: 0xcb6f7c, roughness: 0.55, clearcoat: 0.3, clearcoatRoughness: 0.4, transparent: true, opacity: 0.8 }),
  };
  const toothBase = { color: 0xf6f1e6, roughness: 0.24, clearcoat: 0.7, clearcoatRoughness: 0.15, sheen: 0.3, sheenColor: new THREE.Color(0xfff0d8), transparent: true, opacity: 1 };

  const gltf = await loadGLB("assets/models/jaw.glb");
  const root = gltf.scene;
  scene.add(root);
  const teeth = {}, boneM = [], softM = [], toothM = [];
  const lowerGroup = new THREE.Group();
  const upperGroup = new THREE.Group();
  const lowerNodes = [], upperNodes = [];
  root.updateMatrixWorld(true);
  const nodes = [];
  root.traverse((o) => { if (o.isMesh) nodes.push(o); });
  for (const o of nodes) {
    const n = o.name;
    let lower = false;
    if (n.startsWith("tooth_")) {
      const m = new THREE.MeshPhysicalMaterial(toothBase); o.material = m; toothM.push(m); teeth[n.slice(6)] = o;
      lower = Number(n[6]) >= 3;
    } else if (n.startsWith("bone_")) { o.material = mats.bone; lower = n.includes("mandible"); }
    else if (n === "tongue") { o.material = mats.tongue; lower = true; }
    else if (n.startsWith("gum_")) { o.material = mats.gum; lower = n === "gum_lower"; }
    o.geometry.computeVertexNormals && !o.geometry.attributes.normal && o.geometry.computeVertexNormals();
    (lower ? lowerNodes : upperNodes).push(o);
  }
  // hinge group for the mandible: re-parent lower nodes preserving transforms
  root.add(lowerGroup);
  const mand = nodes.find((n) => n.name === "bone_mandible");
  const mb = new THREE.Box3().setFromObject(mand);
  const hinge = new THREE.Vector3(0, mb.max.y - (mb.max.y - mb.min.y) * 0.08, mb.min.z + (mb.max.z - mb.min.z) * 0.12);
  lowerGroup.position.copy(hinge);
  lowerNodes.forEach((o) => { lowerGroup.attach(o); });

  // Trim the bone above the root apices so the skull base / nasal processes do not dominate the view.
  const tbox = new THREE.Box3();
  Object.values(teeth).forEach((t) => tbox.expandByObject(t));
  renderer.localClippingEnabled = true;
  mats.bone.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, -1, 0), tbox.max.y + 1.0)];
  mats.bone.clipShadows = true;
  const box = tbox.clone().expandByScalar(0);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.x * 1.15, size.y * 1.6, size.z);
  const home = () => {
    camera.position.set(center.x + radius * 0.35, center.y + radius * 0.25, center.z + radius * 1.9);
    controls.target.copy(center);
    controls.update();
  };
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.enablePan = false;
  controls.minDistance = radius * 0.5; controls.maxDistance = radius * 3;
  controls.autoRotate = true; controls.autoRotateSpeed = 0.6;
  controls.addEventListener("start", () => { controls.autoRotate = false; });
  home();

  let selected = null;
  const hl = new THREE.Color(0x13b5a6);
  const setSelected = (key) => {
    if (selected) { selected.material.emissive.setHex(0x000000); selected.material.emissiveIntensity = 0; selected.material.color.set(toothBase.color); }
    selected = null;
    const o = teeth[key];
    if (o) { o.material.emissive.copy(hl); o.material.emissiveIntensity = 0.55; o.material.color.set(0xd8fff8); selected = o; }
  };
  const api = {
    onPick: null,
    select(n) { n = String(n); const k = teeth[n] ? n : (n[1] === "8" ? n[0] + "7" : n); setSelected(k); return k; },
    setMouth(v) { lowerGroup.rotation.x = v * 0.38; },
    setBone(v) { mats.bone.opacity = v; mats.bone.depthWrite = v > 0.6; mats.bone.visible = v > 0.01; },
    setSoft(v) { for (const m of [mats.gum, mats.tongue]) { m.opacity = v; m.depthWrite = v > 0.6; m.visible = v > 0.01; } },
    setTooth(v) { for (const m of toothM) { m.opacity = v; m.depthWrite = v > 0.6; m.visible = v > 0.01; } },
    resetView() { home(); controls.autoRotate = true; },
  };
  wireUi(api);

  // click on a tooth to select it
  const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2(); let down = null;
  canvas.addEventListener("pointerdown", (e) => { down = [e.clientX, e.clientY]; });
  canvas.addEventListener("pointerup", (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 4) return;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(Object.values(teeth).filter((t) => t.material.visible), false);
    if (hits.length && api.onPick) api.onPick(hits[0].object.name.slice(6));
  });

  const resize = () => fitRenderer(renderer, camera, canvas, 500);
  window.addEventListener("resize", resize); resize();
  (function loop() { requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); })();
  canvas.dataset.ready = "1";
  window.__sim = { teeth, api, mats, camera, controls };
}
