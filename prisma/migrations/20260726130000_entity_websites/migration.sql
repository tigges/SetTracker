-- Persist official websites / socials on DJs and Events (venues).
ALTER TABLE "Dj" ADD COLUMN "website" TEXT;

ALTER TABLE "Event" ADD COLUMN "website" TEXT;
ALTER TABLE "Event" ADD COLUMN "soundcloud" TEXT;
ALTER TABLE "Event" ADD COLUMN "instagram" TEXT;
ALTER TABLE "Event" ADD COLUMN "twitter" TEXT;
ALTER TABLE "Event" ADD COLUMN "imageUrl" TEXT;
