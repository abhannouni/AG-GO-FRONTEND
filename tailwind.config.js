/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand — deep forest green (inspired by Afrika Go logo background)
        forest: {
          50: '#f0f9f3',
          100: '#d8f0e2',
          200: '#b3e1c6',
          300: '#7fc9a1',
          400: '#47ab73',
          500: '#278d55',
          600: '#1a7043',
          700: '#155a37',
          800: '#11472d',
          900: '#0a2e1c',
          950: '#061a0f',
        },
        // Secondary brand — warm gold (inspired by metallic logo lettering)
        gold: {
          50: '#fdf8ec',
          100: '#faefd2',
          200: '#f4dca0',
          300: '#ecc364',
          400: '#e5aa30',
          500: '#c9911a',
          600: '#a87314',
          700: '#855812',
          800: '#6e4514',
          900: '#5c3b14',
          950: '#341d08',
        },
        // Accent — Moroccan flag crimson
        crimson: {
          DEFAULT: '#C1272D',
          light: '#e05560',
          dark: '#921e22',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1400px',
        },
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}