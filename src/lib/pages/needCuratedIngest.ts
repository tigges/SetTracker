/**
 * Pages ship never polls. Catalog-deep crawls; enrich fingerprints.
 * `ingest=force` is the only Pages re-poll. Path helpers stay so
 * operators can see which files *would* have tripped the old auto path.
 */

export type CuratedIngestMode = "auto" | "skip" | "force";

/** Paths whose edits can introduce new sets on the curated-only ingest. */
export const CURATED_INGEST_PATHS: RegExp[] = [
  /^prisma\/ingest\.ts$/,
  /^src\/lib\/ingest\/ingest\.ts$/,
  /^src\/lib\/ingest\/sources\.ts$/,
  /^src\/lib\/ingest\/resolutions\.ts$/,
  /^src\/lib\/ingest\/roster\.ts$/,
  /^src\/lib\/ingest\/festivalDrops\.ts$/,
  /^src\/lib\/ingest\/topDjs\.ts$/,
  /^src\/lib\/ingest\/artists\.ts$/,
  /^src\/lib\/ingest\/nextCaptures\.ts$/,
  /^src\/lib\/ingest\/(soundcloud|youtube|hearthis|bandcamp|djmag|tracklists1001|fingerprint|insomniac|boilerroom)\//,
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

  // Ship is restore + export. Catalog-deep polls; enrich fingerprints.
  // `ingest=force` is the only way a Pages job re-crawls.
  if (opts.eventName === "workflow_dispatch" || opts.eventName === "push") {
    return {
      run: false,
      reason:
        opts.eventName === "push"
          ? "push ships cached catalog (catalog-deep polls)"
          : "workflow_dispatch uses cached catalog (no curated re-poll)",
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
