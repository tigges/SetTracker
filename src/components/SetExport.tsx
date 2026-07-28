"use client";

import { useMemo, useState } from "react";
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

const btn =
  "rounded-md border border-line px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Set-level export / open actions (CSV, M3U, text, Beatport & Spotify URL lists).
 * Uses identified plays when available; no OAuth — static-export safe.
 */
export function SetExport({
  plays,
  meta,
}: {
  plays: ExportPlay[];
  meta: ExportSetMeta;
}) {
  const [copied, setCopied] = useState(false);
  const rows = useMemo(() => exportablePlays(plays), [plays]);
  const base = slugifyFilename(meta.title || meta.slug);
  const disabled = rows.length === 0;

  async function copyPlain() {
    const text = buildTracklistPlain(plays);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      downloadText(`${base}.txt`, text, "text/plain;charset=utf-8");
    }
  }

  return (
    <section className="border-y border-line py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="eyebrow">Export / open</p>
          <p className="mt-1 max-w-xl text-[13px] text-muted2">
            Download the tracklist for Spotify import tools, Rekordbox (M3U), or
            Beatport link lists. Uses identified rows when present
            {rows.length > 0 ? ` · ${rows.length} tracks` : ""}.
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={disabled}
          className={btn}
          onClick={() =>
            downloadText(
              `${base}.csv`,
              buildTracklistCsv(plays, meta),
              "text/csv;charset=utf-8",
            )
          }
        >
          CSV
        </button>
        <button
          type="button"
          disabled={disabled}
          className={btn}
          title="M3U for Rekordbox / players (matches library by artist/title)"
          onClick={() =>
            downloadText(
              `${base}.m3u`,
              buildTracklistM3u(plays, meta),
              "audio/x-mpegurl;charset=utf-8",
            )
          }
        >
          M3U · Rekordbox
        </button>
        <button
          type="button"
          disabled={disabled}
          className={btn}
          title="Artist - Title lines for Spotify playlist importers"
          onClick={() =>
            downloadText(
              `${base}.txt`,
              buildTracklistPlain(plays),
              "text/plain;charset=utf-8",
            )
          }
        >
          Text · Spotify
        </button>
        <button
          type="button"
          disabled={disabled}
          className={btn}
          onClick={() => void copyPlain()}
        >
          {copied ? "Copied" : "Copy tracklist"}
        </button>
        <button
          type="button"
          disabled={disabled}
          className={btn}
          title="One Spotify search URL per track"
          onClick={() =>
            downloadText(
              `${base}-spotify-urls.txt`,
              buildSpotifySearchUrlList(plays),
              "text/plain;charset=utf-8",
            )
          }
        >
          Spotify URLs
        </button>
        <button
          type="button"
          disabled={disabled}
          className={btn}
          title="Beatport deep links when known, otherwise search URLs"
          onClick={() =>
            downloadText(
              `${base}-beatport-urls.txt`,
              buildBeatportUrlList(plays),
              "text/plain;charset=utf-8",
            )
          }
        >
          Beatport URLs
        </button>
      </div>
    </section>
  );
}
