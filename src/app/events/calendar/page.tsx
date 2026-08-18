import type { Metadata } from "next";
import Link from "next/link";
import { FestivalCalendar } from "@/components/FestivalCalendar";
import { editionBrandLabel } from "@/lib/ingest/festivalDrops";
import { getFestivalEditionBoard } from "@/lib/queries";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Calendar",
  description:
    "Festival edition weekends plus official club nights from UNVRS, Hï, Amnesia, and other calendars.",
  path: "/events/calendar",
});

export default async function FestivalCalendarPage() {
  const board = await getFestivalEditionBoard();
  const editions = board.calendar.map((e) => ({
    ...e,
    name: board.names.get(e.eventSlug) ?? editionBrandLabel(e.eventSlug),
    imageUrl: board.images.get(e.eventSlug) ?? null,
  }));
  const nights = board.nights.map((n) => ({
    ...n,
    name: board.names.get(n.eventSlug) ?? editionBrandLabel(n.eventSlug),
    imageUrl: board.images.get(n.eventSlug) ?? null,
  }));

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Festival editions & club nights</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
          Calendar
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          Curated festival weekends plus dated nights from official club
          calendars. Relive dumps land after the close.{" "}
          <Link href="/events" className="text-brand hover:text-brandstrong">
            All events →
          </Link>
        </p>
      </div>
      <FestivalCalendar
        editions={editions}
        nights={nights}
        setCounts={board.setCounts}
        nowMs={board.nowMs}
      />
    </div>
  );
}
