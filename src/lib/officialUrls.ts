/**
 * Official website vs listicle / encyclopedia / ticket pages.
 * DJ Mag is a rank list, never a homepage. RA (ra.co) is a good discovery
 * seed (tours / official outbound) but DataDome often 403s — never store
 * ra.co as website. DICE / Shotgun / JamBase / Eventpop are tickets.
 * Follow a JamBase URL already in hand; do not crawl jambase.com.
 */

const WEAK_OFFICIAL =
  /6amgroup\.com|clubtickets\.com\/blog|djmag\.com\/top[-_]?100|djmag\.com\/?([?#]|$)|wikipedia\.org|wikidata\.org|(^|[/.])ra\.co([/?#]|$)|residentadvisor\.net|dice\.fm|shotgun\.live|jambase\.com|eventpop\.me/i;

export function isWeakOfficialUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  return WEAK_OFFICIAL.test(url);
}
