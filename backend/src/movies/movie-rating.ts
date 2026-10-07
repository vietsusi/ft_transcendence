/** All catalog ratings contribute equally, regardless of how the title was imported. */
export function ratingQuality(rating: number): number {
  return Number.isFinite(rating) && rating > 0
    ? Math.min(10, rating) / 10
    : 0.5;
}
