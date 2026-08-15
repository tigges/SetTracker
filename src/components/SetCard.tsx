"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { EntityThumb } from "@/components/EntityThumb";
import { StatusBar } from "@/components/StatusBits";
import { setHostHeadline } from "@/lib/brandHosts";
import { resolvePlaybackTarget } from "@/lib/playback";
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
  const [playing, setPlaying] = useState(false);
  const type = SET_TYPE_META[set.type] ?? { label: set.type, glyph: "•" };
  const accent = set.primaryDj?.accent ?? "var(--brand)";
  const headline = setHostHeadline({
    title: set.title,
    primaryDj: set.primaryDj,
    collaborators: set.collaborators,
    seriesName: set.seriesName,
    eventName: set.eventName,
  });
  const place = set.eventName ?? set.seriesName ?? type.label;
  const thumb = setDisplayThumb({
    imageUrl: set.imageUrl,
    primaryDjImageUrl: set.primaryDj?.imageUrl,
    eventImageUrl: set.eventImageUrl,
    primaryDjSlug: set.primaryDj?.slug,
  });
  const identified = set.statusCounts.identified ?? 0;
  const unresolved = set.statusCounts.unresolved_id ?? 0;
  const community = set.statusCounts.community_resolved ?? 0;
  const statusHint = [
    identified ? `${identified} ID` : null,
    unresolved ? `${unresolved} ?` : null,
    community ? `${community} ✓` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const target = resolvePlaybackTarget(set.playbackUrl, {
    sourceUrl: set.sourceUrl,
    autoplay: true,
  });

  function togglePlay(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setPlaying((v) => !v);
  }

  return (
    <article className="card group relative flex flex-col gap-4 p-4 transition-colors hover:border-[color:var(--muted2)]">
      <Link href={`/sets/${set.slug}`} className="flex items-start gap-3">
        <div className="relative flex-none">
          <EntityThumb
            src={thumb}
            label={headline}
            accent={accent}
            size={48}
            radius={12}
          />
          <span
            className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-md border border-line bg-bg text-[10px] text-muted"
            title={type.label}
          >
            {type.glyph}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold leading-tight text-ink">
            {headline}
          </h3>
          <p className="mt-0.5 truncate text-[13px] text-muted">
            {place}
            <span className="text-muted2">
              {" "}
              ·{" "}
              <time title={fmtDate(set.publishedAt)}>
                {fmtRelative(set.publishedAt)}
              </time>
            </span>
          </p>
          {set.title !== headline ? (
            <p className="mt-0.5 truncate text-[12px] text-muted2">{set.title}</p>
          ) : null}
          {set.spotlight ? (
            <p
              className="mt-1 inline-block rounded-full border border-line px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted"
              title={FEED_SPOTLIGHT_META[set.spotlight].title}
            >
              {FEED_SPOTLIGHT_META[set.spotlight].short}
            </p>
          ) : null}
        </div>
      </Link>

      <div className="mt-auto space-y-2">
        <StatusBar counts={set.statusCounts} />
        {statusHint ? <p className="sr-only">{statusHint}</p> : null}
        <div className="flex items-center justify-between gap-2 text-[12px] text-muted2">
          <span className="mono" title={statusHint || undefined}>
            {set.trackCount} tracks
            {unresolved ? ` · ${unresolved}?` : ""}
          </span>
          <span className="mono">{fmtDuration(set.durationSec)}</span>
          {target ? (
            <button
              type="button"
              onClick={togglePlay}
              className="rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-ink hover:border-[color:var(--muted2)]"
            >
              {playing ? "Hide" : "Play"}
            </button>
          ) : (
            <Link
              href={`/sets/${set.slug}`}
              className="text-[11px] text-muted hover:text-ink"
            >
              Open
            </Link>
          )}
        </div>
        {playing && target ? (
          <iframe
            title={`${target.label} player`}
            src={target.embedSrc}
            width="100%"
            height={Math.min(target.embedHeight, 166)}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full rounded-lg border-0"
          />
        ) : null}
      </div>
    </article>
  );
}
