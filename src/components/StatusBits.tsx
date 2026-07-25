import {
  STATUS_META,
  STATUS_ORDER,
  statusColor,
  type IdStatus,
} from "@/lib/status";
import type { StatusCounts } from "@/lib/queries";

export function StatusDot({
  status,
  size = 8,
}: {
  status: string;
  size?: number;
}) {
  return (
    <span
      className="dot"
      style={{ background: statusColor(status), width: size, height: size }}
    />
  );
}

// Thin proportional distribution bar.
export function StatusBar({
  counts,
  height = 6,
}: {
  counts: StatusCounts;
  height?: number;
}) {
  const total =
    STATUS_ORDER.reduce((sum, s) => sum + (counts[s] ?? 0), 0) || 1;
  return (
    <div
      className="flex w-full overflow-hidden rounded-full bg-linesoft"
      style={{ height }}
    >
      {STATUS_ORDER.map((s) => {
        const v = counts[s] ?? 0;
        if (!v) return null;
        return (
          <div
            key={s}
            title={`${STATUS_META[s].label}: ${v}`}
            style={{
              width: `${(v / total) * 100}%`,
              background: STATUS_META[s].color,
            }}
          />
        );
      })}
    </div>
  );
}

export function StatusLegend({
  counts,
  only,
}: {
  counts?: StatusCounts;
  only?: IdStatus[];
}) {
  const list = only ?? STATUS_ORDER;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {list.map((s) => (
        <div key={s} className="flex items-center gap-1.5">
          <StatusDot status={s} />
          <span className="text-[12px] text-muted">{STATUS_META[s].label}</span>
          {counts && (
            <span className="mono text-[12px] text-muted2">{counts[s] ?? 0}</span>
          )}
        </div>
      ))}
    </div>
  );
}
