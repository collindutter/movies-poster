import axios from "axios";

const tmdbApiClient = axios.create({
  baseURL: process.env.TMDB_API_URL,
});

const moviesPosterApi = axios.create({
  baseURL: "/api",
});

const tmdbApiInterceptor = async (config: any) => {
  config.params["api_key"] = process.env.TMDB_API_KEY;

  return config;
};

tmdbApiClient.interceptors.request.use(tmdbApiInterceptor, (error) =>
  Promise.reject(error)
);

export { tmdbApiClient, moviesPosterApi };
