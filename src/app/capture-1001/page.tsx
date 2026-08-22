import type { Metadata } from "next";
import { Suspense } from "react";
import { Capture1001Redirect } from "./Capture1001Redirect";

export const metadata: Metadata = {
  title: "Capture 1001",
  description:
    "1001Tracklists capture workbench — now on the stats dashboard.",
  robots: { index: false, follow: false },
};

/** Legacy path — workbench lives at /stats#capture-1001. */
export default function Capture1001Page() {
  return (
    <Suspense fallback={null}>
      <Capture1001Redirect />
    </Suspense>
  );
}
