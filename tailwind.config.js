/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f9f5',
          100: '#e1f2e7',
          200: '#c5e5d1',
          300: '#99d0b0',
          400: '#65b488',
          500: '#40976b',
          600: '#2f7a55',
          700: '#276246',
          800: '#224e39',
          900: '#1d4131',
          950: '#0f241c',
        },
        earth: {
          50: '#faf7f2',
          100: '#f2ebe0',
          200: '#e5d5c0',
          300: '#d4ba9a',
          400: '#c29b72',
          500: '#b48356',
          600: '#a36d4a',
          700: '#87563e',
          800: '#704838',
          900: '#5d3d30',
        }
      }
    },
  },
  plugins: [],
}
