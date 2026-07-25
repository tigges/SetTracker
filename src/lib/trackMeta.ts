/**
 * Parse mix / remixer credits out of free-text track titles.
 * Keeps the original title intact for matching; fills optional Track fields.
 */

export type ParsedTrackTitle = {
  /** Original title unchanged (source of truth for matching). */
  title: string;
  mixName: string | null;
  remixerName: string | null;
};

const MIX_IN_PARENS =
  /\(([^)]*?\b(?:extended\s+mix|original\s+mix|radio\s+edit|radio\s+mix|club\s+mix|vip\s*mix|bootleg|edit|remix|version)[^)]*)\)/i;

const TRAILING_MIX =
  /\s[-–—]\s*((?:extended|original|radio|club|vip)\s+mix)\s*$/i;

const REMIX_IN_PARENS = /\(([^)]+?)\s+remix\)/i;

export function parseTrackTitle(title: string): ParsedTrackTitle {
  const trimmed = title.trim();
  let mixName: string | null = null;
  let remixerName: string | null = null;

  const remix = trimmed.match(REMIX_IN_PARENS);
  if (remix) {
    remixerName = cleanCredit(remix[1]);
    // "Artist Remix" often doubles as the mix label
    mixName = `${remixerName} Remix`;
  }

  const parenMix = trimmed.match(MIX_IN_PARENS);
  if (parenMix) {
    const inner = cleanCredit(parenMix[1]);
    if (!/remix/i.test(inner) || !mixName) mixName = inner;
  } else {
    const trail = trimmed.match(TRAILING_MIX);
    if (trail) mixName = cleanCredit(trail[1]);
  }

  return { title: trimmed, mixName, remixerName };
}

function cleanCredit(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** Beatport search URL (not canonical). Prefer Track.beatportUrl when set. */
export function beatportSearchUrl(title: string, artistName?: string | null): string {
  const q = encodeURIComponent([artistName, title].filter(Boolean).join(" ").trim());
  return `https://www.beatport.com/search?q=${q}`;
}
