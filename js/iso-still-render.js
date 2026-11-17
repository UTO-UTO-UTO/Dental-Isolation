/**
 * Offscreen still renderer used by scripts/iso-still-page.html.
 * Reuses the same jaw scenes as the live topic viewer. Local assets only.
 */
import { THREE, loadGLB, makeContactShadow } from "./stage.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { getTopicScene } from "./topic-scenes.js";
import * as P from "./topic-parts.js";
import { composeTopicModel } from "./topic-real-scenes.js";
import { makeJawMolarCrown } from "./jaw-kit.js";
import { centerModelOnFocus, frameIsolation, GUIDE_STILL_PRESETS, GROUP_STILL_TOPICS } from "./iso-frame.js";
import { TOPIC_SCENES } from "./topic-scenes.js";

const ROOT = "../";
const WIDTH = 960;
const HEIGHT = 640;

const canvas = document.getElementById("iso-canvas");
let renderer, scene, camera, world, current, crownMesh, envReady;

function applyEnv(renderer, scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environment = room;
  scene.environmentIntensity = 1.0;
  return new Promise((resolve) => {
    new RGBELoader().load(
      `${ROOT}assets/env/studio_small_08_1k.hdr`,
      (tex) => {
        tex.mapping = THREE.EquirectangularReflectionMapping;
        const env = pmrem.fromEquirectangular(tex).texture;
        tex.dispose();
        scene.environment = env;
        resolve();
      },
      undefined,
      () => resolve()
    );
  });
}

async function init() {
  if (renderer) return;
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(2);
  renderer.setSize(WIDTH, HEIGHT, false);
  renderer.setClearColor(0xeef2f0, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = true;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeef2f0);
  camera = new THREE.PerspectiveCamera(32, WIDTH / HEIGHT, 0.1, 200);
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(4, 7, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfe3dc, 0.6);
  rim.position.set(-5, 3, -4);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.28));
  world = new THREE.Group();
  scene.add(world);
  envReady = applyEnv(renderer, scene);
  try {
    crownMesh = await makeJawMolarCrown(ROOT);
  } catch (e) {
    console.warn("crown glb missing", e);
    crownMesh = null;
  }
  await envReady;
}

function clearCurrent() {
  if (!current) return;
  world.remove(current);
  const shadow = world.getObjectByName("still-shadow");
  if (shadow) world.remove(shadow);
  current = null;
}

async function buildModel(preset) {
  const realistic = await composeTopicModel(preset, { base: ROOT, crownMesh });
  if (realistic) return realistic;
  return P.makeTooth({});
}

async function renderSpec(preset) {
  await init();
  clearCurrent();
  const model = await buildModel(preset);
  world.add(model);
  if (model.userData && model.userData.syncClip) model.userData.syncClip();
  const focused = centerModelOnFocus(model);
  const shadow = makeContactShadow({ size: 3.2, opacity: 0.22, y: focused.min.y - 0.05 });
  shadow.name = "still-shadow";
  world.add(shadow);
  current = model;
  if (preset.explode) {
    const stacks = [];
    if (model.userData && model.userData.parts) stacks.push(model.userData.parts);
    model.traverse((o) => {
      if (o.userData && o.userData.parts) stacks.push(o.userData.parts);
    });
    for (const parts of stacks) P.applyExplode(parts, preset.explode);
    if (preset.highlight) {
      for (const parts of stacks) P.highlightPart(parts, preset.highlight);
    }
  }
  if (model.userData && model.userData.syncClip) model.userData.syncClip();
  const framed = frameIsolation(camera, null, model, preset, { fill: 1.16 });
  renderer.render(scene, camera);
  renderer.render(scene, camera);
  const suffix = (model.userData && model.userData.captionSuffix) || "";
  const f = model.userData && model.userData.focus;
  window.IsoStill.lastDebug = {
    hasFocus: !!(f && !f.isEmpty()),
    focus: f ? { min: f.min.toArray(), max: f.max.toArray() } : null,
    framed: framed ? { dist: framed.dist, center: framed.center.toArray(), boxMin: framed.box.min.toArray(), boxMax: framed.box.max.toArray() } : null,
    cam: camera.position.toArray(),
    overlayChildren: (function(){ let n=0; model.traverse(o=>{ if (o.name==="topicOverlay") n=o.children.length; }); return n; })(),
  };
  return { caption: (preset.caption || "三维结构示意") + suffix };
}

window.IsoStill = {
  width: WIDTH,
  height: HEIGHT,
  topicIds: Object.keys(TOPIC_SCENES),
  guideIds: Object.keys(GUIDE_STILL_PRESETS),
  groupTopics: GROUP_STILL_TOPICS,
  async renderTopic(topicId) {
    const preset = getTopicScene(topicId);
    preset.id = topicId;
    return renderSpec(preset);
  },
  async renderGuide(guideId) {
    const preset = { ...(GUIDE_STILL_PRESETS[guideId] || { kind: "implant", explode: 0 }) };
    preset.id = guideId;
    return renderSpec(preset);
  },
  toDataURL(type = "image/png", quality = 0.92) {
    return canvas.toDataURL(type, quality);
  },
  ready: init,
};

init().then(() => {
  window.IsoStill.booted = true;
  document.documentElement.dataset.isoReady = "1";
});
