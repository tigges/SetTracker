"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { capture1001StatsHref } from "@/lib/captureHref";

/** Legacy path — workbench lives on /stats#capture-1001. */
export function Capture1001Redirect() {
  const router = useRouter();
  const params = useSearchParams();
  const href = capture1001StatsHref(params.get("q") ?? undefined);

  useEffect(() => {
    router.replace(href);
  }, [href, router]);

  return (
    <p className="text-[13px] text-muted">
      Capture 1001 moved to{" "}
      <a href={href} className="text-brand hover:underline">
        /stats#capture-1001
      </a>
      .
    </p>
  );
}
