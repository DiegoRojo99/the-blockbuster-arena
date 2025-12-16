import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, X, Save, Eye, Trash2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { 
  CategoryGameTemplate, 
  GameCategory, 
  GameMovie, 
  DIFFICULTY_COLORS, 
  CategoryDifficulty,
  GameConfig 
} from "@/types/categories-game";
import { TMDBMovie } from "@/types/tmdb";
import { searchMovies } from "@/services/tmdb";
import { saveCategoryGameTemplate, getCategoryGameTemplates, deleteCategoryGameTemplate } from "@/services/categoryGamesService";
import { useAuth } from "@/contexts/AuthContext";

interface MovieSearchResult extends TMDBMovie {
  selected?: boolean;
}

interface CategoryForm {
  id: string;
  name: string;
  difficulty: CategoryDifficulty;
  hint: string;
  movies: GameMovie[];
}

interface GameTemplateForm {
  id: string;
  name: string;
  description: string;
  tags: string[];
  config: GameConfig;
  categories: CategoryForm[];
}

const AdminCategoryGamesPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [templates, setTemplates] = useState<CategoryGameTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [gameForm, setGameForm] = useState<GameTemplateForm>({
    id: '',
    name: '',
    description: '',
    tags: [],
    config: {
      maxMistakes: 4,
      showHints: true,
      shuffleMovies: true,
      gameDifficulty: 'intermediate'
    },
    categories: [
      { id: '', name: '', difficulty: 'easy', hint: '', movies: [] },
      { id: '', name: '', difficulty: 'medium', hint: '', movies: [] },
      { id: '', name: '', difficulty: 'hard', hint: '', movies: [] },
      { id: '', name: '', difficulty: 'expert', hint: '', movies: [] }
    ]
  });

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [movieSearchQuery, setMovieSearchQuery] = useState('');
  const [movieSearchResults, setMovieSearchResults] = useState<MovieSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const currentCategory = gameForm.categories[currentCategoryIndex] || null;

  // Auto-generate ID from name
  useEffect(() => {
    if (gameForm.name) {
      const id = gameForm.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
      setGameForm(prev => ({ ...prev, id }));
    }
  }, [gameForm.name]);

  // Auto-generate category IDs from names
  useEffect(() => {
    setGameForm(prev => ({
      ...prev,
      categories: prev.categories.map(cat => ({
        ...cat,
        id: cat.name
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
      }))
    }));
  }, [gameForm.categories.map(c => c.name).join(',')]);

  // Load templates when manage tab is opened
  useEffect(() => {
    if (activeTab === 'manage') {
      loadTemplates();
    }
  }, [activeTab]);

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const data = await getCategoryGameTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Failed to load templates",
        description: "Could not fetch templates from the database.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`Delete "${templateName}"? This cannot be undone.`)) return;
    setDeletingId(templateId);
    try {
      const result = await deleteCategoryGameTemplate(templateId);
      if (!result.success) throw new Error(result.error || 'Delete failed');
      toast({ title: "Template deleted", description: templateName });
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast({
        title: "Delete failed",
        description: error.message || 'Could not delete template.',
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleMovieSearch = async () => {
    if (!movieSearchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await searchMovies(movieSearchQuery, 'en', 1);
      setMovieSearchResults(response.results.slice(0, 20)); // Limit to 20 results
    } catch (error) {
      console.error('Movie search failed:', error);
      toast({
        title: "Search Failed",
        description: "Could not search for movies. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addMovieToCategory = (movie: TMDBMovie) => {
    const currentCategory = gameForm.categories[currentCategoryIndex];
    
    if (currentCategory.movies.length >= 4) {
      toast({
        title: "Category Full",
        description: "Each category can only have 4 movies.",
        variant: "destructive"
      });
      return;
    }

    // Check if movie already exists in this category
    if (currentCategory.movies.some(m => m.id === movie.id.toString())) {
      toast({
        title: "Movie Already Added",
        description: "This movie is already in this category.",
        variant: "destructive"
      });
      return;
    }

    const gameMovie: GameMovie = {
      id: movie.id.toString(),
      title: movie.title,
      categoryId: currentCategory.id,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
      metadata: {
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : undefined,
        genre: movie.genre_ids?.[0]?.toString()
      }
    };

    setGameForm(prev => ({
      ...prev,
      categories: prev.categories.map((cat, index) => 
        index === currentCategoryIndex 
          ? { ...cat, movies: [...cat.movies, gameMovie] }
          : cat
      )
    }));

    toast({
      title: "Movie Added",
      description: `"${movie.title}" added to ${currentCategory.name}`,
    });
  };

  const removeMovieFromCategory = (categoryIndex: number, movieId: string) => {
    setGameForm(prev => ({
      ...prev,
      categories: prev.categories.map((cat, index) => 
        index === categoryIndex 
          ? { ...cat, movies: cat.movies.filter(m => m.id !== movieId) }
          : cat
      )
    }));
  };

  const updateCategoryField = (index: number, field: keyof CategoryForm, value: any) => {
    setGameForm(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) => 
        i === index ? { ...cat, [field]: value } : cat
      )
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !gameForm.tags.includes(newTag.trim())) {
      setGameForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setGameForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const validateGameTemplate = (): string[] => {
    const errors: string[] = [];
    
    if (!gameForm.name.trim()) errors.push("Game name is required");
    if (!gameForm.description.trim()) errors.push("Game description is required");
    if (gameForm.categories.some(cat => !cat.name.trim())) errors.push("All category names are required");
    if (gameForm.categories.some(cat => cat.movies.length !== 4)) errors.push("Each category must have exactly 4 movies");
    
    // Check for duplicate category names
    const categoryNames = gameForm.categories.map(c => c.name.toLowerCase());
    if (new Set(categoryNames).size !== categoryNames.length) {
      errors.push("Category names must be unique");
    }
    
    return errors;
  };

  const saveGameTemplate = async () => {
    const errors = validateGameTemplate();
    
    if (errors.length > 0) {
      toast({
        title: "Validation Failed",
        description: errors.join(", "),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Convert form to CategoryGameTemplate
      const template: CategoryGameTemplate = {
        id: gameForm.id || `game-${Date.now()}`,
        name: gameForm.name,
        description: gameForm.description,
        tags: gameForm.tags,
        config: gameForm.config,
        categories: gameForm.categories.map(cat => ({
          id: cat.id || `cat-${Date.now()}-${Math.random()}`,
          name: cat.name,
          difficulty: cat.difficulty,
          colors: DIFFICULTY_COLORS[cat.difficulty],
          hint: cat.hint
        })),
        movies: gameForm.categories.flatMap(cat => cat.movies)
      };

      // Save to database
      const result = await saveCategoryGameTemplate(template, user?.id);
      
      if (result.success) {
        toast({
          title: "Game Template Saved!",
          description: `"${template.name}" has been created successfully.`,
        });
        
        // Reset form
        setGameForm({
          id: '',
          name: '',
          description: '',
          tags: [],
          config: {
            maxMistakes: 4,
            showHints: true,
            shuffleMovies: true,
            gameDifficulty: 'intermediate'
          },
          categories: [
            { id: '', name: '', difficulty: 'easy', hint: '', movies: [] },
            { id: '', name: '', difficulty: 'medium', hint: '', movies: [] },
            { id: '', name: '', difficulty: 'hard', hint: '', movies: [] },
            { id: '', name: '', difficulty: 'expert', hint: '', movies: [] }
          ]
        });
      } else {
        throw new Error(result.error || 'Failed to save game template');
      }
    } catch (error: any) {
      console.error('Error saving game template:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to save game template. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const previewGameTemplate = () => {
    const errors = validateGameTemplate();
    
    if (errors.length > 0) {
      toast({
        title: "Cannot Preview",
        description: "Please complete the template first.",
        variant: "destructive"
      });
      return;
    }

    // Here you would open a preview modal or navigate to preview page
    toast({
      title: "Preview Ready",
      description: "Game template preview would open here.",
    });
  };

  // Check if user is authenticated
  if (!user) {
    return (
      <Layout className="min-h-screen bg-background flex items-center justify-center">
        <Card className="gradient-card shadow-elevated max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You need to be signed in to access the admin interface.
            </p>
            <Button asChild className="gradient-gold text-cinema-dark">
              <Link to="/auth">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
            🔧 Category Games Admin
          </h1>
          <p className="text-muted-foreground">
            Create and manage category game templates
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'create' | 'manage')}>
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="create">Create New Game</TabsTrigger>
            <TabsTrigger value="manage">Manage Games</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            {/* Game Basic Info */}
            <Card className="gradient-card shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Game Template Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="game-name">Game Name</Label>
                    <Input
                      id="game-name"
                      value={gameForm.name}
                      onChange={(e) => setGameForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Movie Franchises"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="game-id">Game ID (auto-generated)</Label>
                    <Input
                      id="game-id"
                      value={gameForm.id}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={gameForm.description}
                    onChange={(e) => setGameForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the game theme..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select 
                      value={gameForm.config.gameDifficulty} 
                      onValueChange={(value) => setGameForm(prev => ({ 
                        ...prev, 
                        config: { ...prev.config, gameDifficulty: value as any }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Max Mistakes</Label>
                    <Select 
                      value={gameForm.config.maxMistakes.toString()} 
                      onValueChange={(value) => setGameForm(prev => ({ 
                        ...prev, 
                        config: { ...prev.config, maxMistakes: parseInt(value) }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Show Hints</Label>
                    <Select 
                      value={gameForm.config.showHints.toString()} 
                      onValueChange={(value) => setGameForm(prev => ({ 
                        ...prev, 
                        config: { ...prev.config, showHints: value === 'true' }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {gameForm.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories Setup */}
            <Card className="gradient-card shadow-elevated">
              <CardHeader>
                <CardTitle>Categories & Movies</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {gameForm.categories.map((category, index) => (
                    <Button
                      key={index}
                      variant={currentCategoryIndex === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentCategoryIndex(index)}
                      className="relative"
                    >
                      {category.name || `Category ${index + 1}`}
                      <Badge 
                        variant="secondary" 
                        className="ml-2 text-xs"
                      >
                        {category.movies.length}/4
                      </Badge>
                      {category.movies.length === 4 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                      )}
                    </Button>
                  ))}
                  {gameForm.categories.length === 0 && (
                    <Badge variant="destructive">No categories</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Category Form */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold">
                    Category {currentCategoryIndex + 1} Details
                  </h3>
                  {currentCategory ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category Name</Label>
                          <Input
                            value={currentCategory.name}
                            onChange={(e) => updateCategoryField(currentCategoryIndex, 'name', e.target.value)}
                            placeholder="e.g., Marvel Cinematic Universe"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Difficulty</Label>
                          <Select 
                            value={currentCategory.difficulty}
                            onValueChange={(value) => updateCategoryField(currentCategoryIndex, 'difficulty', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy 🟢</SelectItem>
                              <SelectItem value="medium">Medium 🟡</SelectItem>
                              <SelectItem value="hard">Hard 🟠</SelectItem>
                              <SelectItem value="expert">Expert 🔴</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Hint (optional)</Label>
                        <Input
                          value={currentCategory.hint}
                          onChange={(e) => updateCategoryField(currentCategoryIndex, 'hint', e.target.value)}
                          placeholder="e.g., Superhero movies from Disney's Marvel Studios"
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No category selected.</p>
                  )}
                </div>

                {/* Current Category Movies */}
                <div className="space-y-4">
                  <h4 className="font-medium">
                    Movies in {currentCategory?.name || `Category ${currentCategoryIndex + 1}`} 
                    ({currentCategory?.movies.length || 0}/4)
                  </h4>
                  
                  {currentCategory && currentCategory.movies.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {currentCategory.movies.map((movie, movieIndex) => (
                        <div key={movie.id} className="relative group">
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-3">
                              <div className="aspect-[3/4] bg-muted rounded mb-2 flex items-center justify-center text-xs text-center overflow-hidden">
                                {movie.poster ? (
                                  <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="p-2">{movie.title}</div>
                                )}
                              </div>
                              <p className="text-xs font-medium line-clamp-2">{movie.title}</p>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                                onClick={() => removeMovieFromCategory(currentCategoryIndex, movie.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Movie Search */}
                  {currentCategory && currentCategory.movies.length < 4 && (
                  <div className="space-y-4 p-4 border-2 border-dashed rounded-lg">
                    <h4 className="font-medium">Add Movies</h4>
                    
                    <div className="flex gap-2">
                      <Input
                        value={movieSearchQuery}
                        onChange={(e) => setMovieSearchQuery(e.target.value)}
                        placeholder="Search for movies..."
                        onKeyPress={(e) => e.key === 'Enter' && handleMovieSearch()}
                      />
                      <Button onClick={handleMovieSearch} disabled={isSearching}>
                        <Search className="w-4 h-4" />
                        {isSearching ? 'Searching...' : 'Search'}
                      </Button>
                    </div>

                    {movieSearchResults.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                        {movieSearchResults.map((movie) => (
                          <Card 
                            key={movie.id} 
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => addMovieToCategory(movie)}
                          >
                            <CardContent className="p-3">
                              <div className="aspect-[3/4] bg-muted rounded mb-2 flex items-center justify-center text-xs text-center overflow-hidden">
                                {movie.poster_path ? (
                                  <img 
                                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                                    alt={movie.title} 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <div className="p-2">{movie.title}</div>
                                )}
                              </div>
                              <p className="text-xs font-medium line-clamp-2">{movie.title}</p>
                              {movie.release_date && (
                                <p className="text-xs text-muted-foreground">
                                  {new Date(movie.release_date).getFullYear()}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <Button onClick={previewGameTemplate} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={saveGameTemplate} disabled={isLoading} className="gradient-gold text-cinema-dark">
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Game Template'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="manage">
            <Card className="gradient-card shadow-elevated">
              <CardHeader>
                <CardTitle>Manage Existing Games</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTemplates ? (
                  <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No templates found.</div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {templates.map((tpl) => {
                      const missingMovies = (tpl.movies?.length || 0) === 0;
                      return (
                        <Card key={tpl.id} className="border">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <CardTitle className="text-lg">{tpl.name}</CardTitle>
                                <p className="text-xs text-muted-foreground">{tpl.id}</p>
                              </div>
                              <div className="flex gap-2">
                                {missingMovies && (
                                  <Badge variant="destructive" className="text-xs">No movies</Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">{tpl.categories.length} categories</Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground line-clamp-2">{tpl.description}</p>
                            <div className="flex flex-wrap gap-2 text-xs">
                              {tpl.tags?.map(tag => (
                                <Badge key={tag} variant="outline">{tag}</Badge>
                              ))}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-muted-foreground">
                                {tpl.movies.length}/16 movies
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setGameForm({
                                      id: tpl.id,
                                      name: tpl.name,
                                      description: tpl.description,
                                      tags: tpl.tags || [],
                                      config: tpl.config,
                                      categories: tpl.categories.map(cat => ({
                                        id: cat.id,
                                        name: cat.name,
                                        difficulty: cat.difficulty,
                                        hint: cat.hint || '',
                                        movies: tpl.movies.filter(m => m.categoryId === cat.id)
                                      }))
                                    });
                                    setActiveTab('create');
                                    toast({ title: "Loaded for editing", description: tpl.name });
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={deletingId === tpl.id}
                                  onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                                >
                                  {deletingId === tpl.id ? 'Deleting...' : 'Delete'}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminCategoryGamesPage;