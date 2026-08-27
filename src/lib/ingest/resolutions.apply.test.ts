/**
 * applyResolutionRows against a throwaway set in the local SQLite.
 * Creates and deletes its own rows so a leftover fixture cannot leak.
 */
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { applyResolutionRows } from "./resolutions";

const SLUG = "sc-resolution-insert-fixture";

async function main() {
  const prisma = new PrismaClient();
  try {
    try {
      await prisma.set.count();
    } catch {
      console.log("ingest/resolutions.apply.test.ts skip (no catalog db)");
      return;
    }
    const existing = await prisma.set.findUnique({ where: { slug: SLUG } });
    if (existing) {
      await prisma.played.deleteMany({ where: { setId: existing.id } });
      await prisma.set.delete({ where: { id: existing.id } });
    }

    const set = await prisma.set.create({
      data: {
        slug: SLUG,
        title: "Resolution insert fixture",
        type: "radio",
        publishedAt: new Date("2026-01-01"),
        durationSec: 3600,
        cover: "#111111",
      },
    });

    // Two real cues. Display play 1 on a sparse radio set is often a
    // synthetic expected slot at a different clock than DB position 1.
    await prisma.played.createMany({
      data: [
        {
          setId: set.id,
          position: 1,
          timestamp: 90,
          idStatus: "unparsed",
          provenance: "soundcloud",
          rawText: "host ask",
        },
        {
          setId: set.id,
          position: 2,
          timestamp: 600,
          idStatus: "unparsed",
          provenance: "soundcloud",
          rawText: "other",
        },
      ],
    });

    const first = await applyResolutionRows(prisma, [
      {
        setSlug: SLUG,
        position: 1,
        timestamp: 348,
        trackTitle: "Fixture Sweet",
        artistName: "Fixture Hey",
        suggestedBy: "suggest-id",
      },
      {
        setSlug: SLUG,
        position: 8,
        timestamp: 1972,
        trackTitle: "Fixture Panties",
        artistName: "Fixture Fallon",
        label: "Black Book Records",
        suggestedBy: "suggest-id",
      },
    ]);
    assert.deepEqual(
      { applied: first.applied, inserted: first.inserted, skipped: first.skipped, missing: first.missing },
      { applied: 2, inserted: 2, skipped: 0, missing: 0 },
    );

    const plays = await prisma.played.findMany({
      where: { setId: set.id },
      include: { track: { include: { label: true } } },
      orderBy: { timestamp: "asc" },
    });
    assert.equal(plays.length, 4, "two real cues plus two inserted resolutions");

    const host = plays.find((p) => p.timestamp === 90);
    assert.equal(host?.idStatus, "unparsed", "display-index fallback must not land on the real cue");
    assert.equal(host?.rawText, "host ask");

    const sweet = plays.find((p) => p.timestamp === 348);
    assert.ok(sweet);
    assert.equal(sweet!.idStatus, "community_resolved");
    assert.equal(sweet!.provenance, "community");
    assert.equal(sweet!.track?.artistName, "Fixture Hey");
    assert.equal(sweet!.track?.title, "Fixture Sweet");

    const fallon = plays.find((p) => p.timestamp === 1972);
    assert.ok(fallon);
    assert.equal(fallon!.track?.title, "Fixture Panties");
    assert.equal(fallon!.track?.label?.slug, "blackbook");

    const again = await applyResolutionRows(prisma, [
      {
        setSlug: SLUG,
        position: 8,
        timestamp: 1972,
        trackTitle: "Fixture Panties",
        artistName: "Fixture Fallon",
        suggestedBy: "suggest-id",
      },
    ]);
    assert.equal(again.applied, 0);
    assert.equal(again.skipped, 1);
    assert.equal(again.inserted, 0);

    const trackIds = plays.map((p) => p.trackId).filter(Boolean) as string[];
    const idTrackIds = plays.map((p) => p.idTrackId).filter(Boolean) as string[];
    await prisma.played.deleteMany({ where: { setId: set.id } });
    if (idTrackIds.length) {
      await prisma.idTrack.deleteMany({ where: { id: { in: idTrackIds } } });
    }
    if (trackIds.length) {
      await prisma.track.deleteMany({
        where: { id: { in: trackIds }, slug: { startsWith: "fixture-" } },
      });
    }
    await prisma.set.delete({ where: { id: set.id } });
    console.log("ingest/resolutions.apply.test.ts ok");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
