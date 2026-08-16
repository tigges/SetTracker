-- CreateTable
CREATE TABLE "VenueNight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME,
    "sourceUrl" TEXT NOT NULL,
    "ticketsUrl" TEXT,
    "roomsJson" TEXT,
    "artistsJson" TEXT,
    "sourceHash" TEXT,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VenueNight_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "VenueNight_slug_key" ON "VenueNight"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "VenueNight_eventId_startsAt_title_key" ON "VenueNight"("eventId", "startsAt", "title");

-- CreateIndex
CREATE INDEX "VenueNight_startsAt_idx" ON "VenueNight"("startsAt");

-- CreateIndex
CREATE INDEX "VenueNight_eventId_idx" ON "VenueNight"("eventId");
