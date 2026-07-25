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

  return (
    <Link
      href={`/sets/${set.slug}`}
      className="card group relative flex flex-col gap-4 p-4 transition-colors hover:border-[color:var(--muted2)]"
    >
      <div className="flex items-start gap-3">
        <div
          className="grid h-12 w-12 flex-none place-items-center rounded-lg text-lg"
          style={{
            background: `linear-gradient(140deg, ${accent}2b, ${set.cover}18)`,
            border: `1px solid ${accent}40`,
            color: accent,
          }}
        >
          {type.glyph}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="eyebrow" style={{ color: accent }}>
              {type.label}
            </span>
            {set.seriesName && (
              <span className="eyebrow truncate">· {set.seriesName}</span>
            )}
            {set.eventName && (
              <span className="eyebrow truncate">· {set.eventName}</span>
            )}
          </div>
          <h3 className="mt-1 truncate text-[15px] font-semibold leading-tight text-ink">
            {set.title}
          </h3>
          <p className="mt-0.5 truncate text-[13px] text-muted">
            {set.primaryDj?.name}
            {set.collaborators.length > 0 && (
              <span className="text-muted2">
                {" "}
                b2b {set.collaborators.map((c) => c.name).join(", ")}
              </span>
            )}
          </p>
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
