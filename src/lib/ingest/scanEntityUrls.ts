/**
 * Fetch stored / curated entity websites and pull more first-party links
 * (socials, hubs → socials, Beatport tracks, YT/SC set candidates).
 *
 * Never invents hosts — only harvests URLs already published on a page.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";
import { djSocialsFromKnown } from "../social";
import { ARTIST_ROSTER } from "./roster";
import { expandAllLinkHubs, isLinkHub } from "./discovery/linkHubs";
import {
  curatedEventSocialPatch,
  djMayClaimSocialUrl,
  eventMayClaimSocialUrl,
  loadArtistSocialKeys,
  socialFieldFromUrl,
} from "./eventSocials";
import { KNOWN_EVENTS } from "./events";
import { slugify } from "./types";

export type ScanStats = {
  pages: number;
  socialFills: number;
  artistsMentioned: number;
  setCandidates: number;
  beatportHits: number;
};

const TIMEOUT_MS = 12_000;

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function normalizeUrl(raw: string): string | null {
  let u = raw.trim().replace(/[),.;]+$/, "");
  if (!/^https?:\/\//i.test(u)) {
    if (/^(www\.)?[\w.-]+\.[a-z]{2,}/i.test(u)) u = `https://${u}`;
    else return null;
  }
  try {
    const parsed = new URL(u);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

function extractUrlsFromHtml(html: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/https?:\/\/[^\s"'<>\\]+/gi)) {
    const n = normalizeUrl(m[0].replace(/\\\//g, "/"));
    if (n) out.push(n);
  }
  for (const m of html.matchAll(/https?:\\\/\\\/[^"\\]+/gi)) {
    const n = normalizeUrl(m[0].replace(/\\\//g, "/"));
    if (n) out.push(n);
  }
  return [...new Set(out)];
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SetRadar/0.2; +https://setradar.ai)",
        Accept: "text/html",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!/html|text|xml/i.test(ct) && ct) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function classify(url: string): {
  field?: "soundcloud" | "youtube" | "instagram" | "twitter" | "website";
  setCandidate?: boolean;
  beatport?: boolean;
} {
  const host = hostOf(url) || "";
  if (/instagram\.com/i.test(host)) return { field: "instagram" };
  if (/(^|\.)(x|twitter)\.com$/i.test(host)) return { field: "twitter" };
  if (/soundcloud\.com/i.test(host)) {
    // profile vs track: /user vs /user/track
    const path = (() => {
      try {
        return new URL(url).pathname.split("/").filter(Boolean);
      } catch {
        return [];
      }
    })();
    if (path.length >= 2) return { setCandidate: true, field: undefined };
    return { field: "soundcloud" };
  }
  if (/youtube\.com|youtu\.be/i.test(host)) {
    if (/[?&]v=|youtu\.be\/|\/(live|shorts)\//i.test(url)) {
      return { setCandidate: true };
    }
    // Channel / handle pages → Dj.youtube
    if (/youtube\.com\/(@|channel\/|c\/|user\/)/i.test(url)) {
      return { field: "youtube" };
    }
    return {};
  }
  if (/beatport\.com\/(track|release)\//i.test(url)) return { beatport: true };
  if (isLinkHub(url)) return {};
  if (
    !/(facebook|tiktok|spotify|apple\.com|google|schema|w3\.org|cloudflare)/i.test(
      host,
    )
  ) {
    return { field: "website" };
  }
  return {};
}

type FillTarget =
  | { kind: "dj"; id: string }
  | { kind: "event"; id: string; name: string }
  | { kind: "label"; id: string };

async function fillSocial(
  prisma: PrismaClient,
  target: FillTarget,
  field: "soundcloud" | "youtube" | "instagram" | "twitter" | "website",
  url: string,
  current: Record<string, string | null | undefined>,
  stats: ScanStats,
  artistKeys: Set<string>,
  rejectedEventSocials?: string[],
): Promise<void> {
  if (current[field]) return;
  // Prefer first-party website over another hub if we already have a hub.
  if (field === "website" && current.website) return;
  // Labels / events have no youtube column — only fill on Dj.
  if (field === "youtube" && target.kind !== "dj") return;
  if (
    target.kind === "event" &&
    (field === "soundcloud" || field === "instagram" || field === "twitter") &&
    !eventMayClaimSocialUrl(target.name, url, artistKeys)
  ) {
    rejectedEventSocials?.push(url);
    return;
  }
  const data = { [field]: url };
  if (target.kind === "dj") {
    await prisma.dj.update({ where: { id: target.id }, data });
  } else if (target.kind === "event") {
    await prisma.event.update({ where: { id: target.id }, data });
  } else {
    await prisma.label.update({ where: { id: target.id }, data });
  }
  current[field] = url;
  stats.socialFills += 1;
}

async function scanPage(
  prisma: PrismaClient,
  target: FillTarget,
  pageUrl: string,
  current: Record<string, string | null | undefined>,
  stats: ScanStats,
  bag: {
    setCandidates: Set<string>;
    beatport: Set<string>;
    htmlText: string;
    rejectedEventSocials: string[];
  },
  artistKeys: Set<string>,
): Promise<void> {
  const html = await fetchHtml(pageUrl);
  if (!html) return;
  stats.pages += 1;
  bag.htmlText += `\n${html}`;
  let urls = extractUrlsFromHtml(html);
  urls = await expandAllLinkHubs(urls, { limit: 4, delayMs: 80 });

  for (const url of urls) {
    const c = classify(url);
    if (c.setCandidate) bag.setCandidates.add(url);
    if (c.beatport) bag.beatport.add(url);
    if (
      c.field === "soundcloud" ||
      c.field === "youtube" ||
      c.field === "instagram" ||
      c.field === "twitter"
    ) {
      await fillSocial(
        prisma,
        target,
        c.field,
        url,
        current,
        stats,
        artistKeys,
        bag.rejectedEventSocials,
      );
    } else if (
      c.field === "website" &&
      !current.website &&
      hostOf(url) !== hostOf(pageUrl)
    ) {
      // Keep the curated official site; don't overwrite with random outbound.
    }
  }
}

/** Lineup-artist socials scraped off an event site → matching Dj fill-null. */
async function harvestRejectedEventSocials(
  prisma: PrismaClient,
  urls: string[],
  stats: ScanStats,
): Promise<void> {
  if (!urls.length) return;
  const djs = await prisma.dj.findMany({
    select: {
      id: true,
      name: true,
      soundcloud: true,
      youtube: true,
      instagram: true,
      twitter: true,
    },
  });
  for (const url of [...new Set(urls)]) {
    const field = socialFieldFromUrl(url);
    if (!field) continue;
    const match = djs.find((d) => djMayClaimSocialUrl(d.name, url));
    if (!match || match[field]) continue;
    await prisma.dj.update({
      where: { id: match.id },
      data: { [field]: url },
    });
    match[field] = url;
    stats.socialFills += 1;
  }
}

function rosterMentions(html: string): string[] {
  const lower = html.toLowerCase();
  const hits: string[] = [];
  for (const a of ARTIST_ROSTER) {
    const name = a.name.toLowerCase();
    if (name.length < 3) continue;
    if (lower.includes(name)) hits.push(a.name);
  }
  return hits;
}

async function applyBeatportHints(
  prisma: PrismaClient,
  urls: string[],
  stats: ScanStats,
): Promise<void> {
  for (const url of urls.slice(0, 40)) {
    // https://www.beatport.com/track/title/12345678
    const m = url.match(/beatport\.com\/track\/([^/]+)\/(\d+)/i);
    if (!m) continue;
    const slugTitle = m[1].replace(/-/g, " ");
    const tracks = await prisma.track.findMany({
      where: {
        beatportUrl: null,
        title: { contains: slugTitle.split(" ").slice(0, 3).join(" ") },
      },
      take: 3,
    });
    for (const t of tracks) {
      // Loose match — only fill when artist token also appears in slug path.
      const artTok = t.artistName.toLowerCase().split(/\s+/)[0] ?? "";
      if (artTok.length >= 3 && !url.toLowerCase().includes(artTok)) continue;
      await prisma.track.update({
        where: { id: t.id },
        data: { beatportUrl: url.split("?")[0] },
      });
      stats.beatportHits += 1;
    }
  }
}

export async function scanEntityUrls(prisma: PrismaClient): Promise<ScanStats> {
  const stats: ScanStats = {
    pages: 0,
    socialFills: 0,
    artistsMentioned: 0,
    setCandidates: 0,
    beatportHits: 0,
  };
  const setCandidates = new Set<string>();
  const beatport = new Set<string>();
  const mentioned = new Set<string>();

  // Ensure curated venue websites exist before scanning.
  for (const ev of Object.values(KNOWN_EVENTS)) {
    const existing = await prisma.event.findUnique({ where: { slug: ev.slug } });
    if (!existing) {
      await prisma.event.create({
        data: {
          slug: ev.slug,
          name: ev.name,
          kind: ev.kind,
          location: ev.location ?? null,
          ...curatedEventSocialPatch(ev),
        },
      });
    } else {
      await prisma.event.update({
        where: { id: existing.id },
        data: {
          ...curatedEventSocialPatch(ev),
          location: existing.location ?? ev.location ?? null,
          name: existing.name || ev.name,
        },
      });
    }
  }

  const artistKeys = await loadArtistSocialKeys(prisma);

  const events = await prisma.event.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      website: true,
      soundcloud: true,
      instagram: true,
      twitter: true,
    },
  });
  for (const e of events) {
    if (!e.website) continue;
    const bag = {
      setCandidates,
      beatport,
      htmlText: "",
      rejectedEventSocials: [] as string[],
    };
    const current: Record<string, string | null | undefined> = {
      website: e.website,
      soundcloud: e.soundcloud,
      instagram: e.instagram,
      twitter: e.twitter,
    };
    await scanPage(
      prisma,
      { kind: "event", id: e.id, name: e.name },
      e.website,
      current,
      stats,
      bag,
      artistKeys,
    );
    for (const name of rosterMentions(bag.htmlText)) mentioned.add(name);
    await harvestRejectedEventSocials(prisma, bag.rejectedEventSocials, stats);
  }

  const djs = await prisma.dj.findMany({
    select: {
      id: true,
      slug: true,
      website: true,
      soundcloud: true,
      youtube: true,
      instagram: true,
      twitter: true,
    },
  });
  for (const d of djs) {
    if (!d.website) continue;
    const bag = {
      setCandidates,
      beatport,
      htmlText: "",
      rejectedEventSocials: [] as string[],
    };
    const current: Record<string, string | null | undefined> = {
      website: d.website,
      soundcloud: d.soundcloud,
      youtube: d.youtube,
      instagram: d.instagram,
      twitter: d.twitter,
    };
    await scanPage(
      prisma,
      { kind: "dj", id: d.id },
      d.website,
      current,
      stats,
      bag,
      artistKeys,
    );
  }

  const labels = await prisma.label.findMany({
    select: {
      id: true,
      website: true,
      soundcloud: true,
      instagram: true,
    },
  });
  for (const l of labels) {
    if (!l.website) continue;
    const bag = {
      setCandidates,
      beatport,
      htmlText: "",
      rejectedEventSocials: [] as string[],
    };
    const current: Record<string, string | null | undefined> = {
      website: l.website,
      soundcloud: l.soundcloud,
      instagram: l.instagram,
      twitter: null,
    };
    await scanPage(
      prisma,
      { kind: "label", id: l.id },
      l.website,
      current,
      stats,
      bag,
      artistKeys,
    );
  }

  // Ensure mentioned roster artists exist as DJ stubs (socials from roster).
  for (const name of mentioned) {
    const roster = ARTIST_ROSTER.find((a) => a.name === name);
    if (!roster) continue;
    const slug = slugify(roster.name);
    const existing = await prisma.dj.findUnique({ where: { slug } });
    if (existing) continue;
    const socials = djSocialsFromKnown({
      name: roster.name,
      soundcloudPermalink: roster.soundcloud?.permalink,
      socials: roster.socials,
      website: roster.website,
    });
    await prisma.dj.create({
      data: {
        slug,
        name: roster.name,
        homeCity: roster.homeCity ?? null,
        accent: roster.accent,
        ...socials,
      },
    });
    stats.artistsMentioned += 1;
  }

  await applyBeatportHints(prisma, [...beatport], stats);

  stats.setCandidates = setCandidates.size;
  try {
    const dir = join(process.cwd(), "data");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "url-scan-candidates.json"),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          setUrls: [...setCandidates].slice(0, 200),
          beatportUrls: [...beatport].slice(0, 100),
          rosterMentions: [...mentioned].sort(),
        },
        null,
        2,
      ),
    );
  } catch (err) {
    console.warn(
      "[scan-urls] could not write candidates:",
      err instanceof Error ? err.message : err,
    );
  }

  console.log(
    `[scan-urls] pages=${stats.pages} socialFills=${stats.socialFills}` +
      ` mentions=${mentioned.size} setCandidates=${stats.setCandidates}` +
      ` beatport=${stats.beatportHits}`,
  );
  return stats;
}
