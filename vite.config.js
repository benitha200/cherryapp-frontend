import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import VitePluginChecker from 'vite-plugin-checker'

export default defineConfig({
  plugins: [
    react(),
    // VitePluginChecker({
    //   typescript: true,
    // }),
  ],
})