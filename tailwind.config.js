/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "!./src/node_modules/**" 
  ],
  darkMode: ["class"],
  plugins: [
    require('tailwindcss-flip'),
    require('tailwind-scrollbar'),
  ],
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 }
        },
        "zoom-in": {
          "0%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "zoom-in": "zoom-in 0.2s ease-out"
      },
      fontFamily: {
        'assistant': ['Assistant', 'sans-serif'],
        'heebo': ['Heebo', 'sans-serif'],
        'content': ['Varela Round', 'Assistant', 'sans-serif'],
      },
    }
  },
  variants: {
    scrollbar: ['rounded']
  }
}