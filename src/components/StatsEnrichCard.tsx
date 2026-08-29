import type { ActionsStatusFile } from "@/lib/actionsStatus";
import { enrichOutcomeLabel } from "@/lib/actionsStatus";
import { StatsHealthCard, StatsMeter } from "@/components/StatsHealthCard";
import { StatsLiveRuns } from "@/components/StatsLiveRuns";
import { StatsNotesLink } from "@/components/StatsNotesLink";
import { formatAcrHitRate } from "@/lib/ingest/enrich/acrProbeRecord";
import type { EnrichRunReport } from "@/lib/ingest/enrich/enrichRunReport";
import {
  sumFileScanSpend,
  sumIdentifySpend,
  type EnrichSpendLedger,
} from "@/lib/ingest/enrich/enrichSpendLedger";
import { cookieRefreshHint } from "@/lib/ingest/enrich/youtubeCookies";
import {
  fileScanOutcomeFromReport,
  fileScanSlicesFromSpend,
  identifyOutcomeFromReport,
  identifySlicesFromSpend,
  outcomeSlices,
} from "@/lib/statsRunHealth";

function shortDay(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = Date.parse(iso);
  if (!Number.isFinite(d)) return null;
  return new Date(d).toISOString().slice(0, 10);
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
  const id = identifyOutcomeFromReport(report?.identify);
  const fs = fileScanOutcomeFromReport(report?.filescan);
  const idSlices = outcomeSlices(id);
  const fsSlices = outcomeSlices(fs);
  const idRate =
    id.probed > 0 ? formatAcrHitRate(id.hit, id.probed) : null;
  const parked = report?.identify?.alreadyProbed ?? 0;
  const ledgerId = ledger?.runs.length ? sumIdentifySpend(ledger.runs) : null;
  const ledgerFs = ledger?.runs.length ? sumFileScanSpend(ledger.runs) : null;
  const day = shortDay(report?.updatedAt);
  const hintBits = [
    report ? enrichOutcomeLabel(report) : "no snapshot yet",
    day,
    idRate && idRate !== "n/a" ? `${idRate} hit` : null,
    parked > 0 ? `${parked.toLocaleString()} offsets parked` : null,
  ].filter(Boolean);
  const cookies = report?.cookies;
  const runUrl = report?.github?.runUrl;
  const runMode = report?.github?.mode || report?.github?.workflow;

  return (
    <StatsHealthCard
      id="enrich"
      noun="Last enrich"
      total={id.probed}
      barTotal={id.hit + id.partial + id.miss || id.probed}
      hint={hintBits.join(" · ")}
      slices={idSlices}
      actions={[]}
      titleExtra={<StatsNotesLink hash="acr" />}
    >
      {fs.videos > 0 || fs.hit + fs.partial + fs.miss > 0 ? (
        <StatsMeter
          label="File Scan"
          slices={fsSlices}
          total={fs.videos || fs.hit + fs.partial + fs.miss}
        />
      ) : null}
      {ledgerId && ledgerId.requests > 0 ? (
        <StatsMeter
          label="This month"
          slices={identifySlicesFromSpend(ledgerId)}
          total={ledgerId.requests}
          starNote={
            ledgerFs
              ? `File Scan ${ledgerFs.submitted.toLocaleString()} new · ${ledgerFs.reused.toLocaleString()} reused · ${ledgerFs.hits.toLocaleString()} hits`
              : undefined
          }
        />
      ) : ledgerFs && ledgerFs.submitted + ledgerFs.reused > 0 ? (
        <StatsMeter
          label="This month"
          slices={fileScanSlicesFromSpend(ledgerFs)}
          total={ledgerFs.submitted + ledgerFs.reused}
        />
      ) : null}
      {cookies?.stale ? (
        <p className="mono mt-2 text-[11px] text-amber">
          {cookieRefreshHint(cookies)}
        </p>
      ) : null}
      {runUrl ? (
        <p className="mt-2 text-[12px]">
          <a
            href={runUrl}
            className="font-semibold text-brandstrong hover:underline"
          >
            Open this enrich run
          </a>
          {runMode ? (
            <span className="mono text-[11px] text-muted2"> · {runMode}</span>
          ) : null}
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
    </StatsHealthCard>
  );
}
