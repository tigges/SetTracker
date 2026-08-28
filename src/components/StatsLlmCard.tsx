import { StatsNotesLink } from "@/components/StatsNotesLink";
import {
  formatLlmHitRate,
  formatLlmTrackMessage,
  llmJobVariablesLabel,
} from "@/lib/ingest/discovery/llmTrackRecord";
import type { LlmCostJob } from "@/lib/ingest/discovery/llmCost";
import type { LlmResearchStats } from "@/lib/llmResearchStats";

function fmtWhen(iso: string | null): string {
  if (!iso) return "—";
  const d = Date.parse(iso);
  if (!Number.isFinite(d)) return iso;
  return new Date(d).toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
}

function jobFromFile(file: string): LlmCostJob | null {
  if (file.startsWith("llm-event-handle-research")) return "events";
  if (file.startsWith("llm-handle-research")) return "handles";
  if (file.startsWith("llm-identity-research")) return "identity";
  if (file.startsWith("llm-homecity-research")) return "homecity";
  if (file.startsWith("llm-official-video-research")) return "videos";
  if (file.startsWith("llm-track-id-research")) return "tracks";
  if (file.startsWith("llm-cue-research")) return "cues";
  if (file.startsWith("llm-quality")) return "quality";
  return null;
}

export function StatsLlmCard({ stats }: { stats: LlmResearchStats }) {
  const latest = [...stats.rounds].sort((a, b) =>
    (b.generatedAt || "").localeCompare(a.generatedAt || ""),
  )[0];
  const job = latest ? jobFromFile(latest.file) : null;
  const line =
    latest && job
      ? formatLlmTrackMessage(job, {
          tracked: latest.scanned,
          found: latest.found ?? latest.applied,
          partial: latest.partial ?? 0,
          missed: latest.missed ?? Math.max(0, latest.rejected),
        })
      : null;

  return (
    <section id="llm-research" className="card mb-2.5 scroll-mt-20 p-3">
      <div className="mb-2 flex items-baseline gap-2">
        <h2 className="text-[14px] font-bold tracking-tight">Last LLM research</h2>
        <StatsNotesLink hash="runs" />
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] sm:grid-cols-4">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
            DJs tracked
          </dt>
          <dd className="mono font-semibold tabular-nums">
            {stats.totals.djsScanned.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
            DJ fields found
          </dt>
          <dd className="mono font-semibold tabular-nums">
            {stats.totals.djFieldsApplied.toLocaleString()}
            {stats.totals.djsScanned
              ? ` · ${formatLlmHitRate(stats.totals.djFieldsApplied, stats.totals.djsScanned)}`
              : ""}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
            Events tracked
          </dt>
          <dd className="mono font-semibold tabular-nums">
            {stats.totals.eventsScanned.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
            Event fields found
          </dt>
          <dd className="mono font-semibold tabular-nums">
            {stats.totals.eventFieldsApplied.toLocaleString()}
          </dd>
        </div>
      </dl>
      <p className="mono mt-2 text-[11px] text-muted2">
        {line
          ? `updated ${fmtWhen(stats.generatedAt)} · ${line}`
          : `updated ${fmtWhen(stats.generatedAt)} · tracks ${llmJobVariablesLabel("handles")}`}
      </p>
    </section>
  );
}
