/**
 * SoundCloud profile website + description → outbound social / hub links.
 */

import { resolveUser, scGet } from "../soundcloud/client";
import { extractSocialLinksFromText } from "../youtube/client";

/**
 * SoundCloud profile website + description socials (plain URLs, bare hosts,
 * and "YouTube: @handle" / "Instagram: @x" label lines).
 */
export async function fetchSoundcloudProfileLinks(
  permalink: string,
): Promise<string[]> {
  try {
    const u = await resolveUser(permalink);
    const full = await scGet<{
      website?: string | null;
      description?: string | null;
    }>(`/users/${u.id}`);
    const links: string[] = [];
    if (full.website) links.push(String(full.website));
    const desc = String(full.description || "");
    // Full free-text extractor (https, bare hosts, YouTube:/IG: label lines).
    for (const l of extractSocialLinksFromText(desc)) links.push(l);
    // Catch any remaining https URLs (personal sites not in SOCIAL_HOST_RE).
    for (const m of desc.matchAll(/https?:\/\/[^\s)]+/gi)) {
      links.push(m[0].replace(/[),.;]+$/, ""));
    }
    return [...new Set(links)];
  } catch {
    return [];
  }
}
