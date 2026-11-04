// Shared 3D stage helpers: renderer, studio lighting (CC0 HDRI via PMREM), loaders, contact shadow.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export { THREE, OrbitControls };

export function createRenderer(canvas, { alpha = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (alpha) renderer.setClearColor(0x000000, 0);
  return renderer;
}

// Poly Haven "Studio Small 08" (CC0, Sergej Majboroda); falls back to RoomEnvironment.
export function applyStudioEnvironment(renderer, scene, { intensity = 1 } = {}) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environment = room;
  scene.environmentIntensity = intensity;
  new RGBELoader().load(
    "assets/env/studio_small_08_1k.hdr",
    (tex) => {
      tex.mapping = THREE.EquirectangularReflectionMapping;
      const env = pmrem.fromEquirectangular(tex).texture;
      tex.dispose();
      scene.environment = env;
    },
    undefined,
    () => { /* keep RoomEnvironment */ }
  );
  return pmrem;
}

export function loadGLB(url) {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject));
}

export function makeContactShadow({ size = 6, opacity = 0.35, y = 0 } = {}) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, "rgba(20,40,40,1)");
  grd.addColorStop(0.45, "rgba(20,40,40,0.45)");
  grd.addColorStop(1, "rgba(20,40,40,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity, depthWrite: false, toneMapped: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  mesh.renderOrder = -1;
  return mesh;
}

export function fitRenderer(renderer, camera, canvas, fallbackH = 500) {
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || fallbackH;
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
