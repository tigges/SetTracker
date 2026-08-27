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
