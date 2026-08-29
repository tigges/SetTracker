import { StatsHealthCard, StatsMeter } from "@/components/StatsHealthCard";
import { StatsNotesLink } from "@/components/StatsNotesLink";
import type { LlmResearchStats } from "@/lib/llmResearchStats";
import { llmFieldView } from "@/lib/statsRunHealth";

function shortDay(iso: string | null): string | null {
  if (!iso) return null;
  const d = Date.parse(iso);
  if (!Number.isFinite(d)) return null;
  return new Date(d).toISOString().slice(0, 10);
}

function providerLine(providers: string[]): string {
  if (providers.includes("gemini") && providers.includes("claude")) {
    return "Gemini, then Claude";
  }
  if (providers.includes("gemini")) return "Gemini";
  if (providers.includes("claude")) return "Claude";
  return "no model";
}

export function StatsLlmCard({ stats }: { stats: LlmResearchStats }) {
  const view = llmFieldView(stats);
  const hintBits = [
    "fields written of slots",
    providerLine(stats.providers),
    shortDay(stats.generatedAt),
  ].filter(Boolean);

  return (
    <StatsHealthCard
      id="llm-research"
      noun="Last LLM research"
      total={stats.totals.djsScanned}
      barTotal={view.djSlots}
      hint={hintBits.join(" · ") || "No research report in this export"}
      slices={view.dj}
      actions={[]}
      titleExtra={<StatsNotesLink hash="runs" />}
    >
      {stats.totals.eventsScanned > 0 ? (
        <StatsMeter
          label="Event fields"
          slices={view.event}
          total={view.eventSlots}
        />
      ) : null}
      {view.outcome ? (
        <StatsMeter
          label="DJ outcomes"
          slices={view.outcome}
          total={view.outcome.reduce((n, s) => n + s.count, 0)}
        />
      ) : null}
    </StatsHealthCard>
  );
}
