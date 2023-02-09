import { Layout } from "react-grid-layout";

export interface LetterboxdMovie {
  Date: string;
  "LetterBoxd URI": string;
  Name: string;
  Year: string;
}

export interface Movie {
  date: string;
  letterboxdUri?: string;
  name: string;
  year: string;
}

export interface TmdbMovie {
  id: number;
  title: string;
  original_title: string;
  poster_path: string;
  adult: boolean;
  overview: string;
  release_date: Date;
  genre_ids: number[];
  original_language: string;
  backdrop_path: string;
  popularity: number;
  vote_count: number;
  video: boolean;
  vote_average: number;
}

export interface Poster {
  id: string;
  movies: TmdbMovie[];
  layout: Layout[];
}
