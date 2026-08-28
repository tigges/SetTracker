"use client";

import { SetEntryLink } from "@/components/SetEntryLink";
import { EntityThumb } from "@/components/EntityThumb";
import { setHostHeadline } from "@/lib/brandHosts";
import { resolvePlaybackTarget } from "@/lib/playback";
import { setDisplayThumb } from "@/lib/setBrowse";
import { setPerformanceYearLabel } from "@/lib/feedPriority";
import { setgraphTicks } from "@/lib/homeLanding";
import type { FeedItem } from "@/lib/queries";
import { STATUS_META, type IdStatus } from "@/lib/status";

function initials(label: string): string {
  return label.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase();
}

function SetgraphStrip({
  counts,
  maxTicks = 40,
  height = 10,
}: {
  counts: Partial<Record<IdStatus, number>>;
  maxTicks?: number;
  height?: number;
}) {
  const ticks = setgraphTicks(counts, maxTicks);
  if (ticks.length === 0) return null;
  return (
    <div
      className="flex w-full overflow-hidden rounded-full bg-linesoft"
      style={{ height }}
      aria-hidden
    >
      {ticks.map((s, i) => (
        <span
          key={`${s}-${i}`}
          className="min-w-px flex-1"
          style={{ background: STATUS_META[s].color }}
          title={STATUS_META[s].label}
        />
      ))}
    </div>
  );
}

export function LandingSetPoster({
  set,
  tone = "poster",
}: {
  set: FeedItem;
  tone?: "feature" | "compact" | "poster";
}) {
  const accent = set.primaryDj?.accent ?? "var(--brand)";
  const headline = setHostHeadline({
    title: set.title,
    primaryDj: set.primaryDj,
    collaborators: set.collaborators,
    seriesName: set.seriesName,
    eventName: set.eventName,
  });
  const place = set.eventName ?? set.seriesName ?? "Set";
  const year = setPerformanceYearLabel(set);
  const thumb = setDisplayThumb({
    imageUrl: set.imageUrl,
    primaryDjImageUrl: set.primaryDj?.imageUrl,
    eventImageUrl: set.eventImageUrl,
    primaryDjSlug: set.primaryDj?.slug,
  });
  const feature = tone === "feature";
  const compact = tone === "compact";
  const target = resolvePlaybackTarget(set.playbackUrl, {
    sourceUrl: set.sourceUrl,
  });

  return (
    <article
      className={`card group relative overflow-hidden ${
        feature ? "col-span-2 sm:col-span-1" : ""
      }`}
    >
      <SetEntryLink
        href={`/sets/${set.slug}`}
        label="Home"
        className="block"
      >
        <div
          className={`relative bg-panel2 ${
            feature
              ? "aspect-[4/3] sm:aspect-[4/5]"
              : compact
                ? "aspect-square sm:aspect-[4/5]"
                : "aspect-[4/5]"
          }`}
        >
          <EntityThumb
            fill
            src={thumb}
            label={headline}
            accent={accent}
            radius={0}
            monogram={initials(headline)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/25 to-transparent" />
          <div
            className={`absolute inset-x-0 bottom-0 ${
              compact ? "space-y-1.5 p-3 sm:space-y-2 sm:p-4" : "space-y-2 p-4"
            }`}
          >
            <p className="eyebrow text-muted2">
              {place} · {year}
            </p>
            <h3
              className={`font-bold leading-tight text-ink ${
                compact ? "text-[15px] sm:text-[18px]" : "text-[18px]"
              }`}
            >
              {headline}
            </h3>
            <SetgraphStrip counts={set.statusCounts} maxTicks={28} height={8} />
          </div>
        </div>
      </SetEntryLink>
      {target ? (
        <div className="absolute right-3 top-3 z-10">
          <SetEntryLink
            href={`/sets/${set.slug}?t=0`}
            label="Home"
            className="rounded-full border border-line bg-bg/80 px-2.5 py-1 text-[11px] font-semibold text-ink backdrop-blur-sm hover:border-brand hover:text-brand"
          >
            Play
          </SetEntryLink>
        </div>
      ) : null}
    </article>
  );
}
