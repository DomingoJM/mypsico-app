import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Elimina completamente la sección 'define'
  // Vite maneja las variables automáticamente con import.meta.env
})