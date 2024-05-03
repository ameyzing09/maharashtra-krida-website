/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-blue': {
          500: '#003366'  // A dark blue shade
        },
        'vivid-orange': {
          500: '#ff6600'  // A bright, vivid orange
        }
      }
    }
  },
  plugins: [],
}