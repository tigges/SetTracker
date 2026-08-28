import type { FingerprintSeedRow } from "../fingerprint/seeds";

/**
 * Anyma & Solomun @ Mainstage, Ultra Music Festival Miami, United States 2025-03-29
 * Official YouTube: https://youtu.be/1TN78OJjJT0
 * oEmbed 2026-08-28: channel "Anyma" (@anyma_ofc), title "Anyma b2b Solomun
 * [Live at Ultra Music Festival Miami 2025]". That video was already curated
 * in YOUTUBE_SETS without a tracklist, so this capture fills an existing set.
 * https://www.1001tracklists.com/tracklist/2wrb6cmk/anyma-solomun-mainstage-ultra-music-festival-miami-united-states-2025-03-29.html
 * Overlay name TL_ANYMA is too generic; constant is the performance.
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-1TN78OJjJT0"] = TL_ANYMA_SOLOMUN_ULTRA_MIAMI_MAINSTAGE_2025
 * soundcloud.com/edmfamilylivesets2025/anyma-b2b-solomun-live-ultra-music-festival-2025-miami-day2
 * and hearthis.at/razorator/anymab2bsolomun-live-atultramusicfestivalmiami29-03-2025-razorator
 * are fan reuploads — do not wire as sourceUrl / playback /
 * TRACKLIST_1001_BY_SOURCE_SLUG.
 * Kept "ID ID — Push That" (named title, not a bare ID–ID). Mashup at 48:22
 * is followed by its two components; clocks stay as captured.
 * Captured 2026-08-28 — provenance 1001tl.
 */
export const TL_ANYMA_SOLOMUN_ULTRA_MIAMI_MAINSTAGE_2025: FingerprintSeedRow[] = [
  { at: "0:15", artist: "Shakedown", title: "At Night (Anyma & Layton Giordani Remix)" },
  { at: "4:13", artist: "Deomid", title: "Twisted" },
  { at: "7:15", artist: "Goom Gum", title: "To Trajadao" },
  { at: "10:19", artist: "Noir & Haze", title: "Around" },
  { at: "15:05", artist: "Adapter", title: "Catchaman" },
  { at: "18:17", artist: "GENESI", title: "Hyper" },
  { at: "21:07", artist: "Cassian & SCRIPT & Belladonna", title: "Where I'm From" },
  { at: "24:54", artist: "Alexander Delanois", title: "Bad Mad" },
  { at: "28:14", artist: "Anyma & Argy & Son Of Son", title: "Voices In My Head" },
  { at: "31:05", artist: "Anyma & Solomun ft. Claudia Valentina", title: "Till I Die" },
  { at: "35:08", artist: "The Chemical Brothers", title: "Do It Again (Massano Remix)" },
  { at: "38:35", artist: "Mau P", title: "People Talk People Sing" },
  { at: "41:52", artist: "Kevin de Vries & Jast", title: "Born Like That" },
  {
    at: "44:36",
    artist: "Felix Da Housecat ft. Miss Kittin",
    title: "Silver Screen Shower Scene (Alexander Delanois Private Mix)",
  },
  {
    at: "48:22",
    artist: "Jimi Jules & Anyma & Cassian vs. Joshlane",
    title: "My City's On Fire vs. System Overload (Cassian Mashup)",
  },
  { at: "49:26", artist: "Jimi Jules", title: "My City's On Fire (Anyma & Cassian Remix)" },
  { at: "50:30", artist: "Joshlane", title: "System Overload" },
  {
    at: "51:33",
    artist: "Mångata Projekt",
    title: "Don't You Tell Me To Stop (Intergalactic Rework)",
  },
  { at: "54:11", artist: "Dom Dolla ft. Daya", title: "Dreamin (Anyma Remix)" },
  { at: "56:30", artist: "K.I.Z", title: "Samstag Ist Krieg (Solomun Dub Remix)" },
  { at: "1:00:55", artist: "Max Styler & Three Drives", title: "Greece 2000 (Max Styler Rework)" },
  { at: "1:03:55", artist: "Matt", title: "One More Time" },
  { at: "1:07:54", artist: "Matt & Juan Brizuela", title: "Vertigo" },
  { at: "1:11:16", artist: "Empire Of The Sun", title: "We Are The People (Adam Sellouk Remix)" },
  { at: "1:13:14", artist: "Massano", title: "The Feeling (2022 Remaster)" },
  { at: "1:15:12", artist: "ID ID", title: "Push That" },
  { at: "1:19:27", artist: "Cassian & YOTTO & Da Hool", title: "Love Parade" },
  {
    at: "1:21:37",
    artist: "Cassius ft. Steve Edwards",
    title: "The Sound Of Violence (Final Request Remix)",
  },
  { at: "1:26:00", artist: "Aaron Hibell", title: "running up that hill" },
  { at: "1:26:42", artist: "TouchTalk", title: "Change It" },
];

/**
 * Oscar And The Wolf @ Crystal Garden Stage, Tomorrowland Weekend 1, Belgium 2026-07-19
 * Official YouTube: https://youtu.be/Ty03QjFnL90
 * oEmbed 2026-08-28: channel "Tomorrowland" (@tomorrowland), title
 * "Oscar and the Wolf WE1 | Tomorrowland 2026".
 * https://www.1001tracklists.com/tracklist/1shz3hut/oscar-the-wolf-crystal-garden-stage-tomorrowland-weekend-1-belgium-2026-07-19.html
 * Overlay name TL_OSCAR is too generic; constant is the performance.
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-Ty03QjFnL90"] = TL_OSCAR_AND_THE_WOLF_TML_WE1_CRYSTAL_2026
 * No SoundCloud in the paste — do not invent an SC slug.
 * Distinct from other Crystal Garden WE1 captures (Blondish, Camila Jun).
 * Captured 2026-08-28 — provenance 1001tl.
 */
export const TL_OSCAR_AND_THE_WOLF_TML_WE1_CRYSTAL_2026: FingerprintSeedRow[] = [
  { at: "2:11", artist: "Oscar And The Wolf", title: "Universe" },
  { at: "4:43", artist: "Charli xcx", title: "Everything Is Romantic (Oscar And The Wolf Bootleg)" },
  { at: "7:40", artist: "Oscar And The Wolf", title: "Never Felt This" },
  { at: "10:07", artist: "Oscar And The Wolf", title: "You're Mine" },
  { at: "15:40", artist: "Oscar And The Wolf", title: "Think About You" },
  { at: "19:05", artist: "Oscar And The Wolf", title: "Forever Alone" },
  { at: "24:12", artist: "Stromae", title: "Papa Ou T'es (Oscar And The Wolf Bootleg)" },
  { at: "25:40", artist: "Oscar And The Wolf", title: "I Really Love Him" },
  { at: "27:51", artist: "Oscar And The Wolf", title: "Break Away" },
  { at: "31:29", artist: "Oscar And The Wolf", title: "Losing My Religion" },
  { at: "35:47", artist: "Oscar And The Wolf", title: "Blue (Voyage Voyage Edit)" },
  { at: "39:04", artist: "Oscar And The Wolf", title: "Who's The Guy" },
  { at: "41:53", artist: "Oscar And The Wolf", title: "Wish You Were Here" },
  { at: "45:28", artist: "Oscar And The Wolf", title: "Vanilla" },
  { at: "48:11", artist: "Roméo Elvis & Oscar & The Wolf", title: "Fading Into You (Show Me Love Edit)" },
  { at: "51:05", artist: "Oscar And The Wolf", title: "Uforia" },
  { at: "53:52", artist: "Oscar And The Wolf", title: "Cabriolet (Pour It Up Edit)" },
  { at: "56:48", artist: "Oscar And The Wolf", title: "Strange Entity" },
];
