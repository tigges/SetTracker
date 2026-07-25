-- CreateIndex
CREATE INDEX "Played_trackId_idx" ON "Played"("trackId");

-- CreateIndex
CREATE INDEX "Played_idTrackId_idx" ON "Played"("idTrackId");

-- CreateIndex
CREATE INDEX "Played_setId_idStatus_idx" ON "Played"("setId", "idStatus");

-- CreateIndex
CREATE INDEX "Series_djId_idx" ON "Series"("djId");

-- CreateIndex
CREATE INDEX "Set_publishedAt_idx" ON "Set"("publishedAt");

-- CreateIndex
CREATE INDEX "Set_genre_idx" ON "Set"("genre");

-- CreateIndex
CREATE INDEX "Set_type_idx" ON "Set"("type");

-- CreateIndex
CREATE INDEX "Set_eventId_idx" ON "Set"("eventId");

-- CreateIndex
CREATE INDEX "Set_seriesId_idx" ON "Set"("seriesId");

-- CreateIndex
CREATE INDEX "SetArtist_djId_idx" ON "SetArtist"("djId");

-- CreateIndex
CREATE INDEX "Track_labelId_idx" ON "Track"("labelId");

-- CreateIndex
CREATE INDEX "Track_title_artistName_idx" ON "Track"("title", "artistName");
