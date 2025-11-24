'use client'
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './sombre';
import Link from 'next/link';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{
    class: string;
    confidence: number;
    isInfected: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Hero Section */}
      <motion.section
        id="accueil"
        className="pt-20 pb-16 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Détection Intelligente du <span className="text-blue-600 dark:text-blue-400">Paludisme</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Utilisation de Intelligence Artificielle pour identifier les cellules sanguines
            infectées par le parasite Plasmodium avec une précision optimale.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <a href="#modeles" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition duration-300 shadow-lg hover:shadow-xl">
              Voir les Modèles
            </a>
          </motion.div>
        </div>
      </motion.section>

      {/* Statistics Section */}
      <motion.section
        className="py-12 bg-white dark:bg-slate-800"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              className="p-6 hover:scale-105 transition-transform duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">96.08%</div>
              <div className="text-gray-600 dark:text-gray-300">Précision du Meilleur Modèle</div>
            </motion.div>
            <motion.div
              className="p-6 hover:scale-105 transition-transform duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">27,560</div>
              <div className="text-gray-600 dark:text-gray-300">Images Entraînement</div>
            </motion.div>
            <motion.div
              className="p-6 hover:scale-105 transition-transform duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">3</div>
              <div className="text-gray-600 dark:text-gray-300">Architectures CNN Testées</div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Dataset Section */}
      <motion.section
        id="dataset"
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-800"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Exploration du Dataset
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Cellules Sanguines Analysées</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Notre ensemble de données contient des images de cellules sanguines divisées en deux catégories :
              </p>
              <div className="space-y-4">
                <motion.div
                  className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400">Cellules Non Infectées</h4>
                    <p className="text-green-600 dark:text-green-300 text-sm">13,780 images saines</p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-400">Cellules Parasitées</h4>
                    <p className="text-red-600 dark:text-red-300 text-sm">13,780 images infectées</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-md mb-2">
                  <div className="w-32 h-32 bg-green-200 dark:bg-green-800 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 font-semibold">Saine</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Cellule Non Infectée</p>
              </motion.div>
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-md mb-2">
                  <div className="w-32 h-32 bg-red-200 dark:bg-red-800 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-red-600 dark:text-red-400 font-semibold">Parasitée</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Cellule Infectée</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Models Section */}
      <motion.section
        id="modeles"
        className="py-16 bg-gray-50 dark:bg-slate-800 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Modèles CNN Implémentés
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Modèle 1 */}
            <motion.div
              className="bg-white dark:bg-slate-700 rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300"
              whileHover={{ scale: 1.05, y: -5 }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">CNN Simple</h3>
              </div>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Architecture basique
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  2 couches de convolution
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Entraînement rapide
                </li>
              </ul>
            </motion.div>

            {/* Modèle 2 */}
            <motion.div
              className="bg-white dark:bg-slate-700 rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300"
              whileHover={{ scale: 1.05, y: -5 }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 dark:text-green-400 font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">CNN intermédiaire</h3>
              </div>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
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
            </motion.div>

            {/* Modèle 3 */}
            <motion.div
              className="bg-white dark:bg-slate-700 rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300"
              whileHover={{ scale: 1.05, y: -5 }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">CNN Avancé (réseau de neurones convolutionnel profond)</h3>
              </div>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                   Modèle personnalisé (CNN Avancé)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Bonnes performances après plusieurs couches de convolution
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">MalariaDetect</h3>
            <p className="text-gray-400 mb-6">
              Projet d&aposIntelligence Artificielle pour la détection du paludisme
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="#" className="text-gray-400 hover:text-white transition duration-300">
                GitHub
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition duration-300">
                Documentation
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition duration-300">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}