-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Series" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "djId" TEXT,
    CONSTRAINT "Series_djId_fkey" FOREIGN KEY ("djId") REFERENCES "Dj" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Series" ("djId", "id", "name", "slug") SELECT "djId", "id", "name", "slug" FROM "Series";
DROP TABLE "Series";
ALTER TABLE "new_Series" RENAME TO "Series";
CREATE UNIQUE INDEX "Series_slug_key" ON "Series"("slug");
CREATE INDEX "Series_djId_idx" ON "Series"("djId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
