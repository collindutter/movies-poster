import { GetMovieResponse } from "@/api/movie";
import { getMovieImages } from "@/api/tmdb";
import { NextApiRequest, NextApiResponse } from "next";

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
  if (req.method === "GET") {
    const { movieId } = req.query;

    const images = await getMovieImages(Number(movieId));

    const response: GetMovieResponse = {
      id: Number(movieId),
      images: {
        posters: images.posters,
      },
    };
    return res.status(200).json(response);
  }

  return res.status(200).json({});
}
