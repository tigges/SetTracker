/**
 * First-party cue research.
 *
 * Re-parse YT / SoundCloud / hearthis descriptions (and hearthis playlist
 * tables) on empty or stub lists. Parser path works without an LLM key.
 * When a model is present it may propose extra clocks, but every `at`
 * string must already appear in that first-party text. Never interpolate.
 * Never overwrite 1001tl / fingerprint / community.
 *
 *   LLM_RESEARCH_JOBS=cues npm run research:handles
 *   LLM_RESEARCH_APPLY=0   dry-run (default for enrich full + workflow)
 *   LLM_CUE_LIMIT=16       max clocked stubs to process (not fetch budget)
 *
 * Queue: scan a wide stub window, rank live YT/hearthis ahead of radio,
 * skip radio-without-clocks so they do not consume the limit.
 */

import type { PrismaClient } from "@prisma/client";
import { detectPlaybackHost } from "../../playback";
import { fmtTimestamp } from "../../status";
import type { Provenance } from "../../status";
import { allocateTrackSlug, trackSlugBase } from "../../tracks/slug";
import { parseClockedTracklist } from "../soundcloud/parseTracklist";
import { resolveTrack } from "../soundcloud/client";
import {
  fetchTrackDetail,
  fetchTrackPlaylist,
  parseHearthisUrl,
} from "../hearthis/client";
import { playlistEntriesToPlays } from "../hearthis/playlist";
import { fetchWatchMeta } from "../youtube/client";
import { isFingerprintOnlyWatchUrl } from "../identify/fingerprintWatch";
import type { RawPlay } from "../types";
import {
  complete,
  detectLlmProvider,
  parseLlmJson,
  writeReport,
  type LlmProvider,
  type ResearchStats,
} from "./llmResearch";

const KEEP_PROVENANCE = new Set(["1001tl", "fingerprint", "community"]);
const SOURCE_PROVENANCE = new Set(["youtube", "soundcloud", "hearthis"]);

export type CueProposal = {
  at: string;
  artist?: string | null;
  title?: string | null;
};

export function clockStringInText(at: string, text: string): boolean {
  const raw = String(at || "").trim();
  if (!raw || raw.length < 3) return false;
  return text.includes(raw);
}

export function parseClockToSec(at: string): number | null {
  const raw = String(at || "").trim();
  const m = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  if (m[3] != null) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
  return Number(m[1]) * 60 + Number(m[2]);
}

/** LLM may only keep clocks whose `at` substring is already in the source text. */
export function filterProposedCues(
  proposals: CueProposal[] | null | undefined,
  sourceText: string,
  durationSec: number,
  provenance: Provenance,
): RawPlay[] {
  if (!proposals?.length || !sourceText.trim()) return [];
  const plays: RawPlay[] = [];
  for (const row of proposals) {
    if (!clockStringInText(row.at, sourceText)) continue;
    const sec = parseClockToSec(row.at);
    if (sec == null || sec < 0 || sec > durationSec) continue;
    const artist = String(row.artist || "").trim();
    const title = String(row.title || "").trim();
    if (!title) continue;
    if (artist && !sourceText.toLowerCase().includes(artist.toLowerCase())) {
      continue;
    }
    if (!sourceText.toLowerCase().includes(title.toLowerCase())) continue;
    const idish = /^id\b/i.test(title) || /^id\b/i.test(artist);
    plays.push({
      position: plays.length + 1,
      timestamp: sec,
      provenance,
      idStatus: idish ? "unresolved_id" : "identified",
      trackTitle: idish ? undefined : title,
      artistName: idish ? artist || undefined : artist || undefined,
      idLabel: idish ? `${artist || "ID"} - ${title || "ID"}` : undefined,
      rawText: `${row.at} ${artist} - ${title}`.trim(),
    });
  }
  return plays;
}

export function mergeClockedPlays(...lists: RawPlay[][]): RawPlay[] {
  const byTs = new Map<number, RawPlay>();
  for (const list of lists) {
    for (const play of list) {
      const key = Math.round(play.timestamp);
      if (byTs.has(key)) continue;
      byTs.set(key, play);
    }
  }
  return [...byTs.values()]
    .sort((a, b) => a.timestamp - b.timestamp || a.position - b.position)
    .map((p, i) => ({ ...p, position: i + 1 }));
}

export function isCueStub(plays: { provenance: string }[]): boolean {
  if (plays.some((p) => p.provenance === "1001tl")) return false;
  const sourceOnly = plays.filter((p) => !KEEP_PROVENANCE.has(p.provenance));
  return sourceOnly.length <= 4;
}

const RADIO_TITLE = /\b(radio|clapcast|one world radio)\b/i;

export type CueQueueSeed = {
  slug?: string;
  title: string;
  type?: string | null;
  playbackUrl?: string | null;
  sourceUrl?: string | null;
  publishedAt?: Date | null;
  eventKind?: string | null;
  seriesName?: string | null;
};

/** Title/slug fallback when Set.type is not `radio`. */
export function looksLikeCueRadioTitle(title: string, slug = ""): boolean {
  const hay = `${title} ${slug}`.replace(/[-_]+/g, " ");
  return RADIO_TITLE.test(hay);
}

export function isCueRadioSet(seed: CueQueueSeed): boolean {
  if ((seed.type || "").toLowerCase() === "radio") return true;
  if ((seed.eventKind || "").toLowerCase() === "radio") return true;
  if (/\bradio\b/i.test(seed.seriesName || "")) return true;
  return looksLikeCueRadioTitle(seed.title, seed.slug);
}

/** youtube 0 · hearthis 1 · soundcloud 2 · other 3 */
export function cueQueueHostRank(url: string | null | undefined): number {
  const host = detectPlaybackHost(url || "") ?? "";
  if (host === "youtube") return 0;
  if (host === "hearthis") return 1;
  if (host === "soundcloud") return 2;
  return 3;
}

export function firstPartyTextHasClocks(
  text: string,
  durationSec = 7200,
): boolean {
  return parseClockedTracklist(text, durationSec, "youtube").length > 0;
}

/** Live rooms + official playback first; weekly radio last. Newer within a class. */
export function compareCueQueueSeeds(a: CueQueueSeed, b: CueQueueSeed): number {
  const ar = isCueRadioSet(a) ? 1 : 0;
  const br = isCueRadioSet(b) ? 1 : 0;
  if (ar !== br) return ar - br;
  const ah = cueQueueHostRank(a.playbackUrl || a.sourceUrl);
  const bh = cueQueueHostRank(b.playbackUrl || b.sourceUrl);
  if (ah !== bh) return ah - bh;
  return (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0);
}

export async function fetchFirstPartyCueText(
  playbackUrl: string | null | undefined,
): Promise<{
  text: string;
  provenance: Provenance | null;
  plays: RawPlay[];
  durationSec: number;
} | null> {
  if (!playbackUrl) return null;
  const host = detectPlaybackHost(playbackUrl);
  if (!host || host === "mixcloud") return null;
  if (isFingerprintOnlyWatchUrl(playbackUrl)) return null;
  try {
    if (host === "youtube") {
      const meta = await fetchWatchMeta(playbackUrl);
      const text = meta.description || "";
      return {
        text,
        provenance: "youtube",
        plays: parseClockedTracklist(text, meta.durationSec, "youtube"),
        durationSec: meta.durationSec,
      };
    }
    if (host === "soundcloud") {
      const track = await resolveTrack(playbackUrl);
      const durationSec = Math.max(1, Number(track.duration || 0) / 1000 || 3600);
      const text = track.description || "";
      return {
        text,
        provenance: "soundcloud",
        plays: parseClockedTracklist(text, durationSec, "soundcloud"),
        durationSec,
      };
    }
    const parsed = parseHearthisUrl(playbackUrl);
    if (!parsed?.track) return null;
    const [detail, playlist] = await Promise.all([
      fetchTrackDetail(parsed.user, parsed.track),
      fetchTrackPlaylist(parsed.user, parsed.track).catch(() => []),
    ]);
    const durationSec = Math.max(1, Number(detail.duration || 0) || 3600);
    const description = detail.description || "";
    const fromPlaylist = playlistEntriesToPlays(playlist, durationSec);
    const fromDesc = parseClockedTracklist(description, durationSec, "hearthis");
    return {
      text: [description, fromPlaylist.map((p) => p.rawText).join("\n")]
        .filter(Boolean)
        .join("\n"),
      provenance: "hearthis",
      plays: mergeClockedPlays(fromPlaylist, fromDesc),
      durationSec,
    };
  } catch {
    return null;
  }
}

function emptyStats(provider: LlmProvider | null): ResearchStats {
  return {
    provider,
    scanned: 0,
    proposed: 0,
    applied: 0,
    rejected: 0,
    skippedNoKey: false,
  };
}

async function upsertCueTrack(
  prisma: PrismaClient,
  play: RawPlay,
  setGenre: string | null,
): Promise<string | null> {
  const title = play.trackTitle?.trim();
  const artistName = play.artistName?.trim();
  if (!title || !artistName) return null;
  const existing = await prisma.track.findFirst({
    where: { title, artistName },
    select: { id: true },
  });
  if (existing) return existing.id;
  const slug = await allocateTrackSlug(
    artistName,
    title,
    async (candidate) => {
      const hit = await prisma.track.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      return !!hit;
    },
    trackSlugBase(artistName, title),
  );
  const created = await prisma.track.create({
    data: {
      slug,
      title,
      artistName,
      genre: setGenre,
    },
  });
  return created.id;
}

async function applyCuePlays(
  prisma: PrismaClient,
  setId: string,
  incoming: RawPlay[],
  setGenre: string | null,
): Promise<number> {
  const existing = await prisma.played.findMany({
    where: { setId },
    select: {
      id: true,
      timestamp: true,
      provenance: true,
      idStatus: true,
      position: true,
    },
  });
  const keep = existing.filter((p) => KEEP_PROVENANCE.has(p.provenance));
  const dropIds = existing
    .filter((p) => !KEEP_PROVENANCE.has(p.provenance))
    .map((p) => p.id);
  const clash = (ts: number) =>
    keep.some((p) => Math.abs(p.timestamp - ts) < 15);

  const toWrite = incoming.filter((p) => !clash(p.timestamp));
  if (toWrite.length === 0) return 0;

  if (dropIds.length) {
    await prisma.played.deleteMany({ where: { id: { in: dropIds } } });
  }

  let position = keep.reduce((m, p) => Math.max(m, p.position), 0);
  let written = 0;
  for (const play of toWrite) {
    position += 1;
    const base = {
      setId,
      position,
      timestamp: play.timestamp,
      provenance: SOURCE_PROVENANCE.has(play.provenance)
        ? play.provenance
        : "youtube",
      idStatus: play.idStatus,
    };
    if (play.idStatus === "identified" && play.trackTitle && play.artistName) {
      const trackId = await upsertCueTrack(prisma, play, setGenre);
      await prisma.played.create({
        data: { ...base, trackId, rawText: play.rawText ?? null },
      });
      written += 1;
      continue;
    }
    if (play.idStatus === "unresolved_id") {
      const idTrack = await prisma.idTrack.create({
        data: {
          label: play.idLabel || "ID - ID",
          suspectedArtist: play.suspectedArtist ?? play.artistName ?? null,
          note: play.note ?? null,
          status: "unresolved",
        },
      });
      await prisma.played.create({
        data: {
          ...base,
          idTrackId: idTrack.id,
          rawText: play.idLabel ?? play.rawText ?? null,
        },
      });
      written += 1;
      continue;
    }
    await prisma.played.create({
      data: { ...base, rawText: play.rawText ?? null, idStatus: "unparsed" },
    });
    written += 1;
  }
  return written;
}

export async function runLlmCueResearch(
  prisma: PrismaClient,
  opts: { provider?: LlmProvider; limit?: number; reportTag?: string } = {},
): Promise<ResearchStats> {
  const provider = opts.provider ?? detectLlmProvider();
  const stats = emptyStats(provider);
  const apply = process.env.LLM_RESEARCH_APPLY !== "0";
  const limit = Math.max(
    1,
    opts.limit ?? Number(process.env.LLM_CUE_LIMIT || 16),
  );

  const windowSize = Math.max(limit * 40, 240);
  const probeBudget = Math.min(64, Math.max(limit * 4, 32));

  const sets = await prisma.set.findMany({
    where: {
      OR: [{ playbackUrl: { not: null } }, { sourceUrl: { not: null } }],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      durationSec: true,
      genre: true,
      playbackUrl: true,
      sourceUrl: true,
      publishedAt: true,
      event: { select: { kind: true } },
      series: { select: { name: true } },
      plays: { select: { provenance: true, timestamp: true, idStatus: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: windowSize,
  });

  const stubs = sets
    .filter((set) => isCueStub(set.plays))
    .filter((set) => !set.plays.some((p) => p.provenance === "1001tl"))
    .filter((set) => {
      const url = set.playbackUrl || set.sourceUrl;
      return !!url && !isFingerprintOnlyWatchUrl(url);
    })
    .map((set) => ({
      ...set,
      eventKind: set.event?.kind ?? null,
      seriesName: set.series?.name ?? null,
    }))
    .sort(compareCueQueueSeeds);

  const rows: unknown[] = [];
  const skipped: unknown[] = [];
  let skippedRadio = 0;
  let skippedNoClocks = 0;
  let skippedNoText = 0;
  let accepted = 0;
  let probes = 0;

  for (const set of stubs) {
    if (accepted >= limit) break;
    if (probes >= probeBudget) break;
    const url = set.playbackUrl || set.sourceUrl;
    if (!url) continue;
    probes += 1;
    stats.scanned += 1;

    const firstParty = await fetchFirstPartyCueText(url);
    if (!firstParty || firstParty.plays.length === 0) {
      stats.rejected += 1;
      const radio = isCueRadioSet(set);
      const reason = !firstParty
        ? "no first-party text"
        : radio
          ? "radio-no-clocks"
          : "no clocked cues in first-party text";
      if (radio) skippedRadio += 1;
      else if (!firstParty) skippedNoText += 1;
      else skippedNoClocks += 1;
      if (skipped.length < 24) {
        skipped.push({ slug: set.slug, reason });
      }
      continue;
    }

    accepted += 1;

    let extra: RawPlay[] = [];
    if (provider && firstParty.text.trim()) {
      try {
        const text = await complete(
          provider,
          `Extract timed cues that already appear in this first-party description.
Return ONLY JSON: {"cues":[{"at":"m:ss or h:mm:ss","artist":"… or null","title":"…"}]}
Rules: every "at" string must appear verbatim in the text. Never interpolate missing clocks. Never invent 1001 URLs. Empty list if unsure.
Set: ${set.title}
Text:
${firstParty.text.slice(0, 8000)}`,
        );
        const proposal = parseLlmJson(text) as { cues?: CueProposal[] } | null;
        extra = filterProposedCues(
          proposal?.cues,
          firstParty.text,
          firstParty.durationSec || set.durationSec,
          firstParty.provenance ?? "youtube",
        );
      } catch (err) {
        rows.push({
          slug: set.slug,
          accepted: 0,
          reason: err instanceof Error ? err.message : String(err),
        });
        stats.rejected += 1;
        continue;
      }
    }

    const merged = mergeClockedPlays(firstParty.plays, extra);
    if (merged.length === 0) {
      stats.rejected += 1;
      rows.push({
        slug: set.slug,
        accepted: 0,
        reason: "no clocked cues after verify",
      });
      continue;
    }
    stats.proposed += merged.length;

    let applied = 0;
    if (apply) {
      applied = await applyCuePlays(prisma, set.id, merged, set.genre);
      stats.applied += applied;
    }

    rows.push({
      slug: set.slug,
      title: set.title,
      host: detectPlaybackHost(url),
      parsed: firstParty.plays.length,
      llmKept: extra.length,
      accepted: merged.map((p) => ({
        at: fmtTimestamp(p.timestamp),
        artist: p.artistName ?? null,
        title: p.trackTitle ?? p.idLabel ?? null,
      })),
      applied,
      write: apply,
    });
  }

  const tag = opts.reportTag ? `-${opts.reportTag}` : "";
  writeReport(`llm-cue-research${tag}.json`, {
    generatedAt: new Date().toISOString(),
    provider,
    apply,
    note: "Parser re-reads first-party YT/SC/hearthis. LLM may add only clocks that already appear in that text. Never interpolates. Never overwrites 1001tl / fingerprint / community. Queue ranks live YT/hearthis ahead of radio; radio without clocks does not consume the limit.",
    window: sets.length,
    stubs: stubs.length,
    probed: probes,
    skippedRadio,
    skippedNoClocks,
    skippedNoText,
    skipped,
    rows,
  });
  console.log(
    `[llm-cues] provider=${provider ?? "parser"} scanned=${stats.scanned} proposed=${stats.proposed} applied=${stats.applied}` +
      ` probed=${probes} skippedRadio=${skippedRadio} skippedNoClocks=${skippedNoClocks}`,
  );
  return stats;
}
