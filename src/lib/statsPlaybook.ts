/**
 * /stats leftover-host + weak-site queues.
 * DJ Mag is a rank list, never a homepage.
 */

import { isLeftoverHostName } from "./artistName";
import { isWeakOfficialUrl } from "./officialUrls";

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
