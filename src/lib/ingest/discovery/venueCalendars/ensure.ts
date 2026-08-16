import { createHash } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { slugify } from "../../types";
import { loadVenueCalendarSeed, scanVenueCalendars } from "./scan";
import { VENUE_CALENDAR_SOURCES } from "./sources";
import type { VenueNightSeed } from "./types";

function nightSlug(venueSlug: string, night: VenueNightSeed): string {
  const base = `${venueSlug}-${night.startsAt}-${slugify(night.title)}`;
  return base.slice(0, 180) || `${venueSlug}-${night.startsAt}`;
}

function sourceHash(night: VenueNightSeed): string {
  return createHash("sha1")
    .update(
      JSON.stringify({
        title: night.title,
        startsAt: night.startsAt,
        artists: night.artists,
        rooms: night.rooms,
        sourceUrl: night.sourceUrl,
      }),
    )
    .digest("hex")
    .slice(0, 16);
}

function dayDate(iso: string): Date {
  return new Date(`${iso}T12:00:00.000Z`);
}

export async function persistVenueCalendarNights(
  prisma: PrismaClient,
  parsed: Array<{ source: (typeof VENUE_CALENDAR_SOURCES)[number]; nights: VenueNightSeed[] }>,
): Promise<{ created: number; updated: number; venues: number; nights: number }> {

  let created = 0;
  let updated = 0;
  let nights = 0;
  let venues = 0;

  for (const { source, nights: rows } of parsed) {
    if (!rows.length) continue;
    nights += rows.length;
    let event = await prisma.event.findUnique({ where: { slug: source.venueSlug } });
    if (!event) {
      event = await prisma.event.create({
        data: {
          slug: source.venueSlug,
          name: source.venueName,
          kind: "club",
          location: source.location ?? null,
          website: source.website,
        },
      });
      venues += 1;
    } else if (!event.website) {
      await prisma.event.update({
        where: { id: event.id },
        data: { website: source.website, kind: event.kind === "event" ? "club" : event.kind },
      });
    }

    for (const row of rows) {
      const slug = nightSlug(source.venueSlug, row);
      const hash = sourceHash(row);
      const data = {
        title: row.title,
        startsAt: dayDate(row.startsAt),
        endsAt: row.endsAt ? dayDate(row.endsAt) : null,
        sourceUrl: row.sourceUrl || source.calendarUrl,
        ticketsUrl: row.ticketsUrl ?? null,
        roomsJson: row.rooms?.length ? JSON.stringify(row.rooms) : null,
        artistsJson: row.artists.length ? JSON.stringify(row.artists) : null,
        sourceHash: hash,
        fetchedAt: new Date(),
      };
      const existing = await prisma.venueNight.findUnique({ where: { slug } });
      if (!existing) {
        try {
          await prisma.venueNight.create({
            data: { slug, eventId: event.id, ...data },
          });
          created += 1;
        } catch {
          const clash = await prisma.venueNight.findUnique({
            where: {
              eventId_startsAt_title: {
                eventId: event.id,
                startsAt: data.startsAt,
                title: data.title,
              },
            },
          });
          if (clash && clash.sourceHash !== hash) {
            await prisma.venueNight.update({
              where: { id: clash.id },
              data,
            });
            updated += 1;
          }
        }
        continue;
      }
      if (existing.sourceHash === hash) continue;
      await prisma.venueNight.update({ where: { id: existing.id }, data });
      updated += 1;
    }
  }

  console.log(
    `[venue-calendar] ensure created=${created} updated=${updated} nights=${nights} venues+${venues}`,
  );
  return { created, updated, venues, nights };
}

export async function ensureVenueCalendarNights(
  prisma: PrismaClient,
  opts?: { live?: boolean },
): Promise<{ created: number; updated: number; venues: number; nights: number }> {
  const live = opts?.live === true || process.env.VENUE_CALENDAR_LIVE === "1";
  const parsed = live
    ? await scanVenueCalendars()
    : VENUE_CALENDAR_SOURCES.map((source) => ({
        source,
        nights: loadVenueCalendarSeed(source),
        detail: "seed" as const,
      }));
  return persistVenueCalendarNights(prisma, parsed);
}
