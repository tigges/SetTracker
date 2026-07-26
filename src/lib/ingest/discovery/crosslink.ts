/**
 * Cross-fertilise artist handles across YouTube ↔ SoundCloud ↔ social links.
 *
 * Sources:
 * - YouTube channel About page outbound links
 * - SoundCloud profile website + description links
 * - Roster seed data
 *
 * Writes an updated handle report; soft-updates artist-candidates.json.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { ARTIST_ROSTER, rosterMissingHandles } from "../roster";
import { resolveUser, scGet, sleep } from "../soundcloud/client";
import { fetchChannelSocialLinks } from "../youtube/client";
import { loadCandidates, saveCandidates, upsertCandidate } from "./store";
import { slugify } from "../types";

export type HandleReportRow = {
  name: string;
  slug: string;
  youtube: {
    handle: string | null;
    status: string;
    note?: string;
  };
  soundcloud: {
    permalink: string | null;
    status: string;
    note?: string;
  };
  discoveredLinks: string[];
  needsAttention: boolean;
  attentionReasons: string[];
};

export type HandleReport = {
  updatedAt: string;
  totalArtists: number;
  needsAttention: HandleReportRow[];
  ok: HandleReportRow[];
  crosslinkHits: number;
};

function reportPath(): string {
  return (
    process.env.HANDLE_REPORT_PATH ||
    join(process.cwd(), "data", "handle-report.json")
  );
}

function extractSoundcloudPermalink(url: string): string | null {
  const m = url.match(/soundcloud\.com\/([A-Za-z0-9_-]+)/i);
  if (!m) return null;
  const p = m[1].toLowerCase();
  if (["you", "discover", "pages", "sets", "search"].includes(p)) return null;
  return m[1];
}

function extractYoutubeHandle(url: string): string | null {
  const at = url.match(/youtube\.com\/@([\w.-]+)/i);
  if (at) return `@${at[1]}`;
  return null;
}

async function scOutboundLinks(permalink: string): Promise<string[]> {
  try {
    const u = await resolveUser(permalink);
    const full = await scGet<{
      website?: string | null;
      description?: string | null;
    }>(`/users/${u.id}`);
    const links: string[] = [];
    if (full.website) links.push(String(full.website));
    const desc = String(full.description || "");
    for (const m of desc.matchAll(/https?:\/\/[^\s)]+/gi)) {
      links.push(m[0].replace(/[),.;]+$/, ""));
    }
    return links;
  } catch {
    return [];
  }
}

/**
 * Resolve cross-links for roster artists and write data/handle-report.json.
 */
export async function runCrosslinkDiscovery(): Promise<HandleReport> {
  const file = loadCandidates();
  let crosslinkHits = 0;
  const rows: HandleReportRow[] = [];

  for (const artist of ARTIST_ROSTER) {
    const discovered: string[] = [...(artist.socials ?? [])];
    if (artist.website) discovered.push(artist.website);

    if (artist.youtube?.handle) {
      try {
        const links = await fetchChannelSocialLinks(artist.youtube.handle);
        await sleep(150);
        for (const l of links) discovered.push(l);
        if (links.length) crosslinkHits += 1;
      } catch {
        /* ignore */
      }
    }

    if (artist.soundcloud?.permalink) {
      try {
        const links = await scOutboundLinks(artist.soundcloud.permalink);
        await sleep(120);
        for (const l of links) discovered.push(l);
        if (links.length) crosslinkHits += 1;
      } catch {
        /* ignore */
      }
    }

    const uniq = [...new Set(discovered)];
    let youtubeHandle = artist.youtube?.handle || null;
    let youtubeStatus = artist.youtube?.status || "missing";
    let scPermalink = artist.soundcloud?.permalink || null;
    let scStatus = artist.soundcloud?.status || "missing";

    // Fill missing YT from SC/description links
    if (!youtubeHandle || youtubeStatus === "missing") {
      for (const l of uniq) {
        const h = extractYoutubeHandle(l);
        if (h) {
          youtubeHandle = h;
          youtubeStatus = "unverified";
          crosslinkHits += 1;
          break;
        }
      }
    }

    // Fill missing SC from YT about links
    if (!scPermalink || scStatus === "missing") {
      for (const l of uniq) {
        const p = extractSoundcloudPermalink(l);
        if (p) {
          scPermalink = p;
          scStatus = "unverified";
          crosslinkHits += 1;
          break;
        }
      }
    }

    const reasons: string[] = [];
    if (!youtubeHandle || youtubeStatus === "missing") {
      reasons.push("missing YouTube @handle");
    } else if (youtubeStatus === "weak" || youtubeStatus === "unverified") {
      reasons.push(`YouTube ${youtubeStatus}${artist.youtube?.note ? `: ${artist.youtube.note}` : ""}`);
    }
    if (!scPermalink || scStatus === "missing") {
      reasons.push("missing SoundCloud permalink");
    } else if (scStatus === "weak" || scStatus === "unverified") {
      reasons.push(
        `SoundCloud ${scStatus}${artist.soundcloud?.note ? `: ${artist.soundcloud.note}` : ""}`,
      );
    }

    const row: HandleReportRow = {
      name: artist.name,
      slug: slugify(artist.name),
      youtube: {
        handle: youtubeHandle,
        status: youtubeStatus,
        note: artist.youtube?.note,
      },
      soundcloud: {
        permalink: scPermalink,
        status: scStatus,
        note: artist.soundcloud?.note,
      },
      discoveredLinks: uniq,
      needsAttention: reasons.length > 0,
      attentionReasons: reasons,
    };
    rows.push(row);

    // Soft-promote into candidate queue when we have a workable handle
    if (youtubeHandle || scPermalink) {
      upsertCandidate(file, {
        name: artist.name,
        slug: slugify(artist.name),
        score: artist.priority === "high" ? 60 : 40,
        status:
          youtubeStatus === "ok" || scStatus === "ok" ? "promoted" : "queued",
        evidence: [
          {
            kind: "manual",
            detail: "roster artist",
            weight: 40,
          },
        ],
        youtubeHandle: youtubeHandle || undefined,
        soundcloudPermalink: scPermalink || undefined,
        genre: artist.genre,
        accent: artist.accent,
      });
    }
  }

  saveCandidates(file);

  const report: HandleReport = {
    updatedAt: new Date().toISOString(),
    totalArtists: rows.length,
    needsAttention: rows.filter((r) => r.needsAttention),
    ok: rows.filter((r) => !r.needsAttention),
    crosslinkHits,
  };

  const path = reportPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  // Human-readable markdown companion
  const mdPath = path.replace(/\.json$/, ".md");
  const md = [
    "# Artist handle report",
    "",
    `Updated: ${report.updatedAt}`,
    "",
    `## Needs attention (${report.needsAttention.length})`,
    "",
    ...report.needsAttention.flatMap((r) => [
      `### ${r.name}`,
      ...r.attentionReasons.map((x) => `- ${x}`),
      `- YouTube: ${r.youtube.handle ?? "—"} (${r.youtube.status})`,
      `- SoundCloud: ${r.soundcloud.permalink ?? "—"} (${r.soundcloud.status})`,
      ...(r.discoveredLinks.length
        ? [`- Discovered links: ${r.discoveredLinks.slice(0, 8).join(", ")}`]
        : []),
      "",
    ]),
    `## OK (${report.ok.length})`,
    "",
    ...report.ok.map(
      (r) =>
        `- **${r.name}** — YT ${r.youtube.handle} · SC ${r.soundcloud.permalink}`,
    ),
    "",
    "## How we cross-fertilise",
    "",
    "- YouTube About → SoundCloud / Instagram / X / Linktree",
    "- SoundCloud profile website + description → YouTube / Instagram / Linktree",
    "- Roster seeds + SC user search for missing permalinks",
    "- Candidates auto-promoted when a handle resolves",
    "",
  ].join("\n");
  writeFileSync(mdPath, md, "utf8");

  console.log(
    `[crosslink] artists=${report.totalArtists} needsAttention=${report.needsAttention.length} hits=${crosslinkHits}`,
  );
  console.log(
    `[crosslink] roster gaps (static): ${rosterMissingHandles()
      .map((a) => a.name)
      .join(", ")}`,
  );

  return report;
}
