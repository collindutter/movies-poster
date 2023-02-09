import { searchMovie } from "@/api/tmdb";
import { Movie, Poster } from "@/api/types";
import { NextApiRequest, NextApiResponse } from "next";
import { Layout } from "react-grid-layout";
import { v1 } from "uuid";

const MAX_COLS = 10;
const FILM_WIDTH = 1;
const FILM_HEIGHT = 3;
const MIN_FILM_WIDTH = 1;
const MAX_FILM_WIDTH = 2;
const MIN_FILM_HEIGHT = 3;
const MAX_FILM_HEIGHT = 6;

/**
 * Create a poster from letterboxd movies.
 *
 * @param {Movie[]} movies list of movies to create poster from
 * @returns {Promise<Poster>} poster
 */
async function createPoster(movies: Movie[]): Promise<Poster> {
  const posterMovies = await Promise.all(
    movies
      .filter((movie) => movie.name !== undefined)
      .map(async (movie) => {
        const { results: movies } = await searchMovie(movie.name);

        return movies[0];
      })
  );

  const layout = posterMovies.map((_movie, index) => {
    return {
      i: `${index}`,
      x: (index % MAX_COLS) * FILM_WIDTH,
      y: Math.floor(index / MAX_COLS),
      w: FILM_WIDTH,
      h: FILM_HEIGHT,
      minW: MIN_FILM_WIDTH,
      maxW: MAX_FILM_WIDTH,
      minH: MIN_FILM_HEIGHT,
      maxH: MAX_FILM_HEIGHT,
    } as Layout;
  });

  const poster: Poster = {
    id: v1(),
    movies: posterMovies,
    layout,
  };

  return poster;
}

/**
 * Handle api requests.
 *
 * @param {NextApiRequest} req api request
 * @param {NextApiResponse} res api response
 * @returns {void}
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method === "POST") {
    const response = await createPoster(req.body.movies);
    return res.status(200).json(response);
  }

  return res.status(200).json({});
}
