import { artistsFromLine } from "./artists";
import { uniqueStrings } from "./html";
import type { VenueNightSeed } from "./types";

function unfoldIcs(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
}

function icsValue(block: string, key: string): string | null {
  const re = new RegExp(`^${key}(?:;[^:]*)?:(.*)$`, "im");
  const m = block.match(re);
  if (!m?.[1]) return null;
  return m[1]
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\\\/g, "\\")
    .trim();
}

function icsDate(raw: string | null): string | null {
  if (!raw) return null;
  const iso = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const compact = raw.match(/(\d{4})(\d{2})(\d{2})(?:T|$)/);
  if (!compact) return null;
  return `${compact[1]}-${compact[2]}-${compact[3]}`;
}

export function parseIcsEvents(ics: string, pageUrl: string): VenueNightSeed[] {
  const text = unfoldIcs(ics);
  const blocks = text.split(/BEGIN:VEVENT/i).slice(1);
  const nights: VenueNightSeed[] = [];
  for (const raw of blocks) {
    const block = raw.split(/END:VEVENT/i)[0] ?? raw;
    const title = icsValue(block, "SUMMARY");
    const startsAt = icsDate(icsValue(block, "DTSTART"));
    if (!title || !startsAt) continue;
    const endsAt = icsDate(icsValue(block, "DTEND")) ?? undefined;
    const url = icsValue(block, "URL") || pageUrl;
    const location = icsValue(block, "LOCATION");
    const artists = uniqueStrings(
      artistsFromLine(title).concat(
        location && !/illuzion|phuket|patong|thailand/i.test(location)
          ? []
          : [],
      ),
    );
    const room = location?.split(",")[0]?.trim();
    nights.push({
      title,
      startsAt,
      endsAt,
      sourceUrl: url,
      rooms: room ? [{ name: room, artists }] : undefined,
      artists,
    });
  }
  return nights;
}

export function mergeNights(a: VenueNightSeed[], b: VenueNightSeed[]): VenueNightSeed[] {
  const byKey = new Map<string, VenueNightSeed>();
  for (const night of [...a, ...b]) {
    const key = `${night.startsAt}|${night.title.toLowerCase()}`;
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, night);
      continue;
    }
    byKey.set(key, {
      ...prev,
      ...night,
      artists: uniqueStrings([...prev.artists, ...night.artists]),
      rooms: [...(prev.rooms ?? []), ...(night.rooms ?? [])],
      ticketsUrl: night.ticketsUrl || prev.ticketsUrl,
      sourceUrl: night.sourceUrl || prev.sourceUrl,
      endsAt: night.endsAt || prev.endsAt,
    });
  }
  return [...byKey.values()].sort((x, y) =>
    x.startsAt === y.startsAt
      ? x.title.localeCompare(y.title)
      : x.startsAt.localeCompare(y.startsAt),
  );
}
