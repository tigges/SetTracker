import { StatsHealthCard, StatsMeter } from "@/components/StatsHealthCard";
import { StatsNotesLink } from "@/components/StatsNotesLink";
import { formatLlmHitRate } from "@/lib/ingest/discovery/llmTrackRecord";
import type { LlmResearchStats } from "@/lib/llmResearchStats";
import { llmRequestView } from "@/lib/statsRunHealth";

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

function fieldFillNote(opts: {
  written: number;
  slots: number;
  noun: string;
}): string | null {
  if (opts.slots <= 0 && opts.written <= 0) return null;
  if (opts.slots <= 0) {
    return `${opts.written.toLocaleString()} ${opts.noun} fields filled`;
  }
  return `${opts.written.toLocaleString()} of ${opts.slots.toLocaleString()} ${opts.noun} field slots filled`;
}

export function StatsLlmCard({ stats }: { stats: LlmResearchStats }) {
  const view = llmRequestView(stats);
  const rate =
    view.sent > 0 ? formatLlmHitRate(view.found, view.sent) : null;
  const hintBits = [
    "requests sent",
    providerLine(stats.providers),
    shortDay(stats.generatedAt),
    rate && rate !== "n/a" ? `${rate} hit` : null,
  ].filter(Boolean);
  const fieldBits = [
    fieldFillNote({
      written: view.fields.djWritten,
      slots: view.fields.djSlots,
      noun: "DJ",
    }),
    fieldFillNote({
      written: view.fields.eventWritten,
      slots: view.fields.eventSlots,
      noun: "event",
    }),
  ].filter(Boolean);

  return (
    <StatsHealthCard
      id="llm-research"
      noun="Last LLM research"
      total={view.sent}
      barTotal={view.sent}
      hint={hintBits.join(" · ") || "No research report in this export"}
      slices={view.slices}
      actions={[]}
      titleExtra={<StatsNotesLink hash="runs" />}
    >
      {view.event ? (
        <StatsMeter
          label="Events"
          slices={view.event.slices}
          total={view.event.sent}
        />
      ) : null}
      {fieldBits.length > 0 ? (
        <p className="mono mt-2 text-[11px] text-muted2">
          {fieldBits.join(" · ")}
        </p>
      ) : null}
    </StatsHealthCard>
  );
}
