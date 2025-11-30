/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#4A9B8E',
        'brand-secondary': '#2C5F7B',
        'brand-accent': '#E63946',
        'brand-light': '#F1FAEE',
        'brand-dark': '#1D3557',
      },
    },
  },
  plugins: [],
}