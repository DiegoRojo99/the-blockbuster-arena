import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CastGamePage from "./pages/CastGamePage";
import ModeSelectionPage from "./pages/ModeSelectionPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import DatabaseTest from "./pages/DatabaseTest";
import SharedCastGamePage from "./pages/SharedCastGamePage";
import CategoriesGamePage from "./pages/CategoriesGamePage";
import AdminCategoryGamesPage from "./pages/AdminCategoryGamesPage";
import CustomMoviePage from "./pages/CustomMoviePage";
import ActorFilmographySetupPage from "./pages/ActorFilmographySetupPage";
import ActorFilmographyPlayPage from "./pages/ActorFilmographyPlayPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/test" element={<DatabaseTest />} />
          <Route path="/cast-game-modes" element={<ModeSelectionPage />} />
          <Route path="/cast-game/shared/:shareSlug" element={<SharedCastGamePage />} />
          <Route path="/cast-game/custom/:movieId" element={<CastGamePage />} />
          <Route path="/cast-game/custom" element={<CustomMoviePage />} />
          <Route path="/cast-game" element={<CastGamePage />} />
          <Route path="/category-game" element={<CategoriesGamePage />} />
          <Route path="/admin/category" element={<AdminCategoryGamesPage />} />
          <Route path="/actor-filmography" element={<ActorFilmographySetupPage />} />
          <Route path="/actor-filmography/play" element={<ActorFilmographyPlayPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
