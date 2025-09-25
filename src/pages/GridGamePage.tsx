import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Layout from "@/components/Layout";

interface GridItem {
  id: number;
  text: string;
  category: string;
}

const gridData: GridItem[] = [
  // Action Heroes
  { id: 1, text: "John Wick", category: "Action Heroes" },
  { id: 2, text: "James Bond", category: "Action Heroes" },
  { id: 3, text: "Indiana Jones", category: "Action Heroes" },
  { id: 4, text: "The Terminator", category: "Action Heroes" },
  // Disney Movies
  { id: 5, text: "The Lion King", category: "Disney Movies" },
  { id: 6, text: "Frozen", category: "Disney Movies" },
  { id: 7, text: "Moana", category: "Disney Movies" },
  { id: 8, text: "Aladdin", category: "Disney Movies" },
  // Horror Films
  { id: 9, text: "Halloween", category: "Horror Films" },
  { id: 10, text: "The Exorcist", category: "Horror Films" },
  { id: 11, text: "A Nightmare on Elm Street", category: "Horror Films" },
  { id: 12, text: "Scream", category: "Horror Films" },
  // Sci-Fi Classics
  { id: 13, text: "Star Wars", category: "Sci-Fi Classics" },
  { id: 14, text: "Blade Runner", category: "Sci-Fi Classics" },
  { id: 15, text: "The Matrix", category: "Sci-Fi Classics" },
  { id: 16, text: "E.T.", category: "Sci-Fi Classics" },
];

const categories = ["Action Heroes", "Disney Movies", "Horror Films", "Sci-Fi Classics"];
const categoryColors = {
  "Action Heroes": "bg-red-500/20 border-red-500/50 text-red-300",
  "Disney Movies": "bg-pink-500/20 border-pink-500/50 text-pink-300", 
  "Horror Films": "bg-purple-500/20 border-purple-500/50 text-purple-300",
  "Sci-Fi Classics": "bg-blue-500/20 border-blue-500/50 text-blue-300"
};

const GridGamePage = () => {
  const [items, setItems] = useState<GridItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [completedCategories, setCompletedCategories] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => {
    // Shuffle the grid items
    const shuffled = [...gridData].sort(() => Math.random() - 0.5);
    setItems(shuffled);
  }, []);

  const handleItemClick = (itemId: number) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else if (selectedItems.length < 4) {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSubmit = () => {
    if (selectedItems.length !== 4) return;

    const selectedCategories = selectedItems.map(id => 
      items.find(item => item.id === id)?.category
    );
    
    const uniqueCategories = new Set(selectedCategories);
    
    if (uniqueCategories.size === 1) {
      const category = selectedCategories[0];
      if (category && !completedCategories.includes(category)) {
        setCompletedCategories([...completedCategories, category]);
        toast({
          title: "Correct! 🎉",
          description: `You found the "${category}" category!`,
        });
        
        // Remove completed items from the grid
        setItems(items.filter(item => !selectedItems.includes(item.id)));
        setSelectedItems([]);
        
        if (completedCategories.length === 3) {
          setGameComplete(true);
          toast({
            title: "Congratulations! 🏆",
            description: "You've completed all categories!",
          });
        }
      }
    } else {
      setMistakes(mistakes + 1);
      toast({
        title: "Not quite right 🤔",
        description: "These items don't belong to the same category. Try again!",
        variant: "destructive"
      });
      setSelectedItems([]);
    }
    
    setAttempts(attempts + 1);
  };

  const resetGame = () => {
    const shuffled = [...gridData].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setSelectedItems([]);
    setCompletedCategories([]);
    setAttempts(0);
    setMistakes(0);
    setGameComplete(false);
  };

  if (gameComplete) {
    return (
      <Layout className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="gradient-card shadow-elevated max-w-md w-full">
            <CardHeader className="text-center">
              <Trophy className="w-16 h-16 text-cinema-gold mx-auto mb-4" />
              <CardTitle className="text-3xl bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
                Perfect!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-cinema-gold">{4 - mistakes}/4</div>
                <p className="text-muted-foreground">Categories completed</p>
                <p className="text-sm text-muted-foreground">
                  Total attempts: {attempts} | Mistakes: {mistakes}
                </p>
              </div>
              <div className="space-y-2">
                <Button onClick={resetGame} className="w-full gradient-gold text-cinema-dark font-semibold">
                  Play Again
                </Button>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }  return (
    <Layout className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                <Star className="w-4 h-4 mr-1" />
                Completed: {completedCategories.length}/4
              </Badge>
              <Badge variant="outline">
                Attempts: {attempts}
              </Badge>
              {mistakes > 0 && (
                <Badge variant="destructive">
                  Mistakes: {mistakes}
                </Badge>
              )}
            </div>
          </div>

          <Card className="gradient-card shadow-elevated">
            <CardHeader>
              <CardTitle className="text-2xl text-center bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
                🎬 Movie Categories Grid
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Find groups of 4 movies that belong to the same category!
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {items.map((item, index) => (
                  <Button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    variant="outline"
                    className={cn(
                      "h-20 text-wrap text-sm font-medium transition-all duration-200 animate-fade-in",
                      selectedItems.includes(item.id) && "ring-2 ring-cinema-gold bg-cinema-gold/10",
                      completedCategories.includes(item.category) && 
                      `${categoryColors[item.category as keyof typeof categoryColors]} cursor-not-allowed`
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    disabled={completedCategories.includes(item.category)}
                  >
                    {item.text}
                  </Button>
                ))}
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleSubmit}
                  disabled={selectedItems.length !== 4}
                  className="gradient-gold text-cinema-dark font-semibold"
                >
                  Submit Group ({selectedItems.length}/4)
                </Button>
                <Button
                  onClick={() => setSelectedItems([])}
                  variant="outline"
                  disabled={selectedItems.length === 0}
                >
                  Clear Selection
                </Button>
              </div>

              {completedCategories.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground text-center">
                    Completed Categories:
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {completedCategories.map((category) => (
                      <Badge 
                        key={category}
                        className={categoryColors[category as keyof typeof categoryColors]}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    </Layout>
  );
};

export default GridGamePage;