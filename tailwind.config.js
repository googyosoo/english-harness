/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#F8F6F0',
          200: '#F3EFE6',
          300: '#E9E2D2',
        },
        honey: {
          50: '#FEF9EE',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        slateText: {
          title: '#1E293B',
          body: '#334155',
          muted: '#64748B',
          subtle: '#94A3B8'
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
        'warm-md': '0 4px 6px -1px rgba(180, 83, 9, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        'warm-lg': '0 10px 15px -3px rgba(180, 83, 9, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
