/** Last list the user opened a set from. Client-only; not written from /sets/[slug]. */

export const BROWSE_BACK_KEY = "setradar.browseBack";

export type BrowseBack = {
  href: string;
  label: string;
};

const INDEX_LABELS: Record<string, string> = {
  "/": "Home",
  "/sets": "Sets",
  "/djs": "DJs",
  "/events": "Events",
  "/series": "Series",
  "/tracks": "Tracks",
  "/labels": "Labels",
  "/atlas": "Atlas",
  "/stats": "Stats",
  "/search": "Search",
  "/about": "About",
};

const ENTITY = /^\/(djs|events|series|tracks|labels)\/([^/]+)$/;

export function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function pathnameOf(href: string): string {
  const path = href.split("#")[0]!.split("?")[0]!;
  return path.replace(/\/$/, "") || "/";
}

export function isBrowsePath(pathname: string): boolean {
  const path = pathnameOf(pathname);
  if (path in INDEX_LABELS) return true;
  return ENTITY.test(path);
}

export function browseLabelFromPath(
  pathname: string,
  fallbackName?: string,
): string | null {
  const path = pathnameOf(pathname);
  if (INDEX_LABELS[path]) return INDEX_LABELS[path]!;
  const m = path.match(ENTITY);
  if (!m) return null;
  return fallbackName?.trim() || humanizeSlug(m[2]!);
}

export function readBrowseBack(): BrowseBack | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(BROWSE_BACK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BrowseBack>;
    const href = typeof parsed.href === "string" ? parsed.href.trim() : "";
    const label = typeof parsed.label === "string" ? parsed.label.trim() : "";
    if (!href || !label || !isBrowsePath(href)) return null;
    return { href, label };
  } catch {
    return null;
  }
}

export function writeBrowseBack(next: BrowseBack): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(BROWSE_BACK_KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
}

/** Record the current page as the set-page back target. No-op on a set page. */
export function markBrowseBack(label?: string): void {
  if (typeof window === "undefined") return;
  const pathname = window.location.pathname;
  if (!isBrowsePath(pathname)) return;
  const resolved = browseLabelFromPath(pathname, label);
  if (!resolved) return;
  const href =
    pathname + window.location.search + window.location.hash || "/";
  writeBrowseBack({ href, label: resolved });
}

export function sameOriginReferrerPath(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const ref = document.referrer;
    if (!ref) return null;
    const url = new URL(ref);
    if (url.origin !== window.location.origin) return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

export type BrowseBackTarget = {
  href: string;
  label: string;
  useBack: boolean;
};

export function resolveBrowseBackTarget(
  stored: BrowseBack | null,
  referrer: string | null,
): BrowseBackTarget | null {
  if (stored && isBrowsePath(stored.href)) {
    const refPath = referrer ? pathnameOf(referrer) : "";
    const storedPath = pathnameOf(stored.href);
    return {
      href: stored.href,
      label: stored.label,
      useBack: Boolean(refPath && refPath === storedPath),
    };
  }
  if (referrer && isBrowsePath(referrer)) {
    const label = browseLabelFromPath(referrer);
    if (!label) return null;
    return { href: referrer, label, useBack: true };
  }
  return null;
}
