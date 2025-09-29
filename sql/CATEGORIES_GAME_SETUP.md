# Categories Game Setup Instructions

## Database Setup

The categories game requires additional database tables that need to be created in your Supabase instance.

### 1. Apply Database Schema

Run the following SQL scripts in your Supabase SQL Editor in order:

1. **Main Schema** (if not already applied):
   - Run: `sql/01_main_schema.sql`

2. **Categories Game Schema**:
   - Run: `sql/02_categories_game_schema.sql`

3. **Sample Data** (optional):
   - Run: `sql/03_categories_game_data.sql`

### 2. Verify Tables Created

After running the scripts, verify these tables exist in your Supabase database:

- `movies` - Stores movie data from TMDB
- `category_game_templates` - Game template configurations
- `game_categories` - Categories within each template  
- `template_movies` - Junction table linking movies to categories
- `category_game_sessions` - User game sessions
- `session_statistics` - Game performance statistics

### 3. Environment Variables

Ensure your `.env.local` file has:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TMDB_API_KEY=your_tmdb_api_key
```

### 4. Admin Interface

Once the database is set up, you can:

1. Navigate to `/admin/category-games`
2. Create new game templates with 4 categories
3. Search and add movies to each category using TMDB integration
4. Save templates to the database

### 5. Playing Games

Game templates can be loaded and played through the categories game interface.

## Features Available

- ✅ Admin interface for creating category games
- ✅ TMDB movie search integration
- ✅ Database persistence for game templates
- ✅ Color-coded difficulty levels
- ✅ Form validation and error handling
- 🚧 Game playing interface (requires additional development)
- 🚧 Game statistics and leaderboards
- 🚧 Template management (edit/delete existing games)

## Troubleshooting

If you encounter TypeScript errors related to database types:

1. The service uses a raw Supabase client to avoid type conflicts
2. Database types are defined but may need updates as schema evolves
3. Check that all SQL scripts ran successfully
4. Verify Supabase environment variables are correct

## Next Steps

1. Apply database schema files to your Supabase instance
2. Test creating a game template via the admin interface
3. Verify data is saved correctly in the database
4. Build out the game playing interface