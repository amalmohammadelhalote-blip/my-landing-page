/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#020b08',
        'sidebar-dark': '#081e15',
        'content-dark': '#04120a',
        'card-dark': '#08231b',
        'accent-green': '#22c55e',
        'accent-yellow': '#facc15',
        'text-gray': '#94a3b8',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(34, 197, 94, 0.18)',
      },
      borderRadius: {
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [],
}
