/**
 * Resolve a stored image path for <img src>.
 * Root-relative paths (/artists/…) need the Pages basePath prefix in export.
 */
export function mediaUrl(src: string | null | undefined): string | undefined {
  if (!src) return undefined;
  if (/^(https?:|data:|blob:)/i.test(src)) return src;
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
  if (!src.startsWith("/") || !base) return src;
  if (src === base || src.startsWith(`${base}/`)) return src;
  return `${base}${src}`;
}
