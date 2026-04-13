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
        // Color primario dorado
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E8CC6E",
          dark: "#B8941F",
          50: "#FBF5E0",
          100: "#F5E8B5",
          200: "#EDDA87",
          300: "#E4CC59",
          400: "#DCC13B",
          500: "#D4AF37",
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
