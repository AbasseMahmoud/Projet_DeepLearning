"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Interface pour le message flash
interface FlashMessage {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: Date;
  transactionResult?: {
    type: "transaction" | "fraude";
    probability: number;
    transactionData: any;
    prediction: any | null;
  };
}

// Interface pour les statistiques
interface DashboardStats {
  totalTransactions: number;
  fraudAlerts: number;
  detectionRate: number;
  totalImagesAnalyzed: number;
  infectedImages: number;
  healthyImages: number;
  recentActivity: {
    type: string;
    status: "success" | "warning" | "error";
    timestamp: string;
  }[];
}

const Dashboard = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [flashMessages, setFlashMessages] = useState<FlashMessage[]>([]);

  // États pour le formulaire de test du modèle
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{
    class: string;
    confidence: number;
    isInfected: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // États pour les statistiques en temps réel
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalTransactions: 0,
    fraudAlerts: 0,
    detectionRate: 0,
    totalImagesAnalyzed: 0,
    infectedImages: 0,
    healthyImages: 0,
    recentActivity: []
  });

  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isModelsModalOpen, setIsModelsModalOpen] = useState(false);
  const [isConfusionMatricesOpen, setIsConfusionMatricesOpen] = useState(false);
  const [isDataDistributionOpen, setIsDataDistributionOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isNormalisationStatsOpen, setIsNormalisationStatsOpen] = useState(false);

  // Infos de l'utilisateur connecté
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Vérifier si l'utilisateur est connecté - version ULTIME
  useEffect(() => {
    let isMounted = true;

    const checkAuth = () => {
      if (!isMounted) return false;

      const isLoggedIn = localStorage.getItem("fraud_is_logged_in");
      const userEmail = localStorage.getItem("fraud_user_email");

      if (isLoggedIn !== "true" || !userEmail) {
        // Nettoyer complètement
        localStorage.removeItem("fraud_is_logged_in");
        localStorage.removeItem("fraud_user_email");
        localStorage.removeItem("fraud_user_name");

        // Rediriger immédiatement sans possibilité de retour
        window.location.href = "/login";
        return false;
      }
      return true;
    };

    // Vérifier immédiatement
    checkAuth();

    // EMPÊCHER COMPLÈTEMENT LE RETOUR
    const handlePopState = (event: PopStateEvent) => {
      if (!checkAuth()) {
        // Empêcher la navigation
        event.preventDefault();
        window.history.pushState(null, "", window.location.href);
      }
    };

    // Bloquer l'historique
    window.history.pushState(null, "", window.location.href);

    window.addEventListener('popstate', handlePopState);

    return () => {
      isMounted = false;
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  // Récupérer les infos depuis localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("fraud_user_name");
    const storedEmail = localStorage.getItem("fraud_user_email");
    setUserName(storedName);
    setUserEmail(storedEmail);
  }, []);

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("fraud_is_logged_in");
    if (isLoggedIn !== "true") {
      router.push("/login");
    }
  }, [router]);

  // Charger les statistiques en temps réel
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setIsLoadingStats(true);
        
        // Simulation de données réelles - À remplacer par votre API
        const mockStats: DashboardStats = {
          totalTransactions: 1247,
          fraudAlerts: 23,
          detectionRate: 98.2,
          totalImagesAnalyzed: 27560,
          infectedImages: 13780,
          healthyImages: 13780,
          recentActivity: [
            { type: "Transaction validée", status: "success", timestamp: "Il y a 2 min" },
            { type: "Alerte de fraude détectée", status: "error", timestamp: "Il y a 5 min" },
            { type: "Image analysée - Saine", status: "success", timestamp: "Il y a 8 min" },
            { type: "Image analysée - Infectée", status: "warning", timestamp: "Il y a 12 min" },
            { type: "Transaction validée", status: "success", timestamp: "Il y a 15 min" }
          ]
        };

        // Simulation d'un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setDashboardStats(mockStats);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadDashboardStats();

    // Mettre à jour les stats toutes les 30 secondes
    const interval = setInterval(loadDashboardStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Mettre à jour les statistiques après chaque analyse d'image
  useEffect(() => {
    if (prediction) {
      setDashboardStats(prev => ({
        ...prev,
        totalImagesAnalyzed: prev.totalImagesAnalyzed + 1,
        infectedImages: prediction.isInfected ? prev.infectedImages + 1 : prev.infectedImages,
        healthyImages: !prediction.isInfected ? prev.healthyImages + 1 : prev.healthyImages,
        recentActivity: [
          {
            type: `Image analysée - ${prediction.isInfected ? 'Infectée' : 'Saine'}`,
            status: prediction.isInfected ? "warning" : "success",
            timestamp: "À l'instant"
          },
          ...prev.recentActivity.slice(0, 4) // Garder seulement les 5 dernières activités
        ]
      }));
    }
  }, [prediction]);

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("fraud_is_logged_in");
    localStorage.removeItem("fraud_user_email");
    localStorage.removeItem("fraud_user_name");
    router.push("/login");
  };

  // Initiales pour l'avatar
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase()
    );
  };

  // Supprimer un message flash
  const removeFlashMessage = (id: string) => {
    setFlashMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  // Fonctions pour le formulaire de test du modèle
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

  // Fonction pour formater les grands nombres
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex">
      {/* Messages Flash */}
      {flashMessages.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md w-full">
          {flashMessages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-2xl border-2 shadow-lg animate-fade-in-up`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-xl mt-0.5"></span>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm mb-1">
                      {message.title}
                    </h4>
                    <p className="text-sm opacity-90">{message.message}</p>
                    {message.transactionResult && (
                      <div className="mt-2 p-2 bg-white/50 rounded-lg">
                        <p className="text-xs font-medium">
                          Statut:{" "}
                          {message.transactionResult.type === "fraude"
                            ? "Fraude"
                            : "Transaction Normale"}
                        </p>
                        <p className="text-xs">
                          Risque:{" "}
                          {(
                            message.transactionResult.probability || 0
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeFlashMessage(message.id)}
                  className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-all duration-500 ease-out lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:h-screen lg:sticky lg:top-0 shadow-2xl shadow-blue-500/5`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-20 border-b border-slate-200/60 px-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <Link
                href="/dashboard"
                className="text-2xl font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent"
              >
               MalariaDetect
              </Link>
              <p className="text-xs text-slate-500">I.A</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-8 px-4">
          {[
            {
              id: "overview",
              name: "Aperçu",
              icon: "",
              onClick: () => setActiveTab("overview"),
            },
            {
              id: "malaria-detection",
              name: "Détection",
              icon: "",
              onClick: () => setActiveTab("malaria-detection"),
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (item.onClick) {
                  item.onClick();
                }
              }}
              className={`group relative w-full flex items-center justify-between px-4 py-3 rounded-2xl mb-2 transition-all duration-300 ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                  : "text-slate-600 bg-transparent hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-lg hover:shadow-indigo-500/10 hover:border hover:border-indigo-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="font-semibold">{item.name}</span>
              </div>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-6 border-t border-slate-200/60">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl p-4 border border-slate-200/60 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {getInitials(userName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">
                  {userName || "Utilisateur connecté"}
                </p>
                <p className="text-sm text-slate-500 truncate">
                  {userEmail || "email non disponible"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40">
          <div className="flex items-center justify-between px-8 py-5">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl bg-white shadow-lg shadow-slate-500/10 border border-slate-200/60 text-slate-600 hover:text-indigo-600 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {activeTab === "malaria-detection" ? "Détection du Paludisme" : "Dashboard"}
                </h1>
                <p className="text-slate-500">
                  {activeTab === "malaria-detection" 
                    ? "Analyse intelligente des cellules sanguines avec IA" 
                    : "Tableau de bord en temps réel"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 sm:space-x-6">
              {/* Search */}
              <div className="hidden md:block relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 w-72"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-400 absolute left-3 top-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Notifications */}
              <button className="relative p-3 rounded-xl bg-white shadow-lg shadow-slate-500/10 border border-slate-200/60 text-slate-600 hover:text-indigo-600 transition-all duration-200 hover:shadow-indigo-500/25">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Bouton Déconnexion en haut à droite */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="px-4 py-2 rounded-xl font-semibold text-sm bg-red-500 cursor-pointer text-white hover:bg-red-600 shadow-lg shadow-red-500/30 border border-red-400/60 transition-all duration-200"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === "malaria-detection" ? (
            // Formulaire de test du modèle
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8">
                
                {/* En-tête de la section */}
                <div className="text-center mb-8">
                  <motion.h2
                    className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    Analyse de Cellules Sanguines
                  </motion.h2>
                  <motion.p
                    className="text-lg text-gray-600 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    Détection automatique du parasite Plasmodium grâce à l'intelligence artificielle
                  </motion.p>
                </div>

                {/* Statistiques */}
                {/* <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600 mb-2">96.08%</div>
                    <div className="text-sm text-blue-700 font-medium">Précision du modèle</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6 text-center border border-green-100">
                    <div className="text-2xl font-bold text-green-600 mb-2">{formatNumber(dashboardStats.totalImagesAnalyzed)}</div>
                    <div className="text-sm text-green-700 font-medium">Images analysées</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6 text-center border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600 mb-2">3</div>
                    <div className="text-sm text-purple-700 font-medium">Modèles testés</div>
                  </div>
                </motion.div> */}

                {/* Zone d'upload et analyse */}
                <motion.div
                  className="bg-slate-50 rounded-2xl p-8 border-2 border-dashed border-slate-200"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <motion.div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                      previewUrl 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    onClick={handleBrowseClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    {previewUrl ? (
                      <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="relative max-w-sm mx-auto">
                          <motion.img
                            src={previewUrl}
                            alt="Aperçu"
                            className="w-full h-64 object-contain rounded-lg border-2 border-slate-200 shadow-sm"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4 }}
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            Fichier: {selectedImage?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Taille: {formatFileSize(selectedImage?.size || 0)}
                          </p>
                        </div>
                        <div className="flex justify-center space-x-4">
                          <motion.button
                            type="button"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); resetAnalysis(); }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Changer l'image
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        <motion.div
                          className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <svg
                            className="w-10 h-10 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </motion.div>
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-gray-700">
                            Importez une image de cellule sanguine
                          </p>
                          <p className="text-sm text-gray-500">
                            Cliquez pour sélectionner ou glissez-déposez un fichier
                          </p>
                          <p className="text-xs text-gray-400">
                            Formats supportés: JPG, PNG, JPEG
                          </p>
                        </div>
                        <motion.button
                          type="button"
                          onClick={handleBrowseClick}
                          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Parcourir les fichiers
                        </motion.button>
                      </div>
                    )}
                  </motion.div>

                  {/* Bouton d'analyse */}
                  {previewUrl && !prediction && (
                    <motion.div
                      className="text-center mt-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <motion.button
                        onClick={analyzeImage}
                        disabled={isLoading}
                        className="px-8 py-4 bg-green-500 text-white rounded-xl font-semibold text-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors shadow-lg shadow-green-500/25"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center space-x-3">
                            <motion.svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </motion.svg>
                            <span>Analyse en cours...</span>
                          </div>
                        ) : (
                          'Lancer l\'analyse'
                        )}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Message d'erreur */}
                  {errorMessage && (
                    <motion.div
                      className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{errorMessage}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Résultats */}
                  {prediction && (
                    <motion.div
                      className={`mt-6 p-6 rounded-xl border-2 ${
                        prediction.isInfected
                          ? 'bg-red-50 border-red-200'
                          : 'bg-green-50 border-green-200'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h4 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                        Résultat de l'analyse
                      </h4>
                      
                      <div className="space-y-4 max-w-md mx-auto">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                          <span className="text-gray-700 font-medium">Statut :</span>
                          <span className={`font-semibold ${
                            prediction.isInfected ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {prediction.class}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                          <span className="text-gray-700 font-medium">Confiance :</span>
                          <span className="font-semibold text-blue-600">{prediction.confidence}%</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Niveau de confiance</span>
                            <span>{prediction.confidence}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <motion.div
                              className={`h-3 rounded-full ${
                                prediction.isInfected ? 'bg-red-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${prediction.confidence}%` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${prediction.confidence}%` }}
                              transition={{ duration: 1, delay: 0.3 }}
                            />
                          </div>
                        </div>
                        
                        <div className={`p-4 rounded-lg text-center ${
                          prediction.isInfected 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {prediction.isInfected ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold">Cellule infectée détectée</span>
                              </div>
                              <p className="text-sm">Cette cellule semble infectée par le parasite Plasmodium. Consultez un professionnel de santé.</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold">Cellule saine</span>
                              </div>
                              <p className="text-sm">Aucun signe d'infection détecté. La cellule semble saine.</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-center mt-6">
                        <motion.button
                          onClick={resetAnalysis}
                          className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Nouvelle analyse
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          ) : (
            // Contenu normal du Dashboard - APERÇU
            <div className="max-w-7xl mx-auto">
              {/* Indicateur de chargement */}
              {isLoadingStats && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-3 text-slate-600">Chargement des statistiques...</span>
                </div>
              )}

              {/* Grille de statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Transactions totales */}
                <motion.div
                  className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Transactions</h3>
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-blue-600 text-lg">💳</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {formatNumber(dashboardStats.totalTransactions)}
                  </div>
                  <p className="text-sm text-slate-600">Total analysées</p>
                </motion.div>

                {/* Alertes de fraude */}
                {/* <motion.div
                  className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Alertes Fraude</h3>
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <span className="text-red-600 text-lg">⚠️</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {formatNumber(dashboardStats.fraudAlerts)}
                  </div>
                  <p className="text-sm text-slate-600">Détections suspectes</p>
                </motion.div> */}

                {/* Taux de détection */}
                <motion.div
                  className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Taux Détection</h3>
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-green-600 text-lg">🎯</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {dashboardStats.detectionRate}%
                  </div>
                  <p className="text-sm text-slate-600">Précision du système</p>
                </motion.div>

                {/* Images analysées */}
                <motion.div
                  className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Images Analysées</h3>
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-purple-600 text-lg">🔬</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {formatNumber(dashboardStats.totalImagesAnalyzed)}
                  </div>
                  <p className="text-sm text-slate-600">Total des analyses</p>
                </motion.div>
              </div>

              {/* Deuxième ligne de statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Images infectées vs saines */}
                <motion.div
                  className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Statut des Images</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-slate-700">Images infectées</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-900">{formatNumber(dashboardStats.infectedImages)}</span>
                        <span className="text-sm text-slate-500 ml-2">
                          ({((dashboardStats.infectedImages / dashboardStats.totalImagesAnalyzed) * 100 || 0).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-slate-700">Images saines</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-900">{formatNumber(dashboardStats.healthyImages)}</span>
                        <span className="text-sm text-slate-500 ml-2">
                          ({((dashboardStats.healthyImages / dashboardStats.totalImagesAnalyzed) * 100 || 0).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    {/* Barre de progression */}
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full"
                        style={{ 
                          width: '100%',
                          background: `linear-gradient(90deg, 
                            red ${(dashboardStats.infectedImages / dashboardStats.totalImagesAnalyzed) * 100 || 0}%, 
                            green ${(dashboardStats.infectedImages / dashboardStats.totalImagesAnalyzed) * 100 || 0}%)` 
                        }}
                      ></div>
                    </div>
                  </div>
                </motion.div>

                {/* Activité récente */}
                <motion.div
                  className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Activité Récente</h3>
                  <div className="space-y-3">
                    {dashboardStats.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.status === 'success' ? 'bg-green-500' :
                            activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm text-slate-700">{activity.type}</span>
                        </div>
                        <span className="text-xs text-slate-500">{activity.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Actions rapides */}
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/60"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Actions Rapides</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="p-4 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-left">
                    <div className="font-semibold mb-1">Voir les rapports</div>
                    <div className="text-sm text-indigo-600">Analyses détaillées</div>
                  </button>
                  <button className="p-4 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-left">
                    <div className="font-semibold mb-1">Exporter les données</div>
                    <div className="text-sm text-green-600">Format CSV/Excel</div>
                  </button>
                  <button 
                    onClick={() => setActiveTab("malaria-detection")}
                    className="p-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-left"
                  >
                    <div className="font-semibold mb-1">Détection Paludisme</div>
                    <div className="text-sm text-blue-600">Analyser une image</div>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Modal de confirmation de déconnexion */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200/60 shadow-2xl">
            <div className="text-center">
              {/* Icône d'alerte */}
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              {/* Titre et message */}
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Confirmer la déconnexion
              </h3>
              <p className="text-slate-600 mb-6">
                Êtes-vous sûr de vouloir vous déconnecter ?
                Vous devrez vous reconnecter pour accéder à votre tableau de bord.
              </p>

              {/* Boutons d'action */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-3 cursor-pointer bg-orange-300 rounded-xl font-semibold text-sm bg-slate-100 text-slate-700 hover:bg-orange-200 transition-all duration-200 border border-slate-200"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowLogoutConfirm(false);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl cursor-pointer font-semibold text-sm bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 border border-red-400/60 transition-all duration-200"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;