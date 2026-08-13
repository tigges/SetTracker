/**
 * Client-safe atlas helpers — projection + filters. No JSON imports
 * (keeps the map bundle from pulling Node seed graphs).
 */

export type AtlasKind = "festival" | "club";

export type AtlasPin = {
  id: string;
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
  x: number;
  y: number;
  setCount: number;
  imageUrl: string | null;
  href: string | null;
};

export type AtlasTypeFilter = "both" | "festival" | "club";

export type AtlasFilter = {
  type: AtlasTypeFilter;
  q: string;
  country: string;
  city: string;
};

/** Web Mercator onto the 0..1000 land path used by WORLD_LAND_PATH. */
export function projectMercator(
  lon: number,
  lat: number,
): { x: number; y: number } {
  const clamped = Math.max(-83, Math.min(83, lat));
  const s = Math.sin((clamped * Math.PI) / 180);
  return {
    x: ((lon + 180) / 360) * 1000,
    y: (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * 1000,
  };
}

export function filterAtlasPins(
  pins: AtlasPin[],
  f: AtlasFilter,
): AtlasPin[] {
  const q = f.q.trim().toLowerCase();
  return pins.filter((p) => {
    if (f.type !== "both" && p.kind !== f.type) return false;
    if (f.country && p.country !== f.country) return false;
    if (f.city && p.city !== f.city) return false;
    if (!q) return true;
    const hay = `${p.name} ${p.loc} ${p.city} ${p.country}`.toLowerCase();
    return hay.includes(q);
  });
}

export function atlasCountries(pins: AtlasPin[]): string[] {
  return [...new Set(pins.map((p) => p.country))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function atlasCities(pins: AtlasPin[], country: string): string[] {
  if (!country) return [];
  return [
    ...new Set(pins.filter((p) => p.country === country).map((p) => p.city)),
  ].sort((a, b) => a.localeCompare(b));
}

export function chartKicker(kind: AtlasKind, rank: number): string {
  const poll = kind === "festival" ? "Festival" : "Club";
  return `${poll} · No. ${rank}`;
}
