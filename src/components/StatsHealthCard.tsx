import type { ReactNode } from "react";
import Link from "next/link";
import { slicePct, type HealthSlice } from "@/lib/statsHealth";
import type { CueMixRow, HealthAction } from "@/lib/statsHealthData";

function StackedBar({ slices, total }: { slices: HealthSlice[] | CueMixRow[]; total: number }) {
  const n = total > 0 ? total : slices.reduce((s, x) => s + x.count, 0);
  return (
    <div className="flex h-5 w-full overflow-hidden rounded-full bg-linesoft">
      {slices.map((slice) => {
        if (slice.count <= 0) return null;
        const width = n > 0 ? slicePct(slice.count, n) : 0;
        return (
          <div
            key={slice.key}
            title={`${slice.label}: ${slice.count.toLocaleString()}`}
            className="min-w-[6px]"
            style={{ width: `${width}%`, background: slice.color }}
          />
        );
      })}
    </div>
  );
}

function SliceLegend({ slices }: { slices: HealthSlice[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
      {slices.map((s) => (
        <div key={s.key} className="flex items-baseline gap-2">
          <span
            className="mt-[3px] inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ background: s.color }}
          />
          <span className="text-[13px] text-muted">{s.label}</span>
          <span className="mono text-[13px] font-semibold tabular-nums text-ink">
            {s.count.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

function StarLine({
  onChart,
  slices,
}: {
  onChart?: number;
  slices: HealthSlice[];
}) {
  const bits = [
    onChart != null && onChart > 0 ? `★ ${onChart.toLocaleString()} on chart` : null,
    ...slices
      .filter((s) => s.star > 0 && s.key !== "ready" && s.key !== "has_set" && s.key !== "complete" && s.key !== "playable" && s.key !== "beatport")
      .map((s) => `★ ${s.star.toLocaleString()} of ${s.label}`),
  ].filter(Boolean);
  if (bits.length === 0) return null;
  return (
    <p className="mono mt-3 text-[12px] text-amber">{bits.join("   ·   ")}</p>
  );
}

function Actions({ actions }: { actions: HealthAction[] }) {
  if (actions.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {actions.map((a) => (
        <Link
          key={a.href + a.label}
          href={a.href}
          className="rounded-lg border border-brand/40 bg-brand/10 px-3 py-1.5 text-[13px] font-semibold text-brandstrong transition-colors hover:border-brand hover:bg-brand/20"
        >
          {a.label} ({a.count.toLocaleString()})
        </Link>
      ))}
    </div>
  );
}

export function StatsHealthCard({
  id,
  noun,
  total,
  hint,
  slices,
  onChart,
  actions,
  children,
}: {
  id: string;
  noun: string;
  total: number;
  hint?: string;
  slices: HealthSlice[];
  onChart?: number;
  actions: HealthAction[];
  children?: ReactNode;
}) {
  return (
    <section id={id} className="card mb-4 scroll-mt-24 p-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-bold tracking-tight">{noun}</h2>
          {hint ? (
            <p className="mt-0.5 text-[12px] text-muted2">{hint}</p>
          ) : null}
        </div>
        <p className="mono text-3xl font-extrabold tabular-nums leading-none tracking-tight">
          {total.toLocaleString()}
        </p>
      </div>
      <StackedBar slices={slices} total={total} />
      <SliceLegend slices={slices} />
      <StarLine onChart={onChart} slices={slices} />
      {children}
      <Actions actions={actions} />
    </section>
  );
}

export function StatsMeter({
  label,
  slices,
  total,
  starNote,
}: {
  label: string;
  slices: HealthSlice[] | CueMixRow[];
  total: number;
  starNote?: string;
}) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {label}
        </h3>
        <span className="mono text-[12px] text-muted2">
          {total.toLocaleString()}
        </span>
      </div>
      <StackedBar slices={slices} total={total} />
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {slices.map((s) => (
          <span key={s.key} className="flex items-baseline gap-1.5 text-[12px]">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ background: s.color }}
            />
            <span className="text-muted">{s.label}</span>
            <span className="mono text-muted2">{s.count.toLocaleString()}</span>
          </span>
        ))}
      </div>
      {starNote ? (
        <p className="mono mt-2 text-[12px] text-amber">{starNote}</p>
      ) : null}
    </div>
  );
}
