/**
 * DJ Mag Top 100 Clubs & Festivals 2026 — geocoded atlas seed.
 * Static JSON import (no node:fs) so Next static export stays NFT-safe.
 */

import raw from "../../../data/venue-seeds/djmag-atlas-2026.json";
import { projectMercator, type AtlasKind, type AtlasPin } from "./mapMath";

export type AtlasVenue = {
  kind: AtlasKind;
  rank: number;
  slug: string;
  chartSlug: string;
  name: string;
  city: string;
  country: string;
  loc: string;
  lat: number;
  lng: number;
  change: string;
  approx: boolean;
  djmagUrl?: string;
  website?: string;
};

type AtlasFile = {
  year?: number;
  venues?: AtlasVenue[];
};

const data = raw as AtlasFile;

export const ATLAS_YEAR = data.year ?? 2026;

export function loadAtlasVenues(): AtlasVenue[] {
  return data.venues ?? [];
}

let slugIndex: Map<string, AtlasVenue> | null = null;

/** Catalog slug and chart slug both resolve to the same row. */
export function atlasVenueBySlug(): Map<string, AtlasVenue> {
  if (slugIndex) return slugIndex;
  const out = new Map<string, AtlasVenue>();
  for (const v of loadAtlasVenues()) {
    out.set(v.slug, v);
    if (v.chartSlug && v.chartSlug !== v.slug) out.set(v.chartSlug, v);
  }
  slugIndex = out;
  return out;
}

export function lookupAtlasVenue(slug: string): AtlasVenue | null {
  const key = slug.trim();
  if (!key) return null;
  return atlasVenueBySlug().get(key) ?? null;
}

export function atlasPinsFromVenues(
  venues: AtlasVenue[],
  catalog: Map<
    string,
    { slug: string; setCount: number; imageUrl: string | null }
  >,
): AtlasPin[] {
  return venues.map((v) => {
    const ev = catalog.get(v.slug) ?? catalog.get(v.chartSlug);
    const { x, y } = projectMercator(v.lng, v.lat);
    return {
      id: `${v.kind}:${v.slug}`,
      kind: v.kind,
      rank: v.rank,
      slug: ev?.slug ?? v.slug,
      chartSlug: v.chartSlug,
      name: v.name,
      city: v.city,
      country: v.country,
      loc: v.loc,
      lat: v.lat,
      lng: v.lng,
      change: v.change,
      approx: v.approx,
      x,
      y,
      setCount: ev?.setCount ?? 0,
      imageUrl: ev?.imageUrl ?? null,
      href: ev ? `/events/${ev.slug}` : null,
    };
  });
}
