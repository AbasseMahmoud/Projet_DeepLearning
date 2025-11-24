"use client";
import Link from "next/link";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Gestion des champs
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Soumission du formulaire → appel API Flask
  // const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setMessage(null);
  //   setMessageType(null);

  //   if (formData.password !== formData.confirmPassword) {
  //     setMessageType("error");
  //     setMessage("Les mots de passe ne correspondent pas.");
  //     return;
  //   }

  //   if (!formData.acceptTerms) {
  //     setMessageType("error");
  //     setMessage("Vous devez accepter les conditions d'utilisation.");
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const res = await fetch("http://127.0.0.1:5000/api/register", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         username: formData.email,
  //         password: formData.password,
  //       }),
  //     });

  //     const data = await res.json();

  //     if (res.ok) {
  //       // ✅ On garde le vrai nom + email en local pour le dashboard
  //       const fullName = `${formData.firstName} ${formData.lastName}`.trim();
  //       localStorage.setItem("fraud_user_name", fullName);
  //       localStorage.setItem("fraud_user_email", formData.email);

  //       setMessageType("success");
  //       setMessage(data.message || "Inscription réussie !");

  //       // 🔁 Redirection vers la page de connexion
  //       router.push("/login");
  //     } else {
  //       setMessageType("error");
  //       setMessage(data.message || "Erreur lors de l'inscription.");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setMessageType("error");
  //     setMessage("Erreur de connexion au serveur.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Soumission du formulaire → appel API Flask
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setMessage(null);
  setMessageType(null);

  if (formData.password !== formData.confirmPassword) {
    setMessageType("error");
    setMessage("Les mots de passe ne correspondent pas.");
    return;
  }

  if (!formData.acceptTerms) {
    setMessageType("error");
    setMessage("Vous devez accepter les conditions d'utilisation.");
    return;
  }

  setLoading(true);
  try {
    // ✅ CORRIGEZ L'URL : utilisez votre backend Render
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://projet-ml-uxvm.onrender.com';
    
    const res = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,        // ✅ Envoyer email au lieu de username
        password: formData.password,
        firstName: formData.firstName, // ✅ Ajouter firstName
        lastName: formData.lastName,   // ✅ Ajouter lastName
        confirmPassword: formData.confirmPassword, // ✅ Ajouter confirmPassword
        acceptTerms: formData.acceptTerms          // ✅ Ajouter acceptTerms
      }),
    });

    const data = await res.json();

    // ✅ Vérifiez data.success au lieu de res.ok
    if (data.success) {
      // ✅ On garde le vrai nom + email en local pour le dashboard
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      localStorage.setItem("fraud_user_name", fullName);
      localStorage.setItem("fraud_user_email", formData.email);

      setMessageType("success");
      setMessage(data.message || "Inscription réussie !");

      // 🔁 Redirection vers la page de connexion
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } else {
      setMessageType("error");
      setMessage(data.error || "Erreur lors de l'inscription."); // ✅ Utiliser data.error
    }
  } catch (err) {
    console.error(err);
    setMessageType("error");
    setMessage("Erreur de connexion au serveur.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Rejoignez FraudDetect AI
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Créez votre compte pour accéder à notre solution de détection de
            fraude bancaire par IA
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Prénom *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email professionnel *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                placeholder="votre@entreprise.com"
              />
            </div>

            {/* Mot de passe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mot de passe *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  placeholder="••••••••"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Minimum 8 caractères avec chiffres et lettres
                </p>
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirmer le mot de passe *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Checkbox Conditions */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                required
                className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                J'accepte les{" "}
                <Link
                  href="#"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  conditions d'utilisation
                </Link>{" "}
                et la{" "}
                <Link
                  href="#"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  politique de confidentialité
                </Link>{" "}
                *
              </label>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg cursor-pointer font-semibold text-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-200 shadow-lg disabled:opacity-60"
            >
              {loading ? "Création du compte..." : "Créer mon compte"}
            </button>

            {/* Message retour API */}
            {message && (
              <p
                className={`text-center text-sm mt-2 ${
                  messageType === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}

            {/* Lien de connexion */}
            <div className="text-center mt-4">
              <p className="text-gray-600">
                Déjà un compte ?{" "}
                <Link
                  href="/login"
                  className="text-indigo-600 hover:text-indigo-500 font-semibold"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
