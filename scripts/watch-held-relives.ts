/**
 * Report held 1001 seeds waiting on official playback, and queue Top 100
 * Tomorrowland Relives that are not yet curated.
 * Usage: npx tsx scripts/watch-held-relives.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { extractVideoId } from "../src/lib/ingest/youtube/client";
import { YOUTUBE_SETS } from "../src/lib/ingest/youtube/videos";
import { TRACKLIST_1001_BY_SOURCE_SLUG } from "../src/lib/ingest/tracklists1001/festival2026";
import { slugify } from "../src/lib/ingest/types";
import {
  buildLiveReliveWatch,
  reliveDedupeKey,
  type ReliveWatchReport,
} from "../src/lib/ingest/reliveWatch";
import { buildHeldReliveWatch } from "../src/lib/ingest/nextCaptures";

function curatedVideoIds(): Set<string> {
  const ids = new Set<string>();
  for (const s of YOUTUBE_SETS) {
    const id = extractVideoId(s.video);
    if (id) ids.add(id);
  }
  return ids;
}

function existingKeys(): Set<string> {
  const keys = new Set<string>();
  for (const s of YOUTUBE_SETS) {
    const k = reliveDedupeKey(s.title || "", slugify(s.primaryArtist.name));
    if (k) keys.add(k);
  }
  return keys;
}

async function main() {
  const curated = curatedVideoIds();
  const mapped = new Set(Object.keys(TRACKLIST_1001_BY_SOURCE_SLUG));
  let report: ReliveWatchReport;
  try {
    report = await buildLiveReliveWatch({
      curatedVideoIds: curated,
      mappedSlugs: mapped,
      existingKeys: existingKeys(),
    });
  } catch (err) {
    console.warn(
      "[held-relive] live playlist fetch failed, writing offline watch:",
      err instanceof Error ? err.message : err,
    );
    const offline = buildHeldReliveWatch();
    report = {
      generatedAt: offline.generatedAt,
      playlists: [],
      held: offline.held,
      unwiredOfficial: [],
    };
  }

  const outDir = join(process.cwd(), "data/crosscheck");
  mkdirSync(outDir, { recursive: true });
  const path = join(outDir, "held-relive-watch.json");
  writeFileSync(path, JSON.stringify(report, null, 2) + "\n");
  const waiting = report.held.filter((h) => h.status === "waiting").length;
  const ready = report.held.filter((h) => h.status === "candidate").length;
  console.log(
    `[held-relive] ${report.held.length} held (${ready} official playback found, ${waiting} still waiting)`,
  );
  for (const h of report.held) {
    const extra = h.youtubeUrl ? ` → ${h.youtubeUrl}` : "";
    console.log(`  - ${h.status} ${h.name} (${h.seed})${extra}`);
  }
  if (report.unwiredOfficial.length) {
    console.log(
      `[held-relive] ${report.unwiredOfficial.length} Top 100 Tomorrowland Relives not yet curated`,
    );
    for (const p of report.unwiredOfficial) {
      console.log(`  - ${p.slug}  ${p.label}`);
    }
  }
  console.log(`wrote ${path}`);
}

main();
