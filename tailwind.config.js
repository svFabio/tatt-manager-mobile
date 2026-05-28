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
      colors: require('./src/theme/palette'),
      fontFamily: {
        sans: ["Outfit_400Regular", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
