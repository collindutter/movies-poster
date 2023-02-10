import { tmdbApiClient } from "./apiClient";
import { TmdbMovie } from "./types";

interface SearchMovieResponse {
  page: number;
  results: TmdbMovie[];
}

export interface PosterImage {
  aspect_ratio: number;
  file_path: string;
  height: string;
  iso_639_1: string | null;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface GetMovieImagesResponse {
  id: number;
  posters: PosterImage[];
}

/**
 * Get movie images.
 *
 * @param {number} movieId id of movie to get images.
 * @returns {Promise<GetMovieImagesResponse>} response of get movie images API
 */
async function getMovieImages(
  movieId: number
): Promise<GetMovieImagesResponse> {
  const response = await tmdbApiClient.get<GetMovieImagesResponse>(
    `/movie/${movieId}/images`,
    {}
  );

  return response.data;
}

/**
 * Search for movies using TMDB API.
 *
 * @param {string} query text query to search
 * @returns {Promise<SearchMovieResponse>} response of search movie API
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

export { searchMovie, getMovieImages };
