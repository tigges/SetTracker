"use client";

import { useMemo, useState } from "react";
import { GenreFilter } from "@/components/GenreFilter";
import { PopularRails } from "@/components/PopularRails";
import { SetCard } from "@/components/SetCard";
import {
  compareFeedPriority,
  dedupeNearDuplicates,
  diversifyByArtist,
  diversifyBySeries,
  pickRadarPicks,
} from "@/lib/feedPriority";
import { setMatchesGenreFilter } from "@/lib/genreFamilies";
import {
  festivalSeasonSets,
  isCompleteTracklist,
  isFestivalStorySet,
  MIN_RAIL_SHOW,
  popularDjsThisWeek,
  popularSetsThisWeek,
  popularVenuesThisWeek,
} from "@/lib/popularity";
import type { FeedItem } from "@/lib/queries";

/** Homepage clusters — 3×3 on desktop. */
const CLUSTER = 9;
/** Deep-catalog page size after the spotlight clusters. */
const PAGE_SIZE = 18;

function within7Days(d: Date | string): boolean {
  return Date.now() - new Date(d).getTime() < 7 * 24 * 60 * 60 * 1000;
}

/** Chart / complete / festival-linked sets for the Radar pool. */
function isRadarCandidate(s: FeedItem): boolean {
  if (!isCompleteTracklist(s)) return false;
  return (
    s.top100Rank != null ||
    s.festivalRank != null ||
    s.clubRank != null ||
    s.densitySeverity === "ok"
  );
}

function identifiedRatio(s: FeedItem): number {
  const c = s.statusCounts;
  const total =
    (c.identified ?? 0) +
    (c.unresolved_id ?? 0) +
    (c.community_resolved ?? 0) +
    (c.unparsed ?? 0);
  if (total === 0) return 0;
  return (c.identified ?? 0) / total;
}

/**
 * Homepage feed:
 * New this week → Popular sets → In-demand DJs (Top 100) / Top events →
 * Radar picks → Deep catalog.
 */
export function SetFeed({ feed, genres }: { feed: FeedItem[]; genres: string[] }) {
  const [genre, setGenre] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  function selectGenre(next: string) {
    setGenre(next);
    setVisible(PAGE_SIZE);
  }

  const filtered = useMemo(() => {
    return dedupeNearDuplicates(
      feed
        .filter((s) => setMatchesGenreFilter(s, genre))
        .map((s) => ({ ...s, primaryDjSlug: s.primaryDj?.slug ?? null })),
    );
  }, [feed, genre]);

  const {
    newWeek,
    festivalSeason,
    popularWeek,
    popularDjs,
    popularVenues,
    radarPicks,
    deepShown,
    deepRemaining,
  } = useMemo(() => {
    const weekAll = diversifyByArtist(
      filtered
        .filter(
          (s) =>
            isCompleteTracklist(s) &&
            within7Days(s.publishedAt) &&
            !isFestivalStorySet(s),
        )
        .sort(compareFeedPriority),
      2,
    );
    const newWeek = weekAll.slice(0, CLUSTER);
    const used = new Set(newWeek.map((s) => s.id));

    let festivalSeason = festivalSeasonSets(filtered, CLUSTER).filter(
      (s) => !used.has(s.id),
    );
    if (festivalSeason.length < MIN_RAIL_SHOW) festivalSeason = [];
    for (const s of festivalSeason) used.add(s.id);

    let popularWeek = popularSetsThisWeek(filtered, CLUSTER).filter(
      (s) => !used.has(s.id),
    );
    if (popularWeek.length < MIN_RAIL_SHOW) popularWeek = [];
    for (const s of popularWeek) used.add(s.id);

    const popularDjs = popularDjsThisWeek(filtered, CLUSTER);
    const popularVenues = popularVenuesThisWeek(filtered, CLUSTER);

    const rest = filtered.filter((s) => !used.has(s.id));
    const preferred = rest.filter(isRadarCandidate);
    const filler = rest.filter((s) => !isRadarCandidate(s));
    const pool = [...preferred, ...filler].map((s) => ({
      ...s,
      primaryDjSlug: s.primaryDj?.slug ?? null,
      identifiedRatio: identifiedRatio(s),
    }));
    const radarPicks = pickRadarPicks(pool, CLUSTER);
    for (const s of radarPicks) used.add(s.id);

    const deepAll = diversifyBySeries(
      diversifyByArtist(
        filtered.filter((s) => !used.has(s.id)).sort(compareFeedPriority),
        1,
      ),
      1,
    );
    const deepShown = deepAll.slice(0, visible);
    return {
      newWeek,
      festivalSeason,
      popularWeek,
      popularDjs,
      popularVenues,
      radarPicks,
      deepShown,
      deepRemaining: deepAll.length - deepShown.length,
    };
  }, [filtered, visible]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <span className="mono text-[12px] text-muted2">
          {filtered.length} sets
        </span>
        <GenreFilter genres={genres} value={genre} onChange={selectGenre} />
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[14px] text-muted2">
          No sets match this filter.
        </p>
      ) : (
        <>
          {newWeek.length > 0 && (
            <Section title="New this week" sets={newWeek} />
          )}
          {festivalSeason.length > 0 && (
            <Section title="Festival season" sets={festivalSeason} />
          )}
          {popularWeek.length > 0 && (
            <Section title="Popular sets" sets={popularWeek} />
          )}
          <PopularRails
            djs={popularDjs.length >= MIN_RAIL_SHOW ? popularDjs : []}
            venues={
              popularVenues.length >= MIN_RAIL_SHOW ? popularVenues : []
            }
          />
          {radarPicks.length > 0 && (
            <Section title="Radar picks" sets={radarPicks} />
          )}
          {deepShown.length > 0 && (
            <Section title="Deep catalog" sets={deepShown} />
          )}
          {deepRemaining > 0 && (
            <div className="flex justify-center pb-4">
              <button
                type="button"
                onClick={() => setVisible((n) => n + PAGE_SIZE)}
                className="rounded-full border border-line px-5 py-2 text-[13px] text-muted transition-colors hover:border-brand hover:text-brand"
              >
                Load more · {Math.min(PAGE_SIZE, deepRemaining)} of{" "}
                {deepRemaining} left
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, sets }: { title: string; sets: FeedItem[] }) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
          {title}
        </h2>
        <span className="mono text-[12px] text-muted2">{sets.length}</span>
        <div className="h-px flex-1 bg-line" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sets.map((s) => (
          <SetCard key={s.id} set={s} />
        ))}
      </div>
    </section>
  );
}
