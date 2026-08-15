/**
 * Write public/search-index.json for the client search box.
 * Used by `predev` / `prebuild`. Missing catalog → [] and exit 0
 * so a fresh VM can still boot `npm run dev`.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { atlasSearchItems } from "../src/lib/atlas/searchItems";
import { getSearchIndex } from "../src/lib/searchIndex";

const out = path.join(process.cwd(), "public", "search-index.json");

const ATLAS_FALLBACK = [
  {
    kind: "atlas",
    title: "Top 100 Atlas",
    subtitle: "DJ Mag clubs & festivals 2026, DJs 2025",
    href: "/atlas",
    keywords: "map dj mag top 100 clubs festivals djs atlas",
  },
  ...atlasSearchItems(),
];

async function main() {
  let items: unknown[] = ATLAS_FALLBACK;
  try {
    items = await getSearchIndex();
  } catch (err) {
    console.warn(
      "write-search-index: catalog unavailable, writing atlas pins —",
      err instanceof Error ? err.message : err,
    );
  }
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(items));
  console.log(`wrote ${items.length} search items → ${out}`);
}

main().catch((err) => {
  console.warn("write-search-index failed:", err);
  process.exit(0);
});
