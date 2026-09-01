"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { EntityThumb } from "@/components/EntityThumb";
import { SuggestDjButton } from "@/components/SuggestDj";
import { djCardSubtitle } from "@/lib/djDirectory";
import type { DjListItem } from "@/lib/queries";
import {
  SEARCH_1001_RESULT,
  SEARCH_1001_TRACKLISTS,
  search1001Query,
} from "@/lib/search1001";
import {
  effectiveWishlistSlugs,
  parseWishlistOverlay,
  wishlistIsCustomized,
  wishlistLabel,
} from "@/lib/wishlist";
import {
  sortWishlistByNeeds,
  wishlistCompleteness,
  WISHLIST_GAP_LABEL,
} from "@/lib/wishlistComplete";
import {
  rankWishlistSimilar,
  type SimilarHint,
} from "@/lib/wishlistSimilar";
import {
  resetStoredWishlist,
  subscribeWishlist,
  toggleStoredWishlist,
  wishlistSnapshot,
} from "@/lib/wishlistStore";

export function WishlistClient({
  djs,
  similarHints,
}: {
  djs: DjListItem[];
  similarHints: Record<string, SimilarHint[]>;
}) {
  const raw = useSyncExternalStore(
    subscribeWishlist,
    wishlistSnapshot,
    () => "",
  );
  const overlay = useMemo(() => parseWishlistOverlay(raw), [raw]);
  const slugs = effectiveWishlistSlugs(overlay);
  const bySlug = useMemo(() => {
    const map = new Map<string, DjListItem>();
    for (const dj of djs) map.set(dj.slug, dj);
    return map;
  }, [djs]);
  const customized = wishlistIsCustomized(overlay);
  const ordered = useMemo(
    () => sortWishlistByNeeds(slugs, (slug) => bySlug.get(slug)),
    [slugs, bySlug],
  );
  const needWork = useMemo(
    () =>
      ordered.filter((slug) => wishlistCompleteness(bySlug.get(slug)).needsWork)
        .length,
    [ordered, bySlug],
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[14px] text-muted">
          {slugs.length} {slugs.length === 1 ? "DJ" : "DJs"}
          {customized ? " · this browser" : " · starting set"}
          {needWork > 0
            ? ` · ${needWork} ${needWork === 1 ? "needs" : "need"} work`
            : " · complete"}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <SuggestDjButton
            catalog={djs.map((d) => ({ slug: d.slug, name: d.name }))}
            wishlisted={slugs}
          />
          {customized ? (
            <button
              type="button"
              onClick={() => resetStoredWishlist()}
              className="text-[12px] text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
            >
              Reset to starting set
            </button>
          ) : null}
        </div>
      </div>
      {slugs.length === 0 ? (
        <p className="text-[14px] text-muted">
          Wishlist is empty. Open a DJ page and add them back.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((slug) => {
            const dj = bySlug.get(slug);
            const name = wishlistLabel(slug, dj?.name);
            const { gaps } = wishlistCompleteness(dj);
            return (
              <li key={slug}>
                <div className="card px-3 py-2.5">
                  <div className="flex min-h-[44px] items-center gap-2.5">
                    {dj ? (
                      <Link
                        href={`/djs/${dj.slug}`}
                        className="flex min-w-0 flex-1 items-center gap-2.5"
                      >
                        <EntityThumb
                          src={dj.imageUrl}
                          label={dj.name}
                          accent={dj.accent}
                          size={40}
                          radius={10}
                        />
                        <div className="min-w-0">
                          <div className="truncate text-[15px] font-semibold leading-5 text-ink">
                            {dj.name}
                          </div>
                          <div className="truncate text-[12px] leading-4 text-muted2">
                            {djCardSubtitle(
                              dj.homeCity,
                              dj.setCount,
                              dj.top100Rank,
                            )}
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] font-semibold leading-5 text-ink">
                          {name}
                        </div>
                        <div className="truncate text-[12px] leading-4 text-muted2">
                          No catalog page yet
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleStoredWishlist(slug)}
                      className="flex-none rounded-md border border-line px-2 py-1 text-[11px] font-bold text-muted hover:border-brand hover:text-brand"
                    >
                      Remove
                    </button>
                  </div>
                  {gaps.length > 0 ? (
                    <div className="mt-2">
                      <div className="mb-2 flex flex-wrap gap-1">
                        {gaps.map((gap) => (
                          <span
                            key={gap}
                            className="rounded-md border border-line px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] text-muted"
                          >
                            {WISHLIST_GAP_LABEL[gap]}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Search1001ArtistButton query={search1001Query(name)} />
                        {dj?.youtube ? (
                          <a
                            href={dj.youtube}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md border border-line px-2 py-1 text-[11px] font-bold text-ink hover:border-brand hover:text-brand"
                          >
                            YouTube
                          </a>
                        ) : null}
                        {dj?.soundcloud ? (
                          <a
                            href={dj.soundcloud}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md border border-line px-2 py-1 text-[11px] font-bold text-ink hover:border-brand hover:text-brand"
                          >
                            SoundCloud
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <SimilarStrip
        slugs={slugs}
        djs={djs}
        bySlug={bySlug}
        similarHints={similarHints}
      />
    </div>
  );
}

function Search1001ArtistButton({ query }: { query: string }) {
  const q = query.trim();
  if (q.length < 2) return null;
  return (
    <form
      action={SEARCH_1001_RESULT}
      method="post"
      target="_blank"
      acceptCharset="utf-8"
      className="inline"
    >
      <input type="hidden" name="main_search" value={q} />
      <input
        type="hidden"
        name="search_selection"
        value={SEARCH_1001_TRACKLISTS}
      />
      <button
        type="submit"
        className="rounded-md border border-line px-2 py-1 text-[11px] font-bold text-ink hover:border-brand hover:text-brand"
      >
        Search 1001
      </button>
    </form>
  );
}

function SimilarStrip({
  slugs,
  djs,
  bySlug,
  similarHints,
}: {
  slugs: string[];
  djs: DjListItem[];
  bySlug: Map<string, DjListItem>;
  similarHints: Record<string, SimilarHint[]>;
}) {
  const rows = useMemo(
    () =>
      rankWishlistSimilar({
        wishlisted: slugs,
        hintsBySlug: similarHints,
        catalog: djs,
      }),
    [slugs, similarHints, djs],
  );
  if (rows.length === 0) return null;
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
          Similar DJs
        </h2>
        <span className="mono text-[12px] text-muted2">{rows.length}</span>
      </div>
      <p className="mb-3 max-w-2xl text-[13px] text-muted">
        From sets they share and the same lane. Not on your list yet.
      </p>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => {
          const dj = bySlug.get(row.slug);
          if (!dj) return null;
          return (
            <li key={row.slug}>
              <div className="card flex h-[64px] items-center gap-2.5 px-3">
                <Link
                  href={`/djs/${dj.slug}`}
                  className="flex min-w-0 flex-1 items-center gap-2.5"
                >
                  <EntityThumb
                    src={dj.imageUrl}
                    label={dj.name}
                    accent={dj.accent}
                    size={40}
                    radius={10}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-semibold leading-5 text-ink">
                      {dj.name}
                    </div>
                    <div className="truncate text-[12px] leading-4 text-muted2">
                      {row.reason}
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => toggleStoredWishlist(dj.slug)}
                  className="flex-none rounded-md border border-line px-2 py-1 text-[11px] font-bold text-ink hover:border-brand hover:text-brand"
                >
                  Add
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
