/**
 * Static /sets/[slug] export list.
 *
 * Near-duplicate collapse (Friendship Mix same week, Guetta Ultra year
 * repeats) is a feed display policy — not a reason to skip HTML. Pages
 * `output: "export"` 404s any slug that is missing from generateStaticParams,
 * and DJ / event / related lists link every catalog year.
 */

import { aliasSlugsFor } from "@/lib/ingest/sourceRemaps";

/** Unique catalog slugs that must get a static set page, plus retired aliases. */
export function staticSetPageSlugs(slugs: Iterable<string>): string[] {
  return aliasSlugsFor([...new Set(slugs)]);
}
