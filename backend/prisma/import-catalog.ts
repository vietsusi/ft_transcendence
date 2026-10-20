import { PrismaClient, MovieType } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type RawFilm = {
  sourceId: string;
  title: string;
  description: string;
  releaseYear: number;
  genres: string[];
};
const rules: [RegExp, string][] = [
  [/action|superhero|martial/i, 'Action'],
  [/adventure/i, 'Adventure'],
  [/science fiction|cyberpunk|time.travel|dystopi|post.apocalyptic/i, 'Sci-Fi'],
  [/comedy|tragicomedy/i, 'Comedy'],
  [/drama|biographical/i, 'Drama'],
  [/romance|romantic/i, 'Romance'],
  [/thriller|suspense/i, 'Thriller'],
  [/horror/i, 'Horror'],
  [/crime|gangster|noir|police/i, 'Crime'],
  [/animation|animated/i, 'Animation'],
  [/fantasy/i, 'Fantasy'],
  [/documentary/i, 'Documentary'],
  [/war film|war drama/i, 'War'],
  [/historical|sword.and.sandal/i, 'History'],
  [/musical/i, 'Musical'],
];

export async function importCatalog(prisma: PrismaClient) {
  const rows = JSON.parse(
    readFileSync(join(process.cwd(), 'data/wikidata-films.raw.json'), 'utf8'),
  ) as RawFilm[];
  const seen = new Set<string>();
  let imported = 0;
  for (const row of rows) {
    const title = row.title.normalize('NFKC').trim().replace(/\s+/g, ' ');
    if (
      !title ||
      /^Q\d+$/.test(title) ||
      !/^Q\d+$/.test(row.sourceId) ||
      !Number.isInteger(row.releaseYear) ||
      row.releaseYear < 1888 ||
      row.releaseYear > 2026 ||
      seen.has(row.sourceId)
    )
      continue;
    seen.add(row.sourceId);
    const genres = [
      ...new Set(
        rules
          .filter(([pattern]) => row.genres.some((g) => pattern.test(g)))
          .map(([, name]) => name),
      ),
    ];
    if (!genres.length) genres.push('Other');
    const data = {
      title,
      releaseYear: row.releaseYear,
      type: MovieType.MOVIE,
      description:
        row.description.trim() ||
        `${row.releaseYear} film. Synopsis unavailable in this dataset.`,
      sourceId: row.sourceId,
      sourceUrl: `https://www.wikidata.org/wiki/${row.sourceId}`,
      // Stable catalog rating for the demonstration dataset.
      averageRating: (60 + (Number(row.sourceId.slice(1)) % 36)) / 10,
    };
    await prisma.$transaction(async (tx) => {
      for (const name of genres)
        await tx.genre.upsert({
          where: { name },
          update: {},
          create: { name },
        });
      const existing = await tx.movie.findFirst({
        where: {
          OR: [
            { sourceId: row.sourceId },
            { title, releaseYear: row.releaseYear },
          ],
        },
        orderBy: { id: 'asc' },
      });
      const relation = { connect: genres.map((name) => ({ name })) };
      if (existing)
        await tx.movie.update({
          where: { id: existing.id },
          data: { ...data, genres: { set: [], ...relation } },
        });
      else await tx.movie.create({ data: { ...data, genres: relation } });
    });
    imported++;
  }
  console.log(
    `Wikidata import: ${imported}/${rows.length} rows, idempotent by source ID/title/year.`,
  );
}
