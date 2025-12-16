import { createClient } from '@supabase/supabase-js';
import { CategoryGameTemplate, GameCategory, GameMovie, DIFFICULTY_COLORS } from "@/types/categories-game";

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
    // 1) Fetch templates
    const { data: templates, error: templatesError } = await rawSupabase
      .from('category_game_templates')
      .select('*')
      .eq('is_active', true);

    if (templatesError) throw templatesError;
    if (!templates || templates.length === 0) return [];

    const templateIds = templates.map(t => t.id);

    // 2) Fetch categories for these templates
    const { data: categories, error: categoriesError } = await rawSupabase
      .from('game_categories')
      .select('*')
      .in('template_id', templateIds);

    if (categoriesError) throw categoriesError;

    // 3) Fetch template movies with joined movie data
    const { data: templateMovies, error: templateMoviesError } = await rawSupabase
      .from('template_movies')
      .select(`id, template_id, category_id, display_order, is_active, movies:movie_id (id, title, tmdb_id, year, poster_url, poster_path)`)
      .in('template_id', templateIds)
      .eq('is_active', true);

    if (templateMoviesError) throw templateMoviesError;

    // Build a quick lookup for display_order by template/movie
    const displayOrderMap: Record<string, number> = {};
    templateMovies?.forEach(tm => {
      const movieId = (tm as any)?.movies?.id;
      if (movieId) {
        displayOrderMap[`${tm.template_id}:${movieId}`] = tm.display_order ?? 0;
      }
    });

    // Helper: build map of categories per template
    const categoriesByTemplate: Record<string, GameCategory[]> = {};
    categories?.forEach(cat => {
      const templateId = cat.template_id as string;
      const mapped: GameCategory = {
        id: cat.id,
        name: cat.name,
        difficulty: cat.difficulty,
        colors: {
          bg: cat.bg_color || DIFFICULTY_COLORS[cat.difficulty]?.bg,
          border: cat.border_color || DIFFICULTY_COLORS[cat.difficulty]?.border,
          text: cat.text_color || DIFFICULTY_COLORS[cat.difficulty]?.text
        },
        hint: cat.hint || undefined
      };

      if (!categoriesByTemplate[templateId]) categoriesByTemplate[templateId] = [];
      categoriesByTemplate[templateId].push(mapped);
    });

    // Helper: build movies per template
    const moviesByTemplate: Record<string, GameMovie[]> = {};
    templateMovies?.forEach(tm => {
      const tplId = tm.template_id as string;
      const movie = tm.movies as any;
      const poster = movie?.poster_url || (movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined);

      const mapped: GameMovie = {
        id: movie?.tmdb_id ? `tmdb-${movie.tmdb_id}` : `movie-${movie?.id}`,
        title: movie?.title || 'Untitled',
        categoryId: tm.category_id,
        poster,
        metadata: movie?.year ? { year: movie.year } : undefined
      };

      if (!moviesByTemplate[tplId]) moviesByTemplate[tplId] = [];
      moviesByTemplate[tplId].push(mapped);
    });

    // 4) Assemble templates
    const assembled: CategoryGameTemplate[] = templates.map(tpl => {
      const tplCategories = categoriesByTemplate[tpl.id] || [];
      const tplMovies = (moviesByTemplate[tpl.id] || []).sort((a, b) => {
        const aNumericId = parseInt(a.id.replace('tmdb-', '').replace('movie-', ''));
        const bNumericId = parseInt(b.id.replace('tmdb-', '').replace('movie-', ''));
        const aOrder = displayOrderMap[`${tpl.id}:${aNumericId}`] ?? 0;
        const bOrder = displayOrderMap[`${tpl.id}:${bNumericId}`] ?? 0;
        return aOrder - bOrder;
      });

      return {
        id: tpl.id,
        name: tpl.name,
        description: tpl.description,
        tags: tpl.tags || [],
        config: {
          maxMistakes: tpl.max_mistakes ?? 4,
          showHints: tpl.show_hints ?? true,
          shuffleMovies: tpl.shuffle_movies ?? true,
          gameDifficulty: tpl.game_difficulty ?? 'intermediate'
        },
        categories: tplCategories,
        movies: tplMovies
      } as CategoryGameTemplate;
    });

    return assembled;
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
    // Try RPC soft delete first (if function exists and is granted)
    const { error: rpcError } = await (rawSupabase as any).rpc('soft_delete_category_template', { p_template_id: templateId });

    if (rpcError) {
      // Fallback to direct update (requires valid RLS UPDATE policy)
      const { error } = await rawSupabase
        .from('category_game_templates')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', templateId);

      if (error) throw error;
    }

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