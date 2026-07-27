import { PrismaClient } from "@prisma/client";
import {
  resolvePlaybackStream,
  sampleClipFromStream,
  enrichSparseSetsWithAcrCloud,
} from "../src/lib/ingest/enrich/acrcloud";

async function main() {
  const url = "https://soundcloud.com/realblackcoffee/dj-mix-3";
  console.log("resolving…");
  const stream = await resolvePlaybackStream(url, { allowYoutube: false });
  console.log("stream", stream);
  if (stream) {
    const clip = await sampleClipFromStream(stream.streamUrl, 60, 12);
    console.log("clip bytes", clip?.length ?? null);
  }
  process.env.ACRCLOUD_ENABLED = "1";
  process.env.ACRCLOUD_DRY_RUN = "1";
  process.env.ACRCLOUD_SET_LIMIT = "1";
  const p = new PrismaClient();
  const stats = await enrichSparseSetsWithAcrCloud(p, {
    dryRun: true,
    setLimit: 1,
    sampleSec: 12,
    stepSec: 180,
  });
  console.log("stats", stats);
  await p.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
