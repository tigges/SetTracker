"use client";

import { SetEntryLink } from "@/components/SetEntryLink";
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
import {
  FEED_SPOTLIGHT_META,
  setPerformanceTime,
  setPerformanceYearLabel,
} from "@/lib/feedPriority";
import { isListPendingOfficialSet, setDisplayThumb } from "@/lib/setBrowse";
import type { FeedItem } from "@/lib/queries";
import { setCardStatusHint } from "@/lib/setCardStatusHint";

export function SetCard({
  set,
  browseLabel,
}: {
  set: FeedItem;
  browseLabel?: string;
}) {
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
  const when = new Date(setPerformanceTime(set));
  const year = setPerformanceYearLabel(set);
  const thumb = setDisplayThumb({
    imageUrl: set.imageUrl,
    primaryDjImageUrl: set.primaryDj?.imageUrl,
    eventImageUrl: set.eventImageUrl,
    primaryDjSlug: set.primaryDj?.slug,
  });
  const statusHint = setCardStatusHint(set.statusCounts);
  const target = resolvePlaybackTarget(set.playbackUrl, {
    sourceUrl: set.sourceUrl,
  });

  return (
    <article className="card group relative flex flex-col gap-4 p-4 transition-colors hover:border-[color:var(--muted2)]">
      <SetEntryLink
        href={`/sets/${set.slug}`}
        label={browseLabel}
        className="flex items-start gap-3"
      >
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
              · {year} ·{" "}
              <time title={fmtDate(when)}>
                {fmtRelative(when)}
              </time>
            </span>
          </p>
          {set.title !== headline ? (
            <p className="mt-0.5 truncate text-[12px] text-muted2">{set.title}</p>
          ) : null}
          {set.spotlight ? (
            <p className="mt-1 flex flex-wrap gap-1">
              <span
                className="inline-block rounded-full border border-line px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted"
                title={FEED_SPOTLIGHT_META[set.spotlight].title}
              >
                {FEED_SPOTLIGHT_META[set.spotlight].short}
              </span>
            </p>
          ) : null}
        </div>
      </SetEntryLink>

      <div className="mt-auto space-y-2">
        <StatusBar counts={set.statusCounts} />
        {statusHint ? <p className="sr-only">{statusHint}</p> : null}
        <div className="flex items-center justify-between gap-2 text-[12px] text-muted2">
          <span className="mono" title={statusHint || undefined}>
            {set.trackCount > 0
              ? `${set.trackCount} tracks`
              : isListPendingOfficialSet(set)
                ? "List pending"
                : "0 tracks"}
          </span>
          <span className="mono">{fmtDuration(set.durationSec)}</span>
          <SetEntryLink
            href={target ? `/sets/${set.slug}?t=0` : `/sets/${set.slug}`}
            label={browseLabel}
            className="rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-ink hover:border-[color:var(--muted2)]"
          >
            {target ? "Play" : "Open"}
          </SetEntryLink>
        </div>
      </div>
    </article>
  );
}
