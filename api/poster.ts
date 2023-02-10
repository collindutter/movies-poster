import { Layout } from "react-grid-layout";
import { moviesPosterApi } from "./apiClient";
import { Movie, Poster, TmdbMovie } from "./types";

/**
 * Get existing poster.
 *
 * @param {string} posterId id of existing poster
 * @returns {Promise<Poster>}  existing posters
 */
async function getPoster(posterId: string): Promise<Poster> {
  /*
  const response = await moviesPosterApi.get<Poster>(`posters/${posterId}`);

  return response.data;
  */

  const posterStr = localStorage.getItem(`poster-${posterId}`);
  if (!posterStr) {
    throw new Error("Poster not found.");
  }

  const poster = JSON.parse(posterStr);

  return Promise.resolve(poster);
}

/**
 * Get created posters.
 *
 * @returns {Promise<Poster[]>} list of posters
 */
async function getPosters(): Promise<Poster[]> {
  /*
  const response = await moviesPosterApi.get<Poster[]>("posters");

  return response.data;
  */

  const posters = Object.keys(localStorage)
    .filter((key) => key.startsWith("poster"))
    .map((posterKey) => localStorage.getItem(posterKey))
    .map((posterStr) => JSON.parse(posterStr ?? "{}"));

  return Promise.resolve(posters);
}

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

  const poster = response.data;

  localStorage.setItem(`poster-${poster.id}`, JSON.stringify(poster));

  return response.data;
}

/**
 * Put a poster.
 *
 *  @param {string} posterId id of poster to replace
 *  @param {Poster} poster data that will replace the poster
 *  @returns {Promise<Poster>} replaced poster
 */
async function putPoster(posterId: string, poster: Poster): Promise<Poster> {
  /*
  const response = await moviesPosterApi.put<Poster>(
    `posters/${posterId}`,
    poster
  );

  return response.data;
  */

  const posterStr = localStorage.getItem(posterId);
  if (!posterStr) {
    throw new Error("Poster not found");
  }
  localStorage.setItem(`poster-${posterId}`, JSON.stringify(poster));

  return Promise.resolve(poster);
}

/**
 * Patch a poster.
 *
 *  @param {string} posterId id of poster to replace
 *  @param {*} patchData data to patch poster with
 *  @param {TmdbMovie[]} patchData.movies list of movies to create poster from
 *  @param {Layout[]} patchData.layout layout of poster
 *  @returns {Promise<Poster>} patched poster
 */
async function patchPoster(
  posterId: string,
  patchData: {
    movies?: TmdbMovie[];
    layout?: Layout[];
  }
): Promise<Poster> {
  /*
  const response = await moviesPosterApi.patch<Poster>(`posters/${posterId}`, {
    movies,
  });

  return response.data;
  */

  const posterStr = localStorage.getItem(`poster-${posterId}`);
  if (!posterStr) {
    throw new Error("Poster not found");
  }

  const poster = JSON.parse(posterStr) as Poster;
  console.log({ poster });
  console.log({ patchData });
  const patchedPoster = { ...poster };
  if (patchData.movies) {
    patchedPoster.movies = patchData.movies;
  }
  if (patchData.layout) {
    patchedPoster.layout = patchData.layout;
  }
  console.log({ patchedPoster });

  localStorage.setItem(`poster-${posterId}`, JSON.stringify(patchedPoster));

  return Promise.resolve(patchedPoster);
}

export { getPoster, getPosters, putPoster, patchPoster, postPoster };
