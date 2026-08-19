/**
 * /stats operator playbook — live queues, not a static roadmap.
 * DJ Mag is a rank list, never a homepage. Verify-then-write.
 */

import { isLeftoverHostName } from "./artistName";
import { isWeakOfficialUrl } from "./officialUrls";

export type PlaybookKind = "queue" | "export" | "note";

export type PlaybookItem = {
  id: string;
  step: number;
  title: string;
  hint: string;
  count: number;
  href: string;
  kind: PlaybookKind;
};

export type PlaybookPlace = {
  slug: string;
  name: string;
  kind: "festival" | "club";
  website: string | null;
  onChart: boolean;
};

export type PlaybookHost = {
  slug: string;
  name: string;
  setCount: number;
  playCount: number;
};

export function leftoverHostOnQueue(row: {
  name: string;
  hasHandle: boolean;
  setCount: number;
  isJunk?: boolean;
  isLowSignal?: boolean;
}): boolean {
  if (row.isJunk || row.isLowSignal) return false;
  if (row.hasHandle || row.setCount < 1) return false;
  return isLeftoverHostName(row.name);
}

/** Host-named DJ rows that still own sets — relink or drop. */
export function leftoverHostInCatalog(row: {
  name: string;
  setCount: number;
}): boolean {
  return row.setCount > 0 && isLeftoverHostName(row.name);
}

export function isWeakOrEmptyWebsite(url: string | null | undefined): boolean {
  const website = url?.trim() ?? "";
  return !website || isWeakOfficialUrl(website);
}

export function weakChartWebsite(row: {
  onChart: boolean;
  website: string | null;
}): boolean {
  return row.onChart && isWeakOrEmptyWebsite(row.website);
}

export function buildPlaybookItems(input: {
  leftoverHosts: number;
  tracksNeedIsrc: number;
  weakChartSites: number;
  chartClubsNoCalendar: number;
  starIdGaps: number;
  handlesAfterHosts: number;
}): PlaybookItem[] {
  return [
    {
      id: "hosts",
      step: 1,
      title: "Clean leftover hosts",
      hint: "Set / film titles on the DJ handle queue — not people. Off the health bar first.",
      count: input.leftoverHosts,
      href: "#leftover-hosts",
      kind: "queue",
    },
    {
      id: "machine-ids",
      step: 2,
      title: "Machine-resolve track IDs",
      hint: "research:track-ids on high-play / chart cues. Deezer, MusicBrainz, TrackRadar. Never scrape Beatport.",
      count: input.tracksNeedIsrc,
      href: "/exports/tracks-need-id.csv",
      kind: "export",
    },
    {
      id: "weak-sites",
      step: 3,
      title: "Replace weak chart websites",
      hint: "Top 100 clubs / fests whose site is DJ Mag, 6am, Wikipedia, RA, DICE, Shotgun, or empty. First-party www only.",
      count: input.weakChartSites,
      href: "#weak-sites",
      kind: "queue",
    },
    {
      id: "calendars",
      step: 4,
      title: "Add official venue calendars",
      hint: "Chart clubs without a first-party calendar scraper. Tickets (RA / DICE / Shotgun) are not the calendar.",
      count: input.chartClubsNoCalendar,
      href: "#weak-sites",
      kind: "queue",
    },
    {
      id: "fingerprint",
      step: 5,
      title: "Fingerprint starred gaps",
      hint: "ACR on SoundCloud / hearthis, File Scan on official YouTube. Chart thin lists and unresolved cues.",
      count: input.starIdGaps,
      href: "#cues",
      kind: "queue",
    },
    {
      id: "handles",
      step: 6,
      title: "LLM handles after hosts",
      hint: "Gemini research:handles only on real DJs that still have a set and no social. After step 1.",
      count: input.handlesAfterHosts,
      href: "#dj-handles",
      kind: "queue",
    },
    {
      id: "claude-ids",
      step: 7,
      title: "Claude IDs last",
      hint: "Paste leftovers APIs miss. Write only when Deezer or MusicBrainz confirms. Do not buy invented ISRCs.",
      count: input.tracksNeedIsrc,
      href: "/exports/tracks-need-id.csv",
      kind: "export",
    },
  ];
}
