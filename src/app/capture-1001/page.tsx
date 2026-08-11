import type { Metadata } from "next";
import {
  Capture1001Client,
  type CapturePreset,
} from "./Capture1001Client";
import nextCaptures from "../../../data/crosscheck/next-captures.json";

export const metadata: Metadata = {
  title: "Capture 1001 — setradar.ai",
  description:
    "Mobile bookmarklet to capture 1001Tracklists seeds for setradar.ai.",
};

export default function Capture1001Page() {
  const presets = (nextCaptures.presets ?? []) as CapturePreset[];

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
          Start from the official YouTube set, find its 1001Tracklists page,
          then run the bookmarklet to copy a timed seed and paste it into chat.
        </p>
      </header>
      <Capture1001Client presets={presets} />
    </div>
  );
}
