import type { ActionsStatusFile } from "@/lib/actionsStatus";
import { enrichOutcomeLabel } from "@/lib/actionsStatus";
import { StatsLiveRuns } from "@/components/StatsLiveRuns";
import {
  ACR_IDENTIFY_VARIABLES_LABEL,
  formatAcrHitRate,
  formatAcrTrackMessage,
} from "@/lib/ingest/enrich/acrProbeRecord";
import type { EnrichRunReport } from "@/lib/ingest/enrich/enrichRunReport";
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
  actions,
}: {
  report: EnrichRunReport | null;
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
  const idTrack =
    id &&
    formatAcrTrackMessage({
      probed: id.probed,
      identified: id.identified,
      partial: id.partial ?? 0,
      missed: id.missed ?? Math.max(0, (id.unresolved ?? 0) - (id.partial ?? 0)),
    });
  const fsTrack =
    fs &&
    formatAcrTrackMessage({
      probed: fs.ready,
      identified: fs.identified,
      partial: fs.partial ?? 0,
      missed: fs.missed ?? 0,
    });
  const outcomeTone =
    report?.outcome === "ok" ? "ok" : report?.outcome === "partial" ? "warn" : "muted";

  return (
    <section id="enrich" className="card mb-2.5 scroll-mt-20 p-3">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-bold tracking-tight">Last enrich</h2>
          <p className="mt-0.5 text-[11px] text-muted2">
            Automated Identify + File Scan from the cached catalog, as of the
            last Pages ship. Tracks {id?.variables ?? ACR_IDENTIFY_VARIABLES_LABEL}.
            The workflow rows below refresh live from GitHub.
          </p>
        </div>
        <Tone label={outcome} tone={outcomeTone} />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] sm:grid-cols-4">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
            Identify hits
          </dt>
          <dd className="mono font-semibold tabular-nums">
            {id ? `${id.identified}${idRate && idRate !== "n/a" ? ` · ${idRate}` : ""}` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
            File Scan hits
          </dt>
          <dd className="mono font-semibold tabular-nums">
            {fs ? `${fs.identified}${fsRate && fsRate !== "n/a" ? ` · ${fsRate}` : ""}` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
            YT bot-walls
          </dt>
          <dd className="mono font-semibold tabular-nums">
            {id ? id.youtubeBotWalls : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
            YT skipped
          </dt>
          <dd className="mono font-semibold tabular-nums">
            {id ? id.youtubeSkipped : "—"}
          </dd>
        </div>
      </dl>

      <p className="mono mt-2 text-[11px] text-muted2">
        {report
          ? `updated ${fmtWhen(report.updatedAt)} · ${idTrack ?? "Identify idle"} · FS ${fsTrack ?? "idle"}`
          : "No enrich snapshot in this catalog yet. Next Catalog enrich writes one into the DB cache."}
      </p>

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
