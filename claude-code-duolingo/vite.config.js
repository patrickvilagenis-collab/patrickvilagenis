import { defineConfig } from 'vite'

// base relativa para que funcione en GitHub Pages bajo /Claude-Code-Duolingo/
export default defineConfig({
  base: './',
  build: { outDir: 'dist' },
})
