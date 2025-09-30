import { createClient } from '@supabase/supabase-js';
import { CategoryGameTemplate, GameCategory, GameMovie } from "@/types/categories-game";

// Create a raw supabase client for this service to avoid type issues
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const rawSupabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Save a new category game template to the database
 */
export async function saveCategoryGameTemplate(
  template: CategoryGameTemplate,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Start transaction - insert template
    const { error: templateError } = await rawSupabase
      .from('category_game_templates')
      .insert({
        id: template.id,
        name: template.name,
        description: template.description,
        max_mistakes: template.config.maxMistakes,
        show_hints: template.config.showHints,
        shuffle_movies: template.config.shuffleMovies,
        game_difficulty: template.config.gameDifficulty,
        tags: template.tags,
        is_active: true,
        created_by: userId
      } as any);

    if (templateError) throw templateError;

    // Insert categories
    const categories = template.categories.map((cat, index) => ({
      id: cat.id,
      template_id: template.id,
      name: cat.name,
      difficulty: cat.difficulty,
      hint: cat.hint,
      display_order: index + 1,
      bg_color: cat.colors.bg,
      border_color: cat.colors.border,
      text_color: cat.colors.text
    }));

    const { error: categoriesError } = await rawSupabase
      .from('game_categories')
      .insert(categories as any);

    if (categoriesError) throw categoriesError;

    // Process movies and template_movies
    for (const movie of template.movies) {
      // Extract TMDB ID from the movie ID (if it's a TMDB movie)
      const tmdbId = movie.id.startsWith('tmdb-') ? parseInt(movie.id.replace('tmdb-', '')) : null;
      
      // First, try to insert or get existing movie
      const movieData = {
        tmdb_id: tmdbId,
        title: movie.title,
        year: movie.metadata?.year,
        poster_url: movie.poster,
        is_active: true
      };

      // Insert movie if it doesn't exist (using tmdb_id or title as unique constraint)
      const { data: existingMovie, error: movieCheckError } = await rawSupabase
        .from('movies')
        .select('id')
        .eq('title', movie.title)
        .single();

      let movieId: number;

      if (existingMovie) {
        movieId = (existingMovie as any).id;
      } else {
        const { data: newMovie, error: movieInsertError } = await rawSupabase
          .from('movies')
          .insert(movieData as any)
          .select('id')
          .single();

        if (movieInsertError) throw movieInsertError;
        if (!newMovie) throw new Error('Failed to create movie');
        movieId = (newMovie as any).id;
      }

      // Link movie to template and category
      const templateMovie = {
        template_id: template.id,
        movie_id: movieId,
        category_id: movie.categoryId,
        display_order: 1, // Will be updated based on order in category
        is_active: true
      };

      const { error: templateMovieError } = await rawSupabase
        .from('template_movies')
        .insert(templateMovie as any);

      if (templateMovieError) throw templateMovieError;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error saving category game template:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to save game template'
    };
  }
}

/**
 * Get all category game templates
 */
export async function getCategoryGameTemplates(): Promise<CategoryGameTemplate[]> {
  try {
    // For now, just get the basic templates - we'll need to build the views later
    const { data, error } = await rawSupabase
      .from('category_game_templates')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    // Return empty array for now since we need to build proper queries
    // This is a placeholder until we create the proper database views/joins
    return [];
  } catch (error) {
    console.error('Error fetching category game templates:', error);
    return [];
  }
}

/**
 * Delete a category game template
 */
export async function deleteCategoryGameTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await rawSupabase
      .from('category_game_templates')
      .update({ is_active: false })
      .eq('id', templateId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting category game template:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete game template'
    };
  }
}

/**
 * Get a single category game template by ID
 */
export async function getCategoryGameTemplate(templateId: string): Promise<CategoryGameTemplate | null> {
  try {
    // For now, return null - we need to build proper queries/views
    // This is a placeholder until we create the proper database setup
    return null;
  } catch (error) {
    console.error('Error fetching category game template:', error);
    return null;
  }
}

/**
 * Update an existing category game template
 */
export async function updateCategoryGameTemplate(
  templateId: string,
  updates: Partial<CategoryGameTemplate>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await rawSupabase
      .from('category_game_templates')
      .update({
        name: updates.name,
        description: updates.description,
        max_mistakes: updates.config?.maxMistakes,
        show_hints: updates.config?.showHints,
        shuffle_movies: updates.config?.shuffleMovies,
        game_difficulty: updates.config?.gameDifficulty,
        tags: updates.tags,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error updating category game template:', error);
    return {
      success: false,
      error: error.message || 'Failed to update game template'
    };
  }
}