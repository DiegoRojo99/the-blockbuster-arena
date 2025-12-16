import { CategoryGameTemplate, GameCategory, GameMovie, DIFFICULTY_COLORS, GameConfig } from "@/types/categories-game";

/**
 * Categories Game Data
 * Collection of different category game templates
 */

const configDefaults: GameConfig = {
  maxMistakes: 4,
  showHints: true,
  shuffleMovies: true,
  gameDifficulty: "beginner"
};

// Game 1: Movie Franchises
const movieFranchisesGame: CategoryGameTemplate = {
  id: "movie-franchises",
  name: "Movie Franchises",
  description: "Group these movies by their franchise or series",
  tags: ["franchises", "series", "popular"],
  config: {
    maxMistakes: 4,
    showHints: true,
    shuffleMovies: true,
    gameDifficulty: "intermediate"
  },
  categories: [
    {
      id: "marvel-mcu",
      name: "Marvel Cinematic Universe",
      difficulty: "easy",
      colors: DIFFICULTY_COLORS.easy,
      hint: "Superhero movies from Disney's Marvel Studios"
    },
    {
      id: "star-wars",
      name: "Star Wars Saga",
      difficulty: "easy",
      colors: DIFFICULTY_COLORS.easy,
      hint: "A galaxy far, far away..."
    },
    {
      id: "dc-universe",
      name: "DC Extended Universe",
      difficulty: "medium",
      colors: DIFFICULTY_COLORS.medium,
      hint: "Warner Bros superhero movies"
    },
    {
      id: "fast-furious",
      name: "Fast & Furious Franchise",
      difficulty: "medium",
      colors: DIFFICULTY_COLORS.medium,
      hint: "Family, cars, and impossible stunts"
    }
  ],
  movies: [
    // Marvel MCU
    { id: "iron-man", title: "Iron Man", categoryId: "marvel-mcu", poster: "/iron-man-poster.jpg" },
    { id: "avengers", title: "The Avengers", categoryId: "marvel-mcu", poster: "/avengers-poster.jpg" },
    { id: "thor", title: "Thor", categoryId: "marvel-mcu", poster: "/thor-poster.jpg" },
    { id: "guardians", title: "Guardians of the Galaxy", categoryId: "marvel-mcu", poster: "/guardians-poster.jpg" },
    
    // Star Wars
    { id: "new-hope", title: "A New Hope", categoryId: "star-wars", poster: "/star-wars-new-hope.jpg" },
    { id: "empire-strikes", title: "The Empire Strikes Back", categoryId: "star-wars", poster: "/empire-strikes-back.jpg" },
    { id: "return-jedi", title: "Return of the Jedi", categoryId: "star-wars", poster: "/return-of-jedi.jpg" },
    { id: "force-awakens", title: "The Force Awakens", categoryId: "star-wars", poster: "/force-awakens.jpg" },
    
    // DC Universe
    { id: "man-steel", title: "Man of Steel", categoryId: "dc-universe", poster: "/man-of-steel.jpg" },
    { id: "batman-superman", title: "Batman v Superman", categoryId: "dc-universe", poster: "/batman-vs-superman.jpg" },
    { id: "wonder-woman", title: "Wonder Woman", categoryId: "dc-universe", poster: "/wonder-woman.jpg" },
    { id: "aquaman", title: "Aquaman", categoryId: "dc-universe", poster: "/aquaman.jpg" },
    
    // Fast & Furious
    { id: "fast-five", title: "Fast Five", categoryId: "fast-furious", poster: "/fast-five.jpg" },
    { id: "fast-six", title: "Fast & Furious 6", categoryId: "fast-furious", poster: "/fast-six.jpg" },
    { id: "furious-seven", title: "Furious 7", categoryId: "fast-furious", poster: "/furious-seven.jpg" },
    { id: "fate-furious", title: "The Fate of the Furious", categoryId: "fast-furious", poster: "/fate-of-furious.jpg" }
  ]
};

// Game 2: Directors' Masterpieces
const directorsGame: CategoryGameTemplate = {
  id: "famous-directors",
  name: "Famous Directors",
  description: "Match these movies to their acclaimed directors",
  tags: ["directors", "auteurs", "cinema"],
  config: {
    maxMistakes: 4,
    showHints: true,
    shuffleMovies: true,
    gameDifficulty: "advanced"
  },
  categories: [
    {
      id: "christopher-nolan",
      name: "Christopher Nolan",
      difficulty: "medium",
      colors: DIFFICULTY_COLORS.medium,
      hint: "Known for mind-bending narratives and practical effects"
    },
    {
      id: "quentin-tarantino",
      name: "Quentin Tarantino",
      difficulty: "medium",
      colors: DIFFICULTY_COLORS.medium,
      hint: "Dialogue-heavy films with non-linear storytelling"
    },
    {
      id: "martin-scorsese",
      name: "Martin Scorsese",
      difficulty: "hard",
      colors: DIFFICULTY_COLORS.hard,
      hint: "Crime dramas and character studies"
    },
    {
      id: "stanley-kubrick",
      name: "Stanley Kubrick",
      difficulty: "expert",
      colors: DIFFICULTY_COLORS.expert,
      hint: "Perfectionist filmmaker with distinctive visual style"
    }
  ],
  movies: [
    // Christopher Nolan
    { id: "inception-nolan", title: "Inception", categoryId: "christopher-nolan", poster: "/inception.jpg" },
    { id: "dark-knight", title: "The Dark Knight", categoryId: "christopher-nolan", poster: "/dark-knight.jpg" },
    { id: "interstellar", title: "Interstellar", categoryId: "christopher-nolan", poster: "/interstellar.jpg" },
    { id: "memento", title: "Memento", categoryId: "christopher-nolan", poster: "/memento.jpg" },
    
    // Quentin Tarantino
    { id: "pulp-fiction", title: "Pulp Fiction", categoryId: "quentin-tarantino", poster: "/pulp-fiction.jpg" },
    { id: "kill-bill", title: "Kill Bill", categoryId: "quentin-tarantino", poster: "/kill-bill.jpg" },
    { id: "django-unchained", title: "Django Unchained", categoryId: "quentin-tarantino", poster: "/django-unchained.jpg" },
    { id: "inglourious-basterds", title: "Inglourious Basterds", categoryId: "quentin-tarantino", poster: "/inglourious-basterds.jpg" },
    
    // Martin Scorsese
    { id: "goodfellas", title: "Goodfellas", categoryId: "martin-scorsese", poster: "/goodfellas.jpg" },
    { id: "taxi-driver", title: "Taxi Driver", categoryId: "martin-scorsese", poster: "/taxi-driver.jpg" },
    { id: "departed", title: "The Departed", categoryId: "martin-scorsese", poster: "/the-departed.jpg" },
    { id: "wolf-wall-street", title: "The Wolf of Wall Street", categoryId: "martin-scorsese", poster: "/wolf-wall-street.jpg" },
    
    // Stanley Kubrick
    { id: "shining", title: "The Shining", categoryId: "stanley-kubrick", poster: "/the-shining.jpg" },
    { id: "clockwork-orange", title: "A Clockwork Orange", categoryId: "stanley-kubrick", poster: "/clockwork-orange.jpg" },
    { id: "space-odyssey", title: "2001: A Space Odyssey", categoryId: "stanley-kubrick", poster: "/2001-space-odyssey.jpg" },
    { id: "full-metal-jacket", title: "Full Metal Jacket", categoryId: "stanley-kubrick", poster: "/full-metal-jacket.jpg" }
  ]
};

// Game 3: Movie Decades
const movieDecadesGame: CategoryGameTemplate = {
  id: "movie-decades",
  name: "Movie Decades",
  description: "Group these classic films by the decade they were released",
  tags: ["decades", "classics", "history"],
  config: {
    maxMistakes: 4,
    showHints: true,
    shuffleMovies: true,
    gameDifficulty: "expert"
  },
  categories: [
    {
      id: "seventies",
      name: "1970s Cinema",
      difficulty: "hard",
      colors: DIFFICULTY_COLORS.hard,
      hint: "The decade of New Hollywood"
    },
    {
      id: "eighties",
      name: "1980s Blockbusters",
      difficulty: "medium",
      colors: DIFFICULTY_COLORS.medium,
      hint: "The era of high-concept blockbusters"
    },
    {
      id: "nineties",
      name: "1990s Classics",
      difficulty: "easy",
      colors: DIFFICULTY_COLORS.easy,
      hint: "Independent cinema renaissance"
    },
    {
      id: "two-thousands",
      name: "2000s Digital Revolution",
      difficulty: "medium",
      colors: DIFFICULTY_COLORS.medium,
      hint: "CGI becomes mainstream"
    }
  ],
  movies: [
    // 1970s
    { id: "godfather-70s", title: "The Godfather", categoryId: "seventies", poster: "/godfather.jpg" },
    { id: "jaws-70s", title: "Jaws", categoryId: "seventies", poster: "/jaws.jpg" },
    { id: "apocalypse-now", title: "Apocalypse Now", categoryId: "seventies", poster: "/apocalypse-now.jpg" },
    { id: "rocky-70s", title: "Rocky", categoryId: "seventies", poster: "/rocky.jpg" },
    
    // 1980s
    { id: "blade-runner-80s", title: "Blade Runner", categoryId: "eighties", poster: "/blade-runner.jpg" },
    { id: "back-future", title: "Back to the Future", categoryId: "eighties", poster: "/back-to-future.jpg" },
    { id: "raiders-ark", title: "Raiders of the Lost Ark", categoryId: "eighties", poster: "/raiders-lost-ark.jpg" },
    { id: "terminator-80s", title: "The Terminator", categoryId: "eighties", poster: "/terminator.jpg" },
    
    // 1990s
    { id: "forrest-gump", title: "Forrest Gump", categoryId: "nineties", poster: "/forrest-gump.jpg" },
    { id: "silence-lambs", title: "The Silence of the Lambs", categoryId: "nineties", poster: "/silence-of-lambs.jpg" },
    { id: "jurassic-park", title: "Jurassic Park", categoryId: "nineties", poster: "/jurassic-park.jpg" },
    { id: "matrix-90s", title: "The Matrix", categoryId: "nineties", poster: "/matrix.jpg" },
    
    // 2000s
    { id: "gladiator-2000s", title: "Gladiator", categoryId: "two-thousands", poster: "/gladiator.jpg" },
    { id: "lord-rings", title: "The Lord of the Rings", categoryId: "two-thousands", poster: "/lord-of-rings.jpg" },
    { id: "pirates-caribbean", title: "Pirates of the Caribbean", categoryId: "two-thousands", poster: "/pirates-caribbean.jpg" },
    { id: "avatar-2000s", title: "Avatar", categoryId: "two-thousands", poster: "/avatar.jpg" }
  ]
};

// Sample games
const sampleGame1 : CategoryGameTemplate = {
  id: "sample-game-1",
  name: "Sample Game 1",
  description: "A sample game for testing purposes",
  tags: ["sample", "testing"],
  config: configDefaults,
  categories: [
    // Pixar Films
    {id: "pixar-films", name: "Pixar Films", difficulty: "easy", colors: DIFFICULTY_COLORS.easy, hint: "Animated films by Pixar Animation Studios"},
    // Movies Set in New York City
    {id: "nyc-movies", name: "Movies Set in New York City", difficulty: "medium", colors: DIFFICULTY_COLORS.medium, hint: "Films primarily set in NYC"},
    // Musicals
    {id: "musicals", name: "Musicals", difficulty: "hard", colors: DIFFICULTY_COLORS.hard, hint: "Films with significant musical numbers"},
    // Films Starring Tom Hanks
    {id: "tom-hanks-films", name: "Films Starring Tom Hanks", difficulty: "medium", colors: DIFFICULTY_COLORS.medium, hint: "Movies featuring Tom Hanks"}
  ],
  movies: [
    // Pixar Films
    { id: "toy-story", title: "Toy Story", categoryId: "pixar-films", poster: "/toy-story.jpg" },
    { id: "finding-nemo", title: "Finding Nemo", categoryId: "pixar-films", poster: "/finding-nemo.jpg" },
    { id: "inside-out", title: "Inside Out", categoryId: "pixar-films", poster: "/inside-out.jpg" },
    { id: "coco", title: "Coco", categoryId: "pixar-films", poster: "/coco.jpg" },
    // Movies Set in New York City
    { id: "ghostbusters", title: "Ghostbusters", categoryId: "nyc-movies", poster: "/ghostbusters.jpg" },
    { id: "home-alone-2", title: "Home Alone 2: Lost in New York", categoryId: "nyc-movies", poster: "/home-alone-2.jpg" },
    { id: "avengers", title: "The Avengers", categoryId: "nyc-movies", poster: "/avengers.jpg" },
    { id: "taxi-driver", title: "Taxi Driver", categoryId: "nyc-movies", poster: "/taxi-driver.jpg" },
    // Musicals
    { id: "sound-of-music", title: "The Sound of Music", categoryId: "musicals", poster: "/sound-of-music.jpg" },
    { id: "la-la-land", title: "La La Land", categoryId: "musicals", poster: "/la-la-land.jpg" },
    { id: "chicago", title: "Chicago", categoryId: "musicals", poster: "/chicago.jpg" },
    { id: "mamma-mia", title: "Mamma Mia!", categoryId: "musicals", poster: "/mamma-mia.jpg" },
    // Films Starring Tom Hanks
    { id: "forrest-gump", title: "Forrest Gump", categoryId: "tom-hanks-films", poster: "/forrest-gump.jpg" },
    { id: "cast-away", title: "Cast Away", categoryId: "tom-hanks-films", poster: "/cast-away.jpg" },
    { id: "big", title: "Big", categoryId: "tom-hanks-films", poster: "/big.jpg" },
    { id: "captain-phillips", title: "Captain Phillips", categoryId: "tom-hanks-films", poster: "/captain-phillips.jpg" }
  ]
};

// 🎬 Game 2

// Categories:

// Films Directed by Christopher Nolan
// Disney Princess Films
// Oscar Best Picture Winners (2000s)
// Sports Films

// Movies:

// Inception (2010) → Nolan
// The Dark Knight (2008) → Nolan
// Dunkirk (2017) → Nolan
// Oppenheimer (2023) → Nolan

// Snow White and the Seven Dwarfs (1937) → Disney Princess
// Cinderella (1950) → Disney Princess
// The Little Mermaid (1989) → Disney Princess
// Frozen (2013) → Disney Princess

// Gladiator (2000) → Best Picture
// The Departed (2006) → Best Picture
// No Country for Old Men (2007) → Best Picture
// Slumdog Millionaire (2008) → Best Picture

// Rocky (1976) → Sports
// Raging Bull (1980) → Sports
// Remember the Titans (2000) → Sports
// Moneyball (2011) → Sports

// 🎬 Game 3

// Categories:

// Films Featuring Robots/AI

// Romantic Comedies

// Films Set in Space

// Horror Classics

// Movies:

// The Terminator (1984) → Robots/AI

// Ex Machina (2014) → Robots/AI

// WALL-E (2008) → Robots/AI

// I, Robot (2004) → Robots/AI

// Pretty Woman (1990) → Romantic Comedy

// Notting Hill (1999) → Romantic Comedy

// Crazy Rich Asians (2018) → Romantic Comedy

// 10 Things I Hate About You (1999) → Romantic Comedy

// Interstellar (2014) → Space

// 2001: A Space Odyssey (1968) → Space

// Gravity (2013) → Space

// Apollo 13 (1995) → Space

// Psycho (1960) → Horror Classic

// The Exorcist (1973) → Horror Classic

// Halloween (1978) → Horror Classic

// A Nightmare on Elm Street (1984) → Horror Classic

// 🎬 Game 4

// Categories:

// Movies Based on Shakespeare Plays

// Movies With Talking Animals

// Superhero Team Films

// Films with Major Plot Twists

// Movies:

// Romeo + Juliet (1996) → Shakespeare

// Macbeth (2015) → Shakespeare

// The Lion King (1994) → Shakespeare (Hamlet)

// 10 Things I Hate About You (1999) → Shakespeare (The Taming of the Shrew)

// Babe (1995) → Talking Animals

// Zootopia (2016) → Talking Animals

// The Jungle Book (2016) → Talking Animals

// Charlotte’s Web (2006) → Talking Animals

// The Avengers (2012) → Superhero Team

// Justice League (2017) → Superhero Team

// Guardians of the Galaxy (2014) → Superhero Team

// X-Men (2000) → Superhero Team

// The Sixth Sense (1999) → Plot Twist

// Fight Club (1999) → Plot Twist

// The Usual Suspects (1995) → Plot Twist

// Gone Girl (2014) → Plot Twist

// 🎬 Game 5

// Categories:

// Films Set in High School
// Oscar-Winning Animated Films
// Spy Films
// Movies Featuring Time Travel

// Movies:

// Mean Girls (2004) → High School
// The Breakfast Club (1985) → High School
// Ferris Bueller’s Day Off (1986) → High School
// Clueless (1995) → High School

// Shrek (2001) → Animated Oscar
// Finding Nemo (2003) → Animated Oscar
// Spirited Away (2001) → Animated Oscar
// Frozen (2013) → Animated Oscar

// Skyfall (2012) → Spy
// Mission: Impossible – Fallout (2018) → Spy
// Tinker Tailor Soldier Spy (2011) → Spy
// The Bourne Identity (2002) → Spy

// Back to the Future (1985) → Time Travel
// Looper (2012) → Time Travel
// The Time Traveler’s Wife (2009) → Time Travel
// Tenet (2020) → Time Travel

const sampleGame5: CategoryGameTemplate = {
  id: "sample-game-5",
  name: "Sample Game 5",
  description: "Another sample game for testing purposes",
  tags: ["sample", "testing"],
  config: configDefaults,
  categories: [
    // Films Set in High School
    {id: "high-school-films", name: "Films Set in High School", difficulty: "medium", colors: DIFFICULTY_COLORS.medium, hint: "Movies primarily set in high school"},
    // Oscar-Winning Animated Films
    {id: "oscar-animated", name: "Oscar-Winning Animated Films", difficulty: "easy", colors: DIFFICULTY_COLORS.easy, hint: "Animated films that won the Best Animated Feature Oscar"},
    // Spy Films
    {id: "spy-films", name: "Spy Films", difficulty: "hard", colors: DIFFICULTY_COLORS.hard, hint: "Movies centered around espionage and spies"},
    // Movies Featuring Time Travel
    {id: "time-travel-films", name: "Movies Featuring Time Travel", difficulty: "medium", colors: DIFFICULTY_COLORS.medium, hint: "Films that involve time travel as a key plot element"}
  ],
  movies: [
    // Films Set in High School
    { id: "mean-girls", title: "Mean Girls", categoryId: "high-school-films" },
    { id: "breakfast-club", title: "The Breakfast Club", categoryId: "high-school-films" },
    { id: "ferris-bueller", title: "Ferris Bueller’s Day Off", categoryId: "high-school-films" },
    { id: "clueless", title: "Clueless", categoryId: "high-school-films" },
    // Oscar-Winning Animated Films
    { id: "shrek", title: "Shrek", categoryId: "oscar-animated" },
    { id: "finding-nemo", title: "Finding Nemo", categoryId: "oscar-animated" },
    { id: "spirited-away", title: "Spirited Away", categoryId: "oscar-animated" },
    { id: "frozen", title: "Frozen", categoryId: "oscar-animated" },
    // Spy Films
    { id: "skyfall", title: "Skyfall", categoryId: "spy-films" },
    { id: "mission-impossible", title: "Mission: Impossible – Fallout", categoryId: "spy-films" },
    { id: "tinker-tailor", title: "Tinker Tailor Soldier Spy", categoryId: "spy-films" },
    { id: "bourne-identity", title: "The Bourne Identity", categoryId: "spy-films" },
    // Movies Featuring Time Travel
    { id: "back-to-future", title: "Back to the Future", categoryId: "time-travel-films" },
    { id: "looper", title: "Looper", categoryId: "time-travel-films" },
    { id: "time-travelers-wife", title: "The Time Traveler’s Wife", categoryId: "time-travel-films" },
    { id: "tenet", title: "Tenet", categoryId: "time-travel-films" }
  ]
};

const modernSciFiGame: CategoryGameTemplate = {
  id: "modern-sci-fi",
  name: "Modern Sci-Fi Themes",
  description: "Match recent sci-fi movies by their core theme",
  tags: ["sci-fi", "modern", "themes"],
  config: {
    ...configDefaults,
    gameDifficulty: "advanced"
  },
  categories: [
    { id: "ai-androids", name: "AI & Androids", difficulty: "medium", colors: DIFFICULTY_COLORS.medium, hint: "Synthetic minds at the center" },
    { id: "space-survival", name: "Space Survival", difficulty: "hard", colors: DIFFICULTY_COLORS.hard, hint: "Staying alive beyond Earth" },
    { id: "time-loops", name: "Time Loops", difficulty: "medium", colors: DIFFICULTY_COLORS.medium, hint: "Reliving days and timelines" },
    { id: "first-contact", name: "First Contact", difficulty: "hard", colors: DIFFICULTY_COLORS.hard, hint: "Meeting extraterrestrial life" }
  ],
  movies: [
    { id: "ex-machina-ai", title: "Ex Machina", categoryId: "ai-androids" },
    { id: "blade-runner-2049", title: "Blade Runner 2049", categoryId: "ai-androids" },
    { id: "after-yang", title: "After Yang", categoryId: "ai-androids" },
    { id: "i-robot-modern", title: "I, Robot", categoryId: "ai-androids" },

    { id: "the-martian", title: "The Martian", categoryId: "space-survival" },
    { id: "gravity-space", title: "Gravity", categoryId: "space-survival" },
    { id: "life-2017", title: "Life", categoryId: "space-survival" },
    { id: "moon-2009", title: "Moon", categoryId: "space-survival" },

    { id: "edge-of-tomorrow", title: "Edge of Tomorrow", categoryId: "time-loops" },
    { id: "palm-springs", title: "Palm Springs", categoryId: "time-loops" },
    { id: "source-code", title: "Source Code", categoryId: "time-loops" },
    { id: "predestination", title: "Predestination", categoryId: "time-loops" },

    { id: "arrival-first-contact", title: "Arrival", categoryId: "first-contact" },
    { id: "contact-1997", title: "Contact", categoryId: "first-contact" },
    { id: "annihilation", title: "Annihilation", categoryId: "first-contact" },
    { id: "close-encounters", title: "Close Encounters of the Third Kind", categoryId: "first-contact" }
  ]
};

const feelGoodGame: CategoryGameTemplate = {
  id: "feel-good-night",
  name: "Feel-Good Movie Night",
  description: "Group uplifting favorites by their vibe",
  tags: ["feel-good", "comedy", "music"],
  config: configDefaults,
  categories: [
    { id: "sports-comeback", name: "Sports Comebacks", difficulty: "medium", colors: DIFFICULTY_COLORS.medium, hint: "Underdogs fighting back" },
    { id: "road-trip-comedy", name: "Road Trip Comedies", difficulty: "easy", colors: DIFFICULTY_COLORS.easy, hint: "Chaos on the highway" },
    { id: "high-school-misfits", name: "High School Misfits", difficulty: "medium", colors: DIFFICULTY_COLORS.medium, hint: "Finding your crew" },
    { id: "music-party", name: "Musical Party", difficulty: "hard", colors: DIFFICULTY_COLORS.hard, hint: "Sing-alongs and stage lights" }
  ],
  movies: [
    { id: "rocky-comeback", title: "Rocky", categoryId: "sports-comeback" },
    { id: "remember-the-titans", title: "Remember the Titans", categoryId: "sports-comeback" },
    { id: "coach-carter", title: "Coach Carter", categoryId: "sports-comeback" },
    { id: "miracle", title: "Miracle", categoryId: "sports-comeback" },

    { id: "little-miss-sunshine", title: "Little Miss Sunshine", categoryId: "road-trip-comedy" },
    { id: "planes-trains", title: "Planes, Trains and Automobiles", categoryId: "road-trip-comedy" },
    { id: "dumb-and-dumber", title: "Dumb and Dumber", categoryId: "road-trip-comedy" },
    { id: "we-re-the-millers", title: "We're the Millers", categoryId: "road-trip-comedy" },

    { id: "napoleon-dynamite", title: "Napoleon Dynamite", categoryId: "high-school-misfits" },
    { id: "superbad", title: "Superbad", categoryId: "high-school-misfits" },
    { id: "easy-a", title: "Easy A", categoryId: "high-school-misfits" },
    { id: "10-things", title: "10 Things I Hate About You", categoryId: "high-school-misfits" },

    { id: "school-of-rock", title: "School of Rock", categoryId: "music-party" },
    { id: "pitch-perfect", title: "Pitch Perfect", categoryId: "music-party" },
    { id: "hairspray", title: "Hairspray", categoryId: "music-party" },
    { id: "mamma-mia-feelgood", title: "Mamma Mia!", categoryId: "music-party" }
  ]
};

const sampleCategoryGames: CategoryGameTemplate[] = [
  sampleGame1, sampleGame5, modernSciFiGame, feelGoodGame
];

// Export all games as a collection
const categoryGames: CategoryGameTemplate[] = [
  movieFranchisesGame,
  directorsGame,
  movieDecadesGame,
  ...sampleCategoryGames
];

export { movieFranchisesGame, directorsGame, movieDecadesGame };
export default categoryGames;
