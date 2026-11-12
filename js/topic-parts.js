/**
 * Procedural dental parts for atlas topic viewers (mm-ish units, +Y up).
 * Reuses implant-geometry where possible; adds ortho/prostho/pedo/perio helpers.
 */
import * as THREE from "three";
import * as G from "./implant-geometry.js";

export const mats = {
  titanium() {
    return new THREE.MeshPhysicalMaterial({
      color: 0xcfd3d8, metalness: 1, roughness: 0.3, clearcoat: 0.15, clearcoatRoughness: 0.4, side: THREE.DoubleSide,
    });
  },
  titaniumLight() {
    return new THREE.MeshPhysicalMaterial({ color: 0xd9dce0, metalness: 1, roughness: 0.26, side: THREE.DoubleSide });
  },
  ceramic(color = 0xf7f0e4) {
    return new THREE.MeshPhysicalMaterial({
      color, roughness: 0.22, metalness: 0, clearcoat: 0.9, clearcoatRoughness: 0.1,
      sheen: 0.4, sheenColor: new THREE.Color(0xfff0d8), sheenRoughness: 0.5,
    });
  },
  temp() {
    return new THREE.MeshPhysicalMaterial({ color: 0xf0c989, roughness: 0.45, metalness: 0.05, clearcoat: 0.3 });
  },
  enamel(color = 0xf8f4ec) {
    return new THREE.MeshPhysicalMaterial({ color, roughness: 0.28, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.2 });
  },
  dentin() {
    return new THREE.MeshPhysicalMaterial({ color: 0xe8c99a, roughness: 0.55, metalness: 0 });
  },
  pulp() {
    return new THREE.MeshPhysicalMaterial({ color: 0xd46a7a, roughness: 0.55, metalness: 0 });
  },
  gingiva() {
    return new THREE.MeshPhysicalMaterial({ color: 0xe8a0a8, roughness: 0.55, metalness: 0, clearcoat: 0.2 });
  },
  bone() {
    return new THREE.MeshPhysicalMaterial({ color: 0xe8dcc8, roughness: 0.7, metalness: 0 });
  },
  membrane() {
    return new THREE.MeshPhysicalMaterial({
      color: 0xd8e8f0, roughness: 0.35, metalness: 0, transparent: true, opacity: 0.55, side: THREE.DoubleSide,
    });
  },
  graft() {
    return new THREE.MeshPhysicalMaterial({ color: 0xf2e6c8, roughness: 0.85, metalness: 0 });
  },
  aligner() {
    return new THREE.MeshPhysicalMaterial({
      color: 0xd8eef0, roughness: 0.12, metalness: 0, transparent: true, opacity: 0.35,
      transmission: 0.55, thickness: 0.4, side: THREE.DoubleSide, depthWrite: false,
    });
  },
  metal() {
    return new THREE.MeshStandardMaterial({ color: 0xb8bec6, metalness: 0.95, roughness: 0.28 });
  },
  ceramicBracket() {
    return new THREE.MeshPhysicalMaterial({ color: 0xf4f1ea, roughness: 0.35, metalness: 0.05, clearcoat: 0.4 });
  },
  acrylic() {
    return new THREE.MeshPhysicalMaterial({ color: 0xf0a0aa, roughness: 0.45, metalness: 0 });
  },
  gold() {
    return new THREE.MeshPhysicalMaterial({ color: 0xd4af37, metalness: 1, roughness: 0.25 });
  },
  amalgam() {
    return new THREE.MeshStandardMaterial({ color: 0x8a9098, metalness: 0.85, roughness: 0.4 });
  },
  resin() {
    return new THREE.MeshPhysicalMaterial({ color: 0xe8dcc0, roughness: 0.4, metalness: 0 });
  },
  zirconia() {
    return new THREE.MeshPhysicalMaterial({ color: 0xf5f2eb, roughness: 0.18, metalness: 0, clearcoat: 0.85 });
  },
  pfm() {
    return new THREE.MeshPhysicalMaterial({ color: 0xf0ebe0, roughness: 0.25, metalness: 0.15, clearcoat: 0.5 });
  },
};

/** Simple molar-ish crown (procedural fallback when GLB unavailable). */
export function makeProceduralCrown({ width = 10.5, height = 7.2, depth = 9.5 } = {}) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(width * 0.92, height * 0.72, depth * 0.88), mats.ceramic());
  body.position.y = height * 0.36;
  body.castShadow = true;
  g.add(body);
  // cusps
  const cusp = new THREE.SphereGeometry(width * 0.18, 16, 12);
  const positions = [
    [-width * 0.22, height * 0.78, -depth * 0.18],
    [width * 0.22, height * 0.78, -depth * 0.18],
    [-width * 0.18, height * 0.72, depth * 0.2],
    [width * 0.18, height * 0.72, depth * 0.2],
  ];
  for (const [x, y, z] of positions) {
    const m = new THREE.Mesh(cusp, mats.ceramic(0xfbf8f1));
    m.position.set(x, y, z);
    m.scale.set(1, 0.7, 1);
    g.add(m);
  }
  g.userData.homeY = 1.3;
  g.userData.explodeY = 17;
  return g;
}

export function makeFixturePart() {
  const fixture = new THREE.Group();
  const fx = G.makeFixtureGeometry();
  const ti = mats.titanium();
  fixture.add(new THREE.Mesh(fx.body, ti));
  fixture.add(new THREE.Mesh(fx.socket.top, ti), new THREE.Mesh(fx.socket.walls, ti), new THREE.Mesh(fx.socket.floor, ti));
  fixture.userData.homeY = 0;
  fixture.userData.explodeY = -4.5;
  fixture.userData.part = "fixture";
  fixture.name = "fixture";
  return fixture;
}

export function makeAbutmentPart({ custom = false } = {}) {
  const abutment = new THREE.Group();
  const m = mats.titaniumLight();
  abutment.add(new THREE.Mesh(G.makeAbutmentGeometry(), m), new THREE.Mesh(G.makeAbutmentHexStub(), m));
  if (custom) {
    // slightly flared emergence profile
    const flare = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.0, 1.2, 32, 1, true),
      new THREE.MeshPhysicalMaterial({ color: 0xe8ebe8, metalness: 0.2, roughness: 0.4, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    flare.position.y = 0.6;
    abutment.add(flare);
  }
  abutment.userData.homeY = 0;
  abutment.userData.explodeY = 3.5;
  abutment.userData.part = "abutment";
  abutment.name = "abutment";
  return abutment;
}

export function makeScrewPart() {
  const screw = new THREE.Group();
  const sg = G.makeScrewGeometry();
  const ti = mats.titanium();
  screw.add(new THREE.Mesh(sg.shaft, ti), new THREE.Mesh(sg.head, ti));
  screw.userData.homeX = 0;
  screw.userData.explodeX = 0;
  screw.userData.homeY = 2.2;
  screw.userData.explodeY = 15;
  screw.position.set(0, 2.2, 0);
  screw.userData.part = "screw";
  screw.name = "screw";
  return screw;
}

export function makeHealingCap() {
  const g = new THREE.Group();
  const m = mats.titaniumLight();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.1, 3.2, 32), m);
  body.position.y = 1.6;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2.35, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), m);
  dome.position.y = 3.2;
  const hex = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.8, 6), m);
  hex.position.y = -0.2;
  g.add(body, dome, hex);
  g.userData.homeY = 0;
  g.userData.explodeY = 4;
  g.userData.part = "healing";
  g.name = "healing";
  return g;
}

/** Full implant stack group in mm. Options control which parts exist. */
export function makeImplantStack(opts = {}) {
  const {
    crown = true,
    screw = true,
    abutment = true,
    fixture = true,
    healing = false,
    tempCrown = false,
    customAbutment = false,
    crownMesh = null, // optional prebuilt crown group
  } = opts;
  const root = new THREE.Group();
  root.name = "implantStack";
  const parts = {};

  if (fixture) {
    parts.fixture = makeFixturePart();
    root.add(parts.fixture);
  }
  if (healing) {
    parts.healing = makeHealingCap();
    root.add(parts.healing);
  } else {
    if (abutment) {
      parts.abutment = makeAbutmentPart({ custom: customAbutment });
      root.add(parts.abutment);
    }
    if (screw) {
      parts.screw = makeScrewPart();
      root.add(parts.screw);
    }
    if (crown) {
      parts.crown = crownMesh || makeProceduralCrown();
      if (tempCrown) {
        parts.crown.traverse((o) => {
          if (o.isMesh) o.material = mats.temp();
        });
      }
      parts.crown.userData.homeY = parts.crown.userData.homeY ?? 1.3;
      parts.crown.userData.explodeY = parts.crown.userData.explodeY ?? 17;
      parts.crown.userData.part = "crown";
      parts.crown.name = "crown";
      parts.crown.position.y = parts.crown.userData.homeY;
      root.add(parts.crown);
    }
  }
  root.userData.parts = parts;
  return root;
}

export function applyExplode(parts, t) {
  const ease = (u, a, b) => {
    const x = Math.max(0, Math.min(1, (u - a) / (b - a)));
    return x * x * (3 - 2 * x);
  };
  const lerp = (a, b, k) => a + (b - a) * k;
  const tc = ease(t, 0.4, 0.85);
  const ts = ease(t, 0.5, 0.92);
  const ta = ease(t, 0.6, 1.0);
  if (parts.crown) {
    parts.crown.position.y = lerp(parts.crown.userData.homeY, parts.crown.userData.explodeY, tc);
  }
  if (parts.screw) {
    parts.screw.position.y = lerp(parts.screw.userData.homeY, parts.screw.userData.explodeY, ts);
    parts.screw.visible = !parts.crown || tc > 0.12 || t < 0.05;
    if (t < 0.05) parts.screw.visible = false;
    if (t >= 0.05 && (!parts.crown || tc > 0.12)) parts.screw.visible = true;
  }
  if (parts.abutment) {
    parts.abutment.position.y = lerp(parts.abutment.userData.homeY, parts.abutment.userData.explodeY, ta);
  }
  if (parts.fixture) {
    parts.fixture.position.y = lerp(parts.fixture.userData.homeY, parts.fixture.userData.explodeY, ta);
  }
  if (parts.healing) {
    parts.healing.position.y = lerp(parts.healing.userData.homeY, parts.healing.userData.explodeY, ease(t, 0.35, 0.9));
  }
}

export function highlightPart(parts, name) {
  const all = Object.values(parts);
  for (const p of all) {
    p.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const m = o.material;
      if (!o.userData._baseOpacity) {
        o.userData._baseOpacity = m.opacity ?? 1;
        o.userData._baseTransparent = m.transparent ?? false;
      }
      const focus = !name || p.userData.part === name || p.name === name;
      if (focus) {
        m.transparent = o.userData._baseTransparent;
        m.opacity = o.userData._baseOpacity;
        m.emissive = m.emissive || new THREE.Color(0x000000);
        if ("emissive" in m) m.emissive.setHex(name ? 0x1a4038 : 0x000000);
        if ("emissiveIntensity" in m) m.emissiveIntensity = name ? 0.15 : 0;
      } else {
        m.transparent = true;
        m.opacity = 0.18;
        if ("emissive" in m) m.emissive.setHex(0x000000);
      }
    });
  }
}

/** Multi-implant bar (All-on-4 / All-on-6 / locator). */
export function makeMultiImplant({ count = 4, angled = true, bar = true, locators = false, bridge = true, zygoma = false } = {}) {
  const root = new THREE.Group();
  const span = 28;
  const xs = [];
  for (let i = 0; i < count; i++) xs.push(-span / 2 + (span / Math.max(1, count - 1)) * i);

  xs.forEach((x, i) => {
    const stack = makeImplantStack({
      crown: false,
      screw: false,
      abutment: !locators,
      healing: false,
      fixture: true,
    });
    stack.position.x = x;
    stack.scale.setScalar(0.85);
    if (angled && (i === 0 || i === count - 1)) {
      stack.rotation.z = i === 0 ? 0.45 : -0.45;
      stack.position.y = 1.2;
    }
    if (zygoma && (i === 0 || i === count - 1)) {
      // elongated fixture proxy
      const long = new THREE.Mesh(
        new THREE.CylinderGeometry(1.6, 1.2, 22, 24),
        mats.titanium()
      );
      long.position.set(x * 0.3, -8, 6);
      long.rotation.x = 0.85;
      root.add(long);
    }
    root.add(stack);
  });

  if (bar || locators) {
    const barMesh = new THREE.Mesh(
      new THREE.BoxGeometry(span + 6, 1.6, 2.2),
      mats.titaniumLight()
    );
    barMesh.position.y = 4.2;
    root.add(barMesh);
  }

  if (locators) {
    xs.forEach((x) => {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 2.2, 24), mats.titanium());
      cap.position.set(x, 3.2, 0);
      const nub = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 12), mats.titaniumLight());
      nub.position.set(x, 4.5, 0);
      root.add(cap, nub);
    });
    const denture = new THREE.Mesh(
      new THREE.BoxGeometry(span + 10, 4, 8),
      mats.acrylic()
    );
    denture.position.y = 7.5;
    root.add(denture);
    for (let i = 0; i < 8; i++) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 2.8), mats.ceramic());
      t.position.set(-14 + i * 4, 10.2, 0);
      root.add(t);
    }
  } else if (bridge) {
    const arch = new THREE.Mesh(
      new THREE.BoxGeometry(span + 8, 5.5, 7),
      mats.zirconia()
    );
    arch.position.y = 7.2;
    root.add(arch);
    // gum flange
    const gum = new THREE.Mesh(new THREE.BoxGeometry(span + 9, 2.2, 7.5), mats.gingiva());
    gum.position.y = 4.8;
    root.add(gum);
  }

  return root;
}

/** Simplified maxillary sinus + graft + implant. */
export function makeSinusScene({ external = true } = {}) {
  const root = new THREE.Group();
  const bone = new THREE.Mesh(new THREE.BoxGeometry(28, 14, 18), mats.bone());
  bone.position.set(0, -2, 0);
  root.add(bone);

  // sinus cavity (subtractive look via darker inner shell)
  const sinus = new THREE.Mesh(
    new THREE.SphereGeometry(7.5, 32, 24),
    new THREE.MeshPhysicalMaterial({ color: 0xc8d8e0, roughness: 0.4, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  );
  sinus.position.set(0, 6, 2);
  sinus.scale.set(1.4, 0.85, 1.1);
  root.add(sinus);

  const graft = new THREE.Mesh(
    new THREE.SphereGeometry(4.2, 20, 16),
    mats.graft()
  );
  graft.position.set(0, 1.5, 1);
  graft.scale.set(1.2, 0.7, 1);
  root.add(graft);

  if (external) {
    const window = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 6),
      new THREE.MeshBasicMaterial({ color: 0x2f7772, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
    );
    window.position.set(0, 2, 9.2);
    root.add(window);
    const membrane = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), mats.membrane());
    membrane.position.set(0, 2.2, 8.8);
    root.add(membrane);
  }

  const stack = makeImplantStack({ crown: true, screw: true, abutment: true });
  stack.position.set(0, 2, 0);
  stack.scale.setScalar(0.9);
  root.add(stack);
  return root;
}

/** GBR: defect + graft chips + membrane + implant. */
export function makeGbrScene({ block = false } = {}) {
  const root = new THREE.Group();
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(22, 10, 12), mats.bone());
  ridge.position.y = -3;
  root.add(ridge);

  // buccal defect notch
  const defect = new THREE.Mesh(
    new THREE.BoxGeometry(8, 7, 4),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  defect.position.set(0, 0, 5);
  // visual hole rim
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(3.2, 0.35, 8, 24),
    mats.bone()
  );
  rim.position.set(0, 0.5, 5.5);
  rim.rotation.x = Math.PI / 2;
  root.add(rim);

  if (block) {
    const blk = new THREE.Mesh(new THREE.BoxGeometry(7, 5, 3.5), mats.graft());
    blk.position.set(0, 0.5, 5);
    root.add(blk);
  } else {
    for (let i = 0; i < 18; i++) {
      const chip = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.55 + Math.random() * 0.35, 0),
        mats.graft()
      );
      chip.position.set((Math.random() - 0.5) * 6, Math.random() * 4 - 0.5, 4 + Math.random() * 2);
      root.add(chip);
    }
  }

  const membrane = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), mats.membrane());
  membrane.position.set(0, 1, 6.2);
  membrane.rotation.x = -0.25;
  root.add(membrane);

  const stack = makeImplantStack({ crown: false, screw: false, abutment: false, healing: true });
  stack.position.set(0, 2, 0);
  root.add(stack);
  return root;
}

export function makeSplitRidge() {
  const root = new THREE.Group();
  const left = new THREE.Mesh(new THREE.BoxGeometry(8, 12, 10), mats.bone());
  left.position.set(-5.2, -2, 0);
  const right = new THREE.Mesh(new THREE.BoxGeometry(8, 12, 10), mats.bone());
  right.position.set(5.2, -2, 0);
  root.add(left, right);
  const wedge = new THREE.Mesh(new THREE.BoxGeometry(2.5, 10, 8), mats.graft());
  wedge.position.set(0, -1, 0);
  root.add(wedge);
  const stack = makeImplantStack({ crown: false, healing: true, abutment: false, screw: false });
  stack.position.y = 2;
  root.add(stack);
  return root;
}

/** Procedural single tooth (crown + root), optional cutaway. */
export function makeTooth({
  cutaway = false,
  showPulp = false,
  caries = false,
  boneLoss = 0,
  primary = false,
  post = null, // 'fiber' | 'metal' | null
  crownRestore = null, // 'ceramic'|'pfm'|'metal'|'zirconia'|'temp'|null
  veneer = null, // 'porcelain'|'resin'|null
  inlay = false,
  filling = null, // 'resin'|'amalgam'|'gi'|null
} = {}) {
  const root = new THREE.Group();
  const scale = primary ? 0.75 : 1;

  const crownH = 8 * scale;
  const rootH = 12 * scale;
  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(5.2 * scale, 28, 20),
    mats.enamel()
  );
  crown.scale.set(1.05, 0.85, 0.95);
  crown.position.y = crownH * 0.35;
  root.add(crown);

  const rootMesh = new THREE.Mesh(
    new THREE.ConeGeometry(3.6 * scale, rootH, 20),
    mats.dentin()
  );
  rootMesh.position.y = -rootH * 0.35;
  rootMesh.rotation.x = Math.PI;
  root.add(rootMesh);

  // second root hint for molars
  const root2 = new THREE.Mesh(
    new THREE.ConeGeometry(2.8 * scale, rootH * 0.9, 16),
    mats.dentin()
  );
  root2.position.set(2.2 * scale, -rootH * 0.3, 0.5);
  root2.rotation.x = Math.PI;
  root.add(root2);

  if (showPulp || cutaway) {
    crown.material = mats.enamel();
    crown.material.transparent = true;
    crown.material.opacity = cutaway ? 0.35 : 1;
    const pulp = new THREE.Mesh(
      new THREE.SphereGeometry(1.6 * scale, 16, 12),
      mats.pulp()
    );
    pulp.position.y = 1.5 * scale;
    root.add(pulp);
    const canal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55 * scale, 0.35 * scale, rootH * 0.85, 12),
      mats.pulp()
    );
    canal.position.y = -rootH * 0.25;
    root.add(canal);
  }

  if (caries) {
    const lesion = new THREE.Mesh(
      new THREE.SphereGeometry(1.4 * scale, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.8 })
    );
    lesion.position.set(3.5 * scale, 2 * scale, 2 * scale);
    root.add(lesion);
  }

  if (filling) {
    const fillMat = filling === "amalgam" ? mats.amalgam() : filling === "gi" ? mats.resin() : mats.resin();
    if (filling === "gi") fillMat.color.setHex(0xc5e0d0);
    const fill = new THREE.Mesh(new THREE.SphereGeometry(1.5 * scale, 12, 10), fillMat);
    fill.position.set(2.8 * scale, 3 * scale, 2.2 * scale);
    root.add(fill);
  }

  if (inlay) {
    const inl = new THREE.Mesh(
      new THREE.BoxGeometry(4 * scale, 2.2 * scale, 4 * scale),
      mats.ceramic(0xf2ebe0)
    );
    inl.position.set(0, crownH * 0.55, 0);
    root.add(inl);
  }

  if (veneer) {
    const shell = new THREE.Mesh(
      new THREE.BoxGeometry(7 * scale, 8 * scale, 0.7 * scale),
      veneer === "resin" ? mats.resin() : mats.ceramic(0xfaf6f0)
    );
    shell.position.set(0, 2 * scale, 4.6 * scale);
    root.add(shell);
  }

  if (crownRestore) {
    let m;
    if (crownRestore === "metal") m = mats.metal();
    else if (crownRestore === "gold") m = mats.gold();
    else if (crownRestore === "pfm") m = mats.pfm();
    else if (crownRestore === "zirconia") m = mats.zirconia();
    else if (crownRestore === "temp") m = mats.temp();
    else m = mats.ceramic();
    const shell = new THREE.Mesh(new THREE.SphereGeometry(5.5 * scale, 28, 20), m);
    shell.scale.set(1.08, 0.88, 0.98);
    shell.position.y = crownH * 0.38;
    root.add(shell);
    crown.visible = false;
  }

  if (post) {
    const p = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9 * scale, 0.7 * scale, rootH * 0.7, 12),
      post === "metal" ? mats.metal() : mats.resin()
    );
    p.position.y = -rootH * 0.15;
    root.add(p);
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8 * scale, 2.4 * scale, 4 * scale, 16),
      mats.resin()
    );
    core.position.y = 2 * scale;
    root.add(core);
  }

  // bone / gingiva
  const bone = new THREE.Mesh(new THREE.BoxGeometry(16 * scale, 8 * scale, 12 * scale), mats.bone());
  bone.position.y = -6 * scale - boneLoss * 4;
  root.add(bone);
  const gum = new THREE.Mesh(
    new THREE.TorusGeometry(5.5 * scale, 1.1 * scale, 10, 24),
    mats.gingiva()
  );
  gum.rotation.x = Math.PI / 2;
  gum.position.y = 0.2 - boneLoss * 2;
  root.add(gum);

  return root;
}

/** Arc of simplified teeth with optional brackets / aligner / retainer. */
export function makeDentalArch({
  count = 7,
  brackets = null, // 'metal'|'ceramic'|'lingual'|null
  selfLigating = false,
  aligner = false,
  retainer = false,
  hawley = false,
  crowding = 0,
  spacing = 0,
  attachments = false,
} = {}) {
  const root = new THREE.Group();
  const radius = 16;
  const metal = mats.metal();
  const cer = mats.ceramicBracket();
  const wirePts = [];

  for (let i = 0; i < count; i++) {
    const t = (i / (count - 1)) * Math.PI - Math.PI / 2;
    const crowd = crowding ? (Math.sin(i * 1.7) * crowding) : 0;
    const gap = spacing ? spacing * (i - (count - 1) / 2) * 0.35 : 0;
    const x = Math.sin(t) * radius + gap;
    const z = -Math.cos(t) * radius * 0.55;
    const tooth = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 6.5, 3.0),
      mats.enamel()
    );
    tooth.position.set(x + crowd, 0, z);
    tooth.rotation.y = -t;
    root.add(tooth);

    if (brackets) {
      const lingual = brackets === "lingual";
      const mat = brackets === "ceramic" ? cer : metal;
      const br = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.0, 1.0), mat);
      const wingT = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.55, 1.1), mat);
      wingT.position.set(0, 0.7, 0.55);
      const wingB = wingT.clone();
      wingB.position.y = -0.7;
      br.add(base, wingT, wingB);
      if (selfLigating) {
        const door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 0.3), mat);
        door.position.set(0, 0, 1.0);
        br.add(door);
      } else {
        const lig = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.12, 6, 12), new THREE.MeshStandardMaterial({ color: 0x3a8f88 }));
        lig.position.z = 0.9;
        br.add(lig);
      }
      const side = lingual ? -1 : 1;
      br.position.set(x + crowd, 0.5, z + side * 1.9);
      br.rotation.y = -t;
      if (lingual) br.rotation.y += Math.PI;
      root.add(br);
      wirePts.push(new THREE.Vector3(x + crowd, 0.5, z + side * 2.4));
    }

    if (attachments) {
      const att = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 0.7), mats.resin());
      att.position.set(x + crowd, 0.2, z + 1.8);
      root.add(att);
    }
  }

  if (brackets && wirePts.length > 1) {
    const curve = new THREE.CatmullRomCurve3(wirePts);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 48, 0.12, 8, false),
      metal
    );
    root.add(tube);
  }

  if (aligner) {
    const shell = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.92, 4.2, 12, 48, Math.PI),
      mats.aligner()
    );
    shell.rotation.x = Math.PI / 2;
    shell.rotation.z = Math.PI;
    shell.position.set(0, 0.8, -2);
    root.add(shell);
  }

  if (retainer) {
    const wire = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.7, 0.15, 8, 48, Math.PI),
      metal
    );
    wire.rotation.x = Math.PI / 2;
    wire.position.set(0, -0.5, -1);
    root.add(wire);
  }

  if (hawley) {
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(22, 1.5, 14),
      mats.acrylic()
    );
    plate.position.set(0, -2.5, -2);
    root.add(plate);
    const labial = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.75, 0.18, 8, 40, Math.PI),
      metal
    );
    labial.rotation.x = Math.PI / 2;
    labial.position.set(0, 1.5, 2);
    root.add(labial);
  }

  return root;
}

export function makeSpaceMaintainer({ kind = "band-loop" } = {}) {
  const root = new THREE.Group();
  // two primary molars with gap
  const t1 = new THREE.Mesh(new THREE.BoxGeometry(4, 5.5, 4), mats.enamel());
  t1.position.set(-8, 0, 0);
  const t2 = t1.clone();
  t2.position.set(8, 0, 0);
  root.add(t1, t2);

  if (kind === "band-loop" || kind === "space") {
    const band = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.35, 8, 24), mats.metal());
    band.rotation.x = Math.PI / 2;
    band.position.set(8, 0, 0);
    root.add(band);
    const loop = new THREE.Mesh(
      new THREE.TorusGeometry(7, 0.22, 8, 32, Math.PI),
      mats.metal()
    );
    loop.rotation.y = Math.PI / 2;
    loop.position.set(0, 0.5, 0);
    root.add(loop);
  } else if (kind === "lingual-arch" || kind === "nance") {
    const wire = new THREE.Mesh(
      new THREE.TorusGeometry(10, 0.2, 8, 40, Math.PI),
      mats.metal()
    );
    wire.rotation.x = Math.PI / 2;
    wire.position.set(0, -1, -2);
    root.add(wire);
    if (kind === "nance") {
      const button = new THREE.Mesh(new THREE.BoxGeometry(6, 1.2, 5), mats.acrylic());
      button.position.set(0, -2.2, -4);
      root.add(button);
    }
  }
  return root;
}

export function makeDenture({ complete = true, flexible = false } = {}) {
  const root = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(complete ? 30 : 18, 3, 16),
    flexible ? new THREE.MeshPhysicalMaterial({ color: 0xe8b0b8, roughness: 0.4, transparent: true, opacity: 0.85 }) : mats.acrylic()
  );
  base.position.y = 0;
  root.add(base);
  const n = complete ? 10 : 5;
  for (let i = 0; i < n; i++) {
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.8, 2.8), mats.ceramic());
    tooth.position.set(-((n - 1) * 2.8) / 2 + i * 2.8, 3.2, 0);
    root.add(tooth);
  }
  if (!complete) {
    // clasp
    const clasp = new THREE.Mesh(
      new THREE.TorusGeometry(3, 0.2, 6, 20, Math.PI * 1.2),
      mats.metal()
    );
    clasp.position.set(10, 2, 2);
    root.add(clasp);
    const abutment = new THREE.Mesh(new THREE.BoxGeometry(3.2, 6, 3), mats.enamel());
    abutment.position.set(12, 1, 0);
    root.add(abutment);
  }
  return root;
}

export function makeBridge({ maryland = false } = {}) {
  const root = new THREE.Group();
  const left = makeTooth({ crownRestore: "ceramic" });
  left.position.x = -8;
  left.scale.setScalar(0.85);
  const right = makeTooth({ crownRestore: "ceramic" });
  right.position.x = 8;
  right.scale.setScalar(0.85);
  const pontic = new THREE.Mesh(new THREE.SphereGeometry(4.5, 24, 18), mats.ceramic());
  pontic.scale.set(1.05, 0.85, 0.95);
  pontic.position.y = 3;
  root.add(left, right, pontic);
  if (maryland) {
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(5, 4, 0.6), mats.metal());
    wingL.position.set(-5, 2.5, -3.5);
    const wingR = wingL.clone();
    wingR.position.x = 5;
    root.add(wingL, wingR);
  } else {
    const connL = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 2), mats.zirconia());
    connL.position.set(-4, 3, 0);
    const connR = connL.clone();
    connR.position.x = 4;
    root.add(connL, connR);
  }
  return root;
}

export function makeHygiene({ tool = "brush" } = {}) {
  const root = new THREE.Group();
  const tooth = makeTooth({});
  tooth.scale.setScalar(0.9);
  root.add(tooth);
  if (tool === "brush") {
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 14, 12), new THREE.MeshStandardMaterial({ color: 0x3a8f88 }));
    handle.position.set(8, 6, 4);
    handle.rotation.z = -0.8;
    const head = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.2, 1.5), new THREE.MeshStandardMaterial({ color: 0xe8f4f2 }));
    head.position.set(3.5, 10, 2);
    head.rotation.z = -0.8;
    root.add(handle, head);
  } else if (tool === "floss") {
    const floss = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 12, 6),
      new THREE.MeshBasicMaterial({ color: 0xf5f5f5 })
    );
    floss.position.set(0, 6, 5);
    floss.rotation.z = 0.3;
    root.add(floss);
  } else if (tool === "water") {
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.3, 8, 10), mats.metal());
    tip.position.set(6, 8, 3);
    tip.rotation.z = -0.6;
    root.add(tip);
  }
  return root;
}

export function makeScanWand() {
  const root = new THREE.Group();
  const arch = makeDentalArch({ count: 6 });
  root.add(arch);
  const wand = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, 10),
    new THREE.MeshStandardMaterial({ color: 0x4a5560, metalness: 0.4, roughness: 0.4 })
  );
  wand.position.set(4, 8, 6);
  wand.rotation.x = -0.5;
  const tip = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 1.5, 2),
    new THREE.MeshStandardMaterial({ color: 0x88ccee, emissive: 0x226688, emissiveIntensity: 0.4 })
  );
  tip.position.set(4, 6.5, 2);
  root.add(wand, tip);
  return root;
}

export function makeTad() {
  const root = new THREE.Group();
  const bone = new THREE.Mesh(new THREE.BoxGeometry(18, 8, 10), mats.bone());
  bone.position.y = -3;
  root.add(bone);
  const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.5, 8, 12), mats.titanium());
  screw.position.set(0, 2, 3);
  screw.rotation.x = -0.6;
  const head = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 10), mats.titaniumLight());
  head.position.set(0, 5.2, 5.2);
  root.add(screw, head);
  const tooth = new THREE.Mesh(new THREE.BoxGeometry(3.5, 7, 3.2), mats.enamel());
  tooth.position.set(5, 2, 0);
  root.add(tooth);
  return root;
}

export function makeExpander() {
  const root = new THREE.Group();
  const arch = makeDentalArch({ count: 6 });
  root.add(arch);
  const screw = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 4), mats.metal());
  screw.position.set(0, -2, -4);
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 10, 8), mats.metal());
  armL.rotation.z = Math.PI / 2;
  armL.position.set(-5, -1.5, -2);
  const armR = armL.clone();
  armR.position.x = 5;
  root.add(screw, armL, armR);
  return root;
}

export function makeMouthguard() {
  const root = new THREE.Group();
  const shell = new THREE.Mesh(
    new THREE.TorusGeometry(14, 3.5, 12, 40, Math.PI),
    new THREE.MeshPhysicalMaterial({ color: 0x4ecdc4, roughness: 0.3, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
  );
  shell.rotation.x = Math.PI / 2;
  shell.position.y = 1;
  root.add(shell);
  return root;
}

export function makeSealantTooth() {
  const root = makeTooth({});
  const seal = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.6, 4),
    new THREE.MeshPhysicalMaterial({ color: 0xd8f0e8, transparent: true, opacity: 0.7 })
  );
  seal.position.y = 5.5;
  root.add(seal);
  return root;
}

export function makeSsc() {
  return makeTooth({ crownRestore: "metal", primary: true });
}

/** Soft-tissue augmentation blob on ridge. */
export function makeSoftTissue() {
  const root = new THREE.Group();
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(18, 8, 10), mats.bone());
  ridge.position.y = -3;
  root.add(ridge);
  const graft = new THREE.Mesh(new THREE.SphereGeometry(4, 20, 16), mats.gingiva());
  graft.scale.set(1.4, 0.7, 1);
  graft.position.set(0, 2, 4);
  root.add(graft);
  const stack = makeImplantStack({ healing: true, crown: false, abutment: false, screw: false });
  stack.position.y = 1.5;
  root.add(stack);
  return root;
}

export function makeGuidedSurgery() {
  const root = new THREE.Group();
  const guide = new THREE.Mesh(
    new THREE.BoxGeometry(22, 3, 12),
    new THREE.MeshPhysicalMaterial({ color: 0x88b0c8, transparent: true, opacity: 0.55, roughness: 0.3 })
  );
  guide.position.y = 5;
  root.add(guide);
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 4, 20, 1, true), mats.titanium());
  sleeve.position.y = 4;
  root.add(sleeve);
  const stack = makeImplantStack({ crown: false, healing: false, abutment: false, screw: false });
  stack.position.y = 0;
  root.add(stack);
  return root;
}

export function makeImpression() {
  const root = new THREE.Group();
  const tray = new THREE.Mesh(
    new THREE.BoxGeometry(24, 4, 14),
    new THREE.MeshStandardMaterial({ color: 0xb0b8c0, metalness: 0.3, roughness: 0.4 })
  );
  tray.position.y = 2;
  const putty = new THREE.Mesh(
    new THREE.BoxGeometry(20, 2.5, 11),
    new THREE.MeshPhysicalMaterial({ color: 0xc4a060, roughness: 0.6 })
  );
  putty.position.y = 3.5;
  root.add(tray, putty);
  const stack = makeImplantStack({ healing: false, crown: false });
  stack.position.y = -1;
  stack.scale.setScalar(0.8);
  root.add(stack);
  return root;
}

export function makeComparePair() {
  const root = new THREE.Group();
  const a = makeImplantStack({});
  a.position.x = -8;
  const b = makeImplantStack({});
  b.position.x = 8;
  // tint B slightly different
  b.traverse((o) => {
    if (o.isMesh && o.material && o.material.metalness > 0.5) {
      o.material = o.material.clone();
      o.material.color.setHex(0xb8c4cc);
    }
  });
  root.add(a, b);
  return root;
}

export function makeBoneQuality() {
  const root = new THREE.Group();
  const dens = [
    { x: -10, color: 0xd8d0c0, label: "D1" },
    { x: -3.5, color: 0xe0d8c8, label: "D2" },
    { x: 3.5, color: 0xe8e0d0, label: "D3" },
    { x: 10, color: 0xf0eae0, label: "D4" },
  ];
  dens.forEach((d, i) => {
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 10 + i, 8),
      new THREE.MeshPhysicalMaterial({ color: d.color, roughness: 0.6 + i * 0.08, transparent: true, opacity: 0.85 - i * 0.1 })
    );
    b.position.set(d.x, -2, 0);
    root.add(b);
    const stack = makeImplantStack({ crown: false, healing: true, abutment: false, screw: false });
    stack.position.set(d.x, 2, 0);
    stack.scale.setScalar(0.55);
    root.add(stack);
  });
  return root;
}
