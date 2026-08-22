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

**Relive is Tomorrowland-only.** Relive is Tomorrowland's product name and
is confusing used for other festivals. In UI, agent docs, and generic
comments, say **playback** (or official playback). Keep Relive only for
the Tomorrowland Relive series (`seriesName: "Tomorrowland Relive"`,
`officialRelivePlaylists()`, `looksLikeRelive()`, `reliveWatch` files,
`reason: "relive:official-unwired"`). Do not rename those internals
unless asked.

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
  (`src/lib/ingest/youtube/` — Boiler Room / Cercle / Mixmag / DJ Mag + James
  Hype–style artist channels; description tracklists and YouTube Music song
  credits) + **DJ Mag Live Sets** (`src/lib/ingest/djmag/` — scrape
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
  **Atlas:** `/atlas` maps DJ Mag Top 100 Clubs & Festivals 2026
  (`data/venue-seeds/djmag-atlas-2026.json` lat/lng + YoY) plus Top 100 DJs
  2025 (`data/artist-seeds/djmag-atlas-djs-2025.json`). Venue pins link to
  `/events/{slug}`; DJ pins link to `/djs/{slug}`. Country-level DJs
  spiral-spread; Claptone is list-only (`nomap`).
  Pages: **push = no crawl** unless curated catalog sources changed
  (`soundcloud/`, `youtube/`, `tracklists1001/`, roster, …). Default path:
  restore cached `prisma/dev.db` → `verify-urls` (pins/remaps) → static
  export → deploy (~minutes). New SC/YT roster seeds on the same push still
  run the light curated ingest. 1001 clocks overlay in verify-urls (no poll).
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
  guesses. No-op without keys on deep/enrich; dedicated workflow fails if
  both keys are missing. Trigger on main by bumping `data/llm-request`.
  Reports in `data/crosscheck/llm-handle-research.json`.
  **Cue job** (`LLM_RESEARCH_JOBS=cues` or `all`): re-parse first-party
  YT/SC/hearthis on empty/stub lists. Parser path works without an LLM key.
  LLM may write only clocks that already appear in that text — never
  interpolate, never overwrite 1001tl / fingerprint / community. Enrich
  `full` runs this **dry-run** (`LLM_RESEARCH_APPLY=0`) after
  handles/tracks. Report: `data/crosscheck/llm-cue-research.json`.
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
  DJ Mag / 6am / Wikipedia are not official websites. Verify-then-pin
  (`data/entity-complete-pins.json`, fill-null on verify-urls). Event has no
  `youtube` column — drop venue YouTube rows. Empty / “cannot confirm” rows stay out.
  **Track IDs:** `npm run research:track-ids` resolves ISRCs / Beatport URLs
  / canonical Spotify `/track/{22}` (Client Credentials, fill-null
  `Track.spotifyUrl`)
  from held 1001 names, then high-play catalog tracks missing ISRC **or**
  Beatport (`TRACK_ID_HELD_LIMIT`, `TRACK_ID_CATALOG=0` skips catalog).
  Catalog enrich `acr` (120) and `full` (400) run this automatically with
  `TRACK_ID_APPLY=1` — do not dispatch enrich/Pages to start it while those
  workflows are already running. Fast path: rows that already have an ISRC
  skip Deezer/AudD and look up MusicBrainz **by ISRC** (Beatport `/track`
  url-rels only — release pages are not scraped). Missing-ISRC rows run
  Deezer + TrackRadar + AudD in parallel, then MB. Queue is ~60% no-ISRC /
  ~40% have-ISRC-no-Beatport. No catalog DB → live
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
  `gh secret set YT_DUMMY_COOKIE_LOCAL < .local/yt-cookies.txt`). Identify +
  File Scan totals land on `/stats` after the next Pages ship (DB snapshot +
  last enrich/deep/Pages conclusions).
- **File Scanning (YouTube, CI-safe):** `npm run enrich:filescan`
  (`src/lib/ingest/enrich/acrFileScan.ts`; step in `catalog-enrich.yml`).
  Server-side — POST the YouTube URL to an ACRCloud **File Scanning** container;
  ACR downloads + fingerprints the whole video and returns matched tracks with
  offsets, bypassing the CI bot wall. Uses a YouTube-only sparse queue (does
  not share Identify's SC-first ranking) and skips held official playbacks. Reuses files
  already in the ACR container (no second POST of the same YouTube URL).
  Identify records grey `acr-miss` rows so the same offset is not re-probed.
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
