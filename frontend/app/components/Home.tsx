'use client'
import React, { useState, useRef } from 'react';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{
    class: string;
    confidence: number;
    isInfected: boolean;
    isUnknown?: boolean;
    message?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide');
        return;
      }
      
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null);
      console.log('Fichier sélectionné:', file.name);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // 🔍 Fonction d'analyse réelle avec l'API Flask - VERSION CORRIGÉE
  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedImage);
      
      const response = await fetch("https://projet-deeplearning.onrender.com/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erreur du serveur : ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        alert("Erreur : " + data.error);
        return;
      }

      // Gestion du cas "Inconnue"
      if (data.prediction === "Inconnue") {
        setPrediction({
          class: "Inconnue",
          confidence: Math.round(data.confidence),
          isInfected: false,
          isUnknown: true,
          message: data.message || "⚠️ L'image ne semble pas correspondre à une cellule connue par le modèle."
        });
      } else {
        // Cas normal (Parasitée ou Non infectée)
        setPrediction({
          class: data.prediction,
          confidence: Math.round(data.confidence),
          isInfected: data.prediction === "Parasitée",
          isUnknown: false
        });
      }
    } catch (error: unknown) {
      console.error("Erreur lors de la requête :", error);
      alert("Erreur lors de l'analyse. Vérifiez la connexion au serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setPrediction(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* ... (le reste de votre code reste identique) ... */}
      
      {/* Demo Section - VERSION CORRIGÉE pour afficher "Inconnue" */}
      <section id="demo" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-6">
            Tester le Modèle
          </h2>
          <p className="text-xl text-gray-600 mb-8 text-center">
            Téléchargez une image de cellule sanguine et obtenez une prédiction instantanée
          </p>
          
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {/* Zone de téléchargement */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Sélectionner une image de cellule sanguine
              </label>
              
              <div 
                className={`border-2 border-dashed ${
                  previewUrl ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'
                } rounded-lg p-8 text-center transition duration-300 cursor-pointer`}
                onClick={handleBrowseClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="relative max-w-xs mx-auto">
                      <img 
                        src={previewUrl} 
                        alt="Aperçu" 
                        className="w-full h-48 object-contain rounded-lg border"
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      Fichier: {selectedImage?.name}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetAnalysis();
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Changer limage
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-600 mb-2">Cliquez pour sélectionner une image</p>
                    <p className="text-sm text-gray-500 mb-4">ou glissez-déposez un fichier ici</p>
                    <button
                      type="button"
                      onClick={handleBrowseClick}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-300"
                    >
                      Parcourir les fichiers
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bouton d'analyse */}
            {previewUrl && !prediction && (
              <div className="text-center mb-8">
                <button
                  onClick={analyzeImage}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg text-lg font-semibold transition duration-300 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyse en cours...
                    </div>
                  ) : (
                    'Analyser l\'image'
                  )}
                </button>
              </div>
            )}

            {/* RÉSULTATS - VERSION CORRIGÉE avec gestion "Inconnue" */}
            {prediction && (
              <div className={`p-6 rounded-lg border-2 ${
                prediction.isUnknown 
                  ? 'bg-yellow-50 border-yellow-200' 
                  : prediction.isInfected 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'
              }`}>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  Résultat de lanalyse :
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Statut :</span>
                    <span className={`font-semibold ${
                      prediction.isUnknown 
                        ? 'text-yellow-600' 
                        : prediction.isInfected 
                          ? 'text-red-600' 
                          : 'text-green-600'
                    }`}>
                      {prediction.class}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Confiance :</span>
                    <span className="font-semibold text-blue-600">
                      {prediction.confidence}%
                    </span>
                  </div>
                  
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          prediction.isUnknown 
                            ? 'bg-yellow-500' 
                            : prediction.isInfected 
                              ? 'bg-red-500' 
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${prediction.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Message selon le type de résultat */}
                  <div className={`mt-4 p-3 rounded-md ${
                    prediction.isUnknown 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : prediction.isInfected 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {prediction.isUnknown ? (
                      <p className="text-sm">
                        ⚠️ {prediction.message || "L'image ne semble pas correspondre à une cellule sanguine connue par le modèle."}
                      </p>
                    ) : prediction.isInfected ? (
                      <p className="text-sm">
                        ⚠️ Cette cellule semble infectée par le parasite Plasmodium. 
                        Consultez un professionnel de santé.
                      </p>
                    ) : (
                      <p className="text-sm">
                        ✅ Cette cellule semble saine. Aucun signe dinfection détecté.
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <button
                    onClick={resetAnalysis}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition duration-300"
                  >
                    Nouvelle analyse
                  </button>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-2">Instructions :</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Cliquez sur Parcourir les fichiers pour sélectionner une image</li>
                <li>• Ou glissez-déposez directement une image dans la zone</li>
                <li>• Formats acceptés : JPG, PNG, JPEG</li>
                <li>• Taille maximale recommandée : 5MB</li>
                <li>• Le modèle peut indiquer Inconnue si limage ne correspond pas aux cellules entraînées</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">MalariaDetect</h3>
            <p className="text-gray-400 mb-6">
              Projet dIntelligence Artificielle pour la détection du paludisme
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                GitHub
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                Documentation
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}