import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from "dotenv"

dotenv.config()

// https://vite.dev/config/
export default defineConfig({
  define: {
    "process.env": {
      VITE_GITHUB_UPLOADER_URL: JSON.stringify(process.env.VITE_GITHUB_UPLOADER_URL)
    }
  },
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
