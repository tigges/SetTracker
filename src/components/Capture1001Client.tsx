"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  SEARCH_1001_RESULT,
  SEARCH_1001_TRACKLISTS,
  nativeCaptureSearchUrl,
  search1001Query,
  search1001QueryFromUrl,
} from "@/lib/search1001";

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

const SEARCH_BTN =
  "rounded-md border border-line bg-transparent px-2.5 py-1 text-[12px] font-bold text-ink";

/** 1001 search is POST /search/result.php — GET ?q= is their 404 page. */
function Search1001Button({
  query,
  onSearch,
}: {
  query: string;
  onSearch?: (q: string) => void;
}) {
  const q = query.trim();
  if (q.length < 2) return null;
  return (
    <form
      action={SEARCH_1001_RESULT}
      method="post"
      target="_blank"
      acceptCharset="utf-8"
      className="inline"
      onSubmit={() => onSearch?.(q)}
    >
      <input type="hidden" name="main_search" value={q} />
      <input type="hidden" name="search_selection" value={SEARCH_1001_TRACKLISTS} />
      <button type="submit" className={SEARCH_BTN}>
        Search 1001
      </button>
    </form>
  );
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

export function Capture1001Client(props: {
  presets: CapturePreset[];
  generatedAt?: string;
}) {
  const urlQ = useSearchParams().get("q") ?? "";
  return <Capture1001Workbench key={urlQ} initialQuery={urlQ} {...props} />;
}

function Capture1001Workbench({
  presets,
  generatedAt,
  initialQuery,
}: {
  presets: CapturePreset[];
  generatedAt?: string;
  initialQuery: string;
}) {
  const scriptUrl = useMemo(() => {
    if (typeof window === "undefined") return LIVE_SCRIPT;
    const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
    return `${window.location.origin}${base}/capture-1001tl.js`;
  }, []);

  const [query, setQuery] = useState(initialQuery);
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
  const findQuery = search1001Query(query.trim());

  async function onCopy(label: string, text: string) {
    const ok = await copyText(text);
    setStatus(ok ? `Copied ${label}` : `Copy failed — long-press the code below`);
  }

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-muted">
        Official playback is already in the catalog. First-party
        descriptions, timed comments, and ACR fingerprints fill clocks
        without 1001. Search 1001 POSTs their tracklist form (GET /search?q=
        is a 404) only for community overlays. Run the
        bookmarklet (or paste{" "}
        <span className="mono text-[11px] text-ink">
          scripts/capture-1001tl.console.js
        </span>
        {" / "}
        <span className="mono text-[11px] text-ink">
          scripts/capture-mixesdb.console.js
        </span>
        {" / "}
        <span className="mono text-[11px] text-ink">
          scripts/capture-applemusic.console.js
        </span>
        ). Apple Music mix times are segment lengths — accumulate, do not
        even-space. CI never fetches 1001, MixesDB, or Apple Music.
      </p>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          className="chip-ink rounded-md px-2.5 py-1 text-[12px] font-bold"
          onClick={() => onCopy("bookmarklet", generic)}
        >
          Copy bookmarklet
        </button>
        <a
          href={generic}
          className="rounded-md border border-line px-2.5 py-1 text-[12px] font-bold text-ink"
          onClick={(e) => {
            e.preventDefault();
            onCopy("bookmarklet", generic);
          }}
        >
          setradar 1001 capture
        </a>
      </div>
      <pre className="overflow-x-auto rounded-md border border-line bg-bg p-2 mono text-[10px] leading-relaxed text-muted2 whitespace-pre-wrap break-all">
        {generic}
      </pre>
      {status ? (
        <p className="mono text-[11px] text-brand">{status}</p>
      ) : null}

      <label className="block">
        <span className="sr-only">Filter queue</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by artist or set…"
          className="w-full rounded-md border border-line bg-bg px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-brand"
        />
      </label>
      {generatedAt ? (
        <p className="mono text-[11px] text-muted2">
          Queue built {generatedAt.slice(0, 16).replace("T", " ")} UTC
          {query.trim()
            ? ` · ${filtered.length} of ${presets.length}`
            : ` · ${presets.length}`}
        </p>
      ) : null}
      {filtered.length === 0 ? (
        <p className="text-[13px] text-muted">
          No queued gap matches “{query.trim()}”.{" "}
          {findQuery ? (
            <Search1001Button
              query={findQuery}
              onSearch={(q) => void onCopy("1001 search", q)}
            />
          ) : null}
        </p>
      ) : null}
      <ol className="divide-y divide-line border-y border-line">
        {filtered.map((p, i) => {
          const watch = watchFromPreset(p);
          return (
          <li
            key={p.slug}
            className="flex flex-col gap-1.5 py-1.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-ink">
                <span className="mono text-muted2 mr-1.5">{i + 1}.</span>
                {p.label}
              </div>
              <div className="mono truncate text-[11px] text-muted2">
                {p.slug}
                {p.reason ? ` · ${p.reason}` : ""}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {watch ? (
                <a
                  href={watch}
                  target="_blank"
                  rel="noreferrer"
                  className="chip-ink rounded-md px-2.5 py-1 text-[12px] font-bold"
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
                  className="rounded-md border border-line px-2.5 py-1 text-[12px] font-bold"
                >
                  Open 1001
                </a>
              ) : (
                <Search1001Button
                  query={
                    search1001QueryFromUrl(
                      nativeCaptureSearchUrl(p.searchUrl, p.label),
                    ) || search1001Query(p.label)
                  }
                  onSearch={(q) => void onCopy("1001 search", q)}
                />
              )}
              <button
                type="button"
                className="rounded-md border border-line px-2.5 py-1 text-[12px] font-bold"
                onClick={() => onCopy(p.label, bookmarkletFor(scriptUrl, p))}
              >
                Copy capture
              </button>
            </div>
          </li>
          );
        })}
      </ol>
    </div>
  );
}
