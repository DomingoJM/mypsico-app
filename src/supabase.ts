// src/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Usar import.meta.env para Vite (variables de entorno en el lado del cliente)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar que las variables estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.');
}

// Crear y exportar la instancia de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);