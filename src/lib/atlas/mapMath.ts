/**
 * Client-safe atlas helpers — projection + filters. No JSON imports
 * (keeps the map bundle from pulling Node seed graphs).
 */

export type AtlasKind = "festival" | "club" | "dj";

export type AtlasPrec = "city" | "country";

export type AtlasPin = {
  id: string;
  kind: AtlasKind;
  rank: number;
  year: number;
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
  src: string | null;
  note: string | null;
  prec: AtlasPrec | null;
  nomap: boolean;
  x: number;
  y: number;
  setCount: number;
  imageUrl: string | null;
  href: string | null;
  instagram?: string | null;
  soundcloud?: string | null;
  youtube?: string | null;
};

export type AtlasTypeFilter = "all" | "festival" | "club" | "dj";

export type AtlasFilter = {
  type: AtlasTypeFilter;
  q: string;
  country: string;
  city: string;
};

/** Default world frame (SVG units). Must stay near the 0..1000 land path. */
export const ATLAS_INITIAL_VIEW = { cx: 500, cy: 430, span: 900 };

/** ViewBox `[x, y, w, h]` for a pane size. Span is width; height follows aspect. */
export function atlasViewBox(
  view: { cx: number; cy: number; span: number },
  width: number,
  height: number,
): [number, number, number, number] {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const span = Math.max(2.2, Math.min(1400, view.span));
  const spanY = span * (h / w);
  return [view.cx - span / 2, view.cy - spanY / 2, span, spanY];
}

export function viewBoxContains(
  vb: [number, number, number, number],
  x: number,
  y: number,
): boolean {
  return x >= vb[0] && x <= vb[0] + vb[2] && y >= vb[1] && y <= vb[1] + vb[3];
}

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
    if (f.type !== "all" && p.kind !== f.type) return false;
    if (f.country && p.country !== f.country) return false;
    if (f.city && p.city !== f.city) return false;
    if (!q) return true;
    const hay = `${p.name} ${p.loc} ${p.city} ${p.country} ${p.src ?? ""}`.toLowerCase();
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
    ...new Set(
      pins
        .filter((p) => p.country === country && p.city)
        .map((p) => p.city),
    ),
  ].sort((a, b) => a.localeCompare(b));
}

export function chartKicker(
  kind: AtlasKind,
  rank: number,
  year?: number,
): string {
  const poll =
    kind === "festival" ? "Festival" : kind === "club" ? "Club" : "DJ";
  const base = `${poll} · No. ${rank}`;
  return year != null ? `${base} · ${year}` : base;
}

export function atlasAccent(kind: AtlasKind): string {
  if (kind === "festival") return "var(--amber)";
  if (kind === "club") return "var(--teal)";
  return "var(--violet)";
}

export function atlasPinClass(kind: AtlasKind): string {
  return `atlas-pin-${kind}`;
}

/**
 * Country-level DJs share one centroid. Fan coincident points onto a
 * golden-angle spiral so each pin stays clickable.
 */
export function spreadCoincidentPins<T extends { x: number; y: number; nomap?: boolean }>(
  pins: T[],
): T[] {
  const bucket = new Map<string, T[]>();
  for (const p of pins) {
    if (p.nomap) continue;
    const key = `${p.x.toFixed(2)}/${p.y.toFixed(2)}`;
    const group = bucket.get(key);
    if (group) group.push(p);
    else bucket.set(key, [p]);
  }
  for (const group of bucket.values()) {
    if (group.length < 2) continue;
    group.forEach((p, i) => {
      const a = i * 2.399963;
      const rad = 1.2 * Math.sqrt(i);
      p.x += Math.cos(a) * rad;
      p.y += Math.sin(a) * rad;
    });
  }
  return pins;
}

export function flyToSpan(p: Pick<AtlasPin, "kind" | "prec" | "nomap">): number {
  if (p.kind === "dj" && p.prec === "country") return 240;
  return 80;
}
