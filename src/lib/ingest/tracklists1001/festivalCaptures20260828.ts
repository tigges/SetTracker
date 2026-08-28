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

/**
 * Agents Of Time @ Mainstage, Tomorrowland Weekend 2, Belgium 2026-07-25
 * Official YouTube: https://youtu.be/5GyoClE4Q8o
 * oEmbed 2026-08-28: channel "Tomorrowland" (@tomorrowland), title
 * "Agents Of Time WE2 | Tomorrowland 2026".
 * https://www.1001tracklists.com/tracklist/hjlpktt/agents-of-time-mainstage-tomorrowland-weekend-2-belgium-2026-07-25.html
 * Overlay name TL_AGENTS_OF_TIME is too generic and would collide with
 * TL_AGENTS_OF_TIME_TIME_WARP_FLOOR_1_2026 (official SC, different night).
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-5GyoClE4Q8o"] = TL_AGENTS_OF_TIME_TML_WE2_MAINSTAGE_2026
 * No SoundCloud in the paste — do not invent an SC slug. Do not attach this
 * list to sc-agents-of-time-agents-of-time-time-warp-full.
 * 3:48 → 17:35 gap kept as captured (not even-spaced).
 * Captured 2026-08-28 — provenance 1001tl.
 */
export const TL_AGENTS_OF_TIME_TML_WE2_MAINSTAGE_2026: FingerprintSeedRow[] = [
  { at: "0:13", artist: "Agents Of Time", title: "Forever" },
  { at: "3:48", artist: "AZAD & Jast & RYCH DSYGNR", title: "Yatabala" },
  { at: "17:35", artist: "Stylo & Q.U.A.K.E & Eli & Dani", title: "On The Ground" },
  { at: "20:14", artist: "Felix Da Housecat ft. Miss Kittin", title: "Silver Screen Shower Scene" },
  { at: "22:45", artist: "Agents Of Time & Miss Monique", title: "Rajada" },
  { at: "26:15", artist: "Fedde Le Grand", title: "Put Your Hands Up For Detroit" },
  { at: "29:52", artist: "The Prodigy", title: "Breathe" },
  {
    at: "33:10",
    artist: "Bountyhunter",
    title: "Woops (Dimitri Vegas & Junkie Kid Remix / BRANDON Remix)",
  },
  { at: "34:35", artist: "Mau P", title: "MERTHER" },
  { at: "36:25", artist: "Nirvana", title: "Smells Like Teen Spirit" },
  {
    at: "38:14",
    artist: "Swedish House Mafia",
    title: "Wait So Long (Why Do I Have To) (Agents Of Time Remix)",
  },
  { at: "41:04", artist: "Agents Of Time", title: "Let Me Love U" },
  { at: "44:55", artist: "Agents Of Time & JONOS & Son Of Son", title: "You + Me" },
  { at: "50:51", artist: "Agents Of Time & Korolova ft. Conor Ross", title: "Made For Love" },
  { at: "52:07", artist: "Swedish House Mafia & Connie Constance", title: "Heaven Takes You Home" },
  { at: "53:22", artist: "Agents Of Time", title: "Zodiac" },
  { at: "56:19", artist: "Agents Of Time", title: "I Can't Do Without You" },
];

/**
 * Steve Angello @ Crystal Garden Stage, Tomorrowland Weekend 1, Belgium 2026-07-18
 * Official YouTube: https://youtu.be/eir5Sh_gHbo
 * oEmbed 2026-08-28: channel "Tomorrowland" (@tomorrowland), title
 * "Steve Angello WE1 | Tomorrowland 2026".
 * https://www.1001tracklists.com/tracklist/1cgmpl0k/steve-angello-crystal-garden-stage-tomorrowland-weekend-1-belgium-2026-07-18.html
 * Overlay name TL_STEVE_ANGELLO is too generic and would collide with
 * TL_STEVE_ANGELLO_TML_WE2_2026 (Mainstage WE2, yt-5AdQy7lCbN0).
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-eir5Sh_gHbo"] = TL_STEVE_ANGELLO_TML_WE1_CRYSTAL_2026
 * No SoundCloud in the paste — do not invent an SC slug. Do not attach this
 * list to yt-5AdQy7lCbN0.
 * Mashup expansions kept as captured (Be / Show Me Love / Knas, One / Sweet
 * Dreams, Midnight City / Sweet Disposition, Tell Me Why / Dive, Reload /
 * Flash, Innerbloom / Payback, Don't You Worry Child variants).
 * Captured 2026-08-28 — provenance 1001tl.
 */
export const TL_STEVE_ANGELLO_TML_WE1_CRYSTAL_2026: FingerprintSeedRow[] = [
  { at: "0:11", artist: "Steve Angello & Modern Tales", title: "Darkness In Me" },
  { at: "4:15", artist: "Jewel Kid", title: "Talking To You" },
  { at: "8:20", artist: "Max Styler", title: "Inferno" },
  { at: "10:55", artist: "The Chemical Brothers", title: "Hey Boy, Hey Girl (Mesto Remix)" },
  { at: "13:57", artist: "Magnificence & Corey James ft. Rion S", title: "Time Machine" },
  { at: "20:55", artist: "Steve Angello & Sebastian Ingrosso ft. Namasenda", title: "No Enemies" },
  { at: "21:30", artist: "Empire Of The Sun", title: "We Are The People (Acappella)" },
  { at: "24:02", artist: "Manuel Ribeca", title: "My House" },
  { at: "27:40", artist: "James Carter", title: "Open Up Your Love" },
  { at: "31:28", artist: "Swedish House Mafia ft. Sting", title: "Redlight" },
  { at: "34:57", artist: "PARISI x Sebastian Ingrosso x Steve Angello", title: "U Ok?" },
  { at: "38:07", artist: "Galoski", title: "Move" },
  { at: "41:50", artist: "Manuel Ribeca & Blow", title: "Deep Breath" },
  {
    at: "47:11",
    artist: "Corey James & HIISAK ft. Roland Clark",
    title: "The Underground (House of God) (Steve Angello Edit)",
  },
  { at: "49:45", artist: "HIISAK & Reeva", title: "LIFT-OFF" },
  {
    at: "52:08",
    artist: "Steve Angello & Laidback Luke & Rowetta",
    title: "Be vs. Show Me Love vs. Knas (Swedish House Mafia Mashup)",
  },
  { at: "52:54", artist: "Steve Angello & Laidback Luke ft. Rowetta", title: "Be" },
  { at: "53:40", artist: "Steve Angello & Laidback Luke ft. Robin S", title: "Show Me Love (Tool)" },
  { at: "54:26", artist: "Steve Angello", title: "Knas" },
  { at: "55:12", artist: "The S.O.S. Band", title: "Just Be Good To Me" },
  { at: "58:07", artist: "HIISAK & Reeva", title: "KILLA" },
  { at: "1:00:36", artist: "Steve Angello", title: "ME" },
  { at: "1:04:05", artist: "Cirez D", title: "On Off (Kapuchon Edit)" },
  { at: "1:06:01", artist: "Swedish House Mafia ft. Mapei", title: "Time" },
  { at: "1:07:57", artist: "Swedish House Mafia", title: "Greyhound" },
  { at: "1:09:26", artist: "Rui Da Silva ft. Cassandra Fox", title: "Touch Me (Acappella)" },
  {
    at: "1:10:55",
    artist: "Swedish House Mafia & Knife Party ft. ADL",
    title: "Antidote (MPH Remix)",
  },
  {
    at: "1:12:37",
    artist: "Steve Angello vs. Swedish House Mafia & A$AP Rocky",
    title: "Hooligans vs. Frankenstein (Axwell Mashup)",
  },
  { at: "1:13:45", artist: "Swedish House Mafia & A$AP Rocky", title: "Frankenstein" },
  { at: "1:14:53", artist: "Steve Angello", title: "Hooligans" },
  { at: "1:16:00", artist: "Cloonee & Prospa", title: "Free Your Mind (James Poole Edit)" },
  { at: "1:18:53", artist: "Basement Jaxx", title: "Where's Your Head At? (Steve Angello Remix)" },
  { at: "1:21:48", artist: "Swedish House Mafia ft. Tinie Tempah", title: "Miami 2 Ibiza" },
  { at: "1:24:27", artist: "deadmau5", title: "Strobe (DBL Flip)" },
  {
    at: "1:28:22",
    artist: "Kerri Chandler & Dennis Quin ft. Troy Denari",
    title: "You Are In My System",
  },
  { at: "1:31:05", artist: "Faithless", title: "Insomnia (Steve Angello Remix)" },
  {
    at: "1:33:27",
    artist: "Swedish House Mafia vs. Eurythmics & Steve Angello vs. Pharrell Williams",
    title: "One (Your Name) vs. Sweet Dreams (Swedish House Mafia Mashup)",
  },
  {
    at: "1:34:34",
    artist: "Eurythmics",
    title: "Sweet Dreams (Are Made of This) (Steve Angello Remix)",
  },
  { at: "1:35:41", artist: "Swedish House Mafia", title: "One" },
  { at: "1:36:48", artist: "Swedish House Mafia ft. Pharrell Williams", title: "One (Your Name)" },
  { at: "1:37:55", artist: "Gala", title: "Freed From Desire" },
  {
    at: "1:40:40",
    artist: "M83 & Eric Prydz vs. The Temper Trap",
    title: "Midnight City vs. Sweet Disposition (Steve Angello Mashup)",
  },
  { at: "1:42:00", artist: "The Temper Trap", title: "Sweet Disposition (Acappella)" },
  { at: "1:43:20", artist: "M83", title: "Midnight City (Eric Prydz Private Remix)" },
  {
    at: "1:44:40",
    artist: "Axwell & Sebastian Ingrosso & Steve Angello & Laidback Luke ft. Deborah Cox",
    title: "Leave The World Behind",
  },
  {
    at: "1:47:28",
    artist: "Sebastian Ingrosso & Céline Dion vs. Coldplay",
    title: "A New Day vs. A Sky Full Of Stars (Alesso Mashup)",
  },
  { at: "1:48:30", artist: "Coldplay", title: "A Sky Full Of Stars (Acappella)" },
  { at: "1:49:32", artist: "Sebastian Ingrosso ft. Céline Dion", title: "A New Day" },
  { at: "1:50:34", artist: "Kryder", title: "Eivissa" },
  { at: "1:54:01", artist: "Swedish House Mafia & Niki & The Dove", title: "Lioness" },
  { at: "1:57:10", artist: "Swedish House Mafia", title: "Wait So Long (Why Do I Have To)" },
  { at: "1:59:12", artist: "Avicii", title: "Levels" },
  { at: "2:01:27", artist: "Duke Dumont", title: "The Chant" },
  { at: "2:05:48", artist: "Pryda", title: "Allein" },
  {
    at: "2:08:59",
    artist: "Steve Angello ft. Dougy Mandagi from The Temper Trap",
    title: "Wasted Love (Grum Remix)",
  },
  { at: "2:12:43", artist: "Start The Party", title: "I Feel Love (Kevin McKay Remix)" },
  { at: "2:16:46", artist: "Armand van Helden ft. Duane Harden", title: "You Don't Know Me" },
  {
    at: "2:19:54",
    artist: "Swedish House Mafia & The Weeknd",
    title: "Moth To A Flame (Swedish House Mafia Rework)",
  },
  { at: "2:22:50", artist: "Swedish House Mafia & Alicia Keys", title: "Finally" },
  { at: "2:25:15", artist: "Eric Prydz & Steve Angello", title: "Bedtime Stories" },
  { at: "2:27:19", artist: "Corona", title: "The Rhythm Of The Night (Acappella)" },
  {
    at: "2:29:23",
    artist: "Supermode & MEDUZA vs. Benwal",
    title: "Tell Me Why vs. Dive (Steve Angello Mashup)",
  },
  { at: "2:31:11", artist: "Supermode", title: "Tell Me Why (MEDUZA Remix)" },
  { at: "2:32:59", artist: "Benwal", title: "Dive" },
  { at: "2:34:46", artist: "Eric Prydz", title: "Pjanoo (LAWZ Remix)" },
  { at: "2:37:16", artist: "Swedish House Mafia ft. John Martin", title: "Save The World (NC Edit)" },
  {
    at: "2:37:50",
    artist: "Sebastian Ingrosso & Tommy Trash & John Martin vs. Green Velvet & Nicky Romero",
    title: "Reload vs. Flash (Axwell Λ Ingrosso Mashup)",
  },
  { at: "2:38:24", artist: "Green Velvet", title: "Flash (Nicky Romero Remix)" },
  {
    at: "2:38:58",
    artist: "Sebastian Ingrosso & Tommy Trash ft. John Martin",
    title: "Reload (Vocal Mix)",
  },
  { at: "2:39:31", artist: "Swedish House Mafia ft. John Martin", title: "Don't You Worry Child" },
  {
    at: "2:42:25",
    artist: "Swedish House Mafia ft. John Martin",
    title: "Don't You Worry Child (Swedish House Mafia Rework)",
  },
  {
    at: "2:45:18",
    artist: "Swedish House Mafia & Connie Constance",
    title: "Heaven Takes You Home (Swedish House Mafia Remake)",
  },
  {
    at: "2:49:02",
    artist: "RÜFÜS DU SOL vs. Steve Angello & Dimitri Vangelis & Wyman",
    title: "Innerbloom vs. Payback (Steve Angello Mashup)",
  },
  { at: "2:50:34", artist: "Dimitri Vangelis & Wyman X Steve Angello", title: "Payback" },
  { at: "2:52:06", artist: "RÜFÜS DU SOL", title: "Innerbloom" },
  { at: "2:53:38", artist: "Sebastian Ingrosso", title: "Flood" },
  { at: "2:55:10", artist: "Swedish House Mafia & Lykke Li", title: "Happiness Is So Sad" },
];

/**
 * deadmau5 @ Mainstage, Veld Music Festival, Canada 2025-08-03
 * Official YouTube: https://youtu.be/5LqJCIi6p7Y
 * oEmbed 2026-08-28: channel "deadmau5" (@deadmau5), title
 * "deadmau5 Live @ VELD Music Festival 2025 Toronto, Canada". That video
 * was already curated in YOUTUBE_SETS without a tracklist, so this capture
 * fills an existing set.
 * https://www.1001tracklists.com/tracklist/2lj793ht/deadmau5-mainstage-veld-music-festival-canada-2025-08-03.html
 * Overlay name TL_DEADMAU5 is too generic; constant is the performance.
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-5LqJCIi6p7Y"] = TL_DEADMAU5_VELD_MAINSTAGE_2025
 * No SoundCloud in the paste — do not invent an SC slug.
 * Monophobia appears twice (34:00 / 39:40). The Veldt at 1:06:30 is followed
 * by The Veldt (Tommy Trash Remix) at 1:06:31 — clocks stay as captured.
 * Captured 2026-08-28 — provenance 1001tl.
 */
export const TL_DEADMAU5_VELD_MAINSTAGE_2025: FingerprintSeedRow[] = [
  { at: "0:00", artist: "ARTBAT", title: "Artefact" },
  { at: "3:15", artist: "deadmau5", title: "Fn Pig" },
  { at: "6:30", artist: "No Mana", title: "Array of Sirens" },
  { at: "8:00", artist: "deadmau5 ft. Lights", title: "When The Summer Dies" },
  { at: "13:00", artist: "deadmau5 & Wolfgang Gartner", title: "Channel 43" },
  { at: "19:08", artist: "deadmau5", title: "Moar Ghosts 'n' Stuff" },
  { at: "21:04", artist: "deadmau5 ft. Rob Swire", title: "Ghosts 'n' Stuff (JAUZ Remix)" },
  { at: "22:59", artist: "deadmau5 ft. Rob Swire", title: "Ghosts 'n' Stuff (Chuckie Remix)" },
  { at: "24:55", artist: "deadmau5 ft. Rob Swire", title: "Ghosts 'n' Stuff" },
  { at: "26:50", artist: "deadmau5", title: "Rydly" },
  { at: "31:45", artist: "deadmau5", title: "Some Chords (Dillon Francis Remix)" },
  { at: "34:00", artist: "deadmau5 ft. Rob Swire", title: "Monophobia" },
  { at: "36:50", artist: "Oliver Schories", title: "Devon (Oliver Huntemann Remix)" },
  { at: "39:40", artist: "deadmau5 ft. Rob Swire", title: "Monophobia" },
  { at: "42:30", artist: "Kx5 ft. HAYLA", title: "Escape (Spencer Brown Remix)" },
  { at: "48:20", artist: "deadmau5", title: "Imaginary Friends" },
  { at: "49:48", artist: "deadmau5", title: "gula" },
  { at: "51:16", artist: "deadmau5", title: "Avaritia" },
  { at: "54:00", artist: "deadmau5", title: "8ths" },
  { at: "1:00:00", artist: "deadmau5", title: "Sixes" },
  { at: "1:06:30", artist: "deadmau5 ft. Chris James", title: "The Veldt" },
  { at: "1:06:31", artist: "deadmau5 ft. Chris James", title: "The Veldt (Tommy Trash Remix)" },
];

/**
 * Carl Cox @ Carl Cox & Friends, Ibiza Villa Takeovers, Boiler Room 2013-08-15
 * Official YouTube: https://youtu.be/vy-k0FopsmY
 * oEmbed 2026-08-28: channel "Boiler Room" (@boilerroom), title
 * "Carl Cox Boiler Room Ibiza Villa Takeovers DJ Set". That video was
 * already curated in YOUTUBE_SETS without a tracklist, so this capture
 * fills an existing set.
 * Official SoundCloud: https://soundcloud.com/platform/carl-cox-45-min-boiler-room
 * oEmbed 2026-08-28: author "Boiler Room" (soundcloud.com/platform), title
 * "Carl Cox 45 min Boiler Room Ibiza Villa Takeovers DJ Set".
 * Same 1001 seed + both official permalinks → host twin (SC-first playback,
 * YT kept). SC slug is secondary.
 * https://www.1001tracklists.com/tracklist/3v69b81/carl-cox-carl-cox-friends-ibiza-villa-takeovers-boiler-room-2013-08-15.html
 * Overlay name TL_CARL_COX is too generic; constant is the performance.
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-vy-k0FopsmY"] = TL_CARL_COX_BOILER_ROOM_IBIZA_VILLA_2013
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["sc-platform-carl-cox-45-min-boiler-room"] = TL_CARL_COX_BOILER_ROOM_IBIZA_VILLA_2013
 * Only Carl Cox Boiler Room row in the catalog — not NYC.
 * Captured 2026-08-28 — provenance 1001tl.
 */
export const TL_CARL_COX_BOILER_ROOM_IBIZA_VILLA_2013: FingerprintSeedRow[] = [
  { at: "0:00", artist: "X-Press 2 ft. James Yuill", title: "Muzik Xpress" },
  { at: "2:40", artist: "Chez Damier", title: "Can You Feel It (Steve Bug Re-Dub)" },
  { at: "5:20", artist: "Sergio Fernandez", title: "Carioca" },
  { at: "8:00", artist: "Elio Riso", title: "Pain In The Ass" },
  { at: "12:30", artist: "Round Table Knights & Bauchamp", title: "Calypso" },
  { at: "17:00", artist: "Joe Brunning", title: "Positive Vibes" },
  {
    at: "20:00",
    artist: "The Rivera Project",
    title: "Puerto Rico Vibe (Robbie Rivera Original Mix)",
  },
  { at: "23:00", artist: "Jim Rivers", title: "We Can Do This All Night" },
  { at: "26:00", artist: "Trevor Rockcliffe", title: "Jumping (Deep House Mix)" },
  { at: "30:00", artist: "Stefano Frisoni", title: "El Nino Loco (Turkana Remix)" },
  { at: "32:46", artist: "New Order", title: "Blue Monday (Original 12'' Mix)" },
  {
    at: "35:32",
    artist: "Chris Montana vs. Denis The Menace",
    title: "Spanish Hustle (Chris Moody Remix)",
  },
  { at: "40:50", artist: "CeCe Peniston ft. Joyriders", title: "Finally" },
];

/**
 * MARNIK @ Planaxis Stage, Tomorrowland Weekend 1, Belgium 2026-07-18
 * Official SoundCloud: https://soundcloud.com/marnikofficial/marnik-live-at-tomorrowland
 * oEmbed 2026-08-28: author "MARNIK" (soundcloud.com/marnikofficial), title
 * "MARNIK Live at Tomorrowland 2026 | Planaxis Stage – Full Set".
 * https://www.1001tracklists.com/tracklist/vn48l79/marnik-planaxis-stage-tomorrowland-weekend-1-belgium-2026-07-18.html
 * Overlay name TL_MARNIK is too generic and is not
 * TL_MARNIK_NAMELESS_FESTIVAL_2016 (held, no playback) or the UNLEGEND
 * Nameless 2026 SC (sc-marnikofficial-marnik-presents-unlegend-show).
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["sc-marnikofficial-marnik-live-at-tomorrowland"] = TL_MARNIK_TML_WE1_PLANAXIS_2026
 * No YouTube in the paste — do not invent a YT slug.
 * Captured 2026-08-28 — provenance 1001tl.
 */
export const TL_MARNIK_TML_WE1_PLANAXIS_2026: FingerprintSeedRow[] = [
  { at: "0:00", artist: "MARNIK", title: "Stranger (To Stability)" },
  { at: "2:59", artist: "MARNIK ft. Crooked Bangs", title: "Synthetic Heart" },
  { at: "5:35", artist: "DJ KUBA & NEITAN", title: "Feel The Beat" },
  { at: "8:34", artist: "Ferry Corsten & Ruben de Ronde pres. NRG2000", title: "Rise Up" },
  { at: "10:41", artist: "JUULS & FISION & NLW", title: "Cricket" },
  { at: "13:23", artist: "NIVEK", title: "My Neck, My Back" },
  { at: "15:25", artist: "Alex Nocera & Roy Batty", title: "Interference" },
  { at: "19:22", artist: "MARNIK & T78 ft. LaVie", title: "Maximus" },
  { at: "23:19", artist: "Gabry Ponte & Blasterjaxx & 1World & AntoNetta", title: "Now We Are Free" },
  { at: "25:49", artist: "MARNIK", title: "ARENA" },
  { at: "30:21", artist: "Restricted & NIKSTER", title: "Insomnia" },
  { at: "31:54", artist: "AREA ØNE", title: "Switch!" },
  { at: "33:15", artist: "Steve Aoki & MARNIK & MR.BLACK", title: "Instant Moments" },
  { at: "35:44", artist: "MARNIK", title: "Lasers" },
  { at: "37:10", artist: "Bountyhunter", title: "Woops (Dimitri Vegas & Junkie Kid Remix)" },
  { at: "38:31", artist: "MARNIK X MOTVS X Tony Richard", title: "Profondo Rosso" },
  { at: "40:23", artist: "MARNIK", title: "We Came We Saw We Conquered" },
  { at: "43:13", artist: "MARNIK & Naeleck & VINAI", title: "Boyz In Paris (Coone Remix)" },
  { at: "44:52", artist: "Mo-Do", title: "Eins Zwei Polizei" },
  { at: "46:59", artist: "YuB & EDMMARO", title: "FDAU" },
  { at: "48:47", artist: "Linkin Park", title: "Numb (Trey Pearce Remix)" },
  { at: "51:44", artist: "MARNIK & Samuel Moriero", title: "Hard Techno" },
];

/**
 * Fideles @ Freedom Stage, Tomorrowland Weekend 2, Belgium 2026-07-26
 * Official YouTube: https://youtu.be/e0xXSwtVwe0
 * oEmbed 2026-08-28: channel "Tomorrowland" (@tomorrowland), title
 * "Fideles WE2 | Tomorrowland 2026".
 * https://www.1001tracklists.com/tracklist/9xss8m1/fideles-freedom-stage-tomorrowland-weekend-2-belgium-2026-07-26.html
 * Overlay name TL_FIDELES is too generic; constant is the performance.
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-e0xXSwtVwe0"] = TL_FIDELES_TML_WE2_FREEDOM_2026
 * No SoundCloud in the paste — do not invent an SC slug.
 * Video was not yet curated in YOUTUBE_SETS — this capture adds the row.
 * Gap 0:12 → 10:51 and the long Victory Lap Five credit stay as captured.
 * Captured 2026-08-28 — provenance 1001tl.
 */
export const TL_FIDELES_TML_WE2_FREEDOM_2026: FingerprintSeedRow[] = [
  { at: "0:12", artist: "The Prodigy", title: "Breathe" },
  { at: "10:51", artist: "FEZZO & Ricck", title: "High" },
  { at: "15:27", artist: "Chris Lake & Chris Lorenzo pres. Anti Up", title: "I Cannot" },
  { at: "18:45", artist: "Tame Impala", title: "Dracula (CHRSTPHR Remix)" },
  { at: "20:48", artist: "SKIY", title: "Disco" },
  { at: "22:50", artist: "Adam In Deep", title: "Jump Off" },
  { at: "27:29", artist: "BARIŞ BERBER", title: "Tak Tuk" },
  { at: "31:48", artist: "Fideles", title: "Hey Bro" },
  { at: "35:36", artist: "Arude", title: "Duskline" },
  { at: "39:44", artist: "BLR", title: "My Precious" },
  { at: "41:03", artist: "Nelly Furtado", title: "Say It Right" },
  { at: "42:22", artist: "Fatima Yamaha", title: "What's A Girl To Do" },
  { at: "43:40", artist: "Fred again.. & Skepta & PlaqueBoyMax", title: "Victory Lap" },
  {
    at: "45:46",
    artist:
      "Fred again.. & Skepta & PlaqueBoyMax & Denzel Curry & Hanumankind & That Mexican OT & D Double E & LYNY",
    title: "Victory Lap Five",
  },
  { at: "47:51", artist: "Faithless", title: "Insomnia (BLR Remix)" },
  { at: "52:37", artist: "Groove Armada ft. Gramma Funk", title: "I See You Baby (R3HAB Remix)" },
  { at: "1:00:03", artist: "Adriatique & GENESI & Emmit Fenn", title: "Closer" },
  { at: "1:05:00", artist: "Hardrive", title: "Deep Inside" },
  { at: "1:09:04", artist: "Axwell", title: "Feel The Vibe" },
  { at: "1:13:44", artist: "Eric Prydz", title: "Opus (Trashock Remix)" },
  { at: "1:18:33", artist: "Calvin Harris ft. Florence Welch", title: "Sweet Nothing" },
  { at: "1:23:12", artist: "Armand van Helden", title: "I Want Your Soul (Fideles Remix)" },
  { at: "1:28:01", artist: "Bah Samba & The Fatback Band", title: "Let The Drums Speak" },
];

/**
 * The Chainsmokers @ Mainstage, Ultra Music Festival, Flemington Racecourse
 * Melbourne, Australia 2026-04-11
 * Official YouTube: https://youtu.be/A5ERobJaS_0
 * oEmbed 2026-08-28: channel "The Chainsmokers" (@THECHAINSMOKERS), title
 * "The Chainsmokers - Live @ Ultra Melbourne 2026".
 * That video was already curated in YOUTUBE_SETS without a tracklist, so this
 * capture fills an existing set.
 * https://www.1001tracklists.com/tracklist/2fwrq83t/the-chainsmokers-mainstage-ultra-music-festival-flemington-racecourse-melbourne-australia-2026-04-11.html
 * Overlay name TL_THE_CHAINSMOKERS is too generic; constant is the performance
 * and is not TL_THE_CHAINSMOKERS_TML_WE1_2026 (yt-1lqmFLr-SkA).
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-A5ERobJaS_0"] = TL_THE_CHAINSMOKERS_ULTRA_MELBOURNE_MAINSTAGE_2026
 * No SoundCloud in the paste — do not invent an SC slug.
 * Mashup-then-component clusters stay as captured, including the 1s closer
 * at 1:11:02–1:11:07.
 * Captured 2026-08-28 — provenance 1001tl.
 */
export const TL_THE_CHAINSMOKERS_ULTRA_MELBOURNE_MAINSTAGE_2026: FingerprintSeedRow[] = [
  { at: "0:00", artist: "The Chainsmokers & Coldplay", title: "Something Just Like This (Acappella)" },
  { at: "4:20", artist: "Helvig", title: "Feelings" },
  { at: "5:30", artist: "TOYZZ vs. HUGEL & SOTO vs. The Chainsmokers & Beau Nox", title: "SexyBack vs. Jamaican (Bam Bam) vs. White Wine & Adderall (The Chainsmokers Mashup)" },
  { at: "6:13", artist: "TOYZZ", title: "SexyBack" },
  { at: "6:56", artist: "The Chainsmokers ft. Beau Nox", title: "White Wine & Adderall" },
  { at: "7:40", artist: "HUGEL & SOLTO", title: "Jamaican (Bam Bam)" },
  { at: "8:23", artist: "The Chainsmokers & Oaks vs. Eric Prydz vs. Rozalla", title: "Already Know vs. Pjanoo vs. Everybody's Free (To Feel Good) (The Chainsmokers Mashup)" },
  { at: "8:56", artist: "Eric Prydz", title: "Pjanoo" },
  { at: "9:28", artist: "Rozalla", title: "Everybody's Free (To Feel Good) (Acappella)" },
  { at: "10:01", artist: "The Chainsmokers & Oaks", title: "Already Know" },
  { at: "10:33", artist: "Congorock & Mr. Lexx & Men Machine & KENZ vs. Kelis vs. Fallon", title: "Babylon vs. Milkshake vs. Diet Coke (The Chainsmokers Mashup)" },
  { at: "10:55", artist: "Kelis", title: "Milkshake (Acappella)" },
  { at: "11:17", artist: "Fallon", title: "Diet Coke" },
  { at: "11:40", artist: "Congorock ft. Mr. Lexx", title: "Babylon (David Guetta & MARTEN HØRGER pres. Men Machine & KENZ Rework)" },
  { at: "12:02", artist: "Alice Deejay & Pickle vs. The Chainsmokers & Daya & W&W & ILLENIUM", title: "Better Off Alone vs. Don't Let Me Down (The Chainsmokers VIP Edit)" },
  { at: "12:39", artist: "The Chainsmokers ft. Daya", title: "Don't Let Me Down (W&W Remix)" },
  { at: "13:16", artist: "The Chainsmokers ft. Daya", title: "Don't Let Me Down (ILLENIUM Remix)" },
  { at: "13:53", artist: "Alice Deejay", title: "Better Off Alone (Pickle Remix)" },
  { at: "14:30", artist: "The Chainsmokers ft. Daya", title: "Don't Let Me Down (The Chainsmokers DnB Edit)" },
  { at: "15:07", artist: "Yeah Yeah Yeahs & A-Trak vs. Disco Lines & Tinashe & Whethan vs. Deniz Koyu vs. Mau P", title: "Heads Will Roll vs. No Broke Boys vs. Tung! vs. Like I Like It (The Chainsmokers Mashup)" },
  { at: "15:28", artist: "Yeah Yeah Yeahs", title: "Heads Will Roll (A-Trak Remix)" },
  { at: "15:50", artist: "Deniz Koyu", title: "Tung!" },
  { at: "16:11", artist: "Mau P", title: "Like I Like It" },
  { at: "16:33", artist: "Disco Lines & Tinashe", title: "No Broke Boys (Whethan Remix)" },
  { at: "16:54", artist: "Deniz Koyu", title: "Bong" },
  { at: "17:16", artist: "Disco Lines & Tinashe", title: "No Broke Boys" },
  { at: "17:37", artist: "OMI", title: "Cheerleader (felix jaehn Remix)" },
  { at: "18:43", artist: "The Chainsmokers ft. ROZES", title: "Roses" },
  { at: "20:49", artist: "Wheatus", title: "Teenage Dirtbag" },
  { at: "22:10", artist: "The Chainsmokers ft. ROZES", title: "Roses (The Him Remix)" },
  { at: "22:46", artist: "Tiësto & The Chainsmokers vs. 50 Cent vs. Ke$ha & SIDEPIECE", title: "Split (Only U) vs. In Da Club vs. Die Young (The Chainsmokers Mashup)" },
  { at: "23:11", artist: "50 Cent", title: "In Da Club (Acappella)" },
  { at: "23:36", artist: "Tiësto & The Chainsmokers", title: "Split (Only U) (The Chainsmokers VIP)" },
  { at: "24:01", artist: "Ke$ha", title: "Die Young (SIDEPIECE Treat)" },
  { at: "24:26", artist: "The Chainsmokers ft. Oaks", title: "Echo" },
  { at: "28:14", artist: "ANOTR & 54 Ultra vs. Don Toliver vs. FISHER vs. Wiz Khalifa", title: "Talk To You vs. E85 vs. Stay vs. The Thrill (The Chainsmokers Mashup)" },
  { at: "28:42", artist: "Wiz Khalifa", title: "The Thrill" },
  { at: "29:10", artist: "FISHER", title: "Stay" },
  { at: "29:39", artist: "Don Toliver", title: "E85" },
  { at: "30:07", artist: "Stadiumx vs. Empire Of The Sun", title: "Vibe Right vs. Walking On A Dream (The Chainsmokers Mashup)" },
  { at: "30:43", artist: "Empire Of The Sun", title: "Walking On A Dream (Acappella)" },
  { at: "31:20", artist: "Stadiumx", title: "Vibe Right" },
  { at: "31:56", artist: "John Summit & The Chainsmokers & Ilsey", title: "ALL THE TIME" },
  { at: "35:37", artist: "The Chainsmokers ft. Emily Warren", title: "Paris (VIP)" },
  { at: "39:04", artist: "Major Lazer ft. Vybz Kartel", title: "Pon De Floor" },
  { at: "41:44", artist: "RÜFÜS DU SOL", title: "On My Knees (Cassian Remix)" },
  { at: "42:11", artist: "ARTBAT", title: "Dance" },
  { at: "42:56", artist: "The Chainsmokers & Oaks", title: "Love Is Kind" },
  { at: "44:30", artist: "Skrillex & Habstrakt", title: "Chicken Soup (AFROJACK Seven Nation Army Edit)" },
  { at: "44:47", artist: "The White Stripes", title: "Seven Nation Army" },
  { at: "45:05", artist: "Skrillex & Habstrakt", title: "Chicken Soup" },
  { at: "45:22", artist: "Justice vs. Simian", title: "We Are Your Friends (Acappella)" },
  { at: "45:56", artist: "Chase & Status & Bou ft. Trigga & IRAH & Flowdan & Takura", title: "Baddadan (Knock2 Remix)" },
  { at: "46:38", artist: "Soulja Boy Tell 'Em vs. Skrillex & MUST DIE! vs. Marshmello & Eptic & Juicy J", title: "Crank That (Soulja Boy) vs. VIP's vs. Hitta (The Chainsmokers Mashup)" },
  { at: "46:50", artist: "Soulja Boy Tell 'Em", title: "Crank That (Soulja Boy)" },
  { at: "47:02", artist: "Skrillex & MUST DIE!", title: "VIP's" },
  { at: "47:14", artist: "Marshmello & Eptic ft. Juicy J", title: "Hitta" },
  { at: "47:25", artist: "sombr & The Chainsmokers vs. Disclosure & Eliza Doolittle & Flume", title: "back to friends vs. You & Me (The Chainsmokers Mashup)" },
  { at: "48:26", artist: "Disclosure ft. Eliza Doolittle", title: "You & Me (Flume Remix)" },
  { at: "49:27", artist: "sombr", title: "back to friends (The Chainsmokers Remix)" },
  { at: "50:28", artist: "The Chainsmokers ft. Halsey", title: "Closer" },
  { at: "52:54", artist: "The Chainsmokers ft. Halsey", title: "Closer (VIP)" },
  { at: "54:41", artist: "Backstreet Boys vs. Charli xcx & The Chainsmokers", title: "Everybody (Backstreet's Back) vs. b2b (The Chainsmokers Mashup)" },
  { at: "55:10", artist: "Backstreet Boys", title: "Everybody (Backstreet's Back)" },
  { at: "55:40", artist: "Charli xcx", title: "B2b (The Chainsmokers Remix)" },
  { at: "56:09", artist: "Dean Turnley vs. Calvin Harris vs. Tame Impala & JENNIE vs. AFROJACK & Lucas & Steve", title: "Actin' Tough vs. I'm Not Alone vs. Dracula vs. Control (The Chainsmokers Mashup)" },
  { at: "56:31", artist: "Calvin Harris", title: "I'm Not Alone (Calvin Harris 2019 Edit)" },
  { at: "56:53", artist: "AFROJACK & Lucas & Steve", title: "Control" },
  { at: "57:15", artist: "Tame Impala", title: "Dracula (JENNIE Remix)" },
  { at: "57:37", artist: "Dean Turnley", title: "Actin' Tough" },
  { at: "57:58", artist: "Ella Langley vs. Swedish House Mafia & Alicia Keys vs. Alan Fitzpatrick", title: "Choosin' Texas vs. Finally vs. We Do What We Want (The Chainsmokers Mashup)" },
  { at: "58:25", artist: "Alan Fitzpatrick", title: "We Do What We Want" },
  { at: "58:52", artist: "Swedish House Mafia & Alicia Keys", title: "Finally" },
  { at: "59:19", artist: "Ella Langley", title: "Choosin' Texas" },
  { at: "59:46", artist: "Michael Gray", title: "The Weekend (The chainsmokers & KENZ Remix)" },
  { at: "1:01:06", artist: "Rune RK vs. Jack Ü ft. Bunji Garlin", title: "Jungle Calabria (Cristian Marchi & Luis Rodriguez Private Bootleg)" },
  { at: "1:01:22", artist: "Rune RK", title: "Calabria" },
  { at: "1:01:38", artist: "Jack Ü ft. Bunji Garlin & MX Prime", title: "Jungle Bae" },
  { at: "1:01:54", artist: "Zedd & Lucky Date ft. Ellie Goulding", title: "Fall Into The Sky (Everybody Fuckin Jump Acappella)" },
  { at: "1:01:57", artist: "FISHER & Shermanology", title: "It's A Killa" },
  { at: "1:02:35", artist: "Bountyhunter", title: "Woops (Dimitri Vegas & Junkie Kid Remix / BRANDON Remix)" },
  { at: "1:03:32", artist: "No Doubt", title: "Hella Good (Naughty Nice Remix)" },
  { at: "1:04:52", artist: "VOLAC vs. Spice Girls & Smochi", title: "Wannabe (The Chainsmokers Mashup)" },
  { at: "1:05:31", artist: "VOLAC", title: "Wannabe" },
  { at: "1:06:10", artist: "Spice Girls", title: "Wannabe (Smochi Remix)" },
  { at: "1:06:48", artist: "Flux Pavilion vs. Don Toliver vs. LYNY", title: "I Won't Stop vs. Body vs. Section (The Chainsmokers Mashup)" },
  { at: "1:07:52", artist: "Flux Pavilion", title: "I Won't Stop" },
  { at: "1:08:55", artist: "LYNY", title: "Section" },
  { at: "1:09:59", artist: "Don Toliver", title: "Body" },
  { at: "1:11:02", artist: "The Chainsmokers & Coldplay vs. Adrian Lux vs. Gigi Perez vs. Rag 'N' Bone Man & Sub Focus", title: "Something Just Like This vs. Teenage Crime vs. Sailor Song vs. All You Ever Wanted (The Chainsmokers Mashup)" },
  { at: "1:11:03", artist: "Adrian Lux", title: "Teenage Crime (Acappella)" },
  { at: "1:11:04", artist: "The Chainsmokers & Coldplay", title: "Something Just Like This" },
  { at: "1:11:05", artist: "Rag 'N' Bone Man", title: "All You Ever Wanted (Sub Focus Remix)" },
  { at: "1:11:06", artist: "The Chainsmokers & Coldplay", title: "Something Just Like This (VIP)" },
  { at: "1:11:07", artist: "Gigi Perez", title: "Sailor Song" },
];

/**
 * Bleu Clair @ BLEUPRINT VOL. 5 (Livestream from Jakarta), Indonesia 2022-03-31
 * Official YouTube: https://youtu.be/_hdM8uJV1LM
 * oEmbed 2026-08-28: channel "Bleu Clair" (@bleuclairmusic), title
 * "Bleu Clair presents BLEUPRINT VOL. 5 (Live from Jakarta)". That video
 * was already curated in YOUTUBE_SETS without a tracklist, so this capture
 * fills an existing set.
 * Official SoundCloud: https://soundcloud.com/bleuclair/bleuprintvol5
 * oEmbed 2026-08-28: author "Bleu Clair" (soundcloud.com/bleuclair), title
 * "BLEUPRINT VOL. 5 by Bleu Clair". SC description links the same YT.
 * Same 1001 seed + both official permalinks → host twin (SC-first playback,
 * YT kept). SC slug is secondary.
 * https://www.1001tracklists.com/tracklist/blv1r3k/bleu-clair-bleuprint-vol.-5-livestream-from-jakarta-indonesia-2022-03-31.html
 * Overlay name TL_BLEU_CLAIR is too generic; constant is the performance
 * and is not TL_BLEU_CLAIR_EDC_LV_2023 (sc-bleuclair-edclv2023 /
 * yt-c_sx3zum8Z0).
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-_hdM8uJV1LM"] = TL_BLEU_CLAIR_BLEUPRINT_VOL_5_JAKARTA_2022
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["sc-bleuclair-bleuprintvol5"] = TL_BLEU_CLAIR_BLEUPRINT_VOL_5_JAKARTA_2022
 * Captured 2026-08-28 — provenance 1001tl.
 */
export const TL_BLEU_CLAIR_BLEUPRINT_VOL_5_JAKARTA_2022: FingerprintSeedRow[] = [
  { at: "0:02", artist: "Bleu Clair", title: "Funk Accelerator" },
  { at: "2:04", artist: "Sampson.", title: "Cutty" },
  { at: "3:36", artist: "Devarra & Thincut", title: "Stay" },
  { at: "7:07", artist: "Tommy Trash & Yolanda Be Cool", title: "Emergency" },
  { at: "9:12", artist: "Bleu Clair ft. Teza Sumendra", title: "Hyperspace" },
  { at: "12:14", artist: "Ben Kim", title: "Woa House" },
  { at: "18:18", artist: "Bleu Clair & Dances", title: "Yeah Daddy" },
  { at: "20:07", artist: "Dombresky", title: "Bubblin" },
  { at: "24:25", artist: "Shermanology ft. Jay Colin", title: "Backfire" },
  { at: "26:42", artist: "Wade", title: "Basement" },
  { at: "29:27", artist: "Jaded", title: "Physically" },
  { at: "30:59", artist: "Bleu Clair", title: "Mistake" },
];

/**
 * Bart Skils @ Fire Stage, Loveland Festival, Netherlands 2026-08-08
 * Official YouTube: https://youtu.be/d-EOE2u7HT4
 * oEmbed 2026-08-28: channel "Loveland" (@LovelandEvents), title
 * "BART SKILS | LOVELAND FESTIVAL 2026". Video was not yet curated —
 * this capture adds the YOUTUBE_SETS row.
 * Official SoundCloud: https://soundcloud.com/loveland-legacy/bart-skils-loveland-festival
 * oEmbed 2026-08-28: author "Loveland" (soundcloud.com/loveland-legacy),
 * title "BART SKILS | Loveland Festival 2026 | LL279".
 * Artist SoundCloud (same night, same duration 5466s): 
 * https://soundcloud.com/bart-skils/bart-skils-loveland-festival
 * oEmbed 2026-08-28: author "Bart Skils" (soundcloud.com/bart-skils),
 * title "Bart Skils `@ Loveland Festival Amsterdam 2026".
 * Same 1001 seed + official YT + both official SC permalinks → host twin
 * (SC-first playback, festival SC stored, YT survivor). Both SC slugs
 * are secondary. Overlay name TL_BART_SKILS is too generic.
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-d-EOE2u7HT4"] = TL_BART_SKILS_LOVELAND_FIRE_2026
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["sc-loveland-legacy-bart-skils-loveland-festival"] = TL_BART_SKILS_LOVELAND_FIRE_2026
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["sc-bart-skils-bart-skils-loveland-festival"] = TL_BART_SKILS_LOVELAND_FIRE_2026
 * Captured 2026-08-28 — provenance 1001tl.
 */
export const TL_BART_SKILS_LOVELAND_FIRE_2026: FingerprintSeedRow[] = [
  { at: "0:00", artist: "Intro Spectral", title: "Intro" },
  { at: "1:00", artist: "Bart Skils & Weska", title: "For The Music" },
  { at: "3:10", artist: "DJ Hyperactive", title: "Wide Open (Len Faki DJ Edit)" },
  { at: "6:30", artist: "Kos:mo & A.D.H.S.", title: "Taste Of The Night" },
  { at: "11:20", artist: "Blawan", title: "Why They Hide Their Bodies Under My Garage? (Odd Mob Remix)" },
  { at: "14:30", artist: "Kratex & Shreyas", title: "Taambdi Chaamdi (Sam WOLFE Remix)" },
  { at: "18:00", artist: "HNTR", title: "Out Of My Mind" },
  { at: "26:20", artist: "Adam Beyer & Mark Reeve", title: "Frames" },
  { at: "30:40", artist: "Oscar L & Victor Ruiz", title: "Wasting Time" },
  { at: "38:40", artist: "Bart Skils & Deniz Koyu", title: "Your Mind On Acid" },
  { at: "43:00", artist: "A.D.H.S.", title: "Eos" },
  { at: "50:20", artist: "Mattia Saviolo", title: "Never Stop The Groove" },
  { at: "57:03", artist: "HNGT & Victor Ruiz", title: "Dontcha" },
  { at: "1:02:35", artist: "Eli Brown", title: "Badman Riddim" },
  { at: "1:06:30", artist: "Faithless", title: "We Come 1 (Adam Beyer Remix)" },
  { at: "1:13:45", artist: "Juan Elvadin", title: "Mind Glue" },
  { at: "1:22:00", artist: "Selena (KR)", title: "Lose Myself" },
  { at: "1:26:40", artist: "Soul Central ft. Kathy Brown", title: "Strings Of Life (Stronger On My Own) (Bart Skils & Weska Remix)" },
];
