import type { Metadata } from "next";
import { HomeLanding } from "@/components/HomeLanding";
import {
  calendarMarkedDays,
  calendarTeaserFaces,
  getAtlasTeaserFaces,
  getDjList,
  getFeed,
  getFestivalEditionBoard,
  getVenues,
} from "@/lib/queries";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "The night, as a graph",
  description: "Timed tracklists from festivals, clubs, and radio.",
  path: "/",
});

export default async function Home() {
  const [feed, djs, venues, board, atlasFaces] = await Promise.all([
    getFeed(),
    getDjList(),
    getVenues(),
    getFestivalEditionBoard(),
    getAtlasTeaserFaces(),
  ]);
  const calFaces = calendarTeaserFaces(board);
  const marked = calendarMarkedDays(board);

  return (
    <HomeLanding
      feed={feed}
      djs={djs}
      venues={venues}
      atlasFaces={atlasFaces.map((f) => ({
        src: f.imageUrl,
        label: f.name,
        accent: f.accent,
      }))}
      calendarFaces={calFaces.map((f) => ({
        src: f.imageUrl,
        label: f.name,
        accent: f.accent,
      }))}
      markedDays={marked}
      nowMs={board.nowMs}
    />
  );
}
