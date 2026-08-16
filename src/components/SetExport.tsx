"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildBeatportUrlList,
  buildSpotifySearchUrlList,
  buildTracklistCsv,
  buildTracklistM3u,
  buildTracklistPlain,
  exportablePlays,
  slugifyFilename,
  type ExportPlay,
  type ExportSetMeta,
} from "@/lib/playlistExport";
import { placeRightAlignedPopover } from "@/lib/popoverPlace";

function downloadText(filename: string, body: string, mime: string) {
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const MENU_WIDTH = 240;

const itemClass =
  "flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-[13px] text-muted transition-colors hover:bg-panel2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Set-level export / open actions (CSV, M3U, text, Beatport & Spotify URL lists).
 * Single button + menu. Uses identified plays when available; no OAuth.
 */
export function SetExport({
  plays,
  meta,
}: {
  plays: ExportPlay[];
  meta: ExportSetMeta;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const rows = useMemo(() => exportablePlays(plays), [plays]);
  const base = slugifyFilename(meta.title || meta.slug);
  const disabled = rows.length === 0;

  function placeMenu() {
    const el = root.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos(
      placeRightAlignedPopover({
        trigger: { bottom: rect.bottom, right: rect.right },
        menuWidth: MENU_WIDTH,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      }),
    );
  }

  function toggle() {
    if (disabled) return;
    if (open) {
      setOpen(false);
      return;
    }
    placeMenu();
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onMove() {
      placeMenu();
    }
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function run(fn: () => void) {
    fn();
    setOpen(false);
  }

  async function copyPlain() {
    const text = buildTracklistPlain(plays);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      downloadText(`${base}.txt`, text, "text/plain;charset=utf-8");
    }
    setOpen(false);
  }

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Export tracklist"
        disabled={disabled}
        onClick={toggle}
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-[12px] text-muted transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span>{copied ? "Copied" : "Export"}</span>
        <span aria-hidden className="text-[10px] text-muted2">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open && pos ? (
        <div
          role="menu"
          style={{
            top: pos.top,
            left: pos.left,
            width: pos.width,
            maxHeight: pos.maxHeight,
          }}
          className="fixed z-30 overflow-y-auto rounded-xl border border-line bg-panel p-1.5 shadow-lg shadow-black/40 scroll-thin"
        >
          <p className="px-2.5 py-1.5 text-[11px] text-muted2">
            Identified rows
            {rows.length > 0 ? ` · ${rows.length} tracks` : ""}
          </p>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() =>
              run(() =>
                downloadText(
                  `${base}.csv`,
                  buildTracklistCsv(plays, meta),
                  "text/csv;charset=utf-8",
                ),
              )
            }
          >
            CSV
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            title="M3U for Rekordbox / players (matches library by artist/title)"
            onClick={() =>
              run(() =>
                downloadText(
                  `${base}.m3u`,
                  buildTracklistM3u(plays, meta),
                  "audio/x-mpegurl;charset=utf-8",
                ),
              )
            }
          >
            M3U · Rekordbox
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            title="Artist - Title lines for Spotify playlist importers"
            onClick={() =>
              run(() =>
                downloadText(
                  `${base}.txt`,
                  buildTracklistPlain(plays),
                  "text/plain;charset=utf-8",
                ),
              )
            }
          >
            Text · Spotify
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => void copyPlain()}
          >
            Copy tracklist
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            title="One Spotify search URL per track"
            onClick={() =>
              run(() =>
                downloadText(
                  `${base}-spotify-urls.txt`,
                  buildSpotifySearchUrlList(plays),
                  "text/plain;charset=utf-8",
                ),
              )
            }
          >
            Spotify URLs
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            title="Beatport deep links when known, otherwise search URLs"
            onClick={() =>
              run(() =>
                downloadText(
                  `${base}-beatport-urls.txt`,
                  buildBeatportUrlList(plays),
                  "text/plain;charset=utf-8",
                ),
              )
            }
          >
            Beatport URLs
          </button>
        </div>
      ) : null}
    </div>
  );
}
