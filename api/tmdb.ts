import { tmdbApiClient } from "./apiClient";
import { TmdbMovie } from "./types";

interface SearchMovieResponse {
  page: number;
  results: TmdbMovie[];
}

/**
 * Search for movies using TMDB API.
 *
 * @param {string} query text query to search
 * @returns {Promise<SearchMovieResponse>} list of movies
 */
async function searchMovie(query: string): Promise<SearchMovieResponse> {
  const response = await tmdbApiClient.get<SearchMovieResponse>(
    "/search/movie",
    {
      params: { query },
    }
  );

  return response.data;
}

export { searchMovie };
