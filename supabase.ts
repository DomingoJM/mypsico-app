import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ====================================================================================
// == ¡ACCIÓN REQUERIDA! ==
//
// Reemplaza los siguientes valores con tus propias claves de Supabase.
// Puedes encontrarlas en tu panel de Supabase en "Project Settings" > "API".
//
// NO subas este archivo a un repositorio PÚBLICO de GitHub con tus claves reales.
// Para despliegues en producción, es más seguro usar variables de entorno.
// ====================================================================================
const SUPABASE_URL = 'https://shoimroccvcebvedepqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNob2ltcm9jY3ZjZWJ2ZWRlcHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwOTU0MzYsImV4cCI6MjA3ODY3MTQzNn0.gT7fOad0OYdv80KAou2vDmFDMpRl_wystVvzhOc9xF4';


// Export a null client if credentials are not set to prevent crashing.
// The main App component will detect this and show a configuration message.
let supabase: SupabaseClient<any> | null = null;

// A simple check to ensure the variables are not empty placeholders.
const isPlaceholderUrl = SUPABASE_URL.includes('YOUR_SUPABASE_URL');
const isPlaceholderKey = SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY');

if (SUPABASE_URL && SUPABASE_ANON_KEY && !isPlaceholderUrl && !isPlaceholderKey) {
    supabase = createClient<any>(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    // This warning will appear in the developer console if keys are not replaced.
    console.warn("Las claves de Supabase no han sido configuradas correctamente en el archivo `supabase.ts`. La aplicación no se conectará a la base de datos.");
}


export { supabase };
