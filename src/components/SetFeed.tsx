"use client";

import { useMemo, useState } from "react";
import { SetCard } from "@/components/SetCard";
import type { FeedItem } from "@/lib/queries";

const TYPES = [
  { id: "all", label: "All" },
  { id: "radio", label: "Radio" },
  { id: "festival", label: "Festival" },
  { id: "soundcloud", label: "SoundCloud" },
];

function within7Days(d: Date | string): boolean {
  return Date.now() - new Date(d).getTime() < 7 * 24 * 60 * 60 * 1000;
}

function Section({ title, sets }: { title: string; sets: FeedItem[] }) {
  if (sets.length === 0) return null;
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

export function SetFeed({ feed, genres }: { feed: FeedItem[]; genres: string[] }) {
  const [type, setType] = useState("all");
  const [genre, setGenre] = useState("all");

  const filtered = useMemo(
    () =>
      feed.filter(
        (s) =>
          (type === "all" || s.type === type) &&
          (genre === "all" || s.genre === genre),
      ),
    [feed, type, genre],
  );

  const thisWeek = filtered.filter((s) => within7Days(s.publishedAt));
  const earlier = filtered.filter((s) => !within7Days(s.publishedAt));

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-[12px] transition-colors ${
      active
        ? "border-brand bg-[color:var(--brand)]/10 text-brand"
        : "border-line text-muted hover:border-muted2 hover:text-ink"
    }`;

  return (
    <div>
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {TYPES.map((t) => (
            <button key={t.id} type="button" onClick={() => setType(t.id)} className={chip(type === t.id)}>
              {t.label}
            </button>
          ))}
          <span className="mono ml-1 text-[12px] text-muted2">{filtered.length} sets</span>
        </div>
        <div className="scroll-thin flex flex-nowrap gap-1.5 overflow-x-auto pb-1">
          <button type="button" onClick={() => setGenre("all")} className={chip(genre === "all")}>
            All genres
          </button>
          {genres.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenre(g)}
              className={`${chip(genre === g)} whitespace-nowrap`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[14px] text-muted2">
          No sets match this filter.
        </p>
      ) : (
        <>
          <Section title="This week" sets={thisWeek} />
          <Section title="Earlier" sets={earlier} />
        </>
      )}
    </div>
  );
}
