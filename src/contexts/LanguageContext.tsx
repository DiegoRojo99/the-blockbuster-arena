import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, LanguageOption } from '@/types/tmdb';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  availableLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const availableLanguages: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    // Try to get language from localStorage or default to 'en'
    const saved = localStorage.getItem('blockbuster-arena-language');
    return (saved as SupportedLanguage) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('blockbuster-arena-language', currentLanguage);
  }, [currentLanguage]);

  const setLanguage = (language: SupportedLanguage) => {
    setCurrentLanguage(language);
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      setLanguage,
      availableLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};