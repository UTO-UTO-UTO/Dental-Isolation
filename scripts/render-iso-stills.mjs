import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { spawnSync } from "child_process";

const ROOT = "/workspace/kouqiang-tujian";
const BASE = process.env.ISO_BASE || "http://127.0.0.1:8876";
const OUT = path.join(ROOT, "assets/iso-stills");
const TOPIC_DIR = path.join(OUT, "topics");
const GUIDE_DIR = path.join(OUT, "guide");

fs.mkdirSync(TOPIC_DIR, { recursive: true });
fs.mkdirSync(GUIDE_DIR, { recursive: true });

function decodeDataUrl(dataUrl) {
  const m = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
  if (!m) throw new Error("bad data url");
  return Buffer.from(m[1], "base64");
}

function writeWebp(buf, dest, quality = 80) {
  const tmp = dest + ".in.png";
  fs.writeFileSync(tmp, buf);
  const py = (
    "from PIL import Image\n" +
    "im = Image.open(" + JSON.stringify(tmp) + ").convert('RGB')\n" +
    "im.save(" + JSON.stringify(dest) + ", format='WEBP', quality=" + String(quality) + ", method=6)"
  );
  const r = spawnSync("python3", ["-c", py], { encoding: "utf8" });
  try { fs.unlinkSync(tmp); } catch (_) {}
  if (r.status !== 0) {
    throw new Error("webp convert failed: " + (r.stderr || r.stdout));
  }
}

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl"],
});

const page = await browser.newPage({ viewport: { width: 980, height: 700 } });
page.on("pageerror", (err) => console.error("PAGEERROR", err.message));
page.on("console", (msg) => {
  if (msg.type() === "error") console.error("CONSOLE", msg.text());
});

await page.goto(`${BASE}/scripts/iso-still-page.html`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForFunction(() => window.IsoStill && window.IsoStill.booted, { timeout: 60000 });

const meta = await page.evaluate(() => ({
  topics: window.IsoStill.topicIds,
  guides: window.IsoStill.guideIds,
  groups: window.IsoStill.groupTopics,
}));

console.log("topics", meta.topics.length, "guides", meta.guides.length, "groups", Object.keys(meta.groups).length);

const prevManifest = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.join(OUT, "manifest.json"), "utf8"));
  } catch (_) {
    return { topics: {}, guides: {}, groups: {} };
  }
})();
const only = (process.env.ISO_ONLY || "").split(",").map((s) => s.trim()).filter(Boolean);
const onlySet = only.length ? new Set(only) : null;

const manifest = { topics: {}, groups: {}, guides: {}, generatedAt: new Date().toISOString(), errors: [] };

function reusedCaption(kind, id) {
  const bag = kind === "guide" ? prevManifest.guides : prevManifest.topics;
  return (bag && bag[id] && bag[id].caption) || "";
}

async function renderOne(kind, id, dest) {
  const result = await page.evaluate(async ({ kind, id }) => {
    try {
      const info = kind === "guide"
        ? await window.IsoStill.renderGuide(id)
        : await window.IsoStill.renderTopic(id);
      return { ok: true, caption: info.caption || "" };
    } catch (e) {
      return { ok: false, error: String(e && e.stack || e) };
    }
  }, { kind, id });
  if (!result.ok) return result;
  const tmp = dest + ".shot.png";
  await page.locator("#iso-canvas").screenshot({ path: tmp, type: "png" });
  const buf = fs.readFileSync(tmp);
  writeWebp(buf, dest, 80);
  try { fs.unlinkSync(tmp); } catch (_) {}
  return result;
}

let done = 0;
for (const id of meta.topics) {
  const t0 = Date.now();
  const dest = path.join(TOPIC_DIR, `${id}.webp`);
  if (onlySet && !onlySet.has(id)) {
    if (fs.existsSync(dest)) {
      const size = fs.statSync(dest).size;
      manifest.topics[id] = { file: `topics/${id}.webp`, caption: reusedCaption("topic", id), bytes: size, reused: true };
      done++;
      continue;
    }
  }
  if (fs.existsSync(dest) && process.env.ISO_FORCE !== "1" && !(onlySet && onlySet.has(id))) {
    const size = fs.statSync(dest).size;
    manifest.topics[id] = { file: `topics/${id}.webp`, caption: reusedCaption("topic", id), bytes: size, reused: true };
    done++;
    continue;
  }
  const result = await renderOne("topic", id, dest);
  done++;
  if (!result.ok) {
    console.error("FAIL topic", id, result.error);
    manifest.errors.push({ id, error: result.error });
    continue;
  }
  const size = fs.statSync(dest).size;
  manifest.topics[id] = { file: `topics/${id}.webp`, caption: result.caption, bytes: size };
  if (done % 10 === 0 || done === meta.topics.length) {
    console.log(`topics ${done}/${meta.topics.length} last=${id} ${size}B ${Date.now() - t0}ms`);
  }
}

for (const id of meta.guides) {
  const dest = path.join(GUIDE_DIR, `${id}.webp`);
  if (onlySet && !onlySet.has(id)) {
    if (fs.existsSync(dest)) {
      manifest.guides[id] = { file: `guide/${id}.webp`, caption: reusedCaption("guide", id), bytes: fs.statSync(dest).size, reused: true };
      continue;
    }
  }
  if (fs.existsSync(dest) && process.env.ISO_FORCE !== "1" && !(onlySet && onlySet.has(id))) {
    manifest.guides[id] = { file: `guide/${id}.webp`, caption: reusedCaption("guide", id), bytes: fs.statSync(dest).size, reused: true };
    continue;
  }
  const result = await renderOne("guide", id, dest);
  if (!result.ok) {
    console.error("FAIL guide", id, result.error);
    manifest.errors.push({ id, error: result.error });
    continue;
  }
  manifest.guides[id] = { file: `guide/${id}.webp`, caption: result.caption, bytes: fs.statSync(dest).size };
  console.log("guide", id, manifest.guides[id].bytes);
}

for (const [key, topicId] of Object.entries(meta.groups)) {
  const src = manifest.topics[topicId];
  if (!src) {
    manifest.errors.push({ id: key, error: "missing topic still " + topicId });
    continue;
  }
  manifest.groups[key] = { file: src.file, caption: src.caption, topic: topicId };
}

// Compose grouped guide entries for the page mounter
manifest.guides["guide-timeline"] = {
  caption: "从检查到戴牙，大致分这几步。具体节奏请以医生安排为准。",
  files: [
    manifest.guides["guide-timeline-exam"],
    manifest.guides["guide-timeline-place"],
    manifest.guides["guide-timeline-heal"],
    manifest.guides["guide-timeline-crown"],
  ].filter(Boolean),
};
manifest.guides["guide-compare"] = {
  caption: "种植牙、活动义齿和固定牙桥各有特点，没有绝对的「最好」。",
  files: [
    manifest.guides["guide-compare-implant"],
    manifest.guides["guide-compare-denture"],
    manifest.guides["guide-compare-bridge"],
  ].filter(Boolean),
};

const js = "window.IsoStillsManifest = " + JSON.stringify(manifest, null, 2) + ";\n";
fs.writeFileSync(path.join(ROOT, "js/iso-stills-manifest.js"), js);
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));

const totalBytes = Object.values(manifest.topics).reduce((s, x) => s + (x.bytes || 0), 0)
  + Object.values(manifest.guides).filter((x) => x.bytes).reduce((s, x) => s + x.bytes, 0);
console.log("done errors=", manifest.errors.length, "topic stills=", Object.keys(manifest.topics).length, "bytes=", totalBytes);
await browser.close();
if (manifest.errors.length) process.exitCode = 2;
