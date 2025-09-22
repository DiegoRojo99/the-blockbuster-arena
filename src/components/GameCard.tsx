import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GameCardProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  className?: string;
}

const GameCard = ({ title, description, icon, onClick, className }: GameCardProps) => {
  return (
    <Card 
      className={cn(
        "gradient-card border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer group overflow-hidden",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="text-center pb-4">
        <div className="text-6xl mb-4 group-hover:animate-float transition-all duration-300">
          {icon}
        </div>
        <CardTitle className="text-2xl bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
          {title}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button 
          className="w-full gradient-gold text-cinema-dark font-semibold hover:shadow-glow transition-all duration-300"
          size="lg"
        >
          Play Now
        </Button>
      </CardContent>
    </Card>
  );
};

export default GameCard;