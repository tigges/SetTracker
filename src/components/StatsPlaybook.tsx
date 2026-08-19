import type { ReactNode } from "react";
import Link from "next/link";
import type { PlaybookHost, PlaybookItem, PlaybookPlace } from "@/lib/statsPlaybook";

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
    <details className="mt-2">
      <summary className="cursor-pointer text-[12px] text-muted hover:text-ink">
        {restCount} more
      </summary>
      <div className="mt-1">{children}</div>
    </details>
  );
}

export function StatsPlaybook({
  catalogNote,
  items,
}: {
  catalogNote: string;
  items: PlaybookItem[];
}) {
  return (
    <section id="playbook" className="card mb-6 scroll-mt-24 p-5">
      <div className="mb-3">
        <p className="eyebrow">Playbook</p>
        <h2 className="mt-1 text-[15px] font-bold tracking-tight">
          Grow IDs and first-party URLs
        </h2>
        <p className="mt-1 text-[12px] text-muted2">{catalogNote}</p>
        <p className="mt-1 text-[12px] text-muted2">
          Verify-then-write. Machine first, Claude last. Never invent ISRCs or
          scrape Beatport.
        </p>
      </div>
      <ol className="divide-y divide-line border-y border-line">
        {items.map((item) => (
          <li key={item.id} className="flex items-baseline justify-between gap-3 py-2">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink">
                <span className="mono mr-2 text-[11px] text-muted2">
                  {item.step}
                </span>
                {item.title}
              </p>
              <p className="mt-0.5 text-[12px] text-muted2">{item.hint}</p>
            </div>
            <Link
              href={item.href}
              className="mono shrink-0 text-[12px] font-semibold text-brand hover:underline"
            >
              {item.count.toLocaleString()}
            </Link>
          </li>
        ))}
      </ol>
    </section>
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
          className="flex items-baseline justify-between gap-2 py-1.5"
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
