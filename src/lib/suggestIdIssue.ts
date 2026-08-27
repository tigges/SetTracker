/**
 * Turn a Suggest ID GitHub issue into a resolutions.json row.
 *
 * The static site cannot open a PR. The issue is the intake; Catalog
 * suggest-id-pr.yml commits the snippet and opens a review PR. Merge
 * publishes (verify-urls → applyResolutions). Close the PR to reject.
 */

import {
  buildSuggestIdSnippet,
  type SuggestIdSnippet,
} from "./suggestIdSnippet";

const SET_SLUG_RE = /^(yt|sc)-[A-Za-z0-9._-]+$/;
const TITLE_RE = /^ID suggest:/i;
const MAX_NAME = 200;

export function isSuggestIdIssueTitle(title: string): boolean {
  return TITLE_RE.test(title.trim());
}

export function parseSuggestIdIssueBody(
  body: string,
): SuggestIdSnippet | null {
  const fence = body.match(/```json\s*([\s\S]*?)```/i);
  if (!fence?.[1]) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(fence[1]);
  } catch {
    return null;
  }
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const setSlug = typeof row.setSlug === "string" ? row.setSlug.trim() : "";
  const artist =
    typeof row.artistName === "string" ? row.artistName.trim() : "";
  const title =
    typeof row.trackTitle === "string" ? row.trackTitle.trim() : "";
  const position =
    typeof row.position === "number" ? row.position : Number(row.position);
  const timestamp =
    typeof row.timestamp === "number" ? row.timestamp : Number(row.timestamp);
  if (!SET_SLUG_RE.test(setSlug)) return null;
  if (!Number.isInteger(position) || position <= 0) return null;
  if (!Number.isInteger(timestamp) || timestamp < 0) return null;
  if (!artist || !title) return null;
  if (artist.length > MAX_NAME || title.length > MAX_NAME) return null;
  return buildSuggestIdSnippet({
    setSlug,
    position,
    timestamp,
    artist,
    title,
  });
}

export type SuggestIdMergeStatus = "added" | "duplicate";

export function mergeSuggestIdRow<T extends SuggestIdSnippet>(
  rows: T[],
  incoming: SuggestIdSnippet,
): { rows: T[]; status: SuggestIdMergeStatus } {
  const dup = rows.some(
    (r) =>
      r.setSlug === incoming.setSlug && r.timestamp === incoming.timestamp,
  );
  if (dup) return { rows, status: "duplicate" };
  return { rows: [...rows, incoming as T], status: "added" };
}
