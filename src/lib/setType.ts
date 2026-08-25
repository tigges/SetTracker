/**
 * Set.type — performance class, not the discovery host.
 *
 * Live rooms (festival / club) first, then official livestreams
 * (venue + DJ), then weekly radio. Mix / SoundCloud are leftover
 * format labels when we do not yet know the room.
 */

import { looksLikeLiveFestivalRadio } from "./sourceComments";

export const SET_TYPES = [
  "festival",
  "club",
  "livestream",
  "radio",
  "soundcloud",
  "mix",
] as const;

export type SetType = (typeof SET_TYPES)[number];

const SET_TYPE_SET = new Set<string>(SET_TYPES);

export function isSetType(value: string | null | undefined): value is SetType {
  return !!value && SET_TYPE_SET.has(value);
}

/**
 * Festival brands in a title. Boiler Room / Cercle are livestreams,
 * not festivals — keep them out of this list.
 */
const FESTIVAL_TITLE =
  /\b(festival|edc|ultra|parookaville|tomorrowland|creamfields|mysteryland|awakenings|dekmantel|coachella|lollapalooza|burning\s*man|hard\s*summer|street\s*parade|defqon|untold|s2o|electric\s*love|nature\s*one|dance\s*valley|time\s*warp|parklife|lost\s+horizon|nameless\s+festival|nocturnal\s*wonderland|beyond\s*wonderland|escape\s*halloween|dreamstate|countdown\s*nye)\b/i;

/**
 * Named rooms — never bare "club mix" / "club ready".
 */
const CLUB_TITLE =
  /\b(pacha|amnesia|dc-?10|ushua[iï]a|berghain|printworks|hi\s*ibiza|elrow|brooklyn\s*mirage|warehouse\s*project|ministry\s+of\s+sound|exchange\s*la|academy\s*la|club\s+space|space\s+miami|concourse\s+project|avalon\s+hollywood|silo\s+dallas|djoon|djøøn|fabric\b|output\s+brooklyn|nowadays|knockdown)\b/i;

const CLUB_LIVE =
  /\blive\s+(at|from|@)\b.{0,40}\bclub\b|\bat\s+[A-Z][\w'&.-]+(?:\s+[A-Z][\w'&.-]+){0,3}\s+club\b/i;

const LIVESTREAM_TITLE =
  /\b(boiler\s*room|cercle|mixmag\s+live|dj\s*mag\s+live|live\s*stream|livestream)\b/i;

const RADIO_TITLE =
  /\b(radio|broadcast|on\s*air|heldeep|group\s*therapy|hot\s*robot|a\s*state\s*of\s*trance)\b|\bshow\s*#?\d+/i; // pragma: allowlist secret

export type SetTypeSignals = {
  title?: string | null;
  type?: string | null;
  eventKind?: string | null;
};

export function isLiveVenueSet(s: SetTypeSignals): boolean {
  const k = (s.eventKind || "").toLowerCase();
  const t = (s.type || "").toLowerCase();
  if (k === "festival" || k === "club") return true;
  if (t === "festival" || t === "club") return true;
  return looksLikeLiveFestivalRadio(s.title);
}

export function isLivestreamSet(s: SetTypeSignals): boolean {
  if (isWeeklyRadioSet(s)) return false;
  if (s.eventKind === "festival" || s.eventKind === "club") return false;
  if (s.type === "festival" || s.type === "club") return false;
  const k = (s.eventKind || "").toLowerCase();
  const t = (s.type || "").toLowerCase();
  return t === "livestream" || k === "livestream";
}

/** Festival, club, or official livestream — not weekly radio. */
export function isLiveFocusSet(s: SetTypeSignals): boolean {
  return isLiveVenueSet(s) || isLivestreamSet(s);
}

/** Studio / weekly radio. Live-from-festival titles stay live. */
export function isWeeklyRadioSet(s: SetTypeSignals): boolean {
  if (looksLikeLiveFestivalRadio(s.title)) return false;
  if (s.eventKind === "festival" || s.eventKind === "club") return false;
  if (s.type === "festival" || s.type === "club") return false;
  return (s.type || "").toLowerCase() === "radio";
}

export type InferSetTypeOpts = {
  title: string;
  eventKind?: string | null;
  hintedType?: string | null;
  playbackHost?: "soundcloud" | "mixcloud" | "youtube" | null;
};

/**
 * Classify a performance. Event.kind wins when it is a known room or
 * stream. Title cues next. Weekly radio last. Host is only a leftover
 * format label.
 */
export function inferSetType(opts: InferSetTypeOpts): SetType {
  const title = opts.title.replace(/\s+/g, " ").trim();
  const kind = (opts.eventKind || "").toLowerCase();
  const hinted = (opts.hintedType || "").toLowerCase();

  if (kind === "festival") return "festival";
  if (kind === "club") return "club";
  if (kind === "livestream") {
    if (RADIO_TITLE.test(title) && !LIVESTREAM_TITLE.test(title)) return "radio";
    return "livestream";
  }
  if (kind === "radio") return "radio";

  if (FESTIVAL_TITLE.test(title)) return "festival";
  if (CLUB_TITLE.test(title) || CLUB_LIVE.test(title)) return "club";
  if (looksLikeLiveFestivalRadio(title)) return "festival";
  if (LIVESTREAM_TITLE.test(title)) return "livestream";
  if (RADIO_TITLE.test(title) || hinted === "radio") return "radio";

  if (isSetType(hinted) && hinted !== "radio") return hinted;

  if (opts.playbackHost === "soundcloud") return "soundcloud";
  return "mix";
}

/** Pages rematch: only promote toward live rooms / streams, or radio leftover. */
export function shouldUpgradeSetType(current: string, next: SetType): boolean {
  if (current === next) return false;
  const live = new Set<string>(["festival", "club", "livestream"]);
  if (live.has(next) && !live.has(current)) return true;
  if (current === "festival" && (next === "club" || next === "livestream")) {
    return true;
  }
  if (current === "radio" && next === "festival") return true;
  if ((current === "mix" || current === "soundcloud") && next === "radio") {
    return true;
  }
  return false;
}

export function rematchSetType(
  current: string,
  title: string,
  eventKind?: string | null,
): SetType | null {
  const next = inferSetType({ title, eventKind, hintedType: current });
  return shouldUpgradeSetType(current, next) ? next : null;
}
