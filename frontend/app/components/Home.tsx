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
  
  // Référence pour l'input file
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ouvrir le sélecteur de fichiers
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Gestion du téléchargement d'image
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide');
        return;
      }
      
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null); // Reset previous prediction
      console.log('Fichier sélectionné:', file.name);
    }
  };

  // Gestion du drag and drop
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

  // Fonction d'analyse réelle avec l'API Flask
  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedImage);
      // Link avec le back
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
      }
      
      if (data.prediction === "Inconnue") {
        setPrediction({
          class: "Inconnue",
          confidence: Math.round(data.confidence),
          isInfected: false,
        });
        return;
      }

      else {
        // Adapter selon la réponse du backend Flask
        setPrediction({
          class: data.prediction,
          confidence: Math.round(data.confidence),
          isInfected: data.prediction === "Parasitée",
        });
      }
    } catch (error: unknown) {
      console.error("Erreur lors de la requête :", error);
      alert("Erreur lors de l'analyse. Vérifiez la connexion au serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  // Réinitialiser
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
      
      {/* Hero Section */}
      <section id="accueil" className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Détection Intelligente du 
              <span className="text-blue-600"> Paludisme</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Utilisation de Intelligence Artificielle pour identifier les cellules sanguines 
              infectées par le parasite Plasmodium avec une précision optimale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#demo" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition duration-300 shadow-lg hover:shadow-xl"
              >
                Tester le Modèle
              </a>
              <a 
                href="#modeles" 
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition duration-300"
              >
                Voir les Modèles
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">99.2%</div>
              <div className="text-gray-600">Précision du Meilleur Modèle</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">27,558</div>
              <div className="text-gray-600">Images Entraînement</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">3</div>
              <div className="text-gray-600">Architectures CNN Testées</div>
            </div>
          </div>
        </div>
      </section>

      {/* Dataset Section */}
      <section id="dataset" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Exploration du Dataset
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Cellules Sanguines Analysées</h3>
              <p className="text-gray-600 mb-6">
                Notre ensemble de données contient des images de cellules sanguines divisées en deux catégories :
              </p>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-semibold text-green-700">Cellules Non Infectées</h4>
                    <p className="text-green-600 text-sm">13,780 images saines</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-red-50 rounded-lg">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-semibold text-red-700">Cellules Parasitées</h4>
                    <p className="text-red-600 text-sm">13,780 images infectées</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg shadow-md mb-2">
                  <div className="w-32 h-32 bg-green-200 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-green-600 font-semibold">Saine</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Cellule Non Infectée</p>
              </div>
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg shadow-md mb-2">
                  <div className="w-32 h-32 bg-red-200 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-red-600 font-semibold">Parasitée</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Cellule Infectée</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Models Section */}
      <section id="modeles" className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Modèles CNN Implémentés
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Modèle 1 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">CNN Simple</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Architecture basique
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  3 couches de convolution
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Entraînement rapide
                </li>
              </ul>
            </div>

            {/* Modèle 2 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">CNN Avancé</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Architecture profonde
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Couches de dropout
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Batch normalization
                </li>
              </ul>
            </div>

            {/* Modèle 3 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Transfer Learning</h3>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Modèle pré-entraîné
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Fine-tuning
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Meilleures performances
                </li>
              </ul>
            </div>
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
            {/* Input file caché mais fonctionnel */}
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
                        e.stopPropagation(); // Empêche le déclenchement du click sur le parent
                        resetAnalysis();
                      }}
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

            {/* Résultats */}
            {prediction && (
              <div className={`p-6 rounded-lg border-2 ${
                prediction.isInfected 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  Résultat de l&aposanalyse :
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
                    <span className="font-semibold text-blue-600">
                      {prediction.confidence}%
                    </span>
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
                    prediction.isInfected 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {prediction.isInfected ? (
                      <p className="text-sm">
                        ⚠️ Cette cellule semble infectée par le parasite Plasmodium. 
                        Consultez un professionnel de santé.
                      </p>
                    ) : (
                      <p className="text-sm">
                        ✅ Cette cellule semble saine. Aucun signe d&aposinfection détecté.
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
                <li>• Cliquez sur &aposParcourir les fichiers&apos pour sélectionner une image</li>
                <li>• Ou glissez-déposez directement une image dans la zone</li>
                <li>• Formats acceptés : JPG, PNG, JPEG</li>
                <li>• Taille maximale recommandée : 5MB</li>
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