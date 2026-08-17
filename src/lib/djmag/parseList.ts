/**
 * Parse a DJ Mag Top 100 list page (DJs / clubs / festivals) for one year.
 * Hrefs look like `/top100djs/2024/8/fisher`. Movement lives on
 * `.djm-26-card__movement--up|down|stay|new-entry`.
 */

export type DjMagChartKind = "dj" | "club" | "festival";

export type DjMagChartEntry = {
  year: number;
  rank: number;
  slug: string;
  name: string;
  change: string | null;
  inferred?: boolean;
};

const KIND_PATH: Record<DjMagChartKind, string> = {
  dj: "top100djs",
  club: "top100clubs",
  festival: "top100festivals",
};

export function djMagListPath(kind: DjMagChartKind): string {
  return KIND_PATH[kind];
}

export function djMagListUrl(kind: DjMagChartKind, year: number): string {
  return `https://djmag.com/${KIND_PATH[kind]}/${year}`;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&uuml;/g, "ü")
    .replace(/&iuml;/g, "ï")
    .replace(/&auml;/g, "ä")
    .replace(/&ouml;/g, "ö")
    .replace(/&eacute;/g, "é");
}

function titleFromSlug(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseMovement(block: string): string | null {
  if (/movement--new-entry/i.test(block)) return "New entry";
  if (/movement--stay/i.test(block)) return "Non-mover";
  const up = block.match(
    /movement--up[\s\S]{0,240}?movement-places[^>]*>\s*(\d+)/i,
  );
  if (up) return `Up ${up[1]}`;
  const down = block.match(
    /movement--down[\s\S]{0,240}?movement-places[^>]*>\s*(\d+)/i,
  );
  if (down) return `Down ${down[1]}`;
  return null;
}

function nameNearHref(
  html: string,
  href: string,
  slug: string,
): string {
  const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const title = html.match(
    new RegExp(
      `djm-26-card__title[\\s\\S]{0,200}?href=["']${escaped}["'][^>]*>\\s*([^<]{1,120})`,
      "i",
    ),
  );
  const raw = decodeEntities(title?.[1] ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (raw.length >= 2 && !/^\d+$/.test(raw)) return raw;
  return titleFromSlug(slug);
}

/** Prior-year rank from a DJ Mag movement label on the current rank. */
export function priorRankFromChange(
  rank: number,
  change: string | null | undefined,
): number | null {
  if (!change) return null;
  if (/new entry/i.test(change)) return null;
  if (/non-mover|stay/i.test(change)) return rank;
  const up = change.match(/^up\s+(\d+)/i);
  if (up) return rank + Number(up[1]);
  const down = change.match(/^down\s+(\d+)/i);
  if (down) {
    const prev = rank - Number(down[1]);
    return prev >= 1 ? prev : null;
  }
  return null;
}

/** Rare DJ Mag URL spellings that should join a later canonical slug. */
const SLUG_ALIASES: Record<string, string> = {
  "w-w": "ww",
};

/** DJ Mag chart slugs: decode `%26`, drop punctuation, lowercase. */
export function normalizeChartSlug(raw: string): string {
  let s = raw.trim();
  try {
    s = decodeURIComponent(s);
  } catch {
    /* keep raw */
  }
  const slug = s
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return SLUG_ALIASES[slug] ?? slug;
}

export function parseDjMagListHtml(
  html: string,
  kind: DjMagChartKind,
  year: number,
): DjMagChartEntry[] {
  const path = KIND_PATH[kind];
  const hrefRe = new RegExp(
    `/(${path})/${year}/(\\d{1,3})/([^"'\\s?#]+)`,
    "gi",
  );
  const first = new Map<number, { slug: string; href: string }>();
  for (const m of html.matchAll(hrefRe)) {
    const rank = Number(m[2]);
    const slug = normalizeChartSlug(m[3]!);
    if (!slug || rank < 1 || rank > 100 || first.has(rank)) continue;
    first.set(rank, { slug, href: m[0]! });
  }

  const cards = html.split(/<article\b/i);
  const changeByRank = new Map<number, string>();
  for (const card of cards) {
    const hm = card.match(
      new RegExp(`/${path}/${year}/(\\d{1,3})/[^"'\\s?#]+`, "i"),
    );
    if (!hm) continue;
    const rank = Number(hm[1]);
    const change = parseMovement(card);
    if (change && !changeByRank.has(rank)) changeByRank.set(rank, change);
  }

  const out: DjMagChartEntry[] = [];
  for (let rank = 1; rank <= 100; rank++) {
    const hit = first.get(rank);
    if (!hit) continue;
    out.push({
      year,
      rank,
      slug: hit.slug,
      name: nameNearHref(html, hit.href, hit.slug),
      change: changeByRank.get(rank) ?? null,
    });
  }
  return out;
}
