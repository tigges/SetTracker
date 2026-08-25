import type { Metadata } from "next";

/** Canonical public origin (GitHub Pages serves www). */
export const SITE_URL = "https://www.setradar.ai";
export const SITE_NAME = "setradar.ai";

export const SITE_TAGLINE = "DJ set database";

export const SITE_DESCRIPTION =
  "Tracklists, IDs, and provenance for electronic DJ sets — festivals, clubs, livestreams, and radio from SoundCloud, YouTube, hearthis.at, and the community.";

export function absoluteUrl(path = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p === "/" ? "/" : p}`;
}

export function pageTitle(page: string): string {
  return `${page} — ${SITE_NAME}`;
}

/** Per-page title, description, canonical, and social cards. */
export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  robots?: Metadata["robots"];
}): Metadata {
  const url = absoluteUrl(opts.path);
  const images = opts.image ? [{ url: opts.image }] : undefined;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    ...(opts.robots ? { robots: opts.robots } : {}),
    openGraph: {
      title: `${opts.title} — ${SITE_NAME}`,
      description: opts.description,
      url,
      images,
    },
    twitter: {
      card: opts.image ? "summary_large_image" : "summary",
      title: `${opts.title} — ${SITE_NAME}`,
      description: opts.description,
      images: opts.image ? [opts.image] : undefined,
    },
  };
}
