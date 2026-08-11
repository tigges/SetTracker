"use client";

import { useMemo, useState } from "react";

const LIVE_SCRIPT =
  "https://tigges.github.io/SetTracker/capture-1001tl.js";

type Preset = {
  label: string;
  slug: string;
  name: string;
  /** Direct 1001.tl / tracklist URL, or a search page when unknown. */
  url: string;
  /** Button label for the open link (default Open 1001). */
  openLabel?: string;
};

function search1001(...parts: string[]): string {
  const q = [...parts, "site:1001tracklists.com"].join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

/** Dom Dolla Allianz Sydney wired — remaining capture targets. */
const NEXT_CAPTURES: Preset[] = [
  {
    label: "PAN-POT · Street Parade",
    slug: "yt-LpFxQmtEeAA",
    name: "TL_PAN_POT_STREET_PARADE_2025",
    url: search1001(
      "pan-pot",
      "opera stage",
      "street parade",
      "zurich",
      "2025-08-09",
    ),
    openLabel: "Find 1001",
  },
  {
    label: "HoneyLuv · Street Parade",
    slug: "yt-WTN5ru2ceRE",
    name: "TL_HONEYLUV_STREET_PARADE_2025",
    url: search1001(
      "honeyluv",
      "street parade",
      "zurich",
      "2025-08-09",
    ),
    openLabel: "Find 1001",
  },
  {
    label: "Zamna Soundsystem · Street Parade",
    slug: "yt-1Mp9Pl6YgDM",
    name: "TL_ZAMNA_STREET_PARADE_2025",
    url: search1001(
      "zamna",
      "street parade",
      "zurich",
      "2025-08-09",
    ),
    openLabel: "Find 1001",
  },
  {
    label: "Plastik Funk · Nature One",
    slug: "yt-apu-wnvlrqs",
    name: "TL_PLASTIK_FUNK_NATURE_ONE_2025",
    url: search1001("plastik funk", "nature one", "2025", "arte"),
    openLabel: "Find 1001",
  },
  {
    label: "Mike Williams · Tomorrowland WE2",
    slug: "yt-WnjXXOZ8Te8",
    name: "TL_MIKE_WILLIAMS_TML_WE2_2026",
    url: search1001(
      "mike williams",
      "tomorrowland",
      "weekend 2",
      "2026",
    ),
    openLabel: "Find 1001",
  },
  {
    label: "Peggy Gou · Cercle Lille",
    slug: "yt--UOMvxh4MYU",
    name: "TL_PEGGY_GOU_CERCLE_LILLE",
    url: search1001("peggy gou", "cercle", "lille", "palais"),
    openLabel: "Find 1001",
  },
  {
<<<<<<< HEAD
    label: "Eric Prydz · Ultra Miami 2026",
    slug: "yt-hU-z3iV0LOg",
    name: "TL_ERIC_PRYDZ_ULTRA_MIAMI_2026",
    url: search1001("eric prydz", "ultra", "miami", "2026", "resistance"),
=======
    label: "Dom Dolla · Allianz Stadium Sydney",
    slug: "yt-4Lqyh7cWRxQ",
    name: "TL_DOM_DOLLA_ALLIANZ_SYDNEY",
    url: search1001("dom dolla", "allianz", "sydney"),
    openLabel: "Find 1001",
  },
  {
    label: "FISHER · Tomorrowland Mainstage WE1",
    slug: "yt-4985f9Rfxx0",
    name: "TL_FISHER_TML_WE1_2026",
    url: search1001(
      "fisher",
      "mainstage",
      "tomorrowland",
      "weekend 1",
      "2026",
    ),
>>>>>>> origin/cursor/eric-prydz-ultra-miami-356d
    openLabel: "Find 1001",
  },
  {
    label: "Boris Brejcha · Tomorrowland WE1",
    slug: "yt-NpL_bT5vgmU",
    name: "TL_BORIS_BREJCHA_TML_WE1_2026",
    url: search1001(
      "boris brejcha",
      "tomorrowland",
      "weekend 1",
      "2026",
    ),
    openLabel: "Find 1001",
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
        <h2 className="text-lg font-extrabold tracking-tight">2. Open 1001 → run</h2>
        <ol className="list-decimal space-y-2 pl-5 text-[14px] text-muted">
          <li>Open a 1001 tracklist (fully loaded).</li>
          <li>Tap your <span className="text-ink">setradar 1001 capture</span> bookmark.</li>
          <li>Overlay appears → <span className="text-ink">Copy seed</span>.</li>
          <li>Paste the seed back into the setradar chat.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold tracking-tight">Next 10 captures</h2>
        <p className="text-[14px] text-muted">
          Street Parade batch 1 (Deborah → Adiel) is wired. Copy a preset
          bookmarklet (slug filled), open/find the 1001 page, then run it.
        </p>
        <ul className="divide-y divide-line border-y border-line">
          {NEXT_CAPTURES.map((p) => (
            <li
              key={p.slug}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="font-bold text-ink">{p.label}</div>
                <div className="mono text-[11px] text-muted2">{p.slug}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-line px-3 py-2 text-[13px] font-bold"
                >
                  {p.openLabel ?? "Open 1001"}
                </a>
                <button
                  type="button"
                  className="rounded-md bg-ink px-3 py-2 text-[13px] font-bold text-bg"
                  onClick={() =>
                    onCopy(p.label, bookmarkletFor(scriptUrl, p))
                  }
                >
                  Copy capture
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
