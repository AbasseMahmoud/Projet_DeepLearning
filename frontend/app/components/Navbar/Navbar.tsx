'use client';
import React, { useState } from 'react';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-700 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo et Nom du Projet */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 bg-white p-2 rounded-lg">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold tracking-tight">MalariaDetect</h1>
              <p className="text-blue-200 text-xs">Intelligent Cell Analysis</p>
            </div>
          </div>

          {/* Navigation Desktop */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a 
                href="#accueil" 
                className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-lg font-medium transition duration-300 border-b-2 border-transparent hover:border-white"
              >
                Accueil
              </a>
              <a 
                href="#dataset" 
                className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-lg font-medium transition duration-300 border-b-2 border-transparent hover:border-white"
              >
                Dataset
              </a>
              <a 
                href="#modeles" 
                className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-lg font-medium transition duration-300 border-b-2 border-transparent hover:border-white"
              >
                Modèles
              </a>
              <a 
                href="#resultats" 
                className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-lg font-medium transition duration-300 border-b-2 border-transparent hover:border-white"
              >
                Résultats
              </a>
              <a 
                href="#demo" 
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-full text-lg font-semibold transition duration-300 shadow-lg hover:shadow-xl"
              >
                Tester
              </a>
            </div>
          </div>

          {/* Bouton Mobile */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white p-2 rounded-lg transition duration-300"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-blue-700 border-t border-blue-500">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a 
                href="#accueil" 
                className="text-white hover:bg-blue-600 block px-3 py-3 rounded-md text-base font-medium transition duration-300"
              >
                Accueil
              </a>
              <a 
                href="#dataset" 
                className="text-white hover:bg-blue-600 block px-3 py-3 rounded-md text-base font-medium transition duration-300"
              >
                Dataset
              </a>
              <a 
                href="#modeles" 
                className="text-white hover:bg-blue-600 block px-3 py-3 rounded-md text-base font-medium transition duration-300"
              >
                Modèles
              </a>
              <a 
                href="#resultats" 
                className="text-white hover:bg-blue-600 block px-3 py-3 rounded-md text-base font-medium transition duration-300"
              >
                Résultats
              </a>
              <a 
                href="#demo" 
                className="bg-white text-blue-600 hover:bg-blue-50 block px-3 py-3 rounded-md text-base font-semibold text-center transition duration-300 mt-4"
              >
                Tester le Modèle
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;