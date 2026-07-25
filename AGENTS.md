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
  via api-v2 + **hearthis.at** house categories (`src/lib/ingest/hearthis/`).
  Both parse description + timed comments; SC has adaptive poll limits
  (`data/soundcloud-poll-state.json`). **sourceHash refresh** when tracklists
  change (preserves `community_resolved` rows). After ingest, applies
  `data/resolutions.json` (Suggest ID → GitHub issue → paste JSON → redeploy).
  Optional: `HEARTHIS_MAX_SETS`, `INGEST_TOPDJS=1`, `INGEST_SYNTHETIC=1`,
  `SOUNDCLOUD_CLIENT_ID`. Do **not** crawl 1001Tracklists. Pages cron: seed →
  ingest → thumbs → export.
- **Artwork thumbnails:** `npm run thumbs` fills null `imageUrl` on Dj / Label /
  Track / Set via the Deezer Search API (no key). Idempotent; skips rows that
  already have art. Sets fall back to the primary DJ image. The Pages workflow
  runs this after ingest. UI uses `EntityThumb` with monogram fallback.
- **Standard commands** live in `package.json` scripts and `README.md`; prefer
  those over ad-hoc invocations.
