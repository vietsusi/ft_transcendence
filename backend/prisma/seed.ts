import { MovieType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fallbackGenreNames = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Sci-Fi',
  'Horror',
  'Romance',
  'Thriller',
  'Animation',
  'Fantasy',
  'Crime',
  'Documentary',
];

type SeedMovie = {
  title: string;
  description: string;
  type: MovieType;
  releaseYear: number;
  posterUrl: string;
  averageRating: number;
  genres: string[];
};

type TmdbGenreResponse = {
  genres: Array<{ id: number; name: string }>;
};

type TmdbMovieResult = {
  title?: string;
  name?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  vote_average?: number;
  genre_ids?: number[];
};

const fallbackMovies: SeedMovie[] = [
  {
    title: 'The Matrix',
    description:
      'A hacker discovers reality is a simulation and joins a rebellion against the machines.',
    type: MovieType.MOVIE,
    releaseYear: 1999,
    posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    averageRating: 8.7,
    genres: ['Sci-Fi', 'Action'],
  },
  {
    title: 'Inception',
    description:
      'A thief who steals corporate secrets through dream-sharing technology takes on one last job.',
    type: MovieType.MOVIE,
    releaseYear: 2010,
    posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    averageRating: 8.8,
    genres: ['Sci-Fi', 'Thriller', 'Action'],
  },
  {
    title: 'Interstellar',
    description:
      'Explorers travel through a wormhole in space to ensure humanity’s survival.',
    type: MovieType.MOVIE,
    releaseYear: 2014,
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    averageRating: 8.6,
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
  },
  {
    title: 'The Dark Knight',
    description:
      'Batman faces the Joker, a criminal mastermind bent on plunging Gotham into chaos.',
    type: MovieType.MOVIE,
    releaseYear: 2008,
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    averageRating: 9.0,
    genres: ['Action', 'Crime', 'Drama'],
  },
  {
    title: 'Parasite',
    description:
      'A poor family schemes to become employed by a wealthy household with unexpected results.',
    type: MovieType.MOVIE,
    releaseYear: 2019,
    posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    averageRating: 8.5,
    genres: ['Drama', 'Thriller', 'Comedy'],
  },
  {
    title: 'Spirited Away',
    description:
      'A young girl enters a mysterious world of spirits and must find a way to free her parents.',
    type: MovieType.MOVIE,
    releaseYear: 2001,
    posterUrl: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    averageRating: 8.6,
    genres: ['Animation', 'Fantasy', 'Adventure'],
  },
  {
    title: 'The Shawshank Redemption',
    description:
      'Two imprisoned men bond over years, finding solace and eventual redemption.',
    type: MovieType.MOVIE,
    releaseYear: 1994,
    posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    averageRating: 9.3,
    genres: ['Drama', 'Crime'],
  },
  {
    title: 'Get Out',
    description:
      'A young man uncovers a disturbing secret when he visits his girlfriend’s family estate.',
    type: MovieType.MOVIE,
    releaseYear: 2017,
    posterUrl: 'https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg',
    averageRating: 7.7,
    genres: ['Horror', 'Thriller'],
  },
  {
    title: 'La La Land',
    description:
      'A jazz musician and an aspiring actress fall in love while pursuing their dreams.',
    type: MovieType.MOVIE,
    releaseYear: 2016,
    posterUrl: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
    averageRating: 8.0,
    genres: ['Romance', 'Drama', 'Comedy'],
  },
  {
    title: 'Mad Max: Fury Road',
    description:
      'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler.',
    type: MovieType.MOVIE,
    releaseYear: 2015,
    posterUrl: 'https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg',
    averageRating: 8.1,
    genres: ['Action', 'Adventure', 'Sci-Fi'],
  },
  {
    title: 'Coco',
    description:
      'A boy journeys to the Land of the Dead to unlock the story of his family’s history.',
    type: MovieType.MOVIE,
    releaseYear: 2017,
    posterUrl: 'https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg',
    averageRating: 8.4,
    genres: ['Animation', 'Fantasy', 'Adventure'],
  },
  {
    title: 'Whiplash',
    description:
      'A promising drummer enrolls at a music conservatory under a brutally demanding instructor.',
    type: MovieType.MOVIE,
    releaseYear: 2014,
    posterUrl: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
    averageRating: 8.5,
    genres: ['Drama'],
  },
  {
    title: 'Breaking Bad',
    description:
      'A chemistry teacher turned meth manufacturer descends into the criminal underworld.',
    type: MovieType.TV_SERIES,
    releaseYear: 2008,
    posterUrl: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    averageRating: 9.5,
    genres: ['Crime', 'Drama', 'Thriller'],
  },
  {
    title: 'Stranger Things',
    description:
      'A group of kids confront supernatural forces and secret experiments in their small town.',
    type: MovieType.TV_SERIES,
    releaseYear: 2016,
    posterUrl: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    averageRating: 8.7,
    genres: ['Sci-Fi', 'Horror', 'Drama'],
  },
  {
    title: 'The Office',
    description:
      'A mockumentary about the everyday lives of office employees at a paper company.',
    type: MovieType.TV_SERIES,
    releaseYear: 2005,
    posterUrl: 'https://image.tmdb.org/t/p/w500/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg',
    averageRating: 8.9,
    genres: ['Comedy'],
  },
  {
    title: 'Game of Thrones',
    description:
      'Noble families vie for control of the Iron Throne in a sprawling fantasy epic.',
    type: MovieType.TV_SERIES,
    releaseYear: 2011,
    posterUrl: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    averageRating: 9.2,
    genres: ['Fantasy', 'Drama', 'Adventure'],
  },
  {
    title: 'Sherlock',
    description:
      'A modern update of the detective who solves crimes in contemporary London.',
    type: MovieType.TV_SERIES,
    releaseYear: 2010,
    posterUrl: 'https://image.tmdb.org/t/p/w500/7WTsnHkbA0FaG6R9twfFde0I9hl.jpg',
    averageRating: 9.1,
    genres: ['Crime', 'Drama', 'Thriller'],
  },
  {
    title: 'The Crown',
    description:
      'A dramatized chronicle of the reign of Queen Elizabeth II and the British monarchy.',
    type: MovieType.TV_SERIES,
    releaseYear: 2016,
    posterUrl: 'https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg',
    averageRating: 8.6,
    genres: ['Drama'],
  },
  {
    title: 'Planet Earth II',
    description:
      'A stunning documentary series exploring wildlife across the planet’s diverse habitats.',
    type: MovieType.TV_SERIES,
    releaseYear: 2016,
    posterUrl: 'https://image.tmdb.org/t/p/w500/5table3wOChTNwmBk4LZDMkC1Qk.jpg',
    averageRating: 9.4,
    genres: ['Documentary'],
  },
  {
    title: 'The Mandalorian',
    description:
      'A lone bounty hunter navigates the outer reaches of the galaxy protecting a mysterious child.',
    type: MovieType.TV_SERIES,
    releaseYear: 2019,
    posterUrl: 'https://image.tmdb.org/t/p/w500/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg',
    averageRating: 8.5,
    genres: ['Sci-Fi', 'Action', 'Adventure'],
  },
  {
    title: 'Avengers: Endgame',
    description:
      'The remaining heroes make a final stand to undo the devastation caused by Thanos.',
    type: MovieType.MOVIE,
    releaseYear: 2019,
    posterUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    averageRating: 8.3,
    genres: ['Action', 'Adventure', 'Sci-Fi'],
  },
  {
    title: 'Your Name',
    description:
      'Two teenagers share a profound, magical connection upon discovering they are swapping bodies.',
    type: MovieType.MOVIE,
    releaseYear: 2016,
    posterUrl: 'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg',
    averageRating: 8.4,
    genres: ['Animation', 'Romance', 'Fantasy'],
  },
  {
    title: 'The Conjuring',
    description:
      'Paranormal investigators help a family terrorized by a dark presence in their farmhouse.',
    type: MovieType.MOVIE,
    releaseYear: 2013,
    posterUrl: 'https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg',
    averageRating: 7.5,
    genres: ['Horror', 'Thriller'],
  },
  {
    title: 'Pride and Prejudice',
    description:
      'Sparks fly between Elizabeth Bennet and the proud Mr. Darcy in Regency-era England.',
    type: MovieType.MOVIE,
    releaseYear: 2005,
    posterUrl: 'https://image.tmdb.org/t/p/w500/sGjIvtVvTlWnia2zfJfHz81pZ9Q.jpg',
    averageRating: 7.8,
    genres: ['Romance', 'Drama'],
  },
];

async function fetchJson<T>(url: string, apiKey: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status}) for ${url}`);
  }

  return (await response.json()) as T;
}

async function fetchTmdbMovies(apiKey: string): Promise<SeedMovie[]> {
  const movieGenreResponse = await fetchJson<TmdbGenreResponse>(
    'https://api.themoviedb.org/3/genre/movie/list?language=en-US',
    apiKey,
  );
  const tvGenreResponse = await fetchJson<TmdbGenreResponse>(
    'https://api.themoviedb.org/3/genre/tv/list?language=en-US',
    apiKey,
  );

  const genreMap = Object.fromEntries(
    [...movieGenreResponse.genres, ...tvGenreResponse.genres].map((genre) => [String(genre.id), genre.name]),
  );

  const moviePages = await Promise.all(
    [1, 2].map((page) =>
      fetchJson<{ results: TmdbMovieResult[] }>(
        `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}`,
        apiKey,
      ),
    ),
  );

  const tvPages = await Promise.all(
    [1, 2].map((page) =>
      fetchJson<{ results: TmdbMovieResult[] }>(
        `https://api.themoviedb.org/3/tv/popular?language=en-US&page=${page}`,
        apiKey,
      ),
    ),
  );

  const discoveredMovies: SeedMovie[] = [...moviePages, ...tvPages]
    .flatMap((page) => page.results)
    .map((item) => {
      const title = item.title ?? item.name ?? 'Untitled';
      const releaseDate = item.release_date ?? item.first_air_date ?? '0000-00-00';
      const releaseYear = Number(releaseDate.slice(0, 4) || 0);
      const type = item.title !== undefined ? MovieType.MOVIE : MovieType.TV_SERIES;
      const normalizedGenres = (item.genre_ids ?? [])
        .map((genreId) => genreMap[String(genreId)])
        .filter((genreName): genreName is string => Boolean(genreName));

      return {
        title,
        description: item.overview || 'No description available.',
        type,
        releaseYear,
        posterUrl: item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : 'https://placehold.co/500x750/1f2937/ffffff?text=No+Poster',
        averageRating: Number((item.vote_average ?? 0).toFixed(1)),
        genres: normalizedGenres.length > 0 ? normalizedGenres : ['Drama'],
      } satisfies SeedMovie;
    });

  const uniqueMovies = new Map<string, SeedMovie>();
  for (const movie of discoveredMovies) {
    if (!movie.title || !movie.releaseYear) continue;
    const key = `${movie.title}-${movie.releaseYear}`;
    if (!uniqueMovies.has(key)) {
      uniqueMovies.set(key, movie);
    }
  }

  return [...uniqueMovies.values()];
}

async function main() {
  const apiKey = process.env.TMDB_API_KEY;
  const movies = apiKey ? await fetchTmdbMovies(apiKey) : fallbackMovies;
  const genreNames = [...new Set(movies.flatMap((movie) => movie.genres).filter(Boolean))];

  for (const name of genreNames) {
    await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const movie of movies) {
    const existing = await prisma.movie.findFirst({
      where: { title: movie.title, releaseYear: movie.releaseYear },
    });
    if (existing) {
      continue;
    }
    await prisma.movie.create({
      data: {
        title: movie.title,
        description: movie.description,
        type: movie.type,
        releaseYear: movie.releaseYear,
        posterUrl: movie.posterUrl,
        averageRating: movie.averageRating,
        genres: movie.genres.length
          ? {
              connect: movie.genres.map((name) => ({ name })),
            }
          : undefined,
      },
    });
  }

  console.log(
    `Seed complete: ${genreNames.length} genres, ${movies.length} movies/series. Source: ${apiKey ? 'TMDB' : 'fallback seed'}.`,
  );
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
