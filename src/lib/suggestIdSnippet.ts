/**
 * The `data/resolutions.json` row a Suggest ID issue carries.
 *
 * Kept out of the component (and out of ingest/resolutions.ts, which imports
 * node:fs) so it is client-safe and testable. `timestamp` is required: set pages
 * renumber `position` for display, so applyResolutions matches on the clock, and
 * a snippet without it can address the wrong cue.
 */
export type SuggestIdSnippet = {
  setSlug: string;
  position: number;
  timestamp: number;
  trackTitle: string;
  artistName: string;
  suggestedBy: string;
};

export function buildSuggestIdSnippet(input: {
  setSlug: string;
  position: number;
  timestamp: number;
  artist: string;
  title: string;
}): SuggestIdSnippet {
  return {
    setSlug: input.setSlug,
    position: input.position,
    timestamp: input.timestamp,
    trackTitle: input.title.trim(),
    artistName: input.artist.trim(),
    suggestedBy: "suggest-id",
  };
}

export function suggestIdSnippetText(snippet: SuggestIdSnippet): string {
  return JSON.stringify(snippet, null, 2);
}

/** Clock-first issue title. Position is a display index and can name the wrong cue. */
export function suggestIdIssueTitle(input: {
  setSlug: string;
  timestamp: number;
  artist: string;
  title: string;
}): string {
  const clock = clockLabel(input.timestamp);
  return `ID suggest: ${input.setSlug} @${clock} → ${input.artist.trim()} – ${input.title.trim()}`;
}

function clockLabel(sec: number): string {
  const n = Math.max(0, Math.floor(sec));
  const h = Math.floor(n / 3600);
  const m = Math.floor((n % 3600) / 60);
  const s = n % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
