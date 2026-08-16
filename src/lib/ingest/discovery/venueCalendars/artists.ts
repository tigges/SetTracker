import { sanitizeArtistName, splitUnshieldedCollabNames } from "../../../artistName";
import { uniqueStrings } from "./html";

const ROOM_OR_GENRE =
  /^(terraza|main room|room|terrace|garden|vip|shelter|illuzion|berghain|panorama bar|s[äa]ule|halle|kantine|depot mayfield|concourse|minimal|tech|techno|house|trance|disco|urban|pop|80s|90s|classic house|tech house|minimal tech)$/i;

const TRAILING_COLLAB = /\s+(?:b2b|b3b|vs\.?)\s*$/i;

export function cleanArtistToken(raw: string): string | null {
  const n = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(TRAILING_COLLAB, "")
    .replace(/\s+\((?:live|dj set|sunset set)\)\s*$/i, "")
    .trim();
  if (!n || ROOM_OR_GENRE.test(n)) return null;
  if (/^in order of appearance$/i.test(n)) return null;
  if (/^\(?in order of appearance\)?$/i.test(n)) return null;
  if (/^(bootshaus|amnesia|pacha|fabric|berghain|savaya|unvrs|h[iï] ibiza|ushua[iï]a|eden)$/i.test(n)) {
    return null;
  }
  if (/^(organization|person|place|event|musicevent|musicgroup|offer)$/i.test(n)) {
    return null;
  }
  if (/^(after party|opening party|closing party)$/i.test(n)) return null;
  return sanitizeArtistName(n);
}

export function artistsFromLine(raw: string): string[] {
  const cleaned = cleanArtistToken(raw);
  if (!cleaned) return [];
  const split = splitUnshieldedCollabNames(cleaned);
  if (split.length > 1) {
    return uniqueStrings(split.map((p) => sanitizeArtistName(p)).filter((x): x is string => !!x));
  }
  return [cleaned];
}

export function artistsFromBrokenLines(html: string): string[] {
  const parts = html
    .split(/<br\s*\/?>/i)
    .flatMap((chunk) => chunk.split(/\s*[•|,/]\s+/))
    .map((p) => p.replace(/<[^>]+>/g, " "));
  const out: string[] = [];
  for (const part of parts) {
    out.push(...artistsFromLine(part));
  }
  return uniqueStrings(out);
}

export function artistsFromCommaList(raw: string): string[] {
  const out: string[] = [];
  for (const part of raw.split(/\s*,\s*|\s+&\s+|\s+\+\s+/)) {
    out.push(...artistsFromLine(part));
  }
  return uniqueStrings(out);
}
