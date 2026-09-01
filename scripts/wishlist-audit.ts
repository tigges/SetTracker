/**
 * File-side wishlist completeness (roster + entity pins).
 *   npm run wishlist:audit
 *
 * No network, no DB. Does not change Capture / Identify ranking.
 * Tujamo stays off the roster until an official artist-channel pin exists
 * (Parookaville 2026 is already a curated YT + 1001 seed).
 */
import { wishlistFileCoverage } from "../src/lib/wishlistCoverage";

function main() {
  const rows = wishlistFileCoverage();
  const need = rows.filter((r) => r.gaps.length > 0);
  console.log(`wishlist file map  ${rows.length} defaults  ${need.length} with gaps`);
  console.log("");
  for (const r of rows) {
    const mark = r.gaps.length ? "GAP" : "ok ";
    const yt = r.youtube ?? "—";
    const sc = r.soundcloud ?? "—";
    const pin = r.pin ? (r.pinThumb ? "pin+art" : "pin") : "no-pin";
    const gaps = r.gaps.length ? r.gaps.join(",") : "";
    console.log(
      `${mark}  ${r.slug.padEnd(18)}  yt ${yt.padEnd(28)}  sc ${sc.padEnd(24)}  ${pin.padEnd(8)}  ${gaps}`,
    );
  }
  console.log("");
  console.log(
    "Map more sets: official YT/SC on ARTIST_ROSTER_CURATED (next curated ingest),",
  );
  console.log(
    "then /stats Capture 1001 for clocks (npm run check:capture first).",
  );
  console.log(
    "One-run deeper poll for wishlist roster names: WISHLIST_POLL_BOOST=1 npm run ingest",
  );
  console.log(
    "Default Capture 1001 / Identify ranking is unchanged.",
  );
}

main();
