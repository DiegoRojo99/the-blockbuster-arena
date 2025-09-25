import {
  TMDBMovie,
  TMDBMovieDetails,
  TMDBMovieCredits,
  TMDBSearchResponse,
  TMDBApiError as TMDBApiErrorType,
  GameMovie,
  GameCastMember,
  SupportedLanguage
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
 * Get movies for game - combines popular and top rated with filtering
 */
export async function getGameMovies(
  language: SupportedLanguage = 'en',
  minVoteCount: number = 1000
): Promise<GameMovie[]> {
  try {
    // Get a mix of popular and top-rated movies
    const [popularResponse, topRatedResponse] = await Promise.all([
      getPopularMovies(language),
      getTopRatedMovies(language)
    ]);

    // Combine and deduplicate movies
    const allMovies = [...popularResponse.results, ...topRatedResponse.results];
    const uniqueMovies = allMovies.filter((movie, index, arr) => 
      arr.findIndex(m => m.id === movie.id) === index
    );

    // Filter movies with sufficient vote count and release date
    const filteredMovies = uniqueMovies.filter(movie => 
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