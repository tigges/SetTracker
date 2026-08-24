/**
 * Reusable LLM research jobs.
 *
 * Same contract as handle research:
 *   1. Model proposes JSON only.
 *   2. Deterministic verify (shape, name match, live URL, not owned).
 *   3. Fill-null write, or report-only when a write would invent catalog facts.
 *
 * Never: invent 1001Tracklists URLs, invent tracklist cues, overwrite
 * sourceUrl / sourceName, or promote hearthis crumbs to roster.
 */

import type { PrismaClient } from "@prisma/client";
import { isJunkArtistName } from "../../artistName";
import { HELD_RELIVE_WATCH } from "../nextCaptures";
import {
  complete,
  detectLlmProvider,
  evaluateProposedUrl,
  isResearchWorthyName,
  parseLlmJson,
  probeLive,
  writeReport,
  type LlmProvider,
  type ResearchStats,
} from "./llmResearch";
import { loadArtistSocialKeys } from "../eventSocials";
import { evaluateIsrc, identifySeedRow } from "../identify/trackIds";
import { isFingerprintOnlyWatchUrl } from "../identify/fingerprintWatch";
import { canonicalBeatportUrl } from "../../trackMeta";

export const RESEARCH_JOBS = [
  "handles",
  "events",
  "identity",
  "homecity",
  "videos",
  "tracks",
  "cues",
  "quality",
] as const;

export type ResearchJobId = (typeof RESEARCH_JOBS)[number];

export const IDENTITY_CLASSES = [
  "touring_dj",
  "track_credit",
  "venue_host",
  "junk",
  "unknown",
] as const;

export type IdentityClass = (typeof IDENTITY_CLASSES)[number];

/** Jobs the model may write after verify. Others are report-only. */
export const LLM_WRITE_JOBS = new Set<ResearchJobId>([
  "handles",
  "events",
  "homecity",
  "tracks",
  "cues",
]);

export function parseResearchJobs(
  raw: string | undefined,
  fallback: ResearchJobId[] = ["handles", "events", "quality"],
): ResearchJobId[] {
  const text = (raw || "").trim().toLowerCase();
  if (!text) return fallback;
  if (text === "all") return [...RESEARCH_JOBS];
  const aliases: Record<string, ResearchJobId> = { cue: "cues" };
  const allowed = new Set<string>(RESEARCH_JOBS);
  const out: ResearchJobId[] = [];
  for (const part of text.split(/[,\s]+/)) {
    if (!part) continue;
    const job = (aliases[part] ?? part) as ResearchJobId;
    if (!allowed.has(job)) continue;
    if (!out.includes(job)) out.push(job);
  }
  return out.length ? out : fallback;
}

export function evaluateIdentityClass(
  name: string,
  raw: string | null | undefined,
): { ok: boolean; value?: IdentityClass; reason: string } {
  const value = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_") as IdentityClass;
  if (!IDENTITY_CLASSES.includes(value)) {
    return { ok: false, reason: "unknown identity class" };
  }
  if (isJunkArtistName(name) && value === "touring_dj") {
    return { ok: false, reason: "junk name cannot be a touring DJ" };
  }
  return { ok: true, value, reason: "classified" };
}

const CITY_RE =
  /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ.'\-\s]{1,40}(?:,\s*[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ.'\-\s]{1,24})?$/;

export function evaluateHomeCity(
  djName: string,
  raw: string | null | undefined,
): { ok: boolean; value?: string; reason: string } {
  const value = String(raw || "").replace(/\s+/g, " ").trim();
  if (!value) return { ok: false, reason: "empty" };
  if (/https?:\/\//i.test(value)) return { ok: false, reason: "not a city" };
  if (
    /^(unknown|n\/?a|none|not found|worldwide|internet|global)$/i.test(value)
  ) {
    return { ok: false, reason: "placeholder city" };
  }
  if (!CITY_RE.test(value)) return { ok: false, reason: "city shape rejected" };
  const compact = value.toLowerCase().replace(/[^a-z]+/g, "");
  const nameCompact = djName.toLowerCase().replace(/[^a-z]+/g, "");
  if (compact.length >= 4 && compact === nameCompact) {
    return { ok: false, reason: "city equals DJ name" };
  }
  return { ok: true, value, reason: "city-shaped" };
}

/** Model ISRC/Beatport is accepted only when a live catalog lookup confirms it. */
export function evaluateConfirmedTrackIds(
  proposal: { isrc?: string | null; beatportUrl?: string | null } | null,
  confirmed: { isrc?: string; beatportUrl?: string } | null,
): { ok: boolean; isrc?: string; beatportUrl?: string; reason: string } {
  if (!proposal || !confirmed) return { ok: false, reason: "no confirm" };
  const want = evaluateIsrc(proposal.isrc);
  const beatport = canonicalBeatportUrl(proposal.beatportUrl || undefined);
  if (want.ok && confirmed.isrc && want.isrc === confirmed.isrc) {
    return {
      ok: true,
      isrc: want.isrc,
      beatportUrl: beatport || confirmed.beatportUrl,
      reason: "isrc confirmed",
    };
  }
  if (beatport && confirmed.beatportUrl && beatport === confirmed.beatportUrl) {
    return { ok: true, beatportUrl: beatport, reason: "beatport confirmed" };
  }
  return { ok: false, reason: "proposal did not match live lookup" };
}

export function evaluateOfficialWatchUrl(
  raw: string | null | undefined,
): { ok: boolean; url?: string; reason: string } {
  const url = String(raw || "").trim();
  if (!url) return { ok: false, reason: "empty" };
  if (/1001tracklists\.com|1001\.tl/i.test(url)) {
    return { ok: false, reason: "never invent or accept 1001 URLs from the model" };
  }
  if (/mixesdb\.com/i.test(url)) {
    return { ok: false, reason: "never invent or accept MixesDB URLs as official playback" };
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, reason: "unparseable URL" };
  }
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  if (host === "youtu.be") {
    const id = parsed.pathname.replace(/^\//, "").split("/")[0];
    if (!id || id.length < 8) return { ok: false, reason: "not a watch URL" };
    const watch = `https://www.youtube.com/watch?v=${id}`;
    if (isFingerprintOnlyWatchUrl(watch)) {
      return { ok: false, reason: "fingerprint-only fan clip — not official playback" };
    }
    return { ok: true, url: watch, reason: "watch url" };
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    if (/^\/(watch)$/i.test(parsed.pathname) && parsed.searchParams.get("v")) {
      const id = parsed.searchParams.get("v")!;
      const watch = `https://www.youtube.com/watch?v=${id}`;
      if (isFingerprintOnlyWatchUrl(watch)) {
        return { ok: false, reason: "fingerprint-only fan clip — not official playback" };
      }
      return { ok: true, url: watch, reason: "watch url" };
    }
    return { ok: false, reason: "not a watch URL" };
  }
  return { ok: false, reason: "not YouTube" };
}

export async function titleMatchesOfficialWatch(
  url: string,
  artist: string,
  eventTokens: string[],
): Promise<{ ok: boolean; title?: string; reason: string }> {
  try {
    const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembed, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return { ok: false, reason: `oembed ${res.status}` };
    const body = (await res.json()) as { title?: string; author_name?: string };
    const title = `${body.title || ""} ${body.author_name || ""}`;
    const hay = title.toLowerCase();
    const artistTok = artist.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (artistTok.length >= 3 && !hay.includes(artistTok.split(" ")[0]!)) {
      return { ok: false, title: body.title, reason: "title missing artist" };
    }
    const hit = eventTokens.some((t) => hay.includes(t.toLowerCase()));
    if (!hit) return { ok: false, title: body.title, reason: "title missing event" };
    return { ok: true, title: body.title, reason: "title matches" };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "oembed failed",
    };
  }
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

export async function runLlmIdentityResearch(
  prisma: PrismaClient,
  opts: { provider?: LlmProvider; limit?: number; reportTag?: string } = {},
): Promise<ResearchStats> {
  const provider = opts.provider ?? detectLlmProvider();
  const stats = emptyStats(provider);
  if (!provider) return stats;
  const limit = Math.max(1, opts.limit ?? Number(process.env.LLM_IDENTITY_LIMIT || 24));
  const djs = (
    await prisma.dj.findMany({
      where: {
        soundcloud: null,
        youtube: null,
        instagram: null,
        twitter: null,
        website: null,
        sets: { some: {} },
      },
      select: { slug: true, name: true, _count: { select: { sets: true } } },
      take: 80,
      orderBy: { name: "asc" },
    })
  )
    .filter((d) => isResearchWorthyName(d.name) && !isJunkArtistName(d.name))
    .slice(0, limit);

  const rows: Array<{
    slug: string;
    name: string;
    sets: number;
    cls: IdentityClass | null;
    reason: string;
    notes?: string;
  }> = [];

  for (const d of djs) {
    stats.scanned += 1;
    try {
      const text = await complete(
        provider,
        `Classify this electronic-music catalog name. Return ONLY JSON:
{"class":"touring_dj|track_credit|venue_host|junk|unknown","confidence":"high|medium|low","notes":"one line"}
touring_dj = real DJ/producer with a career. track_credit = featured vocalist or one-off credit. venue_host = festival/club/brand. junk = set title, genre crumb, or UI chrome.
Name: ${d.name}
Sets in catalog: ${d._count.sets}`,
      );
      const proposal = parseLlmJson(text) as {
        class?: string;
        notes?: string;
      } | null;
      stats.proposed += 1;
      const ev = evaluateIdentityClass(d.name, proposal?.class);
      if (!ev.ok || !ev.value) {
        stats.rejected += 1;
        rows.push({
          slug: d.slug,
          name: d.name,
          sets: d._count.sets,
          cls: null,
          reason: ev.reason,
        });
        continue;
      }
      rows.push({
        slug: d.slug,
        name: d.name,
        sets: d._count.sets,
        cls: ev.value,
        reason: ev.reason,
        notes: proposal?.notes,
      });
    } catch (err) {
      stats.rejected += 1;
      rows.push({
        slug: d.slug,
        name: d.name,
        sets: d._count.sets,
        cls: null,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const tag = opts.reportTag ? `-${opts.reportTag}` : "";
  writeReport(`llm-identity-research${tag}.json`, {
    generatedAt: new Date().toISOString(),
    provider,
    write: false,
    note: "Report only. Identity class never writes socials or 1001 URLs.",
    rows,
  });
  console.log(
    `[llm-identity] provider=${provider} scanned=${stats.scanned} rejected=${stats.rejected}`,
  );
  return stats;
}

export async function runLlmHomeCityResearch(
  prisma: PrismaClient,
  opts: { provider?: LlmProvider; limit?: number; reportTag?: string } = {},
): Promise<ResearchStats> {
  const provider = opts.provider ?? detectLlmProvider();
  const stats = emptyStats(provider);
  if (!provider) return stats;
  const apply = process.env.LLM_RESEARCH_APPLY !== "0";
  const limit = Math.max(1, opts.limit ?? Number(process.env.LLM_HOMECITY_LIMIT || 20));
  const artistKeys = await loadArtistSocialKeys(prisma);
  const djs = await prisma.dj.findMany({
    where: {
      homeCity: null,
      sets: { some: {} },
      OR: [
        { soundcloud: { not: null } },
        { youtube: { not: null } },
        { instagram: { not: null } },
        { website: { not: null } },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      website: true,
      homeCity: true,
    },
    take: limit,
    orderBy: { name: "asc" },
  });

  const rows = [];
  for (const d of djs) {
    stats.scanned += 1;
    try {
      const text = await complete(
        provider,
        `Research the official hometown for this DJ. Return ONLY JSON:
{"homeCity":"City, Country","website":"https://... or null","confidence":"high|medium|low","notes":"one line"}
Use a real city (optionally with country). Null when unsure. Do not invent social handles.
DJ: ${d.name}`,
      );
      const proposal = parseLlmJson(text) as {
        homeCity?: string | null;
        website?: string | null;
      } | null;
      if (!proposal) {
        stats.rejected += 1;
        rows.push({ slug: d.slug, accepted: [], rejected: ["no json"] });
        continue;
      }
      stats.proposed += 1;
      const accepted: string[] = [];
      const rejected: string[] = [];
      const city = evaluateHomeCity(d.name, proposal.homeCity);
      if (city.ok && city.value) {
        if (apply) {
          await prisma.dj.update({
            where: { id: d.id },
            data: { homeCity: city.value },
          });
        }
        accepted.push(`homeCity:${city.value}`);
        stats.applied += 1;
      } else if (proposal.homeCity) {
        rejected.push(`homeCity:${city.reason}`);
        stats.rejected += 1;
      }
      if (proposal.website && !d.website) {
        const web = evaluateProposedUrl(d.name, "website", proposal.website, artistKeys);
        if (web.ok && web.url) {
          const live = await probeLive(web.url);
          if (live !== "dead" && apply) {
            await prisma.dj.update({
              where: { id: d.id },
              data: { website: web.url },
            });
            accepted.push(`website:${web.url}`);
            stats.applied += 1;
          } else {
            rejected.push(`website:${live === "dead" ? "dead" : web.reason}`);
            stats.rejected += 1;
          }
        } else {
          rejected.push(`website:${web.reason}`);
          stats.rejected += 1;
        }
      }
      rows.push({ slug: d.slug, name: d.name, accepted, rejected });
    } catch (err) {
      stats.rejected += 1;
      rows.push({
        slug: d.slug,
        name: d.name,
        accepted: [],
        rejected: [err instanceof Error ? err.message : String(err)],
      });
    }
  }

  const tag = opts.reportTag ? `-${opts.reportTag}` : "";
  writeReport(`llm-homecity-research${tag}.json`, {
    generatedAt: new Date().toISOString(),
    provider,
    apply,
    rows,
  });
  console.log(
    `[llm-homecity] provider=${provider} scanned=${stats.scanned} applied=${stats.applied}`,
  );
  return stats;
}

export async function runLlmOfficialVideoResearch(
  opts: { provider?: LlmProvider; reportTag?: string } = {},
): Promise<ResearchStats> {
  const provider = opts.provider ?? detectLlmProvider();
  const stats = emptyStats(provider);
  if (!provider) return stats;

  const rows = [];
  for (const held of HELD_RELIVE_WATCH) {
    stats.scanned += 1;
    try {
      const text = await complete(
        provider,
        `Find the official YouTube playback / livestream watch URL for this DJ set.
Return ONLY JSON: {"watchUrl":"https://www.youtube.com/watch?v=...","confidence":"high|medium|low","notes":"channel + title"}
Rules: official artist or festival channel only. No fan reuploads. Never invent a 1001tracklists URL. Null if the official video is not up yet.
Set: ${held.name}
Search hints: ${held.search.join(" ")}`,
      );
      const proposal = parseLlmJson(text) as { watchUrl?: string | null } | null;
      const ev = evaluateOfficialWatchUrl(proposal?.watchUrl);
      if (ev.ok && ev.url && isFingerprintOnlyWatchUrl(ev.url)) {
        stats.rejected += 1;
        rows.push({
          name: held.name,
          seed: held.seed,
          accepted: null,
          reason: "fingerprint-only fan clip — not official playback",
        });
        continue;
      }
      if (!ev.ok || !ev.url) {
        stats.rejected += 1;
        rows.push({
          name: held.name,
          seed: held.seed,
          accepted: null,
          reason: ev.reason,
        });
        continue;
      }
      stats.proposed += 1;
      const live = await probeLive(ev.url);
      if (live === "dead") {
        stats.rejected += 1;
        rows.push({
          name: held.name,
          seed: held.seed,
          accepted: null,
          reason: "watch URL is dead",
        });
        continue;
      }
      const titled = await titleMatchesOfficialWatch(
        ev.url,
        held.name.split("·")[0]!.trim(),
        held.search,
      );
      if (!titled.ok) {
        stats.rejected += 1;
        rows.push({
          name: held.name,
          seed: held.seed,
          accepted: null,
          reason: titled.reason,
          title: titled.title,
        });
        continue;
      }
      rows.push({
        name: held.name,
        seed: held.seed,
        accepted: ev.url,
        reason: titled.reason,
        title: titled.title,
      });
    } catch (err) {
      stats.rejected += 1;
      rows.push({
        name: held.name,
        seed: held.seed,
        accepted: null,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const tag = opts.reportTag ? `-${opts.reportTag}` : "";
  writeReport(`llm-official-video-research${tag}.json`, {
    generatedAt: new Date().toISOString(),
    provider,
    write: false,
    note: "Report only. Operator wires official playback; never invent 1001 URLs.",
    rows,
  });
  console.log(
    `[llm-videos] provider=${provider} scanned=${stats.scanned} rejected=${stats.rejected}`,
  );
  return stats;
}

export async function runLlmTrackIdResearch(
  prisma: PrismaClient,
  opts: { provider?: LlmProvider; limit?: number; reportTag?: string } = {},
): Promise<ResearchStats> {
  const provider = opts.provider ?? detectLlmProvider();
  const stats = emptyStats(provider);
  if (!provider) return stats;
  const apply = process.env.LLM_RESEARCH_APPLY !== "0";
  const limit = Math.max(
    1,
    opts.limit ?? Number(process.env.LLM_TRACK_ID_LIMIT || 12),
  );
  const tracks = await prisma.track.findMany({
    where: { isrc: null },
    select: { id: true, title: true, artistName: true, isrc: true, beatportUrl: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const rows = [];
  for (const t of tracks) {
    stats.scanned += 1;
    try {
      const text = await complete(
        provider,
        `Find the ISRC and canonical Beatport track URL for this recording.
Return ONLY JSON: {"isrc":"CCXXX0000000 or null","beatportUrl":"https://www.beatport.com/track/.../123 or null","confidence":"high|medium|low"}
Never invent an ISRC. Null when unsure. No 1001tracklists URLs.
Artist: ${t.artistName}
Title: ${t.title}`,
      );
      const proposal = parseLlmJson(text) as {
        isrc?: string | null;
        beatportUrl?: string | null;
      } | null;
      stats.proposed += 1;
      const live = await identifySeedRow({
        at: "0:00",
        artist: t.artistName,
        title: t.title,
      });
      const confirmed =
        "reason" in live
          ? null
          : { isrc: live.isrc, beatportUrl: live.beatportUrl };
      const ev = evaluateConfirmedTrackIds(proposal, confirmed);
      if (!ev.ok) {
        stats.rejected += 1;
        rows.push({
          id: t.id,
          artist: t.artistName,
          title: t.title,
          accepted: null,
          reason: ev.reason,
        });
        continue;
      }
      if (apply) {
        const data: { isrc?: string; beatportUrl?: string } = {};
        if (ev.isrc && !t.isrc) data.isrc = ev.isrc;
        if (ev.beatportUrl && !t.beatportUrl) data.beatportUrl = ev.beatportUrl;
        if (Object.keys(data).length) {
          await prisma.track.update({ where: { id: t.id }, data });
          stats.applied += 1;
        }
      }
      rows.push({
        id: t.id,
        artist: t.artistName,
        title: t.title,
        accepted: { isrc: ev.isrc, beatportUrl: ev.beatportUrl },
        reason: ev.reason,
      });
    } catch (err) {
      stats.rejected += 1;
      rows.push({
        id: t.id,
        artist: t.artistName,
        title: t.title,
        accepted: null,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const tag = opts.reportTag ? `-${opts.reportTag}` : "";
  writeReport(`llm-track-id-research${tag}.json`, {
    generatedAt: new Date().toISOString(),
    provider,
    write: apply,
    note: "Fill-null Track.isrc / beatportUrl only when Deezer/MB confirms the proposal.",
    rows,
  });
  console.log(
    `[llm-tracks] provider=${provider} scanned=${stats.scanned} applied=${stats.applied}`,
  );
  return stats;
}

export { runLlmCueResearch } from "./llmCues";
