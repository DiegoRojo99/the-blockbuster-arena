# Categories Game Setup & Usage

## 🎯 Overview

The Categories Game is a movie trivia game where players must group 16 movies into 4 categories of 4 movies each. It's like a movie-themed version of the popular connections puzzle game.

## 🚀 Quick Start

### Database Setup

The categories game requires additional database tables. Run these SQL scripts in your Supabase SQL Editor:

1. **Categories Game Schema**: `sql/02_categories_game_schema.sql`
2. **Sample Data** (optional): `sql/03_categories_game_data.sql`

### Environment Variables

Ensure your `.env.local` file has:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TMDB_API_KEY=your_tmdb_api_key
```

## 🎮 How to Play

1. **Navigate to the game**: Visit `/category-game` or click "Categories Game" from the home page
2. **Game loads automatically**: A random game template loads with 16 movies in a 4×4 grid
3. **Select 4 movies**: Click on movies you think belong to the same category
4. **Submit your guess**: Click "Submit Group" when you have exactly 4 movies selected
5. **Get feedback**: 
   - ✅ **Correct**: The category is revealed and those movies are removed
   - ❌ **Incorrect**: You lose one attempt (default: 4 attempts total)
6. **Win condition**: Find all 4 categories before running out of attempts

## 🛠 Features

### Game Mechanics
- **4×4 grid** with movie posters and titles
- **Visual selection feedback** with gold highlighting
- **Mistake counter** with configurable max attempts
- **Category reveal** when correctly guessed
- **Shuffle function** to rearrange movies
- **Auto-restart** with new random games

### Visual Design
- **Movie posters** from TMDB API
- **Color-coded categories** by difficulty level
- **Smooth animations** and transitions
- **Responsive design** for mobile and desktop
- **Cinematic theme** with gold/purple gradients

### Admin Tools
- **Game creation interface** at `/admin/category-games`
- **TMDB movie search** integration
- **Category management** with difficulty levels
- **Database persistence** for game templates

## 📊 Game Structure

Each game consists of:
- **4 categories** (e.g., "Marvel Movies", "Tom Hanks Films")
- **4 movies per category** (16 total movies)
- **Difficulty levels**: Easy, Medium, Hard, Expert
- **Configuration options**: Max mistakes, hints, shuffling

## 🎨 Example Categories

**Movie Franchises**:
- Marvel Movies: Iron Man, Thor, Avengers, Spider-Man
- Star Wars: A New Hope, Empire Strikes Back, Return of the Jedi, Force Awakens

**Famous Directors**:
- Quentin Tarantino: Pulp Fiction, Kill Bill, Django Unchained, Once Upon a Time
- Christopher Nolan: Inception, Dark Knight, Interstellar, Dunkirk

## 🔧 Technical Architecture

### Frontend (`CategoriesGamePage.tsx`)
- React component with game state management
- Integration with TMDB API for movie data
- Responsive grid layout with Tailwind CSS
- Toast notifications for user feedback

### Backend Services (`categoryGamesService.ts`)
- Database CRUD operations for game templates
- Integration with Supabase for persistence
- Error handling and data validation

### Database Schema
- **movies**: TMDB movie data with posters
- **category_game_templates**: Game configurations
- **game_categories**: Category definitions with colors
- **template_movies**: Junction table for movie-category relationships

## 🎯 Future Enhancements

- **User statistics** and leaderboards
- **Daily challenges** with fresh games
- **Multiplayer mode** with real-time competition
- **Hint system** for difficult categories
- **Custom game creation** by users
- **Social sharing** of completed games

## 🐛 Troubleshooting

**No games loading?**
- Check database connection and ensure SQL scripts are applied
- Verify environment variables are correct
- Check browser console for API errors

**Movies not displaying?**
- Verify TMDB API key is valid and has sufficient quota
- Check network connection and CORS settings
- Ensure movie poster URLs are accessible

**Admin interface not working?**
- Confirm user has admin permissions (if implemented)
- Check Supabase table permissions
- Verify all database tables exist and have correct structure

## 📝 Development Notes

The game automatically falls back to static sample data if database games aren't available, ensuring it works even without full database setup. The admin interface allows creating new games with TMDB integration for rich movie metadata.