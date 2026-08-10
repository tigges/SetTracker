"use client";

import { useMemo, useState } from "react";

const LIVE_SCRIPT =
  "https://tigges.github.io/SetTracker/capture-1001tl.js";

type Preset = {
  label: string;
  slug: string;
  name: string;
  url: string;
};

const STREET_PARADE: Preset[] = [
  {
    label: "Deborah de Luca",
    slug: "yt-7cK7rhYXbh8",
    name: "TL_DEBORAH_STREET_PARADE_2025",
    url: "https://1001.tl/qwxcs1k",
  },
  {
    label: "Kevin de Vries",
    slug: "yt-S5qAspu0AbI",
    name: "TL_KEVIN_DE_VRIES_STREET_PARADE_2025",
    url: "https://1001.tl/m5qj71t",
  },
  {
    label: "Kölsch",
    slug: "yt-pLldXE5OyCM",
    name: "TL_KOLSCH_STREET_PARADE_2025",
    url: "https://1001.tl/1sftkmb9",
  },
  {
    label: "Massano",
    slug: "yt-fYM9DlFLwKw",
    name: "TL_MASSANO_STREET_PARADE_2025",
    url: "https://1001.tl/19jyprbt",
  },
  {
    label: "Adiel",
    slug: "yt-tuqAdrbkYZk",
    name: "TL_ADIEL_STREET_PARADE_2025",
    url: "https://1001.tl/2uwhr4bt",
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
        <h2 className="text-lg font-extrabold tracking-tight">
          Street Parade shortcuts
        </h2>
        <p className="text-[14px] text-muted">
          Copy a preset bookmarklet (slug already filled), open the 1001 link,
          then run it.
        </p>
        <ul className="divide-y divide-line border-y border-line">
          {STREET_PARADE.map((p) => (
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
                  Open 1001
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
