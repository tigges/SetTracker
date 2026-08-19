/**
 * Official website vs listicle / encyclopedia / ticket pages.
 * DJ Mag is a rank list, never a homepage. RA / DICE / Shotgun / JamBase
 * / Eventpop are discovery or tickets — not the venue or DJ site.
 * Follow a JamBase URL already in hand; do not crawl jambase.com.
 */

const WEAK_OFFICIAL =
  /6amgroup\.com|clubtickets\.com\/blog|djmag\.com|wikipedia\.org|wikidata\.org|(^|[/.])ra\.co([/?#]|$)|residentadvisor\.net|dice\.fm|shotgun\.live|jambase\.com|eventpop\.me/i;

export function isWeakOfficialUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  return WEAK_OFFICIAL.test(url);
}
