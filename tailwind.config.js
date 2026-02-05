/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: 'var(--color-secondary, #0ea5e9)',
          600: 'var(--color-primary, #0284c7)',
          700: '#0369a1',
        },
        accent: {
          DEFAULT: 'var(--color-accent, #06b6d4)',
        },
      },
    },
  },
  plugins: [],
}
