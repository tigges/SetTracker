/**
 * Official website vs listicle / encyclopedia pages.
 * DJ Mag / 6am / ClubTickets are seeds, not a club or DJ homepage.
 */

export function isWeakOfficialUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  return /6amgroup\.com|clubtickets\.com\/blog|djmag\.com|wikipedia\.org|wikidata\.org/i.test(
    url,
  );
}
