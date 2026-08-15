/**
 * Atlas entries for the site search index — seed JSON only, no Prisma.
 * Header search uses these so Tomorrowland / Guetta open /atlas#slug.
 */

import { loadAtlasDjs, loadAtlasVenues } from "./seed";

export const ATLAS_QUERY_EVENT = "setradar:atlas-query";

export type AtlasSearchItem = {
  kind: "atlas";
  title: string;
  subtitle: string;
  href: string;
  keywords: string;
};

export function atlasSearchItems(): AtlasSearchItem[] {
  const venues = loadAtlasVenues().map((v) => {
    const place = v.city ? `${v.city}, ${v.country}` : v.country;
    return {
      kind: "atlas" as const,
      title: v.name,
      subtitle: `${v.kind} · #${v.rank} · ${place}`,
      href: `/atlas#${v.slug}`,
      keywords: [
        "atlas",
        "top 100",
        "dj mag",
        v.kind,
        v.city,
        v.country,
        v.chartSlug,
      ]
        .filter(Boolean)
        .join(" "),
    };
  });
  const djs = loadAtlasDjs().map((d) => {
    const place = d.city ? `${d.city}, ${d.country}` : d.country;
    return {
      kind: "atlas" as const,
      title: d.name,
      subtitle: `DJ · #${d.rank} · ${place}`,
      href: `/atlas#${d.slug}`,
      keywords: ["atlas", "top 100", "dj mag", "dj", d.city, d.country]
        .filter(Boolean)
        .join(" "),
    };
  });
  return [...venues, ...djs];
}
