/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        artisan: {
          dark: '#0f172a',      // Slate 900
          card: '#1e293b',      // Slate 800
          border: '#334155',    // Slate 700
          emerald: '#10b981',   // Emerald 500 (Available Cash & Profit)
          terracotta: '#f97316',// Amber 500 / Terracotta (Work Expenses)
          rose: '#f43f5e',      // Rose 500 (Household & Debt)
          amber: '#eab308',     // Yellow 500 (Uncollected Cash)
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
