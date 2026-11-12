/**
 * Interactive Three.js viewer for atlas detail pages.
 * Reads ?topic=, builds a scene from topic-scenes.js; OrbitControls rotate/zoom.
 * Does NOT alter homepage implant-viewer.js behavior.
 */
import { THREE, OrbitControls, createRenderer, applyStudioEnvironment, loadGLB, makeContactShadow, fitRenderer } from "./stage.js";
import { getTopicScene } from "./topic-scenes.js";
import * as P from "./topic-parts.js";
import { visibleBox } from "./jaw-kit.js";
import { composeTopicModel } from "./topic-real-scenes.js";

const ROOT = "../";

const canvas = document.getElementById("topic-canvas");
if (canvas) {
  const topicId = new URLSearchParams(location.search).get("topic") || "";
  init(topicId).catch((e) => {
    console.error(e);
    const cap = document.getElementById("topic-viewer-caption");
    if (cap) cap.textContent = "三维示意暂时无法加载，请稍后重试。";
  });
}

async function init(topicId) {
  const preset = getTopicScene(topicId);
  const renderer = createRenderer(canvas, { alpha: true });
  renderer.localClippingEnabled = true;
  const scene = new THREE.Scene();
  applyStudioEnvironment(renderer, scene, { intensity: 0.95, base: ROOT });

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 200);
  camera.position.set(0.8, 0.55, 2.6);

  const key = new THREE.DirectionalLight(0xffffff, 1.05);
  key.position.set(4, 7, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfe3dc, 0.55);
  rim.position.set(-5, 3, -4);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  const world = new THREE.Group();
  scene.add(world);

  const model = await buildModel(preset);
  if (model.userData && model.userData.syncClip) model.userData.syncClip();
  const box = visibleBox(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const holder = new THREE.Group();
  model.position.sub(center);
  holder.add(model);
  holder.scale.setScalar(1.35 / maxDim);
  world.add(holder);

  scene.add(makeContactShadow({ size: 2.4, opacity: 0.28, y: -0.75 }));

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 1.4;
  controls.maxDistance = 5.5;
  controls.minPolarAngle = 0.25;
  controls.maxPolarAngle = Math.PI * 0.7;
  controls.target.set(0, 0.05, 0);
  controls.update();

  const labelsEl = document.getElementById("topic-part-labels");
  const labelTexts = preset.labels || [];
  if (labelsEl) {
    labelsEl.innerHTML = "";
    labelTexts.forEach((text, i) => {
      const span = document.createElement("span");
      span.className = "topic-lbl";
      span.textContent = text;
      span.style.setProperty("--i", String(i));
      labelsEl.appendChild(span);
    });
    labelsEl.hidden = labelTexts.length === 0;
    // Show whenever this topic has part names — not only when exploded
    labelsEl.classList.toggle("show", labelTexts.length > 0);
  }

  const caption = document.getElementById("topic-viewer-caption");
  if (caption) {
    const suffix = (model.userData && model.userData.captionSuffix) || "";
    caption.textContent = (preset.caption || "三维科普示意") + suffix + " · 可拖动旋转、滚轮缩放";
  }

  const explodeWrap = document.getElementById("topic-explode-wrap");
  const explodeRange = document.getElementById("topic-explode-range");
  const canExplode = preset.kind === "implant";
  let explodeT = preset.explode || 0;
  let targetExplode = explodeT;
  if (explodeWrap) explodeWrap.hidden = !canExplode;
  if (explodeRange && canExplode) {
    explodeRange.value = String(Math.round(targetExplode * 100));
    explodeRange.addEventListener("input", () => {
      targetExplode = (+explodeRange.value) / 100;
      /* labels stay visible when defined */
    });
  }

  const stacks = [];
  if (model.userData && model.userData.parts) stacks.push(model.userData.parts);
  model.traverse((o) => {
    if (o.userData && o.userData.parts) stacks.push(o.userData.parts);
  });

  function tickExplode() {
    for (const parts of stacks) {
      P.applyExplode(parts, explodeT);
      if (preset.highlight) P.highlightPart(parts, preset.highlight);
    }
  }
  tickExplode();

  const resetBtn = document.getElementById("topic-reset-view");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      camera.position.set(0.8, 0.55, 2.6);
      controls.target.set(0, 0.05, 0);
      controls.update();
      targetExplode = preset.explode || 0;
      explodeT = targetExplode;
      if (explodeRange) explodeRange.value = String(Math.round(targetExplode * 100));
      tickExplode();
    });
  }

  function onResize() {
    const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 0;
    if (w < 8) return; // layout not ready — avoid locking WebGL to 0 width
    fitRenderer(renderer, camera, canvas, 420);
  }
  window.addEventListener("resize", onResize);
  const ro = new ResizeObserver(() => onResize());
  const host = document.getElementById("detail-viewer") || canvas.parentElement;
  if (host) ro.observe(host);
  requestAnimationFrame(() => { onResize(); requestAnimationFrame(onResize); });
  setTimeout(onResize, 100);
  setTimeout(onResize, 400);

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let running = true;
  let autoSpin = true;
  let lastInteract = 0;
  const onInteract = () => {
    autoSpin = false;
    lastInteract = performance.now();
  };
  canvas.addEventListener("pointerdown", onInteract);
  canvas.addEventListener("wheel", onInteract, { passive: true });

  (function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    explodeT += (targetExplode - explodeT) * 0.1;
    if (Math.abs(targetExplode - explodeT) < 0.002) explodeT = targetExplode;
    tickExplode();
    if (performance.now() - lastInteract > 2800) autoSpin = true;
    if (autoSpin && !reduce) world.rotation.y += 0.003;
    if (model.userData && model.userData.syncClip) model.userData.syncClip();
    controls.update();
    renderer.render(scene, camera);
  })();

  window.__topicViewer = {
    dispose() {
      running = false;
      controls.dispose();
      renderer.dispose();
      window.removeEventListener("resize", onResize);
      try { ro.disconnect(); } catch (_) {}
    },
    preset,
    setExplode(v) {
      targetExplode = v;
      explodeT = v;
    },
  };
  canvas.dataset.ready = "1";
}

async function buildModel(preset) {
  let crownMesh = null;
  try {
    crownMesh = await loadCrownGlb();
  } catch (_) { /* procedural crown fallback */ }

  try {
    const realistic = await composeTopicModel(preset, { base: ROOT, crownMesh });
    if (realistic) return realistic;
  } catch (err) {
    console.warn("realistic topic scene failed, using procedural fallback", err);
  }

  const kind = preset.kind || "tooth";
  switch (kind) {
    case "implant": {
      const stack = P.makeImplantStack({
        crown: !preset.healing,
        screw: !preset.healing,
        abutment: !preset.healing,
        healing: !!preset.healing,
        tempCrown: !!preset.tempCrown,
        customAbutment: !!preset.customAbutment,
        crownMesh,
      });
      if (preset.explode) P.applyExplode(stack.userData.parts, preset.explode);
      if (preset.highlight) P.highlightPart(stack.userData.parts, preset.highlight);
      return stack;
    }
    case "multi":
      return P.makeMultiImplant({
        count: preset.count || 4,
        angled: preset.angled !== false,
        bar: !!preset.bar,
        locators: !!preset.locators,
        bridge: preset.bridge !== false && !preset.locators,
        zygoma: !!preset.zygoma,
      });
    case "implantRow": {
      const root = new THREE.Group();
      const n = preset.count || 2;
      for (let i = 0; i < n; i++) {
        const stack = P.makeImplantStack({});
        stack.position.x = (i - (n - 1) / 2) * 14;
        root.add(stack);
      }
      if (preset.bridge) {
        const bridge = new THREE.Mesh(
          new THREE.BoxGeometry(n * 14 + 4, 6, 8),
          P.mats.zirconia()
        );
        bridge.position.y = 8;
        root.add(bridge);
      }
      return root;
    }
    case "sinus":
      return P.makeSinusScene({ external: !!preset.external });
    case "gbr":
      return P.makeGbrScene({ block: !!preset.block });
    case "split":
      return P.makeSplitRidge();
    case "softTissue":
      return P.makeSoftTissue();
    case "guided":
      return P.makeGuidedSurgery();
    case "impression":
      return P.makeImpression();
    case "compare":
      return P.makeComparePair();
    case "boneQuality":
      return P.makeBoneQuality();
    case "tooth":
      return P.makeTooth({
        cutaway: !!preset.cutaway,
        showPulp: !!preset.showPulp,
        caries: !!preset.caries,
        boneLoss: preset.boneLoss || 0,
        primary: !!preset.primary,
        post: preset.post || null,
        crownRestore: preset.crownRestore || null,
        veneer: preset.veneer || null,
        inlay: !!preset.inlay,
        filling: preset.filling || null,
      });
    case "arch":
      return P.makeDentalArch({
        brackets: preset.brackets || null,
        selfLigating: !!preset.selfLigating,
        aligner: !!preset.aligner,
        retainer: !!preset.retainer,
        hawley: !!preset.hawley,
        crowding: preset.crowding || 0,
        spacing: preset.spacing || 0,
        attachments: !!preset.attachments,
      });
    case "space":
      return P.makeSpaceMaintainer({ kind: preset.kindSpace || "band-loop" });
    case "denture":
      return P.makeDenture({ complete: preset.complete !== false, flexible: !!preset.flexible });
    case "bridge":
      return P.makeBridge({ maryland: !!preset.maryland });
    case "hygiene":
      return P.makeHygiene({ tool: preset.tool || "brush" });
    case "scan":
      return P.makeScanWand();
    case "tad":
      return P.makeTad();
    case "expander":
      return P.makeExpander();
    case "mouthguard":
      return P.makeMouthguard();
    case "sealant":
      return P.makeSealantTooth();
    case "ssc":
      return P.makeSsc();
    default:
      return P.makeTooth({});
  }
}

async function loadCrownGlb() {
  const gltf = await loadGLB(ROOT + "assets/models/crown_molar.glb");
  const src = gltf.scene;
  const box = new THREE.Box3().setFromObject(src);
  const size = box.getSize(new THREE.Vector3());
  const scale = 10.8 / Math.max(size.x, size.z);
  const c = box.getCenter(new THREE.Vector3());
  const ceramic = P.mats.ceramic();
  ceramic.vertexColors = true;
  src.traverse((o) => {
    if (!o.isMesh) return;
    const geo = o.geometry;
    if (!geo.attributes.normal) geo.computeVertexNormals();
    const p = geo.attributes.position;
    const col = new Float32Array(p.count * 3);
    let y0 = Infinity;
    let y1 = -Infinity;
    for (let i = 0; i < p.count; i++) {
      y0 = Math.min(y0, p.getY(i));
      y1 = Math.max(y1, p.getY(i));
    }
    const top = new THREE.Color(0xfbf8f1);
    const bot = new THREE.Color(0xe6d4b0);
    const tmp = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const t = THREE.MathUtils.smoothstep((p.getY(i) - y0) / (y1 - y0 || 1), 0, 0.8);
      tmp.copy(bot).lerp(top, t);
      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    o.material = ceramic;
  });
  src.position.set(-c.x, -box.min.y, -c.z);
  const holder = new THREE.Group();
  holder.add(src);
  holder.scale.setScalar(scale);
  const crown = new THREE.Group();
  crown.add(holder);
  crown.userData.homeY = 1.3;
  crown.userData.explodeY = 17;
  return crown;
}
