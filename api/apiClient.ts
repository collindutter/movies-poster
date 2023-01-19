import axios from "axios";

const tmdbApiClient = axios.create({
  baseURL: process.env.TMDB_API_URL,
});

const tmdbApiInterceptor = async (config: any) => {
  config.params["api_key"] = process.env.TMDB_API_KEY;

  console.log(config);
  return config;
};

tmdbApiClient.interceptors.request.use(tmdbApiInterceptor, (error) =>
  Promise.reject(error)
);

export { tmdbApiClient };
