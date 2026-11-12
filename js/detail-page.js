/**
 * Render detail.html from AtlasData.articles or topic fallback.
 */
(function () {
  const params = new URLSearchParams(location.search);
  const topicId = params.get("topic") || "";
  const cfg = window.SiteConfig || {};
  const siteName = cfg.siteName || "口腔3D图鉴";
  const articles = (window.AtlasData && window.AtlasData.articles) || {};
  const found = window.AtlasData && window.AtlasData.findTopic ? window.AtlasData.findTopic(topicId) : null;

  const titleEl = document.getElementById("detail-title");
  const crumbSpec = document.getElementById("crumb-spec");
  const crumbTopic = document.getElementById("crumb-topic");
  const summaryEl = document.getElementById("detail-summary");
  const bodyEl = document.getElementById("detail-article");
  const actionsEl = document.getElementById("detail-actions");
  const stubEl = document.getElementById("detail-stub-note");

  const article = articles[topicId];

  if (article) {
    titleEl.textContent = article.title;
    crumbTopic.textContent = article.title;
    if (crumbSpec) {
      crumbSpec.textContent = article.specialtyLabel;
      crumbSpec.href = article.specialty + ".html";
    }
    document.title = article.title + " — " + siteName;
    if (summaryEl) summaryEl.textContent = article.summary || "";
    if (stubEl) stubEl.hidden = true;

    bodyEl.innerHTML = article.sections
      .map((sec) => {
        const paras = (sec.paragraphs || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
        const bullets =
          sec.bullets && sec.bullets.length
            ? `<ul class="detail-bullets">${sec.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
            : "";
        return `<h2>${escapeHtml(sec.heading)}</h2>${paras}${bullets}`;
      })
      .join("");

    const links = article.links || {};
    let actions = `<a class="btn btn-outline" href="${article.specialty}.html">返回${escapeHtml(article.specialtyLabel)}图鉴</a>`;
    if (links.simulate) actions += ` <a class="btn btn-outline" href="../simulate.html">去模拟口腔</a>`;
    if (links.try) actions += ` <a class="btn btn-primary" href="../try.html">互动试戴</a>`;
    if (links.related && links.related.length) {
      const rel = links.related
        .map((id) => {
          const meta = window.AtlasData.findTopic(id);
          const label = (meta && meta.topic && meta.topic.title) || id;
          return `<a href="detail.html?topic=${encodeURIComponent(id)}">${escapeHtml(label)}</a>`;
        })
        .join(" · ");
      bodyEl.innerHTML += `<h2>相关主题</h2><p class="detail-related">${rel}</p>`;
    }
    actionsEl.innerHTML = actions;
  } else if (found) {
    const t = found.topic;
    const spec = found.specialty;
    titleEl.textContent = t.title;
    crumbTopic.textContent = t.title;
    if (crumbSpec) {
      crumbSpec.textContent = spec.title;
      crumbSpec.href = spec.id + ".html";
    }
    document.title = t.title + " — " + siteName;
    if (summaryEl) summaryEl.textContent = t.subtitle || "";
    if (stubEl) {
      stubEl.hidden = false;
      stubEl.textContent = "本主题暂为条目说明页，完整图文将陆续补充。以下先帮您了解要点。";
    }
    bodyEl.innerHTML = `
      <h2>一句话说明</h2>
      <p>${escapeHtml(t.subtitle || "用于专科图鉴中的主题入口。")}</p>
      <h2>您可以了解这些</h2>
      <ul class="detail-bullets">
        <li>这是什么、能解决什么问题</li>
        <li>常见适合与不适合的情况（需面诊确认）</li>
        <li>大致流程与复诊节奏</li>
        <li>居家护理与复查要注意什么</li>
      </ul>
      <h2>对照三维示意</h2>
      <p>上方（电脑端在右侧）是可旋转的三维示意；也可结合「模拟口腔」指出相关牙位，或返回专科图鉴继续浏览。</p>
    `;
    actionsEl.innerHTML = `
      <a class="btn btn-outline" href="${spec.id}.html">返回${escapeHtml(spec.title)}图鉴</a>
      <a class="btn btn-outline" href="../simulate.html">去模拟口腔</a>
      <a class="btn btn-primary" href="../try.html">互动试戴</a>
    `;
  } else {
    titleEl.textContent = topicId ? "未找到主题" : "请选择主题";
    crumbTopic.textContent = "主题";
    if (summaryEl) summaryEl.textContent = "从专科图鉴中点击任一主题进入详情。";
    if (stubEl) stubEl.hidden = true;
    bodyEl.innerHTML = `<p>主题标识无效或不存在。请返回种植 / 正畸 / 修复 / 全科 / 儿牙图鉴重新选择。</p>`;
    actionsEl.innerHTML = `
      <a class="btn btn-outline" href="implant.html">种植</a>
      <a class="btn btn-outline" href="ortho.html">正畸</a>
      <a class="btn btn-primary" href="../index.html">回首页</a>
    `;
    document.title = "主题详情 — " + siteName;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
