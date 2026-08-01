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
 * 1001TL: https://1001.tl/xh6t5uk — operator console capture 2026-08-01
 * (1/26 DOM cues). Anchors: Like You A Lot @ 20:59 (1001), Proper Education
 * @ 29:48 (screenshot); rest interpolated across ~59:12.
 */
export const TL_WESTEND_EDC_LV_2026: FingerprintSeedRow[] =
  interpolateMissingClocks(
    [
      {
        at: "0:00",
        artist: "Glass Petals ft. Sophiegrophy",
        title: "We Stay Inside",
      },
      {
        artist: "Diplo & SIDEPIECE vs. Westend",
        title: "On My Mind vs. Freaky Time (Westend Mashup)",
      },
      { artist: "Diplo & SIDEPIECE", title: "On My Mind" },
      { artist: "Westend", title: "Freaky Time" },
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
        artist: "Westend ft. Hosanna",
        title: "Drum Death (DENNETT Remix)",
      },
      {
        artist: "VNSSA & Sian & Sacha Robotti",
        title: "Smalltown Girl",
      },
      { artist: "Westend & Dave Summer", title: "Love Spell" },
      {
        at: "20:59",
        artist: "Vanrip & Truth x Lies ft. WEiRD GRRL",
        title: "Like You A Lot",
      },
      {
        artist: "Dansyn vs. Noizu & Westend & No/Me",
        title: "Bang That vs. Push To Start (Westend Edit)",
      },
      {
        artist: "Noizu & Westend ft. No/Me",
        title: "Push To Start",
      },
      { artist: "Dansyn", title: "Bang That" },
      { artist: "Westend & Twin Diplomacy", title: "Sensational" },
      {
        at: "29:48",
        artist: "Eric Prydz vs. Pink Floyd",
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
      {
        artist: "Richard Vission & Static Revenger ft. Luciana",
        title: "I Like That (Acappella)",
      },
      { artist: "Westend ft. Lizzy Land", title: "Surrender" },
      { artist: "BRANDON", title: "My Body Talks" },
      {
        artist: "Congorock ft. Mr. Lexx",
        title:
          "Babylon (David Guetta & MARTEN HØRGER pres. Men Machine & KENZ Rework)",
      },
      {
        artist: "Westend & Olivia Sebastianelli",
        title: "The Ceiling",
      },
      {
        artist: "deadmau5 ft. Rob Swire",
        title: "Ghosts 'n' Stuff (Luke Alexander Remix)",
      },
      { at: "59:12", artist: "Westend", title: "Feels Better" },
    ],
    3552,
  );

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

/**
 * Bleu Clair @ stereoBLOOM, EDC Las Vegas 2023-05-19
 * Official YT: https://www.youtube.com/watch?v=c_sx3zum8Z0 (~60:50)
 * Official SC: https://soundcloud.com/bleuclair/edclv2023
 * 1001TL: https://1001.tl/283zdwmt — operator console capture 2026-08-01
 * (17/20 timed cues; gaps interpolated).
 */
export const TL_BLEU_CLAIR_EDC_LV_2023: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Bleu Clair", title: "Mean Sumthin" },
  {
    at: "6:45",
    artist: "Chris Lake & Chris Lorenzo pres. Anti Up",
    title: "Right Now (Bleu Clair Remix)",
  },

  { at: "10:30", artist: "Bleu Clair & Dances", title: "Peanut Butter" },
  {
    at: "14:15",
    artist: "Pitbull ft. Trina & Young Bo$$",
    title: "Go Girl (Bleu Clair Edit)",
  },
  { at: "17:34", artist: "Bleu Clair", title: "Sand Dunes" },
  {
    at: "21:49",
    artist: "Groove Armada",
    title: "Superstylin' (Bleu Clair Edit)",
  },
  {
    at: "25:34",
    artist: "Bleu Clair & OOTORO ft. Chyra",
    title: "Killer Bee",
  },
  { at: "28:49", artist: "Bleu Clair", title: "m.A.A.d City" },
  { at: "32:04", artist: "Bleu Clair", title: "The Rhythm" },
  {
    at: "35:12",
    artist: "Bleu Clair & OOTORO",
    title: "Beat Like This (VIP)",
  },
  { at: "36:55", artist: "Bleu Clair ft. Jelita", title: "Have Me All" },
  {
    at: "38:42",
    artist: "MK ft. Carla Munroe",
    title: "17 (Bleu Clair Remix)",
  },
  { at: "42:12", artist: "Bleu Clair", title: "Samsara" },
  {
    at: "46:20",
    artist: "Matroda & Bleu Clair",
    title: "Disco Tool (VIP)",
  },
  {
    at: "47:35",
    artist: "Matroda & Bleu Clair",
    title: "Disco Tool (OOTORO Remix)",
  },
  { at: "48:35", artist: "Bleu Clair", title: "Step Into It" },
  { at: "51:57", artist: "Bleu Clair", title: "In My Mind" },
  {
    at: "57:17",
    artist: "Bleu Clair",
    title: "Mistake vs. Hyperspace (Bleu Clair Mashup)",
  },
  {
    at: "58:24",
    artist: "Bleu Clair ft. Teza Sumendra",
    title: "Hyperspace",
  },
  { at: "59:30", artist: "Bleu Clair", title: "Mistake" },
];

/**
 * Wax Motif @ cosmicMEADOW, EDC Las Vegas 2021-10-24
 * Official SC: https://soundcloud.com/waxmotif/wax-motif-live-edc-2021 (~57:33)
 * 1001TL: https://1001.tl/2pzx4mbk — operator console capture 2026-08-01
 * (25/25 timed cues).
 */
export const TL_WAX_MOTIF_EDC_LV_2021: FingerprintSeedRow[] = [
  { at: "0:01", artist: "23", title: "Pink Soldiers (Squid Game OST)" },
  {
    at: "3:19",
    artist: "Drake ft. Future & Young Thug",
    title: "Way 2 Sexy (Valentino Khan Remix)",
  },
  {
    at: "4:36",
    artist: "J Balvin & Skrillex",
    title: "In Da Getto (Chris Lorenzo Remix)",
  },
  { at: "7:48", artist: "Trikshaw", title: "Skylift" },
  { at: "8:53", artist: "Malaa", title: "Who I Am" },
  { at: "12:50", artist: "Nelly", title: "Hot In Herre" },
  {
    at: "16:50",
    artist: "Chris Lorenzo ft. High Jinx",
    title: "California Dreamin'",
  },
  {
    at: "19:49",
    artist: "Wax Motif & Shahay ft. Scrufizzer",
    title: "Come Again",
  },
  {
    at: "22:57",
    artist: "Wax Motif",
    title: "Keep Raving (Qlank Remix)",
  },
  { at: "26:00", artist: "Honey & Badger & Hooders", title: "Fuse" },
  { at: "28:10", artist: "MPH", title: "Barrington" },
  {
    at: "29:29",
    artist: "Wax Motif & ALRT & Nessly",
    title: "Hard Street",
  },
  {
    at: "31:21",
    artist: "Chris Lake & Chris Lorenzo pres. Anti Up",
    title: "Something's About To Go Down",
  },
  {
    at: "33:35",
    artist: "Matroda & Sage Armstrong & Rhiannon Roze",
    title: "Ur Mind",
  },
  { at: "35:36", artist: "BassBoy", title: "Got A Groove" },
  {
    at: "37:44",
    artist: "AC Slater & Chris Lorenzo",
    title: "Fly With Us",
  },
  {
    at: "39:18",
    artist: "Taiki Nulight & Wax Motif ft. Scrufizzer",
    title: "Skank N Flex",
  },
  { at: "41:04", artist: "Busta Rhymes", title: "Touch It" },
  { at: "42:53", artist: "Wax Motif", title: "Wet" },
  { at: "44:33", artist: "KOHMI", title: "San Francisco" },
  {
    at: "45:36",
    artist: "AC Slater & Chris Lorenzo",
    title: "Fly Kicks (Wax Motif Remix)",
  },
  {
    at: "49:01",
    artist: "Wax Motif ft. Diddy",
    title: "Divided Souls",
  },
  {
    at: "53:49",
    artist: "RÜFÜS DU SOL",
    title: "Innerbloom (H.O.S.H. Remix)",
  },
  {
    at: "56:14",
    artist: "Chris Lake & Chris Lorenzo pres. Anti Up",
    title: "Shake",
  },
  {
    at: "57:15",
    artist: "Wax Motif & Phlegmatic Dogs",
    title: "Need You",
  },
];

/**
 * Cloonee @ stereoBLOOM, EDC Las Vegas 2022-05-21
 * Official SC: https://soundcloud.com/cloonee/cloonee-edc-2022 (~61:52)
 * 1001TL: https://1001.tl/1r9qsbg1 — operator console capture 2026-08-01
 * (14/15 timed cues).
 */
export const TL_CLOONEE_EDC_LV_2022: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Cloonee", title: "Fine Night" },
  { at: "6:05", artist: "Piero Pirupa", title: "Bass Club" },
  { at: "10:18", artist: "Sante Sansone", title: "Looking For Something" },
  { at: "11:48", artist: "Cloonee", title: "Lose Control" },
  { at: "16:03", artist: "Jamie Coins", title: "Still Flexin'" },
  {
    at: "19:40",
    artist: "Chris Lake ft. Alexis Roberts",
    title: "Turn Off The Lights (Cloonee Remix)",
  },
  { at: "23:55", artist: "BeMore & Wøvex", title: "Ma Love" },
  { at: "27:51", artist: "Shokë", title: "Coast To Coast" },
  { at: "30:53", artist: "Chris Lake & Cloonee", title: "Nightmares" },
  { at: "35:24", artist: "Trace", title: "G.L.A.M" },
  { at: "38:53", artist: "Cloonee & Brisotti", title: "Tripasia" },
  { at: "43:23", artist: "Cloonee & Wade", title: "Mi Amor" },
  { at: "47:53", artist: "Yungness & Jaminn", title: "Backroom" },
  { at: "50:23", artist: "Cloonee", title: "Love You Like That" },
  { at: "58:53", artist: "Cloonee", title: "Sun Goes Down" },
];

/**
 * Odd Mob @ cosmicMEADOW, EDC Las Vegas 2025-05-17
 * Official SC: https://soundcloud.com/oceanologymusic/odd-mob-live-at-edc-las-vegas-2025-cosmic-meadow-day-2-3 (~59:10)
 * 1001TL: https://1001.tl/2cz5c0h1 — operator console capture 2026-08-01
 * (19/29 timed cues; gaps interpolated).
 */
export const TL_ODD_MOB_EDC_LV_2025: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Odd Mob ft. Ed Graves", title: "Vertigo" },
  {
    at: "3:10",
    artist: "Tiësto & Odd Mob & GOODBOYS",
    title: "Won't Be Possible",
  },
  {
    at: "6:00",
    artist: "Cloonee & InntRaw & Young M.A",
    title: "Stephanie (Odd Mob Remix)",
  },
  {
    at: "8:30",
    artist: "Odd Mob",
    title: "Dancing Boys, Dancing Girls",
  },
  { at: "11:40", artist: "TOYZZ", title: "SexyBack" },
  {
    at: "15:40",
    artist: "ROB49",
    title: "WTHELLY (Julian Jordan Remix)",
  },
  {
    at: "18:20",
    artist: "Odd Mob & OMNOM pres. HYPERBEAM",
    title: "System",
  },
  { at: "19:55", artist: "Odd Mob", title: "LEFT TO RIGHT" },
  {
    at: "21:30",
    artist: "SIDEPIECE & Bobby Shmurda",
    title: "CASH OUT",
  },
  {
    at: "24:00",
    artist: "Adam Beyer & Green Velvet",
    title: "Simulator (Odd Mob Remix)",
  },
  {
    at: "25:15",
    artist: "Fred again.. & Swedish House Mafia ft. Future",
    title: "Turn On The Lights Again..",
  },
  {
    at: "26:30",
    artist: "Odd Mob ft. Lizzy Land",
    title: "Never Alone",
  },
  { at: "30:00", artist: "Dom Dolla ft. Daya", title: "Dreamin" },
  { at: "31:25", artist: "Space 92", title: "Orbit Motion" },
  {
    at: "32:50",
    artist: "Kerri Chandler & Spank Rock",
    title: "Planet Sonic vs. Bump (Odd Mob Edit)",
  },
  {
    at: "36:10",
    artist: "BYOR & Angel Janson",
    title: "Saving It All",
  },
  { at: "37:07", artist: "Dom Dolla", title: "Saving Up" },
  { at: "38:04", artist: "Lola Young", title: "Messy" },
  {
    at: "39:00",
    artist: "John Summit & venbee",
    title: "palm of my hands (Odd Mob Remix)",
  },
  { at: "41:05", artist: "33 Below", title: "Mash Up" },
  {
    at: "43:10",
    artist: "Sean Paul & Odd Mob",
    title: "Get Busy (Odd Mob Club Mix)",
  },
  {
    at: "46:00",
    artist: "Odd Mob & OMNOM pres. HYPERBEAM",
    title: "Coming Up (It's Dare)",
  },
  {
    at: "49:00",
    artist: "Odd Mob",
    title: "Don't Stop Make That Body Rock",
  },
  {
    at: "51:40",
    artist: "Basement Jaxx",
    title: "Where's Your Head At? (OMNOM Flip)",
  },
  { at: "53:30", artist: "Odd Mob & OMNOM", title: "Losing Control" },
  { at: "54:30", artist: "Odd Mob", title: "LEFT TO RIGHT" },
  { at: "55:30", artist: "Odd Mob & OMNOM", title: "Losing Control" },
  { at: "56:30", artist: "Combine & MYTHM", title: "OLD SCHOOL" },
  { at: "59:30", artist: "Chris Lake & Ragie Ban", title: "Toxic" },
];

/**
 * Layton Giordani @ circuitGROUNDS closing, EDC Las Vegas 2025-05-16
 * Official SC: https://soundcloud.com/laytongiordani/layton-giordani-live-edc-las-vegas-circuit-grounds-closing-set-2025 (~59:40)
 * 1001TL: https://1001.tl/bt007st — operator console capture 2026-08-01
 * (21/21 timed cues).
 */
export const TL_LAYTON_GIORDANI_EDC_LV_2025_CLOSING: FingerprintSeedRow[] = [
  {
    at: "3:10",
    artist: "Skrillex",
    title: "Scary Monsters And Nice Sprites (Layton Giordani Remix)",
  },
  { at: "3:54", artist: "Sikdope & Belle Sisoski", title: "RATS" },
  {
    at: "5:50",
    artist: "Sharam",
    title:
      "PATT (Party All The Time) (Adam Beyer & Layton Giordani & Green Velvet Remix)",
  },
  { at: "9:07", artist: "ZHU", title: "Faded (Seth Hills Remix)" },
  {
    at: "11:45",
    artist: "Layton Giordani & Green Velvet",
    title: "When It Kicks",
  },
  { at: "14:55", artist: "Cirez D", title: "On Off" },
  {
    at: "15:48",
    artist: "Chris Lake ft. Alexis Roberts",
    title: "Turn Off The Lights",
  },
  {
    at: "17:00",
    artist: "David Guetta & Steve Aoki ft. Swae Lee & PnB Rock",
    title: "My Life (Krupa Remix)",
  },
  {
    at: "20:30",
    artist: "Layton Giordani ft. Linney & Sarah de Warren",
    title: "Act Of God",
  },
  { at: "24:30", artist: "Chris Avantgarde", title: "Energy" },
  {
    at: "28:00",
    artist: "Dom Dolla",
    title: "girl$ (Layton Giordani Remix)",
  },
  { at: "31:40", artist: "Neumann & Bendtsen", title: "Phantom Express" },
  {
    at: "31:41",
    artist: "Tiga vs. Audion",
    title: "Let's Go Dancing (Acappella)",
  },
  {
    at: "34:10",
    artist: "Shakedown",
    title: "At Night (Anyma & Layton Giordani Remix)",
  },
  { at: "37:40", artist: "SCRIPT", title: "WTF" },
  {
    at: "40:50",
    artist: "Max Styler & Three Drives",
    title: "Greece 2000 (Max Styler Rework)",
  },
  {
    at: "41:36",
    artist: "Artemas",
    title: "i like the way you kiss me",
  },
  {
    at: "43:10",
    artist: "Layton Giordani ft. LINNEY & Sarah de Warren",
    title: "Act Of God (CamelPhat Remix)",
  },
  {
    at: "47:30",
    artist: "Loofy",
    title: "Last Night (Anyma & Layton Giordani Remix)",
  },
  {
    at: "51:30",
    artist: "Fatima Yamaha",
    title: "What's A Girl To Do (Layton Giordani Remix)",
  },
  {
    at: "55:35",
    artist: "Kaskade ft. Skylar Grey",
    title: "Room For Happiness (Layton Giordani Remix)",
  },
];

/**
 * Max Styler @ stereoBLOOM, EDC Las Vegas 2024-05-17
 * Official SC: https://soundcloud.com/maxstyler/max-styler-live-edc-vegas-2024 (~58:56)
 * 1001TL: https://1001.tl/2syc45z9 — operator console capture 2026-08-01
 * (16/20 timed cues; gaps interpolated).
 */
export const TL_MAX_STYLER_EDC_LV_2024: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Max Styler", title: "Lights Out" },
  { at: "4:00", artist: "Max Styler & Gorgon City", title: "Touch" },
  { at: "7:00", artist: "Max Styler", title: "Time To Go" },
  {
    at: "11:00",
    artist: "Max Styler vs. Tiga & Audion",
    title: "Hypnotic vs. Let's Go Dancing (Max Styler Edit)",
  },
  {
    at: "12:00",
    artist: "Tiga vs. Audion",
    title: "Let's Go Dancing (Acappella)",
  },
  { at: "13:00", artist: "Max Styler", title: "Hypnotic" },
  {
    at: "14:00",
    artist: "Adam Ten & Maori",
    title: "Spring Girl (Max Styler Remix)",
  },
  { at: "17:10", artist: "Arude", title: "Your Move" },
  {
    at: "20:25",
    artist: "Westend & Max Styler",
    title: "Rhythm Machine",
  },
  {
    at: "24:05",
    artist: "Max Styler & FRANCO BA",
    title: "Rock The House",
  },
  { at: "27:45", artist: "Loofy", title: "Last Night" },
  { at: "30:45", artist: "Max Styler", title: "Kiki" },
  { at: "34:00", artist: "Cloonee", title: "Sippin' Yak" },
  { at: "35:38", artist: "Clüb De Combat", title: "Exciter" },
  {
    at: "37:15",
    artist: "Max Styler & Vintage Culture & Ali Love",
    title: "Freaky 1",
  },
  {
    at: "40:40",
    artist: "Chris Lake & Green Velvet",
    title: "Deceiver (Max Styler Remix)",
  },
  { at: "43:40", artist: "Max Styler", title: "Follow Me" },
  {
    at: "47:20",
    artist: "Max Styler & GENESI",
    title: "See You Sweat",
  },
  {
    at: "52:10",
    artist: "Pleasurekraft",
    title: "Tarantula (Max Styler Remix)",
  },
  {
    at: "55:40",
    artist: "Dom Dolla & Max Styler",
    title: "Work It",
  },
];

/**
 * Dom Dolla @ circuitGROUNDS, EDC Las Vegas 2023-05-20
 * Official SC: https://soundcloud.com/domdolla/dom-dolla-live-edc-las-vegas-2023 (~71:26)
 * 1001TL: https://1001.tl/1w0hwttk — operator console capture 2026-08-01
 * (24/32 timed cues; gaps interpolated).
 */
export const TL_DOM_DOLLA_EDC_LV_2023: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Afrojack", title: "Pacha On Acid" },
  {
    at: "0:45",
    artist: "Who Da Funk ft. Jessica Eve",
    title: "Shiny Disco Balls",
  },
  {
    at: "1:30",
    artist: "Chris Lake ft. Aatig",
    title: "In The Yuma (Martin Ikin Remix)",
  },
  {
    at: "3:20",
    artist: "Da Hool",
    title: "Meet Her At The Love Parade (Dom Dolla & Torren Foot Remix)",
  },
  {
    at: "4:25",
    artist: "Faithless",
    title: "Insomnia (Acappella)",
  },
  {
    at: "5:30",
    artist: "CamelPhat & Dom Dolla",
    title: "Hood No Riff",
  },
  { at: "7:20", artist: "Dom Dolla", title: "Take It" },
  {
    at: "9:10",
    artist: "Walker & Royce & Nala",
    title: "Not About You",
  },
  { at: "11:10", artist: "Odd Mob", title: "XTC" },
  {
    at: "12:30",
    artist: "Nick Coleman",
    title: "Faces Of Meth (Holmes John Remix)",
  },
  {
    at: "14:10",
    artist: "Fergie DJ",
    title: "Here Comes That Sound",
  },
  { at: "16:10", artist: "Dom Dolla", title: "San Frandisco" },
  {
    at: "18:10",
    artist: "Airwolf Paradise ft. Paul Johnson",
    title: "Only Man",
  },
  { at: "21:37", artist: "Chris Lorenzo", title: "Every Morning" },
  {
    at: "23:55",
    artist: "John Summit ft. HAYLA",
    title: "Where You Are (Gorgon City Remix)",
  },
  { at: "27:30", artist: "Zonderling", title: "Variant" },
  {
    at: "29:30",
    artist: "RÜFÜS DU SOL",
    title: "Make It Happen (Dom Dolla Remix)",
  },
  { at: "33:08", artist: "Odd Mob", title: "Give You" },
  { at: "34:28", artist: "Dom Dolla", title: "Take It" },
  { at: "35:48", artist: "MK & Dom Dolla", title: "Rhyme Dust" },
  {
    at: "39:43",
    artist: "Øostil & Juan Hansen",
    title: "Drown (Massano Remix)",
  },
  {
    at: "44:15",
    artist: "Eric Prydz vs. Wankelmut & Emma Louise & MK",
    title: "Pjanoo vs. My Head Is A Jungle (Hayden James Edit)",
  },
  { at: "45:37", artist: "Eric Prydz", title: "Pjanoo" },
  {
    at: "46:59",
    artist: "Wankelmut & Emma Louise",
    title: "My Head Is A Jungle (MK Remix)",
  },
  { at: "48:20", artist: "MEDUZA", title: "Friends" },
  { at: "50:50", artist: "Mau P", title: "Your Mind Is Dirty" },
  {
    at: "54:20",
    artist: "Walker & Royce & Glass Petals & ELOHIM",
    title: "Stop Time",
  },
  { at: "56:35", artist: "Dom Dolla", title: "San Frandisco" },
  { at: "1:00:18", artist: "Eli Brown", title: "Diamonds On My Mind" },
  { at: "1:03:30", artist: "FOVOS", title: "Lollipop" },
  {
    at: "1:05:25",
    artist: "Dom Dolla ft. Clementine Douglas",
    title: "Miracle Maker",
  },
  {
    at: "1:09:42",
    artist: "MK & Dom Dolla",
    title: "Rhyme Dust (Dimension Remix)",
  },
];

/**
 * Dom Dolla @ circuitGROUNDS, EDC Las Vegas 2024-05-18
 * Official SC: https://soundcloud.com/domdolla/dom-dolla-live-edc-circuitgrounds-las-vegas-2024 (~61:21)
 * 1001TL: https://1001.tl/24gpuclk — operator console capture 2026-08-01
 * (27/35 timed cues; gaps interpolated).
 */
export const TL_DOM_DOLLA_EDC_LV_2024: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Dom Dolla", title: "girl$" },
  {
    at: "4:17",
    artist: "Solardo & Volaris ft. Camden Cox",
    title: "Eyes",
  },
  {
    at: "6:40",
    artist: "Walker & Royce & Barney Bones",
    title: "Cheap Thrills",
  },
  { at: "8:46", artist: "Dom Dolla", title: "You" },
  {
    at: "10:51",
    artist: "Walker & Royce & Reggie Watts",
    title: "Motivashun",
  },
  {
    at: "13:14",
    artist: "Phil Kieran vs. MK & Dom Dolla",
    title: "Skyhook 2 vs. Rhyme Dust (Dom Dolla Edit)",
  },
  { at: "13:39", artist: "Phil Kieran", title: "Skyhook 2" },
  { at: "14:04", artist: "MK & Dom Dolla", title: "Rhyme Dust" },
  {
    at: "14:28",
    artist: "The Prodigy",
    title: "Breathe (James Hype Edit)",
  },
  {
    at: "16:05",
    artist: "Odd Mob & OMNOM pres. HYPERBEAM",
    title: "Okay Fine",
  },
  {
    at: "20:51",
    artist: "Zombie Nation",
    title: "Kernkraft 400 (James Hype Remix)",
  },
  {
    at: "21:50",
    artist: "Loofy",
    title: "Last Night (Anyma & Layton Giordani Remix)",
  },
  {
    at: "23:28",
    artist: "Dom Dolla & Nelly Furtado",
    title: "Eat Your Man",
  },
  { at: "26:05", artist: "Nari & Milani", title: "Atom" },
  { at: "26:52", artist: "Mia Mendi & TH;EN", title: "Collapsing Sky" },
  { at: "27:53", artist: "Dom Dolla", title: "Take It" },
  {
    at: "28:54",
    artist: "John Summit & HAYLA",
    title: "Shiver (Luca Morris Remix)",
  },
  {
    at: "30:52",
    artist: "Max Styler & GENESI",
    title: "See You Sweat",
  },
  { at: "32:24", artist: "Dom Dolla", title: "San Frandisco" },
  {
    at: "33:55",
    artist: "Rebūke ft. Linska",
    title: "Digital Dream",
  },
  {
    at: "35:46",
    artist: "Gotye ft. Kimbra",
    title: "Somebody That I Used To Know (SIDEPIECE Treat)",
  },
  {
    at: "38:42",
    artist: "Congorock ft. Mr. Lexx",
    title: "Babylon (Dom Dolla Edit)",
  },
  { at: "40:07", artist: "Faith Evans", title: "Love Like This" },
  {
    at: "41:36",
    artist: "The Chemical Brothers",
    title: "Hey Boy, Hey Girl (ARTBAT Remix)",
  },
  {
    at: "43:46",
    artist: "Aliyah's Interlude",
    title: "IT GIRL (Everything Always Remix)",
  },
  { at: "45:58", artist: "HI-LO & Eli Brown", title: "Pyramid Rave" },
  {
    at: "47:41",
    artist: "Technotronic",
    title: "Pump Up The Jam (Acappella)",
  },
  {
    at: "49:23",
    artist: "Kendrick Lamar",
    title: "Swimming Pools (Drank) (Danny Avila Remix)",
  },
  {
    at: "52:29",
    artist: "Dom Dolla",
    title: "Saving Up (Odd Mob Remix)",
  },
  { at: "55:48", artist: "BYOR", title: "Thunder" },
  {
    at: "56:44",
    artist: "Dom Dolla ft. Clementine Douglas",
    title: "Miracle Maker",
  },
  {
    at: "57:40",
    artist: "Benny Benassi pres. The Biz",
    title: "Satisfaction (MORRILL Edit)",
  },
  { at: "59:09", artist: "Tavatli", title: "FE!N" },
  {
    at: "1:02:05",
    artist: "Dom Dolla & Nelly Furtado",
    title: "Eat Your Man (Eli Brown Remix)",
  },
  {
    at: "1:04:17",
    artist: "Dom Dolla & Tove Lo",
    title: "CAVE",
  },
];

/** sourceSlug → curated 1001TL seed (SC / YT when live HTML is CF-blocked). */
export const TRACKLIST_1001_BY_SOURCE_SLUG: Record<
  string,
  FingerprintSeedRow[]
> = {
  "sc-charlottedewittemusic-charlotte-de-witte-at":
    TL_CHARLOTTE_DE_WITTE_TML_WE1_2026,
  "sc-cloonee-clooneeb2bprospa": TL_CLOONEE_PROSPA_DESTINO_2026,
  "sc-cloonee-cloonee-edc-2022": TL_CLOONEE_EDC_LV_2022,
  "sc-itsthewestend-westend-live-edc-2026": TL_WESTEND_EDC_LV_2026,
  "sc-cidmusic-cid-edc-lv-2017": TL_CID_EDC_LV_2017,
  "sc-bleuclair-edclv2023": TL_BLEU_CLAIR_EDC_LV_2023,
  "sc-waxmotif-wax-motif-live-edc-2021": TL_WAX_MOTIF_EDC_LV_2021,
  "sc-oceanologymusic-odd-mob-live-at-edc-las-vegas-2025-cosmic-meadow-day-2-3":
    TL_ODD_MOB_EDC_LV_2025,
  "sc-laytongiordani-layton-giordani-live-edc-las-vegas-circuit-grounds-closing-set-2025":
    TL_LAYTON_GIORDANI_EDC_LV_2025_CLOSING,
  "sc-maxstyler-max-styler-live-edc-vegas-2024": TL_MAX_STYLER_EDC_LV_2024,
  "sc-domdolla-dom-dolla-live-edc-las-vegas-2023": TL_DOM_DOLLA_EDC_LV_2023,
  "sc-domdolla-dom-dolla-live-edc-circuitgrounds-las-vegas-2024":
    TL_DOM_DOLLA_EDC_LV_2024,
  "yt-yXHoHK_jQvc": TL_AHEE_LIQUID_STRANGER_EDC_LV_2026,
  "yt-dXBoIY65P8s": TL_DARUDE_EDC_LV_2026,
  "yt-c_sx3zum8Z0": TL_BLEU_CLAIR_EDC_LV_2023,
};

/** Sanity: every seeded clock must parse. */
export function assertSeedClocks(rows: FingerprintSeedRow[]): void {
  for (const r of rows) {
    if (parseClockToSec(r.at) == null) {
      throw new Error(`bad 1001tl clock: ${r.at} (${r.artist} - ${r.title})`);
    }
  }
}
