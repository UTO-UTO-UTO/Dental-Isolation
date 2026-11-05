/**
 * Mobile nav + clinic branding from SiteConfig.
 * Expects optional window.SiteConfig (loaded before this file).
 */
(function () {
  const cfg = window.SiteConfig || {};
  const siteName = cfg.siteName || "口腔3D图鉴";
  const clinicName = (cfg.clinicName || "").trim();
  const tagline = cfg.tagline || "";
  const disclaimer = cfg.disclaimer || "科普示意非临床依据";
  const footerNote = cfg.footerNote || "科普展示与沟通参考";
  const contact = cfg.contact || {};
  const icp = (cfg.icp || "").trim();
  const qr = cfg.qr || {};

  const path = location.pathname.replace(/\\/g, "/");
  const inPages = /\/pages\//.test(path);
  const base = inPages ? "../" : "";

  // Brand label(s)
  document.querySelectorAll(".brand").forEach((el) => {
    const mark = el.querySelector(".brand-mark");
    const label = el.querySelector("[data-brand-label]") || el.querySelector("span:not(.brand-mark)");
    if (label) {
      const small = label.querySelector("small");
      const smallHtml = small ? small.outerHTML : "";
      label.innerHTML = siteName + smallHtml;
    }
    el.setAttribute("aria-label", siteName + "首页");
    if (clinicName) {
      let sub = el.querySelector("[data-clinic-name]");
      if (!sub) {
        sub = document.createElement("span");
        sub.setAttribute("data-clinic-name", "");
        sub.style.cssText = "margin-left:10px;font-size:12px;font-weight:400;color:var(--muted);letter-spacing:0.06em;";
        el.appendChild(sub);
      }
      sub.textContent = clinicName;
    }
  });

  // Breadcrumb root links
  document.querySelectorAll("[data-brand-crumb], .breadcrumb > a:first-child").forEach((a) => {
    if (a.closest(".breadcrumb")) a.textContent = siteName;
  });

  // Document title suffix
  if (document.title && !document.title.includes(siteName)) {
    // leave custom titles; only fix placeholder pages that end with old name handled in detail
  }

  // Footer
  document.querySelectorAll("[data-site-footer], footer.site-footer-simple").forEach((footer) => {
    if (footer.getAttribute("data-footer-locked") === "true") return;
    const creditsHref = base + "credits.html";
    const parts = [siteName];
    if (clinicName) parts.push(clinicName);
    parts.push(footerNote, disclaimer);
    let contactBits = [];
    if (contact.phone) contactBits.push("电话 " + contact.phone);
    if (contact.wechat) contactBits.push("微信 " + contact.wechat);
    if (contact.address) contactBits.push(contact.address);
    if (contact.email) contactBits.push(contact.email);
    const contactLine = contactBits.length
      ? `<div class="footer-contact">${contactBits.map(escapeHtml).join(" · ")}</div>`
      : "";
    const icpLine = icp
      ? `<div class="footer-icp">${escapeHtml(icp)}</div>`
      : `<div class="footer-icp footer-icp-placeholder" hidden data-icp-placeholder>ICP 备案号占位（发布前在 js/site-config.js 填写）</div>`;
    const qrSrc = (qr.image || "").trim();
    const qrLabel = (qr.label || "扫码咨询").trim();
    let qrBlock = "";
    if (qrSrc) {
      const src = qrSrc.startsWith("http") || qrSrc.startsWith("data:")
        ? qrSrc
        : base + qrSrc.replace(/^\.\//, "");
      qrBlock =
        `<div class="footer-qr" data-qr-slot>` +
        `<img src="${escapeHtml(src)}" alt="${escapeHtml(qrLabel)}" width="112" height="112" />` +
        `<div class="qr-label">${escapeHtml(qrLabel)}</div>` +
        `</div>`;
    } else {
      qrBlock =
        `<div class="footer-qr" data-qr-slot>` +
        `<div class="qr-drop">在此粘贴<br/>门诊二维码<br/><span style="opacity:.75">assets/brand/qr.png</span></div>` +
        `<div class="qr-label">扫码咨询 / 预约</div>` +
        `</div>`;
    }
    footer.innerHTML =
      `<div class="footer-with-qr"><div class="footer-copy">` +
      `<div class="footer-main">${parts.map(escapeHtml).join(" · ")} · <a href="${creditsHref}">模型来源与许可</a></div>` +
      contactLine +
      icpLine +
      `</div>${qrBlock}</div>`;
  });

  // Home tagline hooks
  document.querySelectorAll("[data-site-tagline]").forEach((el) => {
    if (tagline) el.textContent = tagline;
  });
  document.querySelectorAll("[data-site-name]").forEach((el) => {
    el.textContent = siteName;
  });

  // Active specialty nav
  const nav = document.querySelector(".specialty-nav");
  if (nav) {
    const file = path.split("/").pop() || "index.html";
    nav.querySelectorAll("a").forEach((a) => {
      const href = (a.getAttribute("href") || "").split("/").pop();
      if (href && href === file) a.classList.add("active");
    });
  }

  // Mobile toggle
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".specialty-nav");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
      const hdr = toggle.closest(".site-header");
      if (hdr) hdr.classList.toggle("nav-open", links.classList.contains("open"));
      toggle.setAttribute("aria-expanded", links.classList.contains("open") ? "true" : "false");
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
