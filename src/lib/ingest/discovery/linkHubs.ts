/**
 * Expand artist link aggregators (hoo.be, lnk.to, linktr.ee, fanlink, …)
 * into first-party social / streaming URLs.
 *
 * YT About + SC profiles often only list one of these hubs; following them
 * is how we systematically recover Instagram / X / SoundCloud / YouTube.
 */

const HUB_HOSTS = new Set([
  "hoo.be",
  "lnk.to",
  "linktr.ee",
  "fanlink.tv",
  "fanlink.to",
  "ffm.to",
  "withkoji.com",
  "bio.site",
  "beacons.ai",
  "linkin.bio",
  "carrd.co",
  "solo.to",
]);

const TARGET_HOST_RE =
  /(?:soundcloud\.com|instagram\.com|tiktok\.com|facebook\.com|fb\.com|x\.com|twitter\.com|youtube\.com|youtu\.be|open\.spotify\.com|music\.apple\.com|beatport\.com|robin-schulz\.com|followthefishtv\.com)/i;

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

export function isLinkHub(url: string): boolean {
  const host = hostOf(url);
  if (!host) return false;
  if (HUB_HOSTS.has(host)) return true;
  // *.fanlink.tv artist pages (e.g. marten.fanlink.tv)
  if (host.endsWith(".fanlink.tv") || host.endsWith(".lnk.to")) return true;
  return false;
}

function normalizeUrl(raw: string): string | null {
  let u = raw.trim().replace(/[),.;]+$/, "");
  if (!/^https?:\/\//i.test(u)) {
    if (/^(www\.)?[\w.-]+\.[a-z]{2,}/i.test(u)) u = `https://${u}`;
    else return null;
  }
  try {
    const parsed = new URL(u);
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function extractUrlsFromHtml(html: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/https?:\/\/[^\s"'<>\\]+/gi)) {
    const n = normalizeUrl(m[0].replace(/\\\//g, "/"));
    if (n) out.push(n);
  }
  // Escaped JSON URLs common in Next/React hydration
  for (const m of html.matchAll(/https?:\\\/\\\/[^"\\]+/gi)) {
    const n = normalizeUrl(m[0].replace(/\\\//g, "/"));
    if (n) out.push(n);
  }
  return out;
}

/** Pull first-party social/stream URLs out of a hub page body. */
export function filterTargetLinks(urls: string[]): string[] {
  const out: string[] = [];
  for (const u of urls) {
    const host = hostOf(u);
    if (!host) continue;
    if (isLinkHub(u)) continue;
    if (TARGET_HOST_RE.test(host) || TARGET_HOST_RE.test(u)) out.push(u);
  }
  return [...new Set(out)];
}

/**
 * Fetch a link-hub page and return discovered first-party URLs.
 * Follows one redirect hop via fetch(); does not recurse into nested hubs.
 */
export async function expandLinkHub(url: string): Promise<string[]> {
  if (!isLinkHub(url)) return [];
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SetRadar/0.1; +https://setradar.ai)",
        Accept: "text/html",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const found = filterTargetLinks(extractUrlsFromHtml(html));
    // Final URL after redirects can itself be a target (rare for hubs)
    const final = normalizeUrl(res.url);
    if (final && !isLinkHub(final) && TARGET_HOST_RE.test(final)) {
      found.push(final);
    }
    return [...new Set(found)];
  } catch {
    return [];
  }
}

/** Expand every hub URL in a list; returns original + discovered targets. */
export async function expandAllLinkHubs(
  urls: string[],
  opts?: { limit?: number; delayMs?: number },
): Promise<string[]> {
  const limit = opts?.limit ?? 6;
  const delayMs = opts?.delayMs ?? 120;
  const hubs = urls.filter(isLinkHub).slice(0, limit);
  const out = [...urls];
  for (const hub of hubs) {
    const links = await expandLinkHub(hub);
    out.push(...links);
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
  }
  return [...new Set(out.map((u) => normalizeUrl(u) ?? u).filter(Boolean))];
}
