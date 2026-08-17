/**
 * Resolve official websites via Wikidata P856.
 *
 * DJ Mag Top 100 Clubs embed official URLs on profile pages; DJ / festival
 * profiles do not — so we use Wikidata (and curated roster/pins) instead.
 */

const TIMEOUT_MS = 15_000;
const UA =
  "SetRadar/0.2 (https://setradar.ai; industry-context; wikidata)";

const GOOD_DESC =
  /\b(festival|electronic|techno|house music|dance music|disc\s*jockey|\bdj\b|music producer|record producer|musician|rapper|singer|composer|nightclub|music festival)\b/i;
const BAD_DESC =
  /\b(family name|given name|surname|album|television|tv series|fictional|entomologist|disambiguation|wikipedia:)\b/i;

export type WikidataKind = "festival" | "dj";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function wikiJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Hosts that look name-adjacent but are not a catalog artist homepage. */
const REJECTED_WEBSITE_HOSTS = new Set([
  // Casino / click-through, not the Ivorian Boiler Room BDK.
  "therealdjbdk.com",
]);

export function websiteHost(raw: string): string {
  try {
    return new URL(raw).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

export function isRejectedWebsiteHost(hostOrUrl: string): boolean {
  const host = hostOrUrl.includes("://")
    ? websiteHost(hostOrUrl)
    : hostOrUrl.replace(/^www\./i, "").toLowerCase();
  return Boolean(host) && REJECTED_WEBSITE_HOSTS.has(host);
}

/**
 * True when a homepage host is a plausible official site for this DJ.
 * Short names (BDK) must match the registrable label, not a substring of
 * a longer brand (therealdjbdk.com).
 */
export function websiteHostMatchesDj(djName: string, hostOrUrl: string): boolean {
  const host = hostOrUrl.includes("://")
    ? websiteHost(hostOrUrl)
    : hostOrUrl.replace(/^www\./i, "").toLowerCase();
  if (!host || isRejectedWebsiteHost(host)) return false;
  const compact = djName.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const hostCompact = host.replace(/[^a-z0-9]+/g, "");
  const label = host.split(".")[0] ?? "";
  if (!compact || !hostCompact) return false;
  if (compact.length < 4) {
    return label === compact || label === `dj${compact}` || label === `${compact}dj`;
  }
  if (hostCompact.includes(compact)) return true;
  const hostCore = hostCompact.replace(/(com|net|org|io|tv|co)$/i, "");
  return Boolean(hostCore) && compact.includes(hostCore);
}

export function normalizeOfficialWebsite(raw: string): string | null {
  let s = raw.trim();
  if (!s) return null;
  if (s.startsWith("//")) s = `https:${s}`;
  else if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    if (!/^https?:$/i.test(u.protocol)) return null;
    // Skip socials / stores — want the brand homepage.
    if (
      /(?:^|\.)(facebook|instagram|twitter|x|tiktok|youtube|youtu\.be|soundcloud|spotify|bandcamp|linktr\.ee|djmag)\./i.test(
        u.hostname,
      )
    ) {
      return null;
    }
    if (isRejectedWebsiteHost(u.hostname)) return null;
    u.hash = "";
    if (u.protocol === "http:") u.protocol = "https:";
    let path = u.pathname.replace(/\/+$/, "");
    if (path === "/") path = "";
    return `${u.origin}${path}/`;
  } catch {
    return null;
  }
}

type SearchHit = { id: string; label?: string; description?: string };

function compact(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Require the Wikidata label to resemble the chart name (blocks Gordo→Sting). */
function labelsAlign(name: string, label: string): boolean {
  const a = compact(name);
  const b = compact(label);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length >= 4 && b.includes(a)) return true;
  if (b.length >= 4 && a.includes(b)) return true;
  // W&W / Dimitri Vegas & Like Mike style
  const aTokens = name.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1);
  const bTokens = new Set(
    label.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1),
  );
  const overlap = aTokens.filter((t) => bTokens.has(t)).length;
  return overlap >= Math.min(2, aTokens.length);
}

function scoreHit(hit: SearchHit, kind: WikidataKind, name: string): number {
  const desc = hit.description ?? "";
  const label = hit.label ?? "";
  if (BAD_DESC.test(desc) || BAD_DESC.test(label)) return -100;
  if (!labelsAlign(name, label)) return -50;
  let score = 0;
  if (GOOD_DESC.test(desc)) score += 5;
  if (kind === "festival" && /\bfestival\b/i.test(desc)) score += 4;
  if (kind === "dj" && /\b(dj|disc jockey|music producer|record producer)\b/i.test(desc)) {
    score += 4;
  }
  if (compact(label) === compact(name)) score += 2;
  return score;
}

async function searchEntities(query: string): Promise<SearchHit[]> {
  const url =
    "https://www.wikidata.org/w/api.php?" +
    new URLSearchParams({
      action: "wbsearchentities",
      search: query,
      language: "en",
      limit: "6",
      format: "json",
      type: "item",
    });
  const data = (await wikiJson(url)) as { search?: SearchHit[] } | null;
  return data?.search ?? [];
}

async function officialWebsiteForQid(qid: string): Promise<string | null> {
  const url =
    "https://www.wikidata.org/w/api.php?" +
    new URLSearchParams({
      action: "wbgetentities",
      ids: qid,
      props: "claims",
      format: "json",
    });
  const data = (await wikiJson(url)) as {
    entities?: Record<
      string,
      {
        claims?: Record<
          string,
          Array<{ mainsnak?: { datavalue?: { value?: string } } }>
        >;
      }
    >;
  } | null;
  const claims = data?.entities?.[qid]?.claims?.P856;
  if (!claims?.length) return null;
  for (const c of claims) {
    const v = c.mainsnak?.datavalue?.value;
    if (typeof v === "string") {
      const norm = normalizeOfficialWebsite(v);
      if (norm) return norm;
    }
  }
  return null;
}

/**
 * Best-effort official homepage for a festival or DJ name.
 * Returns null when Wikidata has no confident match / P856.
 */
export async function resolveWikidataOfficialWebsite(
  name: string,
  kind: WikidataKind,
  opts?: { delayMs?: number },
): Promise<string | null> {
  const delay = opts?.delayMs ?? 120;
  const queries =
    kind === "festival"
      ? [name, `${name} festival`, name.replace(/\s+festival$/i, "")]
      : [name, `${name} DJ`, `${name} musician`];

  const seen = new Set<string>();
  const candidates: Array<{ hit: SearchHit; score: number }> = [];
  for (const q of queries) {
    const qn = q.trim();
    if (!qn || seen.has(qn.toLowerCase())) continue;
    seen.add(qn.toLowerCase());
    const hits = await searchEntities(qn);
    await sleep(delay);
    for (const hit of hits) {
      const score = scoreHit(hit, kind, name);
      if (score <= 0) continue;
      candidates.push({ hit, score });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  const tried = new Set<string>();
  for (const { hit } of candidates) {
    if (tried.has(hit.id)) continue;
    tried.add(hit.id);
    const site = await officialWebsiteForQid(hit.id);
    await sleep(delay);
    if (site) return site;
  }
  return null;
}
