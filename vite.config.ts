import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Expone las variables de entorno de Vercel (que se leen durante el build)
    // a la aplicación del lado del cliente bajo el objeto process.env.
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
    'process.env.VITE_API_KEY': JSON.stringify(process.env.VITE_API_KEY),
    'process.env.VITE_WHATSAPP_LINK': JSON.stringify(process.env.VITE_WHATSAPP_LINK),
    'process.env.VITE_CALENDLY_LINK': JSON.stringify(process.env.VITE_CALENDLY_LINK),
  }
})
