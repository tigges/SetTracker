"use client";

import { useEffect, useMemo, useState } from "react";
import { SetCard } from "@/components/SetCard";
import type { FeedItem } from "@/lib/queries";

const TYPES = [
  { id: "all", label: "All" },
  { id: "radio", label: "Radio" },
  { id: "festival", label: "Festival" },
  { id: "soundcloud", label: "SoundCloud" },
] as const;

/** 18 = 6 rows × 3 columns on desktop — enough context without drowning the page. */
const PAGE_SIZE = 18;

function within7Days(d: Date | string): boolean {
  return Date.now() - new Date(d).getTime() < 7 * 24 * 60 * 60 * 1000;
}

const chip = (active: boolean) =>
  `rounded-full border px-3 py-1 text-[12px] transition-colors ${
    active
      ? "border-brand bg-[color:var(--brand)]/10 text-brand"
      : "border-line text-muted hover:border-muted2 hover:text-ink"
  }`;

/**
 * Client feed: type/genre filters + "Load more" pagination over the full
 * static catalog (GitHub Pages has no server API).
 */
export function SetFeed({ feed, genres }: { feed: FeedItem[]; genres: string[] }) {
  const [type, setType] = useState("all");
  const [genre, setGenre] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    return feed.filter(
      (s) =>
        (type === "all" || s.type === type) &&
        (genre === "all" || s.genre === genre),
    );
  }, [feed, type, genre]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [type, genre]);

  const shown = filtered.slice(0, visible);
  const thisWeek = shown.filter((s) => within7Days(s.publishedAt));
  const earlier = shown.filter((s) => !within7Days(s.publishedAt));
  const remaining = filtered.length - shown.length;

  return (
    <div>
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={chip(type === t.id)}
            >
              {t.label}
            </button>
          ))}
          <span className="mono ml-1 text-[12px] text-muted2">
            {filtered.length} sets
          </span>
        </div>
        <div className="scroll-thin flex flex-nowrap gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setGenre("all")}
            className={chip(genre === "all")}
          >
            All
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
          {thisWeek.length > 0 && (
            <Section title="This week" count={thisWeek.length}>
              {thisWeek.map((s) => (
                <SetCard key={s.id} set={s} />
              ))}
            </Section>
          )}
          {earlier.length > 0 && (
            <Section title="Earlier" count={earlier.length}>
              {earlier.map((s) => (
                <SetCard key={s.id} set={s} />
              ))}
            </Section>
          )}
          {remaining > 0 && (
            <div className="flex justify-center pb-4">
              <button
                type="button"
                onClick={() => setVisible((n) => n + PAGE_SIZE)}
                className="rounded-full border border-line px-5 py-2 text-[13px] text-muted transition-colors hover:border-brand hover:text-brand"
              >
                Load more · {Math.min(PAGE_SIZE, remaining)} of {remaining} left
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
          {title}
        </h2>
        <span className="mono text-[12px] text-muted2">{count}</span>
        <div className="h-px flex-1 bg-line" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}
