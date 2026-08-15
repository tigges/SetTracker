/**
 * Write public/search-index.json for the client search box.
 * Used by `predev` / `prebuild`. Missing catalog → [] and exit 0
 * so a fresh VM can still boot `npm run dev`.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSearchIndex } from "../src/lib/searchIndex";

const out = path.join(process.cwd(), "public", "search-index.json");

async function main() {
  let items: unknown[] = [];
  try {
    items = await getSearchIndex();
  } catch (err) {
    console.warn(
      "write-search-index: catalog unavailable, writing [] —",
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
