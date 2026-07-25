import { SetCard } from "@/components/SetCard";
import {
  FeedFilters,
  FilterableSection,
  FilterableSet,
  type FeedFilterMeta,
} from "@/components/FeedFilters";
import type { FeedItem } from "@/lib/queries";

function within7Days(d: Date | string): boolean {
  return Date.now() - new Date(d).getTime() < 7 * 24 * 60 * 60 * 1000;
}

/**
 * Server component: renders SetCards as RSC HTML. Only the filter chrome is a
 * client island (FeedFilters), with slim `{type,genre,bucket}` meta for counts.
 */
export function SetFeed({ feed, genres }: { feed: FeedItem[]; genres: string[] }) {
  const thisWeek = feed.filter((s) => within7Days(s.publishedAt));
  const earlier = feed.filter((s) => !within7Days(s.publishedAt));

  const meta: FeedFilterMeta[] = [
    ...thisWeek.map((s) => ({
      type: s.type,
      genre: s.genre,
      bucket: "week" as const,
    })),
    ...earlier.map((s) => ({
      type: s.type,
      genre: s.genre,
      bucket: "earlier" as const,
    })),
  ];

  return (
    <FeedFilters genres={genres} meta={meta}>
      <FilterableSection title="This week" bucket="week" meta={meta}>
        {thisWeek.map((s) => (
          <FilterableSet key={s.id} type={s.type} genre={s.genre}>
            <SetCard set={s} />
          </FilterableSet>
        ))}
      </FilterableSection>
      <FilterableSection title="Earlier" bucket="earlier" meta={meta}>
        {earlier.map((s) => (
          <FilterableSet key={s.id} type={s.type} genre={s.genre}>
            <SetCard set={s} />
          </FilterableSet>
        ))}
      </FilterableSection>
    </FeedFilters>
  );
}
