-- CreateTable
CREATE TABLE "EventEdition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "label" TEXT,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    CONSTRAINT "EventEdition_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Set" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "genre" TEXT,
    "publishedAt" DATETIME NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "sourceUrl" TEXT,
    "sourceName" TEXT,
    "playbackUrl" TEXT,
    "cover" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sourceHash" TEXT,
    "eventId" TEXT,
    "editionId" TEXT,
    "performedAt" DATETIME,
    "seriesId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Set_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Set_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "EventEdition" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Set_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Set" ("cover", "createdAt", "durationSec", "eventId", "genre", "id", "imageUrl", "playbackUrl", "publishedAt", "seriesId", "slug", "sourceHash", "sourceName", "sourceUrl", "title", "type") SELECT "cover", "createdAt", "durationSec", "eventId", "genre", "id", "imageUrl", "playbackUrl", "publishedAt", "seriesId", "slug", "sourceHash", "sourceName", "sourceUrl", "title", "type" FROM "Set";
DROP TABLE "Set";
ALTER TABLE "new_Set" RENAME TO "Set";
CREATE UNIQUE INDEX "Set_slug_key" ON "Set"("slug");
CREATE INDEX "Set_publishedAt_idx" ON "Set"("publishedAt");
CREATE INDEX "Set_genre_idx" ON "Set"("genre");
CREATE INDEX "Set_type_idx" ON "Set"("type");
CREATE INDEX "Set_eventId_idx" ON "Set"("eventId");
CREATE INDEX "Set_editionId_idx" ON "Set"("editionId");
CREATE INDEX "Set_seriesId_idx" ON "Set"("seriesId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "EventEdition_slug_key" ON "EventEdition"("slug");

-- CreateIndex
CREATE INDEX "EventEdition_eventId_year_idx" ON "EventEdition"("eventId", "year");

-- CreateIndex
CREATE INDEX "EventEdition_endsAt_idx" ON "EventEdition"("endsAt");
