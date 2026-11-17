/**
 * Shared tight-framing for topic viewers and still renders.
 * Frames the isolation / focus region, not the entire jaw.
 */
import { THREE } from "./stage.js";
import { visibleBox } from "./jaw-kit.js";

export function cameraDirForPreset(preset, model) {
  if (model && model.userData && model.userData.camDir) {
    return model.userData.camDir.clone().normalize();
  }
  const kind = (preset && preset.kind) || "";
  if (kind === "space") {
    const upper = preset && (preset.kindSpace === "nance");
    return upper ? new THREE.Vector3(0.12, -1.2, 0.55) : new THREE.Vector3(0.12, 1.2, 0.62);
  }
  if ((preset && preset.hawley) || (preset && preset.appliance) || kind === "expander") {
    return new THREE.Vector3(0.12, -1.2, 0.55);
  }
  if (kind === "denture" && preset && preset.complete !== false) {
    return new THREE.Vector3(0.42, 0.16, 1.1);
  }
  if (kind === "sinus" || kind === "gbr" || kind === "split" || kind === "softTissue" || kind === "guided") {
    return new THREE.Vector3(0.82, 0.3, 0.72);
  }
  if (kind === "implant" || kind === "implantRow" || kind === "boneQuality") {
    return new THREE.Vector3(0.82, 0.28, 0.72);
  }
  if (kind === "multi") return new THREE.Vector3(0.2, 0.85, 1.15);
  if (kind === "tooth") return new THREE.Vector3(0.9, 0.18, 0.68);
  if (kind === "bridge") return new THREE.Vector3(0.35, -0.2, 1.05);
  if (kind === "scan") return new THREE.Vector3(0.35, 0.55, 1.15);
  if (kind === "tad") return new THREE.Vector3(0.85, 0.25, 0.7);
  if (kind === "arch" && preset && preset.aligner) return new THREE.Vector3(0.22, 0.42, 1.18);
  if (kind === "arch" && preset && preset.brackets) return new THREE.Vector3(0.18, 0.22, 1.2);
  if (kind === "arch") return new THREE.Vector3(0.2, 0.35, 1.15);
  if (kind === "hygiene" || kind === "sealant" || kind === "ssc") return new THREE.Vector3(0.7, 0.85, 0.7);
  if (kind === "mouthguard") return new THREE.Vector3(0.2, 0.55, 1.15);
  if (kind === "impression") return new THREE.Vector3(0.35, 0.7, 1.05);
  return new THREE.Vector3(0.55, 0.42, 1.05);
}

export function isolationBox(model) {
  if (!model) return new THREE.Box3();
  model.updateWorldMatrix(true, true);
  const focus = model.userData && model.userData.focus;
  if (focus && !focus.isEmpty()) {
    const b = focus.clone();
    b.applyMatrix4(model.matrixWorld);
    return b;
  }
  return visibleBox(model);
}

export function centerModelOnFocus(model) {
  model.updateWorldMatrix(true, true);
  const box = isolationBox(model);
  const c = box.getCenter(new THREE.Vector3());
  model.position.sub(c);
  if (model.userData && model.userData.syncClip) model.userData.syncClip();
  model.updateWorldMatrix(true, true);
  return isolationBox(model);
}

export function frameIsolation(camera, controls, model, preset, { fill = 1.18 } = {}) {
  if (model.userData && model.userData.syncClip) model.userData.syncClip();
  model.updateWorldMatrix(true, true);
  const box = isolationBox(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const aspect = camera.aspect || 1;
  const fov = (camera.fov * Math.PI) / 180;
  const halfH = Math.max(size.y, 0.2) / 2;
  const halfW = Math.max(size.x, size.z, 0.2) / 2;
  const distH = halfH / Math.tan(fov / 2);
  const distW = halfW / (Math.tan(fov / 2) * aspect);
  const dist = Math.max(distH, distW) * fill;
  const dir = cameraDirForPreset(preset, model);
  camera.position.copy(center).add(dir.multiplyScalar(dist));
  camera.near = Math.max(dist / 50, 0.02);
  camera.far = Math.max(dist * 24, 40);
  camera.updateProjectionMatrix();
  if (controls) {
    controls.target.copy(center);
    controls.minDistance = dist * 0.4;
    controls.maxDistance = dist * 3.4;
    controls.update();
  } else {
    camera.lookAt(center);
  }
  return { center, dist, box };
}

export const GUIDE_STILL_PRESETS = {
  "guide-indications": {
    kind: "implant",
    explode: 0,
    caption: "种植体坐在牙槽骨里，上方再接基台和牙冠，看起来接近您自己的牙。",
  },
  "guide-timeline-exam": {
    kind: "scan",
    cbct: true,
    caption: "初诊时拍三维牙片，看清骨量和重要结构。",
  },
  "guide-timeline-place": {
    kind: "implant",
    explode: 0,
    healing: true,
    caption: "手术把种植体放入颌骨，愈合基台帮助塑形牙龈。",
  },
  "guide-timeline-heal": {
    kind: "gbr",
    caption: "等待骨结合的几个月里，骨头会慢慢包紧种植体。",
  },
  "guide-timeline-crown": {
    kind: "implant",
    explode: 0.15,
    caption: "确认稳定后戴上牙冠，就可以正常咀嚼。",
  },
  "guide-compare-implant": {
    kind: "implant",
    explode: 0,
    caption: "种植牙：不必磨损邻牙，咀嚼接近天然牙。",
  },
  "guide-compare-denture": {
    kind: "denture",
    complete: true,
    caption: "活动义齿：有基托，需要摘戴清洁。",
  },
  "guide-compare-bridge": {
    kind: "bridge",
    caption: "固定牙桥：要磨两侧邻牙来架桥。",
  },
  "guide-gbr": {
    kind: "gbr",
    caption: "引导骨再生：在骨头不够的地方填骨粉，再盖上屏障膜。",
  },
  "guide-sinus": {
    kind: "sinus",
    external: true,
    caption: "上颌窦提升：抬起窦底并植骨，增加后牙区骨高度。",
  },
  "guide-time": {
    kind: "gbr",
    caption: "如果需要植骨，通常会多等一段时间，等新骨长牢。",
  },
};

export const GROUP_STILL_TOPICS = {
  "implant|种植牙由哪几部分组成": "implant-crown",
  "implant|半口、全口缺牙怎么补": "implant-allon4",
  "implant|骨头不够时可能用到的术式": "implant-gbr",
  "implant|种植体系统怎么看": "implant-single",
  "implant|从检查到戴牙后的保养": "implant-delivery",
  "ortho|牙列与咬合": "ortho-crowding",
  "ortho|固定矫治": "ortho-metal-bracket",
  "ortho|托槽外观怎么选": "ortho-ceramic-bracket",
  "ortho|隐形矫治": "ortho-clear-aligner",
  "ortho|保持装置": "ortho-hawley",
  "ortho|矫治辅助装置": "ortho-tad",
  "ortho|功能矫治器": "ortho-twinblock",
  "ortho|正畸流程与维护": "ortho-metal-bracket",
  "prostho|牙冠": "prostho-metal-crown",
  "prostho|嵌体与高嵌体": "prostho-inlay",
  "prostho|贴面": "prostho-veneer-porcelain",
  "prostho|义齿与缺牙修复": "prostho-complete",
  "prostho|材料怎么选": "prostho-zirconia",
  "prostho|牙体缺损": "prostho-residual",
  "prostho|桩核与冠修复": "prostho-post-core",
  "prostho|修复流程与维护": "prostho-prep",
  "general|牙齿结构": "gen-crown-root",
  "general|牙体牙髓": "gen-caries-lesion",
  "general|牙周组织": "gen-gingiva",
  "general|口腔清洁": "gen-toothbrush",
  "general|补牙材料": "gen-composite",
  "general|牙位与牙列": "gen-primary-perm",
  "general|口腔检查与影像": "gen-cbct",
  "general|龋齿与牙体缺损": "gen-demineral",
  "general|根管治疗与牙髓保存": "gen-rct-anatomy",
  "general|牙周健康与治疗": "gen-perio",
  "general|拔牙与智齿": "gen-wisdom",
  "general|麻醉与就诊": "gen-local-anesthesia",
  "pedo|乳牙": "pedo-incisor",
  "pedo|替牙期": "pedo-root-resorb",
  "pedo|年轻恒牙": "pedo-young-perm",
  "pedo|儿童口腔护理": "pedo-sealant",
  "pedo|乳牙龋病与修复": "pedo-ssc",
  "pedo|儿童牙髓与年轻恒牙治疗": "pedo-pulp-therapy",
  "pedo|早期矫治与习惯管理": "pedo-anterior-crossbite",
  "pedo|间隙管理": "pedo-band-loop",
  "pedo|牙外伤与运动防护": "pedo-mouthguard",
};
