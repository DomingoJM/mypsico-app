// src/types.d.ts
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_WHATSAPP_LINK: string;
  readonly VITE_CALENDLY_LINK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}