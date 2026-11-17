/**
 * Mount pre-rendered realistic 3D stills for catalog thumbs and guide panels.
 * Stills live in assets/iso-stills/ and were generated from the local jaw scenes.
 */
(function (global) {
  "use strict";

  var MANIFEST = global.IsoStillsManifest || {};
  var ROOT = (function () {
    var s = document.querySelector('script[src*="iso-stills.js"]');
    if (!s) return "../";
    return s.getAttribute("src").replace(/js\/iso-stills\.js.*$/, "");
  })();

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function asset(file) {
    if (!file) return "";
    return ROOT + "assets/iso-stills/" + file;
  }

  function topicEntry(id) {
    return (MANIFEST.topics && MANIFEST.topics[id]) || null;
  }
  function groupEntry(specialty, groupTitle) {
    return (MANIFEST.groups && MANIFEST.groups[specialty + "|" + groupTitle]) || null;
  }
  function guideEntry(key) {
    return (MANIFEST.guides && MANIFEST.guides[key]) || null;
  }

  function figureHtml(src, caption, cls, alt) {
    if (!src) return "";
    return (
      '<figure class="iso-figure iso-still ' +
      (cls || "") +
      '"><img src="' +
      esc(src) +
      '" alt="' +
      esc(alt || caption || "三维结构示意") +
      '" width="960" height="640" loading="lazy" decoding="async" />' +
      (caption ? "<figcaption>" + esc(caption) + "</figcaption>" : "") +
      "</figure>"
    );
  }

  function rowHtml(files, cls) {
    var cells = (files || [])
      .map(function (f) {
        return figureHtml(asset(f.file), f.caption, "iso-still-cell", f.caption);
      })
      .join("");
    return '<div class="iso-still-row ' + (cls || "") + '">' + cells + "</div>";
  }

  function groupThumb(specialty, groupTitle) {
    var e = groupEntry(specialty, groupTitle);
    if (!e) return "";
    return (
      '<img src="' +
      esc(asset(e.file)) +
      '" alt="" width="384" height="256" loading="lazy" decoding="async" />'
    );
  }

  function topicPosterUrl(id) {
    var e = topicEntry(id);
    return e ? asset(e.file) : "";
  }

  function mountGuide(el, key, cls) {
    var e = guideEntry(key);
    if (!el || !e) return;
    if (e.files && e.files.length) {
      el.innerHTML = rowHtml(e.files, cls || "");
    } else if (e.file) {
      el.innerHTML = figureHtml(asset(e.file), e.caption, cls || "iso-figure-guide", e.caption);
    }
  }

  function autoMount() {
    var nodes = document.querySelectorAll("[data-iso]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.getAttribute("data-iso-mounted")) continue;
      var key = el.getAttribute("data-iso");
      el.setAttribute("data-iso-mounted", "1");
      mountGuide(el, key, el.getAttribute("data-iso-class") || "iso-figure-guide");
    }
  }

  global.IsoStills = {
    asset: asset,
    topicEntry: topicEntry,
    groupEntry: groupEntry,
    guideEntry: guideEntry,
    figureHtml: figureHtml,
    groupThumb: groupThumb,
    topicPosterUrl: topicPosterUrl,
    mountGuide: mountGuide,
    autoMount: autoMount,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoMount);
  } else {
    autoMount();
  }
})(window);
