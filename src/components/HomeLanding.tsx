import Link from "next/link";
import { SetEntryLink } from "@/components/SetEntryLink";
import { BrandLogo } from "@/components/BrandMark";
import { EntityThumb } from "@/components/EntityThumb";
import { VisualTeaser, type TeaserFace } from "@/components/VisualTeaser";
import { setHostHeadline } from "@/lib/brandHosts";
import {
  mergeStatusCounts,
  pickDjFaces,
  pickHeroCollage,
  pickLandingSets,
  pickVenueMosaic,
  setgraphTicks,
  type LandingFace,
} from "@/lib/homeLanding";
import type { FeedItem } from "@/lib/queries";
import { setDisplayThumb } from "@/lib/setBrowse";
import { STATUS_META, type IdStatus } from "@/lib/status";

const COLLAGE_SLOTS = [
  { left: "2%", top: "6%", w: "42%", rotate: "-7deg", z: 3 },
  { left: "30%", top: "-4%", w: "38%", rotate: "5deg", z: 4 },
  { left: "58%", top: "10%", w: "36%", rotate: "-3deg", z: 2 },
  { left: "8%", top: "42%", w: "32%", rotate: "8deg", z: 5 },
  { left: "40%", top: "48%", w: "30%", rotate: "-6deg", z: 3 },
  { left: "68%", top: "44%", w: "28%", rotate: "4deg", z: 1 },
  { left: "18%", top: "68%", w: "24%", rotate: "-4deg", z: 2 },
  { left: "50%", top: "72%", w: "22%", rotate: "6deg", z: 1 },
] as const;

function initials(label: string): string {
  return label.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase();
}

function SetgraphStrip({
  counts,
  maxTicks = 40,
  height = 10,
  className = "",
}: {
  counts: Partial<Record<IdStatus, number>>;
  maxTicks?: number;
  height?: number;
  className?: string;
}) {
  const ticks = setgraphTicks(counts, maxTicks);
  if (ticks.length === 0) return null;
  return (
    <div
      className={`flex w-full overflow-hidden rounded-full bg-linesoft ${className}`}
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

function FaceCollage({ faces }: { faces: LandingFace[] }) {
  const shown = faces.slice(0, COLLAGE_SLOTS.length);
  if (shown.length === 0) return null;
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {shown.map((f, i) => {
        const slot = COLLAGE_SLOTS[i];
        return (
          <div
            key={`${f.src}-${i}`}
            className="absolute aspect-square overflow-hidden rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
            style={{
              left: slot.left,
              top: slot.top,
              width: slot.w,
              zIndex: slot.z,
              transform: `rotate(${slot.rotate})`,
            }}
          >
            <EntityThumb
              fill
              src={f.src}
              label={f.label}
              accent={f.accent ?? "var(--brand)"}
              radius={16}
              monogram={initials(f.label)}
            />
          </div>
        );
      })}
    </div>
  );
}

function SetPoster({
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
  const thumb = setDisplayThumb({
    imageUrl: set.imageUrl,
    primaryDjImageUrl: set.primaryDj?.imageUrl,
    eventImageUrl: set.eventImageUrl,
    primaryDjSlug: set.primaryDj?.slug,
  });
  const feature = tone === "feature";
  const compact = tone === "compact";
  return (
    <SetEntryLink
      href={`/sets/${set.slug}`}
      label="Home"
      className={`card group relative overflow-hidden ${
        feature ? "col-span-2 sm:col-span-1" : ""
      }`}
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
          <p className="eyebrow text-muted2">{place}</p>
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
  );
}

function MosaicBoard({
  title,
  blurb,
  href,
  cta,
  faces,
}: {
  title: string;
  blurb: string;
  href: string;
  cta: string;
  faces: LandingFace[];
}) {
  if (faces.length === 0) return null;
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          <p className="mt-0.5 text-[13px] text-muted2">{blurb}</p>
        </div>
        <Link
          href={href}
          className="mono text-[11px] text-muted2 transition-colors hover:text-brand"
        >
          {cta}
        </Link>
      </div>
      <div className="scroll-thin flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:gap-2 sm:overflow-visible sm:pb-0">
        {faces.map((f) => (
          <Link
            key={f.href ?? f.src}
            href={f.href ?? href}
            className="relative aspect-[4/3] w-[13.75rem] shrink-0 overflow-hidden rounded-xl border border-line sm:w-auto sm:shrink"
          >
            <EntityThumb
              fill
              src={f.src}
              label={f.label}
              accent={f.accent ?? "var(--brand)"}
              radius={12}
              monogram={initials(f.label)}
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/90 to-transparent px-2.5 pb-2 pt-8 text-[13px] font-semibold text-ink">
              {f.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HomeLanding({
  feed,
  djs,
  venues,
  atlasFaces,
  calendarFaces,
  markedDays,
  nowMs,
}: {
  feed: FeedItem[];
  djs: Array<{
    slug: string;
    name: string;
    imageUrl?: string | null;
    accent?: string;
    isBrowseReady?: boolean;
    setCount?: number;
  }>;
  venues: Array<{
    slug: string;
    name: string;
    kind: string;
    imageUrl?: string | null;
    accent?: string;
    isBrowseReady?: boolean;
  }>;
  atlasFaces: TeaserFace[];
  calendarFaces: TeaserFace[];
  markedDays: Set<string>;
  nowMs: number;
}) {
  const landingSets = pickLandingSets(feed, 3);
  const festivals = pickVenueMosaic(venues, "festival", 9);
  const clubs = pickVenueMosaic(venues, "club", 9);
  const djFaces = pickDjFaces(djs, 10);
  const collage = pickHeroCollage({
    sets: landingSets,
    djs: djFaces,
    venues: [...festivals, ...clubs],
    limit: 8,
  });
  const graphCounts = mergeStatusCounts(landingSets.map((s) => s.statusCounts));

  return (
    <div className="space-y-8 sm:space-y-12">
      <section className="relative min-h-[22rem] overflow-hidden rounded-2xl border border-line bg-bg sm:min-h-[28rem]">
        <FaceCollage faces={collage} />
        <div className="hero-scrim absolute inset-0" aria-hidden />
        <div className="relative z-10 flex min-h-[22rem] flex-col justify-end p-6 sm:min-h-[28rem] sm:p-10">
          <div className="hero-copy space-y-5">
            <div>
              <BrandLogo className="h-12 w-[8.25rem] sm:h-14 sm:w-[9.6rem]" />
              <h1 className="hero-title mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
                The night, as a graph.
              </h1>
              <p className="hero-lede mt-3 max-w-md text-[15px] leading-relaxed">
                Timed tracklists from festivals, clubs, and radio.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/sets"
                className="inline-flex rounded-full bg-brand px-5 py-2.5 text-[14px] font-semibold text-bg transition-colors hover:bg-brandstrong"
              >
                Browse sets
              </Link>
              <Link
                href="/atlas"
                className="inline-flex rounded-full border border-line bg-bg/70 px-5 py-2.5 text-[14px] font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
              >
                Atlas
              </Link>
            </div>
            {setgraphTicks(graphCounts, 48).length > 0 ? (
              <div className="space-y-2.5">
                <SetgraphStrip
                  counts={graphCounts}
                  maxTicks={48}
                  height={14}
                  className="hero-setgraph"
                />
                <ul className="hero-legend mono">
                  <li className="hero-legend-chip">Cue IDs</li>
                  <li className="hero-legend-chip">
                    <span className="dot bg-amber" />
                    identified
                  </li>
                  <li className="hero-legend-chip">
                    <span className="dot bg-magenta" />
                    unresolved
                  </li>
                  <li className="hero-legend-chip">
                    <span className="dot bg-teal" />
                    community
                  </li>
                  <li className="hero-legend-chip">
                    <span className="dot bg-grey" />
                    unparsed
                  </li>
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {landingSets.length > 0 ? (
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight">On the radar</h2>
              <p className="mt-0.5 text-[13px] text-muted2">
                Three sets as proof — the full catalog lives on Browse sets.
              </p>
            </div>
            <Link
              href="/sets"
              className="mono text-[11px] text-muted2 transition-colors hover:text-brand"
            >
              All sets →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {landingSets.map((s, i) => (
              <SetPoster
                key={s.id}
                set={s}
                tone={i === 0 || landingSets.length < 3 ? "feature" : "compact"}
              />
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        <MosaicBoard
          title="Festivals"
          blurb="Edition weekends with timed tracklists."
          href="/events#festivals"
          cta="All festivals →"
          faces={festivals}
        />
        <MosaicBoard
          title="Clubs"
          blurb="Rooms on the chart and in the catalog."
          href="/events#clubs"
          cta="All clubs →"
          faces={clubs}
        />
      </div>

      {djFaces.length > 0 ? (
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight">DJs</h2>
              <p className="mt-0.5 text-[13px] text-muted2">
                Artists with a handle, a set, and artwork.
              </p>
            </div>
            <Link
              href="/djs"
              className="mono text-[11px] text-muted2 transition-colors hover:text-brand"
            >
              All DJs →
            </Link>
          </div>
          <div className="scroll-thin flex gap-3 overflow-x-auto pb-1">
            {djFaces.map((d) => (
              <Link
                key={d.href ?? d.src}
                href={d.href ?? "/djs"}
                className="flex w-[160px] shrink-0 flex-col gap-2 transition-opacity hover:opacity-90"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl">
                  <EntityThumb
                    fill
                    src={d.src}
                    label={d.label}
                    accent={d.accent ?? "var(--violet)"}
                    radius={16}
                    monogram={initials(d.label)}
                  />
                </div>
                <div className="truncate text-[13px] font-semibold text-ink">
                  {d.label}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <VisualTeaser
          href="/atlas"
          eyebrow="DJ Mag charts"
          title="Map the Top 100"
          blurb="Clubs, festivals, and DJs — search from the header."
          cta="Atlas →"
          variant="atlas"
          faces={atlasFaces}
        />
        <VisualTeaser
          href="/events/calendar"
          eyebrow="Festival editions & club nights"
          title="This season’s calendar"
          blurb="Curated weekends plus official club calendars."
          cta="Calendar →"
          variant="calendar"
          faces={calendarFaces}
          markedDays={markedDays}
          nowMs={nowMs}
        />
      </div>
    </div>
  );
}
