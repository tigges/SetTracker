import { AtlasMap } from "@/components/AtlasMap";
import { atlasPinsFromVenues, ATLAS_YEAR, loadAtlasVenues } from "@/lib/atlas/seed";
import { getVenues } from "@/lib/queries";

export const metadata = {
  title: "Top 100 Atlas — setradar.ai",
  description:
    "DJ Mag Top 100 Clubs and Festivals 2026, mapped and linked to setradar sets.",
};

export default async function AtlasPage() {
  const events = await getVenues();
  const catalog = new Map(
    events.map((e) => [
      e.slug,
      { slug: e.slug, setCount: e.setCount, imageUrl: e.imageUrl },
    ]),
  );
  const pins = atlasPinsFromVenues(loadAtlasVenues(), catalog);

  return <AtlasMap pins={pins} year={ATLAS_YEAR} />;
}
