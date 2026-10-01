import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// El proxy manda todo lo que empiece con /api al backend de Spring Boot.
// Asi en el codigo usamos rutas como "/api/vuelos" sin escribir el puerto.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
