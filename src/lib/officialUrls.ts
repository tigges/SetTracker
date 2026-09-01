/**
 * Official website vs listicle / encyclopedia / ticket pages.
 * MixesDB is a wiki, never a DJ homepage.
 * DJ Mag is a rank list, never a homepage. RA (ra.co) is a good discovery
 * seed (tours / official outbound) but DataDome often 403s — never store
 * ra.co as website. Techno Music World is the same class: follow a concrete
 * `/artist/{slug}/about` URL already in hand, then verify outbound official
 * links — do not site-crawl, and never store it as website.
 * Discogs is a marketplace wiki, never a homepage. Follow a concrete
 * `/artist/{id}-{Name}` already in hand (outbound official links, bio,
 * homeCity, genre) — never store discogs.com as website, and never
 * search or invent artist ids. Grokipedia is an
 * encyclopedia, same class as Wikipedia: follow a concrete `/page/{Name}`
 * already in hand for outbound official links, bio, homeCity, and genre —
 * never store grokipedia.com as website, and never invent or search titles.
 * A concrete DJ Mag `/top100djs/{year}/{rank}/{slug}` profile already
 * in the seed is the same follow-in-hand class (From:, DJ style, body
 * lede) — never the listing `/top100djs` and never Dj.website.
 * An Insomniac `/music/artists/{slug}` hub is the same follow-in-hand
 * class (promoter bio + Origin/Genre) — never the artist's site.
 * Keep `insomniac.com` itself for the promoter Event row.
 * DICE / Shotgun / JamBase / Eventpop / PuntoTicket are tickets.
 * Follow a JamBase URL already in hand; do not crawl jambase.com.
 */

const WEAK_OFFICIAL =
  /6amgroup\.com|clubtickets\.com\/blog|djmag\.com\/top[-_]?100|djmag\.com\/?([?#]|$)|wikipedia\.org|wikidata\.org|grokipedia\.com|mixesdb\.com|discogs\.com|insomniac\.com\/music\/artists|(^|[/.])ra\.co([/?#]|$)|residentadvisor\.net|technomusicworld\.com|dice\.fm|shotgun\.live|jambase\.com|eventpop\.me|puntoticket\.com/i;

export function isWeakOfficialUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  return WEAK_OFFICIAL.test(url);
}

function compact(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * Concrete encyclopedia / promoter-hub URL already in hand.
 * Listing homepages are not followable — that would be a crawl.
 */
export function isFollowableEvidenceUrl(
  url: string | null | undefined,
): boolean {
  if (!url?.trim()) return false;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    const path = u.pathname.replace(/\/+$/, "");
    if (host === "grokipedia.com") return /^\/page\/[^/]+$/.test(path);
    if (host === "insomniac.com") {
      return /^\/music\/artists\/[a-z0-9-]+$/.test(path);
    }
    if (host === "en.wikipedia.org" || host === "wikipedia.org") {
      return /^\/wiki\/[^/]+$/.test(path);
    }
    if (host === "technomusicworld.com") {
      return /^\/artist\/[^/]+(\/about)?$/.test(path);
    }
    if (host === "discogs.com") {
      return /^\/artist\/\d+-[^/]+$/.test(path);
    }
    if (host === "djmag.com") {
      return /^\/top100djs\/\d{4}\/\d{1,3}\/[a-z0-9-]+$/.test(path);
    }
    return false;
  } catch {
    return false;
  }
}

/** Leaf slug must name this act. DJ Fresh Grokipedia is not Anti Up. */
export function evidenceUrlMatchesName(
  name: string,
  url: string | null | undefined,
): boolean {
  if (!isFollowableEvidenceUrl(url)) return false;
  try {
    const leaf = new URL(url!).pathname.split("/").filter(Boolean).pop() ?? "";
    const nameKey = compact(name);
    const leafKey = compact(leaf.replace(/_/g, " "));
    if (nameKey.length < 3 || !leafKey) return false;
    return leafKey.includes(nameKey) || nameKey.includes(leafKey);
  } catch {
    return false;
  }
}
