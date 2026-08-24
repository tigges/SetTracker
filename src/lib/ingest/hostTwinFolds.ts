/**
 * Fold official YT + SC twins onto one catalog row.
 *
 * Same 1001 seed object + both official permalinks already known.
 * Survivor keeps ranked playback (SC > Mixcloud > YT). Unused hosts
 * stay on the survivor. Copy overlay / first-party clocks onto the
 * survivor before delete. Never copy ACR offsets. Never invents URLs.
 */

import type { PrismaClient } from "@prisma/client";
import { hostUrlFillNull } from "../playback";
import type { RawPlay } from "./types";
import { preferPlaybackUrl } from "./hearthis/playback";
import {
  durationsCompatible,
  firstPartyPlayCount,
  foldCopyPlayCount,
  hostTwinFoldCandidatesFromSeeds,
  mergeFoldCopyPlays,
  shouldCopyFoldTracklist,
} from "./hostTwins";
import { writePlays } from "./tracklists1001/applyToCatalog";

function playedToRaw(row: {
  position: number;
  timestamp: number;
  provenance: string;
  idStatus: string;
  rawText: string | null;
  track: { title: string; artistName: string } | null;
}): RawPlay {
  return {
    position: row.position,
    timestamp: row.timestamp,
    provenance: row.provenance as RawPlay["provenance"],
    idStatus: row.idStatus as RawPlay["idStatus"],
    trackTitle: row.track?.title,
    artistName: row.track?.artistName,
    rawText: row.rawText ?? undefined,
  };
}

export async function applySetHostTwinFolds(
  prisma: PrismaClient,
): Promise<{ folded: number; skipped: number; clocksCopied: number }> {
  let folded = 0;
  let skipped = 0;
  let clocksCopied = 0;
  for (const candidate of hostTwinFoldCandidatesFromSeeds()) {
    const from = await prisma.set.findUnique({
      where: { slug: candidate.fromSlug },
    });
    const to = await prisma.set.findUnique({
      where: { slug: candidate.toSlug },
    });
    if (!from || !to || from.id === to.id) {
      skipped += 1;
      continue;
    }
    if (
      from.durationSec >= 20 * 60 &&
      to.durationSec >= 20 * 60 &&
      !durationsCompatible(from.durationSec, to.durationSec)
    ) {
      skipped += 1;
      continue;
    }
    const hosts = hostUrlFillNull(
      {
        soundcloudUrl: to.soundcloudUrl,
        youtubeUrl: to.youtubeUrl,
        mixcloudUrl: to.mixcloudUrl,
      },
      {
        soundcloudUrl: from.soundcloudUrl,
        youtubeUrl: from.youtubeUrl,
        mixcloudUrl: from.mixcloudUrl,
      },
      candidate.hosts,
    );
    const playback = preferPlaybackUrl(
      preferPlaybackUrl(
        preferPlaybackUrl(to.playbackUrl, from.playbackUrl),
        candidate.hosts.soundcloudUrl,
      ),
      candidate.hosts.mixcloudUrl,
    );
    await prisma.set.update({
      where: { id: to.id },
      data: {
        ...(playback && playback !== to.playbackUrl
          ? { playbackUrl: playback }
          : {}),
        ...hosts,
      },
    });
    const playSelect = {
      include: { track: { select: { title: true, artistName: true } } },
      orderBy: { position: "asc" as const },
    };
    const [fromPlays, toPlays] = await Promise.all([
      prisma.played.findMany({ where: { setId: from.id }, ...playSelect }),
      prisma.played.findMany({ where: { setId: to.id }, ...playSelect }),
    ]);
    const donorFold = foldCopyPlayCount(fromPlays);
    const recipFold = foldCopyPlayCount(toPlays);
    if (
      shouldCopyFoldTracklist(
        {
          durationSec: from.durationSec,
          foldCopy: donorFold,
          firstParty: firstPartyPlayCount(fromPlays),
        },
        { durationSec: to.durationSec, foldCopy: recipFold },
      )
    ) {
      const merged = mergeFoldCopyPlays(
        toPlays.map(playedToRaw),
        fromPlays.map(playedToRaw),
      );
      if (foldCopyPlayCount(merged) > recipFold) {
        await writePlays(prisma, to.id, merged);
        clocksCopied += 1;
        console.log(
          `[host-twins] fold clocks ${candidate.fromSlug} → ${candidate.toSlug} ${recipFold} → ${foldCopyPlayCount(merged)}`,
        );
      }
    }
    await prisma.played.deleteMany({ where: { setId: from.id } });
    await prisma.setArtist.deleteMany({ where: { setId: from.id } });
    await prisma.set.delete({ where: { id: from.id } });
    folded += 1;
    console.log(
      `[host-twins] fold ${candidate.fromSlug} → ${candidate.toSlug}`,
    );
  }
  return { folded, skipped, clocksCopied };
}
