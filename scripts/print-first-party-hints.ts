/**
 * Print knownHandles entries for name-matched first-party YT/SC/IG.
 *
 *   npx tsx scripts/print-first-party-hints.ts
 */
import { PrismaClient } from "@prisma/client";
import { DJ_SOCIAL_PINS } from "../src/lib/ingest/djSocialPins.data";
import { hintForName } from "../src/lib/ingest/discovery/knownHandles";
import { isResearchWorthyName } from "../src/lib/ingest/discovery/llmResearch";
import {
  djMayClaimSocialUrl,
  socialProfileKey,
} from "../src/lib/ingest/eventSocials";

const prisma = new PrismaClient();

function ytHandle(url: string | null): string | undefined {
  if (!url) return undefined;
  const m = url.match(/youtube\.com\/@([^/?#]+)/i);
  return m ? `@${m[1]}` : undefined;
}

function scPermalink(url: string | null): string | undefined {
  if (!url) return undefined;
  const key = socialProfileKey(url);
  if (!key?.startsWith("soundcloud:")) return undefined;
  return key.slice("soundcloud:".length);
}

async function main() {
  const pinned = new Set(DJ_SOCIAL_PINS.map((p) => p.slug));
  const djs = await prisma.dj.findMany({
    select: {
      slug: true,
      name: true,
      instagram: true,
      soundcloud: true,
      youtube: true,
      website: true,
      _count: { select: { sets: true } },
    },
  });
  const entries: string[] = [];
  for (const d of djs) {
    if (pinned.has(d.slug)) continue;
    if (hintForName(d.name)) continue;
    if (!isResearchWorthyName(d.name)) continue;
    if (d._count.sets < 1) continue;
    if (/\d{1,2}-\d{1,2}-\d{2}|space miami|full set/i.test(d.name)) continue;
    if (d.name.split(/\s+/).length === 1 && d.name.length <= 4) continue;

    const yt =
      d.youtube && djMayClaimSocialUrl(d.name, d.youtube)
        ? ytHandle(d.youtube)
        : undefined;
    const sc =
      d.soundcloud && djMayClaimSocialUrl(d.name, d.soundcloud)
        ? scPermalink(d.soundcloud)
        : undefined;
    const ig =
      d.instagram && djMayClaimSocialUrl(d.name, d.instagram)
        ? d.instagram
        : undefined;
    if (!yt && !sc) continue;
    const key = d.name.trim().toLowerCase();
    const lines = [`  ${JSON.stringify(key)}: {`];
    if (yt) lines.push(`    youtubeHandle: ${JSON.stringify(yt)},`);
    if (sc) lines.push(`    soundcloudPermalink: ${JSON.stringify(sc)},`);
    if (ig) lines.push(`    instagram: ${JSON.stringify(ig)},`);
    lines.push("  },");
    entries.push(lines.join("\n"));
  }
  console.log(entries.join("\n"));
  console.log(`// count ${entries.length}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
