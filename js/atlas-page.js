/**
 * Render specialty atlas list from AtlasData.
 * Page must set <body data-specialty="implant"> (or ortho/prostho/general/pedo).
 */
(function () {
  const specId = document.body.getAttribute("data-specialty");
  const data = window.AtlasData && window.AtlasData.specialties && window.AtlasData.specialties[specId];
  const list = document.getElementById("atlas-list");
  if (!data || !list) return;

  const cfg = window.SiteConfig || {};
  const siteName = cfg.siteName || "口腔3D图鉴";

  const titleEl = document.getElementById("atlas-title");
  const leadEl = document.getElementById("atlas-lead");
  const crumbEl = document.getElementById("atlas-crumb-current");
  if (titleEl) titleEl.textContent = data.title;
  if (leadEl) leadEl.textContent = data.lead;
  if (crumbEl) crumbEl.textContent = data.title;
  document.title = data.title + " — " + siteName;

  list.innerHTML = data.groups
    .map((group) => {
      const count = group.topics.length;
      const links = group.topics
        .map((t) => {
          const tip = t.subtitle ? ` title="${escapeAttr(t.subtitle)}"` : "";
          return `<a href="detail.html?topic=${encodeURIComponent(t.id)}"${tip}>${escapeHtml(t.title)}</a>`;
        })
        .join(' <span class="atlas-sep">·</span> ');
      const previewTitles = group.topics.map((t) => t.title).slice(0, 3).join("、");
      const sub =
        count > 0
          ? "含：" + previewTitles + (count > 3 ? "等" : "")
          : "";
      return `<article class="atlas-row">
        <div>
          <h2>${escapeHtml(group.title)}</h2>
          <p class="atlas-group-sub">${escapeHtml(sub)}</p>
          <div class="atlas-topics">${links}</div>
        </div>
        <div class="atlas-count">${count} 项</div>
      </article>`;
    })
    .join("");

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }
})();
