/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",        // tous les fichiers dans app
    "./components/**/*.{js,ts,jsx,tsx}", // tous les fichiers dans components
    "./pages/**/*.{js,ts,jsx,tsx}"       // si tu as un dossier pages
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
