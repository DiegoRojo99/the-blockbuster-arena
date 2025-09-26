-- =============================================
-- THE BLOCKBUSTER ARENA - SUPABASE SCHEMA
-- =============================================
-- Multi-game database architecture supporting:
-- - Cast Guessing Game (current)
-- - Grid Games (future)
-- - Any additional games (future)
-- - User profiles with social auth
-- - Game sharing via URLs
-- - Statistics and leaderboards
-- =============================================

-- =============================================
-- 1. CORE USERS & AUTHENTICATION
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Profile
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    
    -- Auth Info (synced from auth.users)
    email TEXT,
    provider TEXT, -- 'google', 'github', 'email', etc.
    
    -- Preferences
    preferred_language TEXT DEFAULT 'en',
    theme_preference TEXT DEFAULT 'system', -- 'light', 'dark', 'system'
    is_public_profile BOOLEAN DEFAULT true,
    
    -- Activity Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_username CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$'),
    CONSTRAINT valid_theme CHECK (theme_preference IN ('light', 'dark', 'system')),
    CONSTRAINT valid_language CHECK (preferred_language IN ('en', 'es'))
);

-- =============================================
-- 2. GAME TYPES (Extensible)
-- =============================================

-- Game types registry
CREATE TABLE IF NOT EXISTS public.game_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- emoji or icon identifier
    is_active BOOLEAN DEFAULT true,
    
    -- Game Configuration
    min_players INTEGER DEFAULT 1,
    max_players INTEGER DEFAULT 1, -- for future multiplayer
    supports_sharing BOOLEAN DEFAULT true,
    supports_resuming BOOLEAN DEFAULT true,
    
    -- Metadata
    version TEXT DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_game_id CHECK (id ~ '^[a-z_]+$')
);

-- Insert initial game types (only if they don't exist)
INSERT INTO public.game_types (id, name, description, icon, supports_sharing, supports_resuming) VALUES
    ('cast_game', 'Cast Guessing', 'Guess the movie by its cast members', '🎭', true, true),
    ('grid_game', 'Movie Grid', 'Complete the movie category grid', '🎬', true, false)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 3. SHARED CAST GAMES (Only games shared by users)
-- =============================================

-- Shared Cast Games (only created when user clicks "Share Game")
CREATE TABLE IF NOT EXISTS public.shared_cast_games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Movie Data (from TMDB - snapshot at time of sharing)
    tmdb_movie_id INTEGER NOT NULL,
    movie_title TEXT NOT NULL,
    movie_year INTEGER,
    movie_poster_path TEXT,
    cast_data JSONB NOT NULL, -- array of cast members with profile images
    
    -- Game Configuration (from original game)
    mode TEXT NOT NULL, -- 'popular', 'top_rated', 'now_playing', 'upcoming'
    language TEXT NOT NULL DEFAULT 'en',
    max_cast_reveals INTEGER DEFAULT 6,
    
    -- Creator Info
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Allow nulls if user deleted
    creator_username TEXT, -- Snapshot of username at time of creation
    
    -- Sharing & Access
    share_slug TEXT UNIQUE NOT NULL, -- for URLs like /cast-game/quick-movie-123
    is_public BOOLEAN DEFAULT true,
    
    -- Stats
    total_attempts INTEGER DEFAULT 0,
    successful_attempts INTEGER DEFAULT 0,
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_mode CHECK (mode IN ('popular', 'top_rated', 'now_playing', 'upcoming')),
    CONSTRAINT valid_language CHECK (language IN ('en', 'es')),
    CONSTRAINT valid_share_slug CHECK (share_slug ~ '^[a-z]+-[a-z]+-[0-9]{3}$'),
    CONSTRAINT valid_stats CHECK (successful_attempts <= total_attempts)
);

-- Shared Game Attempts (final results only, not individual guesses)
CREATE TABLE IF NOT EXISTS public.shared_game_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shared_game_id UUID NOT NULL REFERENCES public.shared_cast_games(id) ON DELETE CASCADE,
    
    -- Player Info (supports both logged in and anonymous users)
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- NULL for anonymous
    player_name TEXT NOT NULL, -- username for logged users, custom name for anonymous
    
    -- Game Result (final outcome only)
    is_correct BOOLEAN NOT NULL,
    guess_count INTEGER NOT NULL, -- total guesses made
    cast_revealed_count INTEGER NOT NULL, -- cast members revealed when game ended
    
    -- Optional: Time taken to complete (future feature)
    time_taken_seconds INTEGER,
    
    -- Timing
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_cast_revealed CHECK (cast_revealed_count >= 1 AND cast_revealed_count <= 6),
    CONSTRAINT valid_time_taken CHECK (time_taken_seconds IS NULL OR time_taken_seconds > 0)
);

-- Drop the valid_guess_count constraint if it exists (allows 0 guesses for give-up scenarios)
ALTER TABLE public.shared_game_attempts DROP CONSTRAINT IF EXISTS valid_guess_count;

-- =============================================
-- 4. USER STATISTICS & ACHIEVEMENTS
-- =============================================

-- Cast Game User Statistics
CREATE TABLE IF NOT EXISTS public.cast_game_stats (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Overall Performance
    games_played INTEGER DEFAULT 0,
    games_solved INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    
    -- Games Solved by Cast Reveal Count (1-6)
    games_solved_cast_1 INTEGER DEFAULT 0, -- guessed with only 1st cast member shown
    games_solved_cast_2 INTEGER DEFAULT 0, -- guessed with 2nd cast member shown
    games_solved_cast_3 INTEGER DEFAULT 0, -- guessed with 3rd cast member shown
    games_solved_cast_4 INTEGER DEFAULT 0, -- guessed with 4th cast member shown
    games_solved_cast_5 INTEGER DEFAULT 0, -- guessed with 5th cast member shown
    games_solved_cast_6 INTEGER DEFAULT 0, -- guessed with all 6 cast members shown
    games_not_completed INTEGER DEFAULT 0, -- games abandoned or not finished
    
    -- Best Performances
    best_solve_cast_count INTEGER, -- solved with fewest cast reveals
    best_solve_attempts INTEGER, -- solved with fewest attempts
    fastest_solve_seconds INTEGER,
    
    -- Streaks
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    
    -- Mode-specific Statistics (JSONB for flexibility)
    popular_stats JSONB DEFAULT '{"played": 0, "solved": 0, "avg_attempts": 0}',
    top_rated_stats JSONB DEFAULT '{"played": 0, "solved": 0, "avg_attempts": 0}',
    now_playing_stats JSONB DEFAULT '{"played": 0, "solved": 0, "avg_attempts": 0}',
    upcoming_stats JSONB DEFAULT '{"played": 0, "solved": 0, "avg_attempts": 0}',
    
    -- Timing
    first_played TIMESTAMP WITH TIME ZONE,
    last_played TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_games_count CHECK (games_played >= games_solved),
    CONSTRAINT valid_streaks CHECK (current_streak >= 0 AND best_streak >= 0),
    CONSTRAINT valid_cast_breakdown CHECK (
        games_solved = (games_solved_cast_1 + games_solved_cast_2 + games_solved_cast_3 + 
                       games_solved_cast_4 + games_solved_cast_5 + games_solved_cast_6)
    ),
    CONSTRAINT valid_total_games CHECK (
        games_played = (games_solved + games_not_completed)
    )
);

-- Overall User Game Statistics (cross all game types)
CREATE TABLE IF NOT EXISTS public.user_game_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    game_type_id TEXT NOT NULL REFERENCES public.game_types(id),
    
    -- General Stats
    games_played INTEGER DEFAULT 0,
    games_completed INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    best_single_game_score INTEGER DEFAULT 0,
    
    -- Activity
    first_played TIMESTAMP WITH TIME ZONE,
    last_played TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Game-specific data (JSONB for flexibility per game type)
    stats_data JSONB DEFAULT '{}',
    
    -- Constraints
    UNIQUE(user_id, game_type_id),
    CONSTRAINT valid_completion_rate CHECK (games_completed <= games_played)
);

-- =============================================
-- 5. INDEXES FOR PERFORMANCE
-- =============================================

-- User lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON public.users(last_active DESC);

-- Shared Cast Games lookups
CREATE INDEX IF NOT EXISTS idx_shared_games_slug ON public.shared_cast_games(share_slug);
CREATE INDEX IF NOT EXISTS idx_shared_games_creator ON public.shared_cast_games(created_by);
CREATE INDEX IF NOT EXISTS idx_shared_games_mode ON public.shared_cast_games(mode);
CREATE INDEX IF NOT EXISTS idx_shared_games_created_at ON public.shared_cast_games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_games_popular ON public.shared_cast_games(total_attempts DESC);

-- Shared Game Attempts (for leaderboards and stats)
CREATE INDEX IF NOT EXISTS idx_shared_attempts_game ON public.shared_game_attempts(shared_game_id);
CREATE INDEX IF NOT EXISTS idx_shared_attempts_user ON public.shared_game_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_attempts_leaderboard ON public.shared_game_attempts(shared_game_id, is_correct DESC, guess_count ASC, completed_at ASC);

-- Prevent duplicate attempts from same logged-in user for same game (allows multiple anonymous attempts)
CREATE UNIQUE INDEX IF NOT EXISTS idx_shared_attempts_unique_user 
ON public.shared_game_attempts(shared_game_id, user_id) 
WHERE user_id IS NOT NULL;

-- Statistics
CREATE INDEX IF NOT EXISTS idx_user_game_stats_lookup ON public.user_game_stats(user_id, game_type_id);
CREATE INDEX IF NOT EXISTS idx_cast_game_stats_streaks ON public.cast_game_stats(best_streak DESC);
CREATE INDEX IF NOT EXISTS idx_cast_game_stats_performance ON public.cast_game_stats(games_solved DESC, total_attempts ASC);

-- =============================================
-- 6. HELPER FUNCTIONS
-- =============================================

-- Function to generate unique share slugs
CREATE OR REPLACE FUNCTION generate_share_slug()
RETURNS TEXT AS $$
DECLARE
    adjectives TEXT[] := ARRAY['quick', 'epic', 'wild', 'cool', 'smart', 'fast', 'fun', 'bright', 'bold', 'wise'];
    nouns TEXT[] := ARRAY['movie', 'film', 'cast', 'star', 'hero', 'scene', 'plot', 'story', 'drama', 'action'];
    slug TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        slug := adjectives[1 + floor(random() * array_length(adjectives, 1))] || '-' ||
                nouns[1 + floor(random() * array_length(nouns, 1))] || '-' ||
                LPAD(floor(random() * 1000)::TEXT, 3, '0');
        
        -- Check if slug already exists
        IF NOT EXISTS (SELECT 1 FROM public.shared_cast_games WHERE share_slug = slug) THEN
            RETURN slug;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            -- Fallback to UUID-based slug if we can't find a unique one
            RETURN 'game-' || SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update shared game stats when attempt is added
CREATE OR REPLACE FUNCTION update_shared_game_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.shared_cast_games 
    SET 
        total_attempts = total_attempts + 1,
        successful_attempts = successful_attempts + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END
    WHERE id = NEW.shared_game_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update stats
DROP TRIGGER IF EXISTS update_shared_game_stats_trigger ON public.shared_game_attempts;
CREATE TRIGGER update_shared_game_stats_trigger
    AFTER INSERT ON public.shared_game_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_shared_game_stats();

-- =============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_cast_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_game_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_game_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts, then recreate
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Users can read public profiles, update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.users
    FOR SELECT USING (is_public_profile = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Drop existing shared game policies
DROP POLICY IF EXISTS "Anyone can view shared games" ON public.shared_cast_games;
DROP POLICY IF EXISTS "Anyone can create shared games" ON public.shared_cast_games;
DROP POLICY IF EXISTS "Creators can update their shared games" ON public.shared_cast_games;

-- Shared Cast Games: Anyone can view and create, creators can update
CREATE POLICY "Anyone can view shared games" ON public.shared_cast_games
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Anyone can create shared games" ON public.shared_cast_games
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Creators can update their shared games" ON public.shared_cast_games
    FOR UPDATE TO authenticated
    USING (auth.uid() = created_by);

-- Drop existing shared game attempts policies
DROP POLICY IF EXISTS "Anyone can view shared game attempts" ON public.shared_game_attempts;
DROP POLICY IF EXISTS "Anyone can create shared game attempts" ON public.shared_game_attempts;

-- Shared Game Attempts: Anyone can view and create attempts
CREATE POLICY "Anyone can view shared game attempts" ON public.shared_game_attempts
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Anyone can create shared game attempts" ON public.shared_game_attempts
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Drop existing stats policies
DROP POLICY IF EXISTS "Public stats are viewable" ON public.cast_game_stats;
DROP POLICY IF EXISTS "Users can manage their own stats" ON public.cast_game_stats;
DROP POLICY IF EXISTS "Public game stats are viewable" ON public.user_game_stats;
DROP POLICY IF EXISTS "Users can manage their own game stats" ON public.user_game_stats;

-- Statistics: Users can view public stats, edit their own
CREATE POLICY "Public stats are viewable" ON public.cast_game_stats
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = user_id AND is_public_profile = true)
        OR user_id = auth.uid()
    );

CREATE POLICY "Users can manage their own stats" ON public.cast_game_stats
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public game stats are viewable" ON public.user_game_stats
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = user_id AND is_public_profile = true)
        OR user_id = auth.uid()
    );

CREATE POLICY "Users can manage their own game stats" ON public.user_game_stats
    FOR ALL USING (auth.uid() = user_id);

-- Game types are public (read-only for users)
ALTER TABLE public.game_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Game types are viewable by everyone" ON public.game_types;
CREATE POLICY "Game types are viewable by everyone" ON public.game_types
    FOR SELECT USING (true);

-- =============================================
-- 8. ADDITIONAL UTILITY FUNCTIONS
-- =============================================

-- Function to update user activity when they complete shared games
CREATE OR REPLACE FUNCTION update_user_activity_shared()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if the attempt is from a logged-in user
    IF NEW.user_id IS NOT NULL THEN
        UPDATE public.users 
        SET last_active = NOW() 
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user activity on shared game completion
DROP TRIGGER IF EXISTS update_user_activity_on_shared_attempt ON public.shared_game_attempts;
CREATE TRIGGER update_user_activity_on_shared_attempt
    AFTER INSERT ON public.shared_game_attempts
    FOR EACH ROW EXECUTE FUNCTION update_user_activity_shared();

-- =============================================
-- 9. SAMPLE DATA (Optional - for testing)
-- =============================================

-- Note: This will be populated when users sign up and start playing
-- The actual game data will be created by the application

-- =============================================
-- END OF SCHEMA
-- =============================================