/**
 * Server-only: committed 1001 URL archive (no network).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

export function loadKnown1001ArchiveRows(): Array<{
  slug?: string;
  tracklistUrl?: string;
  label?: string;
  name?: string;
  youtubeUrl?: string;
  soundcloudUrl?: string;
  note?: string;
}> {
  try {
    const d = JSON.parse(
      readFileSync(
        join(process.cwd(), "data/crosscheck/known-1001-urls.json"),
        "utf8",
      ),
    ) as {
      urls?: Array<{ slug?: string; tracklistUrl?: string }>;
      heldPendingPlayback?: Array<{ slug?: string; tracklistUrl?: string }>;
      pendingCuePaste?: Array<{ slug?: string; tracklistUrl?: string }>;
      stillMissing1001?: Array<{ slug?: string; tracklistUrl?: string }>;
    };
    return [
      ...(d.urls ?? []),
      ...(d.heldPendingPlayback ?? []),
      ...(d.pendingCuePaste ?? []),
      ...(d.stillMissing1001 ?? []),
    ];
  } catch {
    return [];
  }
}
