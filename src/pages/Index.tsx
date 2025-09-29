import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GameCard from "@/components/GameCard";
import Layout from "@/components/Layout";
import heroCinema from "@/assets/hero-cinema.jpg";
import { Link } from "react-router-dom";

const Index = () => {

  const games = [
    {
      id: 'cast-game-modes',
      title: 'Cast Guessing',
      description: 'Guess the movie by its cast members',
      icon: '🎭'
    },
    {
      id: 'category-game',
      title: 'Categories Game', 
      description: 'Group 16 movies into 4 categories',
      icon: '�'
    }
  ];

  return (
    <Layout className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroCinema})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
          
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4">            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cinema-gold via-cinema-purple to-cinema-blue bg-clip-text text-transparent animate-fade-in">
              The Blockbuster Arena
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
              Welcome to The Blockbuster Arena! Test your movie knowledge with fun, interactive games. From cast guessing to category puzzles!
            </p>
            
            <Button 
              size="lg"
              className="gradient-gold text-cinema-dark font-semibold text-lg px-8 py-4 shadow-glow hover:shadow-elevated transition-all duration-300 animate-float"
              onClick={() => document.getElementById('games-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Playing 🎮
            </Button>
          </div>
        </section>

        {/* Games Section */}
        <section id="games-section" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
                Choose Your Game
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Each game tests different aspects of your movie knowledge. Pick one and see how well you know cinema!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {games.map((game, index) => (
                <Link key={game.id} to={`/${game.id}`} className="block">
                  <GameCard
                    title={game.title}
                    description={game.description}
                    icon={game.icon}
                    onClick={() => {}} // Empty function since we're using Link
                    className={`animate-fade-in ${index === 1 ? '[animation-delay:0.2s]' : ''} cursor-pointer hover:scale-105 transition-transform`}
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-background to-cinema-card/30">
          <div className="max-w-6xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-12 text-foreground">
              Why You'll Love The Blockbuster Arena
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="gradient-card shadow-card border-border/50">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">🧠</div>
                  <h4 className="text-xl font-semibold mb-4 text-cinema-gold">
                    Test Your Knowledge
                  </h4>
                  <p className="text-muted-foreground">
                    Challenge yourself with movies from different eras, genres, and styles.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="gradient-card shadow-card border-border/50">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">📱</div>
                  <h4 className="text-xl font-semibold mb-4 text-cinema-gold">
                    Play Anywhere
                  </h4>
                  <p className="text-muted-foreground">
                    Fully responsive design that works perfectly on desktop, tablet, and mobile.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="gradient-card shadow-card border-border/50">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">🏆</div>
                  <h4 className="text-xl font-semibold mb-4 text-cinema-gold">
                    Track Progress
                  </h4>
                  <p className="text-muted-foreground">
                    Keep track of your scores and see how you improve over time.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
    </Layout>
  );
};

export default Index;