'use client'
import React, { useState, useRef } from 'react';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{
    class: string;
    confidence: number;
    isInfected: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // 🔹 State pour message d'erreur

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Veuillez sélectionner un fichier image valide');
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null);
      setErrorMessage(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null);
      setErrorMessage(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setErrorMessage(null);

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
        setErrorMessage(data.error);
        return;
      }

      if (data.prediction === "Inconnue") {
        setPrediction({
          class: "Inconnue",
          confidence: Math.round(data.confidence),
          isInfected: false,
        });
        return;
      }

      setPrediction({
        class: data.prediction,
        confidence: Math.round(data.confidence),
        isInfected: data.prediction === "Parasitée",
      });
    } catch (error: unknown) {
      console.error("Erreur lors de la requête :", error);
      setErrorMessage("Erreur lors de l'analyse. Vérifiez la connexion au serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setPrediction(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section id="accueil" className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Détection Intelligente du <span className="text-blue-600">Paludisme</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Utilisation de Intelligence Artificielle pour identifier les cellules sanguines 
            infectées par le parasite Plasmodium avec une précision optimale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#demo" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition duration-300 shadow-lg hover:shadow-xl">
              Tester le Modèle
            </a>
            <a href="#modeles" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition duration-300">
              Voir les Modèles
            </a>
          </div>
        </div>
      </section>

      {/* Demo Section */}
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
                    onClick={(e) => { e.stopPropagation(); resetAnalysis(); }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Changer l&aposimage
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

            {/* Message d'erreur */}
            {errorMessage && (
              <div className="mb-4 p-4 rounded-md bg-red-100 text-red-800 text-center font-medium">
                {errorMessage}
              </div>
            )}

            {/* Résultats */}
            {prediction && (
              <div className={`p-6 rounded-lg border-2 ${
                prediction.isInfected 
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
                      prediction.isInfected ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {prediction.class}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Confiance :</span>
                    <span className="font-semibold text-blue-600">{prediction.confidence}%</span>
                  </div>
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          prediction.isInfected ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${prediction.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className={`mt-4 p-3 rounded-md ${
                    prediction.isInfected ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {prediction.isInfected ? (
                      <p className="text-sm">⚠️ Cette cellule semble infectée par le parasite Plasmodium. Consultez un professionnel de santé.</p>
                    ) : (
                      <p className="text-sm">✅ Cette cellule semble saine. Aucun signe dinfection détecté.</p>
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
          </div>
        </div>
      </section>
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">MalariaDetect</h3>
            <p className="text-gray-400 mb-6">
              Projet d&aposIntelligence Artificielle pour la détection du paludisme
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
