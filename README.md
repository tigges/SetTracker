# setradar.ai

A bass house DJ **set database** (MVP), branded as **setradar.ai**. Browse radio
episodes, festival sets and SoundCloud mixes; every track row carries a
**status** and **provenance** so you can see what's identified and what's still
an ID.

> Live app: https://setradar.ai/
>
> **Pages setup (required):** Repo → Settings → Pages → **Source = GitHub Actions**
> (not “Deploy from a branch”). If Source is the `main` branch root, GitHub
> briefly serves this README as the site — that is the blank “Stack / Data model”
> page, not the product.
>
> **Deploy speed:** pushes rebuild the site **without crawling** (uses the last
> cached catalog DB, ~2–4 min). Full source crawls run on the 6h cron or via
> Actions → Deploy → `deep`.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** for the dark, club/DJ-software adjacent UI
- **Prisma 6** ORM on **SQLite** (zero-config local dev)

## Data model

Entities: `Dj`, `Set`, `Track`, `Label`, `Event`, `Series`, and a first-class
`IdTrack` (unreleased/unknown "ID", resolvable later). The core edge is
`Played` (`set` × `position` × `timestamp` × `track`/`idTrack` × `provenance` ×
`idStatus`).

### Status color semantics (used everywhere)

| Color   | Status               | Meaning                                   |
| ------- | -------------------- | ----------------------------------------- |
| amber   | `identified`         | Released track, positively identified     |
| magenta | `unresolved_id`      | Unreleased / unknown — awaiting an ID     |
| teal    | `community_resolved` | Was an ID, resolved by the community      |
| grey    | `unparsed`           | Raw source text, not matched to a record  |

Provenance per row: `1001TL parse`, `SoundCloud parse`, `fingerprint`, `community`.

## Pages

1. **Sets feed** (`/`) — time-grouped (This week / Earlier).
2. **Set detail** (`/sets/[slug]`) — a horizontal **set strip** (segmented
   timeline colored by track status); click a segment to jump to its tracklist
   row.
3. **DJ profile** (`/djs/[slug]`) — series, recent sets, most-played tracks,
   collaborators and source health.
4. **Events** (`/events`, `/events/[slug]`) — festivals, clubs, livestreams.
5. **Top 100 Atlas** (`/atlas`) — DJ Mag 2026 clubs & festivals plus 2025 DJs
   on a world map, linked to catalog sets and DJ profiles.
6. **Labels** (`/labels`, `/labels/[slug]`) — imprint index and profiles.

## Getting started

```bash
npm install
npm run db:setup   # apply migrations + seed mock data
npm run thumbs     # resolve Deezer/iTunes artwork into imageUrl fields
npm run dev        # http://localhost:3000
```

## Scripts

| Script             | Description                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start the dev server (Turbopack)         |
| `npm run build`    | Production build                         |
| `npm run lint`     | ESLint                                   |
| `npm run db:migrate` | Create/apply a dev migration           |
| `npm run db:deploy`  | Apply committed migrations             |
| `npm run db:seed`    | Seed mock data                         |
| `npm run db:setup`   | `db:deploy` + `db:seed`                |
| `npm run db:reset`   | Drop, re-migrate and re-seed the DB    |
| `npm run ingest`     | Upsert sets from SoundCloud (+ optional backfill) |
| `npm run crosslink`  | Scrape YT/SC profiles + link hubs → handle report |
| `npm run catalog-sc-socials` | Fill Dj YouTube/IG/… from SC bio plain-text links |
| `npm run catalog-yt-socials` | Fill Dj socials from YT About / description links |
| `npm run thumbs`     | Resolve artwork URLs (Deezer / iTunes) |
| `npm run enrich:fingerprint` | ACRCloud gap-fill for sparse sets (`ACRCLOUD_*`) |
| `npm run crosscheck:set-density` | Flag thin tracklists (duration vs play count) |

### Handle cross-link (automatic)

`npm run crosslink` (also the first step of ingest) scrapes each roster artist's
YouTube About + SoundCloud bio for outbound links, then expands hubs
(`hoo.be`, `lnk.to`, `fanlink`, `linktr.ee`, …). It resolves
`youtube.com/channel/UC…` → `@handle`, writes `data/handle-report.md`, and
promotes candidates. Prefer pasting a channel / hub once into the roster; the
crawler fills the rest on the next deep ingest.

### SoundCloud ingest

Primary pipeline (`src/lib/ingest/soundcloud/`): polls curated DJ/show accounts
via SoundCloud’s public api-v2, keeps long-form radio/live/mix uploads, parses
description tracklists and timed comments into `Played` rows (`provenance:
soundcloud`). Idempotent by `sc-{user}-{permalink}` slug.

| Env | Effect |
| --- | --- |
| `SOUNDCLOUD_CLIENT_ID` | Optional override (else discovered from SC page hydration) |
| `INGEST_SKIP_TOPDJS=1` | SoundCloud only (skip synthetic top-100 backfill) |
| `INGEST_SYNTHETIC=1` | Also emit legacy demo rows |

Ingest **refreshes** a set when its `sourceHash` changes (new description /
comments), keeping prior community resolutions. Adaptive polling prefers hot
accounts (see `data/soundcloud-poll-state.json`).

### Suggest ID (community wedge)

On unresolved / unparsed rows, **Suggest ID** opens a GitHub issue with a
`data/resolutions.json` snippet. Approved entries are applied on the next
ingest/deploy and flip the play to `community_resolved`.

The SQLite database lives at `prisma/dev.db` (git-ignored). Connection string
is in `.env` (`DATABASE_URL="file:./dev.db"`).

## Deploy (GitHub Pages)

The app publishes as a fully static site. **`deploy-pages.yml` is the single
deployer** — the only workflow that builds + publishes Pages. Producers save the
catalog DB cache and dispatch it:

- **push to `main`** — fast path (no crawl): restore cached catalog DB → light curated ingest → export → deploy
- **6h cron / manual `deep`** (`catalog-deep.yml`) — crawl → save DB cache → dispatch deploy
- **`catalog-enrich.yml`** — thumbs/MB + ACRCloud gap-fill → save DB cache → dispatch deploy

**Enrich modes** (`catalog-enrich.yml`): `full` (weekly cron; thumbs + MusicBrainz
+ deep ACR 40×20), `acr` (priority ACR only, no thumbs, 15×12; also the
`data/enrich-request` push default), `smoke` (tiny ACR check 4×5 — verify
creds/cookies). Each mode runs in its own concurrency lane.

### ACRCloud fingerprint enrich

`npm run enrich:fingerprint` samples SoundCloud / hearthis playback and
identifies clips via ACRCloud. For **YouTube** (Top 100 / festival priority by
default), short clips are cut with `yt-dlp --download-sections` then identified
the same way. Writes `Played` rows with `provenance: fingerprint` into
**timeline gaps only** — never overwrites
`sourceUrl` / `sourceName`, never scrapes AudioScout / TrackId / 1001TL.

| Env | Effect |
| --- | --- |
| `ACRCLOUD_ENABLED=1` | Hard gate (no network without this) |
| `ACRCLOUD_HOST` | Identify host, e.g. `[REDACTED]` |
| `ACRCLOUD_ACCESS_KEY` / `ACRCLOUD_ACCESS_SECRET` | Project credentials |
| `ACRCLOUD_SET_LIMIT` | Max sets per run (default 5) |
| `ACRCLOUD_SAMPLE_SEC` / `ACRCLOUD_STEP_SEC` | Clip length / spacing (12 / 90) |
| `ACRCLOUD_MIN_SCORE` | Accept identified hits ≥ score (default 55; YT clips score lower) |
| `ACRCLOUD_ALLOW_YOUTUBE=1` | Allow all YT sets (default off) |
| `ACRCLOUD_ALLOW_YOUTUBE_PRIORITY=1` | YT for Top20 / festival sparse (default on) |
| `ACRCLOUD_YT_DLP=0` | Disable yt-dlp YouTube sampling |
| `ACRCLOUD_YTDLP_COOKIES` | Path to Netscape cookies.txt (bot wall bypass) |

#### YouTube via File Scanning (recommended for CI)

yt-dlp sampling from GitHub Actions hits YouTube bot walls (datacenter IPs) even
with cookies. **ACRCloud File Scanning** offloads the download+scan to ACRCloud's
own servers — we POST the YouTube URL, ACR fingerprints the whole video and
returns every matched track with an offset. `npm run enrich:filescan` (and a
step in `catalog-enrich.yml`) scans a **YouTube-only** sparse queue this way
(Identify keeps SoundCloud/hearthis first; File Scanning does not share that
ranking). Held Relives on the fan-clip watch list are skipped. Already-scanned
YouTube files in the ACR container are reused (no re-submit). Identify writes
grey `acr-miss` rows so the same offset is not probed again. Writes the same
`provenance: fingerprint` gap-fill rows. No-op unless configured.

| Env | Effect |
| --- | --- |
| `ACRCLOUD_FS_TOKEN` | Console API bearer token (File Scanning) |
| `ACRCLOUD_FS_CONTAINER_ID` | File Scanning container id |
| `ACRCLOUD_FS_REGION` | `eu-west-1` (default) / `us-west-2` / `ap-southeast-1` |
| `ACRCLOUD_FS_MIN_SCORE` | Accept hits ≥ score (default 55) |
| `ACRCLOUD_FS_SET_LIMIT` | Max YouTube sets per run (default 10) |
| `ACRCLOUD_EVENT_SLUGS` | Festival focus (same list as Identify; Relives at those events rank first) |

**Setup:** in the ACRCloud console create a **File Scanning** project/container
with the **Music Recognition (Audio Fingerprint)** engine attached to the
ACRCloud **Music** bucket — **not** the *AI-Generated Music Detection* engine
(that returns an `ai_detection` verdict and an empty `music[]`, so 0 tracks).
Copy its **container id** and a **Console API access token**, then add
`ACRCLOUD_FS_TOKEN` / `ACRCLOUD_FS_CONTAINER_ID` (+ region) as repo secrets.
Our submit forces `engine=1` (audio fingerprint; override `ACRCLOUD_FS_ENGINE`).

**Secrets (Settings → Secrets and variables → Actions):**

| Secret | Example |
| --- | --- |
| `ACRCLOUD_HOST` | `identify-eu-west-1.acrcloud.com` |
| `ACRCLOUD_ACCESS_KEY` | project access key |
| `ACRCLOUD_ACCESS_SECRET` | project access secret |
| `ACRCLOUD_YTDLP_COOKIES` | optional Netscape `cookies.txt` for YouTube |
| `ACRCLOUD_FS_TOKEN` | File Scanning Console API token (YouTube) |
| `ACRCLOUD_FS_CONTAINER_ID` | File Scanning container id |
| `ACRCLOUD_FS_REGION` | optional container region (default `eu-west-1`) |
| `ANTHROPIC_API_KEY` | optional Claude key for DJ handle research |
| `GEMINI_API_KEY` | optional Gemini key (preferred — Google Search grounding) |

**LLM handle research** (`npm run research:handles`): Claude and/or Gemini
propose official SC/YT/IG/X/websites for DJs that already have sets but no
handle. Proposals are **never written raw** — the URL must be a profile, the
handle must overlap the DJ name, it must be live, and it must not belong to
another catalog DJ. Missing keys → safe no-op. Runs on catalog-deep and
weekly enrich `full`. Reports: `data/crosscheck/llm-handle-research.json`.

Then run **Actions → Catalog enrich (weekly) → Run workflow**. Missing credentials → safe no-op (warning in the log). A successful enrich dispatches a fast Pages deploy so new fingerprint IDs go live.

If the catalog cache is cold, the fast path seeds mock sets so export never
ships with empty `/sets/[slug]` routes.

```bash
# reproduce the static export locally → writes to out/
# Custom domain (setradar.ai) is served at the domain root:
GITHUB_PAGES=true PAGES_BASE_PATH= npm run build
# github.io project path only:
GITHUB_PAGES=true PAGES_BASE_PATH=/SetTracker npm run build
```

The Pages workflow sets `output: "export"` with an empty `basePath` so
https://setradar.ai/ loads CSS/JS from `/_next/…`. A `/SetTracker` prefix
404s those assets on the custom domain (unstyled HTML). Local `next dev` /
`next start` are unaffected — the export only activates when `GITHUB_PAGES=true`.
