// TMDB API Types for Cast Guessing Game

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  popularity: number;
  adult: boolean;
  video: boolean;
}

export interface TMDBCastMember {
  adult: boolean;
  gender: number | null;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

export interface TMDBCrewMember {
  adult: boolean;
  gender: number | null;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  credit_id: string;
  department: string;
  job: string;
}

export interface TMDBMovieCredits {
  id: number;
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBMovieDetails extends TMDBMovie {
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
  budget: number;
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string | null;
  imdb_id: string | null;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  revenue: number;
  runtime: number | null;
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string | null;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBApiError {
  success: boolean;
  status_code: number;
  status_message: string;
}

// Game-specific types
export interface GameMovie {
  id: number;
  title: string;
  originalTitle: string;
  year: number;
  posterPath: string | null;
  cast: GameCastMember[];
}

export interface GameCastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
}

export type SupportedLanguage = 'en' | 'es';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

// Game Mode types
export type MovieMode = 'popular' | 'top_rated' | 'now_playing' | 'upcoming';

export interface MovieModeOption {
  id: MovieMode;
  name: string;
  description: string;
  icon: string;
}

// Game History types
export interface GameResult {
  id: string;
  movieId: number;
  movieTitle: string;
  movieYear: number;
  moviePosterPath: string | null;
  isCorrect: boolean;
  guessCount: number;
  revealedCastCount: number;
  wrongGuesses: TMDBMovie[];
  completedAt: Date;
  mode: MovieMode;
  language: SupportedLanguage;
}