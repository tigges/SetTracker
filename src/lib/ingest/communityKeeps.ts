import type { RawPlay } from "./types";

export type CommunityKeep = {
  position: number;
  timestamp: number;
  trackTitle: string;
  artistName: string;
  idLabel: string | null;
  note: string | null;
};

function keepAsPlay(k: CommunityKeep, position: number): RawPlay {
  return {
    position,
    timestamp: k.timestamp,
    idStatus: "community_resolved",
    provenance: "community",
    trackTitle: k.trackTitle,
    artistName: k.artistName,
    idLabel: k.idLabel ?? `${k.artistName} - ID`,
    note: k.note ?? undefined,
    rawText: k.idLabel ?? undefined,
  };
}

/**
 * Re-attach community IDs after a tracklist refresh.
 *
 * Timestamp first: inserted resolutions (synthetic expected slots) sit at
 * max(position)+1, not the display index the suggester saw. Matching on
 * position would overwrite a different source cue once the set grows, or
 * drop the keep when the source has no row at that index.
 */
export function mergeCommunityKeeps(
  sourcePlays: RawPlay[],
  keeps: CommunityKeep[],
): RawPlay[] {
  if (keeps.length === 0) return sourcePlays;
  const merged = sourcePlays.map((p) => ({ ...p }));
  const used = new Set<number>();
  const extras: RawPlay[] = [];
  for (const k of keeps) {
    let idx = merged.findIndex(
      (p, i) => !used.has(i) && p.timestamp === k.timestamp,
    );
    if (idx < 0) {
      idx = merged.findIndex(
        (p, i) => !used.has(i) && p.position === k.position,
      );
    }
    if (idx >= 0) {
      used.add(idx);
      merged[idx] = keepAsPlay(k, merged[idx]!.position);
    } else {
      extras.push(keepAsPlay(k, k.position));
    }
  }
  return [...merged, ...extras]
    .sort((a, b) => a.timestamp - b.timestamp || a.position - b.position)
    .map((p, i) => ({ ...p, position: i + 1 }));
}
