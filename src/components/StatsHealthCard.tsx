import type { ReactNode } from "react";
import Link from "next/link";
import { slicePct, type HealthSlice } from "@/lib/statsHealth";
import type { CueMixRow, HealthAction } from "@/lib/statsHealthData";

function StackedBar({ slices, total }: { slices: HealthSlice[] | CueMixRow[]; total: number }) {
  const n = total > 0 ? total : slices.reduce((s, x) => s + x.count, 0);
  return (
    <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-linesoft">
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
    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
      {slices.map((s) => (
        <div key={s.key} className="flex items-baseline gap-1.5">
          <span
            className="mt-[3px] inline-block h-2 w-2 shrink-0 rounded-sm"
            style={{ background: s.color }}
          />
          <span className="text-[12px] text-muted">{s.label}</span>
          <span className="mono text-[12px] font-semibold tabular-nums text-ink">
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
    <p className="mono mt-1.5 text-[11px] text-amber">{bits.join("   ·   ")}</p>
  );
}

function Actions({ actions }: { actions: HealthAction[] }) {
  if (actions.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {actions.map((a) => (
        <Link
          key={a.href + a.label}
          href={a.href}
          className="rounded-md border border-brand/40 bg-brand/10 px-2 py-1 text-[12px] font-semibold text-brandstrong transition-colors hover:border-brand hover:bg-brand/20"
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
  titleExtra,
  barTotal,
  children,
}: {
  id: string;
  noun: string;
  total: number;
  hint?: string;
  slices: HealthSlice[];
  onChart?: number;
  actions: HealthAction[];
  titleExtra?: ReactNode;
  /** Denominator for the stacked bar when it is not the headline count. */
  barTotal?: number;
  children?: ReactNode;
}) {
  return (
    <section id={id} className="card mb-2.5 scroll-mt-20 p-3">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[14px] font-bold tracking-tight">{noun}</h2>
            {titleExtra}
          </div>
          {hint ? (
            <p className="mt-0.5 text-[11px] text-muted2">{hint}</p>
          ) : null}
        </div>
        <p className="mono text-2xl font-extrabold tabular-nums leading-none tracking-tight">
          {total.toLocaleString()}
        </p>
      </div>
      <StackedBar slices={slices} total={barTotal ?? total} />
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
    <div className="mt-3">
      <div className="mb-1 flex items-baseline justify-between gap-3">
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
