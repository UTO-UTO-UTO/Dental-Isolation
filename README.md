# 口腔3D图鉴

互动三维口腔科普 / 医患沟通示意站点。品牌名默认：**口腔3D图鉴**（可在 `js/site-config.js` 改为诊所名，例如「华雅口腔」）。

灵感来自公开站点「口腔图鉴」的产品形态，界面与文案为原创实现；三维模型使用开放许可素材（见 `credits.html`），**未使用其专有 GLB / Logo / 文案资产**。

## 本地预览

在项目根目录启动任意静态服务器即可（无需构建）：

```bash
cd /workspace/kouqiang-tujian
python3 -m http.server 8765
```

浏览器打开：<http://127.0.0.1:8765/>

或：

```bash
npx --yes serve -l 8765
```

也可打包分发：

```bash
./scripts/pack.sh
# 生成 dist/kouqiang-tujian.zip
```

Three.js r160 已本地托管于 `vendor/three`（importmap + ES module），预览与部署均无需联网 CDN。

## 品牌配置

编辑 `js/site-config.js`：

| 字段 | 说明 |
|------|------|
| `siteName` | 导航与页脚显示的产品名 |
| `clinicName` | 可选诊所名（如「华雅口腔」），非空时显示在品牌旁 |
| `tagline` | 标语 |
| `contact.*` | 电话 / 微信 / 地址 / 邮箱（写入页脚） |
| `icp` | 备案号（国内主机需填） |
| `disclaimer` | 免责短句 |

导航与页脚由 `js/nav.js` 读取配置并写入各页。

## 图鉴内容

专科目录与详情文案的**唯一数据源**为 `js/atlas-data.js`：

- `specialties`：种植 / 正畸 / 修复 / 全科 / 儿牙的分组主题（中文标题 + 一句副标题）
- `articles`：患者向详情稿（当前含多种植 + 正畸重点主题）
- `pages/*.html` 通过 `atlas-page.js` / `detail-page.js` 渲染，勿在 HTML 内硬编码主题列表

## 页面结构

| 路径 | 说明 |
|------|------|
| `index.html` | 首页：滚动章节 + 固定 Three.js 种植拆解 |
| `pages/implant.html` 等 | 专科图鉴目录 |
| `pages/detail.html?topic=` | 主题详情 |
| `simulate.html` | 模拟口腔：颌骨牙列、透明度、FDI |
| `try.html` | 互动试戴 |
| `credits.html` | 模型来源与许可 |

## 静态部署

本站为纯静态文件，可部署到：

1. **Nginx / Caddy / Apache**：将站点根目录指到本项目根（含 `index.html`）。
2. **GitHub Pages**：推送仓库后，Settings → Pages → Deploy from branch，根目录选 `/`（或 `docs/` 若你把文件放进 docs）。
3. **Cloudflare Pages / Netlify / Vercel**：连接仓库或直接上传目录；构建命令留空，输出目录为项目根。

建议开启 `gzip`/`brotli`；大文件主要是 `assets/models/jaw.glb` 与 HDR。无需 Node 构建步骤。

国内大陆主机请在 `site-config.js` 填写 `icp`，并按当地法规完善隐私政策与医疗广告合规说明。

## 署名与许可（摘要）

完整表见 `credits.html`：

- **Z-Anatomy** 颌骨/牙列等：CC BY-SA 4.0；上游牙列网格来自 **BodyParts3D**（CC BY 4.0）
- **Poly Haven** Studio Small 08 HDRI：CC0
- 首页种植体螺纹几何：本站原创程序化模型（非商业系统复制品）
- **three.js** r160：MIT（本地 `vendor/three`）

对外分发衍生 GLB 时请保留 CC BY-SA 署名要求。

## 患者口扫与隐私

后续若接入门诊口扫 STL/PLY：

- 仅使用**已脱敏**数据（去除姓名、病历号、面部可识别纹理等）
- 不要将真实患者文件提交到公开仓库或未加密网盘
- 在站内展示前取得患者知情同意，并在隐私说明中写清用途与保存期限

## 技术说明

- 纯静态 HTML / CSS / JS
- Three.js r160；MeshPhysicalMaterial + Poly Haven CC0 HDRI（PMREM）+ ACES
- 配色：paper `#f6f8f8` · ink `#243536` · muted `#707974` · accent `#2f7772` · line `#d9dfd9`

## 免责声明

科普示意非临床依据。个体解剖与治疗方案因人而异，请以执业医师面诊与影像检查为准。


## 门诊品牌与二维码

编辑 `js/site-config.js`：

- `clinicName` / `siteName` / `contact` / `icp`
- 二维码：把图片放到 `assets/brand/qr.png`，并把 `qr.image` 改成 `assets/brand/qr.png`
