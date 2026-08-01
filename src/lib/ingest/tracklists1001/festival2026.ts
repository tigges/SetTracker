/**
 * Browser-captured 1001Tracklists for July 2026 festival sets.
 * Provenance "1001tl". Only wire when an official YT/SC playback URL exists.
 */

import type { FingerprintSeedRow } from "../fingerprint/seeds";
import { parseClockToSec } from "../fingerprint/seeds";
import { interpolateMissingClocks } from "./toSeed";

function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }
  return `${m}:${String(r).padStart(2, "0")}`;
}

/** Assign evenly spaced clocks when 1001TL has no cues (≈ durationSec). */
export function evenlySpaceRows(
  rows: Omit<FingerprintSeedRow, "at">[],
  durationSec: number,
): FingerprintSeedRow[] {
  const n = rows.length;
  if (!n) return [];
  const usable = Math.max(60, durationSec - 45);
  const step = Math.max(45, Math.floor(usable / n));
  return rows.map((r, i) => ({
    ...r,
    at: formatClock(20 + i * step),
  }));
}

/**
 * MARTEN HØRGER @ Mainstage, Parookaville, Germany 2026-07-19
 * Official YT: https://www.youtube.com/watch?v=EbNRjEFZpDw (~59m)
 * Capture: operator paste from 1001TL (2026-07-27).
 */
export const TL_MARTEN_HORGER_PAROOKAVILLE_2026: FingerprintSeedRow[] = [
  { at: "0:11", artist: "MARTEN HØRGER", title: "Tom's Diner" },
  { at: "3:25", artist: "bradeazy ft. TyriqueOrDie", title: "Up Down" },
  { at: "4:50", artist: "Lady GaGa", title: "Poker Face (CHALANT Remix)" },
  { at: "6:30", artist: "KENZ", title: "Rake It Up" },
  {
    at: "8:12",
    artist: "Kid Cudi ft. MGMT & Ratatat",
    title: "Pursuit Of Happiness (MEDUN Remix)",
  },
  {
    at: "14:25",
    artist: "Congorock ft. Mr. Lexx",
    title:
      "Babylon (David Guetta & MARTEN HØRGER pres. Men Machine & KENZ Rework)",
  },
  {
    at: "18:15",
    artist: "John Newman",
    title: "Love Me Again (Again) (MARTEN HØRGER Remix)",
  },
  {
    at: "24:00",
    artist: "Dr. Fresch & MARTEN HØRGER",
    title: "Take A Step Back (Dr. Fresch VIP)",
  },
  { at: "24:46", artist: "MARTEN HØRGER", title: "Ill Behavior" },
  {
    at: "28:45",
    artist: "Pharoahe Monch",
    title: "Simon Says (Bassjackers Bootleg)",
  },
  { at: "30:20", artist: "Dillon Francis & MARTEN HØRGER", title: "B2U" },
  { at: "33:25", artist: "Daft Punk", title: "One More Time (HILLS Remix)" },
  {
    at: "40:05",
    artist: "MGMT",
    title: "Kids (Men Machine Rework)",
  },
  {
    at: "42:54",
    artist: "David Guetta & MARTEN HØRGER pres. Men Machine",
    title: "The Past, The Present, The Future",
  },
  {
    at: "46:12",
    artist: "Zombie Nation",
    title: "Kernkraft 400 (ID Remix)",
  },
  { at: "49:25", artist: "MARTEN HØRGER", title: "Worth The Wait" },
  { at: "52:20", artist: "MARTEN HØRGER", title: "No Bite" },
  {
    at: "56:00",
    artist: "MARTEN HØRGER",
    title: "Rave (PAROOKAVILLE Anthem 2026)",
  },
];

/**
 * Cloonee & Prospa @ Music On, Destino Pacha Ibiza, 2026-07-09
 * Official SC: https://soundcloud.com/cloonee/clooneeb2bprospa
 * Official YT: https://www.youtube.com/watch?v=UE6wjxvMRz0
 */
export const TL_CLOONEE_PROSPA_DESTINO_2026: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Joey London Style & Pheelo", title: "Never Stop" },
  { at: "0:00", artist: "Masters At Work", title: "Work (Acappella)" },
  { at: "8:30", artist: "Simes", title: "Funky Feeling" },
  { at: "11:37", artist: "Miro", title: "Watching Me" },
  { at: "14:37", artist: "Finky", title: "Move Ya Body" },
  { at: "18:00", artist: "Mau P", title: "Just A Little Bit" },
  { at: "22:30", artist: "Franky Rizardo", title: "Shinjuku" },
  { at: "26:45", artist: "Nate Irvin & Landen Gill", title: "Move To The Beat" },
  { at: "33:45", artist: "KETTAMA", title: "Raw Cuts (Michael Bibi Remix)" },
  {
    at: "37:50",
    artist: "Julian Fijma",
    title: "Get Stupid (Micah Baxter Edit)",
  },
  {
    at: "40:40",
    artist: "Prospa",
    title: "ID (Momma Used To Dance Like That)",
  },
  { at: "44:40", artist: "PAWSA", title: "TOO COOL TO BE CARELESS" },
  { at: "44:40", artist: "Cloonee", title: "Sippin' Yak" },
  { at: "48:35", artist: "Prospa & Murda Beatz", title: "Baby" },
  {
    at: "52:36",
    artist: "Cloonee & Prospa ft. Tristan Henry",
    title: "Good Girl",
  },
  { at: "56:16", artist: "Sapian", title: "Reason Why" },
  {
    at: "1:00:15",
    artist: "Danny Tenaglia ft. Celeda",
    title: "Music Is The Answer (Dancin' And Prancin') (ID Remix)",
  },
  {
    at: "1:02:30",
    artist: "Tre Reynolds & Ferra Black ft. Crazy Cousinz & Calista Kazuko",
    title: "Bongos (In The Morning)",
  },
  { at: "1:05:25", artist: "FIRZA", title: "Disco Whoops" },
  {
    at: "1:09:30",
    artist: "Alex Atenciano & Mr Martin",
    title: "Give Me The Rythm",
  },
  { at: "1:15:29", artist: "Cloonee & Prospa", title: "Free Your Mind" },
  {
    at: "1:20:00",
    artist: "Storm Queen",
    title: "Look Right Through (Franky Rizardo Remix)",
  },
  { at: "1:24:00", artist: "Sonny Kane", title: "Never Leave U" },
  { at: "1:26:35", artist: "2Seater", title: "Street Playaz" },
];

/**
 * Charlotte de Witte @ Mainstage, Tomorrowland Weekend 1, 2026-07-19
 * Official SC: https://soundcloud.com/charlottedewittemusic/charlotte-de-witte-at (~59:01)
 * 1001TL cues untimed — clocks evenly spaced across ~59m. Skips bare ID–ID rows.
 */
export const TL_CHARLOTTE_DE_WITTE_TML_WE1_2026: FingerprintSeedRow[] =
  evenlySpaceRows(
    [
      {
        artist: "Enrico Sangiuliano",
        title: "The Techno Code (Charlotte de Witte Acid Code)",
      },
      {
        artist: "Electric Universe & Greg Hilight",
        title: "Om Namah Shivaya",
      },
      {
        artist: "Charlotte de Witte ft. Conduit",
        title: "A Prayer For The Dancefloor (Avalon & GMS Remix)",
      },
      {
        artist: "Charlotte de Witte & Theo Nasa",
        title: "The Resistance",
      },
      { artist: "Lilly Palmer", title: "Living Fast" },
      {
        artist: "Bl4ck Hole & Invader Space",
        title: "Ragga Man (Burn In Noise & Becker Remix)",
      },
      { artist: "Pan-Pot", title: "Funke (Audio State Remix)" },
      {
        artist: "Vini Vici & Tristan & Avalon",
        title: "Music Is The Answer",
      },
      {
        artist: "Pupa Nas T & FOVOS ft. Denise Belfon",
        title: "Work Edit",
      },
      {
        artist: "Yenkov & Gaston Fiore",
        title: "Bring Back Emotions",
      },
    ],
    59 * 60 + 1,
  );

/**
 * Westend @ cosmicMEADOW, EDC Las Vegas 2026-05-15
 * Official YT: https://www.youtube.com/watch?v=jQLWYc2UrFY (~59:12)
 * Official SC: https://soundcloud.com/itsthewestend/westend-live-edc-2026
 * 1001TL: https://1001.tl/xh6t5uk (CF-blocked in CI) — operator screenshot
 * capture 2026-08-01. Skips bare Westend ID. Known cues Like You A Lot
 * ~20:59 / Proper Education ~29:48 applied after even spacing.
 */
export const TL_WESTEND_EDC_LV_2026: FingerprintSeedRow[] = (() => {
  const spaced = evenlySpaceRows(
    [
      {
        artist: "Glass Petals ft. Sophiegraphy",
        title: "We Stay Inside",
      },
      {
        artist: "Diplo & SIDEPIECE vs Westend",
        title: "On My Mind vs Freaky Time (Westend Mashup)",
      },
      {
        artist: "Prospa",
        title: "Don't Stop (Twin Diplomacy Remix)",
      },
      { artist: "BYOR & Mentum", title: "I Can Dance" },
      {
        artist: "Fake Blood",
        title: "I Think I Like It (Westend Edit)",
      },
      { artist: "Westend ft. Hosanna", title: "Drum Death" },
      {
        artist: "VNSSA, Sian & Sacha Robotti",
        title: "Smalltown Girl",
      },
      { artist: "Westend & Dave Summer", title: "Love Spell" },
      {
        artist: "Vanrip & Truth x Lies ft. WEiRD GRRL",
        title: "Like You A Lot",
      },
      {
        artist: "Dansyn vs Noizu & Westend & No/Me",
        title: "Bang That vs Push To Start (Westend Edit)",
      },
      { artist: "Westend & Twin Diplomacy", title: "Sensational" },
      {
        artist: "Eric Prydz vs Pink Floyd",
        title: "Proper Education (Westend Edit)",
      },
      {
        artist: "Daft Punk",
        title: "Around The World (Westend Edit)",
      },
      {
        artist: "deadmau5 & Wolfgang Gartner",
        title: "Animal Rights (Westend Remix)",
      },
      { artist: "Westend ft. Lizzy Land", title: "Surrender" },
      { artist: "BRANDON", title: "My Body Talks" },
      {
        artist: "Congorock ft. Mr. Lexx",
        title:
          "Babylon (David Guetta & Marten Horger / Men Machine & KENZ Rework)",
      },
      {
        artist: "Westend & Olivia Sebastianelli",
        title: "The Ceiling",
      },
      {
        artist: "deadmau5 ft. Rob Swire",
        title: "Ghosts 'n' Stuff (Luke Alexander Remix)",
      },
      { artist: "Westend", title: "Feels Better" },
    ],
    3552,
  );
  return spaced.map((row) => {
    if (row.title === "Like You A Lot") return { ...row, at: "20:59" };
    if (row.title === "Proper Education (Westend Edit)") {
      return { ...row, at: "29:48" };
    }
    return row;
  });
})();

/**
 * AHEE B2B Liquid Stranger @ bassPOD, EDC Las Vegas 2026
 * Official YT: https://www.youtube.com/watch?v=yXHoHK_jQvc (~59:45)
 * 1001TL operator screenshots 2026-08-01 (partial through ~track 56; more
 * cues expected). Skips bare ID / Artist–ID rows. w/ layers kept as rows.
 * Clocks: even space before/after Gunslinger @ 45:30 (1001 cue).
 */
export const TL_AHEE_LIQUID_STRANGER_EDC_LV_2026: FingerprintSeedRow[] =
  (() => {
    const before: Omit<FingerprintSeedRow, "at">[] = [
      { artist: "Liquid Stranger & AHEE", title: "Superstar" },
      {
        artist: "Skrillex & Damian Marley",
        title: "Make It Bun Dem (Acappella)",
      },
      { artist: "Liquid Stranger & Champagne Drip", title: "Melt" },
      { artist: "Flozone", title: "Break Up Song" },
      { artist: "AHEE & Stylust", title: "Oxygen" },
      {
        artist: "REZZ vs. Aliyah's Interlude",
        title: "Edge vs. IT GIRL (AHEE Edit)",
      },
      { artist: "Da Hool", title: "Meet Her At The Love Parade" },
      { artist: "AHEE", title: "Brain Rot (VIP)" },
      {
        artist: "GRiZ ft. Subtronics",
        title: "Griztronics (ID Remix)",
      },
      {
        artist: "Baha Men",
        title: "Who Let The Dogs Out (Acappella)",
      },
      {
        artist: "Lil Jon ft. Three 6 Mafia",
        title: "Act A Fool (Acappella)",
      },
      { artist: "Liquid Stranger & AHEE", title: "Hot Shot" },
      { artist: "AHEE & SubDocta", title: "Fiyah" },
      { artist: "AHEE", title: "Bug Eater (VIP)" },
      {
        artist: "Skrillex & The Doors",
        title: "Breakin' A Sweat (It's Alright) (Acappella)",
      },
      {
        artist: "Ganja White Night & Liquid Stranger",
        title: "Jungle Juice",
      },
      {
        artist: "Skrillex & Fred again.. & Flowdan",
        title: "Rumble (Acappella)",
      },
      {
        artist: "Benny Benassi pres. The Biz",
        title: "Satisfaction (Acappella)",
      },
      {
        artist: "The Pixies",
        title: "Where Is My Mind? (AHEE Edit)",
      },
      {
        artist: "Space Laces",
        title: "Dominate (TYNAN Flip)",
      },
      { artist: "The Prodigy", title: "Breathe" },
      {
        artist: "Queen",
        title: "We Will Rock You (Acappella)",
      },
      { artist: "AHEE", title: "Shock Rave" },
      { artist: "Phibes", title: "Bassdrop" },
      {
        artist: "Lil Wayne",
        title: "A Milli (Acappella)",
      },
      { artist: "Liquid Stranger & Flozone", title: "Lose It" },
      {
        artist: "AHEE & SØMETHING",
        title: "The Action (WonkyWilla Remix)",
      },
      {
        artist: "Flux Pavilion & Liquid Stranger & AHEE",
        title: "Move Your Body",
      },
      {
        artist: "Skrillex & Mr. Oizo ft. Missy Elliott",
        title: "RATATA (ID Remix)",
      },
      {
        artist: "Liquid Stranger ft. Crooked Bangs",
        title: "Revolution (ID Remix)",
      },
      {
        artist: "Megan Thee Stallion",
        title: "Thot Shit (ID Remix)",
      },
      { artist: "Liquid Stranger & AHEE", title: "Space Whip" },
      { artist: "AHEE", title: "Bass Hamster" },
      { artist: "WODD", title: "Magic Pill" },
      {
        artist: "Levity ft. Dem Jointz",
        title: "Flip It (ID Remix)",
      },
      {
        artist: "Run The Jewels ft. Greg Nice & DJ Premier",
        title: "Ooh La La (Acappella)",
      },
      {
        artist: "t.A.T.u.",
        title: "Not Gonna Get Us (Liquid Stranger Remix)",
      },
      {
        artist: "Liquid Stranger ft. GG Magree",
        title: "Faster And Faster (ID Remix)",
      },
      { artist: "Liquid Stranger & NEOTEK", title: "Microphone" },
    ];
    const after: Omit<FingerprintSeedRow, "at">[] = [
      { artist: "bbno$", title: "it Boy (Acappella)" },
      { artist: "Liquid Stranger & TVBOO", title: "Cracked" },
      { artist: "Big Gigantic & AHEE", title: "Funk Rocket" },
      { artist: "House Of Pain", title: "Jump Around" },
      { artist: "AHEE & ProbCause", title: "Rainbow Funk" },
      {
        artist: "Liquid Stranger & ProbCause",
        title: "Trailblazer (AHEE Remix)",
      },
      { artist: "Noisestorm", title: "Crab Rave" },
      { artist: "OddKidOut & AHEE", title: "WONKY" },
      {
        artist: "Liquid Stranger ft. Warrior Queen & HARD KNOCK",
        title: "Hydroplane (ID Remix)",
      },
      { artist: "Liquid Stranger", title: "Shake (ID Remix)" },
      {
        artist: "Dillon Francis & NGHTMRE",
        title: "Another Dimension",
      },
      { artist: "AHEE", title: "Alien Invader" },
      { artist: "TVBOO & AHEE", title: "Space Boat" },
      {
        artist: "Vengaboys",
        title: "We Like To Party! (The Vengabus)",
      },
      {
        artist: "Khia",
        title: "My Neck, My Back (Lick It) (Acappella)",
      },
      {
        artist: "NGHTMRE & Liquid Stranger ft. Mougleta",
        title: "Restless (ID Remix)",
      },
    ];
    const gunAt = 45 * 60 + 30;
    const beforeSpaced = evenlySpaceRows(before, gunAt);
    const afterSpaced = evenlySpaceRows(after, 3585 - gunAt).map((row) => {
      const sec = parseClockToSec(row.at);
      if (sec == null) return row;
      return { ...row, at: formatClock(gunAt + sec) };
    });
    return [
      ...beforeSpaced,
      {
        artist: "Liquid Stranger ft. Pistol Pete",
        title: "Gunslinger (Bemah Flip)",
        at: "45:30",
      },
      ...afterSpaced,
    ];
  })();

/**
 * Darude @ quantumVALLEY, EDC Las Vegas 2026-05-15
 * Official YT: https://www.youtube.com/watch?v=dXBoIY65P8s (~56:22)
 * 1001TL: https://1001.tl/1v8whc0k (CF-blocked in CI)
 * Operator screenshots 2026-08-01. Skips bare ID / Darude–ID rows.
 */
export const TL_DARUDE_EDC_LV_2026: FingerprintSeedRow[] = [
  {
    at: "0:00",
    artist: "Darude ft. AI AM",
    title: "Beautiful Alien (Boyan & Boyer Remix)",
  },
  { at: "3:26", artist: "Robert Miles", title: "Children" },
  { at: "11:47", artist: "Tom Fall", title: "iROK" },
  { at: "13:30", artist: "Darude", title: "Rush" },
  { at: "18:59", artist: "Kx5 ft. HAYLA", title: "Escape" },
  { at: "28:47", artist: "Darude", title: "Feel The Beat" },
  { at: "30:00", artist: "Darude", title: "You" },
  { at: "32:05", artist: "Darude & Mashd N Kutcher", title: "Hype" },
  { at: "36:06", artist: "Darude", title: "Endless Wave" },
  {
    at: "40:00",
    artist: "Darude",
    title: "Sandstorm (Storm 25 Remix)",
  },
  { at: "46:20", artist: "Darude", title: "Bitter Sweet" },
  {
    at: "49:44",
    artist: "Supermode",
    title: "Tell Me Why (Darude Remix)",
  },
];

/**
 * CID @ circuitGROUNDS, EDC Las Vegas 2017-06-18
 * Official SC: https://soundcloud.com/cidmusic/cid-edc-lv-2017 (~59:02)
 * 1001TL: https://1001.tl/qhdctfk — operator console capture 2026-08-01.
 * Known 1001 cues kept; gaps interpolated (capture had broken i*90 fills).
 */
export const TL_CID_EDC_LV_2017: FingerprintSeedRow[] =
  interpolateMissingClocks(
    [
      { at: "0:00", artist: "CID & Kaskade", title: "Sweet Memories" },
      { artist: "Roulsen", title: "Rumble" },
      {
        artist: "Maroon 5 ft. Future",
        title: "Cold (Acappella)",
      },
      {
        at: "6:22",
        artist: "Bruno Mars",
        title: "Versace On The Floor (CID Remix)",
      },
      {
        at: "9:15",
        artist: "CID ft. Conrad Sewell",
        title: "Secrets (BROHUG Remix)",
      },
      { at: "12:10", artist: "Madison Mars", title: "Doppler" },
      {
        artist: "Kaskade & Project 46 ft. Stef Lang",
        title: "Last Chance",
      },
      {
        at: "15:45",
        artist: "Skrillex & Habstrakt",
        title: "Chicken Soup",
      },
      { at: "17:58", artist: "CID", title: "Werk" },
      {
        artist: "JOYRYDE vs. Eric Prydz",
        title: "Hot Drum vs. Pjanoo",
      },
      { artist: "Eric Prydz", title: "Pjanoo" },
      { artist: "JOYRYDE", title: "Hot Drum" },
      {
        artist: "The Magician ft. Brayton Bowman",
        title: "Shy (CID Remix)",
      },
      { at: "26:12", artist: "CID", title: "Creepin'" },
      { artist: "BROHUG", title: "If I'm Wrong" },
      {
        at: "30:35",
        artist: "Throttle",
        title: "Hit The Road Jack (CAZZTEK Remix)",
      },
      { at: "33:13", artist: "Sikdope", title: "Snakes" },
      {
        at: "36:05",
        artist: "CID ft. CeeLo Green",
        title: "Believer (CID VIP Mix)",
      },
      { artist: "Kideko & George Kwali", title: "Crank It" },
      {
        at: "41:22",
        artist: "Galantis & Hook N Sling",
        title: "Love On Me (CID Remix)",
      },
      { artist: "Chris Lake", title: "I Want You" },
      { artist: "Croatia Squad", title: "Hyper" },
      { artist: "Tiësto & Sevenn", title: "BOOM" },
      {
        artist: "The Chainsmokers & Coldplay",
        title: "Something Just Like This (Don Diablo Remix)",
      },
      {
        at: "54:18",
        artist: "Ummet Ozcan ft. Ambush",
        title: "Bombjack",
      },
      { at: "57:17", artist: "Kaskade & CID", title: "Us" },
    ],
    3542,
  );

/** sourceSlug → curated 1001TL seed (SC / YT when live HTML is CF-blocked). */
export const TRACKLIST_1001_BY_SOURCE_SLUG: Record<
  string,
  FingerprintSeedRow[]
> = {
  "sc-charlottedewittemusic-charlotte-de-witte-at":
    TL_CHARLOTTE_DE_WITTE_TML_WE1_2026,
  "sc-cloonee-clooneeb2bprospa": TL_CLOONEE_PROSPA_DESTINO_2026,
  "sc-itsthewestend-westend-live-edc-2026": TL_WESTEND_EDC_LV_2026,
  "sc-cidmusic-cid-edc-lv-2017": TL_CID_EDC_LV_2017,
  "yt-yXHoHK_jQvc": TL_AHEE_LIQUID_STRANGER_EDC_LV_2026,
  "yt-dXBoIY65P8s": TL_DARUDE_EDC_LV_2026,
};

/** Sanity: every seeded clock must parse. */
export function assertSeedClocks(rows: FingerprintSeedRow[]): void {
  for (const r of rows) {
    if (parseClockToSec(r.at) == null) {
      throw new Error(`bad 1001tl clock: ${r.at} (${r.artist} - ${r.title})`);
    }
  }
}
