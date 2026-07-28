/*
  Warnings:

  - Made the column `slug` on table `Track` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Dj" ADD COLUMN "youtube" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "mixName" TEXT,
    "remixerName" TEXT,
    "labelId" TEXT,
    "genre" TEXT,
    "bpm" INTEGER,
    "musicalKey" TEXT,
    "durationSec" INTEGER,
    "releaseDate" DATETIME,
    "imageUrl" TEXT,
    "beatportUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Track_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Track" ("artistName", "beatportUrl", "bpm", "createdAt", "durationSec", "genre", "id", "imageUrl", "labelId", "mixName", "musicalKey", "releaseDate", "remixerName", "slug", "title") SELECT "artistName", "beatportUrl", "bpm", "createdAt", "durationSec", "genre", "id", "imageUrl", "labelId", "mixName", "musicalKey", "releaseDate", "remixerName", "slug", "title" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
CREATE UNIQUE INDEX "Track_slug_key" ON "Track"("slug");
CREATE INDEX "Track_labelId_idx" ON "Track"("labelId");
CREATE INDEX "Track_title_artistName_idx" ON "Track"("title", "artistName");
CREATE INDEX "Track_genre_idx" ON "Track"("genre");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
