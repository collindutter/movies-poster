import { moviesPosterApi } from "./apiClient";
import { PosterImage } from "./tmdb";

export interface GetMovieResponse {
  id: number;
  images: {
    posters: PosterImage[];
  };
}

/**
 * Get details of movie.
 *
 * @param {number} movieId id of movie
 * @returns {Promise<GetMovieResponse>} details of movie
 */
async function getMovie(movieId: number): Promise<GetMovieResponse> {
  const response = await moviesPosterApi.get<GetMovieResponse>(
    `movies/${movieId}`
  );

  const poster = response.data;

  return Promise.resolve(poster);
}

export { getMovie };
