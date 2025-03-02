import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
// Import postcss-nesting correctly
import postcssNesting from 'postcss-nesting'
import tailwindcss from 'tailwindcss'

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        postcssNesting(),  // Add this BEFORE Tailwind
        tailwindcss(),
        // other plugins...
      ],
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})