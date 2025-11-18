import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ====================================================================================
// ============================= ACCIÓN REQUERIDA ====================================
//
// Para que la aplicación funcione, debes configurar las siguientes variables de
// entorno en tu plataforma de despliegue (ej. Vercel, Netlify):
//
// 1. VITE_SUPABASE_URL: La URL de tu proyecto de Supabase.
// 2. VITE_SUPABASE_ANON_KEY: La clave anónima (pública) de tu proyecto.
// 3. VITE_API_KEY: Tu clave de API para el servicio de Gemini.
//
// Hardcodear claves es inseguro y causa problemas en el despliegue.
// ====================================================================================
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;


// --- No modifiques el código debajo de esta línea ---

// Se crea el cliente de Supabase solo si las variables de entorno están presentes.
// App.tsx mostrará una pantalla de error amigable si no están configuradas.
const supabase: SupabaseClient | null = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export { supabase };
