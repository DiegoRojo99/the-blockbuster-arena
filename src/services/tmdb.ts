import {
  TMDBMovie,
  TMDBMovieDetails,
  TMDBMovieCredits,
  TMDBSearchResponse,
  TMDBApiError as TMDBApiErrorType,
  GameMovie,
  GameCastMember,
  SupportedLanguage,
  MovieMode
} from '@/types/tmdb';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
const IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

class TMDBApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'TMDBApiError';
  }
}

/**
 * Base fetch function with error handling for TMDB API
 */
async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  // Add all additional parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const errorData: TMDBApiErrorType = await response.json();
    throw new TMDBApiError(
      errorData.status_message || 'TMDB API request failed',
      errorData.status_code || response.status
    );
  }
  
  return response.json();
}

/**
 * Get image URL with specified size
 */
export function getImageUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w185'): string | null {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Search for movies by title
 */
export async function searchMovies(
  query: string, 
  language: SupportedLanguage = 'en',
  page: number = 1
): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>('/search/movie', {
    query: encodeURIComponent(query),
    language,
    page: page.toString(),
    include_adult: 'false'
  });
}

/**
 * Get movie details by ID
 */
export async function getMovieDetails(
  movieId: number,
  language: SupportedLanguage = 'en'
): Promise<TMDBMovieDetails> {
  return tmdbFetch<TMDBMovieDetails>(`/movie/${movieId}`, { language });
}

/**
 * Get movie credits (cast and crew) by ID
 */
export async function getMovieCredits(
  movieId: number,
  language: SupportedLanguage = 'en'
): Promise<TMDBMovieCredits> {
  return tmdbFetch<TMDBMovieCredits>(`/movie/${movieId}/credits`, { language });
}

/**
 * Get popular movies for game selection
 */
export async function getPopularMovies(
  language: SupportedLanguage = 'en',
  page: number = 1
): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>('/movie/popular', {
    language,
    page: page.toString(),
    include_adult: 'false'
  });
}

/**
 * Get top rated movies for game selection
 */
export async function getTopRatedMovies(
  language: SupportedLanguage = 'en',
  page: number = 1
): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>('/movie/top_rated', {
    language,
    page: page.toString(),
    include_adult: 'false'
  });
}

/**
 * Get now playing movies
 */
export async function getNowPlayingMovies(
  language: SupportedLanguage = 'en',
  page: number = 1
): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>('/movie/now_playing', {
    language,
    page: page.toString(),
    include_adult: 'false'
  });
}

/**
 * Get upcoming movies
 */
export async function getUpcomingMovies(
  language: SupportedLanguage = 'en',
  page: number = 1
): Promise<TMDBSearchResponse> {
  return tmdbFetch<TMDBSearchResponse>('/movie/upcoming', {
    language,
    page: page.toString(),
    include_adult: 'false'
  });
}

/**
 * Get movies by mode
 */
export async function getMoviesByMode(
  mode: MovieMode,
  language: SupportedLanguage = 'en',
  pages: number = 2
): Promise<TMDBMovie[]> {
  const promises = [];
  
  for (let page = 1; page <= pages; page++) {
    let apiCall: Promise<TMDBSearchResponse>;
    
    switch (mode) {
      case 'popular':
        apiCall = getPopularMovies(language, page);
        break;
      case 'top_rated':
        apiCall = getTopRatedMovies(language, page);
        break;
      case 'now_playing':
        apiCall = getNowPlayingMovies(language, page);
        break;
      case 'upcoming':
        apiCall = getUpcomingMovies(language, page);
        break;
      default:
        apiCall = getPopularMovies(language, page);
    }
    
    promises.push(apiCall);
  }
  
  const responses = await Promise.all(promises);
  let allMovies = responses.flatMap(response => response.results);
  
  // Filter movies based on mode requirements
  if (mode === 'now_playing') {
    // Only include movies released in the last 2 years for truly recent releases
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    allMovies = allMovies.filter(movie => {
      if (!movie.release_date) return false;
      const releaseDate = new Date(movie.release_date);
      return releaseDate >= twoYearsAgo;
    });
  } else if (mode === 'upcoming') {
    // Only include movies that will be released in the future or very recently (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    allMovies = allMovies.filter(movie => {
      if (!movie.release_date) return false;
      const releaseDate = new Date(movie.release_date);
      return releaseDate >= threeMonthsAgo;
    });
  }
  
  // Deduplicate movies
  return allMovies.filter((movie, index, arr) => 
    arr.findIndex(m => m.id === movie.id) === index
  );
}

/**
 * Get movies for game - supports different modes
 */
export async function getGameMovies(
  language: SupportedLanguage = 'en',
  minVoteCount: number = 1000,
  mode: MovieMode = 'popular'
): Promise<GameMovie[]> {
  try {
    // Get movies based on selected mode
    const moviesByMode = await getMoviesByMode(mode, language, 3);

    // Filter movies with sufficient vote count and release date
    const filteredMovies = moviesByMode.filter(movie => 
      movie.vote_count >= minVoteCount && 
      movie.release_date &&
      !movie.adult
    );

    // Convert to GameMovie format with cast data
    const gameMovies = await Promise.all(
      filteredMovies.slice(0, 50).map(async (movie): Promise<GameMovie | null> => {
        try {
          const credits = await getMovieCredits(movie.id, language);
          
          // Only include movies with at least 6 cast members with profile images
          const validCast = credits.cast
            .filter(member => member.profile_path && member.order < 10)
            .slice(0, 6);
          
          if (validCast.length < 6) return null;

          return {
            id: movie.id,
            title: movie.title,
            originalTitle: movie.original_title,
            year: parseInt(movie.release_date.split('-')[0]),
            posterPath: movie.poster_path,
            cast: validCast.map((member): GameCastMember => ({
              id: member.id,
              name: member.name,
              character: member.character,
              profilePath: member.profile_path,
              order: member.order
            }))
          };
        } catch (error) {
          console.warn(`Failed to get credits for movie ${movie.id}:`, error);
          return null;
        }
      })
    );

    // Filter out null values and return valid movies
    return gameMovies.filter((movie): movie is GameMovie => movie !== null);
  } catch (error) {
    console.error('Failed to fetch game movies:', error);
    throw new Error('Failed to load movies for the game');
  }
}

/**
 * Convert TMDB movie to game format with cast
 */
export async function convertToGameMovie(
  movie: TMDBMovie,
  language: SupportedLanguage = 'en'
): Promise<GameMovie | null> {
  try {
    const credits = await getMovieCredits(movie.id, language);
    
    // Only include movies with at least 6 cast members with profile images
    const validCast = credits.cast
      .filter(member => member.profile_path && member.order < 10)
      .slice(0, 6);
    
    if (validCast.length < 6) return null;

    return {
      id: movie.id,
      title: movie.title,
      originalTitle: movie.original_title,
      year: parseInt(movie.release_date.split('-')[0]),
      posterPath: movie.poster_path,
      cast: validCast.map((member): GameCastMember => ({
        id: member.id,
        name: member.name,
        character: member.character,
        profilePath: member.profile_path,
        order: member.order
      }))
    };
  } catch (error) {
    console.warn(`Failed to convert movie ${movie.id} to game format:`, error);
    return null;
  }
}

export { TMDBApiError };