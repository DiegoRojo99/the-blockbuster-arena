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
CREATE TABLE public.users (
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
CREATE TABLE public.game_types (
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

-- Insert initial game types
INSERT INTO public.game_types (id, name, description, icon, supports_sharing, supports_resuming) VALUES
    ('cast_game', 'Cast Guessing', 'Guess the movie by its cast members', '🎭', true, true),
    ('grid_game', 'Movie Grid', 'Complete the movie category grid', '🎬', true, false);

-- =============================================
-- 3. CAST GAME SPECIFIC TABLES
-- =============================================

-- Cast Game Instances (individual games)
CREATE TABLE public.cast_games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Game Configuration
    mode TEXT NOT NULL, -- 'popular', 'top_rated', 'now_playing', 'upcoming'
    language TEXT NOT NULL DEFAULT 'en',
    max_cast_reveals INTEGER DEFAULT 6,
    
    -- Movie Data (from TMDB)
    tmdb_movie_id INTEGER NOT NULL,
    movie_title TEXT NOT NULL,
    movie_year INTEGER,
    movie_poster_path TEXT,
    cast_data JSONB NOT NULL, -- array of cast members with profile images
    
    -- Game State
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'abandoned'
    current_cast_revealed INTEGER DEFAULT 1,
    total_attempts INTEGER DEFAULT 0,
    
    -- Creator & Sharing
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    share_slug TEXT UNIQUE, -- for URLs like /cast-game/quick-movie-123
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_mode CHECK (mode IN ('popular', 'top_rated', 'now_playing', 'upcoming')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'abandoned')),
    CONSTRAINT valid_language CHECK (language IN ('en', 'es')),
    CONSTRAINT valid_cast_reveals CHECK (current_cast_revealed >= 1 AND current_cast_revealed <= max_cast_reveals),
    CONSTRAINT valid_share_slug CHECK (share_slug IS NULL OR share_slug ~ '^[a-z]+-[a-z]+-[0-9]{3}$')
);

-- Cast Game Players (who's playing each game)
CREATE TABLE public.cast_game_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cast_game_id UUID NOT NULL REFERENCES public.cast_games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Player State
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    
    -- Progress Tracking
    attempts_made INTEGER DEFAULT 0,
    has_solved BOOLEAN DEFAULT false,
    solved_at TIMESTAMP WITH TIME ZONE,
    cast_revealed_when_solved INTEGER,
    
    -- Game-specific player data (flexible)
    player_data JSONB DEFAULT '{}',
    
    -- Constraints
    UNIQUE(cast_game_id, user_id),
    CONSTRAINT valid_attempts CHECK (attempts_made >= 0)
);

-- Individual Guess Attempts
CREATE TABLE public.cast_game_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cast_game_id UUID NOT NULL REFERENCES public.cast_games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Attempt Details
    guessed_tmdb_id INTEGER,
    guessed_title TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    
    -- Game State at Attempt
    cast_revealed_count INTEGER NOT NULL,
    attempt_number INTEGER NOT NULL, -- 1st, 2nd, 3rd for this user in this game
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_cast_revealed CHECK (cast_revealed_count >= 1 AND cast_revealed_count <= 6),
    CONSTRAINT valid_attempt_number CHECK (attempt_number > 0)
);

-- =============================================
-- 4. USER STATISTICS & ACHIEVEMENTS
-- =============================================

-- Cast Game User Statistics
CREATE TABLE public.cast_game_stats (
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
CREATE TABLE public.user_game_stats (
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
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_last_active ON public.users(last_active DESC);

-- Cast Game lookups
CREATE INDEX idx_cast_games_share_slug ON public.cast_games(share_slug);
CREATE INDEX idx_cast_games_created_by ON public.cast_games(created_by);
CREATE INDEX idx_cast_games_status ON public.cast_games(status);
CREATE INDEX idx_cast_games_mode ON public.cast_games(mode);
CREATE INDEX idx_cast_games_public ON public.cast_games(is_public) WHERE is_public = true;
CREATE INDEX idx_cast_games_active ON public.cast_games(last_activity DESC) WHERE status = 'active';

-- Game participation
CREATE INDEX idx_cast_game_players_user ON public.cast_game_players(user_id);
CREATE INDEX idx_cast_game_players_game ON public.cast_game_players(cast_game_id);
CREATE INDEX idx_cast_game_players_solved ON public.cast_game_players(user_id, has_solved);

-- Attempts for leaderboards
CREATE INDEX idx_cast_game_attempts_game ON public.cast_game_attempts(cast_game_id);
CREATE INDEX idx_cast_game_attempts_user ON public.cast_game_attempts(user_id);
CREATE INDEX idx_cast_game_attempts_correct ON public.cast_game_attempts(cast_game_id, is_correct);

-- Statistics
CREATE INDEX idx_user_game_stats_lookup ON public.user_game_stats(user_id, game_type_id);
CREATE INDEX idx_cast_game_stats_streaks ON public.cast_game_stats(best_streak DESC);
CREATE INDEX idx_cast_game_stats_performance ON public.cast_game_stats(games_solved DESC, total_attempts ASC);

-- =============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_game_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_game_stats ENABLE ROW LEVEL SECURITY;

-- Users can read public profiles, update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.users
    FOR SELECT USING (is_public_profile = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Cast Games: Public games readable by all, private games only by participants
CREATE POLICY "Public cast games are viewable by everyone" ON public.cast_games
    FOR SELECT USING (
        is_public = true 
        OR created_by = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.cast_game_players 
            WHERE cast_game_id = id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create cast games" ON public.cast_games
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Game creators can update their games" ON public.cast_games
    FOR UPDATE USING (auth.uid() = created_by);

-- Game Players: Users can join games and view their participation
CREATE POLICY "Users can view game participation" ON public.cast_game_players
    FOR SELECT USING (
        user_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.cast_games 
            WHERE id = cast_game_id AND (is_public = true OR created_by = auth.uid())
        )
    );

CREATE POLICY "Users can join games" ON public.cast_game_players
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their game participation" ON public.cast_game_players
    FOR UPDATE USING (auth.uid() = user_id);

-- Attempts: Users can view attempts for games they participate in
CREATE POLICY "Users can view game attempts" ON public.cast_game_attempts
    FOR SELECT USING (
        user_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.cast_games 
            WHERE id = cast_game_id AND (is_public = true OR created_by = auth.uid())
        )
    );

CREATE POLICY "Users can create their own attempts" ON public.cast_game_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

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
CREATE POLICY "Game types are viewable by everyone" ON public.game_types
    FOR SELECT USING (true);

-- =============================================
-- 7. UTILITY FUNCTIONS
-- =============================================

-- Function to generate unique share slugs
CREATE OR REPLACE FUNCTION generate_share_slug()
RETURNS TEXT AS $$
DECLARE
    adjectives TEXT[] := ARRAY['quick', 'smart', 'epic', 'wild', 'cool', 'fast', 'bright', 'bold', 'wise', 'great'];
    nouns TEXT[] := ARRAY['movie', 'guess', 'cast', 'film', 'star', 'scene', 'role', 'show', 'plot', 'hero'];
    slug TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        slug := adjectives[1 + floor(random() * array_length(adjectives, 1))] || '-' ||
                nouns[1 + floor(random() * array_length(nouns, 1))] || '-' ||
                lpad(floor(random() * 1000)::TEXT, 3, '0');
        
        -- Check if slug already exists
        IF NOT EXISTS (SELECT 1 FROM public.cast_games WHERE share_slug = slug) THEN
            RETURN slug;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            -- Fallback to UUID-based slug if we can't find a unique one
            RETURN 'game-' || substring(gen_random_uuid()::TEXT, 1, 8);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update user activity
CREATE OR REPLACE FUNCTION update_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users 
    SET last_active = NOW() 
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user activity on game actions
CREATE TRIGGER update_user_activity_on_attempt
    AFTER INSERT ON public.cast_game_attempts
    FOR EACH ROW EXECUTE FUNCTION update_user_activity();

CREATE TRIGGER update_user_activity_on_join
    AFTER INSERT ON public.cast_game_players
    FOR EACH ROW EXECUTE FUNCTION update_user_activity();

-- =============================================
-- 8. SAMPLE DATA (Optional - for testing)
-- =============================================

-- Note: This will be populated when users sign up and start playing
-- The actual game data will be created by the application

-- =============================================
-- END OF SCHEMA
-- =============================================