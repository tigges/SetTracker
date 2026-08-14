/**
 * Claude / Gemini research for DJ handles and catalog quality notes.
 *
 * Models only propose. We write a field when:
 *   1) the URL is a profile (not a watch/track page),
 *   2) the handle overlaps the DJ name,
 *   3) the URL is live (or soft-gated),
 *   4) it is not already owned by a different catalog DJ.
 *
 * No-op when CLAUDE_AGENT_API / ANTHROPIC_API_KEY / GEMINI_API_KEY are unset.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";
import { youtubeChannelUrl } from "../../social";
import { normalizeOfficialWebsite } from "./wikidataOfficial";
import {
  djMayClaimSocialUrl,
  loadArtistSocialKeys,
  normalizeSocialUrl,
  socialFieldFromUrl,
  socialProfileKey,
} from "../eventSocials";

export type LlmProvider = "claude" | "gemini";

export type HandleProposal = {
  soundcloud?: string | null;
  youtube?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  website?: string | null;
  confidence?: "high" | "medium" | "low";
  notes?: string;
};

export type VerifiedField = {
  field: "soundcloud" | "youtube" | "instagram" | "twitter" | "website";
  url: string;
  reason: string;
};

export type ResearchRow = {
  slug: string;
  name: string;
  provider: LlmProvider;
  proposal: HandleProposal | null;
  accepted: VerifiedField[];
  rejected: { field: string; url: string; reason: string }[];
  error?: string;
};

export type ResearchStats = {
  provider: LlmProvider | null;
  scanned: number;
  proposed: number;
  applied: number;
  rejected: number;
  skippedNoKey: boolean;
};

const TIMEOUT_MS = 45_000;

/** Repo secret is `CLAUDE_AGENT_API`; `ANTHROPIC_API_KEY` is an alias. */
export function claudeApiKey(
  env: Record<string, string | undefined> = process.env,
): string | null {
  const key = env.CLAUDE_AGENT_API?.trim() || env.ANTHROPIC_API_KEY?.trim();
  return key || null;
}

export function detectLlmProvider(
  env: Record<string, string | undefined> = process.env,
): LlmProvider | null {
  const want = (env.LLM_RESEARCH_PROVIDER || "auto").toLowerCase();
  const claude = Boolean(claudeApiKey(env));
  const gemini = Boolean(
    env.GEMINI_API_KEY?.trim() || env.GOOGLE_API_KEY?.trim(),
  );
  if (want === "claude") return claude ? "claude" : null;
  if (want === "gemini") return gemini ? "gemini" : null;
  // Gemini first: Google Search grounding beats unaided guesses.
  if (gemini) return "gemini";
  if (claude) return "claude";
  return null;
}

export function parseLlmJson(text: string): HandleProposal | null {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const raw = JSON.parse(trimmed.slice(start, end + 1)) as HandleProposal;
    if (!raw || typeof raw !== "object") return null;
    return raw;
  } catch {
    return null;
  }
}

function handlePrompt(name: string, context: string): string {
  return `You research official profiles for electronic-music DJs.
Return ONLY JSON with keys: soundcloud, youtube, instagram, twitter, website, confidence, notes.
Use full https URLs. Null when you are not sure. Do not invent slugified guesses (no instagram.com/${name.toLowerCase().replace(/\s+/g, "")} unless that is the real official account).
Prefer the artist's own channel/profile, never a festival, label, or fan page.
DJ: ${name}
Context: ${context || "none"}`;
}

async function callClaude(prompt: string): Promise<string> {
  const key = claudeApiKey();
  if (!key) throw new Error("CLAUDE_AGENT_API / ANTHROPIC_API_KEY missing");
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`claude ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const body = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  return body.content?.find((c) => c.type === "text")?.text ?? "";
}

async function callGemini(prompt: string): Promise<string> {
  const key = (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    ""
  ).trim();
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent` +
    `?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: { temperature: 0.2 },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const body = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return (
    body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ??
    ""
  );
}

async function complete(
  provider: LlmProvider,
  prompt: string,
): Promise<string> {
  return provider === "claude" ? callClaude(prompt) : callGemini(prompt);
}

async function probeLive(url: string): Promise<"ok" | "dead" | "soft"> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: {
        "User-Agent": "SetRadar/0.2 (+https://setradar.ai; llm-verify)",
        Accept: "*/*",
      },
      signal: AbortSignal.timeout(8_000),
    });
    if (res.status === 404 || res.status === 410) return "dead";
    if (res.status === 405 || res.status === 501) {
      const get = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent": "SetRadar/0.2 (+https://setradar.ai; llm-verify)",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(8_000),
      });
      if (get.status === 404 || get.status === 410) return "dead";
      return get.status < 400 || get.status === 401 || get.status === 403
        ? "ok"
        : "soft";
    }
    if (res.status === 401 || res.status === 403) return "ok";
    return res.status < 400 ? "ok" : "soft";
  } catch {
    return "dead";
  }
}

export function evaluateProposedUrl(
  djName: string,
  field: VerifiedField["field"],
  raw: string,
  artistKeys: Set<string>,
): { ok: boolean; url?: string; reason: string } {
  let url = raw.trim();
  if (!url) return { ok: false, reason: "empty" };
  if (field === "youtube") {
    const yt = youtubeChannelUrl(url);
    if (!yt) return { ok: false, reason: "not a YouTube channel" };
    url = yt;
  } else if (field === "website") {
    const web = normalizeOfficialWebsite(url);
    if (!web) return { ok: false, reason: "not an official website" };
    url = web;
  } else {
    const n = normalizeSocialUrl(url);
    if (!n) return { ok: false, reason: "unparseable URL" };
    url = n;
  }
  if (field !== "website") {
    const mapped = socialFieldFromUrl(url);
    if (mapped !== field) return { ok: false, reason: `not a ${field} profile` };
    if (!djMayClaimSocialUrl(djName, url)) {
      return { ok: false, reason: "handle does not match DJ name" };
    }
    const key = socialProfileKey(url);
    if (key && artistKeys.has(key)) {
      return { ok: false, reason: "URL already owned by another DJ" };
    }
  } else {
    const host = (() => {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch {
        return "";
      }
    })();
    const compact = djName.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const hostCompact = host.replace(/[^a-z0-9]+/g, "");
    if (
      compact.length >= 4 &&
      !hostCompact.includes(compact) &&
      !compact.includes(hostCompact.replace(/com$|net$|org$/, ""))
    ) {
      return { ok: false, reason: "website host does not match DJ name" };
    }
  }
  return { ok: true, url, reason: "name-matched" };
}

const FIELDS = [
  "soundcloud",
  "youtube",
  "instagram",
  "twitter",
  "website",
] as const;

export async function verifyProposal(
  djName: string,
  proposal: HandleProposal,
  artistKeys: Set<string>,
): Promise<{ accepted: VerifiedField[]; rejected: ResearchRow["rejected"] }> {
  const accepted: VerifiedField[] = [];
  const rejected: ResearchRow["rejected"] = [];
  for (const field of FIELDS) {
    const raw = proposal[field];
    if (!raw) continue;
    const ev = evaluateProposedUrl(djName, field, raw, artistKeys);
    if (!ev.ok || !ev.url) {
      rejected.push({ field, url: raw, reason: ev.reason });
      continue;
    }
    const live = await probeLive(ev.url);
    if (live === "dead") {
      rejected.push({ field, url: ev.url, reason: "URL is dead" });
      continue;
    }
    accepted.push({ field, url: ev.url, reason: ev.reason });
  }
  return { accepted, rejected };
}

function writeReport(name: string, payload: unknown): void {
  const dir = join(process.cwd(), "data", "crosscheck");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), `${JSON.stringify(payload, null, 2)}\n`);
}

/**
 * Research official handles for DJs that already have sets but no socials.
 * Fill-null verified fields only.
 */
export async function runLlmHandleResearch(
  prisma: PrismaClient,
): Promise<ResearchStats> {
  const provider = detectLlmProvider();
  const stats: ResearchStats = {
    provider,
    scanned: 0,
    proposed: 0,
    applied: 0,
    rejected: 0,
    skippedNoKey: !provider,
  };
  if (!provider) {
    console.log(
      "[llm-research] skipped (set CLAUDE_AGENT_API and/or GEMINI_API_KEY)",
    );
    return stats;
  }
  if (process.env.LLM_RESEARCH === "0") {
    console.log("[llm-research] skipped (LLM_RESEARCH=0)");
    return stats;
  }

  const limit = Math.max(1, Number(process.env.LLM_RESEARCH_LIMIT || 12));
  const apply = process.env.LLM_RESEARCH_APPLY !== "0";
  const artistKeys = await loadArtistSocialKeys(prisma);

  const djs = await prisma.dj.findMany({
    where: {
      soundcloud: null,
      youtube: null,
      instagram: null,
      twitter: null,
      website: null,
      sets: { some: {} },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      sets: {
        take: 3,
        select: { set: { select: { title: true } } },
        orderBy: { isPrimary: "desc" },
      },
    },
    take: limit,
    orderBy: { name: "asc" },
  });

  const rows: ResearchRow[] = [];
  for (const d of djs) {
    stats.scanned += 1;
    const context = d.sets.map((s) => s.set.title).filter(Boolean).join("; ");
    try {
      const text = await complete(provider, handlePrompt(d.name, context));
      const proposal = parseLlmJson(text);
      if (!proposal) {
        rows.push({
          slug: d.slug,
          name: d.name,
          provider,
          proposal: null,
          accepted: [],
          rejected: [],
          error: "unparseable model JSON",
        });
        continue;
      }
      stats.proposed += 1;
      const { accepted, rejected } = await verifyProposal(
        d.name,
        proposal,
        artistKeys,
      );
      stats.rejected += rejected.length;
      if (apply && accepted.length) {
        const data: Record<string, string> = {};
        for (const a of accepted) data[a.field] = a.url;
        await prisma.dj.update({ where: { id: d.id }, data });
        stats.applied += accepted.length;
        for (const a of accepted) {
          const key = socialProfileKey(a.url);
          if (key) artistKeys.add(key);
        }
      }
      rows.push({
        slug: d.slug,
        name: d.name,
        provider,
        proposal,
        accepted,
        rejected,
      });
    } catch (err) {
      rows.push({
        slug: d.slug,
        name: d.name,
        provider,
        proposal: null,
        accepted: [],
        rejected: [],
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  writeReport("llm-handle-research.json", {
    generatedAt: new Date().toISOString(),
    provider,
    apply,
    stats,
    rows,
  });
  console.log(
    `[llm-research] provider=${provider} scanned=${stats.scanned}` +
      ` proposed=${stats.proposed} applied=${stats.applied} rejected=${stats.rejected}`,
  );
  return stats;
}

export type QualityNote = {
  kind: "dj" | "event" | "set";
  slug: string;
  name: string;
  issue: string;
  severity: "info" | "warn";
};

/** Deterministic quality notes (no model required) + optional LLM commentary. */
export async function runLlmQualityCheck(
  prisma: PrismaClient,
): Promise<{ notes: QualityNote[]; provider: LlmProvider | null }> {
  const notes: QualityNote[] = [];
  const emptySets = await prisma.set.findMany({
    where: { plays: { none: {} } },
    select: { slug: true, title: true },
    take: 25,
    orderBy: { publishedAt: "desc" },
  });
  for (const s of emptySets) {
    notes.push({
      kind: "set",
      slug: s.slug,
      name: s.title,
      issue: "Empty tracklist (0 plays) — queue 1001 / ACR, do not invent cues.",
      severity: "warn",
    });
  }

  const handleless = await prisma.dj.findMany({
    where: {
      soundcloud: null,
      youtube: null,
      instagram: null,
      twitter: null,
      website: null,
      sets: { some: {} },
    },
    select: { slug: true, name: true, _count: { select: { sets: true } } },
    take: 25,
    orderBy: { name: "asc" },
  });
  for (const d of handleless) {
    notes.push({
      kind: "dj",
      slug: d.slug,
      name: d.name,
      issue: `${d._count.sets} set(s), no handle — candidate for LLM research + Wikidata.`,
      severity: "info",
    });
  }

  const provider = detectLlmProvider();
  if (provider && process.env.LLM_QUALITY === "1" && handleless.length) {
    const names = handleless.map((d) => d.name).join(", ");
    try {
      const text = await complete(
        provider,
        `These catalog names have DJ sets but no socials. For each, one line: NAME — real touring DJ / track-credit / junk. Names: ${names}`,
      );
      notes.push({
        kind: "dj",
        slug: "_llm",
        name: "batch",
        issue: text.slice(0, 2000),
        severity: "info",
      });
    } catch (err) {
      notes.push({
        kind: "dj",
        slug: "_llm",
        name: "batch",
        issue: err instanceof Error ? err.message : String(err),
        severity: "warn",
      });
    }
  }

  writeReport("llm-quality-check.json", {
    generatedAt: new Date().toISOString(),
    provider,
    notes,
  });
  console.log(`[llm-quality] notes=${notes.length} provider=${provider ?? "none"}`);
  return { notes, provider };
}
