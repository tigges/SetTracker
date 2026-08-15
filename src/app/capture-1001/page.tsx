import type { Metadata } from "next";
import { getCaptureQueue } from "@/lib/captureQueue";
import {
  Capture1001Client,
  type CapturePreset,
} from "./Capture1001Client";
import nextCaptures from "../../../data/crosscheck/next-captures.json";

export const metadata: Metadata = {
  title: "Capture 1001",
  description:
    "Mobile bookmarklet to capture 1001Tracklists seeds for setradar.ai.",
  robots: { index: false, follow: false },
};

export default async function Capture1001Page() {
  const extras = ((nextCaptures.presets ?? []) as CapturePreset[]).filter(
    (p) => p.reason === "relive:official-unwired",
  );
  let presets: CapturePreset[] = extras.slice(0, 12);
  let generatedAt = String(nextCaptures.generatedAt ?? "");
  try {
    const queue = await getCaptureQueue(20, extras);
    if (queue.presets.length) {
      presets = queue.presets;
      generatedAt = queue.generatedAt;
    }
  } catch {
    /* no catalog DB — keep Relive extras / committed snapshot */
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2">
        <p className="mono text-[11px] uppercase tracking-[0.14em] text-muted2">
          Operator tool
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Capture 1001 on mobile
        </h1>
        <p className="text-[15px] text-muted">
          YouTube and SoundCloud are already ingested. 1001Tracklists blocks
          CI — capture timed cues here in a browser, then commit the seed.
          Prefer rows marked <span className="text-ink">1001 URL known</span>:
          open that page, run the bookmarklet (or paste{" "}
          <span className="mono text-[12px]">
            scripts/capture-1001tl.console.js
          </span>
          ), copy the seed.
        </p>
      </header>
      <Capture1001Client presets={presets} generatedAt={generatedAt} />
    </div>
  );
}
