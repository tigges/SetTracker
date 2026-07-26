/**
 * Resolve Open Graph / Twitter card images from public pages.
 * Used for venue/festival art when Deezer has no festival entity.
 */

const UA = "Mozilla/5.0 (compatible; SetRadar/0.2; +https://setradar.ai; og-image)";

function absUrl(base: string, maybe: string): string | null {
  const raw = maybe.trim().replace(/&amp;/g, "&");
  if (!raw || raw === "url") return null;
  try {
    const u = new URL(raw, base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

/** Extract og:image / twitter:image from HTML. */
export function extractOgImage(html: string, pageUrl: string): string | null {
  const patterns = [
    /property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*property=["']og:image(?::secure_url)?["']/i,
    /name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*name=["']twitter:image(?::src)?["']/i,
    /rel=["']image_src["'][^>]*href=["']([^"']+)["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    const hit = m?.[1];
    if (!hit) continue;
    const abs = absUrl(pageUrl, hit);
    if (abs) return abs;
  }
  return null;
}

export async function resolveOgImage(
  pageUrl: string | null | undefined,
): Promise<string | null> {
  if (!pageUrl || !/^https?:\/\//i.test(pageUrl)) return null;
  try {
    const res = await fetch(pageUrl, {
      redirect: "follow",
      headers: { "User-Agent": UA, Accept: "text/html" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    return extractOgImage(html.slice(0, 400_000), res.url || pageUrl);
  } catch {
    return null;
  }
}
