import type { Metadata } from "next";
import Link from "next/link";
import { StatusLegend } from "@/components/StatusBits";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "About",
  description:
    "What setradar.ai is: a DJ set database with tracklist IDs, provenance, and source health.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">setradar.ai</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">About</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        A database of electronic DJ sets — festivals, radio shows, and mixes.
        Every track row has a status and a provenance so you can see what is
        identified and what is still an ID.
      </p>

      <h2 className="mt-10 text-lg font-bold tracking-tight">ID colors</h2>
      <div className="mt-3">
        <StatusLegend />
      </div>
      <ul className="mt-4 space-y-2 text-[14px] text-muted">
        <li>
          <span className="text-amber">Identified</span> — released track, matched
          to a catalog record.
        </li>
        <li>
          <span className="text-magenta">Unresolved ID</span> — unreleased or
          unknown; waiting for a name.
        </li>
        <li>
          <span className="text-teal">Community resolved</span> — was an ID,
          confirmed from a suggestion.
        </li>
        <li>
          <span className="text-grey">Unparsed</span> — raw source text, not
          matched yet.
        </li>
      </ul>

      <h2 className="mt-10 text-lg font-bold tracking-tight">Sources</h2>
      <p className="mt-3 text-[14px] leading-relaxed text-muted">
        Tracklists come from SoundCloud descriptions and timed comments,
        hearthis.at, YouTube descriptions and song credits, Insomniac Night Owl
        Radio, and 1001Tracklists seeds already linked from those pages. We do
        not invent cues. Fingerprint enrich (ACRCloud) only fills timeline gaps.
      </p>

      <h2 className="mt-10 text-lg font-bold tracking-tight">Suggest an ID</h2>
      <p className="mt-3 text-[14px] leading-relaxed text-muted">
        On unresolved or unparsed rows, Suggest ID copies a snippet you can
        email — no GitHub account required. Maintainers paste it into{" "}
        <span className="mono text-[12px]">data/resolutions.json</span> and the
        next ingest applies it.
      </p>

      <p className="mt-10 text-[14px] text-muted">
        <Link href="/" className="text-brand hover:text-brandstrong">
          Browse sets →
        </Link>
      </p>
    </div>
  );
}
