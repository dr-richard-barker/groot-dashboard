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
        cose: {
          bg: '#0f141b',
          card: '#161d27',
          line: '#232c39',
          muted: '#9aa6b6',
          blue: '#3B6EA5',
          blueLight: '#6ea3d8',
          teal: '#3FB6A8',
          tealLight: '#54c9ba',
          amber: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}
