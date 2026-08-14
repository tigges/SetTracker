/**
 * Event vs artist social ownership.
 *
 * Festival / club websites often list lineup artist profiles. Those URLs
 * must never land on Event.soundcloud / instagram / twitter. Curated
 * KNOWN_EVENTS values are authoritative — omitted fields clear leftovers.
 */

import type { PrismaClient } from "@prisma/client";
import { DJ_SOCIAL_PINS } from "./djSocialPins.data";
import type { CanonicalEvent } from "./events";

const SOCIAL_RESERVED = new Set([
  "you",
  "discover",
  "sets",
  "search",
  "pages",
  "intent",
  "share",
  "home",
  "i",
  "p",
  "reel",
  "reels",
  "stories",
  "explore",
  "login",
  "signup",
  "about",
]);

const EVENT_STOP = new Set([
  "the",
  "and",
  "music",
  "festival",
  "fest",
  "official",
  "live",
  "club",
  "event",
  "radio",
  "stage",
  "open",
  "air",
]);

export function normalizeSocialUrl(
  raw: string | null | undefined,
): string | null {
  if (!raw?.trim()) return null;
  let u = raw.trim();
  if (!/^https?:\/\//i.test(u)) {
    if (/^(www\.)?[\w.-]+\.[a-z]{2,}/i.test(u)) u = `https://${u}`;
    else return null;
  }
  try {
    const parsed = new URL(u);
    let host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "twitter.com" || host === "mobile.twitter.com") host = "x.com";
    if (host === "m.soundcloud.com") host = "soundcloud.com";
    const path = parsed.pathname.replace(/\/+$/, "");
    return `https://${host}${path}`;
  } catch {
    return null;
  }
}

/** `soundcloud:adambeyer` / `twitter:andreaoliva1` / `instagram:streetparade` */
export function socialProfileKey(
  url: string | null | undefined,
): string | null {
  const n = normalizeSocialUrl(url);
  if (!n) return null;
  try {
    const u = new URL(n);
    const host = u.hostname;
    const parts = u.pathname.split("/").filter(Boolean);
    const handle = (parts[0] ?? "").replace(/^@/, "").toLowerCase();
    if (!handle || SOCIAL_RESERVED.has(handle)) return null;
    if (host === "soundcloud.com") {
      if (parts.length !== 1) return null;
      return `soundcloud:${handle}`;
    }
    if (host === "instagram.com") return `instagram:${handle}`;
    if (host === "x.com") return `twitter:${handle}`;
    return null;
  } catch {
    return null;
  }
}

export function eventNameTokens(name: string): Set<string> {
  return new Set(
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/['’]/g, "")
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 3 && !EVENT_STOP.has(t)),
  );
}

export function handleMatchesEvent(handle: string, eventName: string): boolean {
  const raw = handle.toLowerCase().replace(/^@/, "");
  const compactHandle = raw.replace(/[_-]/g, "");
  if (!compactHandle) return false;
  const tokens = eventNameTokens(eventName);
  if (tokens.has(raw)) return true;
  const compactName = [...tokens].join("");
  if (compactHandle === compactName) return true;
  for (const t of tokens) {
    const tok = t.replace(/[_-]/g, "");
    if (tok.length >= 4 && compactHandle.includes(tok)) return true;
    if (tok.length >= 3 && (compactHandle === tok || compactHandle.startsWith(tok))) {
      return true;
    }
  }
  return false;
}

export function addSocialUrlToKeys(
  keys: Set<string>,
  url: string | null | undefined,
): void {
  const key = socialProfileKey(url);
  if (key) keys.add(key);
}

export function artistSocialKeysFromPins(
  pins: Array<{
    soundcloud?: string | null;
    instagram?: string | null;
    twitter?: string | null;
  }> = DJ_SOCIAL_PINS,
): Set<string> {
  const keys = new Set<string>();
  for (const p of pins) {
    addSocialUrlToKeys(keys, p.soundcloud);
    addSocialUrlToKeys(keys, p.instagram);
    addSocialUrlToKeys(keys, p.twitter);
  }
  return keys;
}

export function mergeArtistSocialKeys(
  keys: Set<string>,
  rows: Array<{
    soundcloud?: string | null;
    instagram?: string | null;
    twitter?: string | null;
  }>,
): Set<string> {
  for (const r of rows) {
    addSocialUrlToKeys(keys, r.soundcloud);
    addSocialUrlToKeys(keys, r.instagram);
    addSocialUrlToKeys(keys, r.twitter);
  }
  return keys;
}

export function isArtistOwnedSocial(
  url: string,
  artistKeys: Set<string>,
): boolean {
  const key = socialProfileKey(url);
  return Boolean(key && artistKeys.has(key));
}

/**
 * Whether an Event may claim this SC / IG / X URL.
 * Rejects known DJ profiles and handles that do not overlap the event name
 * (lineup pages list artist accounts first).
 */
export function eventMayClaimSocialUrl(
  eventName: string,
  url: string,
  artistKeys: Set<string>,
): boolean {
  const key = socialProfileKey(url);
  if (!key) return false;
  if (artistKeys.has(key)) return false;
  const handle = key.split(":")[1] ?? "";
  return handleMatchesEvent(handle, eventName);
}

/** Curated seed → DB patch. Missing fields become null (clear leftovers). */
export function curatedEventSocialPatch(ev: CanonicalEvent): {
  website: string | null;
  soundcloud: string | null;
  instagram: string | null;
  twitter: string | null;
} {
  return {
    website: ev.website ?? null,
    soundcloud: ev.soundcloud ?? null,
    instagram: ev.instagram ?? null,
    twitter: ev.twitter ?? null,
  };
}

export function eventSocialCleanupPatch(
  event: {
    name: string;
    soundcloud?: string | null;
    instagram?: string | null;
    twitter?: string | null;
  },
  artistKeys: Set<string>,
  curated?: CanonicalEvent,
): {
  soundcloud?: string | null;
  instagram?: string | null;
  twitter?: string | null;
} {
  const patch: {
    soundcloud?: string | null;
    instagram?: string | null;
    twitter?: string | null;
  } = {};
  const fields = ["soundcloud", "instagram", "twitter"] as const;
  for (const field of fields) {
    if (curated) {
      const next = curated[field] ?? null;
      if ((event[field] ?? null) !== next) patch[field] = next;
      continue;
    }
    const url = event[field];
    if (!url) continue;
    if (!eventMayClaimSocialUrl(event.name, url, artistKeys)) {
      patch[field] = null;
    }
  }
  return patch;
}

/** Pins + roster + catalog Dj rows — used when scrubbing Event socials. */
export async function loadArtistSocialKeys(
  prisma: PrismaClient,
): Promise<Set<string>> {
  const keys = artistSocialKeysFromPins();
  try {
    const { ARTIST_ROSTER } = await import("./roster");
    for (const a of ARTIST_ROSTER) {
      if (a.soundcloud?.permalink) {
        addSocialUrlToKeys(
          keys,
          `https://soundcloud.com/${a.soundcloud.permalink}`,
        );
      }
      for (const s of a.socials ?? []) addSocialUrlToKeys(keys, s);
    }
  } catch {
    /* roster is ingest-only; pins still apply */
  }
  const djs = await prisma.dj.findMany({
    select: { soundcloud: true, instagram: true, twitter: true },
  });
  return mergeArtistSocialKeys(keys, djs);
}
