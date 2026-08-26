/**
 * Is this capture already wired?
 *
 * Usage:
 *   npm run check:capture -- <url-or-slug> [more...]
 *
 * Accepts 1001 tracklist URLs, YouTube watch/youtu.be URLs or bare video ids,
 * SoundCloud permalinks, or a raw yt-/sc- slug. utm_* query junk is fine.
 *
 * Answers before any capture work starts: which slug this resolves to, whether
 * a seed is already wired to it, how many cues that seed holds, and what the
 * URL archive says. Also catches the case where the 1001 page is already on
 * file under a *different* slug than the one you were about to wire.
 *
 * Reads committed files only — no network, no DB.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  formatCaptureLookup,
  lookupCapture,
  type CaptureArchiveRow,
} from "../src/lib/ingest/captureLookup";

function loadArchive(): CaptureArchiveRow[] {
  try {
    const d = JSON.parse(
      readFileSync(
        join(process.cwd(), "data/crosscheck/known-1001-urls.json"),
        "utf8",
      ),
    ) as Record<string, CaptureArchiveRow[] | undefined>;
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

function main(): void {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (!args.length) {
    console.log(
      "usage: npm run check:capture -- <1001-url | youtube-url | soundcloud-url | slug> [more...]",
    );
    process.exit(1);
  }
  const archive = loadArchive();
  let known = 0;
  for (const a of args) {
    const r = lookupCapture(a, archive);
    console.log(`\n${formatCaptureLookup(r)}`);
    if (r.alreadyOnFile) known += 1;
  }
  console.log(
    `\n${known}/${args.length} already on file. ${
      known === args.length
        ? "Nothing to capture."
        : "The rest look new — capture away."
    }`,
  );
}

main();
