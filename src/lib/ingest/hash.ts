import { createHash } from "crypto";
import type { RawPlay, RawSet } from "./types";

/** Stable hash of the source-derived tracklist payload (not community edits). */
export function hashRawSetContent(raw: Pick<RawSet, "title" | "durationSec" | "plays" | "sourceUrl">): string {
  const plays = raw.plays.map((p) => playFingerprint(p)).join("\n");
  const basis = [raw.title, String(raw.durationSec), raw.sourceUrl ?? "", plays].join("|");
  return createHash("sha256").update(basis).digest("hex").slice(0, 32);
}

function playFingerprint(p: RawPlay): string {
  return [
    p.position,
    p.timestamp,
    p.idStatus,
    p.trackTitle ?? "",
    p.artistName ?? "",
    p.idLabel ?? "",
    p.rawText ?? "",
  ].join(":");
}
