/**
 * Wishlist intake for a DJ who is not in the catalog yet.
 * Same channel as Suggest ID: a prefilled GitHub issue. No auto-PR —
 * a missing artist is a producer call (roster / pin / ingest), not a
 * resolutions.json row.
 */

import { OPERATOR_REPO } from "./site";
import { normalizeWishlistSlug } from "./wishlist";

export const SUGGEST_DJ_TITLE_PREFIX = "DJ suggest:";
const MAX_NAME = 80;
const MAX_NOTE = 400;

export type SuggestDjDraft = {
  name: string;
  soundcloud?: string;
  youtube?: string;
  note?: string;
};

export type CatalogDjMatch = {
  slug: string;
  name: string;
};

export function trimSuggestDjName(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}

export function suggestDjSlug(name: string): string {
  return normalizeWishlistSlug(trimSuggestDjName(name));
}

export function isSuggestDjReady(draft: SuggestDjDraft): boolean {
  const name = trimSuggestDjName(draft.name);
  const slug = suggestDjSlug(name);
  return name.length >= 2 && name.length <= MAX_NAME && slug.length >= 2;
}

export function matchCatalogDj(
  name: string,
  catalog: ReadonlyArray<{ slug: string; name: string }>,
): CatalogDjMatch | null {
  const slug = suggestDjSlug(name);
  if (!slug) return null;
  const bySlug = catalog.find((d) => d.slug === slug);
  if (bySlug) return { slug: bySlug.slug, name: bySlug.name };
  const folded = trimSuggestDjName(name).toLowerCase();
  const byName = catalog.find(
    (d) => d.name.replace(/\s+/g, " ").trim().toLowerCase() === folded,
  );
  return byName ? { slug: byName.slug, name: byName.name } : null;
}

export function buildSuggestDjIssue(draft: SuggestDjDraft): {
  title: string;
  body: string;
  url: string;
} {
  const name = trimSuggestDjName(draft.name);
  const slug = suggestDjSlug(name);
  const sc = draft.soundcloud?.trim() ?? "";
  const yt = draft.youtube?.trim() ?? "";
  const note = (draft.note ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_NOTE);
  const title = `${SUGGEST_DJ_TITLE_PREFIX} ${name}`;
  const body = [
    `## New DJ suggestion`,
    ``,
    `- **Name:** ${name}`,
    `- **Suggested slug:** \`${slug}\``,
    `- **SoundCloud:** ${sc || "—"}`,
    `- **YouTube:** ${yt || "—"}`,
    note ? `- **Note:** ${note}` : `- **Note:** —`,
    ``,
    `From /wishlist. Not in the catalog at export time.`,
    `Do not invent handles or 1001 URLs — verify first-party profiles before pinning.`,
  ].join("\n");
  const q = new URLSearchParams();
  q.set("title", title);
  q.set("body", body);
  return {
    title,
    body,
    url: `https://github.com/${OPERATOR_REPO}/issues/new?${q.toString()}`,
  };
}
