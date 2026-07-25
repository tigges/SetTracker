import Link from "next/link";
import { StatusBar } from "@/components/StatusBits";
import {
  SET_TYPE_META,
  fmtDate,
  fmtDuration,
  fmtRelative,
} from "@/lib/status";
import type { FeedItem } from "@/lib/queries";

export function SetCard({ set }: { set: FeedItem }) {
  const type = SET_TYPE_META[set.type] ?? { label: set.type, glyph: "•" };
  const accent = set.primaryDj?.accent ?? "var(--brand)";
  const djLine =
    (set.primaryDj?.name ?? "Unknown") +
    (set.collaborators.length > 0
      ? ` b2b ${set.collaborators.map((c) => c.name).join(", ")}`
      : "");
  const context = set.seriesName ?? set.eventName ?? null;

  return (
    <Link
      href={`/sets/${set.slug}`}
      className="card group relative flex flex-col gap-4 p-4 transition-colors hover:border-[color:var(--muted2)]"
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-none">
          <div
            className="grid h-12 w-12 place-items-center rounded-xl text-lg font-black"
            style={{
              background: `${accent}22`,
              color: accent,
              border: `1px solid ${accent}44`,
            }}
          >
            {(set.primaryDj?.name ?? "?").slice(0, 1)}
          </div>
          <span
            className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-md border border-line bg-bg text-[10px] text-muted"
            title={type.label}
          >
            {type.glyph}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="eyebrow" style={{ color: accent }}>
              {type.label}
            </span>
            {context && <span className="eyebrow truncate">· {context}</span>}
          </div>
          <h3 className="mt-1 truncate text-[15px] font-semibold leading-tight text-ink">
            {djLine}
          </h3>
          <p className="mt-0.5 truncate text-[13px] text-muted">{set.title}</p>
        </div>
      </div>

      <div className="mt-auto space-y-2">
        <StatusBar counts={set.statusCounts} />
        <div className="flex items-center justify-between text-[12px] text-muted2">
          <span className="mono">{set.trackCount} tracks</span>
          <span className="mono">{fmtDuration(set.durationSec)}</span>
          <span className="mono" title={fmtDate(set.publishedAt)}>
            {fmtRelative(set.publishedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
