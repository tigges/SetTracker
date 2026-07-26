/**
 * Resolve a SoundCloud user avatar from a profile URL / permalink.
 * Used as Deezer fallback for DJ portraits.
 */

const UA =
  "Mozilla/5.0 (compatible; SetRadar/0.2; +https://setradar.ai; sc-avatar)";

function upgradeScImage(url: string): string {
  return url
    .replace("-large.", "-t500x500.")
    .replace("-t200x200.", "-t500x500.")
    .replace("-badge.", "-t500x500.")
    .replace("-tiny.", "-t500x500.");
}

export function permalinkFromSoundcloudUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  const m = url.match(/soundcloud\.com\/([^/?#]+)/i);
  const p = m?.[1]?.trim();
  if (!p || /^(sets|tracks|you|discover|search)$/i.test(p)) return null;
  return p;
}

export async function resolveSoundcloudAvatar(
  soundcloudUrlOrPermalink: string | null | undefined,
): Promise<string | null> {
  if (!soundcloudUrlOrPermalink) return null;
  const permalink =
    permalinkFromSoundcloudUrl(soundcloudUrlOrPermalink) ||
    soundcloudUrlOrPermalink.replace(/^@/, "").trim();
  if (!permalink || /:\/\//.test(permalink)) return null;

  const page = `https://soundcloud.com/${encodeURIComponent(permalink)}`;
  try {
    const res = await fetch(page, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m =
      html.match(/"avatar_url"\s*:\s*"(https:[^"]+)"/) ||
      html.match(/(https:\/\/i1\.sndcdn\.com\/avatars-[^"']+t500x500\.[^"']+)/);
    const raw = m?.[1]?.replace(/\\u0026/g, "&").replace(/\\/g, "");
    if (!raw?.startsWith("https://")) return null;
    return upgradeScImage(raw);
  } catch {
    return null;
  }
}
