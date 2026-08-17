-- AlterTable
ALTER TABLE "Track" ADD COLUMN "isrc" TEXT;

-- CreateIndex
CREATE INDEX "Track_isrc_idx" ON "Track"("isrc");
