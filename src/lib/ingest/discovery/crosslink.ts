/**
 * Cross-fertilise artist handles across YouTube ↔ SoundCloud ↔ social links.
 *
 * Sources:
 * - YouTube channel About page outbound links (+ bare IG/X/SC paths)
 * - SoundCloud profile website + description links
 * - Link hubs (hoo.be, lnk.to, fanlink, linktr.ee, …) expanded automatically
 * - Roster seed data
 *
 * Writes an updated handle report; soft-updates artist-candidates.json.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { ARTIST_ROSTER, rosterMissingHandles } from "../roster";
import { sleep } from "../soundcloud/client";
import {
  extractYoutubeChannelIdFromUrl,
  extractYoutubeHandleFromUrl,
  extractYoutubeVanityFromUrl,
  fetchChannelSocialLinks,
  resolveYoutubeHandle,
  searchYoutubeChannelHandle,
} from "../youtube/client";
import { expandAllLinkHubs } from "./linkHubs";
import { fetchSoundcloudProfileLinks } from "./scProfileLinks";
import {
  buildSocialMatrix,
  socialMatrixMarkdownTable,
  type SocialMatrix,
} from "./socialMatrix";
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
  /** YT · SC · X · IG · TT · BP · SF · AM · FB · Web */
  matrix: SocialMatrix;
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
  return extractYoutubeHandleFromUrl(url);
}

function extractYoutubeChannelId(url: string): string | null {
  return extractYoutubeChannelIdFromUrl(url);
}

function extractInstagram(url: string): string | null {
  const m = url.match(/instagram\.com\/([A-Za-z0-9._]+)/i);
  if (!m) return null;
  if (["p", "reel", "stories", "explore"].includes(m[1].toLowerCase())) {
    return null;
  }
  return m[1];
}

function extractTwitter(url: string): string | null {
  const m = url.match(/(?:twitter|x)\.com\/([A-Za-z0-9_]+)/i);
  if (!m) return null;
  if (["intent", "share", "home", "i"].includes(m[1].toLowerCase())) return null;
  return m[1];
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
        const links = await fetchSoundcloudProfileLinks(
          artist.soundcloud.permalink,
        );
        await sleep(120);
        for (const l of links) discovered.push(l);
        if (links.length) crosslinkHits += 1;
      } catch {
        /* ignore */
      }
    }

    // Follow link hubs (hoo.be / lnk.to / fanlink / …) for nested socials
    let uniq = await expandAllLinkHubs(discovered);
    if (uniq.length > discovered.length) crosslinkHits += 1;

    let youtubeHandle = artist.youtube?.handle || null;
    let youtubeStatus = artist.youtube?.status || "missing";
    let scPermalink = artist.soundcloud?.permalink || null;
    let scStatus = artist.soundcloud?.status || "missing";

    // Fill missing YT from @handles / vanity / channel IDs in discovered links
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

    // Resolve youtube.com/channel/UC… and /c/ /user/ vanity → @handle
    if (!youtubeHandle || youtubeStatus === "missing") {
      for (const l of uniq) {
        const channelId = extractYoutubeChannelId(l);
        const vanity = extractYoutubeVanityFromUrl(l);
        const target = channelId || vanity;
        if (!target) continue;
        try {
          const h = await resolveYoutubeHandle(target);
          await sleep(120);
          if (h) {
            youtubeHandle = h;
            youtubeStatus = "unverified";
            crosslinkHits += 1;
            uniq = [...new Set([...uniq, `https://www.youtube.com/${h}`])];
            break;
          }
        } catch {
          /* ignore */
        }
      }
    }
    // Last resort: YouTube channel search by artist name
    if (!youtubeHandle || youtubeStatus === "missing") {
      try {
        const h = await searchYoutubeChannelHandle(artist.name, {
          soundcloudPermalink: scPermalink,
        });
        await sleep(150);
        if (h) {
          youtubeHandle = h;
          youtubeStatus = "unverified";
          crosslinkHits += 1;
          uniq = [...new Set([...uniq, `https://www.youtube.com/${h}`])];
        }
      } catch {
        /* ignore */
      }
    }

    // Fill missing SC from YT about / hub links
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

    // Soft-promote weak → ok when YT About / hubs confirm matching SC/IG
    if (
      youtubeHandle &&
      (youtubeStatus === "weak" || youtubeStatus === "unverified") &&
      scPermalink &&
      scStatus === "ok"
    ) {
      const scMentioned = uniq.some(
        (l) => extractSoundcloudPermalink(l)?.toLowerCase() === scPermalink?.toLowerCase(),
      );
      if (scMentioned) {
        youtubeStatus = "ok";
        crosslinkHits += 1;
      }
    }

    const reasons: string[] = [];
    if (!youtubeHandle || youtubeStatus === "missing") {
      reasons.push("missing YouTube @handle");
    } else if (youtubeStatus === "weak" || youtubeStatus === "unverified") {
      reasons.push(
        `YouTube ${youtubeStatus}${artist.youtube?.note ? `: ${artist.youtube.note}` : ""}`,
      );
    }
    if (!scPermalink || scStatus === "missing") {
      reasons.push("missing SoundCloud permalink");
    } else if (scStatus === "weak" || scStatus === "unverified") {
      reasons.push(
        `SoundCloud ${scStatus}${artist.soundcloud?.note ? `: ${artist.soundcloud.note}` : ""}`,
      );
    }

    const matrix = buildSocialMatrix({
      youtubeHandle,
      soundcloudPermalink: scPermalink,
      website: artist.website,
      links: uniq,
    });

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
      matrix,
      discoveredLinks: uniq,
      needsAttention: reasons.length > 0,
      attentionReasons: reasons,
    };
    rows.push(row);

    // Soft-promote into candidate queue when we have a workable handle
    if (youtubeHandle || scPermalink) {
      const ig = uniq.map(extractInstagram).find(Boolean);
      const tw = uniq.map(extractTwitter).find(Boolean);
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
          ...(ig
            ? [{ kind: "manual" as const, detail: `ig:${ig}`, weight: 5 }]
            : []),
          ...(tw
            ? [{ kind: "manual" as const, detail: `x:${tw}`, weight: 5 }]
            : []),
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

  // Human-readable markdown companion (+ full social matrix table)
  const mdPath = path.replace(/\.json$/, ".md");
  const matrixTable = socialMatrixMarkdownTable(
    rows.map((r) => ({ name: r.name, matrix: r.matrix })),
  );
  const md = [
    "# Artist handle report",
    "",
    `Updated: ${report.updatedAt}`,
    "",
    "## Social matrix",
    "",
    matrixTable,
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
    "- YouTube About → SoundCloud / Instagram / X / TikTok / hubs",
    "- SoundCloud profile website + description → YouTube / Instagram / hubs",
    "- Link hubs (hoo.be, lnk.to, fanlink, linktr.ee, …) expanded automatically",
    "- `youtube.com/channel/UC…` resolved to public `@handle`",
    "- YouTube channel search by artist name when About/SC still lack a handle",
    "- Roster seeds + SC user search for missing permalinks",
    "- Candidates auto-promoted when a handle resolves",
    "- Matrix columns: YT · SC · X · IG · TT · BP · SF · AM · FB · Web",
    "",
  ].join("\n");
  writeFileSync(mdPath, md, "utf8");

  console.log(
    `[crosslink] artists=${report.totalArtists} needsAttention=${report.needsAttention.length} hits=${crosslinkHits}`,
  );
  console.log(
    `[crosslink] roster gaps (static): ${rosterMissingHandles()
      .map((a) => a.name)
      .join(", ") || "(none)"}`,
  );

  return report;
}
