ALTER TABLE "Movie" ADD COLUMN "sourceId" TEXT, ADD COLUMN "sourceUrl" TEXT, ADD COLUMN "ratingIsMock" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX "Movie_sourceId_key" ON "Movie"("sourceId");
