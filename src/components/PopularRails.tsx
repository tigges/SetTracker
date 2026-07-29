"use client";

import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import type { PopularDjRail, PopularVenueRail } from "@/lib/popularity";

export function PopularRails({
  djs,
  venues,
}: {
  djs: PopularDjRail[];
  venues: PopularVenueRail[];
}) {
  if (djs.length === 0 && venues.length === 0) return null;

  return (
    <div className="mb-10 space-y-8">
      {djs.length > 0 && (
        <EntityRail
          title="In-demand DJs"
          count={djs.length}
          href="/djs"
          items={djs.map((d) => ({
            key: d.slug,
            href: `/djs/${d.slug}`,
            label: d.name,
            meta: `${d.setCount} set${d.setCount === 1 ? "" : "s"} this week`,
            imageUrl: d.imageUrl,
            accent: d.accent,
          }))}
        />
      )}
      {venues.length > 0 && (
        <EntityRail
          title="Top venues"
          count={venues.length}
          href="/venues"
          items={venues.map((v) => ({
            key: v.slug,
            href: `/venues/${v.slug}`,
            label: v.name,
            meta: `${v.setCount} set${v.setCount === 1 ? "" : "s"} this week`,
            imageUrl: v.imageUrl,
            accent: v.accent,
          }))}
        />
      )}
    </div>
  );
}

function EntityRail({
  title,
  count,
  href,
  items,
}: {
  title: string;
  count: number;
  href: string;
  items: Array<{
    key: string;
    href: string;
    label: string;
    meta: string;
    imageUrl: string | null;
    accent: string;
  }>;
}) {
  return (
    <section>
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
          {title}
        </h2>
        <span className="mono text-[12px] text-muted2">{count}</span>
        <div className="h-px flex-1 bg-line" />
        <Link
          href={href}
          className="mono text-[11px] text-muted2 transition-colors hover:text-brand"
        >
          All →
        </Link>
      </div>
      <div className="scroll-thin flex gap-3 overflow-x-auto pb-1">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="flex w-[148px] shrink-0 flex-col gap-2 transition-opacity hover:opacity-90"
          >
            <EntityThumb
              src={item.imageUrl}
              label={item.label}
              accent={item.accent}
              size={148}
              radius={14}
              monogram={item.label.slice(0, 2).toUpperCase()}
            />
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-ink">
                {item.label}
              </div>
              <div className="mono truncate text-[11px] text-muted2">
                {item.meta}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
