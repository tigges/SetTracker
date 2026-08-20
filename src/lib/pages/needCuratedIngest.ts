/**
 * Pages push is restore + export. Light curated YT/SC *poll* runs only
 * when fetch adapters / roster seeds changed. 1001 clocks and name-folds
 * overlay in verify-urls (no 20-min YouTube walk). Catalog-deep crawls;
 * enrich fingerprints. Dispatch from those producers never re-polls.
 * `ingest=force` is the manual Pages re-poll.
 */

export type CuratedIngestMode = "auto" | "skip" | "force";

/**
 * Paths that can introduce *new* sets that are not already in the cached DB.
 * Overlay-only files (1001 captures, fingerprint pastes, artist-name tidy)
 * must not live here — they apply in verify-urls.
 */
export const CURATED_INGEST_PATHS: RegExp[] = [
  /^prisma\/ingest\.ts$/,
  /^src\/lib\/ingest\/ingest\.ts$/,
  /^src\/lib\/ingest\/sources\.ts$/,
  /^src\/lib\/ingest\/resolutions\.ts$/,
  /^src\/lib\/ingest\/roster\.ts$/,
  /^src\/lib\/ingest\/topDjs\.ts$/,
  /^src\/lib\/ingest\/(soundcloud|youtube|hearthis|bandcamp|djmag|insomniac|boilerroom)\//,
];

export function normalizeRepoPath(path: string): string {
  return path.replace(/^\.\//, "").replace(/\\/g, "/");
}

export function fileNeedsCuratedIngest(path: string): boolean {
  const p = normalizeRepoPath(path);
  if (p.endsWith(".test.ts")) return false;
  return CURATED_INGEST_PATHS.some((re) => re.test(p));
}

export function parseCuratedIngestMode(raw: string | undefined): CuratedIngestMode {
  const mode = (raw || "auto").trim().toLowerCase();
  if (mode === "skip" || mode === "force") return mode;
  return "auto";
}

export function decideCuratedIngest(opts: {
  eventName: string;
  mode?: string;
  changedFiles: string[];
  hasPreviousSha?: boolean;
}): { run: boolean; reason: string } {
  const mode = parseCuratedIngestMode(opts.mode);
  if (mode === "force") {
    return { run: true, reason: "ingest=force" };
  }
  if (mode === "skip") {
    return { run: false, reason: "ingest=skip" };
  }

  // Deep/enrich dispatch must not re-poll — they already wrote the DB cache.
  if (opts.eventName === "workflow_dispatch") {
    return {
      run: false,
      reason: "workflow_dispatch uses cached catalog (no curated re-poll)",
    };
  }

  const hits = opts.changedFiles.filter(fileNeedsCuratedIngest);
  if (hits.length) {
    const shown = hits.slice(0, 8).join(", ");
    const extra = hits.length > 8 ? ` (+${hits.length - 8} more)` : "";
    return {
      run: true,
      reason: `catalog sources changed: ${shown}${extra}`,
    };
  }

  return {
    run: false,
    reason: "no catalog source changes; skip curated YouTube/SoundCloud poll",
  };
}
