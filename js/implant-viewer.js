/**
 * Implant explode viewer for the scroll-chapter home page.
 * Crown: real anatomy mesh (Z-Anatomy, CC BY-SA 4.0), see credits.html.
 * Fixture / abutment / screw: original procedural geometry (js/implant-geometry.js), PBR titanium.
 */
import { THREE, OrbitControls, createRenderer, applyStudioEnvironment, loadGLB, makeContactShadow, fitRenderer } from "./stage.js";
import * as G from "./implant-geometry.js";

const canvas = document.getElementById("implant-canvas");
if (canvas) init();

async function init() {
  const renderer = createRenderer(canvas, { alpha: true });
  const scene = new THREE.Scene();
  applyStudioEnvironment(renderer, scene, { intensity: 1.0 });
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const CAM_HOME = new THREE.Vector3(2.2, 1.0, 5.4);
  camera.position.copy(CAM_HOME);

  const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(4, 7, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfe3dc, 0.6); rim.position.set(-5, 3, -4); scene.add(rim);

  const MM = 1 / 12; // scene units per millimetre
  const group = new THREE.Group();
  scene.add(group);
  const model = new THREE.Group();
  model.scale.setScalar(MM);
  group.add(model);
  group.rotation.set(0.12, -0.55, 0);
  group.position.set(1.15, 0, 0);

  const titanium = new THREE.MeshPhysicalMaterial({ color: 0xcfd3d8, metalness: 1, roughness: 0.3, clearcoat: 0.15, clearcoatRoughness: 0.4 });
  const titaniumAbut = new THREE.MeshPhysicalMaterial({ color: 0xd9dce0, metalness: 1, roughness: 0.26 });
  const ceramic = new THREE.MeshPhysicalMaterial({
    vertexColors: true, roughness: 0.2, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08,
    sheen: 0.5, sheenColor: new THREE.Color(0xfff0d8), sheenRoughness: 0.5,
    transmission: 0.0, ior: 1.6, specularIntensity: 1,
  });

  // --- fixture
  const fixture = new THREE.Group();
  const fx = G.makeFixtureGeometry();
  fixture.add(new THREE.Mesh(fx.body, titanium));
  fixture.add(new THREE.Mesh(fx.socket.top, titanium), new THREE.Mesh(fx.socket.walls, titanium), new THREE.Mesh(fx.socket.floor, titanium));
  fixture.children.forEach((m) => { m.material = titanium.clone(); m.material.side = THREE.DoubleSide; });
  fixture.userData = { homeY: 0, explodeY: -4.5 };

  // --- abutment (+ retention screw inside)
  const abutment = new THREE.Group();
  abutment.add(new THREE.Mesh(G.makeAbutmentGeometry(), titaniumAbut), new THREE.Mesh(G.makeAbutmentHexStub(), titaniumAbut));
  abutment.userData = { homeY: 0, explodeY: 3.5 };

  const screw = new THREE.Group();
  const sg = G.makeScrewGeometry();
  screw.add(new THREE.Mesh(sg.shaft, titanium), new THREE.Mesh(sg.head, titanium));
  screw.userData = { homeX: 0, explodeX: -9, homeY: 4, explodeY: 8 };
  screw.position.set(0, 7, 0);
  screw.visible = false;

  // --- crown (real anatomy mesh)
  const crown = new THREE.Group();
  crown.userData = { homeY: 1.3, explodeY: 8.5 };
  try {
    const gltf = await loadGLB("assets/models/crown_molar.glb");
    const src = gltf.scene;
    const box = new THREE.Box3().setFromObject(src);
    const size = box.getSize(new THREE.Vector3());
    const s = 10.8 / Math.max(size.x, size.z); // ~10.8 mm wide molar crown
    const c = box.getCenter(new THREE.Vector3());
    src.traverse((o) => {
      if (!o.isMesh) return;
      const geo = o.geometry; if (!geo.attributes.normal) geo.computeVertexNormals();
      const p = geo.attributes.position; const col = new Float32Array(p.count * 3);
      let y0 = Infinity, y1 = -Infinity;
      for (let i = 0; i < p.count; i++) { y0 = Math.min(y0, p.getY(i)); y1 = Math.max(y1, p.getY(i)); }
      const top = new THREE.Color(0xfbf8f1), bot = new THREE.Color(0xe6d4b0), tmp = new THREE.Color();
      for (let i = 0; i < p.count; i++) {
        const t = THREE.MathUtils.smoothstep((p.getY(i) - y0) / (y1 - y0), 0.0, 0.8);
        tmp.copy(bot).lerp(top, t); col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
      }
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      o.material = ceramic;
    });
    src.position.set(-c.x, -box.min.y, -c.z);
    const holder = new THREE.Group(); holder.add(src); holder.scale.setScalar(s);
    crown.add(holder);
  } catch (e) { console.error("crown load failed", e); }

  model.add(fixture, abutment, screw, crown);
  model.position.y = 1.0 * 0; // centred by lookAt target

  const shadow = makeContactShadow({ size: 3.6, opacity: 0.3, y: -1.3 });
  scene.add(shadow); shadow.position.x = group.position.x;

  const target = new THREE.Vector3(group.position.x * 0.5, 0.05, 0);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.enablePan = false; controls.enableZoom = true;
  controls.minDistance = 3; controls.maxDistance = 9;
  controls.minPolarAngle = 0.35; controls.maxPolarAngle = Math.PI * 0.62;
  controls.target.copy(target);
  controls.enabled = false;
  controls.update();

  let explodeT = 0, targetExplode = 0, zoom = 1, targetZoom = 1;
  const labels = document.getElementById("part-labels");
  function setExplode(v) {
    targetExplode = Math.max(0, Math.min(1, v));
    if (labels) labels.classList.toggle("show", targetExplode > 0.35);
  }

  const chapters = ["home", "whole", "structure", "detail", "roles", "explore"];
  function updateFromScroll() {
    const mid = window.innerHeight * 0.45;
    let active = "home", best = Infinity;
    chapters.forEach((id) => {
      const el = document.getElementById(id); if (!el) return;
      const r = el.getBoundingClientRect(); const d = Math.abs(r.top + r.height * 0.3 - mid);
      if (d < best) { best = d; active = id; }
    });
    document.querySelectorAll(".chapter-nav a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + active));
    const idx = Math.max(0, chapters.indexOf(active));
    const bar = document.querySelector(".page-progress i");
    const count = document.getElementById("chapter-count");
    if (bar) bar.style.width = ((idx + 1) / chapters.length) * 100 + "%";
    if (count) count.textContent = String(idx + 1).padStart(2, "0") + " / 0" + chapters.length;
    if (free) return;
    if (active === "structure" || active === "roles") { setExplode(1); targetZoom = 1; }
    else if (active === "detail") { setExplode(0.35); targetZoom = 1.3; }
    else if (active === "explore") { setExplode(0.6); targetZoom = 1; }
    else { setExplode(active === "whole" ? 0.15 : 0); targetZoom = 1; }
  }
  let free = false;
  window.addEventListener("scroll", updateFromScroll, { passive: true });

  const observeBtns = document.querySelectorAll(".observe");
  const exitBtn = document.getElementById("exit-observe");
  const explodeRange = document.getElementById("explode-range");
  const interaction = document.getElementById("interaction");
  function setFree(on) {
    free = on;
    controls.enabled = on;
    document.body.classList.toggle("interacting", on);
    if (interaction) interaction.hidden = !on;
    const sceneEl = document.getElementById("scene");
    if (sceneEl) sceneEl.style.pointerEvents = on ? "auto" : "none";
    if (on) setExplode(explodeRange ? explodeRange.value / 100 : 0.8);
    else updateFromScroll();
  }
  observeBtns.forEach((b) => b.addEventListener("click", () => setFree(true)));
  if (exitBtn) exitBtn.addEventListener("click", () => setFree(false));
  if (explodeRange) explodeRange.addEventListener("input", () => { if (free) setExplode(explodeRange.value / 100); });
  const resetBtn = document.getElementById("reset-model");
  if (resetBtn) resetBtn.addEventListener("click", () => {
    group.rotation.set(0.12, -0.55, 0);
    camera.position.copy(CAM_HOME); controls.target.copy(target); controls.update();
    if (explodeRange) explodeRange.value = 0;
    setExplode(0); targetZoom = 1;
  });
  updateFromScroll();

  window.addEventListener("resize", () => fitRenderer(renderer, camera, canvas, window.innerHeight));
  fitRenderer(renderer, camera, canvas, window.innerHeight);

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  (function loop() {
    requestAnimationFrame(loop);
    explodeT += (targetExplode - explodeT) * 0.07;
    zoom += (targetZoom - zoom) * 0.08;
    const t = explodeT;
    for (const o of [crown, abutment, fixture]) o.position.y = lerp(o.userData.homeY, o.userData.explodeY, t);
    screw.position.x = lerp(screw.userData.homeX, screw.userData.explodeX, t);
    screw.position.y = lerp(screw.userData.homeY, screw.userData.explodeY, t);
    screw.visible = t > 0.15;
    // fixture/abutment pair stays visually centred as the stack opens
    model.position.y = lerp(0.1, -0.2, t);
    group.scale.setScalar(zoom);
    if (!free && !reduce) group.rotation.y += 0.0025;
    controls.update();
    renderer.render(scene, camera);
  })();
  canvas.dataset.ready = "1";
}
