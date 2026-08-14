import { AtlasMap } from "@/components/AtlasMap";
import {
  atlasPins,
  loadAtlasDjs,
  loadAtlasVenues,
} from "@/lib/atlas/seed";
import { getDjList, getVenues } from "@/lib/queries";

export const metadata = {
  title: "Top 100 Atlas — setradar.ai",
  description:
    "DJ Mag Top 100 Clubs and Festivals 2026 plus Top 100 DJs 2025, mapped and linked to setradar.",
};

export default async function AtlasPage() {
  const [events, djs] = await Promise.all([getVenues(), getDjList()]);
  const catalogEvents = new Map(
    events.map((e) => [
      e.slug,
      { slug: e.slug, setCount: e.setCount, imageUrl: e.imageUrl },
    ]),
  );
  const catalogDjs = new Map(
    djs.map((d) => [
      d.slug,
      { slug: d.slug, setCount: d.setCount, imageUrl: d.imageUrl },
    ]),
  );
  const pins = atlasPins(
    loadAtlasVenues(),
    loadAtlasDjs(),
    catalogEvents,
    catalogDjs,
  );

  return <AtlasMap pins={pins} />;
}
