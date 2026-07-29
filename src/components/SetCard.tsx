"use client";

import { useState } from "react";
import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import { StatusBar } from "@/components/StatusBits";
import { setHostHeadline } from "@/lib/brandHosts";
import {
  SET_TYPE_META,
  fmtDate,
  fmtDuration,
  fmtRelative,
} from "@/lib/status";
import { FEED_SPOTLIGHT_META } from "@/lib/feedPriority";
import { setDisplayThumb } from "@/lib/setBrowse";
import type { FeedItem } from "@/lib/queries";

export function SetCard({ set }: { set: FeedItem }) {
  const type = SET_TYPE_META[set.type] ?? { label: set.type, glyph: "•" };
  const accent = set.primaryDj?.accent ?? "var(--brand)";
  const headline = setHostHeadline({
    title: set.title,
    primaryDj: set.primaryDj,
    collaborators: set.collaborators,
    seriesName: set.seriesName,
    eventName: set.eventName,
  });
  const thumb = setDisplayThumb({
    imageUrl: set.imageUrl,
    primaryDjImageUrl: set.primaryDj?.imageUrl,
    eventImageUrl: set.eventImageUrl,
    primaryDjSlug: set.primaryDj?.slug,
  });
  const [thumbFailed, setThumbFailed] = useState(false);

  // No monogram tiles in the feed — hide until artwork resolves / loads.
  if (!thumb || thumbFailed) return null;

  return (
    <Link
      href={`/sets/${set.slug}`}
      className="card group relative flex flex-col gap-4 p-4 transition-colors hover:border-[color:var(--muted2)]"
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-none">
          <EntityThumb
            src={thumb}
            label={headline}
            accent={accent}
            size={48}
            radius={12}
            onImageError={() => setThumbFailed(true)}
          />
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
            {set.genre && <span className="eyebrow truncate">· {set.genre}</span>}
            {set.top100Rank != null && (
              <span
                className="eyebrow truncate text-muted2"
                title={FEED_SPOTLIGHT_META.top100.title}
              >
                · Top 100 #{set.top100Rank}
              </span>
            )}
            {set.festivalRank != null && (
              <span
                className="eyebrow truncate text-muted2"
                title={FEED_SPOTLIGHT_META["top-festival"].title}
              >
                · Festival #{set.festivalRank}
              </span>
            )}
          </div>
          <h3 className="mt-1 truncate text-[15px] font-semibold leading-tight text-ink">
            {headline}
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
