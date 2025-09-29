-- =============================================
-- CATEGORIES GAME TABLES - SUPABASE SCHEMA
-- =============================================
-- Database tables for the Categories/Grouping Game
-- Supports reusable movie data and configurable game templates
-- =============================================

-- =============================================
-- 1. MOVIES TABLE (Reusable across all games)
-- =============================================

-- Core movie data from TMDB API (reusable across all game types)
CREATE TABLE IF NOT EXISTS public.movies (
    id SERIAL PRIMARY KEY,
    
    -- TMDB Data
    tmdb_id INTEGER UNIQUE, -- NULL for custom/non-TMDB movies
    title TEXT NOT NULL,
    original_title TEXT,
    release_date DATE,
    year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM release_date)) STORED,
    
    -- Media
    poster_path TEXT, -- TMDB poster path
    backdrop_path TEXT, -- TMDB backdrop path
    poster_url TEXT, -- Full poster URL (for custom movies)
    
    -- Basic Info
    overview TEXT,
    original_language TEXT DEFAULT 'en',
    popularity DECIMAL,
    vote_average DECIMAL,
    vote_count INTEGER,
    runtime INTEGER, -- minutes
    
    -- Classification
    adult BOOLEAN DEFAULT false,
    genres JSONB DEFAULT '[]', -- array of genre objects from TMDB
    
    -- App-specific
    is_featured BOOLEAN DEFAULT false, -- for highlighting in UI
    is_active BOOLEAN DEFAULT true, -- soft delete
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_year CHECK (year >= 1900 AND year <= 2100),
    CONSTRAINT valid_ratings CHECK (vote_average >= 0 AND vote_average <= 10),
    CONSTRAINT valid_runtime CHECK (runtime IS NULL OR runtime > 0)
);

-- =============================================
-- 2. CATEGORY GAME TEMPLATES
-- =============================================

-- Reusable game templates (like your CategoryGameTemplate type)
CREATE TABLE IF NOT EXISTS public.category_game_templates (
    id TEXT PRIMARY KEY, -- matches your template IDs like 'movie-franchises'
    
    -- Basic Info
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Configuration
    max_mistakes INTEGER DEFAULT 4,
    show_hints BOOLEAN DEFAULT true,
    shuffle_movies BOOLEAN DEFAULT true,
    game_difficulty TEXT DEFAULT 'intermediate',
    
    -- Metadata
    tags JSONB DEFAULT '[]', -- array of tag strings
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_difficulty CHECK (game_difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
    CONSTRAINT valid_max_mistakes CHECK (max_mistakes > 0 AND max_mistakes <= 10),
    CONSTRAINT valid_template_id CHECK (id ~ '^[a-z0-9-]+$')
);

-- =============================================
-- 3. GAME CATEGORIES
-- =============================================

-- Categories within each game template
CREATE TABLE IF NOT EXISTS public.game_categories (
    id TEXT NOT NULL, -- like 'marvel-mcu', 'star-wars'
    template_id TEXT NOT NULL REFERENCES public.category_game_templates(id) ON DELETE CASCADE,
    
    -- Category Info
    name TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    hint TEXT,
    display_order INTEGER DEFAULT 1,
    
    -- UI Colors (stored as class names for flexibility)
    bg_color TEXT DEFAULT 'bg-blue-500/20',
    border_color TEXT DEFAULT 'border-blue-500/50', 
    text_color TEXT DEFAULT 'text-blue-300',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    PRIMARY KEY (id, template_id), -- composite key
    CONSTRAINT valid_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    CONSTRAINT valid_category_id CHECK (id ~ '^[a-z0-9-]+$'),
    CONSTRAINT valid_display_order CHECK (display_order > 0)
);

-- =============================================
-- 4. TEMPLATE MOVIES (Many-to-Many)
-- =============================================

-- Links movies to categories within game templates
CREATE TABLE IF NOT EXISTS public.template_movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    template_id TEXT NOT NULL REFERENCES public.category_game_templates(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL,
    
    -- Position & Config
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    FOREIGN KEY (category_id, template_id) REFERENCES public.game_categories(id, template_id) ON DELETE CASCADE,
    UNIQUE (template_id, movie_id), -- each movie appears once per template
    CONSTRAINT valid_display_order CHECK (display_order > 0)
);

-- =============================================
-- 5. CATEGORY GAME SESSIONS (User Progress)
-- =============================================

-- Individual game sessions/attempts
CREATE TABLE IF NOT EXISTS public.category_game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Game Info
    template_id TEXT NOT NULL REFERENCES public.category_game_templates(id) ON DELETE CASCADE,
    
    -- Player Info (supports both logged in and anonymous)
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- NULL for anonymous
    player_name TEXT, -- for anonymous players or display override
    
    -- Game State
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'abandoned'
    is_won BOOLEAN,
    
    -- Progress Tracking
    completed_categories JSONB DEFAULT '[]', -- array of completed category IDs
    mistake_count INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_elapsed_seconds INTEGER, -- calculated on completion
    
    -- Final Score/Stats
    final_score INTEGER DEFAULT 0,
    categories_found INTEGER DEFAULT 0,
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'abandoned')),
    CONSTRAINT valid_mistake_count CHECK (mistake_count >= 0),
    CONSTRAINT valid_categories_found CHECK (categories_found >= 0 AND categories_found <= 4),
    CONSTRAINT valid_time_elapsed CHECK (time_elapsed_seconds IS NULL OR time_elapsed_seconds > 0)
);

-- =============================================
-- 6. CATEGORY ATTEMPTS (Detailed Progress)
-- =============================================

-- Individual category guess attempts within a session
CREATE TABLE IF NOT EXISTS public.category_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    session_id UUID NOT NULL REFERENCES public.category_game_sessions(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL,
    template_id TEXT NOT NULL, -- for easier querying
    
    -- Attempt Data
    selected_movie_ids JSONB NOT NULL, -- array of movie IDs selected
    is_correct BOOLEAN NOT NULL,
    correct_count INTEGER DEFAULT 0, -- how many were actually correct
    
    -- Timing
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_correct_count CHECK (correct_count >= 0 AND correct_count <= 4)
);

-- =============================================
-- 7. CATEGORY GAME STATISTICS
-- =============================================

-- User statistics for category games
CREATE TABLE IF NOT EXISTS public.category_game_stats (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Overall Performance
    total_games_played INTEGER DEFAULT 0,
    total_games_completed INTEGER DEFAULT 0,
    total_games_won INTEGER DEFAULT 0,
    
    -- Perfect Games (no mistakes)
    perfect_games INTEGER DEFAULT 0,
    
    -- Best Performances
    best_time_seconds INTEGER, -- fastest completion
    best_score INTEGER, -- highest score achieved
    lowest_mistakes INTEGER, -- fewest mistakes in a won game
    
    -- Streaks
    current_win_streak INTEGER DEFAULT 0,
    best_win_streak INTEGER DEFAULT 0,
    
    -- Template-specific performance (JSONB for flexibility)
    template_stats JSONB DEFAULT '{}', -- { "template_id": { "played": 0, "won": 0, "avg_time": 0 } }
    
    -- Difficulty breakdown
    beginner_wins INTEGER DEFAULT 0,
    intermediate_wins INTEGER DEFAULT 0,
    advanced_wins INTEGER DEFAULT 0,
    expert_wins INTEGER DEFAULT 0,
    
    -- Timing
    first_played TIMESTAMP WITH TIME ZONE,
    last_played TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_completion_rate CHECK (total_games_completed <= total_games_played),
    CONSTRAINT valid_win_rate CHECK (total_games_won <= total_games_completed),
    CONSTRAINT valid_perfect_rate CHECK (perfect_games <= total_games_won),
    CONSTRAINT valid_streaks CHECK (current_win_streak >= 0 AND best_win_streak >= 0)
);

-- =============================================
-- 8. INDEXES FOR PERFORMANCE
-- =============================================

-- Movies table indexes
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON public.movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_title ON public.movies(title);
CREATE INDEX IF NOT EXISTS idx_movies_year ON public.movies(year DESC);
CREATE INDEX IF NOT EXISTS idx_movies_popularity ON public.movies(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_movies_active ON public.movies(is_active) WHERE is_active = true;

-- Game templates
CREATE INDEX IF NOT EXISTS idx_templates_active ON public.category_game_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_templates_difficulty ON public.category_game_templates(game_difficulty);
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON public.category_game_templates(created_by);

-- Game categories
CREATE INDEX IF NOT EXISTS idx_categories_template ON public.game_categories(template_id);
CREATE INDEX IF NOT EXISTS idx_categories_difficulty ON public.game_categories(difficulty);

-- Template movies (for game loading)
CREATE INDEX IF NOT EXISTS idx_template_movies_template ON public.template_movies(template_id);
CREATE INDEX IF NOT EXISTS idx_template_movies_category ON public.template_movies(category_id, template_id);
CREATE INDEX IF NOT EXISTS idx_template_movies_active ON public.template_movies(is_active) WHERE is_active = true;

-- Game sessions (for leaderboards and user history)
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.category_game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_template ON public.category_game_sessions(template_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.category_game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_leaderboard ON public.category_game_sessions(template_id, is_won DESC, time_elapsed_seconds ASC, completed_at ASC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_history ON public.category_game_sessions(user_id, completed_at DESC);

-- Category attempts (for analytics)
CREATE INDEX IF NOT EXISTS idx_attempts_session ON public.category_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_attempts_template ON public.category_attempts(template_id);

-- Statistics
CREATE INDEX IF NOT EXISTS idx_category_stats_wins ON public.category_game_stats(total_games_won DESC);
CREATE INDEX IF NOT EXISTS idx_category_stats_streaks ON public.category_game_stats(best_win_streak DESC);

-- =============================================
-- 9. HELPER FUNCTIONS
-- =============================================

-- Function to calculate final score based on performance
CREATE OR REPLACE FUNCTION calculate_category_game_score(
    p_categories_found INTEGER,
    p_mistake_count INTEGER,
    p_time_seconds INTEGER,
    p_max_mistakes INTEGER
) RETURNS INTEGER AS $$
DECLARE
    base_score INTEGER := 1000;
    category_bonus INTEGER := p_categories_found * 250;
    mistake_penalty INTEGER := p_mistake_count * 100;
    time_bonus INTEGER;
    final_score INTEGER;
BEGIN
    -- Time bonus: more points for faster completion
    -- Max 200 bonus points, decreases as time increases
    IF p_time_seconds <= 60 THEN
        time_bonus := 200;
    ELSIF p_time_seconds <= 180 THEN
        time_bonus := 150;
    ELSIF p_time_seconds <= 300 THEN
        time_bonus := 100;
    ELSIF p_time_seconds <= 600 THEN
        time_bonus := 50;
    ELSE
        time_bonus := 0;
    END IF;
    
    final_score := base_score + category_bonus - mistake_penalty + time_bonus;
    
    -- Ensure minimum score of 0
    RETURN GREATEST(final_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update category game stats when session completes
CREATE OR REPLACE FUNCTION update_category_game_stats()
RETURNS TRIGGER AS $$
DECLARE
    template_stats JSONB;
    current_stats JSONB;
BEGIN
    -- Only process completed sessions
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        
        -- Insert or update user stats
        INSERT INTO public.category_game_stats (
            user_id, 
            total_games_played, 
            total_games_completed, 
            total_games_won,
            perfect_games,
            best_time_seconds,
            best_score,
            lowest_mistakes,
            first_played,
            last_played
        ) VALUES (
            NEW.user_id,
            1,
            1,
            CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
            CASE WHEN NEW.is_won AND NEW.mistake_count = 0 THEN 1 ELSE 0 END,
            NEW.time_elapsed_seconds,
            NEW.final_score,
            CASE WHEN NEW.is_won THEN NEW.mistake_count ELSE NULL END,
            NEW.started_at,
            NEW.completed_at
        )
        ON CONFLICT (user_id) DO UPDATE SET
            total_games_played = category_game_stats.total_games_played + 1,
            total_games_completed = category_game_stats.total_games_completed + 1,
            total_games_won = category_game_stats.total_games_won + CASE WHEN NEW.is_won THEN 1 ELSE 0 END,
            perfect_games = category_game_stats.perfect_games + CASE WHEN NEW.is_won AND NEW.mistake_count = 0 THEN 1 ELSE 0 END,
            best_time_seconds = CASE 
                WHEN NEW.is_won AND (category_game_stats.best_time_seconds IS NULL OR NEW.time_elapsed_seconds < category_game_stats.best_time_seconds)
                THEN NEW.time_elapsed_seconds 
                ELSE category_game_stats.best_time_seconds 
            END,
            best_score = GREATEST(category_game_stats.best_score, NEW.final_score),
            lowest_mistakes = CASE 
                WHEN NEW.is_won AND (category_game_stats.lowest_mistakes IS NULL OR NEW.mistake_count < category_game_stats.lowest_mistakes)
                THEN NEW.mistake_count
                ELSE category_game_stats.lowest_mistakes
            END,
            current_win_streak = CASE 
                WHEN NEW.is_won THEN category_game_stats.current_win_streak + 1 
                ELSE 0 
            END,
            best_win_streak = CASE 
                WHEN NEW.is_won THEN GREATEST(category_game_stats.best_win_streak, category_game_stats.current_win_streak + 1)
                ELSE category_game_stats.best_win_streak
            END,
            last_played = NEW.completed_at,
            updated_at = NOW();
            
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update stats when session completes
DROP TRIGGER IF EXISTS update_category_game_stats_trigger ON public.category_game_sessions;
CREATE TRIGGER update_category_game_stats_trigger
    AFTER UPDATE ON public.category_game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_category_game_stats();

-- =============================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on user-related tables
ALTER TABLE public.category_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_game_stats ENABLE ROW LEVEL SECURITY;

-- Movies, templates, and categories are public (read-only for users)
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_game_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_movies ENABLE ROW LEVEL SECURITY;

-- Public read access for game data
CREATE POLICY "Game data is viewable by everyone" ON public.movies FOR SELECT USING (is_active = true);
CREATE POLICY "Templates are viewable by everyone" ON public.category_game_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Categories are viewable by everyone" ON public.game_categories FOR SELECT USING (true);
CREATE POLICY "Template movies are viewable by everyone" ON public.template_movies FOR SELECT USING (is_active = true);

-- Game sessions: users can view/edit their own, anonymous can create
CREATE POLICY "Users can view their own sessions" ON public.category_game_sessions
    FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Anyone can create sessions" ON public.category_game_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own sessions" ON public.category_game_sessions
    FOR UPDATE USING (user_id = auth.uid());

-- Category attempts: linked to sessions
CREATE POLICY "Users can view their attempts" ON public.category_attempts
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.category_game_sessions WHERE id = session_id AND (user_id = auth.uid() OR user_id IS NULL))
    );

CREATE POLICY "Anyone can create attempts" ON public.category_attempts
    FOR INSERT WITH CHECK (true);

-- Statistics: public read, users can manage their own
CREATE POLICY "Public stats are viewable" ON public.category_game_stats
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = user_id AND is_public_profile = true)
        OR user_id = auth.uid()
    );

CREATE POLICY "Users can manage their own stats" ON public.category_game_stats
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- END OF CATEGORIES GAME SCHEMA
-- =============================================