"use client";

import { useState } from "react";
import {
  buildSuggestIdSnippet,
  suggestIdIssueTitle,
  suggestIdSnippetText,
} from "@/lib/suggestIdSnippet";
import { soundsLikeLine } from "@/lib/publishPlays";

/**
 * Community ID wedge for the static site: open a prefilled GitHub issue
 * (workflow turns it into a review PR), or copy the resolutions.json snippet
 * for anyone without an account.
 *
 * No email option. `mailto:` with no recipient just opens a blank compose window,
 * so it looked like a working channel while sending nothing anywhere. Restore it
 * only with a real inbox behind it.
 *
 * The panel is position-fixed on purpose: the tracklist card is overflow-hidden,
 * which clipped an absolutely-positioned dropdown on rows near the bottom of a
 * long playlist — on mobile the actions were unreachable.
 *
 * Applied resolutions are merged at build time (see applyResolutions), which
 * matches on `timestamp` because set pages renumber `position` for display.
 */
export function SuggestIdButton({
  setSlug,
  position,
  timestamp,
  currentLabel,
  suggestedArtist,
  suggestedTitle,
  confirmHint,
  actionLabel: actionLabelProp,
}: {
  setSlug: string;
  position: number;
  timestamp: number;
  currentLabel: string;
  suggestedArtist?: string | null;
  suggestedTitle?: string | null;
  confirmHint?: boolean;
  actionLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [artist, setArtist] = useState(suggestedArtist ?? "");
  const [title, setTitle] = useState(suggestedTitle ?? "");
  const like = soundsLikeLine(suggestedArtist, suggestedTitle);
  const actionLabel =
    actionLabelProp ?? (confirmHint ? "Confirm ID" : "Suggest ID");
  const [copied, setCopied] = useState(false);

  const ready = Boolean(artist.trim() && title.trim());
  // timestamp is what applyResolutions matches on, so the copied snippet is
  // committable as-is; position alone can address the wrong cue.
  const snippetText = suggestIdSnippetText(
    buildSuggestIdSnippet({ setSlug, position, timestamp, artist, title }),
  );

  const issueUrl = (() => {
    const q = new URLSearchParams();
    q.set(
      "title",
      suggestIdIssueTitle({
        setSlug,
        timestamp,
        artist,
        title,
      }),
    );
    q.set(
      "body",
      [
        `## ID suggestion`,
        ``,
        `- **Set:** \`${setSlug}\``,
        `- **Timestamp:** ${timestamp}s (match key)`,
        `- **Position:** ${position} (display index only)`,
        `- **Current row:** ${currentLabel}`,
        `- **Suggested:** ${artist.trim()} – ${title.trim()}`,
        ``,
        `### resolutions.json entry`,
        "```json",
        snippetText,
        "```",
      ].join("\n"),
    );
    return `https://github.com/tigges/SetTracker/issues/new?${q.toString()}`;
  })();

  async function copySnippet() {
    if (!ready) return;
    try {
      await navigator.clipboard.writeText(snippetText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="relative flex-none" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-line px-1.5 py-0.5 text-[10px] text-muted2 transition-colors hover:border-brand hover:text-brand"
        title={
          confirmHint
            ? like
              ? `Confirm ${suggestedArtist!.trim()} — ${suggestedTitle!.trim()}`
              : "Confirm or correct this suggested ID"
            : "Suggest an ID for this row"
        }
      >
        {actionLabel}
      </button>
      {open && (
        <>
          {/* Tap-outside close. Also stops the row's play-from-cue handler. */}
          <button
            type="button"
            aria-label="Close ID suggestion"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-bg/70"
          />
          {/* Fixed, not absolute: the tracklist card clips overflow, which hid
              this panel on rows near the bottom. Bottom sheet on mobile so the
              actions stay in reach; small centred panel from sm up. */}
          <div className="fixed inset-x-3 bottom-3 z-50 rounded-lg border border-line bg-panel p-2.5 shadow-lg sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-56 sm:-translate-x-1/2 sm:-translate-y-1/2">
          <p className="mb-2 text-[11px] text-muted">
            {confirmHint
              ? like
                ? `${like} — confirm or correct for `
                : "Confirm this suggested release for "
              : "Suggest a release for "}
            <span className="text-ink">{currentLabel}</span>
            . Opens a review PR — merge to publish, close to reject.
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
          {/* Both actions are top level — the old nested "Advanced" fold pushed
              them below the clip and made them untappable on mobile. */}
          <div className="flex flex-col gap-1.5">
            <a
              href={ready ? issueUrl : undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!ready}
              className={`rounded-md px-2 py-1 text-center text-[11px] font-semibold ${
                ready
                  ? "bg-brand text-bg hover:opacity-90"
                  : "pointer-events-none bg-linesoft text-muted2"
              }`}
              onClick={(e) => {
                if (!ready) e.preventDefault();
              }}
            >
              Send for review
            </a>
            <button
              type="button"
              disabled={!ready}
              onClick={() => void copySnippet()}
              className={`rounded-md border border-line px-2 py-1 text-center text-[11px] ${
                ready
                  ? "text-ink hover:border-brand"
                  : "cursor-not-allowed text-muted2"
              }`}
            >
              {copied ? "Copied JSON" : "Copy JSON"}
            </button>
            <button
              type="button"
              className="text-[10px] text-muted hover:text-ink"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
          </div>
        </>
      )}
    </div>
  );
}
