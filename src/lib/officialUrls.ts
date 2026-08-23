/**
 * Official website vs listicle / encyclopedia / ticket pages.
 * MixesDB is a wiki, never a DJ homepage.
 * DJ Mag is a rank list, never a homepage. RA (ra.co) is a good discovery
 * seed (tours / official outbound) but DataDome often 403s — never store
 * ra.co as website. Techno Music World is the same class: follow a concrete
 * `/artist/{slug}/about` URL already in hand, then verify outbound official
 * links — do not site-crawl, and never store it as website.
 * DICE / Shotgun / JamBase / Eventpop / PuntoTicket are tickets.
 * Follow a JamBase URL already in hand; do not crawl jambase.com.
 */

const WEAK_OFFICIAL =
  /6amgroup\.com|clubtickets\.com\/blog|djmag\.com\/top[-_]?100|djmag\.com\/?([?#]|$)|wikipedia\.org|wikidata\.org|mixesdb\.com|(^|[/.])ra\.co([/?#]|$)|residentadvisor\.net|technomusicworld\.com|dice\.fm|shotgun\.live|jambase\.com|eventpop\.me|puntoticket\.com/i;

export function isWeakOfficialUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  return WEAK_OFFICIAL.test(url);
}
