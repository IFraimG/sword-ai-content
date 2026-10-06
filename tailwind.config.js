/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sword: {
          bg: '#0B0F17',
          surface: '#121824',
          card: '#182133',
          border: '#222F46',
          text: '#F1F5F9',
          muted: '#94A3B8',
          accent: '#00F0FF',
          accentGlow: 'rgba(0, 240, 255, 0.15)',
        },
        tiktok: {
          cyan: '#00F2FE',
          pink: '#FE2C55',
          dark: '#010101',
          card: '#161823',
        },
        insta: {
          purple: '#833AB4',
          pink: '#FD1D1D',
          orange: '#FCB045',
          card: '#1A1222',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.2), 0 0 10px rgba(0, 240, 255, 0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(0, 240, 255, 0.6), 0 0 25px rgba(0, 240, 255, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}
