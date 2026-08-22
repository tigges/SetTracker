/**
 * One listing contract: a set is listable iff it has a page, and every
 * consumer card / `/sets/{slug}` link is the surviving host twin.
 * Display collapse is a safety net — remaps should fold the DB row.
 */

import { collapseHostTwins } from "./feedQuality";

export { collapseHostTwins };

export function listableSets<
  T extends {
    id: string;
    slug?: string;
    title: string;
    primaryDjSlug?: string | null;
    primaryDj?: { slug?: string | null } | null;
    eventSlug?: string | null;
    publishedAt: Date | string;
    durationSec: number;
    trackCount?: number | null;
    densitySeverity?: "ok" | "thin" | "severe" | null;
    sourceName?: string | null;
    dominantProvenance?: string | null;
  },
>(sets: T[]): T[] {
  return collapseHostTwins(sets);
}
