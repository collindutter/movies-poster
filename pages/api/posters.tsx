import { searchMovie } from "@/api/tmdb";
import { Movie, Poster } from "@/api/types";
import { NextApiRequest, NextApiResponse } from "next";

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

  const poster: Poster = {
    movies: posterMovies,
    layout: {},
  };

  return poster;
}

async function getPosters() {
  
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
