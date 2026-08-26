"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { captureDeferUntil } from "@/lib/ingest/captureDefer";
import {
  SEARCH_1001_RESULT,
  SEARCH_1001_TRACKLISTS,
  nativeCaptureSearchUrl,
  search1001Query,
  search1001QueryFromUrl,
} from "@/lib/search1001";

const LIVE_SCRIPT = "https://setradar.ai/capture-1001tl.js";

/** Per-browser parks. The committed defer file is the shared, durable one. */
const SNOOZE_KEY = "setradar.capture.snooze.v1";
const SNOOZE_EVENT = "setradar:capture-snooze";

/** Raw string snapshot keeps useSyncExternalStore referentially stable. */
function snoozeSnapshot(): string {
  try {
    return window.localStorage.getItem(SNOOZE_KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribeSnooze(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(SNOOZE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SNOOZE_EVENT, onChange);
  };
}

function parseSnooze(raw: string): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeSnoozeStore(next: Record<string, string>): void {
  try {
    window.localStorage.setItem(SNOOZE_KEY, JSON.stringify(next));
  } catch {
    // Private mode / full storage — the park just does not survive reload.
  }
  window.dispatchEvent(new Event(SNOOZE_EVENT));
}

function isSnoozeActive(until: string, nowMs = Date.now()): boolean {
  const at = Date.parse(
    /^\d{4}-\d{2}-\d{2}$/.test(until) ? `${until}T23:59:59.999Z` : until,
  );
  return Number.isFinite(at) && at > nowMs;
}

function activeSnoozeSlugs(store: Record<string, string>): Set<string> {
  const out = new Set<string>();
  for (const [slug, until] of Object.entries(store)) {
    if (isSnoozeActive(until)) out.add(slug);
  }
  return out;
}

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

  // Local parks apply immediately; commit data/capture-defer.json to share them.
  const snoozeRaw = useSyncExternalStore(
    subscribeSnooze,
    snoozeSnapshot,
    () => "",
  );
  const snoozed = useMemo(() => parseSnooze(snoozeRaw), [snoozeRaw]);

  const generic = bookmarkletFor(scriptUrl);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return presets;
    return presets.filter((p) =>
      `${p.label} ${p.slug} ${p.reason ?? ""} ${p.name}`
        .toLowerCase()
        .includes(q),
    );
  }, [presets, query]);
  const activeSnoozes = useMemo(() => activeSnoozeSlugs(snoozed), [snoozed]);
  const filtered = useMemo(
    () => matches.filter((p) => !activeSnoozes.has(p.slug)),
    [matches, activeSnoozes],
  );
  const parked = useMemo(
    () => matches.filter((p) => activeSnoozes.has(p.slug)),
    [matches, activeSnoozes],
  );
  const findQuery = search1001Query(query.trim());

  async function onCopy(label: string, text: string) {
    const ok = await copyText(text);
    setStatus(ok ? `Copied ${label}` : `Copy failed — long-press the code below`);
  }

  function onSnooze(p: CapturePreset) {
    const until = captureDeferUntil();
    writeSnoozeStore({ ...snoozed, [p.slug]: until });
    setStatus(`Parked ${p.label} until ${until} — Copy defer JSON to keep it`);
  }

  function onRestore(slug: string) {
    const next = { ...snoozed };
    delete next[slug];
    writeSnoozeStore(next);
  }

  async function onCopyDeferJson() {
    const rows = Object.entries(snoozed)
      .filter(([, until]) => isSnoozeActive(until))
      .map(([slug, until]) => {
        const preset = presets.find((p) => p.slug === slug);
        return {
          slug,
          until,
          note: preset
            ? `${preset.label} — no 1001 tracklist found yet.`
            : "Parked from /stats.",
        };
      })
      .sort((a, b) => a.slug.localeCompare(b.slug));
    await onCopy("defer JSON", JSON.stringify({ rows }, null, 2));
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
              <button
                type="button"
                className="rounded-md border border-amber/40 px-2.5 py-1 text-[12px] font-bold text-amber"
                title="No clear reading yet — park it and let the next candidate take this slot"
                onClick={() => onSnooze(p)}
              >
                Later
              </button>
            </div>
          </li>
          );
        })}
      </ol>

      {parked.length > 0 ? (
        <details className="rounded-md border border-amber/30 bg-amber/5 px-2 py-1.5">
          <summary className="cursor-pointer text-[12px] font-semibold text-ink">
            Parked for later{" "}
            <span className="mono text-muted2">({parked.length})</span>
          </summary>
          <p className="mt-1 text-[11px] leading-snug text-muted2">
            Hidden in this browser only, and they return on their own date. To
            park them for everyone — and free the slot in the built queue —
            copy the JSON and commit it into{" "}
            <span className="mono text-ink">data/capture-defer.json</span>.
          </p>
          <ul className="mt-1.5 divide-y divide-line border-y border-line">
            {parked.map((p) => (
              <li
                key={p.slug}
                className="flex items-baseline justify-between gap-2 py-1"
              >
                <div className="min-w-0">
                  <div className="truncate text-[13px] text-ink">{p.label}</div>
                  <div className="mono truncate text-[11px] text-muted2">
                    {p.slug} · back {snoozed[p.slug]}
                  </div>
                </div>
                <button
                  type="button"
                  className="mono shrink-0 text-[11px] text-brand hover:underline"
                  onClick={() => onRestore(p.slug)}
                >
                  restore
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-2 rounded-md border border-line px-2.5 py-1 text-[12px] font-bold"
            onClick={() => void onCopyDeferJson()}
          >
            Copy defer JSON
          </button>
        </details>
      ) : null}
    </div>
  );
}
