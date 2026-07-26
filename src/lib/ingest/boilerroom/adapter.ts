/**
 * Boiler Room adapter — bridge boilerroom.tv sessions ↔ YouTube / SoundCloud.
 *
 * - YouTube @boilerroom remains the primary long-form video catalog (venues.ts)
 * - This adapter scrapes boilerroom.tv sessions and ingests playable
 *   SoundCloud media with sourceName "Boiler Room"
 */

import { hashRawSetContent } from "../hash";
import { artistsForSet } from "../artists";
import {
  scGet,
  sleep as scSleep,
  type ScTrack,
} from "../soundcloud/client";
import {
  parseDescriptionTracklist,
  parseTimedComments,
  mergeTracklistSignals,
} from "../soundcloud/parseTracklist";
import { fetchTrackComments } from "../soundcloud/client";
import { slugify, type RawSet, type SourceAdapter } from "../types";
import {
  fetchSession,
  guessSessionSlugFromYtTitle,
  listSessionSlugs,
  sleep,
} from "./sessions";

const ACCENT = "#e10600";
export const BOILERROOM_SESSION_MAX = Number(
  process.env.BOILERROOM_SESSION_MAX || 10,
);

function primaryFromSessionTitle(title: string) {
  // "London: Tiffany Day" / "London: Ayra Starr pres. STARRGIRL"
  const m = title.match(/^[^:]+:\s*(.+)$/);
  const credit = (m?.[1] || title).replace(/\spres\.?\s.+$/i, "").trim();
  const { primary, collaborators } = artistsForSet(credit, undefined, {
    accent: ACCENT,
  });
  if (primary.name === credit || primary.name.length < 2) {
    return {
      primary: {
        name: credit || "Boiler Room",
        slug: slugify(credit || "boiler-room"),
        accent: ACCENT,
      },
      collaborators,
    };
  }
  return { primary: { ...primary, accent: ACCENT }, collaborators };
}

async function resolveSoundCloudTrack(
  url: string,
): Promise<ScTrack | null> {
  try {
    // Prefer platform artist tracks over the bare /platform hub
    if (/soundcloud\.com\/platform\/?$/i.test(url)) return null;
    const track = await scGet<ScTrack>(
      `/resolve?url=${encodeURIComponent(url)}`,
    );
    await scSleep(120);
    if (!track?.id) return null;
    return track;
  } catch {
    return null;
  }
}

function durationSecOf(track: ScTrack): number {
  return Math.max(0, Math.round((track.full_duration || track.duration || 0) / 1000));
}

async function sessionScToRawSet(
  session: Awaited<ReturnType<typeof fetchSession>>,
  track: ScTrack,
): Promise<RawSet | null> {
  if (!session) return null;
  const durationSec = durationSecOf(track);
  if (durationSec < 15 * 60) return null;

  const fromDesc = parseDescriptionTracklist(
    track.description,
    durationSec,
    "soundcloud",
  );
  let fromComments = parseTimedComments([], durationSec);
  if ((track.comment_count ?? 0) > 0 && durationSec >= 20 * 60) {
    try {
      fromComments = parseTimedComments(
        await fetchTrackComments(track.id, 150),
        durationSec,
      );
      await scSleep(100);
    } catch {
      /* ignore */
    }
  }
  const plays = mergeTracklistSignals(fromDesc, fromComments);
  // Allow BR sessions even with sparse tracklists — audio is the asset.
  if (plays.length === 0 && durationSec < 25 * 60) return null;

  const { primary, collaborators } = primaryFromSessionTitle(session.title);
  const playbackUrl =
    track.permalink_url ||
    (typeof track.permalink === "string" && track.permalink.startsWith("http")
      ? track.permalink
      : null);
  if (!playbackUrl) return null;

  const publishedAt = new Date(track.display_date || track.created_at || "");
  // Provenance = boilerroom.tv; playback = original SC audio host.
  const raw: RawSet = {
    sourceSlug: `br-${session.slug}-${track.id}`.slice(0, 120),
    title: session.title,
    type: "festival",
    genre: "House",
    primaryArtist: primary,
    collaborators,
    seriesName: "Boiler Room",
    eventName: "Boiler Room",
    eventKind: "livestream",
    publishedAt: Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
    durationSec,
    sourceName: "Boiler Room",
    sourceUrl: session.pageUrl,
    playbackUrl,
    cover: ACCENT,
    plays,
  };
  raw.sourceHash = hashRawSetContent(raw);
  return raw;
}

export function createBoilerRoomAdapter(): SourceAdapter {
  return {
    id: "boilerroom",
    label: "Boiler Room (boilerroom.tv)",
    async fetchRecent(): Promise<RawSet[]> {
      const need = Math.max(1, BOILERROOM_SESSION_MAX);
      console.log(`[boilerroom] scrape up to ${need} sessions`);
      const slugs = await listSessionSlugs();
      console.log(`[boilerroom] index sessions=${slugs.length}`);

      const out: RawSet[] = [];
      for (const slug of slugs) {
        if (out.length >= need) break;
        try {
          const session = await fetchSession(slug);
          await sleep(150);
          if (!session) continue;

          // Prefer SoundCloud platform uploads linked on the session page.
          const scCandidates = session.soundcloudUrls.filter((u) =>
            /\/platform\/.+/i.test(u),
          );
          let added = false;
          for (const url of scCandidates.slice(0, 3)) {
            const track = await resolveSoundCloudTrack(url);
            if (!track) continue;
            const raw = await sessionScToRawSet(session, track);
            if (!raw) continue;
            out.push(raw);
            added = true;
            console.log(
              `[boilerroom] + ${raw.sourceSlug} (${raw.plays.length} plays, SC)`,
            );
            break; // one primary mix per session page
          }

          if (!added && session.youtubeIds[0]) {
            // YT-only sessions: leave to @boilerroom venue poll; just log bridge.
            console.log(
              `[boilerroom] session ${slug} has YT ${session.youtubeIds[0]} (venue poll)`,
            );
          } else if (!added) {
            console.log(`[boilerroom] skip ${slug}: no playable SC/YT`);
          }
        } catch (err) {
          console.warn(
            `[boilerroom] skip ${slug}:`,
            err instanceof Error ? err.message : err,
          );
        }
      }

      return out;
    },
  };
}

export const boilerroomAdapter = createBoilerRoomAdapter();

/** Resolve a boilerroom.tv session page for a YT Boiler Room title when guessable. */
export async function boilerroomSourceUrlForYtTitle(
  title: string,
): Promise<string | null> {
  const guess = guessSessionSlugFromYtTitle(title);
  if (!guess) return null;
  const session = await fetchSession(guess);
  if (!session) return null;
  return session.pageUrl;
}
