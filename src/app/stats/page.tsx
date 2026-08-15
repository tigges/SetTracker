import type { Metadata } from "next";
import { getCatalogStats } from "@/lib/catalogStats";
import { pageMeta } from "@/lib/site";
import { STATUS_META, type IdStatus } from "@/lib/status";

export const metadata: Metadata = pageMeta({
  title: "Stats",
  description: "Catalog size and identification coverage on setradar.ai.",
  path: "/stats",
});

function pct(part: number, whole: number): string {
  if (whole <= 0) return "—";
  return `${Math.round((part / whole) * 100)}%`;
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="border-b border-line py-3 pr-4">
      <div className="mono text-[11px] uppercase tracking-[0.12em] text-muted2">
        {label}
      </div>
      <div className="mt-1 text-2xl font-extrabold tracking-tight tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {hint ? (
        <div className="mt-0.5 mono text-[11px] text-muted2">{hint}</div>
      ) : null}
    </div>
  );
}

function BarRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color?: string;
}) {
  const width = total > 0 ? Math.max(2, Math.round((count / total) * 100)) : 0;
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between gap-2 text-[13px]">
        <span className="truncate text-ink">{label}</span>
        <span className="mono shrink-0 text-[12px] text-muted2">
          {count.toLocaleString()} · {pct(count, total)}
        </span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-sm bg-line">
        <div
          className="h-full rounded-sm"
          style={{
            width: `${width}%`,
            background: color ?? "var(--brand)",
          }}
        />
      </div>
    </div>
  );
}

export default async function StatsPage() {
  const s = await getCatalogStats();
  const playTotal = s.totals.plays;
  const identified =
    s.plays.byStatus.find((row) => row.key === "identified")?.count ?? 0;

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Catalog</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Stats</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          How large the catalog is, and how much of each set is identified.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold tracking-tight">Totals</h2>
        <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-5">
          <Stat label="Sets" value={s.totals.sets} />
          <Stat
            label="DJs"
            value={s.djs.browseReady}
            hint={`${s.totals.djs.toLocaleString()} stored`}
          />
          <Stat label="Tracks" value={s.totals.tracks} />
          <Stat label="Plays" value={s.totals.plays} />
          <Stat label="Events" value={s.totals.venues} />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold tracking-tight">Coverage</h2>
        <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-4">
          <Stat
            label="Identified plays"
            value={pct(identified, playTotal)}
            hint={`${identified.toLocaleString()} of ${playTotal.toLocaleString()}`}
          />
          <Stat
            label="Sets with plays"
            value={s.sets.withPlays}
            hint={`${s.sets.empty} empty`}
          />
          <Stat
            label="Playback"
            value={s.sets.withPlayback}
            hint={pct(s.sets.withPlayback, s.totals.sets)}
          />
          <Stat
            label="Fingerprint IDs"
            value={s.fingerprint.identified}
            hint={`${s.fingerprint.uniqueTracks} tracks`}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-bold tracking-tight">Play status</h2>
        <p className="mb-3 text-[13px] text-muted2">
          Identification health across all timeline rows.
        </p>
        <div className="max-w-xl">
          {s.plays.byStatus.map((row) => (
            <BarRow
              key={row.key}
              label={row.label}
              count={row.count}
              total={playTotal}
              color={STATUS_META[row.key as IdStatus]?.color}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
