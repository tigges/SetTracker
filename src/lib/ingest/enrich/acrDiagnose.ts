/**
 * ACRCloud diagnose verdict — File Scan is the CI YouTube control.
 * yt-dlp Identify from GitHub IPs is informational (bot-wall / unavailable).
 */

export function isExpectedYoutubeClipFail(detail: string): boolean {
  return /bot-wall|unavailable/i.test(detail);
}

export function isControlTrackMatch(
  artist: string,
  title: string,
  expect = "astley",
): boolean {
  const blob = `${artist} ${title}`.toLowerCase();
  return (
    blob.includes(expect.toLowerCase()) ||
    blob.includes("never gonna give you up")
  );
}

export type DiagnoseVerdict = {
  ok: boolean;
  controlLabel: string;
  failReason?: string;
};

/** Pass when Identify or File Scan names the control track. */
export function diagnoseVerdict(input: {
  identifyOk: boolean;
  identifyDetail: string;
  identifyHit: boolean;
  fsConfigured: boolean;
  fsScanFailed: boolean;
  fsControlHit: boolean;
  fsControlDetail?: string;
}): DiagnoseVerdict {
  if (input.identifyHit) {
    return { ok: true, controlLabel: "HIT ✓ (identify)" };
  }
  if (input.fsControlHit) {
    const extra = input.fsControlDetail ? ` ${input.fsControlDetail}` : "";
    return { ok: true, controlLabel: `HIT ✓ (file-scan${extra})` };
  }

  const ytWall =
    !input.identifyOk && isExpectedYoutubeClipFail(input.identifyDetail);

  if (ytWall && input.fsConfigured && input.fsScanFailed) {
    return {
      ok: false,
      controlLabel: "MISS ✗",
      failReason: "File Scan submit/poll failed",
    };
  }
  if (ytWall && input.fsConfigured) {
    return {
      ok: false,
      controlLabel: "MISS ✗",
      failReason: "File Scan did not identify the control track",
    };
  }
  if (ytWall) {
    return {
      ok: true,
      controlLabel: "MISS (yt-dlp wall; File Scan not configured)",
    };
  }
  if (!input.identifyOk) {
    return {
      ok: false,
      controlLabel: "MISS ✗",
      failReason: input.identifyDetail,
    };
  }
  return { ok: true, controlLabel: "MISS ✗" };
}
