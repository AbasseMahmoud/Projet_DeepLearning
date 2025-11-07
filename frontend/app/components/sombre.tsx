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
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark';
    }
    return false;
  });

  // Sauvegarder le thème dans localStorage et appliquer au document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

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
