"use client";

import { useMemo, useState } from "react";

const LIVE_SCRIPT =
  "https://tigges.github.io/SetTracker/capture-1001tl.js";

type Preset = {
  label: string;
  slug: string;
  name: string;
  /** Google / 1001 search when the shortlink is unknown. */
  searchUrl: string;
};

function search1001(...parts: string[]): string {
  const q = [...parts, "site:1001tracklists.com"].join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

/** `yt-<videoId>` → watch URL (handles ids that start with `-`). */
function youtubeFromSlug(slug: string): string {
  const id = slug.startsWith("yt-") ? slug.slice(3) : slug;
  return `https://www.youtube.com/watch?v=${id}`;
}

/**
 * Next 10 capture assists (YT-first).
 * Recently wired & removed: Dom Dolla Allianz, FISHER WE1, Massano Freedom,
 * Eric Prydz Ultra, Solomun Ally Pally, Street Parade Deborah→Adiel.
 */
const NEXT_CAPTURES: Preset[] = [
  {
    label: "PAN-POT · Street Parade",
    slug: "yt-LpFxQmtEeAA",
    name: "TL_PAN_POT_STREET_PARADE_2025",
    searchUrl: search1001(
      "pan-pot",
      "opera stage",
      "street parade",
      "zurich",
      "2025-08-09",
    ),
  },
  {
    label: "HoneyLuv · Street Parade",
    slug: "yt-WTN5ru2ceRE",
    name: "TL_HONEYLUV_STREET_PARADE_2025",
    searchUrl: search1001(
      "honeyluv",
      "street parade",
      "zurich",
      "2025-08-09",
    ),
  },
  {
    label: "Zamna Soundsystem · Street Parade",
    slug: "yt-1Mp9Pl6YgDM",
    name: "TL_ZAMNA_STREET_PARADE_2025",
    searchUrl: search1001(
      "zamna",
      "street parade",
      "zurich",
      "2025-08-09",
    ),
  },
  {
    label: "Plastik Funk · Nature One",
    slug: "yt-apu-wnvlrqs",
    name: "TL_PLASTIK_FUNK_NATURE_ONE_2025",
    searchUrl: search1001("plastik funk", "nature one", "2025", "arte"),
  },
  {
    label: "Mike Williams · Tomorrowland WE2",
    slug: "yt-WnjXXOZ8Te8",
    name: "TL_MIKE_WILLIAMS_TML_WE2_2026",
    searchUrl: search1001(
      "mike williams",
      "tomorrowland",
      "weekend 2",
      "2026",
    ),
  },
  {
    label: "Peggy Gou · Cercle Lille",
    slug: "yt--UOMvxh4MYU",
    name: "TL_PEGGY_GOU_CERCLE_LILLE",
    searchUrl: search1001("peggy gou", "cercle", "lille", "palais"),
  },
  {
    label: "Boris Brejcha · Tomorrowland WE1",
    slug: "yt-NpL_bT5vgmU",
    name: "TL_BORIS_BREJCHA_TML_WE1_2026",
    searchUrl: search1001(
      "boris brejcha",
      "mainstage",
      "tomorrowland",
      "weekend 1",
      "2026",
    ),
  },
  {
    label: "Sebastian Ingrosso · Tomorrowland WE2",
    slug: "yt-g4vR2VlhNtk",
    name: "TL_SEBASTIAN_INGROSSO_TML_WE2_2026",
    searchUrl: search1001(
      "sebastian ingrosso",
      "tomorrowland",
      "weekend 2",
      "2026",
    ),
  },
  {
    label: "Miss Monique · BIORHYTHM",
    slug: "yt-1LpQZ5GTRDg",
    name: "TL_MISS_MONIQUE_BIORHYTHM",
    searchUrl: search1001("miss monique", "biorhythm"),
  },
  {
    label: "John Summit · Lollapalooza",
    slug: "yt-9TKqqBCmDHA",
    name: "TL_JOHN_SUMMIT_LOLLAPALOOZA",
    searchUrl: search1001("john summit", "lollapalooza"),
  },
];

function bookmarkletFor(scriptBase: string, preset?: Preset): string {
  const qs = preset
    ? `?slug=${encodeURIComponent(preset.slug)}&name=${encodeURIComponent(preset.name)}&t=`
    : "?t=";
  // Date.now() is concatenated in the bookmarklet so phones always load a fresh script.
  return `javascript:(function(){var s=document.createElement("script");s.src="${scriptBase}${qs}"+Date.now();document.documentElement.appendChild(s)})();`;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function Capture1001Client() {
  const scriptUrl = useMemo(() => {
    if (typeof window === "undefined") return LIVE_SCRIPT;
    const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
    // Prefer same-origin script when opened from Pages / local export.
    if (window.location.hostname === "tigges.github.io" || base) {
      return `${window.location.origin}${base}/capture-1001tl.js`;
    }
    return LIVE_SCRIPT;
  }, []);

  const [status, setStatus] = useState<string>("");
  const generic = bookmarkletFor(scriptUrl);

  async function onCopy(label: string, text: string) {
    const ok = await copyText(text);
    setStatus(ok ? `Copied ${label}` : `Copy failed — long-press the code below`);
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold tracking-tight">1. Save the bookmarklet</h2>
        <p className="text-[14px] text-muted">
          On Android Chrome: bookmark this page → Bookmarks → Edit → replace the
          URL with the bookmarklet below → Save. On iOS Safari: add bookmark →
          Edit → paste bookmarklet as the address (awkward but works).
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md bg-ink px-3 py-2 text-[13px] font-bold text-bg"
            onClick={() => onCopy("bookmarklet", generic)}
          >
            Copy bookmarklet
          </button>
          <a
            href={generic}
            className="rounded-md border border-line px-3 py-2 text-[13px] font-bold text-ink"
            onClick={(e) => {
              // Prevent navigation; desktop users can drag this link to bookmarks.
              e.preventDefault();
              onCopy("bookmarklet", generic);
            }}
          >
            setradar 1001 capture
          </a>
        </div>
        <pre className="overflow-x-auto rounded-md border border-line bg-panel p-3 mono text-[11px] leading-relaxed text-muted2 whitespace-pre-wrap break-all">
          {generic}
        </pre>
        {status ? (
          <p className="mono text-[12px] text-brand">{status}</p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold tracking-tight">2. YouTube → 1001 → capture</h2>
        <ol className="list-decimal space-y-2 pl-5 text-[14px] text-muted">
          <li>
            Open the official YouTube set (<span className="text-ink">Open YT</span>).
          </li>
          <li>
            Find its 1001 page (description link, or{" "}
            <span className="text-ink">Find 1001</span>).
          </li>
          <li>
            On the 1001 page, tap{" "}
            <span className="text-ink">setradar 1001 capture</span> (or the
            preset <span className="text-ink">Copy capture</span> bookmark).
          </li>
          <li>
            Overlay → <span className="text-ink">Copy seed</span> → paste into
            setradar chat.
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold tracking-tight">Next 10 captures</h2>
        <p className="text-[14px] text-muted">
          Official YouTube first, then 1001, then the preset bookmarklet (slug
          filled).
        </p>
        <ol className="divide-y divide-line border-y border-line">
          {NEXT_CAPTURES.map((p, i) => (
            <li
              key={p.slug}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="font-bold text-ink">
                  <span className="mono text-muted2 mr-2">{i + 1}.</span>
                  {p.label}
                </div>
                <div className="mono text-[11px] text-muted2">{p.slug}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={youtubeFromSlug(p.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md bg-ink px-3 py-2 text-[13px] font-bold text-bg"
                >
                  Open YT
                </a>
                <a
                  href={p.searchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-line px-3 py-2 text-[13px] font-bold"
                >
                  Find 1001
                </a>
                <button
                  type="button"
                  className="rounded-md border border-line px-3 py-2 text-[13px] font-bold"
                  onClick={() =>
                    onCopy(p.label, bookmarkletFor(scriptUrl, p))
                  }
                >
                  Copy capture
                </button>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
