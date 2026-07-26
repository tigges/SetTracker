# setradar.ai

A bass house DJ **set database** (MVP), branded as **setradar.ai**. Browse radio
episodes, festival sets and SoundCloud mixes; every track row carries a
**status** and **provenance** so you can see what's identified and what's still
an ID.

> Live app: https://tigges.github.io/SetTracker/
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
4. **Labels** (`/labels`, `/labels/[slug]`) — imprint index and profiles.

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
| `npm run thumbs`     | Resolve artwork URLs (Deezer / iTunes) |

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

The app publishes as a fully static site. `.github/workflows/deploy-pages.yml`:

- **push to `main`** — fast path (no crawl): restore cached catalog DB → export → deploy
- **6h cron / manual `deep`** — crawl + thumbs, save DB cache, then deploy

If the catalog cache is cold, the fast path seeds mock sets so export never
ships with empty `/sets/[slug]` routes.

```bash
# reproduce the static export locally → writes to out/
GITHUB_PAGES=true PAGES_BASE_PATH=/SetTracker npm run build
```

The Pages build sets `output: "export"` with `basePath=/SetTracker` (the GitHub
repo subpath — product brand is setradar.ai; the path is unchanged until the
repo/domain is renamed). Local dev and `next start` are unaffected — the export
only activates when `GITHUB_PAGES=true`.
