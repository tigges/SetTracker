import { sanitizeArtistName } from "../../../artistName";
import {
  artistsFromBrokenLines,
  artistsFromCommaList,
  artistsFromLine,
  cleanArtistToken,
} from "./artists";
import {
  absoluteUrl,
  decodeEntities,
  isoDay,
  isoDayFromIso,
  parseDayMonth,
  parseMonthName,
  stripTags,
  unescapeJsonish,
  uniqueStrings,
} from "./html";
import { mergeNights, parseIcsEvents } from "./ics";
import type { VenueCalendarSource, VenueNightRoom, VenueNightSeed } from "./types";

function night(
  title: string,
  startsAt: string,
  opts: Partial<VenueNightSeed> = {},
): VenueNightSeed | null {
  const cleanTitle = decodeEntities(title).replace(/\s+/g, " ").trim();
  if (!cleanTitle || !startsAt) return null;
  const artists = uniqueStrings(opts.artists ?? []);
  return {
    title: cleanTitle,
    startsAt,
    endsAt: opts.endsAt,
    sourceUrl: opts.sourceUrl ?? "",
    ticketsUrl: opts.ticketsUrl,
    rooms: opts.rooms,
    artists,
  };
}

function collectJsonLd(html: string): unknown[] {
  const out: unknown[] = [];
  for (const m of html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      out.push(JSON.parse(m[1]!));
    } catch {
      /* ignore broken blocks */
    }
  }
  return out;
}

function walkJson(node: unknown, into: unknown[]): void {
  if (node == null) return;
  if (Array.isArray(node)) {
    for (const item of node) walkJson(item, into);
    return;
  }
  if (typeof node !== "object") return;
  const obj = node as Record<string, unknown>;
  into.push(obj);
  if (obj["@graph"]) walkJson(obj["@graph"], into);
}

function jsonLdType(node: Record<string, unknown>): string {
  const t = node["@type"];
  if (typeof t === "string") return t;
  if (Array.isArray(t)) return t.map(String).join(",");
  return "";
}

function performerNames(node: unknown): string[] {
  if (!node) return [];
  const list = Array.isArray(node) ? node : [node];
  const names: string[] = [];
  for (const item of list) {
    if (typeof item === "string") {
      names.push(...artistsFromLine(item));
      continue;
    }
    if (item && typeof item === "object" && "name" in item) {
      const n = (item as { name?: unknown }).name;
      if (typeof n === "string") names.push(...artistsFromLine(n));
    }
  }
  return uniqueStrings(names);
}

export function parseJsonLdEvents(
  html: string,
  pageUrl: string,
): VenueNightSeed[] {
  const nodes: unknown[] = [];
  for (const block of collectJsonLd(html)) walkJson(block, nodes);
  const nights: VenueNightSeed[] = [];
  for (const raw of nodes) {
    if (!raw || typeof raw !== "object") continue;
    const obj = raw as Record<string, unknown>;
    const type = jsonLdType(obj);
    if (!/MusicEvent|Event\b/i.test(type) || /EventSeries/i.test(type)) continue;
    const title = typeof obj.name === "string" ? obj.name : "";
    const start = typeof obj.startDate === "string" ? isoDayFromIso(obj.startDate) : null;
    if (!title || !start) continue;
    const end =
      typeof obj.endDate === "string" ? isoDayFromIso(obj.endDate) ?? undefined : undefined;
    const url =
      typeof obj.url === "string"
        ? obj.url
        : typeof obj["@id"] === "string"
          ? String(obj["@id"]).replace(/#.*$/, "")
          : pageUrl;
    const offers = obj.offers as { url?: string } | undefined;
    const ticketsUrl = typeof offers?.url === "string" ? offers.url : undefined;
    const artists = performerNames(obj.performer);
    const fromTitle = artistsFromLine(title);
    nights.push(
      night(title, start, {
        endsAt: end,
        sourceUrl: url,
        ticketsUrl,
        artists: uniqueStrings([...artists, ...fromTitle]),
      })!,
    );
  }
  return nights;
}

export function parseAmnesiaHtml(
  html: string,
  pageUrl: string,
  defaultYear = 2026,
): VenueNightSeed[] {
  const yearFromUrl = pageUrl.match(/\/(20\d{2})\//)?.[1];
  const year = yearFromUrl ? Number(yearFromUrl) : defaultYear;
  const nights: VenueNightSeed[] = [];
  for (const m of html.matchAll(
    /<article class="event-thumbnail[\s\S]*?<\/article>/gi,
  )) {
    const article = m[0]!;
    const title = stripTags(
      article.match(/<h3 class="title[^"]*"[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ?? "",
    );
    const dateRaw =
      article.match(
        /<(?:div|span) class="left">([\s\S]*?)<\/(?:div|span)>/i,
      )?.[1] ?? "";
    let startsAt = parseDayMonth(stripTags(dateRaw), year);
    const ticket = article.match(
      /href="\s*(https?:\/\/sales\.ticketing\.cm\.com\/[^"]+)"/i,
    )?.[1];
    if (!startsAt && ticket) {
      const tm = ticket.match(
        /(\d{1,2})(?:st|nd|rd|th)?(January|February|March|April|May|June|July|August|September|October|November|December)(20\d{2})/i,
      );
      if (tm) {
        const month = parseMonthName(tm[2]!);
        if (month) startsAt = isoDay(Number(tm[3]), month, Number(tm[1]));
      }
    }
    if (!title || !startsAt) continue;
    const rooms: VenueNightRoom[] = [];
    const artists: string[] = [];
    for (const row of article.matchAll(/<div class="row">([\s\S]*?)(?=<div class="row">|<\/div>\s*<\/div>\s*<\/article>|$)/gi)) {
      const roomName = stripTags(
        row[1]!.match(/<span class="strong element"[^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "",
      );
      const texts = [...row[1]!.matchAll(/<div class="text"[^>]*>([\s\S]*?)<\/div>/gi)].map(
        (x) => x[1]!,
      );
      const lineupHtml =
        texts.find((t) => /<br/i.test(t)) ??
        texts.find((t) => !/in order of appearance/i.test(t) && stripTags(t).length > 2) ??
        "";
      const roomArtists = artistsFromBrokenLines(lineupHtml);
      if (roomName && roomArtists.length) {
        rooms.push({ name: roomName, artists: roomArtists });
      }
      artists.push(...roomArtists);
    }
    nights.push(
      night(title, startsAt, {
        sourceUrl: pageUrl,
        ticketsUrl: ticket?.trim(),
        rooms: rooms.length ? rooms : undefined,
        artists: uniqueStrings(artists),
      })!,
    );
  }
  return nights;
}

export function parseSavayaHtml(
  html: string,
  pageUrl: string,
  defaultYear = 2026,
): VenueNightSeed[] {
  const nights: VenueNightSeed[] = [];
  for (const m of html.matchAll(
    /class="event-calendar-item[\s\S]{0,4000}?upcoming-event-title">([\s\S]*?)<\/h3>([\s\S]{0,400}?)(?:artist-name|<\/div><\/a>)/gi,
  )) {
    const blockStart = html.lastIndexOf("event-calendar-item", m.index ?? 0);
    const block = html.slice(Math.max(0, blockStart - 80), (m.index ?? 0) + m[0]!.length);
    const title = stripTags(m[1]!);
    const day = stripTags(block.match(/class="event-num">([^<]+)</i)?.[1] ?? "");
    const monthName = stripTags(
      block.match(/class="event-month">([^<]+)</i)?.[1] ?? "",
    );
    const href =
      block.match(
        /href="(https?:\/\/(?:www\.)?savaya\.com\/event-calendar\/[^"]+)"/i,
      )?.[1] ?? "";
    const yearFromHref = href.match(/(20\d{2})/)?.[1];
    const month = parseMonthName(monthName);
    const startsAt =
      month && day
        ? isoDay(Number(yearFromHref || defaultYear), month, Number(day))
        : parseDayMonth(`${day} ${monthName} ${yearFromHref || defaultYear}`, defaultYear);
    if (!title || !startsAt) continue;
    const sub = stripTags(
      block.match(/class="upcoming-event-subtext">([^<]*)</i)?.[1] ?? "",
    );
    const artists = uniqueStrings([
      ...artistsFromLine(title),
      ...(sub && !/sunset set|force of nature|people of the sun/i.test(sub)
        ? artistsFromLine(sub)
        : []),
    ]);
    const tickets = block.match(
      /href="(https?:\/\/[^"]+)"[^>]*>\s*BUY\s+TICKETS/i,
    )?.[1];
    nights.push(
      night(title, startsAt, {
        sourceUrl: href || pageUrl,
        ticketsUrl: tickets,
        artists,
      })!,
    );
  }
  return nights;
}

export function parseWarehouseProjectHtml(
  html: string,
  pageUrl: string,
  defaultYear = 2026,
): VenueNightSeed[] {
  const nights: VenueNightSeed[] = [];
  for (const m of html.matchAll(
    /<div class="calendar-item event-listing[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi,
  )) {
    const block = m[0]!;
    const title = stripTags(block.match(/<h3 class="title">([\s\S]*?)<\/h3>/i)?.[1] ?? "");
    const dateRaw = stripTags(
      block.match(/<span class="date">([\s\S]*?)<\/span>/i)?.[1] ?? "",
    );
    const startsAt = parseDayMonth(dateRaw, defaultYear);
    if (!title || !startsAt) continue;
    const href =
      block.match(/href="(https?:\/\/thewarehouseproject\.com\/events\/[^"]+)"/i)?.[1] ??
      pageUrl;
    const tickets = block.match(
      /href="(https?:\/\/(?:www\.)?ticketmaster\.[^"]+)"/i,
    )?.[1];
    const venue = stripTags(
      block.match(/<span class="venue">([\s\S]*?)<\/span>/i)?.[1] ?? "",
    );
    const artists = uniqueStrings([
      ...artistsFromLine(title.replace(/\s*[–—-]\s*(friday|saturday|concourse only).*$/i, "")),
      ...artistsFromCommaList(title.replace(/\s*\+\s*/g, ", ")),
    ]);
    nights.push(
      night(title, startsAt, {
        sourceUrl: href,
        ticketsUrl: tickets,
        rooms: venue ? [{ name: venue, artists }] : undefined,
        artists,
      })!,
    );
  }
  return nights;
}

export function parsePachaHtml(html: string, pageUrl: string): VenueNightSeed[] {
  const text = unescapeJsonish(html);
  const nights: VenueNightSeed[] = [];
  for (const m of text.matchAll(
    /"name"\s*:\s*"([^"]+)"\s*,\s*"slug"\s*:\s*"([^"]+)"([\s\S]{0,6000}?"start_date"\s*:\s*"([^"]+)")/g,
  )) {
    const title = decodeEntities(m[1]!);
    const slug = m[2]!;
    const blob = m[3]!;
    const start = isoDayFromIso(m[4]!);
    if (!start || !/20\d{2}/.test(slug)) continue;
    if (/^https?:\/\//i.test(title)) continue;
    const end = isoDayFromIso(blob.match(/"end_date"\s*:\s*"([^"]+)"/)?.[1] ?? "") ?? undefined;
    const artists: string[] = [];
    for (const a of blob.matchAll(/"name"\s*:\s*"([^"]+)"\s*,\s*"image_url"/g)) {
      artists.push(...artistsFromLine(a[1]!));
    }
    const iframe = blob.match(/"iframe"\s*:\s*"(https?:\/\/[^"]+)"/)?.[1];
    nights.push(
      night(title, start, {
        endsAt: end,
        sourceUrl: `${pageUrl.replace(/\/$/, "")}/${slug}`,
        ticketsUrl: iframe,
        artists: uniqueStrings([...artists, ...artistsFromLine(title)]),
      })!,
    );
  }
  return nights;
}

export function parseFabricHtml(html: string, pageUrl: string): VenueNightSeed[] {
  const nights: VenueNightSeed[] = [];
  for (const m of html.matchAll(
    /<div class="mix-date">([^<]+)<\/div>[\s\S]{0,400}?<a href="([^"]+)"[\s\S]{0,200}?<h3 class="event-title">([\s\S]*?)<\/h3>(?:[\s\S]{0,200}?<p class="light-text">([\s\S]*?)<\/p>)?[\s\S]{0,400}?href="(https?:\/\/ra\.co\/[^"]+)"/gi,
  )) {
    const startsAt = isoDayFromIso(m[1]!.trim());
    const title = stripTags(m[3]!);
    if (!startsAt || !title) continue;
    const href = absoluteUrl(m[2]!, pageUrl);
    const billed = m[4] ? stripTags(m[4]) : "";
    const artists = uniqueStrings([
      ...artistsFromCommaList(billed),
      ...artistsFromLine(title.replace(/^[^:]+:\s*/, "")),
    ]);
    nights.push(
      night(title, startsAt, {
        sourceUrl: href,
        ticketsUrl: m[5],
        artists,
      })!,
    );
  }
  return nights;
}

export function parseBootshausHtml(
  html: string,
  pageUrl: string,
  defaultYear = 2026,
): VenueNightSeed[] {
  const nights: VenueNightSeed[] = [];
  for (const m of html.matchAll(
    /<a href="(\/events\/[^"]+)"[\s\S]{0,2500}?<div class="date-day">([^<]+)<\/div>\s*<div class="date-month">([^<]+)<\/div>[\s\S]{0,400}?<div class="upcoming-title">([\s\S]*?)<\/div>\s*<div class="upcoming-subtitle">([^<]*)/gi,
  )) {
    const href = absoluteUrl(m[1]!, pageUrl);
    const title = stripTags(m[4]!);
    const subtitle = stripTags(m[5]!);
    const yearFromTitle = title.match(/\b(20\d{2})\b/)?.[1];
    const dmy = title.match(/\b(\d{1,2})\.(\d{1,2})\.(20\d{2})\b/);
    const startsAt = dmy
      ? isoDay(Number(dmy[3]), Number(dmy[2]), Number(dmy[1]))
      : isoDay(
          Number(yearFromTitle || defaultYear),
          parseMonthName(m[3]!) ?? 0,
          Number(m[2]),
        );
    if (!title || !startsAt) continue;
    const billed = title
      .replace(/\s*@.*$/, "")
      .replace(/\s+pres\.?\s+by\s+bootshaus.*$/i, "")
      .replace(/^.*?\bpres\.?\s+/i, "");
    const artists = uniqueStrings([
      ...artistsFromLine(billed),
      ...(/bootshaus|122|nibirii|loonyland|unreal|blacklist|chrome/i.test(subtitle)
        ? []
        : artistsFromLine(subtitle)),
    ]);
    nights.push(
      night(title, startsAt, {
        sourceUrl: href,
        artists,
      })!,
    );
  }
  return nights;
}

export function parseBerghainHtml(html: string, pageUrl: string): VenueNightSeed[] {
  const nights: VenueNightSeed[] = [];
  const chunks = html.split(/(?=<a href="\/(?:en\/)?event\/\d+\/")/);
  for (const block of chunks) {
    if (!/upcoming-event/.test(block)) continue;
    const href = block.match(/href="(\/(?:en\/)?event\/\d+\/)"/)?.[1];
    const date = block.match(/\b(\d{2}\.\d{2}\.\d{4})\b/)?.[1];
    const startsAt = date ? parseDayMonth(date, 2026) : null;
    const title = stripTags(block.match(/<h2[\s\S]*?>([\s\S]*?)<\/h2>/i)?.[1] ?? "");
    if (!title || !startsAt || !href) continue;
    const rooms: VenueNightRoom[] = [];
    const artists: string[] = [];
    const roomBits = block.split(/<h3[\s\S]*?>/);
    for (const bit of roomBits.slice(1)) {
      const roomName = stripTags(bit.match(/^([\s\S]*?)<\/h3>/i)?.[1] ?? "");
      const names: string[] = [];
      for (const span of bit.matchAll(
        /<span class="(?:xs:)?whitespace-no-wrap">([^<]+)<\/span>/g,
      )) {
        names.push(...artistsFromLine(span[1]!));
      }
      if (!names.length) {
        const h4 = bit.match(/<h4[\s\S]*?>([\s\S]*?)<\/h4>/i)?.[1];
        if (h4) names.push(...artistsFromCommaList(stripTags(h4)));
      }
      if (roomName && names.length) rooms.push({ name: roomName, artists: names });
      artists.push(...names);
    }
    nights.push(
      night(title, startsAt, {
        sourceUrl: absoluteUrl(href, pageUrl),
        rooms: rooms.length ? rooms : undefined,
        artists: uniqueStrings(artists),
      })!,
    );
  }
  return nights;
}

/**
 * DJTickets venue listing cards: title + "Sun 16 Aug" + /event/{slug}.
 * Ticket marketplace — only used when a club has no official calendar.
 */
export function parseDjticketsHtml(
  html: string,
  pageUrl: string,
  defaultYear: number,
): VenueNightSeed[] {
  const nights: VenueNightSeed[] = [];
  const cards = html.split(/<div class="cardm\b/);
  for (const card of cards.slice(1)) {
    const href = card.match(/href="(\/event\/[^"#?]+)"/i)?.[1];
    const title = stripTags(
      card.match(
        /field--name-title[^>]*>([\s\S]*?)<\/div>/i,
      )?.[1] ?? "",
    );
    const dateRaw =
      card.match(
        /<(?:span|div)[^>]*>\s*((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{1,2}\s+[A-Za-z]{3,9})\s*</i,
      )?.[1] ?? "";
    const startsAt = parseDayMonth(dateRaw, defaultYear);
    if (!href || !title || !startsAt) continue;
    if (/^(ushua[iï]a ibiza|eden ibiza|\[?unvrs\]?|pacha|h[iï] ibiza|amnesia)$/i.test(title)) {
      continue;
    }
    const sourceUrl = absoluteUrl(href, pageUrl);
    const billed = title
      .replace(/\s+presents?\s+/i, ", ")
      .replace(/\s+by\s+/i, ", ");
    const artists = uniqueStrings(artistsFromLine(billed));
    nights.push(
      night(title, startsAt, {
        sourceUrl,
        ticketsUrl: sourceUrl,
        artists,
      })!,
    );
  }
  return nights;
}

export function parseVenueCalendarHtml(
  source: VenueCalendarSource,
  html: string,
  extra?: { ics?: string },
): VenueNightSeed[] {
  const year = source.defaultYear ?? 2026;
  const page = source.calendarUrl;
  let nights: VenueNightSeed[] = [];
  switch (source.parser) {
    case "jsonld":
      nights = parseJsonLdEvents(html, page);
      break;
    case "amnesia":
      nights = parseAmnesiaHtml(html, page, year);
      break;
    case "savaya":
      nights = parseSavayaHtml(html, page, year);
      break;
    case "warehouse-project":
      nights = parseWarehouseProjectHtml(html, page, year);
      break;
    case "pacha":
      nights = parsePachaHtml(html, page);
      break;
    case "fabric":
      nights = parseFabricHtml(html, page);
      break;
    case "illuzion":
      nights = parseJsonLdEvents(html, page);
      if (extra?.ics) nights = mergeNights(nights, parseIcsEvents(extra.ics, page));
      break;
    case "bootshaus":
      nights = parseBootshausHtml(html, page, year);
      break;
    case "berghain":
      nights = parseBerghainHtml(html, page);
      break;
    case "djtickets":
      nights = parseDjticketsHtml(html, page, year);
      break;
    default:
      nights = parseJsonLdEvents(html, page);
  }
  return nights.filter((n) => n.title && n.startsAt);
}

export function calendarArtistHits(
  source: VenueCalendarSource,
  nights: VenueNightSeed[],
): Array<{ name: string; eventSlug: string; eventName: string; detail: string; weight: number; sourceUrl: string }> {
  const weight = source.weight ?? 28;
  const hits: Array<{
    name: string;
    eventSlug: string;
    eventName: string;
    detail: string;
    weight: number;
    sourceUrl: string;
  }> = [];
  for (const nightRow of nights) {
    for (const name of nightRow.artists) {
      const clean = sanitizeArtistName(name) ?? cleanArtistToken(name);
      if (!clean) continue;
      hits.push({
        name: clean,
        eventSlug: source.venueSlug,
        eventName: source.venueName,
        detail: `${source.venueName} ${nightRow.startsAt} ${nightRow.title}`,
        weight,
        sourceUrl: nightRow.sourceUrl || source.calendarUrl,
      });
    }
  }
  return hits;
}
