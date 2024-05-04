/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lime': {
          400: '#a3e635' 
        },
        'vivid-orange': {
          500: '#ff6600'  // A bright, vivid orange
        }
      }
    }
  },
  plugins: [],
}