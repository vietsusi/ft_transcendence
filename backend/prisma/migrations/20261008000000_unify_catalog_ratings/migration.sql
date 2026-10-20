-- All catalog ratings share the same semantics; preserve every averageRating value.
ALTER TABLE "Movie" DROP COLUMN "ratingIsMock";
