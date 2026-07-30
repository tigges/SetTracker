import { redirect } from "next/navigation";
import { getAllVenueSlugs } from "@/lib/queries";

export async function generateStaticParams() {
  const slugs = await getAllVenueSlugs();
  if (slugs.length === 0) return [{ slug: "_placeholder" }];
  return slugs.map((slug) => ({ slug }));
}

/** Legacy path — event profiles live at /events/[slug]. */
export default async function VenueSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/events/${slug}`);
}
