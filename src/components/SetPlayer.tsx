"use client";

import { useState } from "react";
import { resolvePlaybackTarget } from "@/lib/playback";

/**
 * Collapsed-by-default on-site player for the original audio host.
 * No autoplay; falls back to outbound link when embed is unavailable.
 */
export function SetPlayer({
  playbackUrl,
  sourceUrl,
}: {
  playbackUrl?: string | null;
  sourceUrl?: string | null;
}) {
  const target = resolvePlaybackTarget(playbackUrl, { sourceUrl });
  const [open, setOpen] = useState(false);

  if (!target) return null;

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-line bg-panel">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-[12px] font-medium text-ink transition-colors hover:border-[color:var(--muted2)]"
        >
          <span aria-hidden>{open ? "▾" : "▶"}</span>
          {open ? "Hide player" : "Play on site"}
          <span className="text-muted2">· {target.label}</span>
        </button>
        <a
          href={target.openUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-[12px] text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
        >
          Open on {target.label} ↗
        </a>
      </div>

      {open && (
        <div className="border-t border-line bg-bg/40 px-2 pb-2 pt-2 sm:px-3">
          <iframe
            title={`${target.label} player`}
            src={target.embedSrc}
            width="100%"
            height={target.embedHeight}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full rounded-lg border-0"
          />
        </div>
      )}
    </div>
  );
}
