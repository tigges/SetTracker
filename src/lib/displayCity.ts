/**
 * SoundCloud / YouTube bios often land in Dj.homeCity.
 * Only show short place-like strings on profiles and cards.
 */
export function displayCity(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (!t) return null;
  if (/^unknown\.?$/i.test(t)) return null;
  if (t.length > 48) return null;
  if (/[“”"]/.test(t)) return null;
  if (/\.\s/.test(t)) return null;
  if (t.split(/\s+/).length > 6) return null;
  return t;
}
