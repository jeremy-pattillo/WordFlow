import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'tagalog' | 'spanish';

interface LanguageContextType {
  selectedLanguage: Language;
  setSelectedLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [selectedLanguage, setSelectedLanguageState] = useState<Language>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('selectedLanguage');
    return (saved === 'tagalog' || saved === 'spanish') ? saved : 'tagalog';
  });

  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedLanguage', selectedLanguage);
  }, [selectedLanguage]);

  const setSelectedLanguage = (language: Language) => {
    setSelectedLanguageState(language);
  };

  return (
    <LanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
