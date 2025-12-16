import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { ActorSearch } from '@/components/actor-filmography/ActorSearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { TMDBPerson } from '@/types/tmdb';
import { ArrowLeft, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const ActorFilmographySetupPage = () => {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const [selectedActor, setSelectedActor] = useState<TMDBPerson | null>(null);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(10);

  const handleStartGame = () => {
    if (!selectedActor) return;

    const timeLimitSeconds = timeLimitMinutes * 60;
    const params = new URLSearchParams({
      actorId: selectedActor.id.toString(),
      actorName: selectedActor.name,
      timeLimit: timeLimitSeconds.toString(),
    });

    navigate(`/actor-filmography/play?${params.toString()}`);
  };

  const isReady = selectedActor !== null && timeLimitMinutes > 0;

  return (
    <Layout className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6 pt-4">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
            🎬 Actor Filmography Challenge
          </h1>
          <p className="text-lg text-muted-foreground">Name all theatrical films from an actor within your time limit</p>
        </div>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>Choose Your Actor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActorSearch
              onSelect={setSelectedActor}
              disabled={false}
            />

            {selectedActor && (
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="font-semibold text-green-800 dark:text-green-200">
                  ✓ Selected: {selectedActor.name}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  {selectedActor.known_for_department} • Popularity {selectedActor.popularity.toFixed(0)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>Set Time Limit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="time-limit">Minutes (leave blank or 0 for no limit)</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="time-limit"
                  type="number"
                  min="0"
                  max="60"
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 max-w-xs"
                />
                <span className="text-sm text-muted-foreground font-medium">
                  {timeLimitMinutes > 0 ? `${timeLimitMinutes} minute${timeLimitMinutes !== 1 ? 's' : ''}` : 'No limit'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((mins) => (
                <Button
                  key={mins}
                  variant={timeLimitMinutes === mins ? 'default' : 'outline'}
                  onClick={() => setTimeLimitMinutes(mins)}
                  className={timeLimitMinutes === mins ? 'gradient-gold text-cinema-dark font-semibold' : ''}
                >
                  {mins} min
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleStartGame}
          disabled={!isReady}
          className="w-full gradient-gold text-cinema-dark font-semibold text-lg py-6 flex items-center justify-center gap-2"
        >
          <Play className="h-5 w-5" />
          Start Game
        </Button>

        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 p-4 space-y-2 text-sm">
          <div className="font-semibold text-blue-800 dark:text-blue-200">💡 How to Play:</div>
          <ul className="text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>Search for movies to guess which are in the actor's filmography</li>
            <li>Click silhouette posters to reveal progressive hints: Year → Genre → Initials → Poster</li>
            <li>Track your correct/total guesses in real-time</li>
            <li>Wrong guesses are allowed and listed for reference</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default ActorFilmographySetupPage;
