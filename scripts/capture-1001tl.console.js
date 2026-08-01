/* setradar: 1001Tracklists -> TS seed
 *
 * WRONG: typing   scripts/capture-1001tl.console.js   into the console
 * RIGHT: paste the CONTENTS of this file (Select All in the editor, Copy)
 *
 * Steps:
 *   1. Open the 1001 tracklist page (fully loaded).
 *   2. Open this file in your editor / GitHub "Raw".
 *   3. Select All -> Copy the whole file.
 *   4. On the 1001 page: DevTools -> Console.
 *      Chrome may say "don't paste code" -> type: allow pasting  then Enter.
 *   5. Paste (Cmd/Ctrl+V) -> Enter.
 *   6. Look for: [setradar 1001] Copied TS seed to clipboard.
 *
 * Optional before paste:
 *   window.__SETRADAR_1001__ = { slug: "yt-dXBoIY65P8s", name: "TL_DARUDE_EDC_LV_2026", durationSec: 3382 };
 */
(() => {
  const opts = Object.assign(
    {
      slug: "",
      name: "TL_CAPTURED",
      durationSec: 3600,
      skipBareId: true,
    },
    typeof window !== "undefined" ? window.__SETRADAR_1001__ || {} : {},
  );

  const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  const stripLabel = (line) =>
    line
      .replace(/\s*\[[^\]]+\](?:\s*\/\s*\[[^\]]+\])*\s*$/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const splitArtistTitle = (raw) => {
    const cleaned = stripLabel(raw);
    const m = cleaned.match(/^(.+?)\s+[-–—]\s+(.+)$/);
    if (!m) return { artist: cleaned, title: "ID" };
    return { artist: m[1].trim(), title: m[2].trim() };
  };

  const isBareId = (artist, title) => {
    if (/^id$/i.test(artist) && /^id$/i.test(title)) return true;
    if (/^id$/i.test(title)) return true;
    return false;
  };

  const formatClock = (sec) => {
    const s = Math.max(0, Math.floor(sec));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
    }
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  const parseCue = (cue) => {
    const t = String(cue || "").trim();
    const m = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!m) return null;
    if (m[3] != null) {
      return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
    }
    return Number(m[1]) * 60 + Number(m[2]);
  };

  const textOf = (el, sel) => {
    const n = el.querySelector(sel);
    return n ? n.textContent.replace(/\s+/g, " ").trim() : "";
  };

  const metaContent = (el, prop) => {
    const n = el.querySelector(`meta[itemprop="${prop}"]`);
    return n && n.getAttribute("content")
      ? n.getAttribute("content").trim()
      : "";
  };

  const items = [
    ...document.querySelectorAll(
      "div.bItm.tlpItem, div.tlpItem, tr.tlpItem, .tlpItem",
    ),
  ];
  const rows = [];

  if (items.length) {
    for (const el of items) {
      const numRaw =
        textOf(el, ".tracknumber_value, .trackNumber, .trNum") ||
        (el.getAttribute("data-tracknumber") || "").trim();
      const cueRaw = textOf(el, ".cueValue, .cue, [class*='cueValue']");
      const fromMeta =
        metaContent(el, "name") ||
        [metaContent(el, "byArtist"), metaContent(el, "name")]
          .filter(Boolean)
          .join(" - ");
      const fromSpan = textOf(
        el,
        ".trackValue, span.trackValue, .tlpTog .trackValue",
      );
      const rawTrack = fromMeta || fromSpan;
      if (!rawTrack) continue;
      const { artist, title } = splitArtistTitle(rawTrack);
      if (opts.skipBareId && isBareId(artist, title)) continue;
      rows.push({
        num: numRaw,
        withPrev: /^w\/?$/i.test(numRaw),
        at: cueRaw && parseCue(cueRaw) != null ? cueRaw.trim() : undefined,
        artist,
        title,
      });
    }
  }

  if (!rows.length) {
    for (const span of document.querySelectorAll(".trackValue")) {
      const rawTrack = span.textContent.replace(/\s+/g, " ").trim();
      if (!rawTrack) continue;
      const row =
        span.closest(".bItm, .tlpItem, tr, li, div[id^='tlp']") ||
        span.parentElement;
      const cueEl = row && row.querySelector(".cueValue, .cue");
      const numEl = row && row.querySelector(".tracknumber_value");
      const cueRaw = cueEl ? cueEl.textContent.trim() : "";
      const numRaw = numEl ? numEl.textContent.trim() : "";
      const { artist, title } = splitArtistTitle(rawTrack);
      if (opts.skipBareId && isBareId(artist, title)) continue;
      rows.push({
        num: numRaw,
        withPrev: /^w\/?$/i.test(numRaw),
        at: cueRaw && parseCue(cueRaw) != null ? cueRaw : undefined,
        artist,
        title,
      });
    }
  }

  if (!rows.length) {
    console.error(
      "[setradar 1001] No tracks found. Wait for the list to finish loading, then re-run.",
    );
    return;
  }

  const timed = rows.filter((r) => r.at).length;
  let seed = rows.map((r) => ({
    at: r.at,
    artist: r.artist,
    title: r.title,
  }));

  if (timed < Math.max(3, Math.floor(rows.length * 0.4))) {
    const n = seed.length;
    const usable = Math.max(60, opts.durationSec - 45);
    const step = Math.max(45, Math.floor(usable / n));
    seed = seed.map((r, i) => ({
      ...r,
      at: r.at || formatClock(20 + i * step),
    }));
  } else {
    seed = seed.map((r, i) => ({
      ...r,
      at: r.at || formatClock(i * 90),
    }));
  }

  const pageTitle = (
    document.querySelector("h1")?.textContent ||
    document.title ||
    ""
  )
    .replace(/\s+/g, " ")
    .trim();

  const header = [
    "/**",
    pageTitle ? ` * ${pageTitle}` : null,
    ` * ${location.href}`,
    opts.slug
      ? ` * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["${opts.slug}"] = ${opts.name}`
      : ' * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["<yt-or-sc-slug>"] = ' +
        opts.name,
    ` * Captured ${new Date().toISOString().slice(0, 10)} - provenance 1001tl.`,
    " */",
  ]
    .filter(Boolean)
    .join("\n");

  const body = seed
    .map(
      (r) =>
        `  { at: "${esc(r.at)}", artist: "${esc(r.artist)}", title: "${esc(r.title)}" },`,
    )
    .join("\n");

  const ts = `${header}\nexport const ${opts.name}: FingerprintSeedRow[] = [\n${body}\n];\n`;

  const summary = {
    count: seed.length,
    timedCues: timed,
    pageTitle,
    url: location.href,
    slug: opts.slug || null,
  };

  console.log("[setradar 1001] captured", summary);
  console.log(ts);

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(ts).then(
      () => console.log("[setradar 1001] Copied TS seed to clipboard."),
      (err) => console.warn("[setradar 1001] Clipboard failed:", err),
    );
  } else {
    console.warn(
      "[setradar 1001] Clipboard API unavailable - copy from the log above.",
    );
  }

  return { summary, ts, rows: seed };
})();
