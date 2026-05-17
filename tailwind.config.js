/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Tema oscuro principal
        dark: {
          DEFAULT: "#121212",
          100: "#1E1E1E",
          200: "#2A2A2A",
          300: "#3A3A3A",
          400: "#4A4A4A",
        },
        // Color primario dorado (tu color principal)
        primary: {
          DEFAULT: "#4338CA", 
          light: "#6366F1",
          dark: "#312E81",
        },
        // Color dorado secundario
        gold: {
          DEFAULT: "#4D09E0",
          light: "#7B3FF5",
          dark: "#3A07A8",
          50: "#FBF5E0",
          100: "#F5E8B5",
          200: "#EDDA87",
          300: "#E4CC59",
          400: "#DCC13B",
          500: "#4D09E0",
          600: "#C49B2D",
          700: "#B08623",
          800: "#9C711A",
          900: "#7A5610",
        },
        // Rojo de alerta
        alert: {
          DEFAULT: "#FF3B30",
          light: "#FF6B63",
          dark: "#CC2F26",
        },
        // Grises para textos
        muted: {
          DEFAULT: "#9CA3AF",
          light: "#D1D5DB",
          dark: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
