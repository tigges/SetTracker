/**
 * DJ Mag Top 100 Clubs & Festivals 2026 + DJs 2025 — geocoded atlas seed.
 * Static JSON import (no node:fs) so Next static export stays NFT-safe.
 */

import venueRaw from "../../../data/venue-seeds/djmag-atlas-2026.json";
import djRaw from "../../../data/artist-seeds/djmag-atlas-djs-2025.json";
import {
  projectMercator,
  spreadCoincidentPins,
  type AtlasKind,
  type AtlasPin,
  type AtlasPrec,
} from "./mapMath";

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

export type AtlasDj = {
  rank: number;
  slug: string;
  name: string;
  city: string;
  country: string;
  src: string;
  lat: number;
  lng: number;
  prec: AtlasPrec | null;
  note: string | null;
  nomap: boolean;
  djmagUrl?: string;
  website?: string;
};

type VenueFile = {
  year?: number;
  venues?: AtlasVenue[];
};

type DjFile = {
  year?: number;
  djs?: AtlasDj[];
};

const venues = venueRaw as VenueFile;
const djs = djRaw as DjFile;

export const ATLAS_YEAR = venues.year ?? 2026;
export const ATLAS_DJ_YEAR = djs.year ?? 2025;

export function loadAtlasVenues(): AtlasVenue[] {
  return venues.venues ?? [];
}

export function loadAtlasDjs(): AtlasDj[] {
  return djs.djs ?? [];
}

let slugIndex: Map<string, AtlasVenue> | null = null;
let djSlugIndex: Map<string, AtlasDj> | null = null;

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

export function atlasDjBySlug(): Map<string, AtlasDj> {
  if (djSlugIndex) return djSlugIndex;
  const out = new Map<string, AtlasDj>();
  for (const d of loadAtlasDjs()) out.set(d.slug, d);
  djSlugIndex = out;
  return out;
}

export function lookupAtlasDj(slug: string): AtlasDj | null {
  const key = slug.trim();
  if (!key) return null;
  return atlasDjBySlug().get(key) ?? null;
}

type CatalogRow = { slug: string; setCount: number; imageUrl: string | null };

export function atlasPinsFromVenues(
  rows: AtlasVenue[],
  catalog: Map<string, CatalogRow>,
): AtlasPin[] {
  return rows.map((v) => {
    const ev = catalog.get(v.slug) ?? catalog.get(v.chartSlug);
    const { x, y } = projectMercator(v.lng, v.lat);
    return {
      id: `${v.kind}:${v.slug}`,
      kind: v.kind,
      rank: v.rank,
      year: ATLAS_YEAR,
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
      src: null,
      note: null,
      prec: null,
      nomap: false,
      x,
      y,
      setCount: ev?.setCount ?? 0,
      imageUrl: ev?.imageUrl ?? null,
      href: ev ? `/events/${ev.slug}` : null,
    };
  });
}

export function atlasPinsFromDjs(
  rows: AtlasDj[],
  catalog: Map<string, CatalogRow>,
): AtlasPin[] {
  return rows.map((d) => {
    const ev = catalog.get(d.slug);
    const { x, y } = projectMercator(d.lng, d.lat);
    const loc = d.city ? `${d.city}, ${d.country}` : d.country;
    return {
      id: `dj:${d.slug}`,
      kind: "dj",
      rank: d.rank,
      year: ATLAS_DJ_YEAR,
      slug: ev?.slug ?? d.slug,
      chartSlug: d.slug,
      name: d.name,
      city: d.city,
      country: d.country,
      loc,
      lat: d.lat,
      lng: d.lng,
      change: "",
      approx: d.prec === "country",
      src: d.src || null,
      note: d.note,
      prec: d.prec,
      nomap: d.nomap,
      x,
      y,
      setCount: ev?.setCount ?? 0,
      imageUrl: ev?.imageUrl ?? null,
      href: ev ? `/djs/${ev.slug}` : null,
    };
  });
}

export function atlasPins(
  venueRows: AtlasVenue[],
  djRows: AtlasDj[],
  events: Map<string, CatalogRow>,
  catalogDjs: Map<string, CatalogRow>,
): AtlasPin[] {
  return spreadCoincidentPins([
    ...atlasPinsFromVenues(venueRows, events),
    ...atlasPinsFromDjs(djRows, catalogDjs),
  ]);
}
