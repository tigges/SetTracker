"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const TYPES = [
  { id: "all", label: "All" },
  { id: "radio", label: "Radio" },
  { id: "festival", label: "Festival" },
  { id: "soundcloud", label: "SoundCloud" },
  { id: "mix", label: "Mix" },
] as const;

export type FeedFilterMeta = {
  type: string;
  genre: string | null;
  bucket: "week" | "earlier";
};

type FeedFilterState = {
  type: string;
  genre: string;
};

const FeedFilterContext = createContext<FeedFilterState | null>(null);

function useFeedFilter(): FeedFilterState {
  const ctx = useContext(FeedFilterContext);
  if (!ctx) throw new Error("Feed filter components must be used inside FeedFilters");
  return ctx;
}

function matches(
  meta: Pick<FeedFilterMeta, "type" | "genre">,
  type: string,
  genre: string,
): boolean {
  return (
    (type === "all" || meta.type === type) &&
    (genre === "all" || meta.genre === genre)
  );
}

const chip = (active: boolean) =>
  `rounded-full border px-3 py-1 text-[12px] transition-colors ${
    active
      ? "border-brand bg-[color:var(--brand)]/10 text-brand"
      : "border-line text-muted hover:border-muted2 hover:text-ink"
  }`;

/**
 * Thin client island: filter chips + context. Set cards are server-rendered
 * children and are not serialized into this component's props.
 */
export function FeedFilters({
  genres,
  meta,
  children,
}: {
  genres: string[];
  meta: FeedFilterMeta[];
  children: ReactNode;
}) {
  const [type, setType] = useState("all");
  const [genre, setGenre] = useState("all");

  const filteredCount = useMemo(
    () => meta.filter((m) => matches(m, type, genre)).length,
    [meta, type, genre],
  );

  return (
    <FeedFilterContext.Provider value={{ type, genre }}>
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
            {filteredCount} sets
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

      {filteredCount === 0 ? (
        <p className="py-16 text-center text-[14px] text-muted2">
          No sets match this filter.
        </p>
      ) : (
        children
      )}
    </FeedFilterContext.Provider>
  );
}

/** Hides a server-rendered card when it doesn't match the active filters. */
export function FilterableSet({
  type,
  genre,
  children,
}: {
  type: string;
  genre: string | null;
  children: ReactNode;
}) {
  const { type: activeType, genre: activeGenre } = useFeedFilter();
  if (!matches({ type, genre }, activeType, activeGenre)) return null;
  return children;
}

/** Section chrome with a live filtered count; hidden when empty. */
export function FilterableSection({
  title,
  bucket,
  meta,
  children,
}: {
  title: string;
  bucket: FeedFilterMeta["bucket"];
  meta: FeedFilterMeta[];
  children: ReactNode;
}) {
  const { type, genre } = useFeedFilter();
  const count = useMemo(
    () =>
      meta.filter((m) => m.bucket === bucket && matches(m, type, genre)).length,
    [meta, bucket, type, genre],
  );
  if (count === 0) return null;

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
