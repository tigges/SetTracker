"use client";

import { useState } from "react";

/**
 * Minimal community ID wedge for the static site:
 * - Collect a suggested artist/title for an unresolved/unparsed row
 * - Open a prefilled GitHub issue for maintainers
 * - Show a resolutions.json snippet to paste into data/resolutions.json
 *
 * Applied resolutions are merged at ingest/build time (see applyResolutions).
 */
export function SuggestIdButton({
  setSlug,
  position,
  timestamp,
  currentLabel,
}: {
  setSlug: string;
  position: number;
  timestamp: number;
  currentLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");

  const snippet = {
    setSlug,
    position,
    trackTitle: title.trim(),
    artistName: artist.trim(),
    suggestedBy: "github-issue",
  };

  const issueUrl = (() => {
    const q = new URLSearchParams();
    q.set(
      "title",
      `ID suggest: ${setSlug} #${position} → ${artist.trim()} – ${title.trim()}`,
    );
    q.set(
      "body",
      [
        `## ID suggestion`,
        ``,
        `- **Set:** \`${setSlug}\``,
        `- **Position:** ${position}`,
        `- **Timestamp:** ${timestamp}s`,
        `- **Current row:** ${currentLabel}`,
        `- **Suggested:** ${artist.trim()} – ${title.trim()}`,
        ``,
        `### resolutions.json entry`,
        "```json",
        JSON.stringify(snippet, null, 2),
        "```",
        ``,
        `Paste into \`data/resolutions.json\` and redeploy to apply.`,
      ].join("\n"),
    );
    return `https://github.com/tigges/SetTracker/issues/new?${q.toString()}`;
  })();

  return (
    <div className="relative flex-none" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-line px-1.5 py-0.5 text-[10px] text-muted2 transition-colors hover:border-brand hover:text-brand"
        title="Suggest an ID for this row"
      >
        Suggest ID
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-64 rounded-lg border border-line bg-panel p-3 shadow-lg">
          <p className="mb-2 text-[11px] text-muted">
            Suggest a release for{" "}
            <span className="text-ink">{currentLabel}</span>
          </p>
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted2">
            Artist
            <input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="mt-0.5 w-full rounded-md border border-line bg-bg px-2 py-1 text-[12px] text-ink outline-none focus:border-brand"
              placeholder="AC Slater"
            />
          </label>
          <label className="mb-2 block text-[10px] uppercase tracking-wider text-muted2">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-0.5 w-full rounded-md border border-line bg-bg px-2 py-1 text-[12px] text-ink outline-none focus:border-brand"
              placeholder="Rampage"
            />
          </label>
          <div className="flex items-center gap-1.5">
            <a
              href={artist.trim() && title.trim() ? issueUrl : undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!artist.trim() || !title.trim()}
              className={`flex-1 rounded-md px-2 py-1 text-center text-[11px] font-semibold ${
                artist.trim() && title.trim()
                  ? "bg-brand text-bg hover:opacity-90"
                  : "cursor-not-allowed bg-linesoft text-muted2"
              }`}
              onClick={(e) => {
                if (!artist.trim() || !title.trim()) e.preventDefault();
              }}
            >
              Open issue
            </a>
            <button
              type="button"
              className="rounded-md border border-line px-2 py-1 text-[11px] text-muted hover:text-ink"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
