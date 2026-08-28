import { StatsNotesLink } from "@/components/StatsNotesLink";
import {
  formatLlmFieldFill,
  formatLlmLatestPass,
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

function providerLine(providers: string[]): string {
  if (providers.includes("gemini") && providers.includes("claude")) {
    return "Gemini, then Claude";
  }
  if (providers.includes("gemini")) return "Gemini";
  if (providers.includes("claude")) return "Claude";
  return "no model";
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
        {label}
      </dt>
      <dd className="mono font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

export function StatsLlmCard({ stats }: { stats: LlmResearchStats }) {
  const latest = [...stats.rounds].sort((a, b) =>
    (b.generatedAt || "").localeCompare(a.generatedAt || ""),
  )[0];
  const job = latest ? jobFromFile(latest.file) : null;
  const latestLine =
    latest && job
      ? formatLlmLatestPass({
          job,
          sent: latest.scanned,
          fieldsWritten: latest.applied,
        })
      : null;

  return (
    <section id="llm-research" className="card mb-2.5 scroll-mt-20 p-3">
      <div className="mb-2 flex items-baseline gap-2">
        <h2 className="text-[14px] font-bold tracking-tight">Last LLM research</h2>
        <StatsNotesLink hash="runs" />
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] sm:grid-cols-4">
        <Stat
          label="DJs sent"
          value={stats.totals.djsScanned.toLocaleString()}
        />
        <Stat
          label="DJ fields"
          value={formatLlmFieldFill(
            stats.totals.djFieldsApplied,
            stats.totals.djFieldSlots,
          )}
        />
        <Stat
          label="Events sent"
          value={stats.totals.eventsScanned.toLocaleString()}
        />
        <Stat
          label="Event fields"
          value={formatLlmFieldFill(
            stats.totals.eventFieldsApplied,
            stats.totals.eventFieldSlots,
          )}
        />
        <Stat
          label="DJs with a write"
          value={
            stats.totals.djsScanned
              ? stats.totals.djWithWrite.toLocaleString()
              : "—"
          }
        />
        <Stat
          label="Events with a write"
          value={
            stats.totals.eventsScanned
              ? stats.totals.eventWithWrite.toLocaleString()
              : "—"
          }
        />
      </dl>
      <p className="mono mt-2 text-[11px] text-muted2">
        {`updated ${fmtWhen(stats.generatedAt)} · ${providerLine(stats.providers)}`}
        {latestLine ? ` · ${latestLine}` : ""}
        {` · DJs ${llmJobVariablesLabel("handles")} · events ${llmJobVariablesLabel("events")}`}
      </p>
    </section>
  );
}
