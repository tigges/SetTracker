-- AlterTable
ALTER TABLE "Track" ADD COLUMN "mixName" TEXT;
ALTER TABLE "Track" ADD COLUMN "remixerName" TEXT;
ALTER TABLE "Track" ADD COLUMN "genre" TEXT;
ALTER TABLE "Track" ADD COLUMN "durationSec" INTEGER;
ALTER TABLE "Track" ADD COLUMN "beatportUrl" TEXT;

-- CreateIndex
CREATE INDEX "Track_genre_idx" ON "Track"("genre");
