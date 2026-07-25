/*
  Warnings:

  - You are about to drop the `DJ` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "DJ_slug_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DJ";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Dj" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "realName" TEXT,
    "homeCity" TEXT,
    "bio" TEXT,
    "accent" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Series" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "djId" TEXT NOT NULL,
    CONSTRAINT "Series_djId_fkey" FOREIGN KEY ("djId") REFERENCES "Dj" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Series" ("djId", "id", "name", "slug") SELECT "djId", "id", "name", "slug" FROM "Series";
DROP TABLE "Series";
ALTER TABLE "new_Series" RENAME TO "Series";
CREATE UNIQUE INDEX "Series_slug_key" ON "Series"("slug");
CREATE TABLE "new_SetArtist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setId" TEXT NOT NULL,
    "djId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "SetArtist_setId_fkey" FOREIGN KEY ("setId") REFERENCES "Set" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SetArtist_djId_fkey" FOREIGN KEY ("djId") REFERENCES "Dj" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SetArtist" ("djId", "id", "isPrimary", "setId") SELECT "djId", "id", "isPrimary", "setId" FROM "SetArtist";
DROP TABLE "SetArtist";
ALTER TABLE "new_SetArtist" RENAME TO "SetArtist";
CREATE UNIQUE INDEX "SetArtist_setId_djId_key" ON "SetArtist"("setId", "djId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Dj_slug_key" ON "Dj"("slug");
