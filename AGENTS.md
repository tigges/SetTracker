<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

setradar.ai (package name `setradar`) is a single Next.js 16 app (App Router +
Turbopack) backed by Prisma 6 on SQLite. There is only one service to run.
GitHub Pages still deploys at `/SetTracker` (repo path); product brand is
setradar.ai.

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
- **Ingestion / crawler:** `npm run ingest` upserts newly discovered sets & DJs.
  **Primary sources:** SoundCloud (`src/lib/ingest/soundcloud/`) curated shows
  + curated playlists (`soundcloud/playlists.ts`, e.g. Lift Sets) via api-v2 +
  **hearthis.at** house categories (`src/lib/ingest/hearthis/` — structured
  `/{user}/{track}/playlist/` cues, then description / timed comments) +
  **YouTube** curated sets + venue channels + tracklist-heavy artist channels
  (`src/lib/ingest/youtube/` — Boiler Room / Cercle / Mixmag + James Hype–style
  artist channels; description tracklists and YouTube Music song credits) +
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
  `INGEST_SYNTHETIC=1`, `SOUNDCLOUD_CLIENT_ID`. **1001Tracklists:** follow
  `1001.tl` / tracklist URLs already linked from a source description (or
  curated browser-capture seeds) — do **not** site-crawl or invent URLs.
  Pages: **push =
  no crawl** (restore cached `prisma/dev.db` → build → deploy, ~minutes);
  **cron/manual `deep` = full ingest + thumbs + cache DB**. Repo Pages Source
  must be **GitHub Actions** (not branch/`/`), or GitHub race-serves this README.
- **Artwork thumbnails:** `npm run thumbs` fills null `imageUrl` on Dj / Label /
 Track / Set via the Deezer Search API (no key). Idempotent; skips rows that
 already have art. Sets fall back to the primary DJ image. The Pages workflow
 runs this after ingest. UI uses `EntityThumb` with monogram fallback.
- **Fingerprint enrich:** `npm run enrich:fingerprint` (weekly / dispatch
 `catalog-enrich.yml` after thumbs/MB). Samples SC/hearthis `playbackUrl`
 via ffmpeg → ACRCloud Identify (`ACRCLOUD_*` secrets + `ACRCLOUD_ENABLED=1`).
 Fills timeline gaps only with `provenance: "fingerprint"`; never overwrites
 `sourceUrl` / `sourceName`. Prefers SC/hearthis over YT
 (`ACRCLOUD_ALLOW_YOUTUBE=0` by default). On success, enrich dispatches a
 fast Pages deploy. Agents cannot set repo secrets or (usually) dispatch
 workflows — operator adds `ACRCLOUD_HOST` / `ACCESS_KEY` / `ACCESS_SECRET`
 under Settings → Secrets, then runs Catalog enrich. Manual pasted IDs
 (ACRCloud/AudD / aha-music) live in `src/lib/ingest/fingerprint/seeds.ts`
 via `fingerprintPlays` — do not scrape AudioScout / TrackId / MusicMate.
- **Standard commands** live in `package.json` scripts and `README.md`; prefer
  those over ad-hoc invocations.
