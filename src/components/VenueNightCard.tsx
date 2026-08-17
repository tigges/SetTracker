import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import { LineupArtistChips } from "@/components/LineupArtistChips";
import type { LineupName } from "@/lib/lineupMatch";

export type VenueNightCardModel = {
  slug: string;
  title: string;
  startsAt: string;
  sourceUrl: string;
  ticketsUrl: string | null;
  artists: LineupName[];
  headliner: LineupName | null;
};

export function VenueNightCard({ night }: { night: VenueNightCardModel }) {
  const head = night.headliner;
  const official = night.ticketsUrl || night.sourceUrl;

  return (
    <li className="card flex flex-col gap-3 p-4 transition-colors hover:border-[color:var(--muted2)] sm:flex-row sm:items-start">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <EntityThumb
          src={head?.imageUrl}
          label={night.title}
          accent={head?.accent || "var(--brand)"}
          size={44}
          radius={12}
          monogram={night.title.slice(0, 2).toUpperCase()}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold leading-tight text-ink">
            {head?.slug ? (
              <Link
                href={`/djs/${head.slug}`}
                className="transition-colors hover:text-brand"
                title="In catalog"
              >
                {night.title}
              </Link>
            ) : (
              night.title
            )}
          </h3>
          <p className="mono mt-0.5 text-[12px] text-muted2">{night.startsAt}</p>
          {night.artists.length > 0 ? (
            <div className="mt-2">
              <LineupArtistChips artists={night.artists} previewCount={6} />
            </div>
          ) : null}
        </div>
      </div>
      <a
        href={official}
        target="_blank"
        rel="noreferrer"
        className="mono shrink-0 text-[12px] text-brand hover:text-brandstrong"
      >
        Official →
      </a>
    </li>
  );
}
