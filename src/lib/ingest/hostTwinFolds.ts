/**
 * Fold official YT + SC twins onto one catalog row.
 *
 * Same 1001 seed object + both official permalinks already known.
 * Survivor keeps ranked playback (SC > Mixcloud > YT). Unused hosts
 * stay on the survivor. Secondary row is deleted. Never invents URLs.
 */

import type { PrismaClient } from "@prisma/client";
import { hostUrlFillNull } from "../playback";
import { preferPlaybackUrl } from "./hearthis/playback";
import {
  durationsCompatible,
  hostTwinFoldCandidatesFromSeeds,
} from "./hostTwins";

export async function applySetHostTwinFolds(
  prisma: PrismaClient,
): Promise<{ folded: number; skipped: number }> {
  let folded = 0;
  let skipped = 0;
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
    await prisma.played.deleteMany({ where: { setId: from.id } });
    await prisma.setArtist.deleteMany({ where: { setId: from.id } });
    await prisma.set.delete({ where: { id: from.id } });
    folded += 1;
    console.log(
      `[host-twins] fold ${candidate.fromSlug} → ${candidate.toSlug}`,
    );
  }
  return { folded, skipped };
}
