import Link from "next/link";
import type { ReactNode } from "react";
import { SET_TYPE_META } from "@/lib/status";
import {
  formatCatalogDay,
  NEW_SETS_LIST_PREVIEW,
  NEW_SETS_SUMMARY_DAYS,
  newSetsHeadline,
  type NewSetDay,
} from "@/lib/statsNewSets";

function MoreFold({
  restCount,
  children,
}: {
  restCount: number;
  children: ReactNode;
}) {
  if (restCount <= 0) return null;
  return (
    <details className="mt-1">
      <summary className="cursor-pointer text-[12px] text-muted hover:text-ink">
        {restCount} more
      </summary>
      <div className="mt-0.5">{children}</div>
    </details>
  );
}

function SetList({ day }: { day: NewSetDay }) {
  const head = day.sets.slice(0, NEW_SETS_LIST_PREVIEW);
  const rest = day.sets.slice(NEW_SETS_LIST_PREVIEW);
  const list = (items: typeof day.sets) => (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((s) => {
        const type = SET_TYPE_META[s.type] ?? { label: s.type, glyph: "•" };
        return (
          <li key={s.slug} className="flex items-baseline justify-between gap-2 py-1">
            <Link
              href={`/sets/${s.slug}`}
              className="min-w-0 truncate text-[13px] font-semibold text-ink hover:underline"
            >
              {s.title}
            </Link>
            <span className="mono shrink-0 text-[11px] text-muted2">
              {s.primaryDj ?? type.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
  return (
    <>
      {list(head)}
      <MoreFold restCount={rest.length}>{list(rest)}</MoreFold>
    </>
  );
}

function DayRow({ day }: { day: NewSetDay }) {
  const extra = day.count - day.names.length;
  return (
    <details className="border-b border-line last:border-b-0">
      <summary className="flex cursor-pointer list-none items-baseline justify-between gap-2 py-1.5 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <span className="mono text-[12px] text-muted2">
            {formatCatalogDay(day.iso)}
          </span>
          <span className="ml-2 truncate text-[13px] text-ink">
            {day.names.join(", ")}
            {extra > 0 ? ` +${extra}` : ""}
          </span>
        </div>
        <span className="mono shrink-0 text-[11px] text-muted2">
          {day.count.toLocaleString()}
        </span>
      </summary>
      <div className="pb-2">
        <SetList day={day} />
      </div>
    </details>
  );
}

export function StatsNewSetsCard({ days }: { days: NewSetDay[] }) {
  if (days.length === 0) return null;
  const head = days.slice(0, NEW_SETS_SUMMARY_DAYS);
  const rest = days.slice(NEW_SETS_SUMMARY_DAYS);
  return (
    <div
      id="new-sets"
      className="mb-3 scroll-mt-20 rounded-lg border border-line bg-panel px-2.5 py-2"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[12px] font-semibold text-ink">New sets</p>
        <span className="mono text-[11px] text-muted2">
          {days.reduce((n, d) => n + d.count, 0).toLocaleString()}
        </span>
      </div>
      <p className="mono mt-0.5 text-[11px] text-muted2">
        {newSetsHeadline(days)}
      </p>
      <p className="mt-0.5 text-[11px] text-muted2">
        Catalog row created — not the night they played.
      </p>
      <div className="mt-1.5">{head.map((day) => <DayRow key={day.iso} day={day} />)}</div>
      {rest.length > 0 ? (
        <details className="mt-1">
          <summary className="cursor-pointer text-[12px] text-muted hover:text-ink">
            {rest.length} earlier {rest.length === 1 ? "day" : "days"}
          </summary>
          <div className="mt-0.5">
            {rest.map((day) => (
              <DayRow key={day.iso} day={day} />
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
