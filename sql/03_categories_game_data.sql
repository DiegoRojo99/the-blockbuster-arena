-- =============================================
-- CATEGORIES GAME DATA POPULATION
-- =============================================
-- Populates the categories game tables with initial data
-- Based on the game templates from categories-game.ts
-- =============================================

-- =============================================
-- 1. INSERT SAMPLE MOVIES (From TMDB-style data)
-- =============================================

-- Insert movies for the franchise game
INSERT INTO public.movies (tmdb_id, title, release_date, poster_path, overview, popularity, vote_average, vote_count, genres) VALUES
-- Marvel MCU Movies
(1726, 'Iron Man', '2008-05-02', '/78lPtwv72eTNqFW9COBYI0dWDJa.jpg', 'After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil.', 85.0, 7.6, 24000, '[{"id": 28, "name": "Action"}, {"id": 878, "name": "Science Fiction"}]'),
(24428, 'The Avengers', '2012-05-04', '/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg', 'When an unexpected enemy emerges and threatens global safety and security, Nick Fury, director of the international peacekeeping agency known as S.H.I.E.L.D., finds himself in need of a team to pull the world back from the brink of disaster.', 95.0, 8.0, 29000, '[{"id": 28, "name": "Action"}, {"id": 12, "name": "Adventure"}]'),
(10195, 'Thor', '2011-05-06', '/bIuOWTtyFPjsFDevqvF3QrD1aun.jpg', 'Against his father Odins will, The Mighty Thor - a powerful but arrogant warrior god - recklessly reignites an ancient war.', 75.0, 7.0, 18000, '[{"id": 28, "name": "Action"}, {"id": 12, "name": "Adventure"}]'),
(118340, 'Guardians of the Galaxy', '2014-08-01', '/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg', 'Light years from Earth, 26 years after being abducted, Peter Quill finds himself the prime target of a manhunt after discovering an orb wanted by Ronan the Accuser.', 88.0, 8.0, 25000, '[{"id": 28, "name": "Action"}, {"id": 878, "name": "Science Fiction"}]'),

-- Star Wars Movies  
(11, 'Star Wars', '1977-05-25', '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg', 'Princess Leia is captured and held hostage by the evil Imperial forces in their effort to take over the galactic Empire.', 92.0, 8.6, 20000, '[{"id": 12, "name": "Adventure"}, {"id": 28, "name": "Action"}]'),
(1891, 'The Empire Strikes Back', '1980-05-20', '/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg', 'The epic saga continues as Luke Skywalker, in hopes of defeating the evil Galactic Empire, learns the ways of the Jedi from aging master Yoda.', 90.0, 8.7, 18000, '[{"id": 12, "name": "Adventure"}, {"id": 28, "name": "Action"}]'),
(1892, 'Return of the Jedi', '1983-05-25', '/pfYShMQ7en1F6fa7O5xxllpK1dM.jpg', 'Luke Skywalker leads a mission to rescue his friend Han Solo from the clutches of Jabba the Hutt, while the Emperor seeks to destroy the Rebellion once and for all.', 85.0, 8.3, 16000, '[{"id": 12, "name": "Adventure"}, {"id": 28, "name": "Action"}]'),
(140607, 'Star Wars: The Force Awakens', '2015-12-18', '/wqnLdwVXoBjKibFRR5U3y0aDUhs.jpg', 'Thirty years after defeating the Galactic Empire, Han Solo and his allies face a new threat from the evil First Order.', 95.0, 7.3, 22000, '[{"id": 12, "name": "Adventure"}, {"id": 28, "name": "Action"}]'),

-- DC Universe Movies
(49026, 'Man of Steel', '2013-06-14', '/7rIPjn5TUK04O25ZkMyHrGNPgLx.jpg', 'A young boy learns that he has extraordinary powers and is not of this earth.', 70.0, 7.1, 15000, '[{"id": 28, "name": "Action"}, {"id": 878, "name": "Science Fiction"}]'),
(209112, 'Batman v Superman: Dawn of Justice', '2016-03-25', '/5UsK3grJvtQrtzEgqNlDljJW96w.jpg', 'Fearing the actions of a god-like Super Hero left unchecked, Gotham Citys own formidable, forceful vigilante takes on Metropoliss most revered, modern-day savior.', 65.0, 6.2, 18000, '[{"id": 28, "name": "Action"}, {"id": 12, "name": "Adventure"}]'),
(297761, 'Wonder Woman', '2017-06-02', '/gfJGlDaHuWimErCr5Ql0I8x9QSy.jpg', 'An Amazon princess comes to the world of Man in the grips of the First World War to confront the forces of evil and bring an end to human conflict.', 80.0, 7.4, 20000, '[{"id": 28, "name": "Action"}, {"id": 12, "name": "Adventure"}]'),
(297802, 'Aquaman', '2018-12-21', '/zdw7Wf97vsQ0YnGomxDqfcEdUjX.jpg', 'Once home to the most advanced civilization on Earth, Atlantis is now an underwater kingdom ruled by the power-hungry King Orm.', 75.0, 6.9, 16000, '[{"id": 28, "name": "Action"}, {"id": 12, "name": "Adventure"}]'),

-- Fast & Furious Movies
(51497, 'Fast Five', '2011-04-29', '/209112.jpg', 'Former cop Brian OConner partners with ex-con Dom Toretto on the opposite side of the law.', 80.0, 7.3, 12000, '[{"id": 28, "name": "Action"}, {"id": 80, "name": "Crime"}]'),
(82992, 'Fast & Furious 6', '2013-05-24', '/b9gTJKLdSbwcQRKzmqMq3dMfRwI.jpg', 'Hobbs has Dominic and Brian reassemble their crew to take down a team of mercenaries.', 82.0, 7.0, 14000, '[{"id": 28, "name": "Action"}, {"id": 80, "name": "Crime"}]'),
(168259, 'Furious 7', '2015-04-03', '/dCgm7efXDmiABSdWDHBDBx2jwmn.jpg', 'Deckard Shaw seeks revenge against Dominic Toretto and his family for the death of his brother.', 90.0, 7.1, 16000, '[{"id": 28, "name": "Action"}, {"id": 80, "name": "Crime"}]'),
(337339, 'The Fate of the Furious', '2017-04-15', '/dImWM7GJqryWJO9LHa3XQ8DD5NH.jpg', 'When a mysterious woman seduces Dom into the world of crime and a betrayal of those closest to him, the crew face trials that will test them as never before.', 85.0, 6.6, 15000, '[{"id": 28, "name": "Action"}, {"id": 80, "name": "Crime"}]')

ON CONFLICT (tmdb_id) DO NOTHING;

-- =============================================
-- 2. INSERT GAME TEMPLATES
-- =============================================

-- Movie Franchises Game
INSERT INTO public.category_game_templates (id, name, description, max_mistakes, show_hints, shuffle_movies, game_difficulty, tags, is_active) VALUES
('movie-franchises', 'Movie Franchises', 'Group these movies by their franchise or series', 4, true, true, 'intermediate', '["franchises", "series", "popular"]', true),
('famous-directors', 'Famous Directors', 'Match these movies to their acclaimed directors', 4, true, true, 'advanced', '["directors", "auteurs", "cinema"]', true),
('movie-decades', 'Movie Decades', 'Group these classic films by the decade they were released', 4, true, true, 'expert', '["decades", "classics", "history"]', true)

ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 3. INSERT GAME CATEGORIES
-- =============================================

-- Categories for Movie Franchises Game
INSERT INTO public.game_categories (id, template_id, name, difficulty, hint, display_order, bg_color, border_color, text_color) VALUES
('marvel-mcu', 'movie-franchises', 'Marvel Cinematic Universe', 'easy', 'Superhero movies from Disney''s Marvel Studios', 1, 'bg-green-500/20', 'border-green-500/50', 'text-green-300'),
('star-wars', 'movie-franchises', 'Star Wars Saga', 'easy', 'A galaxy far, far away...', 2, 'bg-green-500/20', 'border-green-500/50', 'text-green-300'),
('dc-universe', 'movie-franchises', 'DC Extended Universe', 'medium', 'Warner Bros superhero movies', 3, 'bg-yellow-500/20', 'border-yellow-500/50', 'text-yellow-300'),
('fast-furious', 'movie-franchises', 'Fast & Furious Franchise', 'medium', 'Family, cars, and impossible stunts', 4, 'bg-yellow-500/20', 'border-yellow-500/50', 'text-yellow-300')

ON CONFLICT (id, template_id) DO NOTHING;

-- =============================================
-- 4. LINK MOVIES TO CATEGORIES
-- =============================================

-- Link movies to categories for Movie Franchises Game
INSERT INTO public.template_movies (template_id, movie_id, category_id, display_order) VALUES
-- Marvel MCU
('movie-franchises', (SELECT id FROM public.movies WHERE tmdb_id = 1726), 'marvel-mcu', 1),   -- Iron Man
('movie-franchises', (SELECT id FROM public.movies WHERE tmdb_id = 24428), 'marvel-mcu', 2),  -- Avengers
('movie-franchises', (SELECT id FROM public.movies WHERE tmdb_id = 10195), 'marvel-mcu', 3),  -- Thor
('movie-franchises', (SELECT id FROM public.movies WHERE tmdb_id = 118340), 'marvel-mcu', 4), -- Guardians

-- Star Wars
('movie-franchises', (SELECT id FROM public.movies WHERE tmdb_id = 11), 'star-wars', 1),      -- A New Hope
('movie-franchises', (SELECT id FROM public.movies WHERE tmdb_id = 1891), 'star-wars', 2),    -- Empire Strikes Back
('movie-franchises', (SELECT id FROM public.movies WHERE tmdb_id = 1892), 'star-wars', 3),    -- Return of Jedi
('movie-franchises', (SELECT id FROM public.movies WHERE tmdb_id = 140607), 'star-wars', 4),  -- Force Awakens

-- DC Universe
('movie-franchises', (SELECT id FROM public.movies WHERE tmdb_id = 49026), 'dc-universe', 1),  -- Man of Steel
('movie-franchises', (SELECT id FROM public.movies WHERE tmdb_id = 209112), 'dc-universe', 2), -- Batman v Superman
('movie-franchises', (SELECT id FROM public.movies WHERE tmdb_id = 297761), 'dc-universe', 3), -- Wonder Woman
('movie-franchises', (SELECT id FROM public.movies WHERE tmdb_id = 297802), 'dc-universe', 4), -- Aquaman

-- Fast & Furious
('movie-franchises', (SELECT id FROM public.movies WHERE tmdb_id = 51497), 'fast-furious', 1),  -- Fast Five
('movie-franchises', (SELECT id FROM public.movies WHERE tmdb_id = 82992), 'fast-furious', 2),   -- Fast 6
('movie-franchises', (SELECT id FROM public.movies WHERE tmdb_id = 168259), 'fast-furious', 3),  -- Furious 7
('movie-franchises', (SELECT id FROM public.movies WHERE tmdb_id = 337339), 'fast-furious', 4)   -- Fate of Furious

ON CONFLICT (template_id, movie_id) DO NOTHING;

-- =============================================
-- 5. CREATE VIEW FOR EASY GAME LOADING
-- =============================================

-- View to easily load complete game data
CREATE OR REPLACE VIEW game_template_full AS
SELECT 
    t.id as template_id,
    t.name as template_name,
    t.description as template_description,
    t.max_mistakes,
    t.show_hints,
    t.shuffle_movies,
    t.game_difficulty,
    t.tags,
    
    -- Categories as JSON array
    (
        SELECT json_agg(
            json_build_object(
                'id', c.id,
                'name', c.name,
                'difficulty', c.difficulty,
                'hint', c.hint,
                'colors', json_build_object(
                    'bg', c.bg_color,
                    'border', c.border_color,
                    'text', c.text_color
                )
            ) ORDER BY c.display_order
        )
        FROM public.game_categories c 
        WHERE c.template_id = t.id
    ) as categories,
    
    -- Movies as JSON array
    (
        SELECT json_agg(
            json_build_object(
                'id', m.id::text,
                'title', m.title,
                'categoryId', tm.category_id,
                'poster', CASE 
                    WHEN m.poster_path IS NOT NULL THEN 'https://image.tmdb.org/t/p/w500' || m.poster_path
                    WHEN m.poster_url IS NOT NULL THEN m.poster_url
                    ELSE null
                END,
                'metadata', json_build_object(
                    'year', m.year,
                    'tmdb_id', m.tmdb_id,
                    'vote_average', m.vote_average
                )
            ) ORDER BY tm.display_order
        )
        FROM public.template_movies tm
        JOIN public.movies m ON tm.movie_id = m.id
        WHERE tm.template_id = t.id AND tm.is_active = true
    ) as movies

FROM public.category_game_templates t
WHERE t.is_active = true;

-- =============================================
-- 6. HELPER FUNCTION TO GET GAME BY ID
-- =============================================

CREATE OR REPLACE FUNCTION get_category_game_template(template_id TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT row_to_json(g) INTO result
    FROM game_template_full g
    WHERE g.template_id = $1;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 7. SAMPLE QUERIES (for testing)
-- =============================================

/*
-- Get all available game templates
SELECT * FROM game_template_full;

-- Get specific game template
SELECT get_category_game_template('movie-franchises');

-- Get user's game history
SELECT 
    s.*,
    t.name as template_name,
    t.game_difficulty
FROM category_game_sessions s
JOIN category_game_templates t ON s.template_id = t.id
WHERE s.user_id = 'some-uuid'
ORDER BY s.completed_at DESC;

-- Get leaderboard for a template
SELECT 
    s.final_score,
    s.time_elapsed_seconds,
    s.mistake_count,
    s.categories_found,
    u.username,
    u.display_name
FROM category_game_sessions s
JOIN users u ON s.user_id = u.id
WHERE s.template_id = 'movie-franchises' 
    AND s.is_won = true
ORDER BY s.final_score DESC, s.time_elapsed_seconds ASC
LIMIT 10;
*/

-- =============================================
-- END OF DATA POPULATION
-- =============================================