"use client";

import { useMemo, useState } from "react";
import { PopularRails } from "@/components/PopularRails";
import { SetCard } from "@/components/SetCard";
import {
  compareFeedPriority,
  pickRadarPicks,
} from "@/lib/feedPriority";
import {
  popularDjsThisWeek,
  popularSetsThisWeek,
  popularVenuesThisWeek,
} from "@/lib/popularity";
import type { FeedItem } from "@/lib/queries";

const TYPES = [
  { id: "all", label: "All" },
  { id: "radio", label: "Radio" },
  { id: "festival", label: "Festival" },
  { id: "soundcloud", label: "SoundCloud" },
  { id: "mix", label: "Mix" },
] as const;

/** Homepage clusters — 3×3 on desktop. */
const CLUSTER = 9;
/** Deep-catalog page size after the spotlight clusters. */
const PAGE_SIZE = 18;

function within7Days(d: Date | string): boolean {
  return Date.now() - new Date(d).getTime() < 7 * 24 * 60 * 60 * 1000;
}

/** Chart / complete / festival-linked sets for the Radar pool. */
function isRadarCandidate(s: FeedItem): boolean {
  return (
    s.densitySeverity === "ok" ||
    s.top100Rank != null ||
    s.festivalRank != null
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

const chip = (active: boolean) =>
  `rounded-full border px-3 py-1 text-[12px] transition-colors ${
    active
      ? "border-brand bg-[color:var(--brand)]/10 text-brand"
      : "border-line text-muted hover:border-muted2 hover:text-ink"
  }`;

function matchesGenre(s: FeedItem, genre: string): boolean {
  if (genre === "all") return true;
  if (s.genres?.some((g) => g === genre)) return true;
  return s.genre === genre;
}

/**
 * Homepage feed:
 * New this week → Popular this week → In-demand DJs / Top venues →
 * Radar picks → Deep catalog.
 */
export function SetFeed({ feed, genres }: { feed: FeedItem[]; genres: string[] }) {
  const [type, setType] = useState("all");
  const [genre, setGenre] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  function selectType(next: string) {
    setType(next);
    setVisible(PAGE_SIZE);
  }

  function selectGenre(next: string) {
    setGenre(next);
    setVisible(PAGE_SIZE);
  }

  const filtered = useMemo(() => {
    return feed.filter(
      (s) => (type === "all" || s.type === type) && matchesGenre(s, genre),
    );
  }, [feed, type, genre]);

  const {
    newWeek,
    popularWeek,
    popularDjs,
    popularVenues,
    radarPicks,
    deepShown,
    deepRemaining,
  } = useMemo(() => {
    const weekAll = filtered
      .filter((s) => within7Days(s.publishedAt))
      .sort(compareFeedPriority);
    const newWeek = weekAll.slice(0, CLUSTER);
    const used = new Set(newWeek.map((s) => s.id));

    const popularWeek = popularSetsThisWeek(filtered, CLUSTER).filter(
      (s) => !used.has(s.id),
    );
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

    const deepAll = filtered
      .filter((s) => !used.has(s.id))
      .sort(compareFeedPriority);
    const deepShown = deepAll.slice(0, visible);
    return {
      newWeek,
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
      <div className="mb-6 space-y-4">
        <div>
          <p className="mb-1.5 mono text-[10px] uppercase tracking-[0.14em] text-muted2">
            Category
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => selectType(t.id)}
                className={chip(type === t.id)}
              >
                {t.label}
              </button>
            ))}
            <span className="mono ml-1 text-[12px] text-muted2">
              {filtered.length} sets
            </span>
          </div>
        </div>

        {genres.length > 0 && (
          <div>
            <p className="mb-1.5 mono text-[10px] uppercase tracking-[0.14em] text-muted2">
              Genre
            </p>
            <div className="scroll-thin flex flex-nowrap gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => selectGenre("all")}
                className={chip(genre === "all")}
              >
                All
              </button>
              {genres.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => selectGenre(g)}
                  className={`${chip(genre === g)} whitespace-nowrap`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}
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
          {popularWeek.length > 0 && (
            <Section title="Popular this week" sets={popularWeek} />
          )}
          <PopularRails djs={popularDjs} venues={popularVenues} />
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
