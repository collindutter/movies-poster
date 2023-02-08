import { moviesPosterApi } from "./apiClient";
import { Movie, Poster } from "./types";

/**
 * Create a poster.
 *
 *  @param {Movie[]} movies list of movies to create poster from
 *  @returns {Promise<Poster>} created poster
 */
async function postPoster(movies: Movie[]): Promise<Poster> {
  const response = await moviesPosterApi.post<Poster>("posters", {
    movies,
  });

  return response.data;
}

export { postPoster };
