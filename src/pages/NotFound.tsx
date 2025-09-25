import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="gradient-card shadow-elevated max-w-md w-full">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🎬</div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-cinema-gold to-cinema-purple bg-clip-text text-transparent">
              404
            </CardTitle>
            <p className="text-xl text-muted-foreground">Oops! Page not found</p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist. Let's get you back to The Blockbuster Arena!
            </p>
            <Link to="/">
              <Button className="gradient-gold text-cinema-dark font-semibold">
                <Home className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
    </Layout>
  );
};

export default NotFound;
