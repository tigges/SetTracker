"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { GlobalSearch } from "@/components/GlobalSearch";

function SearchInner() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  return <GlobalSearch initialQuery={q} embedded />;
}

export function SearchPageClient() {
  return (
    <Suspense fallback={<p className="text-[13px] text-muted2">Loading search…</p>}>
      <SearchInner />
    </Suspense>
  );
}
