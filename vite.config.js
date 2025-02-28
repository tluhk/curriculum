import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/curriculum/', // Set the base to match your repository name
  build: {
    assetsDir: 'assets', // Ensure assets are placed in the assets directory
    outDir: 'dist', // Output directory
    emptyOutDir: true, // Clean the output directory before building
    sourcemap: false, // Disable sourcemaps for production
  }
})
