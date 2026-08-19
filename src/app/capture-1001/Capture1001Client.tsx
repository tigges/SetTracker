"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const LIVE_SCRIPT = "https://setradar.ai/capture-1001tl.js";

export type CapturePreset = {
  label: string;
  slug: string;
  name: string;
  searchUrl: string;
  /** Known 1001 tracklist page (preferred over searchUrl when set). */
  tracklistUrl?: string;
  reason?: string;
  watchUrl?: string;
  host?: "youtube" | "soundcloud";
};

/** Official playback for a catalog slug. */
function watchFromPreset(p: CapturePreset): string {
  if (p.watchUrl) return p.watchUrl;
  if (p.slug.startsWith("yt-")) {
    return `https://www.youtube.com/watch?v=${p.slug.slice(3)}`;
  }
  return "";
}

function bookmarkletFor(scriptBase: string, preset?: CapturePreset): string {
  const qs = preset
    ? `?slug=${encodeURIComponent(preset.slug)}&name=${encodeURIComponent(preset.name)}&t=`
    : "?t=";
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

export function Capture1001Client({
  presets,
  generatedAt,
}: {
  presets: CapturePreset[];
  generatedAt?: string;
}) {
  const scriptUrl = useMemo(() => {
    if (typeof window === "undefined") return LIVE_SCRIPT;
    const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
    return `${window.location.origin}${base}/capture-1001tl.js`;
  }, []);

  const params = useSearchParams();
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const [status, setStatus] = useState<string>("");
  const generic = bookmarkletFor(scriptUrl);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return presets;
    return presets.filter((p) =>
      `${p.label} ${p.slug} ${p.reason ?? ""} ${p.name}`
        .toLowerCase()
        .includes(q),
    );
  }, [presets, query]);
  const find1001 = query.trim()
    ? `https://www.google.com/search?q=${encodeURIComponent(`${query.trim()} site:1001tracklists.com`)}`
    : "";

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
        <h2 className="text-lg font-extrabold tracking-tight">2. Open 1001 → capture</h2>
        <ol className="list-decimal space-y-2 pl-5 text-[14px] text-muted">
          <li>
            Confirm the official set is already on setradar (
            <span className="text-ink">Open YT</span> /{" "}
            <span className="text-ink">Open SC</span>).
          </li>
          <li>
            Open the known 1001 page (<span className="text-ink">Open 1001</span>
            ) or search (<span className="text-ink">Find 1001</span>).
          </li>
          <li>
            On that 1001 page, run the bookmarklet or paste{" "}
            <span className="mono text-[12px] text-ink">
              scripts/capture-1001tl.console.js
            </span>{" "}
            in DevTools.
          </li>
          <li>
            Overlay → <span className="text-ink">Copy seed</span> → commit under{" "}
            <span className="mono text-[12px] text-ink">
              src/lib/ingest/tracklists1001/
            </span>
            .
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold tracking-tight">
          Next{" "}
          {query.trim()
            ? `${filtered.length} of ${presets.length}`
            : presets.length}{" "}
          captures
        </h2>
        <p className="text-[14px] text-muted">
          Workbench only — YT/SC already in the catalog, 1001 seed still
          missing. Official playbacks and known 1001 URLs first. Wired slugs drop
          off automatically. CI never fetches 1001.
        </p>
        <label className="block">
          <span className="sr-only">Filter queue</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by artist or set…"
            className="w-full rounded-md border border-line bg-panel px-3 py-2 text-[14px] text-ink outline-none focus:border-brand"
          />
        </label>
        {generatedAt ? (
          <p className="mono text-[11px] text-muted2">
            Queue built {generatedAt.slice(0, 16).replace("T", " ")} UTC
          </p>
        ) : null}
        {filtered.length === 0 ? (
          <p className="text-[14px] text-muted">
            No queued gap matches “{query.trim()}”.{" "}
            {find1001 ? (
              <a
                href={find1001}
                target="_blank"
                rel="noreferrer"
                className="text-brand hover:underline"
              >
                Find 1001
              </a>
            ) : null}
          </p>
        ) : null}
        <ol className="divide-y divide-line border-y border-line">
          {filtered.map((p, i) => (
            <li
              key={p.slug}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="font-bold text-ink">
                  <span className="mono text-muted2 mr-2">{i + 1}.</span>
                  {p.label}
                </div>
                <div className="mono text-[11px] text-muted2">
                  {p.slug}
                  {p.reason ? ` · ${p.reason}` : ""}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {watchFromPreset(p) ? (
                  <a
                    href={watchFromPreset(p)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-ink px-3 py-2 text-[13px] font-bold text-bg"
                  >
                    {p.host === "soundcloud" || p.slug.startsWith("sc-")
                      ? "Open SC"
                      : "Open YT"}
                  </a>
                ) : null}
                {p.tracklistUrl ? (
                  <a
                    href={p.tracklistUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-line px-3 py-2 text-[13px] font-bold"
                  >
                    Open 1001
                  </a>
                ) : (
                  <a
                    href={p.searchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-line px-3 py-2 text-[13px] font-bold"
                  >
                    Find 1001
                  </a>
                )}
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
