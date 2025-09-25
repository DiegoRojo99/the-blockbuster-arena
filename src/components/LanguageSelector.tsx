import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LanguageSelectorProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export const LanguageSelector = ({ className, variant = "outline" }: LanguageSelectorProps) => {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();
  
  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className={className}>
          <Globe className="w-4 h-4 mr-2" />
          <span className="mr-1">{currentLang?.flag}</span>
          <span className="hidden sm:inline">{currentLang?.name}</span>
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLanguage(language.code)}
            className={`cursor-pointer ${currentLanguage === language.code ? 'bg-accent' : ''}`}
          >
            <span className="mr-2">{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};