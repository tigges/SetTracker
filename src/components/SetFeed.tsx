"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { GenreFilter } from "@/components/GenreFilter";
import { PopularRails } from "@/components/PopularRails";
import { SetCard } from "@/components/SetCard";
import {
  compareDeepCatalog,
  compareFeedPriority,
  dedupeNearDuplicates,
  diversifyByArtist,
  diversifyBySeries,
  isRadarCandidate,
  isThisPerformanceYear,
  pickRadarPicks,
  setPerformanceTime,
} from "@/lib/feedPriority";
import {
  collapseHostTwins,
  groupByDeepWeek,
  identifiedRatio,
} from "@/lib/feedQuality";
import { setMatchesGenreFilter } from "@/lib/genreFamilies";
import {
  festivalSeasonSets,
  MIN_RAIL_SHOW,
  newThisWeekSets,
  popularDjsThisWeek,
  popularSetsThisWeek,
  popularVenuesThisWeek,
} from "@/lib/popularity";
import type { FeedItem } from "@/lib/queries";

/** Homepage clusters — 3×3 on desktop. */
const CLUSTER = 9;
/** Deep-catalog page size after the spotlight clusters. */
const PAGE_SIZE = 18;

const PREFS_KEY = "setradar.feedPrefs";

type FeedPrefs = {
  genre: string;
};

const DEFAULT_PREFS: FeedPrefs = {
  genre: "all",
};

const prefsListeners = new Set<() => void>();

function subscribePrefs(onChange: () => void) {
  prefsListeners.add(onChange);
  return () => {
    prefsListeners.delete(onChange);
  };
}

function getPrefsRaw(): string {
  try {
    return localStorage.getItem(PREFS_KEY) ?? "";
  } catch {
    return "";
  }
}

function parsePrefs(raw: string): FeedPrefs {
  if (!raw) return DEFAULT_PREFS;
  try {
    const parsed = JSON.parse(raw) as Partial<FeedPrefs>;
    return {
      genre: typeof parsed.genre === "string" ? parsed.genre : "all",
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function writePrefs(next: FeedPrefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
  prefsListeners.forEach((l) => l());
}

function readGenreParam(): string | null {
  if (typeof window === "undefined") return null;
  const g = new URLSearchParams(window.location.search).get("g");
  return g && g.trim() ? g.trim() : null;
}

function writeGenreParam(genre: string) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!genre || genre === "all") url.searchParams.delete("g");
  else url.searchParams.set("g", genre);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

/**
 * Sets catalog feed (`/sets`):
 * New this week → Festival season → Popular sets → In-demand DJs / Top events →
 * Radar picks → Deep catalog (this year first; Show earlier years for archives).
 * Quality queues live on /stats, not as consumer filters.
 */
export function SetFeed({ feed, genres }: { feed: FeedItem[]; genres: string[] }) {
  const prefsRaw = useSyncExternalStore(
    subscribePrefs,
    getPrefsRaw,
    () => "",
  );
  const prefs = useMemo(() => parsePrefs(prefsRaw), [prefsRaw]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [showEarlier, setShowEarlier] = useState(false);

  useEffect(() => {
    const fromUrl = readGenreParam();
    if (fromUrl && fromUrl !== prefs.genre) {
      writePrefs({ ...prefs, genre: fromUrl });
    }
    // URL wins once on mount; later changes write both.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function patchPrefs(next: Partial<FeedPrefs>) {
    const merged = { ...prefs, ...next };
    writePrefs(merged);
    if (next.genre != null) writeGenreParam(next.genre);
    setVisible(PAGE_SIZE);
    setShowEarlier(false);
  }

  const filtered = useMemo(() => {
    return collapseHostTwins(
      dedupeNearDuplicates(
        feed
          .filter((s) => setMatchesGenreFilter(s, prefs.genre))
          .map((s) => ({ ...s, primaryDjSlug: s.primaryDj?.slug ?? null })),
      ),
    );
  }, [feed, prefs.genre]);

  const {
    newWeek,
    festivalSeason,
    popularWeek,
    popularDjs,
    popularVenues,
    radarPicks,
    deepShown,
    deepGroups,
    deepRemaining,
    thisYearDeepCount,
    earlierDeepCount,
  } = useMemo(() => {
    const weekAll = diversifyByArtist(
      newThisWeekSets(filtered, CLUSTER).sort(compareFeedPriority),
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
    const pool = rest.filter(isRadarCandidate).map((s) => ({
      ...s,
      primaryDjSlug: s.primaryDj?.slug ?? null,
      identifiedRatio: identifiedRatio(s.statusCounts),
    }));
    const radarPicks = pickRadarPicks(pool, CLUSTER);
    for (const s of radarPicks) used.add(s.id);

    const deepSorted = filtered
      .filter((s) => !used.has(s.id))
      .sort(compareDeepCatalog);
    const deepRanked = diversifyBySeries(diversifyByArtist(deepSorted, 1), 1);
    const thisYearDeep = deepRanked.filter((s) => isThisPerformanceYear(s));
    const earlierDeep = deepRanked.filter((s) => !isThisPerformanceYear(s));
    const deepPool = showEarlier ? [...thisYearDeep, ...earlierDeep] : thisYearDeep;
    const deepShown = deepPool.slice(0, visible);
    const deepGroups = groupByDeepWeek(
      deepShown.map((s) => ({
        ...s,
        publishedAt: new Date(setPerformanceTime(s)),
      })),
    );
    return {
      newWeek,
      festivalSeason,
      popularWeek,
      popularDjs,
      popularVenues,
      radarPicks,
      deepShown,
      deepGroups,
      deepRemaining: deepPool.length - deepShown.length,
      thisYearDeepCount: thisYearDeep.length,
      earlierDeepCount: earlierDeep.length,
    };
  }, [filtered, visible, showEarlier]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <span className="mono text-[12px] text-muted2">
          {filtered.length} sets
        </span>
        <GenreFilter
          genres={genres}
          value={prefs.genre}
          onChange={(genre) => patchPrefs({ genre })}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[14px] text-muted2">
          No sets match this genre.
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
          {(deepShown.length > 0 || earlierDeepCount > 0) && (
            <>
              {deepShown.length > 0 ? (
                <section className="mb-10">
                  <div className="mb-4 flex items-baseline gap-3">
                    <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Deep catalog
                    </h2>
                    <span className="mono text-[12px] text-muted2">
                      {deepShown.length}
                    </span>
                    <div className="h-px flex-1 bg-line" />
                  </div>
                  {deepGroups.map((g) => (
                    <div key={g.label} className="mb-8 last:mb-0">
                      <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted2">
                        {g.label}
                      </h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {g.items.map((s) => (
                          <SetCard key={s.id} set={s} />
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              ) : (
                <section className="mb-10">
                  <div className="mb-4 flex items-baseline gap-3">
                    <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Deep catalog
                    </h2>
                    <div className="h-px flex-1 bg-line" />
                  </div>
                </section>
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
              {!showEarlier && earlierDeepCount > 0 && (
                <div className="flex justify-center pb-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEarlier(true);
                      setVisible((n) =>
                        Math.max(
                          n,
                          thisYearDeepCount +
                            Math.min(PAGE_SIZE, earlierDeepCount),
                        ),
                      );
                    }}
                    className="text-[13px] text-muted underline-offset-4 transition-colors hover:text-brand hover:underline"
                  >
                    Show earlier years
                  </button>
                </div>
              )}
            </>
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
