import type { Metadata } from "next";
import { SearchPageClient } from "./SearchPageClient";

export const metadata: Metadata = {
  title: "Search",
  description: "Search setradar sets, DJs, events, labels, and tracks.",
};

export default function SearchPage() {
  return (
    <div>
      <p className="eyebrow">Catalog</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Search</h1>
      <p className="mt-2 mb-6 max-w-2xl text-[14px] text-muted">
        Sets, DJs, events, labels, and identified tracks.
      </p>
      <SearchPageClient />
    </div>
  );
}
