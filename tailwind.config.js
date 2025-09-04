/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // preserve existing lime classes used across the app
        lime: {
          400: '#a3e635',
        },
        // brand palette per redesign
        brand: {
          lime: '#84cc16',
          limeDark: '#65a30d',
          navy: '#0b1220',
          charcoal: '#0b0f12',
          slate: '#111827',
          paper: '#f8fafc',
        },
      },
      boxShadow: {
        soft: '0 8px 24px rgba(0,0,0,0.08)',
        lift: '0 10px 30px rgba(0,0,0,0.15)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: [],
}
