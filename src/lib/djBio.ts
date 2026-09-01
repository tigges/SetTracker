import { extractBeatportArtistUrl } from "@/lib/beatportArtist";

const OPERATOR =
  /^(do not use|never use)\b|1001 sometimes|no official soundcloud|\bnot bare\b|\(not\s+[@\w.-]+\)|different (artist|channel)|facebook on roster/i;

/** Rank dump written by older ensureDjMagTopDjs — not a distinctive bio. */
export const CHART_RANK_BIO =
  /^DJ Mag Top 100 DJs \d{4}\s*[·•-]\s*#\d+\.?$/i;

export function isChartRankBio(bio: string | null | undefined): boolean {
  return CHART_RANK_BIO.test(String(bio || "").trim());
}

/** Drop a trailing rank dump appended to an otherwise distinctive bio. */
export function stripChartRankSuffix(bio: string): string {
  return bio
    .replace(/\s*DJ Mag Top 100 DJs \d{4}\s*[·•-]\s*#\d+\.?\s*$/i, "")
    .trim();
}

const GENRE_WORD =
  /house|techno|trance|bass|edm|dance|riddim|hardstyle|hard dance|future bass|big room|breaks|electro/i;

function splitSentences(bio: string): string[] {
  return bio
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Strip research handle dumps; keep emails (name@host). */
function stripDumpTokens(text: string): string {
  return text
    .replace(/Official(?:\s+site)?:?\s+[a-z0-9][a-z0-9.-]+\.[a-z]{2,}/gi, " ")
    .replace(/Official\s+YT\s+@[\w.-]+/gi, " ")
    .replace(/Beatport\s+artist(?:\/[a-z0-9-]+\/\d+|\s+hubs?)?/gi, " ")
    .replace(
      /(?:YT|IG|X|SC|FB|TT)(?:\/(?:YT|IG|X|SC|FB|TT))*\s+(?:@|\/)?[\w.-]+(?:\s*\/\s*[\w./-]+)?/gi,
      " ",
    )
    .replace(/(?<![A-Za-z0-9._%+-])@[\w.-]{2,}(?!\.[a-z]{2,})/g, " ")
    .replace(
      /https?:\/\/(?:www\.)?(?:instagram|youtube|soundcloud|twitter|x)\.com\/\S+/gi,
      " ",
    )
    .replace(/linktr\.ee\/\S+/gi, " ")
    .replace(
      /\b(?:Spotify|Apple Music)(?:\/(?:Spotify|Apple Music))*\s+artist hubs?/gi,
      " ",
    )
    .replace(/\bon roster\b/gi, " ")
    .replace(/\s*[—–]+\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,;:./|-]+|[\s,;:./|-]+$/g, "")
    .trim();
}

function isGenreOrCity(text: string, opts?: { genre?: string | null; homeCity?: string | null }) {
  const t = text.replace(/[."]+$/g, "").trim();
  if (!t) return true;
  const genre = opts?.genre?.trim();
  if (genre && t.toLowerCase() === genre.toLowerCase()) return true;
  const city = opts?.homeCity?.trim();
  if (city && t.toLowerCase() === city.toLowerCase()) return true;
  if (t.length <= 40 && GENRE_WORD.test(t) && !/management|booking|founder|not the /i.test(t)) {
    return true;
  }
  return /^(uk|us|usa|nyc|uae|eu|australia|brazil|belgium|netherlands|germany|france|italy|spain|sweden|canada|tokyo|berlin|london|paris|ibiza|melbourne|brisbane|leeds|cologne|stockholm|south africa|united states|indonesia)$/i.test(
    t,
  );
}

export function displayDjBio(
  bio: string | null | undefined,
  opts?: { genre?: string | null; homeCity?: string | null },
): string | null {
  if (!bio?.trim()) return null;

  const kept: string[] = [];
  for (const sentence of splitSentences(bio)) {
    if (OPERATOR.test(sentence)) continue;
    if (isChartRankBio(sentence)) continue;
    const leftover = stripDumpTokens(sentence);
    if (!leftover) continue;
    if (isGenreOrCity(leftover, opts)) continue;
    kept.push(leftover);
  }

  let out = kept.join(" ").replace(/\s{2,}/g, " ").trim();
  const genre = opts?.genre?.trim();
  if (genre) {
    out = out.replace(new RegExp(`^${escapeRe(genre)}\\.?\\s*`, "i"), "").trim();
  }
  out = out.replace(/^[.,;:\s]+|[.,;:\s]+$/g, "").trim();
  if (out.length < 12) return null;
  return out;
}

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Pull a Beatport artist URL from a pin bio when `pin.beatport` is unset. */
export function beatportFromBio(bio: string | null | undefined): string | null {
  return extractBeatportArtistUrl(bio);
}
