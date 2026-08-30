import type { Metadata } from "next";
import Link from "next/link";
import { StatusLegend } from "@/components/StatusBits";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "About",
  description:
    "setradar.ai is a DJ-set database: play the recording and see the timed tracklist.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">setradar.ai</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">About</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        Play a festival, club, or livestream set and see the timed tracklist.
        Colors tell you what is identified and which tracks are still unknown.
      </p>

      <h2 className="mt-10 text-lg font-bold tracking-tight">Track colors</h2>
      <div className="mt-3">
        <StatusLegend />
      </div>
      <ul className="mt-4 space-y-2 text-[14px] text-muted">
        <li>
          <span className="text-amber">Identified</span> — a named release we
          matched.
        </li>
        <li>
          <span className="text-magenta">Unknown tracks</span> — played, name
          still open.
        </li>
        <li>
          <span className="text-teal">Community resolved</span> — confirmed from
          a suggestion.
        </li>
        <li>
          <span className="text-grey">Not detected</span> — no name at that
          point in the set.
        </li>
      </ul>

      <h2 className="mt-10 text-lg font-bold tracking-tight">Suggest an ID</h2>
      <p className="mt-3 text-[14px] leading-relaxed text-muted">
        On an open row, Suggest ID opens a GitHub issue with a ready snippet —
        or copy the JSON if you do not have an account. We match the clock on
        the row, not the number. No site login required.
      </p>

      <details className="mt-10 rounded-lg border border-line bg-panel px-4 py-3">
        <summary className="cursor-pointer text-[14px] font-semibold text-ink">
          How this is built
        </summary>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          Tracklists come from official playback descriptions and timed
          comments, plus lists already linked from those pages. We do not
          invent cues. Fingerprint enrich only fills timeline gaps and never
          appears as a vendor score on the set page.
        </p>
      </details>

      <p className="mt-10 text-[14px] text-muted">
        <Link href="/sets" className="text-brand hover:text-brandstrong">
          Browse sets →
        </Link>
      </p>
    </div>
  );
}
