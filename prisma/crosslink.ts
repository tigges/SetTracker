/**
 * Standalone handle cross-link pass (YT About + SC bios + link hubs).
 * Also runs as the first step of `npm run ingest`.
 */
import { runCrosslinkDiscovery } from "../src/lib/ingest/discovery/crosslink";

runCrosslinkDiscovery()
  .then((report) => {
    console.log(
      `Done. ok=${report.ok.length} needsAttention=${report.needsAttention.length}`,
    );
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
