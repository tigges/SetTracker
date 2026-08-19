import type { ReactNode } from "react";
import Link from "next/link";
import type { PlaybookHost, PlaybookPlace } from "@/lib/statsPlaybook";

const PREVIEW = 8;

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

export function LeftoverHostQueue({ rows }: { rows: PlaybookHost[] }) {
  if (rows.length === 0) {
    return <p className="text-[13px] text-muted2">None on the catalog.</p>;
  }
  const head = rows.slice(0, PREVIEW);
  const rest = rows.slice(PREVIEW);
  const list = (items: PlaybookHost[]) => (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((row) => (
        <li
          key={row.slug}
          className="flex items-baseline justify-between gap-2 py-1"
        >
          <Link
            href={`/djs/${row.slug}`}
            className="truncate text-[13px] font-semibold text-ink hover:underline"
          >
            {row.name}
          </Link>
          <span className="mono shrink-0 text-[11px] text-muted2">
            {row.setCount}s · {row.playCount}p
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <>
      {list(head)}
      <MoreFold restCount={rest.length}>{list(rest)}</MoreFold>
    </>
  );
}

export function WeakSiteQueue({ rows }: { rows: PlaybookPlace[] }) {
  if (rows.length === 0) {
    return <p className="text-[13px] text-muted2">None in this queue.</p>;
  }
  const head = rows.slice(0, PREVIEW);
  const rest = rows.slice(PREVIEW);
  const list = (items: PlaybookPlace[]) => (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((row) => (
        <li
          key={`${row.kind}-${row.slug}`}
          className="flex items-baseline justify-between gap-2 py-1"
        >
          <Link
            href={`/events/${row.slug}`}
            className="truncate text-[13px] font-semibold text-ink hover:underline"
          >
            {row.onChart ? "★ " : ""}
            {row.name}
          </Link>
          <span className="mono shrink-0 text-[11px] text-muted2">
            {row.kind}
            {row.website ? " · weak" : " · empty"}
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <>
      {list(head)}
      <MoreFold restCount={rest.length}>{list(rest)}</MoreFold>
    </>
  );
}
