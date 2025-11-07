'use client'
import React, { useState, useEffect, createContext, useContext } from 'react';

// Création du contexte pour le thème
const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
});

// Hook personnalisé pour utiliser le thème
export const useTheme = () => useContext(ThemeContext);

// Provider de thème avec mode sombre manuel
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialiser le thème après le montage côté client
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDark(savedTheme === 'dark');
    setMounted(true);
  }, []);

  // Sauvegarder le thème dans localStorage et appliquer au document
  useEffect(() => {
    if (mounted) {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }, [isDark, mounted]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // Rendre rien jusqu'à ce que le composant soit monté pour éviter les erreurs d'hydratation
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Composant pour afficher l'état du thème (optionnel)
export function ThemeIndicator() {
  const { isDark } = useTheme();

  return (
    <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-full text-sm font-medium transition-all duration-500 ${
      isDark
        ? 'bg-gray-800 text-yellow-300 border border-yellow-400'
        : 'bg-white text-gray-800 border border-gray-300 shadow-lg'
    }`}>
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          isDark ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'
        }`}></div>
        <span>{isDark ? 'Mode Sombre' : 'Mode Clair'}</span>
      </div>
    </div>
  );
}
