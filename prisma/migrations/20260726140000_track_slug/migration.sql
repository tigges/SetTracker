-- AlterTable: public Track.slug for /tracks/[slug] pages
ALTER TABLE "Track" ADD COLUMN "slug" TEXT;

-- Temporary unique values (cuid) so the unique index can be created;
-- ingest / thumbs / ensureTrackSlugs rewrite these to artist-title form.
UPDATE "Track" SET "slug" = "id" WHERE "slug" IS NULL;

CREATE UNIQUE INDEX "Track_slug_key" ON "Track"("slug");
