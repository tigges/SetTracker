import type { MetadataRoute } from "next";
import {
  getAllDjSlugs,
  getAllLabelSlugs,
  getAllSetSlugs,
  getAllVenueSlugs,
} from "@/lib/queries";
import { SITE_URL } from "@/lib/site";

// Required for `output: "export"` — Next compiles sitemap.ts to a GET route.
export const dynamic = "force-static";

function loc(path: string): string {
  return `${SITE_URL}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sets, djs, events, labels] = await Promise.all([
    getAllSetSlugs(),
    getAllDjSlugs(),
    getAllVenueSlugs(),
    getAllLabelSlugs(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: loc("/"), changeFrequency: "daily", priority: 1 },
    { url: loc("/djs"), changeFrequency: "weekly", priority: 0.8 },
    { url: loc("/events"), changeFrequency: "weekly", priority: 0.8 },
    { url: loc("/atlas"), changeFrequency: "monthly", priority: 0.7 },
    { url: loc("/stats"), changeFrequency: "weekly", priority: 0.4 },
    { url: loc("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: loc("/search"), changeFrequency: "weekly", priority: 0.4 },
    { url: loc("/labels"), changeFrequency: "monthly", priority: 0.3 },
  ];

  return [
    ...staticPages,
    ...sets
      .filter((s) => s !== "_placeholder")
      .map((slug) => ({
        url: loc(`/sets/${slug}`),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ...djs
      .filter((s) => s !== "_placeholder")
      .map((slug) => ({
        url: loc(`/djs/${slug}`),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
    ...events
      .filter((s) => s !== "_placeholder")
      .map((slug) => ({
        url: loc(`/events/${slug}`),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
    ...labels
      .filter((s) => s !== "_placeholder")
      .map((slug) => ({
        url: loc(`/labels/${slug}`),
        changeFrequency: "monthly" as const,
        priority: 0.3,
      })),
  ];
}
