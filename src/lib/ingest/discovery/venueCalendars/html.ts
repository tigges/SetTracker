export function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8217;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&#038;/g, "&")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCharCode(parseInt(n, 16)),
    );
}

export function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

export function unescapeJsonish(html: string): string {
  return html.replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\u0026/g, "&");
}

const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
  janvier: 1,
  janv: 1,
  février: 2,
  fevrier: 2,
  févr: 2,
  fevr: 2,
  avril: 4,
  avr: 4,
  mai: 5,
  juin: 6,
  juillet: 7,
  juil: 7,
  août: 8,
  aout: 8,
  septembre: 9,
  octobre: 10,
  novembre: 11,
  décembre: 12,
  decembre: 12,
  déc: 12,
};

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function isoDay(year: number, month: number, day: number): string | null {
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function isoDayFromIso(raw: string): string | null {
  const m = raw.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return isoDay(Number(m[1]), Number(m[2]), Number(m[3]));
}

export function parseMonthName(raw: string): number | null {
  const key = raw.trim().toLowerCase().replace(/\./g, "");
  return MONTHS[key] ?? null;
}

/** "16 Aug", "16 August 2026", "Friday 18 September". */
export function parseDayMonth(
  raw: string,
  defaultYear: number,
): string | null {
  const s = decodeEntities(raw).replace(/\s+/g, " ").trim();
  const ymd = s.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (ymd) return isoDay(Number(ymd[1]), Number(ymd[2]), Number(ymd[3]));
  const dmyDot = s.match(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/);
  if (dmyDot) {
    return isoDay(Number(dmyDot[3]), Number(dmyDot[2]), Number(dmyDot[1]));
  }
  const named = s.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-zÀ-ÿ]{3,9})(?:\s+(\d{4}))?\b/,
  );
  if (named) {
    const month = parseMonthName(named[2]!);
    if (!month) return null;
    return isoDay(Number(named[3] || defaultYear), month, Number(named[1]));
  }
  const namedFirst = s.match(
    /\b([A-Za-zÀ-ÿ]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{4}))?\b/,
  );
  if (namedFirst) {
    const month = parseMonthName(namedFirst[1]!);
    if (!month) return null;
    return isoDay(
      Number(namedFirst[3] || defaultYear),
      month,
      Number(namedFirst[2]),
    );
  }
  return null;
}

export function absoluteUrl(href: string, base: string): string {
  const h = href.trim();
  if (!h || h === "#" || h.startsWith("javascript:")) return base;
  try {
    return new URL(h, base).href;
  } catch {
    return base;
  }
}

export function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const t = v.replace(/\s+/g, " ").trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}
