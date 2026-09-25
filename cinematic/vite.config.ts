import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build`        -> dist/ (multi-file, for hosting)
// `npm run build:single` -> dist-single/index.html (one self-contained file; the video still streams from its URL)
export default defineConfig(({ mode }) => {
  const single = mode === 'single'
  return {
    plugins: [react(), tailwindcss(), ...(single ? [viteSingleFile()] : [])],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    build: { outDir: single ? 'dist-single' : 'dist' },
  }
})
