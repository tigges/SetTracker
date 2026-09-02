/**
 * Null first-party scrape collisions: bare hosts, link hubs, and handles
 * that belong to a different DJ.
 *
 *   npx tsx scripts/cleanup-stolen-socials.ts
 */
import { PrismaClient } from "@prisma/client";
import { DJ_SOCIAL_PINS } from "../src/lib/ingest/djSocialPins.data";
import {
  djMayClaimSocialUrl,
  isRejectedEntitySocialUrl,
  socialProfileKey,
} from "../src/lib/ingest/eventSocials";

const GENERIC = new Set([
  "linktree_",
  "getlinkfire",
  "beatport",
  "djmagofficial",
  "mixcloud",
  "evpro_",
  "colyn_music",
  "belonging-label",
]);

const FIELDS = ["instagram", "soundcloud", "youtube", "twitter"] as const;

const prisma = new PrismaClient();

function isBareHost(url: string): boolean {
  try {
    const u = new URL(url);
    return u.pathname.replace(/\/+$/, "") === "";
  } catch {
    return false;
  }
}

async function main() {
  const pinned = new Set(DJ_SOCIAL_PINS.map((p) => p.slug));
  const djs = await prisma.dj.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      instagram: true,
      soundcloud: true,
      youtube: true,
      twitter: true,
      website: true,
    },
  });

  const owner = new Map<string, { slug: string; name: string }>();
  for (const d of djs) {
    for (const field of FIELDS) {
      const url = d[field];
      if (!url) continue;
      const key = socialProfileKey(url);
      if (!key) continue;
      if (djMayClaimSocialUrl(d.name, url) && !owner.has(key)) {
        owner.set(key, { slug: d.slug, name: d.name });
      }
    }
  }

  let n = 0;
  for (const d of djs) {
    if (pinned.has(d.slug)) continue;
    const data: Record<string, null> = {};
    for (const field of FIELDS) {
      const url = d[field];
      if (!url) continue;
      if (isBareHost(url)) {
        data[field] = null;
        continue;
      }
      const key = socialProfileKey(url);
      const handle = key?.split(":")[1] ?? "";
      if (GENERIC.has(handle) || isRejectedEntitySocialUrl(url)) {
        data[field] = null;
        continue;
      }
      if (/linktr\.ee|getlinkfire|ffm\.to|lnk\.to/i.test(url)) {
        if (field === "twitter" || field === "instagram") data[field] = null;
        continue;
      }
      if (djMayClaimSocialUrl(d.name, url)) continue;
      const claimed = key ? owner.get(key) : undefined;
      if (claimed && claimed.slug !== d.slug) {
        data[field] = null;
        continue;
      }
      const other = djs.find(
        (o) => o.slug !== d.slug && djMayClaimSocialUrl(o.name, url),
      );
      if (other) data[field] = null;
    }
    if (
      d.website &&
      /linktr\.ee\/colyn|colyn_music/i.test(d.website) &&
      !/innellea/i.test(d.name)
    ) {
      data.website = null;
    }
    if (d.slug === "innellea" && d.website && /colyn/i.test(d.website)) {
      data.website = null;
    }
    if (!Object.keys(data).length) continue;
    await prisma.dj.update({ where: { id: d.id }, data });
    n += 1;
    console.log(d.slug, data);
  }
  console.log(JSON.stringify({ cleaned: n }));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
