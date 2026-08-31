/**
 * Catalog DJ / festival / club dump for Claude completeness work.
 * Fill-null thumbs + official web/socials — never invent @slug handles.
 */

import { csvEscape } from "./exportTracks";
import { isWeakOfficialUrl } from "./officialUrls";

export type EntityKind = "dj" | "festival" | "club";

export type EntityNeedKey =
  | "imageUrl"
  | "website"
  | "instagram"
  | "youtube"
  | "soundcloud"
  | "twitter";

export type ExportEntityRow = {
  kind: EntityKind;
  slug: string;
  name: string;
  location: string | null;
  setCount: number;
  imageUrl: string | null;
  website: string | null;
  instagram: string | null;
  youtube: string | null;
  soundcloud: string | null;
  twitter: string | null;
};

export const ENTITY_CSV_HEADER =
  "kind,slug,name,location,setCount,needs,imageUrl,website,instagram,youtube,soundcloud,twitter";

export const CLAUDE_ENTITY_COMPLETE_PROMPT = `You are completing official artwork and URLs in the setradar catalog.

For each JSONL row, propose only the fields listed in "needs".
Return one JSON object per input row, same kind + slug.

Rules:
- Never invent an @slug from the setradar slug. Confirm the live profile is this DJ, club, or festival.
- website must be the official homepage — not DJ Mag, 6am, ClubTickets, Wikipedia, Grokipedia, an Insomniac artist hub, or a ticket reseller.
- A concrete Grokipedia / Wikipedia / Insomniac /music/artists/ URL already in hand may be followed for outbound first-party links, homeCity, distinctive bio, and canonical genre. Do not invent page titles or crawl those hosts. A page that names a different act is a miss.
- instagram / youtube / soundcloud / twitter must be first-party profiles (or official venue accounts). Not a fan page, not another catalog artist.
- imageUrl must be a stable public image: official-site Open Graph, Wikimedia Commons File path, or a press-kit URL. No DJ Mag screenshots. No guessed CDN paths. No data: URLs.
- Use null when unsure. confidence is high | medium | low.
- Do not invent 1001Tracklists URLs, ISRCs, or set cues.

Output JSONL:
{"kind":"dj","slug":"…","imageUrl":null,"website":null,"instagram":null,"youtube":null,"soundcloud":null,"twitter":null,"confidence":"low"}

Or CSV (one row per field):
kind,slug,name,field,value,evidence
Leave value empty when you cannot confirm. Do not invent a row to look complete.
`;

export function hasImage(row: Pick<ExportEntityRow, "imageUrl">): boolean {
  return Boolean(row.imageUrl?.trim());
}

export function hasOfficialWebsite(row: Pick<ExportEntityRow, "website">): boolean {
  const website = row.website?.trim();
  return Boolean(website) && !isWeakOfficialUrl(website);
}

export function hasSocial(
  row: Pick<ExportEntityRow, "instagram" | "youtube" | "soundcloud" | "twitter">,
): boolean {
  return Boolean(
    row.instagram?.trim() ||
      row.youtube?.trim() ||
      row.soundcloud?.trim() ||
      row.twitter?.trim(),
  );
}

/** Incomplete when art, official site, or any first-party social is missing. */
export function needsEntityComplete(row: ExportEntityRow): boolean {
  return !hasImage(row) || !hasOfficialWebsite(row) || !hasSocial(row);
}

export function entityNeedKeys(row: ExportEntityRow): EntityNeedKey[] {
  const needs: EntityNeedKey[] = [];
  if (!hasImage(row)) needs.push("imageUrl");
  if (!hasOfficialWebsite(row)) needs.push("website");
  if (!row.instagram?.trim()) needs.push("instagram");
  if (row.kind === "dj" && !row.youtube?.trim()) needs.push("youtube");
  if (!row.soundcloud?.trim()) needs.push("soundcloud");
  if (!row.twitter?.trim()) needs.push("twitter");
  return needs;
}

export function rowFromDj(d: {
  slug: string;
  name: string;
  homeCity?: string | null;
  setCount: number;
  imageUrl: string | null;
  website: string | null;
  instagram: string | null;
  youtube: string | null;
  soundcloud: string | null;
  twitter: string | null;
}): ExportEntityRow {
  return {
    kind: "dj",
    slug: d.slug,
    name: d.name,
    location: d.homeCity ?? null,
    setCount: d.setCount,
    imageUrl: d.imageUrl,
    website: d.website,
    instagram: d.instagram,
    youtube: d.youtube,
    soundcloud: d.soundcloud,
    twitter: d.twitter,
  };
}

export function rowFromEvent(e: {
  slug: string;
  name: string;
  kind: string | null;
  location?: string | null;
  setCount: number;
  imageUrl: string | null;
  website: string | null;
  instagram: string | null;
  soundcloud: string | null;
  twitter: string | null;
}): ExportEntityRow | null {
  if (e.kind !== "festival" && e.kind !== "club") return null;
  return {
    kind: e.kind,
    slug: e.slug,
    name: e.name,
    location: e.location ?? null,
    setCount: e.setCount,
    imageUrl: e.imageUrl,
    website: e.website,
    instagram: e.instagram,
    youtube: null,
    soundcloud: e.soundcloud,
    twitter: e.twitter,
  };
}

export function sortNeedComplete(rows: ExportEntityRow[]): ExportEntityRow[] {
  return rows
    .filter(needsEntityComplete)
    .sort(
      (a, b) =>
        b.setCount - a.setCount ||
        a.kind.localeCompare(b.kind) ||
        a.name.localeCompare(b.name),
    );
}

export function entitiesOfKind(
  rows: ExportEntityRow[],
  kind: EntityKind,
): ExportEntityRow[] {
  return rows.filter((row) => row.kind === kind);
}

export function entityToCsvRow(row: ExportEntityRow): string {
  return [
    csvEscape(row.kind),
    csvEscape(row.slug),
    csvEscape(row.name),
    csvEscape(row.location),
    csvEscape(row.setCount),
    csvEscape(entityNeedKeys(row).join("|")),
    csvEscape(row.imageUrl),
    csvEscape(row.website),
    csvEscape(row.instagram),
    csvEscape(row.youtube),
    csvEscape(row.soundcloud),
    csvEscape(row.twitter),
  ].join(",");
}

export function entitiesToCsv(rows: ExportEntityRow[]): string {
  return [ENTITY_CSV_HEADER, ...rows.map(entityToCsvRow)].join("\n") + "\n";
}

export function entityToClaudeJsonl(row: ExportEntityRow): string {
  return JSON.stringify({
    kind: row.kind,
    slug: row.slug,
    name: row.name,
    location: row.location,
    setCount: row.setCount,
    needs: entityNeedKeys(row),
    have: {
      imageUrl: row.imageUrl,
      website: row.website,
      instagram: row.instagram,
      youtube: row.youtube,
      soundcloud: row.soundcloud,
      twitter: row.twitter,
    },
  });
}

export function entitiesToClaudeJsonl(rows: ExportEntityRow[]): string {
  const need = sortNeedComplete(rows);
  return need.map(entityToClaudeJsonl).join("\n") + (need.length ? "\n" : "");
}
