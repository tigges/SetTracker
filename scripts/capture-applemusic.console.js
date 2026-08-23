/* setradar: Apple Music DJ-mix album → accumulated clocks
 *
 * Desktop console on the album page you already have open:
 *   1. Open music.apple.com/…/album/…/{id} (tracklist visible).
 *   2. Open this file → Select All → Copy.
 *   3. DevTools → Console → allow pasting → Paste → Enter.
 *   4. Copies `m:ss Artist - Title` with start clocks = sum of
 *      official segment lengths. CI never fetches Apple Music.
 */
(function () {
  "use strict";

  function parseDur(token) {
    var m = String(token || "").trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!m) return null;
    if (m[3] != null) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
    return Number(m[1]) * 60 + Number(m[2]);
  }

  function fmt(sec) {
    var s = Math.max(0, Math.floor(sec));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var r = s % 60;
    if (h > 0) return h + ":" + String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
    return m + ":" + String(r).padStart(2, "0");
  }

  function stripMixed(title) {
    return String(title || "")
      .replace(/\s*[([]]\s*mixed\s*[)\]]\s*$/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  var rows = [];
  var songRows = document.querySelectorAll(
    '[data-testid="track-lockup"], [data-testid="songs-list-item"], .songs-list-row, [role="row"]',
  );
  songRows.forEach(function (el) {
    var titleEl =
      el.querySelector('[data-testid="track-title"], .songs-list-row__song-name, .track-title') ||
      el.querySelector("a");
    var artistEl = el.querySelector(
      '[data-testid="track-subtitle"], .songs-list-row__by-line, .by-line',
    );
    var timeEl = el.querySelector("time, .songs-list-row__length, [data-testid='track-duration']");
    var title = titleEl && titleEl.textContent && titleEl.textContent.trim();
    var artist = artistEl && artistEl.textContent && artistEl.textContent.trim();
    var dur = timeEl && parseDur(timeEl.textContent || timeEl.getAttribute("datetime") || "");
    if (title && artist && dur) rows.push({ title: stripMixed(title), artist: artist, dur: dur });
  });

  if (!rows.length) {
    var text = (document.body && document.body.innerText) || "";
    var lines = text.split(/\n+/).map(function (l) { return l.replace(/\s+/g, " ").trim(); }).filter(Boolean);
    for (var i = 0; i < lines.length - 2; i++) {
      if (/^\d{1,3}\.?$/.test(lines[i])) {
        var dur = parseDur(lines[i + 3] || "") || parseDur(lines[i + 2] || "");
        if (!dur) continue;
        var title = lines[i + 1];
        var artist = parseDur(lines[i + 2]) ? "" : lines[i + 2];
        if (!title || !artist || /^\d/.test(title)) continue;
        rows.push({ title: stripMixed(title), artist: artist, dur: dur });
      }
    }
  }

  if (!rows.length) {
    console.warn("setradar Apple Music: no mix-segment rows found");
    return;
  }

  var out = [];
  var cursor = 0;
  rows.forEach(function (r) {
    out.push(fmt(cursor) + " " + r.artist + " - " + r.title);
    cursor += r.dur;
  });
  var blob = out.join("\n");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(blob).then(
      function () {
        console.log("setradar Apple Music: copied " + rows.length + " accumulated clocks (" + fmt(cursor) + ")");
      },
      function () {
        console.log(blob);
      },
    );
  } else {
    console.log(blob);
  }
})();
