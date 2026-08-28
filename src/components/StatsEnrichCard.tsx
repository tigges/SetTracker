import type { ActionsStatusFile } from "@/lib/actionsStatus";
import { enrichOutcomeLabel } from "@/lib/actionsStatus";
import { StatsLiveRuns } from "@/components/StatsLiveRuns";
import {
  ACR_IDENTIFY_VARIABLES_LABEL,
  formatAcrHitRate,
} from "@/lib/ingest/enrich/acrProbeRecord";
import type { EnrichRunReport } from "@/lib/ingest/enrich/enrichRunReport";
import {
  ACR_INVOICE_SKU,
  formatFileScanSpendLine,
  formatIdentifySpendLine,
  sumFileScanSpend,
  sumIdentifySpend,
  type EnrichSpendLedger,
} from "@/lib/ingest/enrich/enrichSpendLedger";
import { cookieRefreshHint } from "@/lib/ingest/enrich/youtubeCookies";

function fmtWhen(iso: string | undefined): string {
  if (!iso) return "—";
  const d = Date.parse(iso);
  if (!Number.isFinite(d)) return iso;
  return new Date(d).toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
}

function Tone({
  label,
  tone,
}: {
  label: string;
  tone: "ok" | "warn" | "muted";
}) {
  const cls =
    tone === "ok"
      ? "text-brandstrong"
      : tone === "warn"
        ? "text-amber"
        : "text-muted2";
  return <span className={`mono text-[12px] font-semibold ${cls}`}>{label}</span>;
}

export function StatsEnrichCard({
  report,
  ledger,
  actions,
}: {
  report: EnrichRunReport | null;
  ledger: EnrichSpendLedger | null;
  actions: ActionsStatusFile | null;
}) {
  const id = report?.identify;
  const fs = report?.filescan;
  const cookies = report?.cookies;
  const outcome = enrichOutcomeLabel(report);
  const idRate = id
    ? (id.hitRate ?? formatAcrHitRate(id.identified, id.probed))
    : null;
  const fsRate = fs
    ? (fs.hitRate ?? formatAcrHitRate(fs.identified, fs.ready))
    : null;
  const idSpend = id
    ? {
        requests: id.probed,
        hits: id.identified,
        partial: id.partial ?? 0,
        missed:
          id.missed ?? Math.max(0, (id.unresolved ?? 0) - (id.partial ?? 0)),
        alreadyProbed: id.alreadyProbed ?? 0,
      }
    : null;
  const fsSpend = fs
    ? {
        submitted: fs.submitted,
        reused: fs.reused ?? 0,
        hits: fs.identified,
        partial: fs.partial ?? 0,
        missed: fs.missed ?? 0,
      }
    : null;
  const ledgerId = ledger?.runs.length ? sumIdentifySpend(ledger.runs) : null;
  const ledgerFs = ledger?.runs.length ? sumFileScanSpend(ledger.runs) : null;
  const outcomeTone =
    report?.outcome === "ok" ? "ok" : report?.outcome === "partial" ? "warn" : "muted";

  return (
    <section id="enrich" className="card mb-2.5 scroll-mt-20 p-3">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-bold tracking-tight">Last enrich</h2>
          <p className="mt-0.5 text-[11px] text-muted2">
            Identify + File Scan from the cached catalog, as of the last Pages
            ship. ACR&apos;s invoice lists SKUs and dollars only — request
            counts, hits, partials, and reuse live here.
          </p>
        </div>
        <Tone label={outcome} tone={outcomeTone} />
      </div>

      <div className="mb-2 rounded-lg border border-line bg-bg px-2.5 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          What we send ACR
        </p>
        <p className="mt-1 text-[12px] leading-snug text-ink">
          Variables:{" "}
          <span className="mono">
            {id?.variables ?? fs?.variables ?? ACR_IDENTIFY_VARIABLES_LABEL}
          </span>
          . Identify cuts 12s clips from SoundCloud / hearthis we already host.
          File Scan POSTs the YouTube URL; ACR downloads the set. Same fields
          either path. We do not request AI-detection hours.
        </p>
        <p className="mono mt-1 text-[10px] leading-snug text-muted2">
          Invoice Identify → {ACR_INVOICE_SKU.identify}
        </p>
        <p className="mono mt-0.5 text-[10px] leading-snug text-muted2">
          Invoice File Scan → {ACR_INVOICE_SKU.filescan}
        </p>
        <p className="mono mt-0.5 text-[10px] leading-snug text-muted2">
          {ACR_INVOICE_SKU.filescanAi} is leftover container default, not a
          catalog ask.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] sm:grid-cols-4">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
            Identify requests
          </dt>
          <dd className="mono font-semibold tabular-nums">
            {id ? `${id.probed}${idRate && idRate !== "n/a" ? ` · ${idRate} hit` : ""}` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
            Identify hits / partial
          </dt>
          <dd className="mono font-semibold tabular-nums">
            {id
              ? `${id.identified} / ${id.partial ?? 0} · ${id.missed ?? 0} miss`
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
            FS submits / reuse
          </dt>
          <dd className="mono font-semibold tabular-nums">
            {fs ? `${fs.submitted} new / ${fs.reused ?? 0} reused` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
            File Scan hits / partial
          </dt>
          <dd className="mono font-semibold tabular-nums">
            {fs
              ? `${fs.identified}${fsRate && fsRate !== "n/a" ? ` · ${fsRate}` : ""} / ${fs.partial ?? 0}`
              : "—"}
          </dd>
        </div>
      </dl>

      <p className="mono mt-2 text-[11px] text-muted2">
        {report
          ? `this run ${fmtWhen(report.updatedAt)} · Identify ${idSpend ? formatIdentifySpendLine(idSpend) : "idle"}`
          : "No enrich snapshot in this catalog yet. Next Catalog enrich writes one into the DB cache."}
      </p>
      {fsSpend ? (
        <p className="mono mt-0.5 text-[11px] text-muted2">
          File Scan {formatFileScanSpendLine(fsSpend)}
        </p>
      ) : null}
      <p className="mt-1 text-[11px] leading-snug text-muted2">
        Same YouTube URL is not re-POSTed (container reuse). Same offset is not
        re-Identified (grey acr-miss park). The same release in two sets is two
        requests — different performances.
      </p>

      {ledgerId && ledgerFs ? (
        <div className="mt-2 rounded-lg border border-line px-2.5 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            Catalog ledger · {ledger!.runs.length} enrich run
            {ledger!.runs.length === 1 ? "" : "s"}
          </p>
          <p className="mono mt-1 text-[11px] text-ink">
            Identify {formatIdentifySpendLine(ledgerId)}
          </p>
          <p className="mono mt-0.5 text-[11px] text-ink">
            File Scan {formatFileScanSpendLine(ledgerFs)}
          </p>
          <p className="mt-1 text-[10px] leading-snug text-muted2">
            Starts with the first enrich after this ship. Divide the ACR dollar
            line by these request / submit totals to get the real unit rate.
            Older invoice months are not reconstructable from last-run
            snapshots.
          </p>
        </div>
      ) : (
        <p className="mono mt-2 text-[11px] text-muted2">
          Spend ledger starts on the next Catalog enrich after this ship. Last
          run still shows requests / hits / partials / reuse above.
        </p>
      )}

      {cookies ? (
        <p className={`mono mt-1 text-[11px] ${cookies.stale ? "text-amber" : "text-muted2"}`}>
          {cookieRefreshHint(cookies)}
          {" · GitHub-hosted Actions still bot-wall YouTube — File Scan is the CI path."}
        </p>
      ) : null}

      {report?.github?.runUrl ? (
        <p className="mt-1 text-[12px]">
          <a
            href={report.github.runUrl}
            className="font-semibold text-brandstrong hover:underline"
          >
            Open this enrich run
          </a>
          <span className="mono text-[11px] text-muted2">
            {" "}
            · {report.github.mode || report.github.workflow}
          </span>
        </p>
      ) : null}

      <StatsLiveRuns
        initial={(actions?.workflows ?? []).map((w) => ({
          id: w.id,
          label: w.label,
          status: w.status,
          conclusion: w.conclusion,
          htmlUrl: w.htmlUrl,
          displayTitle: w.displayTitle,
          updatedAt: w.updatedAt,
        }))}
      />
    </section>
  );
}
