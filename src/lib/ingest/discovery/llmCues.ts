/**
 * First-party cue extract for empty / stub tracklists.
 *
 * Order:
 *   1) Re-parse the host description / comments / hearthis playlist.
 *   2) If the regex parser is empty, an LLM may propose [clock, artist, title].
 *   3) Verify-then-write: a clock must already appear in the source text;
 *      artist + title tokens must appear. Never interpolate or invent clocks.
 *
 * Never: 1001 URLs, overwrite 1001tl / fingerprint / community, or treat
 * description lines as a published Tracklist.
 */

import type { PrismaClient } from "@prisma/client";
import { collapseConsecutivePlays, playCollapseKey } from "../../playCollapse";
import { allocateTrackSlug, trackSlugBase } from "../../tracks/slug";
import { isFingerprintOnlyWatchUrl } from "../identify/fingerprintWatch";
import {
  formatHearthisCue,
  playlistEntriesToPlays,
} from "../hearthis/playlist";
import {
  asInt,
  fetchTrackDetail,
  fetchTrackPlaylist,
  parseHearthisUrl,
} from "../hearthis/client";
import {
  fetchTrackComments,
  resolveTrack,
} from "../soundcloud/client";
import {
  mergeTracklistSignals,
  parseDescriptionTracklist,
  parseTimedComments,
} from "../soundcloud/parseTracklist";
import type { RawPlay } from "../types";
import { extractVideoId, fetchWatchMeta } from "../youtube/client";
import type { Provenance } from "../../status";
import {
  complete,
  detectLlmProvider,
  parseLlmJson,
  writeReport,
  type LlmProvider,
  type ResearchStats,
} from "./llmResearch";

export type CueProposal = {
  at?: string | null;
  artist?: string | null;
  title?: string | null;
};

export type EvaluatedCue = {
  ok: boolean;
  timestamp?: number;
  artist?: string;
  title?: string;
  reason: string;
};

const CLOCK_RE = /(?:^|[^\d])(\d{1,2}):(\d{2})(?::(\d{2}))?(?!\d)/g;

const STOP = new Set([
  "the",
  "and",
  "feat",
  "mix",
  "remix",
  "edit",
  "original",
  "extended",
  "radio",
  "club",
]);

const JUNK_TITLE = /^(id|unknown|tbd|n\/?a|untitled|track)$/i;

export function parseCueClock(raw: string | null | undefined): number | null {
  const text = String(raw || "").trim();
  if (!text) return null;
  const m = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const a = Number(m[1]);
  const b = Number(m[2]);
  const c = m[3] != null ? Number(m[3]) : null;
  if (b > 59 || (c != null && c > 59)) return null;
  if (c != null) return a * 3600 + b * 60 + c;
  return a * 60 + b;
}

export function extractSourceClocks(sourceText: string): number[] {
  const out: number[] = [];
  const seen = new Set<number>();
  const text = String(sourceText || "");
  CLOCK_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = CLOCK_RE.exec(text))) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    const c = m[3] != null ? Number(m[3]) : null;
    if (b > 59 || (c != null && c > 59)) continue;
    const sec = c != null ? a * 3600 + b * 60 + c : a * 60 + b;
    if (seen.has(sec)) continue;
    seen.add(sec);
    out.push(sec);
  }
  return out;
}

export function clockInSource(sourceText: string, sec: number): boolean {
  return extractSourceClocks(sourceText).includes(sec);
}

export function foldCueText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\((?:feat\.?|ft\.?|remix|edit|mix|vip)[^)]*\)/gi, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function significantTokens(s: string): string[] {
  return foldCueText(s)
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOP.has(t));
}

export function tokensAppearInSource(
  sourceText: string,
  value: string,
): boolean {
  const hay = foldCueText(sourceText);
  if (!hay) return false;
  const toks = significantTokens(value);
  if (!toks.length) {
    const compact = foldCueText(value);
    return compact.length >= 2 && hay.includes(compact);
  }
  return toks.every((t) => hay.includes(t));
}

export function parseCueProposalJson(raw: unknown): CueProposal[] {
  if (!raw) return [];
  const root = raw as { cues?: unknown; tracks?: unknown };
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(root.cues)
      ? root.cues
      : Array.isArray(root.tracks)
        ? root.tracks
        : [];
  const out: CueProposal[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const at = row.at ?? row.timestamp ?? row.time ?? row.cue;
    const artist = row.artist ?? row.artistName;
    const title = row.title ?? row.track ?? row.name;
    out.push({
      at: at == null ? null : String(at),
      artist: artist == null ? null : String(artist),
      title: title == null ? null : String(title),
    });
  }
  return out;
}

export function evaluateCueProposal(
  sourceText: string,
  proposal: CueProposal,
): EvaluatedCue {
  const artist = String(proposal.artist || "").replace(/\s+/g, " ").trim();
  const title = String(proposal.title || "").replace(/\s+/g, " ").trim();
  if (!title) return { ok: false, reason: "empty title" };
  if (JUNK_TITLE.test(title) && !artist) {
    return { ok: false, reason: "placeholder title" };
  }
  if (/https?:\/\//i.test(`${artist} ${title}`)) {
    return { ok: false, reason: "url in name" };
  }
  if (/1001tracklists|1001\.tl/i.test(`${artist} ${title} ${proposal.at ?? ""}`)) {
    return { ok: false, reason: "never invent or accept 1001 cues" };
  }
  if (!tokensAppearInSource(sourceText, title)) {
    return { ok: false, reason: "title not in source" };
  }
  if (artist && !tokensAppearInSource(sourceText, artist)) {
    return { ok: false, reason: "artist not in source" };
  }
  const clockRaw = String(proposal.at || "").trim();
  if (!clockRaw) {
    return { ok: false, reason: "untimed — report only, never interpolate" };
  }
  const sec = parseCueClock(clockRaw);
  if (sec == null) return { ok: false, reason: "unparseable clock" };
  if (!clockInSource(sourceText, sec)) {
    return { ok: false, reason: "clock not in source" };
  }
  return {
    ok: true,
    timestamp: sec,
    artist: artist || undefined,
    title,
    reason: "verified against source",
  };
}

export function evaluateCueList(
  sourceText: string,
  proposals: CueProposal[],
): { accepted: EvaluatedCue[]; rejected: EvaluatedCue[] } {
  const accepted: EvaluatedCue[] = [];
  const rejected: EvaluatedCue[] = [];
  const seen = new Set<string>();
  for (const p of proposals) {
    const ev = evaluateCueProposal(sourceText, p);
    if (!ev.ok) {
      rejected.push(ev);
      continue;
    }
    const key = `${ev.timestamp}|${foldCueText(ev.artist ?? "")}|${foldCueText(ev.title ?? "")}`;
    if (seen.has(key)) {
      rejected.push({ ok: false, reason: "duplicate cue" });
      continue;
    }
    seen.add(key);
    accepted.push(ev);
  }
  return { accepted, rejected };
}

export function setAllowsCueWrite(opts: {
  sourceName?: string | null;
  sourceUrl?: string | null;
  playbackUrl?: string | null;
  plays: { provenance: string; idStatus?: string }[];
}): { ok: boolean; reason: string } {
  const name = opts.sourceName ?? "";
  if (/1001tracklists|1001\.tl/i.test(name)) {
    return { ok: false, reason: "published tracklist source" };
  }
  const urls = [opts.sourceUrl, opts.playbackUrl].filter(Boolean) as string[];
  if (urls.some((u) => isFingerprintOnlyWatchUrl(u))) {
    return { ok: false, reason: "fingerprint-only fan clip" };
  }
  if (opts.plays.some((p) => /^(1001tl|fingerprint|community)$/.test(p.provenance))) {
    return { ok: false, reason: "has confirmed plays" };
  }
  if (opts.plays.some((p) => p.idStatus && p.idStatus !== "unparsed")) {
    return { ok: false, reason: "has a published list" };
  }
  if (opts.plays.length > 2) {
    return { ok: false, reason: "not an empty/stub list" };
  }
  return { ok: true, reason: "empty or stub" };
}

export type FirstPartyHost = "youtube" | "soundcloud" | "hearthis";

export function hostFromSetUrl(url: string): FirstPartyHost | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com") {
      return "youtube";
    }
    if (host === "soundcloud.com") return "soundcloud";
    if (host === "hearthis.at") return "hearthis";
    return null;
  } catch {
    return null;
  }
}

export type FirstPartySource = {
  host: FirstPartyHost;
  text: string;
  durationSec: number;
  parsed: RawPlay[];
};

function provenanceFor(host: FirstPartyHost): Provenance {
  return host;
}

export async function loadFirstPartySource(
  url: string,
  fallbackDurationSec: number,
): Promise<FirstPartySource | null> {
  const host = hostFromSetUrl(url);
  if (!host) return null;
  const durationFallback = Math.max(0, fallbackDurationSec || 0);

  if (host === "youtube") {
    if (!extractVideoId(url)) return null;
    const meta = await fetchWatchMeta(url);
    const creditLines = meta.musicCredits
      .map((c) => `${c.artistName} - ${c.title}`)
      .filter((l) => l.replace(/[- ]/g, "").length > 0)
      .join("\n");
    const text = [meta.description, creditLines].filter(Boolean).join("\n\n");
    const durationSec = meta.durationSec || durationFallback;
    const parsed = parseDescriptionTracklist(
      meta.description,
      durationSec,
      "youtube",
    ).filter((p) => clockInSource(meta.description, p.timestamp));
    return { host, text, durationSec, parsed };
  }

  if (host === "soundcloud") {
    const track = await resolveTrack(url);
    const durationSec =
      Math.round((track.full_duration || track.duration || 0) / 1000) ||
      durationFallback;
    let comments: { body?: string; timestamp?: number | null }[] = [];
    try {
      comments = await fetchTrackComments(track.id, 80);
    } catch {
      comments = [];
    }
    const text = [track.description, ...comments.map((c) => c.body)]
      .filter(Boolean)
      .join("\n");
    const fromDesc = parseDescriptionTracklist(
      track.description,
      durationSec,
      "soundcloud",
    ).filter((p) => clockInSource(track.description ?? "", p.timestamp));
    const parsed = mergeTracklistSignals(
      fromDesc,
      parseTimedComments(comments, durationSec, 1, "soundcloud"),
    );
    return { host, text, durationSec, parsed };
  }

  const path = parseHearthisUrl(url);
  if (!path?.track) return null;
  const detail = await fetchTrackDetail(path.user, path.track);
  const durationSec = asInt(detail.duration) || durationFallback;
  let playlistText = "";
  let fromPlaylist: RawPlay[] = [];
  try {
    const entries = await fetchTrackPlaylist(path.user, path.track);
    fromPlaylist = playlistEntriesToPlays(entries, durationSec);
    playlistText = entries
      .map((e) => {
        const line = (e.text ?? "").trim();
        if (!line) return "";
        return `${formatHearthisCue(asInt(e.start))} ${line}`;
      })
      .filter(Boolean)
      .join("\n");
  } catch {
    fromPlaylist = [];
  }
  const text = [detail.description, playlistText].filter(Boolean).join("\n\n");
  const fromDesc = parseDescriptionTracklist(
    detail.description,
    durationSec,
    "hearthis",
  ).filter((p) => clockInSource(detail.description ?? "", p.timestamp));
  const parsed = mergeTracklistSignals(fromPlaylist, fromDesc);
  return { host, text, durationSec, parsed };
}

function evaluatedToRaw(
  cues: EvaluatedCue[],
  provenance: Provenance,
): RawPlay[] {
  return cues
    .filter((c) => c.ok && c.timestamp != null && c.title)
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
    .map((c, i) => ({
      position: i + 1,
      timestamp: c.timestamp!,
      provenance,
      idStatus: "unparsed" as const,
      trackTitle: c.title,
      artistName: c.artist,
      rawText: c.artist
        ? `${fmtClock(c.timestamp!)} ${c.artist} - ${c.title}`
        : `${fmtClock(c.timestamp!)} ${c.title}`,
    }));
}

function fmtClock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

async function upsertTrack(
  prisma: PrismaClient,
  title: string,
  artistName: string,
): Promise<string> {
  const artist = artistName.replace(/\s+/g, " ").trim();
  const existing = await prisma.track.findFirst({
    where: { title, artistName: artist },
    select: { id: true },
  });
  if (existing) return existing.id;
  const slug = await allocateTrackSlug(
    artist,
    title,
    async (candidate) => {
      const hit = await prisma.track.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      return !!hit;
    },
    trackSlugBase(artist, title),
  );
  const created = await prisma.track.create({
    data: { slug, title, artistName: artist },
  });
  return created.id;
}

export async function writeCuePlays(
  prisma: PrismaClient,
  setId: string,
  plays: RawPlay[],
): Promise<number> {
  const collapsed = collapseConsecutivePlays(plays, (p) =>
    playCollapseKey({
      artistName: p.artistName,
      title: p.trackTitle,
    }),
  )
    .slice()
    .sort((a, b) => {
      const ta = a.timestamp ?? Number.POSITIVE_INFINITY;
      const tb = b.timestamp ?? Number.POSITIVE_INFINITY;
      if (ta !== tb) return ta - tb;
      return (a.position ?? 0) - (b.position ?? 0);
    })
    .map((p, i) => ({ ...p, position: i + 1 }));

  await prisma.played.deleteMany({ where: { setId } });
  for (const p of collapsed) {
    const base = {
      setId,
      position: p.position,
      timestamp: p.timestamp,
      provenance: p.provenance,
      idStatus: p.idStatus,
    };
    if (
      (p.idStatus === "identified" || p.idStatus === "community_resolved") &&
      p.trackTitle &&
      p.artistName
    ) {
      const trackId = await upsertTrack(prisma, p.trackTitle, p.artistName);
      await prisma.played.create({
        data: {
          ...base,
          trackId,
          rawText: p.rawText ?? `${p.artistName} - ${p.trackTitle}`,
        },
      });
      continue;
    }
    await prisma.played.create({
      data: {
        ...base,
        idStatus: p.idStatus === "unresolved_id" ? "unresolved_id" : "unparsed",
        rawText: p.rawText ?? p.idLabel ?? null,
      },
    });
  }
  return collapsed.length;
}

function emptyStats(provider: LlmProvider | null): ResearchStats {
  return {
    provider,
    scanned: 0,
    proposed: 0,
    applied: 0,
    rejected: 0,
    skippedNoKey: !provider,
  };
}

function pickSetUrl(set: {
  sourceUrl: string | null;
  playbackUrl: string | null;
}): string | null {
  for (const url of [set.sourceUrl, set.playbackUrl]) {
    if (url && hostFromSetUrl(url)) return url;
  }
  return null;
}

export async function runLlmCueResearch(
  prisma: PrismaClient,
  opts: { provider?: LlmProvider; limit?: number; reportTag?: string } = {},
): Promise<ResearchStats> {
  const provider = opts.provider ?? detectLlmProvider();
  const stats = emptyStats(provider);
  const apply = process.env.LLM_RESEARCH_APPLY !== "0";
  const limit = Math.max(1, opts.limit ?? Number(process.env.LLM_CUE_LIMIT || 8));

  const candidates = await prisma.set.findMany({
    where: {
      OR: [
        { sourceUrl: { contains: "youtube.com" } },
        { sourceUrl: { contains: "youtu.be" } },
        { sourceUrl: { contains: "soundcloud.com" } },
        { sourceUrl: { contains: "hearthis.at" } },
        { playbackUrl: { contains: "youtube.com" } },
        { playbackUrl: { contains: "youtu.be" } },
        { playbackUrl: { contains: "soundcloud.com" } },
        { playbackUrl: { contains: "hearthis.at" } },
      ],
      plays: {
        none: { provenance: { in: ["1001tl", "fingerprint", "community"] } },
      },
      durationSec: { gte: 8 * 60 },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      durationSec: true,
      sourceUrl: true,
      playbackUrl: true,
      sourceName: true,
      plays: { select: { provenance: true, idStatus: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 80,
  });

  const rows: Array<{
    slug: string;
    title: string;
    host?: FirstPartyHost;
    path: "parser" | "llm" | "skip";
    accepted: number;
    reason: string;
    applied: boolean;
  }> = [];

  for (const set of candidates) {
    const gate = setAllowsCueWrite(set);
    if (!gate.ok) continue;
    const url = pickSetUrl(set);
    if (!url) continue;
    if (stats.scanned >= limit) break;
    stats.scanned += 1;

    try {
      const source = await loadFirstPartySource(url, set.durationSec);
      if (!source || !source.text.trim()) {
        stats.rejected += 1;
        rows.push({
          slug: set.slug,
          title: set.title,
          path: "skip",
          accepted: 0,
          reason: "no first-party text",
          applied: false,
        });
        continue;
      }

      if (source.parsed.length >= 2) {
        stats.proposed += 1;
        let applied = false;
        if (apply) {
          await writeCuePlays(prisma, set.id, source.parsed);
          stats.applied += 1;
          applied = true;
        }
        rows.push({
          slug: set.slug,
          title: set.title,
          host: source.host,
          path: "parser",
          accepted: source.parsed.length,
          reason: "first-party parser",
          applied,
        });
        continue;
      }

      if (!provider) {
        rows.push({
          slug: set.slug,
          title: set.title,
          host: source.host,
          path: "skip",
          accepted: 0,
          reason: "parser empty, no LLM key",
          applied: false,
        });
        continue;
      }

      const text = await complete(
        provider,
        `Extract timed tracklist cues from this first-party upload text.
Return ONLY JSON: {"cues":[{"at":"M:SS or H:MM:SS","artist":"name or null","title":"track"}]}
Rules:
- at must be a clock that already appears in the text. Never invent, lerp, or guess clocks.
- artist and title must appear in the text. Null artist is OK for title-only lines.
- Skip promo, socials, merch, and 1001tracklists URLs.
- Empty cues array when the text has no timed tracklist.

Set: ${set.title}
Text:
${source.text.slice(0, 12_000)}`,
      );
      const proposals = parseCueProposalJson(parseLlmJson(text));
      stats.proposed += 1;
      const ev = evaluateCueList(source.text, proposals);
      if (ev.accepted.length < 2) {
        stats.rejected += 1;
        rows.push({
          slug: set.slug,
          title: set.title,
          host: source.host,
          path: "llm",
          accepted: ev.accepted.length,
          reason:
            ev.accepted.length === 0
              ? ev.rejected[0]?.reason || "no verified cues"
              : "need 2+ verified clocks",
          applied: false,
        });
        continue;
      }
      const plays = evaluatedToRaw(ev.accepted, provenanceFor(source.host));
      let applied = false;
      if (apply) {
        await writeCuePlays(prisma, set.id, plays);
        stats.applied += 1;
        applied = true;
      }
      rows.push({
        slug: set.slug,
        title: set.title,
        host: source.host,
        path: "llm",
        accepted: plays.length,
        reason: "verified against source",
        applied,
      });
    } catch (err) {
      stats.rejected += 1;
      rows.push({
        slug: set.slug,
        title: set.title,
        path: "skip",
        accepted: 0,
        reason: err instanceof Error ? err.message : String(err),
        applied: false,
      });
    }
  }

  const tag = opts.reportTag ? `-${opts.reportTag}` : "";
  writeReport(`llm-cue-research${tag}.json`, {
    generatedAt: new Date().toISOString(),
    provider,
    write: apply,
    note: "Parser first. LLM write is unparsed + source-verified clocks only. Never invents 1001 URLs or interpolated cues.",
    rows,
  });
  console.log(
    `[llm-cues] provider=${provider ?? "none"} scanned=${stats.scanned} applied=${stats.applied} rejected=${stats.rejected}`,
  );
  return stats;
}
