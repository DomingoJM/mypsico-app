import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ====================================================================================
// == CONFIGURACIÓN SEGURA PARA PRODUCCIÓN ==
//
// Esta versión del archivo está lista para ser subida a GitHub.
// Ya NO contiene tus claves directamente. En su lugar, las leerá de
// "variables de entorno" que configuraremos más tarde en Vercel.
//
// No necesitas hacer ningún cambio aquí.
// ====================================================================================
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;


// Export a null client if credentials are not set to prevent crashing.
// The main App component will detect this and show a configuration message.
let supabase: SupabaseClient<any> | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient<any>(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    // Este aviso aparecerá en la consola si las claves no están configuradas en el servidor.
    console.warn("Las variables de entorno de Supabase (SUPABASE_URL, SUPABASE_ANON_KEY) no están configuradas. La aplicación no se conectará a la base de datos.");
}


export { supabase };