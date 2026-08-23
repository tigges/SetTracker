/* setradar: MixesDB timed tracklist → clipboard lines
 *
 * Desktop console on a MixesDB mix page:
 *   1. Open the mix page (fully loaded).
 *   2. Open this file → Select All → Copy.
 *   3. DevTools → Console → allow pasting → Paste → Enter.
 *   4. Timed `[mm]` / `[mm:ss]` rows copy as `m:ss Artist - Title`.
 *
 * Follow-only: do not invent /w/ titles. CI cannot fetch MixesDB (Cloudflare).
 */
(function () {
  "use strict";

  function minutesToCue(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    if (h > 0) return h + ":" + String(m).padStart(2, "0") + ":00";
    return m + ":00";
  }

  function tokenToCue(token) {
    var t = String(token || "").trim();
    if (!t || t === "??" || t === "?") return null;
    if (/^\d{1,3}$/.test(t)) return minutesToCue(Number(t));
    if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(t)) return t;
    return null;
  }

  function unwrapWiki(s) {
    return String(s)
      .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
      .replace(/\[\[([^\]]+)\]\]/g, "$1")
      .replace(/\s*\[[^\]]+\](?:\s*\/\s*\[[^\]]+\])*\s*$/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  var root = document.querySelector("#mw-content-text") || document.body;
  var text = root.innerText || "";
  var lines = [];
  text.split(/\n+/).forEach(function (raw) {
    var line = raw.trim().replace(/^#\s*/, "");
    var m = line.match(/^\[(\?\?|\d{1,3}(?::\d{2}(?::\d{2})?)?)\]\s*(.*)$/);
    if (!m) return;
    var cue = tokenToCue(m[1]);
    if (!cue) return;
    var rest = unwrapWiki(m[2]);
    if (!rest) return;
    lines.push(cue + " " + rest);
  });

  var out = lines.join("\n");
  if (!out) {
    console.warn("setradar MixesDB: no timed [mm] / [mm:ss] rows on this page");
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(out).then(
      function () {
        console.log("setradar MixesDB: copied " + lines.length + " timed rows");
      },
      function () {
        console.log(out);
      },
    );
  } else {
    console.log(out);
  }
})();
