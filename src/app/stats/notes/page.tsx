import type { Metadata } from "next";
import Link from "next/link";
import {
  ACR_IDENTIFY_VARIABLES_LABEL,
} from "@/lib/ingest/enrich/acrProbeRecord";
import { ACR_INVOICE_SKU } from "@/lib/ingest/enrich/enrichSpendLedger";
import { estimateLlmSpend, formatLlmSpend } from "@/lib/ingest/discovery/llmCost";
import { pageMeta, workflowRunUrl } from "@/lib/site";

const LLM_QUEUE_ESTIMATE = estimateLlmSpend({
  jobs: ["handles", "events", "quality"],
  limit: 24,
  providers: ["gemini"],
});

export const metadata: Metadata = pageMeta({
  title: "Stats notes",
  description: "Operator handbook for /stats — ACR, queues, and paid runs.",
  path: "/stats/notes",
  robots: { index: false, follow: false },
});

export default function StatsNotesPage() {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">Operator</p>
      <h1 className="mt-1 text-xl font-extrabold tracking-tight">Stats notes</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        Static playbook. Live counts stay on{" "}
        <Link href="/stats" className="text-brand hover:underline">
          /stats
        </Link>
        .
      </p>

      <section id="acr" className="scroll-mt-20">
        <h2 className="mt-8 text-[14px] font-bold tracking-tight">ACR</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Variables:{" "}
          <span className="mono text-ink">{ACR_IDENTIFY_VARIABLES_LABEL}</span>.
          Identify cuts 12s clips from SoundCloud / hearthis we already host.
          File Scan POSTs the YouTube URL; ACR downloads the set. Same fields
          either path. We do not request AI-detection hours.
        </p>
        <p className="mono mt-2 text-[11px] leading-snug text-muted2">
          Invoice Identify → {ACR_INVOICE_SKU.identify}
        </p>
        <p className="mono mt-1 text-[11px] leading-snug text-muted2">
          Invoice File Scan → {ACR_INVOICE_SKU.filescan}
        </p>
        <p className="mono mt-1 text-[11px] leading-snug text-muted2">
          {ACR_INVOICE_SKU.filescanAi} is leftover container default, not a
          catalog ask.
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">
          Same YouTube URL is not re-POSTed (container reuse). Same offset is
          not re-Identified (grey acr-miss park). The same release in two sets
          is two requests — different performances.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          The catalog ledger starts with the first enrich after v0.2.264.
          Divide the ACR dollar line by request / submit totals for a unit
          rate. Older invoice months are not reconstructable from last-run
          snapshots. GitHub-hosted Actions bot-wall YouTube — File Scan is the
          CI path.
        </p>
      </section>

      <section id="clocks" className="scroll-mt-20">
        <h2 className="mt-8 text-[14px] font-bold tracking-tight">Clocks</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Clocks come from official YT/SC/hearthis text and ACR fingerprints.
          1001 is a community overlay only. No playback has no button — wait
          for an official full-set upload.
        </p>
      </section>

      <section id="queues" className="scroll-mt-20">
        <h2 className="mt-8 text-[14px] font-bold tracking-tight">Queues</h2>
        <ul className="mt-2 space-y-1 text-[13px] text-muted">
          <li>
            <span className="font-semibold text-teal">Automatic</span> — jobs
            drain
          </li>
          <li>
            <span className="font-semibold text-amber">Operator</span> — you
            link or paste
          </li>
          <li>
            <span className="font-semibold text-ink">Automatic + operator</span>{" "}
            — jobs first, leftovers on you
          </li>
        </ul>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">
          <span className="font-semibold text-ink">Automated IDs:</span> Catalog
          enrich Identify + File Scan write artist, title, ISRC, score, and
          offset. Catalog LLM research writes handles, event socials, home
          city, track IDs, and cue clocks — each job names its variables and
          parks partial / empty results so the same row is not retraced. Handle
          research skips DJs and venues that already have a first-party page
          to parse. Cue extras stay off unless you set LLM_CUE_EXTRAS. Cue
          parser apply and track-id fill-null also run on enrich.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          <span className="font-semibold text-ink">Manual IDs:</span> Capture
          1001, Suggest ID on a set page, wire official playbacks, and
          entity-complete pins.
        </p>
      </section>

      <section id="runs" className="scroll-mt-20">
        <h2 className="mt-8 text-[14px] font-bold tracking-tight">Paid runs</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          /stats is a static export — it cannot start a run. Open a workflow,
          then Run workflow.
        </p>
        <ul className="mt-2 space-y-1 text-[13px] text-muted">
          <li>
            <a
              href={workflowRunUrl("catalog-deep.yml")}
              className="text-brand underline decoration-dotted underline-offset-2"
            >
              Catalog deep refresh
            </a>{" "}
            drains Automatic queues (handles, artwork, official www, venue
            thumbs).
          </li>
          <li>
            <a
              href={workflowRunUrl("catalog-enrich.yml")}
              className="text-brand underline decoration-dotted underline-offset-2"
            >
              Catalog enrich
            </a>{" "}
            runs ACR Identify + File Scan on a standing budget.
          </li>
          <li>
            <a
              href={workflowRunUrl("catalog-llm-research.yml")}
              className="text-brand underline decoration-dotted underline-offset-2"
            >
              Catalog LLM research
            </a>{" "}
            runs handle / event / quality research on a standing budget.
          </li>
        </ul>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Every paid run prints what it researches and a cost estimate before
          it sends anything. LLM: {formatLlmSpend(LLM_QUEUE_ESTIMATE)}.
        </p>
      </section>

      <p className="mt-10 text-[13px] text-muted">
        <Link href="/stats" className="text-brand hover:text-brandstrong">
          ← Catalog health
        </Link>
      </p>
    </div>
  );
}
