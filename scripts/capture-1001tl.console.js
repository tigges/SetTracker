/* setradar: 1001Tracklists -> TS seed
 *
 * Desktop console:
 *   1. Open the 1001 tracklist page (fully loaded).
 *   2. Open this file → Select All → Copy.
 *   3. DevTools → Console → type: allow pasting → Enter → Paste → Enter.
 *   4. Overlay appears — Copy seed (or Select all).
 *
 * Mobile bookmarklet: https://tigges.github.io/SetTracker/capture-1001/
 * (hosts public/capture-1001tl.js — keep this file in sync).
 *
 * Optional before paste:
 *   window.__SETRADAR_1001__ = { slug: "yt-7cK7rhYXbh8", name: "TL_DEBORAH_STREET_PARADE_2025" };
 */
(function () {
  "use strict";

  function scriptParams() {
    try {
      var cur = document.currentScript;
      if (cur && cur.src) return new URL(cur.src).searchParams;
    } catch (_e) {}
    return new URLSearchParams();
  }

  var q = scriptParams();
  var preset = (typeof window !== "undefined" && window.__SETRADAR_1001__) || {};
  var opts = {
    slug: String(q.get("slug") || preset.slug || "").trim(),
    name: String(q.get("name") || preset.name || "TL_CAPTURED").trim() || "TL_CAPTURED",
    durationSec: Number(q.get("durationSec") || preset.durationSec || 3600) || 3600,
    skipBareId: preset.skipBareId !== false,
  };

  // Mobile / bookmarklet: ask when slug missing (skip if already set).
  if (!opts.slug) {
    var asked = window.prompt(
      "setradar 1001 — set slug (e.g. yt-7cK7rhYXbh8). Cancel to skip.",
      "",
    );
    if (asked != null) opts.slug = asked.trim();
  }
  if (opts.name === "TL_CAPTURED") {
    var askedName = window.prompt(
      "Seed constant name (e.g. TL_DEBORAH_STREET_PARADE_2025)",
      opts.slug
        ? "TL_" +
            opts.slug
              .replace(/^yt-|^sc-/i, "")
              .replace(/[^a-z0-9]+/gi, "_")
              .toUpperCase()
              .slice(0, 48)
        : "TL_CAPTURED",
    );
    if (askedName != null && askedName.trim()) opts.name = askedName.trim();
  }

  function esc(s) {
    return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  function stripLabel(line) {
    return line
      .replace(/\s*\[[^\]]+\](?:\s*\/\s*\[[^\]]+\])*\s*$/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function splitArtistTitle(raw) {
    var cleaned = stripLabel(raw);
    var m = cleaned.match(/^(.+?)\s+[-–—]\s+(.+)$/);
    if (!m) return { artist: cleaned, title: "ID" };
    return { artist: m[1].trim(), title: m[2].trim() };
  }

  function isBareId(artist, title) {
    if (/^id$/i.test(artist) && /^id$/i.test(title)) return true;
    if (/^id$/i.test(title)) return true;
    return false;
  }

  function formatClock(sec) {
    var s = Math.max(0, Math.floor(sec));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var r = s % 60;
    if (h > 0) {
      return h + ":" + String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
    }
    return m + ":" + String(r).padStart(2, "0");
  }

  function parseCue(cue) {
    var t = String(cue || "").trim();
    var m = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!m) return null;
    if (m[3] != null) {
      return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
    }
    return Number(m[1]) * 60 + Number(m[2]);
  }

  function textOf(el, sel) {
    var n = el.querySelector(sel);
    return n ? n.textContent.replace(/\s+/g, " ").trim() : "";
  }

  function metaContent(el, prop) {
    var n = el.querySelector('meta[itemprop="' + prop + '"]');
    return n && n.getAttribute("content")
      ? n.getAttribute("content").trim()
      : "";
  }

  function showOverlay(ts, summary) {
    var old = document.getElementById("setradar-1001-overlay");
    if (old) old.remove();

    var wrap = document.createElement("div");
    wrap.id = "setradar-1001-overlay";
    wrap.setAttribute(
      "style",
      "position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.72);display:flex;align-items:flex-end;justify-content:center;padding:12px;font:14px/1.4 -apple-system,system-ui,sans-serif;",
    );

    var panel = document.createElement("div");
    panel.setAttribute(
      "style",
      "width:min(640px,100%);max-height:85vh;background:#111;color:#f2f2f2;border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:10px;box-shadow:0 12px 40px rgba(0,0,0,.45);",
    );

    var title = document.createElement("div");
    title.textContent =
      "setradar · " +
      summary.count +
      " tracks" +
      (summary.timedCues ? " · " + summary.timedCues + " cues" : "");
    title.setAttribute("style", "font-weight:700;font-size:16px;");

    var hint = document.createElement("div");
    hint.textContent =
      "Copy the seed below, then paste it into the setradar chat / PR.";
    hint.setAttribute("style", "color:#aaa;font-size:12px;");

    var ta = document.createElement("textarea");
    ta.value = ts;
    ta.readOnly = true;
    ta.setAttribute(
      "style",
      "width:100%;height:min(45vh,320px);background:#1c1c1c;color:#eee;border:1px solid #333;border-radius:8px;padding:10px;font:12px/1.35 ui-monospace,Menlo,monospace;resize:vertical;",
    );

    var row = document.createElement("div");
    row.setAttribute("style", "display:flex;gap:8px;flex-wrap:wrap;");

    function btn(label, primary) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.setAttribute(
        "style",
        "flex:1;min-width:120px;padding:12px 14px;border:0;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;" +
          (primary
            ? "background:#e8ff47;color:#111;"
            : "background:#2a2a2a;color:#f2f2f2;"),
      );
      return b;
    }

    var copyBtn = btn("Copy seed", true);
    var selectBtn = btn("Select all", false);
    var closeBtn = btn("Close", false);

    copyBtn.onclick = function () {
      ta.focus();
      ta.select();
      var ok = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ts).then(
          function () {
            copyBtn.textContent = "Copied ✓";
          },
          function () {
            try {
              ok = document.execCommand("copy");
            } catch (_e) {}
            copyBtn.textContent = ok ? "Copied ✓" : "Select → Copy";
          },
        );
        return;
      }
      try {
        ok = document.execCommand("copy");
      } catch (_e) {}
      copyBtn.textContent = ok ? "Copied ✓" : "Select → Copy";
    };

    selectBtn.onclick = function () {
      ta.focus();
      ta.select();
    };
    closeBtn.onclick = function () {
      wrap.remove();
    };
    wrap.onclick = function (e) {
      if (e.target === wrap) wrap.remove();
    };

    row.appendChild(copyBtn);
    row.appendChild(selectBtn);
    row.appendChild(closeBtn);
    panel.appendChild(title);
    panel.appendChild(hint);
    panel.appendChild(ta);
    panel.appendChild(row);
    wrap.appendChild(panel);
    document.documentElement.appendChild(wrap);
    ta.focus();
    ta.select();
  }

  var items = Array.prototype.slice.call(
    document.querySelectorAll(
      "div.bItm.tlpItem, div.tlpItem, tr.tlpItem, .tlpItem",
    ),
  );
  var rows = [];

  if (items.length) {
    for (var i = 0; i < items.length; i++) {
      var el = items[i];
      var numRaw =
        textOf(el, ".tracknumber_value, .trackNumber, .trNum") ||
        (el.getAttribute("data-tracknumber") || "").trim();
      var cueRaw = textOf(el, ".cueValue, .cue, [class*='cueValue']");
      var fromMeta =
        metaContent(el, "name") ||
        [metaContent(el, "byArtist"), metaContent(el, "name")]
          .filter(Boolean)
          .join(" - ");
      var fromSpan = textOf(
        el,
        ".trackValue, span.trackValue, .tlpTog .trackValue",
      );
      var rawTrack = fromMeta || fromSpan;
      if (!rawTrack) continue;
      var split = splitArtistTitle(rawTrack);
      if (opts.skipBareId && isBareId(split.artist, split.title)) continue;
      rows.push({
        num: numRaw,
        withPrev: /^w\/?$/i.test(numRaw),
        at: cueRaw && parseCue(cueRaw) != null ? cueRaw.trim() : undefined,
        artist: split.artist,
        title: split.title,
      });
    }
  }

  if (!rows.length) {
    var spans = document.querySelectorAll(".trackValue");
    for (var si = 0; si < spans.length; si++) {
      var span = spans[si];
      var raw = span.textContent.replace(/\s+/g, " ").trim();
      if (!raw) continue;
      var rowEl =
        span.closest(".bItm, .tlpItem, tr, li, div[id^='tlp']") ||
        span.parentElement;
      var cueEl = rowEl && rowEl.querySelector(".cueValue, .cue");
      var numEl = rowEl && rowEl.querySelector(".tracknumber_value");
      var cue2 = cueEl ? cueEl.textContent.trim() : "";
      var num2 = numEl ? numEl.textContent.trim() : "";
      var split2 = splitArtistTitle(raw);
      if (opts.skipBareId && isBareId(split2.artist, split2.title)) continue;
      rows.push({
        num: num2,
        withPrev: /^w\/?$/i.test(num2),
        at: cue2 && parseCue(cue2) != null ? cue2 : undefined,
        artist: split2.artist,
        title: split2.title,
      });
    }
  }

  if (!rows.length) {
    window.alert(
      "setradar 1001: no tracks found. Wait for the list to finish loading, then run again.",
    );
    return;
  }

  var timed = rows.filter(function (r) {
    return r.at;
  }).length;
  var secs = rows.map(function (r) {
    return r.at ? parseCue(r.at) : null;
  });
  var n = rows.length;
  if (timed === 0) {
    var usable = Math.max(60, opts.durationSec - 45);
    var step = Math.max(45, Math.floor(usable / n));
    for (var a = 0; a < n; a++) secs[a] = 20 + a * step;
  } else {
    if (secs[0] == null) secs[0] = 0;
    if (secs[n - 1] == null) {
      secs[n - 1] = Math.max(secs[0] || 0, opts.durationSec - 30);
    }
    for (var b = 0; b < n; b++) {
      if (secs[b] != null) continue;
      var lo = b - 1;
      while (lo >= 0 && secs[lo] == null) lo--;
      var hi = b + 1;
      while (hi < n && secs[hi] == null) hi++;
      var loSec = lo >= 0 ? secs[lo] : 0;
      var hiSec =
        hi < n ? secs[hi] : Math.max(loSec + 60, opts.durationSec - 30);
      var loI = lo >= 0 ? lo : -1;
      var hiI = hi < n ? hi : n;
      var t = (b - loI) / Math.max(1, hiI - loI);
      secs[b] = Math.round(loSec + t * (hiSec - loSec));
    }
    for (var c = 1; c < n; c++) {
      if (secs[c] <= secs[c - 1]) secs[c] = secs[c - 1] + 1;
    }
  }

  var seed = rows.map(function (r, idx) {
    return {
      at: formatClock(secs[idx]),
      artist: r.artist,
      title: r.title,
    };
  });

  var pageTitle = (
    (document.querySelector("h1") && document.querySelector("h1").textContent) ||
    document.title ||
    ""
  )
    .replace(/\s+/g, " ")
    .trim();

  var header = [
    "/**",
    pageTitle ? " * " + pageTitle : null,
    " * " + location.href,
    opts.slug
      ? ' * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["' +
        opts.slug +
        '"] = ' +
        opts.name
      : ' * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["<yt-or-sc-slug>"] = ' +
        opts.name,
    " * Captured " +
      new Date().toISOString().slice(0, 10) +
      " - provenance 1001tl.",
    " */",
  ]
    .filter(Boolean)
    .join("\n");

  var body = seed
    .map(function (r) {
      return (
        '  { at: "' +
        esc(r.at) +
        '", artist: "' +
        esc(r.artist) +
        '", title: "' +
        esc(r.title) +
        '" },'
      );
    })
    .join("\n");

  var ts =
    header +
    "\nexport const " +
    opts.name +
    ": FingerprintSeedRow[] = [\n" +
    body +
    "\n];\n";

  var summary = {
    count: seed.length,
    timedCues: timed,
    pageTitle: pageTitle,
    url: location.href,
    slug: opts.slug || null,
  };

  if (typeof console !== "undefined" && console.log) {
    console.log("[setradar 1001] captured", summary);
  }

  showOverlay(ts, summary);

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(ts).catch(function () {});
  }

  return { summary: summary, ts: ts, rows: seed };
})();
