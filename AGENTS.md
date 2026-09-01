<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

setradar.ai (package name `setradar`) is a single Next.js 16 app (App Router +
Turbopack) backed by Prisma 6 on SQLite. There is only one service to run.
GitHub Pages deploys the static export at https://setradar.ai/ (custom domain,
empty `PAGES_BASE_PATH`). The github.io `/SetTracker` path is a redirect.

## Testing

Do not run manual UI testing, screen recordings, or walkthrough artifacts.
The producer tests on https://setradar.ai/ and publishes to live from GitHub
(merge the PR / push `main`). Agents do not merge to `main` or start a Pages
deploy unless the producer explicitly says otherwise.

**One ship = one GitHub branch = one draft PR = one Cursor cycle.**
New chat threads continue that same branch, PR, and environment
snapshot. Do not `checkout -b` a new `cursor/…` branch, do not open a
second PR, and do not start a new Cursor environment build just because
a new chat started.

Stay on that ship until the producer:
1. pushes live from GitHub (merge the PR / push `main` / Pages publish), or
2. explicitly asks in chat for a new ship / new build.

Do not cancel or overwrite in-progress GitHub Actions (Pages,
catalog-deep, catalog-enrich) or Cursor environment builds. Do not
dispatch those workflows unless asked. Recurring Cursor snapshots on
`main` are the live baseline — leave them alone.

Bump `package.json` `"version"` once for the whole ship, not per
prompt. After a live publish, the next capture starts a new
`cursor/…-bba0` branch and a new draft PR.
`deploy-pages.yml` cancels in-progress exports on every main push —
drip-merging leaves live on an old version.

**Say playback, not Relive.** Relive is Tomorrowland's product name and
is confusing for every other festival. In UI, agent docs, operator notes,
and generic comments, say **playback** (or official playback). Keep Relive
only for the Tomorrowland Relive series internals
(`seriesName: "Tomorrowland Relive"`, `officialRelivePlaylists()`,
`looksLikeRelive()`, `reliveWatch` files,
`reason: "relive:official-unwired"`). Do not rename those internals
unless asked. Never write Relive for HARD / Insomniac / Nameless / Ultra.

- **Run the app:** `npm run dev` (Turbopack, http://localhost:3000). Dev output
  goes to `.next/dev` in Next 16.
- **Database:** SQLite at `prisma/dev.db` (git-ignored), `DATABASE_URL` is in the
  committed `.env` (local file path only, not a secret). The startup update
  script only refreshes deps (`npm install` + `prisma generate`); it does NOT
  touch the DB. On a fresh VM run **`npm run db:setup`** once (applies migrations
  + seeds) before `npm run dev`, otherwise pages error with missing tables.
- **Re-seeding is destructive:** `npm run db:seed` wipes all tables first, then
  recreates 16 DJs / 20 sets / ~160 plays. Use `npm run db:reset` to drop +
  re-migrate + re-seed from scratch.
- **Prisma gotcha:** models use PascalCase but client accessors are camelCase
  with only the first letter lowered — this is why the model is `Dj` (accessor
  `prisma.dj`) and not `DJ` (which would be the awkward `prisma.dJ`). SQLite does
  not support Prisma enums, so status/provenance/type are plain strings with
  documented allowed values (see `src/lib/status.ts`).
- **After changing `prisma/schema.prisma`:** run `npm run db:migrate` (dev) to
  regenerate the client and migration; the Turbopack dev server does not pick up
  a new Prisma client without a regenerate.
- **Lint / typecheck:** `npm run lint` and `npx tsc --noEmit`. `next lint` was
  removed in Next 16; ESLint runs directly.
- **Catalog QC:** `npm run qc` (file-side pins / official URLs / leftover
  hosts, then refresh graduate + playback reports). `--fix` drops junk track-id
  pins. `--full` also runs the QC unit tests. Live DB audits run only when
  the catalog has 200+ sets. Never scrapes Beatport or 1001.
- **Suggest ID → published:** **Suggest ID** opens a GitHub issue carrying a
  ready `data/resolutions.json` snippet. `suggest-id-pr.yml` turns that issue
  into a review PR (one PR per issue). Merge the PR to publish; close it to
  reject. GitHub's "create a branch from issue" placeholder branch is
  **not** the mechanism — those branches are empty and can be ignored.
  `applyResolutions` runs in `prisma/verify-urls.ts` on every deploy. Do **not**
  add `data/resolutions.json` to `CURATED_INGEST_PATHS`: that list is only for
  paths that introduce *new sets*, and a resolutions-only push used to decide
  `run=0`, skip the ingest step, and silently publish nothing. One row per play
  — `applyResolutions` skips a play that is already
  `identified`/`community_resolved`, so a second suggestion for the same
  timestamp never lands. Multiple open issues can claim one position; that is a
  producer call, not an agent one. A wrong `setSlug` counts as `missing` with no
  error, so `resolutions.test.ts` validates the committed file.
  **The `position` in a Suggest ID issue is a display index, not
  `Played.position`.** `numberPublished` re-indexes plays for the set page (talk
  rows become 0, tracks re-number from 1), so the two only agree when nothing was
  collapsed and the set has no talk rows. Match on the issue's **timestamp**,
  which is never rewritten; `applyResolutions` tries timestamp first. When the
  clock is present and no Played row exists there (synthetic `expected:` /
  `talk:` slots from `publishSetPlays`), **insert** a community play at that
  timestamp with the next free `Played.position`. Do **not** fall back to
  position in that case — a display index can name a different real cue and
  report success while mislabelling it. Position-only matching stays for
  snippets that never printed a clock. `sourcePosition` carries the stored
  position through publish for Suggest ID; synthetic slots leave it unset so
  the button emits the display index. `mergeCommunityKeeps` also matches
  timestamp first, otherwise an inserted keep at max(position)+1 would
  overwrite a different source cue on the next ingest.
- **Curated label slugs are pinned:** `CURATED_LABELS` may override
  `slugify(name)` — "Black Book Records" lives at `blackbook`. Resolve any
  human-written label name through `curatedLabelSlugByName()` first; a bare
  `slugify` mints a second row for the same imprint and splits its releases.
  `/labels/black-book-records` is an existing duplicate from before that rule.
- **`artistsForSet` splits the segment before the first `|`.** Put the artists
  first in a curated title: `"Joris Voorn b2b Cassian | Spectrum Radio 484"`. A
  show or venue name ahead of a `b2b`/`&` gets read as part of the artist and
  mints a junk DJ ("Spectrum Radio 484 Joris Voorn"); putting the b2b after the
  pipe drops the partner instead. Verify the parse before shipping a b2b title.
- **Verifying the export needs `GITHUB_PAGES=true`.** `output: "export"` is gated
  on that env var, so plain `npm run build` writes only `.next` and leaves a
  stale `out/` from the snapshot build. Check exported HTML with
  `GITHUB_PAGES=true PAGES_BASE_PATH="" npm run build`, or the file you read is
  hours old.
- **A push deploy carrying a crawl can be cancelled.** `catalog-deep` →
  `catalog-enrich` → dispatched Pages runs with `run=0` ("cached catalog, no
  curated re-poll") and supersedes an in-flight push deploy that decided `run=1`.
  The published code is then correct while newly curated videos have no set row
  (404 pages) until the next crawling deploy. After a merge that touches curated
  sources, check `Decide curated ingest` on the run that actually published.
- **Capture queue balance:** `buildCaptureQueueFromNeeds` fills in two passes —
  at most `capturePerEventCap(limit)` rows per event (5 at limit 40, floor 3),
  then an uncapped overflow pass for leftover slots. Without it an in-season
  brand takes all 40, since every one of its gap rows carries the same
  `festivalSeason` +120. Bucket key is `eventSlug`, falling back to
  `primaryDjSlug` so one artist's back catalogue cannot flood it either. The
  notable-festival bump is **flat** for any DJ Mag Top 100 Festivals event
  (`CaptureNeedRow.eventRank`) — never scale it by rank, that pushes the biggest
  brand harder and fights the cap. The old six-brand regex remains only as the
  fallback for rows with no rank.
- **Capture queue reserve:** the queue is built at
  `CAPTURE_QUEUE_LIMIT + CAPTURE_QUEUE_RESERVE` (40 + 20) and `captureQueueView`
  filters parked rows *before* slicing to 40, so a browser-side "Later" park
  promotes a spare instead of leaving a hole. `/stats` is a static export, so the
  spares must already be in the HTML — the page cannot fetch a replacement.
  Committed parks in `data/capture-defer.json` backfill on their own because
  `activeDeferSlugs` filters before the cap at build time. Both constants live in
  `captureQueueLimits.ts`: `nextCaptures.ts` imports `node:fs`, so a client
  component importing from there drags Node built-ins into the browser bundle.
- **Capture precheck:** `npm run check:capture -- <url…>` before wiring a 1001
  paste. Takes 1001 / YouTube / SoundCloud URLs (utm junk fine), bare video
  ids, or `yt-`/`sc-` slugs; reports the slug it resolves to, whether a seed is
  already wired, the cue count, host twins, and the archive note. Committed
  files only — no network, no DB. Catches the two ways a paste wastes work: the
  set is already wired, or the paste's `Wire:` line names a different slug than
  the one the 1001 page is already on file under. Both `/stats` lists already
  drop wired slugs (`buildCaptureQueueFromNeeds` and the tracklist workbench),
  so a re-paste is a backlog artefact, not the queue asking again.
- **Fan uploads:** `FINGERPRINT_ONLY_WATCH` rows are Identify-only and must
  never be `sourceUrl` / `playbackUrl` / a `TRACKLIST_1001_BY_SOURCE_SLUG` key.
  QC now enforces both directions. The guard only sees videos already listed
  there, so verify a channel via oEmbed before treating an upload as official —
  a third-party re-upload curated in `YOUTUBE_SETS` looks official otherwise.
- **Release version:** bump `package.json` `"version"` on every ship to main.
  Pages workflows inject it as `NEXT_PUBLIC_APP_VERSION` (footer `v…`). Do not
  hardcode the version in workflow YAML.
- **Ingestion / crawler:** `npm run ingest` upserts newly discovered sets & DJs.
  **Primary sources:** SoundCloud (`src/lib/ingest/soundcloud/`) curated shows
  + curated playlists (`soundcloud/playlists.ts`, e.g. Lift Sets) via api-v2 +
  **hearthis.at** house categories + curated artist accounts
  (`src/lib/ingest/hearthis/` — structured `/{user}/{track}/playlist/` cues,
  then description / timed comments; e.g. Gentlemen's Groove) +
  **YouTube** curated sets + venue channels + tracklist-heavy artist channels
  (`src/lib/ingest/youtube/` — Boiler Room / Cercle / Mixmag / DJ Mag /
  SECTION. (`@section_hq`, filmed techno DJ sets, YT Music song credits) +
  James Hype–style artist channels; description tracklists and YouTube Music
  song credits) + **DJ Mag Live Sets** (`src/lib/ingest/djmag/` — scrape
  `djmag.com/livesets` for YT embeds, tracklists from YT description/credits;
  dedupes `@DJMag` via `yt-{videoId}`) +
  **Bandcamp** curated tracks/albums (`src/lib/ingest/bandcamp/`).
  **Roster / deep scan:** identified artists live in
  `src/lib/ingest/roster.ts` (drives YT artist channels + extra SC shows).
  YouTube deep-scan uses `/videos` + `/streams` + Innertube continuation
  (`YOUTUBE_ARTIST_VIDEO_LIMIT`, `YOUTUBE_CONTINUATION_PAGES`).
  **Discovery:** before poll, cross-link YT About ↔ SC profile socials
  (`data/handle-report.json` + `.md` lists artists still missing handles).
  Catalog DJs with YouTube sets also get channel About + description
  “Connect with…” socials (`npm run catalog-yt-socials` /
  `CATALOG_YT_SOCIALS_LIMIT`) — fill-null on Dj, promote SC/YT for crawl;
  venue channels (Tomorrowland / Boiler Room / …) are skipped. After ingest,
  B2B collaborators + co-played track artists land in
  `data/artist-candidates.json` and auto-promote when handles resolve
  (`DISCOVERY_PROMOTE_SCORE`, `DISCOVERY_PROMOTE_CAP`). SC has adaptive poll
  limits (`data/soundcloud-poll-state.json`). **sourceHash refresh** when
  tracklists change; SetArtist links refresh even on hash skip. Optional:
  `HEARTHIS_MAX_SETS`, `SOUNDCLOUD_ARTIST_TRACK_LIMIT`, `INGEST_TOPDJS=1`,
  `INGEST_SYNTHETIC=1`, `SOUNDCLOUD_CLIENT_ID`.   **1001Tracklists:** follow
  `1001.tl` / tracklist URLs already linked from a source description (or
  curated browser-capture seeds) — do **not** site-crawl or invent URLs.
  **setlist.fm:** follow a concrete `/setlist/{artist}/{year}/{venue}.html`
  URL already linked from a source description (or operator paste) — do
  **not** crawl `setlist.fm/setlists/` or invent URLs. Concert-first wiki,
  usually no clocks; not a primary ID source. Official API needs a key +
  followable attribution and is free only for non-commercial use — do not
  poll HTML or the API without a producer key and clearance.
  **MixesDB:** follow a concrete `/w/YYYY-MM-DD_-_…` mix page already
  linked from a source description (or operator paste), **or** one
  `insource:` lookup keyed by a YT/SC/hearthis/Mixcloud URL we already
  store, or an Apple Music album id MixesDB indexed as a player (lookup
  key only — never on-site playback). Do **not** crawl Category /
  Explorer, search by artist name, or invent `/w/…` titles. Never create
  sets from MixesDB-only pages. Timed `[mm:ss]` / `[mm]` marks overlay
  clocks (`provenance: "mixesdb"`); untimed numbered lists stay out. Live
  HTML/API is Cloudflare-gated — default do not fetch
  (`INGEST_ALLOW_MIXESDB_FETCH=1` on a human laptop). `/stats` **Search
  MixesDB** opens that player-URL search. CC-BY-SA 3.0 attribution is the
  MixesDB provenance label. Never a set/playback source.
  **Apple Music DJ-mix albums:** first-party per-track times are *segment
  lengths* (often “(Mixed)”), not MixesDB `[mm:ss]` cues. Accumulate those
  official lengths into start clocks (`provenance: "applemusic"`) from
  operator paste or `scripts/capture-applemusic.console.js` on the album
  page already open. iTunes Lookup returns the album shell only for many
  AM-only mixes — do **not** scrape `music.apple.com` from CI. Never
  on-site playback (embed SC / Mixcloud / YT only).
  **Atlas:** `/atlas` maps DJ Mag Top 100 Clubs & Festivals 2026
  (`data/venue-seeds/djmag-atlas-2026.json` lat/lng + YoY) plus Top 100 DJs
  2025 (`data/artist-seeds/djmag-atlas-djs-2025.json`). Venue pins link to
  `/events/{slug}`; DJ pins link to `/djs/{slug}`. Country-level DJs
  spiral-spread; Claptone is list-only (`nomap`).
  Pages: **push = no crawl** unless curated catalog sources changed
  (`soundcloud/`, `youtube/`, `tracklists1001/`, roster, …). Default path:
  restore cached `prisma/dev.db` → `verify-urls` (pins/remaps) → static
  export → deploy (~minutes). Deep verify skips a Wikidata official-site
  lookup for 21 days after a miss (`data/crosscheck/official-site-miss.json`;
  `DJMAG_ENRICH_FORCE=1` recrawls) and HEADs a stored social/www only when
  the URL is new or last-ok is older than 30 days
  (`data/crosscheck/url-probe.json`; `VERIFY_URLS_FORCE=1` re-probes).
  Both files ride the Actions discovery cache — not committed. New SC/YT roster seeds on the same push still
  run the light curated ingest (existing catalog slugs are not re-watched).
  1001 clocks overlay in verify-urls (no poll).
  `catalog-deep` / enrich **dispatch** this
  workflow and never re-poll. Next `output: "export"` still regenerates
  all HTML (no ISR on GitHub Pages). **cron/manual `deep` = full ingest +
  thumbs + cache DB**. Repo Pages Source must be **GitHub Actions** (not
  branch/`/`), or GitHub race-serves this README.
  **Single deployer:** `deploy-pages.yml` is the ONLY workflow that builds +
  publishes Pages. Overnight chain: `catalog-deep` saves the DB then
  **dispatches `catalog-enrich` `full`** (thumbs + MusicBrainz + ACR +
  filescan + handles/tracks + cue dry-run + Spotify fill-null). Enrich then
  dispatches Pages. Do not run deep and
  enrich in parallel — both write `prisma/dev.db` cache. Bump
  `data/deep-request` to start the chain; `data/enrich-full-request` starts
  full enrich alone; `data/enrich-request` is the fast `acr` pass. To ship,
  the producer merges from GitHub. To fix the build, edit one workflow.
  Agents keep small updates on one PR so that publish is one export.
- **LLM handle research:** `npm run research:handles` (catalog-deep + enrich
  `full`, or dedicated `catalog-llm-research.yml`). Claude (`CLAUDE_AGENT_API`
  or `ANTHROPIC_API_KEY`) and/or Gemini (`GEMINI_API_KEY` from
  [AI Studio](https://aistudio.google.com/apikey) — not gemini.google.com/app).
  Aliases: `GEMINI_AGENT_API` / `GEMINI` / `GOOGLE_API_KEY`. Gemini is
  preferred when present (Search grounding). Propose official socials for DJs
  that have sets but no handle. **Verify-then-write:** live profile URL +
  handle matches the DJ name + not owned by another Dj. Never invents `@slug`
  guesses. **Disclose, then spend on a standing budget.** `complete()` is the
  only model path and throws unless `announceLlmPlan()` has printed what each
  job tracks (variables), what is sent, what may be written, and the USD range.
  Catalog LLM research sets `LLM_RESEARCH_CONFIRM=1` for dispatch and
  `data/llm-request` pushes — no per-run Accept / `llm-spend` reviewer. Local
  CLI still needs the env flag or a TTY `yes`. Every job then prints tracked /
  found / partial parked / no-match. Partial and empty rows stay in the
  report so the same slug / track / set is not retraced. Job wording lives in
  `LLM_JOB_DISCLOSURE` (`llmPlan.ts`) plus `LLM_JOB_VARIABLES`
  (`llmTrackRecord.ts`) — a test fails if a job has no disclosure. `npm run
  research:plan` prints the plan and sends nothing. **Deep / enrich never
  call a model** — they run `research:plan` plus the parser-only cue step
  (`LLM_RESEARCH=0`, no keys passed). `/stats` cannot dispatch LLM. After each
  Catalog LLM research run (apply 0 or 1) the job caches `data/crosscheck/llm-*.json`
  plus the catalog DB and dispatches Pages with `restore_run_id` so the Last
  LLM card and DJ complete list match that run. `apply=1` writes handles;
  dry-run still refreshes the card. Reports in
  `data/crosscheck/llm-handle-research.json`.
  **Cue job** (`LLM_RESEARCH_JOBS=cues` or `all`): re-parse first-party
  YT/SC/hearthis on empty/stub lists. Queue ranks live YT/hearthis ahead of
  weekly radio; radio without clocks does not consume the limit. Parser
  clocks always write (no LLM key needed). `LLM_RESEARCH_APPLY=0` gates
  **LLM extras only** — extras must already appear in that text; never
  interpolate; never overwrite 1001tl / fingerprint / community. Enrich
  `full` and Catalog LLM research default to parser apply / LLM extras
  dry-run. Report: `data/crosscheck/llm-cue-research.json`.
  **Defer a capture:** rows with no findable tracklist park in
  `data/capture-defer.json` (`{slug, until, note}`). `activeDeferSlugs()`
  filters them **before** the 40-row cap, so the next candidate takes the
  slot; expired rows return on their own and nothing is deleted. `/stats` has
  a per-row **Later** button (localStorage, this browser only) plus **Copy
  defer JSON** to commit the shared version. Wiring a tracklist is the real
  fix — never park a row to "finish" it.
  **/stats queues:** flat, no nesting. **Capture 1001** (`#capture-1001`) is
  the only set queue on the page — it has real actions (Open SC/YT, Search
  1001, Copy capture). `statsWorkbench.ts` still ranks text / ACR / IDs lanes
  and keeps its tests, but nothing renders it: those lanes had no operator
  action and starved each other at the 40-row cut. Do not re-add a workbench
  fold without per-row actions and a per-lane quota. DJ complete and
  places-without-a-set are the other queues.
  **Host-twin fold:** same 1001 seed + both official YT and SC permalinks
  already known → one catalog row, both URLs kept, SC-first playback,
  secondary slug aliases to the survivor. Never invents a missing host.
  Distinct performances stay separate.
  **Track export:** `npm run export:tracks` dumps catalog tracks (CSV +
  Claude JSONL) to `data/track-id-export/`. Pages `prebuild` also writes
  `/exports/tracks-need-id.csv` and `.jsonl` (no-ISRC, most-played first).
  Claude may propose ISRC / Beatport `/track/{slug}/{id}` only — never
  invent; Deezer/MB must confirm before write. Download from `/stats`.
  **Entity export:** `npm run export:entities` dumps DJs / festivals / clubs
  missing a thumb, official website, or first-party social
  (`data/entity-complete-export/`). Pages writes `/exports/djs-need-complete.csv`,
  `festivals-need-complete.csv`, `clubs-need-complete.csv`, plus combined
  `entities-need-complete.csv` / `.jsonl` and `claude-entity-complete-prompt.md`.
  `/stats` links **Export for Claude complete**. Never invent `@slug` handles;
  DJ Mag / 6am / Wikipedia / Grokipedia / Discogs / Insomniac artist hubs
  are not official websites — but a concrete URL already in hand is
  followable evidence (outbound first-party links, distinctive bio,
  homeCity, genre). Do not crawl those hosts or invent `/page/` titles
  or Discogs artist ids. A leaf that names a different act is a miss.
  DJ Mag Top 100 DJ profiles (`djmagUrl` on the seed) may fill From:,
  a canonical DJ style, and the body lede — never the listing
  `/top100djs`, never `Dj.website`, and never the rank dump
  `DJ Mag Top 100 DJs 2025 · #N` as a bio.
  The DJ Mag chart URL is
  **kept**, not discarded: `djmagUrl` lives on every row of
  `data/venue-seeds/djmag-atlas-2026.json`,
  `djmag-top100-festivals-2026.json`, `data/artist-seeds/djmag-top100-djs-2025.json`
  and `djmag-atlas-djs-2025.json`. It is never written to `Dj.website` /
  `Event.website` and never displayed while a first-party URL exists.
  Acronym handles are accepted when the acronym leads the handle and the rest
  is a remaining name word or generic filler (`acronymMatchesHandle` —
  Vision & Colour Music Festival → `@vacfestival`, `&` counts as "and"). Verify-then-pin
  (`data/entity-complete-pins.json`, fill-null on verify-urls). Wide
  `djs-need-complete` CSV also fills-null `homeCity` / distinctive `bio` /
  canonical `genre` on Dj. Template bios, DJ Mag / RA websites, and
  name-mismatched handles stay out. `linktr.ee` / `komi.io` are fill-null
  website fallbacks only when no artist site is on file. Event has no
  `youtube` column — drop venue YouTube rows. Empty / “cannot confirm” rows stay out.
  **Track IDs:** `npm run research:track-ids` resolves ISRCs / Beatport URLs
  / canonical Spotify `/track/{22}` (Client Credentials, fill-null
  `Track.spotifyUrl`)
  from held 1001 names, then ACR Identify / File Scan hits still missing
  ISRC or Beatport (`TRACK_ID_FINGERPRINT_LIMIT`), then high-play catalog
  tracks missing ISRC **or** Beatport (`TRACK_ID_HELD_LIMIT`,
  `TRACK_ID_CATALOG=0` skips catalog). Empty official playbacks rank first
  for Identify / File Scan so those hits can hand off here.
  Catalog enrich `acr` (80 ISRC/Beatport + 200 Spotify) and `full`
  (120 + 400) run this automatically with `TRACK_ID_APPLY=1` — do not
  dispatch enrich/Pages to start it while those workflows are already
  running. Fast path: rows that already have an ISRC skip Deezer/AudD and
  look up MusicBrainz **by ISRC** (Beatport `/track` url-rels only —
  release pages are not scraped). Missing-ISRC rows run Deezer + TrackRadar
  + AudD in parallel, then MB. A new ISRC from Spotify / Deezer re-queries
  MB by ISRC for the Beatport rel. Queue is ~60% no-ISRC / ~40%
  have-ISRC-no-Beatport, then a second `TRACK_ID_SPOTIFY_LIMIT` pass of
  have-ISRC rows whose Spotify field is still a search URL (one `isrc:`
  Client Credentials lookup; upgrades search → `/track/{22}`). Needs
  `SPOTIFY_CLIENT_ID` + `SPOTIFY_CLIENT_SECRET`. No catalog DB → live
  `/exports/tracks.csv` (`TRACK_ID_EXPORT=0` skips). Confirmed hits also
  fill-null `data/track-id-pins.json` (verify-urls / Pages). Chain: Deezer,
  MusicBrainz (on unless `TRACK_ID_MB=0` — MBID / ISRC / Beatport url-rels),
  TrackRadar public archive (no key; MCP needs `TRACKRADAR_API_KEY`), and
  AudD `findLyrics` (no token; `AUDD=0` skips).
  Beatport is never scraped — only canonical `/track/{slug}/{id}` from MB
  or TrackRadar. HEAD-only liveness (`npm run probe:beatport-heads --
  --since <ref>`) checks those URLs without fetching HTML; 404 drops the
  URL and keeps the ISRC, 403/429 is Cloudflare and the URL stays.
  Set79 is sitemap-only (`SET79=0` skips); login HTML and
  their paid analyzer are never fetched. AudioScout / MusicMate / TrackId
  stay paste-only (`fingerprint/seeds.ts`). `TRACKRADAR_ANALYZE=1` /
  `AUDD_ANALYZE=1` analyze fingerprint-only fan YouTube (quota, never
  official playback). Fan clips in `FINGERPRINT_ONLY_WATCH` are Identify-offset
  probes only — never `sourceUrl` / FileScan. LLM job `tracks` writes
  fill-null IDs only when Deezer/MB confirms the proposal.
- **Artwork thumbnails:** `npm run thumbs` fills null `imageUrl` on Dj / Label /
 Track / Set via the Deezer Search API (no key). Idempotent; skips rows that
 already have art. Sets fall back to the primary DJ image. The Pages workflow
 runs this only after a curated ingest on that deploy. UI uses `EntityThumb`
 with monogram fallback.
  **Venue / club thumbs (habit):** every `verify-urls` / Pages pass fills
  null `Event.imageUrl` — curated `KNOWN_EVENT_IMAGES`, then official-site
  Open Graph (`EVENT_OFFICIAL_SITES` + calendars + `KNOWN_EVENTS.website`),
  then Wikipedia summary art (name must match), then latest set art.
  Deezer is never used for venues. Leftovers stay on
  `/exports/clubs-need-complete.csv` for Claude. Do not use DJ Mag photos.
- **Fingerprint enrich:** `npm run enrich:fingerprint` via `catalog-enrich.yml`
  in **modes** (workflow_dispatch `mode`, or `data/enrich-request` bump = `acr`):
  `full` (weekly cron — null thumbs + MB + Identify 28×16 + File Scan 20),
  `acr` (priority Identify 20×12 + File Scan 16, no thumbs/LLM),
  `smoke` (tiny ACR check, 4×5 — verify creds/cookies). Modes run in separate
  concurrency lanes so a quick check never queues behind the weekly `full`.
  Each expensive step has a timeout + continue-on-error and writes a DB
  checkpoint (`setradar-db-<run>-1identify` / `-2filescan` / exact run id).
  GitHub hosted jobs die at 6h and otherwise skip Save/Pages — do not pack
  thumbs + a 40×20 Identify loop + File Scan + 400 ISRCs into one uncapped job.
  **Automated IDs** (Catalog enrich, standing budget — no per-run Accept):
  Identify + File Scan write artist / title / ISRC / score / offset; first-party
  cue parser apply; track-id ISRC/Beatport fill-null. Weak or empty probes park
  those fields as grey `acr-miss` so the same offset is not retraced. Every pass
  prints the variables, probe count, hits, partials, no-match, and hit rate.
  **Manual IDs:** Capture 1001, Suggest ID / `resolutions.json`, wire official
  playbacks, entity-complete pins. LLM research is automated on Catalog LLM
  research (standing budget; prints variables / tracked / found / partials).
  Local CLI still requires `ACRCLOUD_CONFIRM_SPEND=1`. `acrIdentify()`,
  `submitPlatformScan()` and AudD throw unless `announceAcrPlan()` ran for that
  process. Catalog enrich sets confirm=1 for cron, `data/enrich-request` pushes,
  and dispatch — it no longer uses the `acr-spend` environment. Diagnose keeps
  that environment. **AudD is tried before ACR on each clip** when
  `AUDD_ANALYZE=1` + `AUDD_API_TOKEN`. Rates are rounded operator guesses; set
  `ACR_USD_PER_IDENTIFY_LOW/HIGH` and `ACR_USD_PER_FS_HOUR_LOW/HIGH` to your
  real plan rate.
  Samples SC/hearthis `playbackUrl`
 via ffmpeg → ACRCloud Identify (`ACRCLOUD_*` secrets + `ACRCLOUD_ENABLED=1`).
  YouTube festival playbacks (Top20 / festival priority by default) use `yt-dlp
  --download-sections` for short clips, then the same Identify path
  (`ACRCLOUD_ALLOW_YOUTUBE_PRIORITY=1`; full YT with `ACRCLOUD_ALLOW_YOUTUBE=1`).
  **Diagnostic (`npm run` via `catalog-acr-diagnose.yml`):** Identify clips
  HIT around score 64, so `ACRCLOUD_MIN_SCORE=55` (70 rejected real YT hits).
  File Scan of the Rick Astley control often scores ~47 — diagnose counts
  that named hit even below the catalog write floor. yt-dlp `unavailable` /
  bot-wall on GitHub IPs is expected and does not fail the job when File
  Scan names the control.
  **CI caveat:** GitHub Actions datacenter IPs get YouTube bot-walled ("Sign in
  to confirm you're not a bot") even WITH `YT_DUMMY_COOKIE_LOCAL`; only very
  popular videos slip through. SC/hearthis Identify is unaffected.
  CI Identify sets `ACRCLOUD_IDENTIFY_YOUTUBE=0` so yt-dlp does not burn hours
  on bot-walls — File Scanning is the YouTube path. A bot-wall still opens a
  circuit (skip remaining YT Identify, fail-fast yt-dlp) and writes
  `::notice::` / `::warning::` plus a live Job Summary table without failing
  the job. Clip failures count toward the per-set probe cap.
  `YT_DUMMY_COOKIE_LOCAL` is a portable Netscape secret (throwaway YouTube
  login only — never a personal Google jar). The device that starts the
  workflow does not matter — `ubuntu-latest` is the IP YouTube sees. Cookies
  do not make GHA YouTube-steady; refresh the dummy jar when `/stats` Last
  enrich marks it stale (`npm run cookies:export` on a desktop, then
  `gh secret set YT_DUMMY_COOKIE_LOCAL < .local/yt-cookies.txt`).   Identify +
 File Scan totals land on `/stats` after the next Pages ship (DB snapshot).
 The **run rows refresh live** — the repo is public, so `StatsLiveRuns` reads
 the Actions API from the browser (no token) and replaces the export snapshot,
 which can never show Pages' own conclusion because it is written mid-run.
 It polls only while a run is active. Keep `actionsStatus.ts` (node:fs) out of
 client components — put shared helpers in `actionsLive.ts`.
- **File Scanning (YouTube, CI-safe):** `npm run enrich:filescan`
  (`src/lib/ingest/enrich/acrFileScan.ts`; step in `catalog-enrich.yml`).
  Server-side — POST the YouTube URL to an ACRCloud **File Scanning** container;
  ACR downloads + fingerprints the whole video and returns matched tracks with
  offsets, bypassing the CI bot wall. Uses a YouTube-only sparse queue (does
  not share Identify's SC-first ranking) and skips held official playbacks. Reuses files
  already in the ACR container (no second POST of the same YouTube URL).
  Identify and File Scan record grey `acr-miss` rows (names / ISRC on weak
  hits) so the same offset is not re-probed.
  Writes the
  same `provenance: "fingerprint"` gap-fill rows (never overwrites source).
  Operator secrets: `ACRCLOUD_FS_TOKEN`
  (Console API bearer) + `ACRCLOUD_FS_CONTAINER_ID` (+ optional
  `ACRCLOUD_FS_REGION`, default eu-west-1). No-op unless configured.
  Fills timeline gaps only with `provenance: "fingerprint"`; never overwrites
  `sourceUrl` / `sourceName`. On success, enrich
  dispatches a fast Pages deploy. Agents cannot set repo secrets or (usually)
  dispatch workflows — operator adds `ACRCLOUD_HOST` / `ACCESS_KEY` /
  `ACCESS_SECRET` under Settings → Secrets, then runs Catalog enrich. Manual
  pasted IDs (ACRCloud/AudD / aha-music) live in
  `src/lib/ingest/fingerprint/seeds.ts` via `fingerprintPlays` — do not scrape
  AudioScout / TrackId / MusicMate.
- **Standard commands** live in `package.json` scripts and `README.md`; prefer
  those over ad-hoc invocations.
