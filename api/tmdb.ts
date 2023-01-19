import { tmdbApiClient } from "./apiClient";

function searchMovie(query: string) {
  return tmdbApiClient.get("/search/movie", { params: { query } });
}

export { searchMovie };
