// frontend/src/vite-env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Add declarations for your environment variables here
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // If you add any other VITE_ variables later, list them here too!
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
