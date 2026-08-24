/**
 * Same-performance host twins (SC / YT / Mixcloud).
 *
 * Share timed 1001 / MixesDB / Apple Music clocks when durations match.
 * Never interpolate, never rescale, never copy ACR fingerprint offsets
 * (those belong to one audio file).
 */

import type { SetHostUrls } from "../playback";
import { extraHostUrlsBySlug } from "./setHostUrls";
import { SET_SOURCE_REMAPS } from "./sourceRemaps";
import { TRACKLIST_1001_BY_SOURCE_SLUG } from "./tracklists1001/festival2026";
import { isSecondaryPlaybackSlug } from "./tracklists1001/seeds";

export const SHAREABLE_TRACKLIST_PROVENANCE = new Set([
  "1001tl",
  "mixesdb",
  "applemusic",
]);

const MIN_SHARE_DURATION_SEC = 20 * 60;
const MIN_DURATION_RATIO = 0.9;

/** Same edit — not a 60m radio cut vs a 90m festival playback. */
export function durationsCompatible(a: number, b: number): boolean {
  if (a < MIN_SHARE_DURATION_SEC || b < MIN_SHARE_DURATION_SEC) return false;
  return Math.min(a, b) / Math.max(a, b) >= MIN_DURATION_RATIO;
}

export function shareablePlayCount(
  plays: Array<{ provenance: string }>,
): number {
  return plays.filter((p) => SHAREABLE_TRACKLIST_PROVENANCE.has(p.provenance))
    .length;
}

export function shouldCopyTwinTracklist(
  donor: { durationSec: number; shareable: number },
  recipient: { durationSec: number; shareable: number },
): boolean {
  return (
    donor.shareable >= 12 &&
    recipient.shareable < donor.shareable &&
    durationsCompatible(donor.durationSec, recipient.durationSec)
  );
}

function unionSlugGroups(groups: string[][]): string[][] {
  const parent = new Map<string, string>();
  const find = (slug: string): string => {
    const p = parent.get(slug) ?? slug;
    if (p !== slug) {
      const root = find(p);
      parent.set(slug, root);
      return root;
    }
    parent.set(slug, slug);
    return slug;
  };
  const union = (a: string, b: string) => {
    const pa = find(a);
    const pb = find(b);
    if (pa !== pb) parent.set(pa, pb);
  };
  for (const group of groups) {
    const first = group[0];
    if (!first) continue;
    for (let i = 1; i < group.length; i++) union(first, group[i]!);
  }
  const buckets = new Map<string, string[]>();
  for (const slug of parent.keys()) {
    const root = find(slug);
    const list = buckets.get(root) ?? [];
    list.push(slug);
    buckets.set(root, list);
  }
  return [...buckets.values()].filter((g) => g.length > 1);
}

/** Curated 1001 twins + remaps + catalog rows that share a host URL. */
export function twinSlugGroupsFromCatalog(
  rows: Array<{
    slug: string;
    soundcloudUrl?: string | null;
    youtubeUrl?: string | null;
    mixcloudUrl?: string | null;
  }>,
): string[][] {
  const groups: string[][] = [];
  const bySeed = new Map<object, string[]>();
  for (const [slug, seed] of Object.entries(TRACKLIST_1001_BY_SOURCE_SLUG)) {
    if (!seed?.length) continue;
    const list = bySeed.get(seed) ?? [];
    list.push(slug);
    bySeed.set(seed, list);
  }
  for (const slugs of bySeed.values()) {
    if (slugs.length > 1) groups.push(slugs);
  }
  for (const remap of SET_SOURCE_REMAPS) {
    groups.push([remap.fromSlug, remap.toSlug]);
  }
  const byHost = new Map<string, string[]>();
  for (const row of rows) {
    for (const [kind, url] of [
      ["sc", row.soundcloudUrl],
      ["yt", row.youtubeUrl],
      ["mc", row.mixcloudUrl],
    ] as const) {
      if (!url) continue;
      const key = `${kind}:${url}`;
      const list = byHost.get(key) ?? [];
      list.push(row.slug);
      byHost.set(key, list);
    }
  }
  for (const slugs of byHost.values()) {
    const unique = [...new Set(slugs)];
    if (unique.length > 1) groups.push(unique);
  }
  return unionSlugGroups(groups);
}

export type HostTwinFoldCandidate = {
  fromSlug: string;
  toSlug: string;
  hosts: SetHostUrls;
};

function seedSlugGroups(): string[][] {
  const bySeed = new Map<object, string[]>();
  for (const [slug, seed] of Object.entries(TRACKLIST_1001_BY_SOURCE_SLUG)) {
    if (!seed?.length) continue;
    const list = bySeed.get(seed) ?? [];
    list.push(slug);
    bySeed.set(seed, list);
  }
  return [...bySeed.values()].filter((g) => g.length > 1);
}

/**
 * Official YT + SC twins that share one 1001 seed object and already
 * have both permalinks. Never invents a missing host.
 */
export function hostTwinFoldCandidatesFromSeeds(
  extras = extraHostUrlsBySlug(),
): HostTwinFoldCandidate[] {
  const out: HostTwinFoldCandidate[] = [];
  const seen = new Set<string>();
  for (const slugs of seedSlugGroups()) {
    const survivors = slugs.filter((s) => !isSecondaryPlaybackSlug(s));
    const secondaries = slugs.filter((s) => isSecondaryPlaybackSlug(s));
    const toSlug =
      survivors.find((s) => s.startsWith("yt-")) ?? survivors[0] ?? null;
    if (!toSlug || secondaries.length === 0) continue;
    const hosts = extras[toSlug] ?? extras[secondaries[0]!] ?? {};
    if (!hosts.youtubeUrl || !hosts.soundcloudUrl) continue;
    for (const fromSlug of secondaries) {
      const key = `${fromSlug}→${toSlug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ fromSlug, toSlug, hosts });
    }
  }
  return out;
}

/** SC/hearthis slug that should land on an existing official YT survivor. */
export function survivorSlugForSecondary(slug: string): string | null {
  if (!isSecondaryPlaybackSlug(slug)) return null;
  return (
    hostTwinFoldCandidatesFromSeeds().find((c) => c.fromSlug === slug)?.toSlug ??
    null
  );
}
